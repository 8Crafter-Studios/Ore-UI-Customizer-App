/**
 * src/utils/InstallationManager.ts
 * @module
 * @description A file containing utility functions for managing the isntallations of 8Crafter's Ore UI Customizer.
 * @supports Preload, Renderer
 */
import path, { type resolve } from "node:path";
import { copyFileSync, createWriteStream, Dirent, existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, writeFileSync } from "node:fs";
import semver, { type SemVer } from "semver";
import { API_SOURCE_WEBSITE_URL, APP_DATA_FOLDER_PATH, CACHE_FOLDER_PATH, CACHE_FOLDER_SUBPATHS, OLD_APP_DATA_FOLDER_PATH } from "./URLs";
import "./zip.js";
import { ConfigManager } from "./ConfigManager.ts";
import type { EncodedPluginData, EncodedThemeData, OreUICustomizerConfig_Settings, OreUICustomizerSettings } from "ore-ui-customizer-types";
import { applyMods, format_version } from "./ore-ui-customizer-api.ts";
import { addFolderContentsReversed, compareZips, compareZipsFull } from "./folderContentsUtils.ts";
import { OreUICustomizerPlugin, PluginManager, type MissingPluginInfo } from "./PluginManager.ts";
import type { MessageBoxReturnValue, OpenDialogReturnValue } from "electron";
import { createHash, getHashes, hash } from "node:crypto";
import { rm, rmdir, writeFile } from "node:fs/promises";
import { downloadFileWithProgress } from "./connectionUtils.ts";
import { formatFileSizeBinary } from "./fileSizeUtils.ts";
import { exec } from "node:child_process";
import { runCommmand } from "./miscUtils.ts";
import * as ini from "ini";
import type { BinaryXMLDocument } from "binary-xml";
import { OreUICustomizerTheme, ThemeManager } from "./ThemeManager.ts";
const BinaryXML = require("binary-xml") as typeof import("binary-xml");
const { dialog } = require("@electron/remote") as typeof import("@electron/remote");

/**
 * Copies a folder.
 *
 * @param {string} folder The folder to copy.
 * @param {string} destination The destination folder.
 */
export function copyFolder(folder: string, destination: string): void {
    try {
        mkdirSync(destination, { recursive: true });
    } catch (e) {}
    const folderContents = readdirSync(folder, { withFileTypes: true });
    for (const item of folderContents) {
        if (item.isFile()) {
            copyFileSync(path.join(folder, item.name), path.join(destination, item.name));
        } else if (item.isDirectory()) {
            try {
                mkdirSync(path.join(destination, item.name), { recursive: true });
            } catch (e: any) {
                console.error(e, e?.stack);
            }
            copyFolder(path.join(folder, item.name), path.join(destination, item.name));
        }
    }
}

export type InstallationStatus =
    | "Installed"
    | "Partially Failed Installation"
    | "Not Installed"
    | "Installing"
    | "Uninstalling"
    | "Corrupted (By Minecraft Update) (Backup Available)"
    | "Corrupted (By Minecraft Update)"
    | "Missing (Backup Available)"
    | "Unknown (Backup Available)"
    | "Unknown";

export interface VersionFolderVersionDetailsRaw {
    /**
     * The Minecraft version of the version folder.
     */
    version: [major: number, minor: number, patch: number, revision: number];
    /**
     * The release channel of the version folder.
     */
    channel: "Unknown" | "Release" | "Preview" | "Beta";
    /**
     * Whether the version folder is a development version.
     */
    dev: boolean;
    /**
     * Whether the version folder is a GDK version.
     */
    isGDK: boolean;
}

export interface VersionFolderVersionDetails extends VersionFolderVersionDetailsRaw {
    /**
     * The raw Minecraft version of the version folder.
     *
     * ex. For Windows builds, `1.21.130.4` would be `1.21.13004.0`.
     */
    rawVersion: string;
    /**
     * The ID release channel of the version folder.
     *
     * - `0` = Unknown
     * - `1` = Release
     * - `2` = Preview
     * - `3` = Beta
     *
     * @readonly
     */
    get channelID(): 0 | 1 | 2 | 3;
    toJSON(): Pick<this, PossibleRawVersionFolderDetailsKeys & keyof this>;
}

interface VersionFolderVersionDetailsExtendedDetails {
    /**
     * The installation status of the version folder.
     */
    installationStatus: InstallationStatus;
    // vanillaInstall: boolean; // TODO
}

type PossibleRawVersionFolderDetailsKeys = keyof VersionFolderVersionDetailsRaw | keyof VersionFolderVersionDetailsExtendedDetails;

export interface VersionFolderVersionDetailsExtended extends VersionFolderVersionDetails, VersionFolderVersionDetailsExtendedDetails {}

export interface VersionFolderVersionDetailsExtendedRaw extends VersionFolderVersionDetailsRaw, VersionFolderVersionDetailsExtendedDetails {}

export interface FailedPluginsJSON {
    [filename: string]: string[];
}

export class InstallationManager {
    public static getDataFolderSubpathOfVersionFolder(versionFolderPath: string): "data" | "assets" | "assets/assets" | undefined {
        if (existsSync(path.join(versionFolderPath, "data"))) return "data";
        if (existsSync(path.join(versionFolderPath, "assets/assets"))) return "assets/assets";
        if (existsSync(path.join(versionFolderPath, "assets"))) return "assets";
        return undefined;
    }
    public static getInstallationStatusOfVersionFolder(versionFolderPath: string): InstallationStatus {
        let backupCheckPrefix: keyof OmitNeverValueKeys<{
            [status in InstallationStatus as status extends `${infer prefix} (Backup Available)` ? prefix : never]: string;
        }> = "Unknown";
        // Windows
        if (existsSync(path.join(versionFolderPath, "data/gui"))) {
            if (existsSync(path.join(versionFolderPath, "data/gui/dist/hbui/oreUICustomizer8CrafterConfig.js"))) {
                if (existsSync(path.join(versionFolderPath, "data/gui/dist/hbui/INSTALLING_ORE_UI_CUSTOMIZER"))) {
                    return "Installing";
                } else if (existsSync(path.join(versionFolderPath, "data/gui/dist/hbui/UNINSTALLING_ORE_UI_CUSTOMIZER"))) {
                    return "Uninstalling";
                } else if (
                    existsSync(path.join(versionFolderPath, "data/gui/dist/hbui/OUIC_INSTALLATION_TARGETED_MC_VERSION")) &&
                    readFileSync(path.join(versionFolderPath, "data/gui/dist/hbui/OUIC_INSTALLATION_TARGETED_MC_VERSION"), "utf8").trim() !==
                        ((v) => v && VersionFolder.prototype.getDisplayVersion.apply(v))(
                            InstallationManager.getVersionFromVersionFolder(versionFolderPath, false)
                        )
                ) {
                    backupCheckPrefix = "Corrupted (By Minecraft Update)";
                } else if (existsSync(path.join(versionFolderPath, "data/gui/dist/hbui/failed_plugins.json"))) {
                    try {
                        const failedPlugins: FailedPluginsJSON = JSON.parse(
                            readFileSync(path.join(versionFolderPath, "data/gui/dist/hbui/failed_plugins.json"), "utf-8")
                        );
                        if (Object.keys(failedPlugins).length > 0) {
                            return "Partially Failed Installation";
                        } else {
                            return "Installed";
                        }
                    } catch (e: any) {
                        console.error(e, e?.stack);
                        return "Installed";
                    }
                } else {
                    return "Installed";
                }
            } else {
                return "Not Installed";
            }
        }
        // Linux/macOS
        if (existsSync(path.join(versionFolderPath, "assets/assets/gui"))) {
            if (existsSync(path.join(versionFolderPath, "assets/assets/gui/dist/hbui/oreUICustomizer8CrafterConfig.js"))) {
                if (existsSync(path.join(versionFolderPath, "assets/assets/gui/dist/hbui/INSTALLING_ORE_UI_CUSTOMIZER"))) {
                    return "Installing";
                } else if (existsSync(path.join(versionFolderPath, "assets/assets/gui/dist/hbui/UNINSTALLING_ORE_UI_CUSTOMIZER"))) {
                    return "Uninstalling";
                } else if (
                    existsSync(path.join(versionFolderPath, "assets/assets/gui/dist/hbui/OUIC_INSTALLATION_TARGETED_MC_VERSION")) &&
                    readFileSync(path.join(versionFolderPath, "assets/assets/gui/dist/hbui/OUIC_INSTALLATION_TARGETED_MC_VERSION"), "utf8").trim() !==
                        ((v) => v && VersionFolder.prototype.getDisplayVersion.apply(v))(
                            InstallationManager.getVersionFromVersionFolder(versionFolderPath, false)
                        )
                ) {
                    backupCheckPrefix = "Corrupted (By Minecraft Update)";
                } else if (existsSync(path.join(versionFolderPath, "assets/assets/gui/dist/hbui/failed_plugins.json"))) {
                    try {
                        const failedPlugins: FailedPluginsJSON = JSON.parse(
                            readFileSync(path.join(versionFolderPath, "assets/assets/gui/dist/hbui/failed_plugins.json"), "utf8")
                        );
                        if (Object.keys(failedPlugins).length > 0) {
                            return "Partially Failed Installation";
                        } else {
                            return "Installed";
                        }
                    } catch (e: any) {
                        console.error(e, e?.stack);
                        return "Installed";
                    }
                } else {
                    return "Installed";
                }
            } else {
                return "Not Installed";
            }
        }
        if (existsSync(path.join(versionFolderPath, "assets/gui"))) {
            if (existsSync(path.join(versionFolderPath, "assets/gui/dist/hbui/oreUICustomizer8CrafterConfig.js"))) {
                if (existsSync(path.join(versionFolderPath, "assets/gui/dist/hbui/INSTALLING_ORE_UI_CUSTOMIZER"))) {
                    return "Installing";
                } else if (existsSync(path.join(versionFolderPath, "assets/gui/dist/hbui/UNINSTALLING_ORE_UI_CUSTOMIZER"))) {
                    return "Uninstalling";
                } else if (
                    existsSync(path.join(versionFolderPath, "assets/gui/dist/hbui/OUIC_INSTALLATION_TARGETED_MC_VERSION")) &&
                    readFileSync(path.join(versionFolderPath, "assets/gui/dist/hbui/OUIC_INSTALLATION_TARGETED_MC_VERSION"), "utf8").trim() !==
                        ((v) => v && VersionFolder.prototype.getDisplayVersion.apply(v))(
                            InstallationManager.getVersionFromVersionFolder(versionFolderPath, false)
                        )
                ) {
                    backupCheckPrefix = "Corrupted (By Minecraft Update)";
                } else if (existsSync(path.join(versionFolderPath, "assets/gui/dist/hbui/failed_plugins.json"))) {
                    try {
                        const failedPlugins: FailedPluginsJSON = JSON.parse(
                            readFileSync(path.join(versionFolderPath, "assets/gui/dist/hbui/failed_plugins.json"), "utf8")
                        );
                        if (Object.keys(failedPlugins).length > 0) {
                            return "Partially Failed Installation";
                        } else {
                            return "Installed";
                        }
                    } catch (e: any) {
                        console.error(e, e?.stack);
                        return "Installed";
                    }
                } else {
                    return "Installed";
                }
            } else {
                return "Not Installed";
            }
        }
        const dataFolderSubpath: "data" | "assets" | "assets/assets" | undefined = this.getDataFolderSubpathOfVersionFolder(versionFolderPath);
        if (!dataFolderSubpath) {
            return "Unknown (Backup Available)"; // TODO: This is supposed to say "No Version Data".
        }
        if (backupCheckPrefix === "Unknown") backupCheckPrefix = "Missing";
        const version: VersionFolderVersionDetails | undefined = InstallationManager.getVersionFromVersionFolder(versionFolderPath);
        const hashes: string[] = getHashes().map((v: string): string => v.toLowerCase());
        if (version) {
            if (hashes.includes("md4")) {
                /**
                 * The path to the current md4 hashed backup folder location.
                 */
                const backupFolderPath: string = path.join(
                    APP_DATA_FOLDER_PATH,
                    "backups",
                    hash(
                        "md4",
                        (
                            path.posix.resolve(versionFolderPath).replaceAll("\\", "/") +
                            "_" +
                            version.version.join(".") +
                            "." +
                            version.channelID +
                            "." +
                            +version.dev
                        ).toLowerCase()
                    ),
                    "data",
                    "gui_vanilla_backup"
                );
                if (existsSync(backupFolderPath)) {
                    return `${backupCheckPrefix} (Backup Available)`;
                }
            }
            if (hashes.includes("md5")) {
                /**
                 * The path to the current md5 hashed backup folder location.
                 */
                const backupFolderPath: string = path.join(
                    APP_DATA_FOLDER_PATH,
                    "backups",
                    hash(
                        "md5",
                        (
                            path.posix.resolve(versionFolderPath).replaceAll("\\", "/") +
                            "_" +
                            version.version.join(".") +
                            "." +
                            version.channelID +
                            "." +
                            +version.dev
                        ).toLowerCase()
                    ),
                    "data",
                    "gui_vanilla_backup"
                );
                if (existsSync(backupFolderPath)) {
                    return `${backupCheckPrefix} (Backup Available)`;
                }
            }
            /**
             * The path to the current versioned backup folder location.
             */
            const backupFolderPath_versioned: string = path.join(
                APP_DATA_FOLDER_PATH,
                "backups",
                path.basename(versionFolderPath) + "_" + version.version.join(".") + "." + version.channelID + "." + +version.dev,
                "data",
                "gui_vanilla_backup"
            );
            if (existsSync(backupFolderPath_versioned)) {
                return `${backupCheckPrefix} (Backup Available)`;
            }
            /**
             * The path to the current version-only backup folder location.
             */
            const backupFolderPath_version_only: string = path.join(
                APP_DATA_FOLDER_PATH,
                "backups",
                "__VERSION_" + version.version.join(".") + "." + version.channelID + "." + +version.dev,
                "data",
                "gui_vanilla_backup"
            );
            if (existsSync(backupFolderPath_version_only)) {
                return `${backupCheckPrefix} (Backup Available)`;
            }
        }
        /**
         * The path to the current backup folder location.
         */
        const backupFolderPath: string = path.join(APP_DATA_FOLDER_PATH, "backups", path.basename(versionFolderPath), dataFolderSubpath, "gui_vanilla_backup");
        if (existsSync(backupFolderPath)) {
            return `${backupCheckPrefix} (Backup Available)`;
        }
        /**
         * The path to the old backup folder location.
         */
        const oldBackupFolderPath: string = path.join(OLD_APP_DATA_FOLDER_PATH, path.basename(versionFolderPath), dataFolderSubpath, "gui_vanilla_backup");
        if (existsSync(oldBackupFolderPath)) {
            return `${backupCheckPrefix} (Backup Available)`;
        }
        /**
         * The path to the first alternative backup folder location.
         */
        const altBackupFolderPathA: string = path.join(versionFolderPath, dataFolderSubpath, "gui_vanilla_backup");
        if (existsSync(altBackupFolderPathA)) {
            return `${backupCheckPrefix} (Backup Available)`;
        }
        /**
         * The path to the second alternative backup folder location.
         */
        const altBackupFolderPathB: string = path.join(versionFolderPath, dataFolderSubpath, "gui_vanilla");
        if (existsSync(altBackupFolderPathB)) {
            return `${backupCheckPrefix} (Backup Available)`;
        }
        if (backupCheckPrefix === "Missing") backupCheckPrefix = "Unknown";
        // Other
        return backupCheckPrefix;
    }
    public static getVersionFolderPaths(): string[] {
        const versionFolders: string[] = [];
        for (const versionFolderSearchLocation of config.parsedVersionFolderSearchLocations) {
            if (existsSync(versionFolderSearchLocation)) {
                versionFolders.push(
                    ...readdirSync(versionFolderSearchLocation).map((versionFolder: string): string => path.join(versionFolderSearchLocation, versionFolder))
                );
            }
        }
        return versionFolders;
    }
    public static getVersionFolders(sortmethod: "VersionAscending" | "VersionDescending" | "None" = "None"): VersionFolder[] {
        const versionFolders: VersionFolder[] = InstallationManager.getVersionFolderPaths()
            .filter((versionFolderPath: string): boolean => InstallationManager.getVersionFromVersionFolder(versionFolderPath) !== undefined)
            .map((versionFolderPath: string): VersionFolder => new VersionFolder(versionFolderPath));
        if (sortmethod === "VersionAscending") {
            versionFolders.sort((a: VersionFolder, b: VersionFolder): number => {
                return semver.compareBuild(
                    `${a.version[0]}.${a.version[1]}.${a.version[2]}-${a.version[3]}`,
                    `${b.version[0]}.${b.version[1]}.${b.version[2]}-${b.version[3]}`
                );
            });
        } else if (sortmethod === "VersionDescending") {
            versionFolders.sort((a: VersionFolder, b: VersionFolder): number => {
                return semver.compareBuild(
                    `${b.version[0]}.${b.version[1]}.${b.version[2]}-${b.version[3]}`,
                    `${a.version[0]}.${a.version[1]}.${a.version[2]}-${a.version[3]}`
                );
            });
        }
        return versionFolders;
    }
    public static getVersionFromVersionFolder(
        versionFolderPath: string,
        includeInstallationStatus?: true | undefined
    ): VersionFolderVersionDetailsExtended | undefined;
    public static getVersionFromVersionFolder(versionFolderPath: string, includeInstallationStatus: false): VersionFolderVersionDetails | undefined;
    public static getVersionFromVersionFolder(
        versionFolderPath: string,
        includeInstallationStatus: boolean = false
    ): VersionFolderVersionDetails | Omit<VersionFolderVersionDetails, "installationStatus"> | undefined {
        // FIXME: This detects newer dev preview/beta builds as Release rather than Preview or Beta.
        const details: Partial<VersionFolderVersionDetailsExtended> & VersionFolderVersionDetails = {
            version: [0, 0, 0, 0],
            channel: "Unknown",
            dev: false,
            installationStatus: "Unknown",
            isGDK: false,
            rawVersion: "",
            get channelID(): 0 | 1 | 2 | 3 {
                return (
                    {
                        Unknown: 0,
                        Release: 1,
                        Preview: 2,
                        Beta: 3,
                    } as const
                )[this.channel];
            },
            toJSON(): Pick<VersionFolderVersionDetailsExtended, PossibleRawVersionFolderDetailsKeys> {
                const result = {
                    version: this.version,
                    channel: this.channel,
                    dev: this.dev,
                    isGDK: this.isGDK,
                    installationStatus: this.installationStatus,
                };
                return Object.fromEntries(Object.entries(result).filter(([_key, value]) => value !== undefined)) as typeof result;
            },
        } satisfies VersionFolderVersionDetailsExtended;
        // Windows
        Windows: {
            // TODO: Make this use XML parsing instead.
            const AppxManifestXMLPath: string = path.join(versionFolderPath, "AppxManifest.xml");
            const MicrosoftGameConfigPath: string = path.join(versionFolderPath, "MicrosoftGame.Config");
            if (!(existsSync(AppxManifestXMLPath) || existsSync(MicrosoftGameConfigPath))) break Windows;
            if (existsSync(MicrosoftGameConfigPath)) {
                details.isGDK = true;
            }
            const AppxManifestXMLContent: string =
                existsSync(MicrosoftGameConfigPath) ? readFileSync(MicrosoftGameConfigPath, "utf-8") : readFileSync(AppxManifestXMLPath, "utf-8");
            const AppxManifestXMLVersion: `${number}.${number}.${number}.${number}` | undefined = AppxManifestXMLContent.match(
                /<Identity\s+?Name="(?:Microsoft\.MinecraftUWP|Microsoft\.MinecraftWindowsBeta|Microsoft\.Minecraft[^"]*)"\s+?Publisher="[^"]*"\s+?Version="([\d.]+)"/i
            )?.[1] as `${number}.${number}.${number}.${number}` | undefined;
            const [AppxManifestPhoneProductId, AppxManifestPhonePublisherId]: [
                AppxManifestPhoneProductId: string | undefined,
                AppxManifestPhonePublisherId: string | undefined,
            ] =
                (AppxManifestXMLContent.match(/<mp:PhoneIdentity PhoneProductId="([a-f0-9-]+)" PhonePublisherId="([a-f0-9-]+)" \/>/)?.slice(1, 3) as [
                    AppxManifestPhoneProductId: string | undefined,
                    AppxManifestPhonePublisherId: string | undefined,
                ]) ?? [];
            if (!AppxManifestXMLVersion) {
            } else {
                const AppxManifestXMLEdition: "microsoft.minecraftuwp" | "microsoft.minecraftwindowsbeta" | undefined = AppxManifestXMLContent.match(
                    /<Identity\s+?Name="(Microsoft\.MinecraftUWP|Microsoft\.MinecraftWindowsBeta)"\s+?Publisher="[^"]*"\s+?Version="(?:[\d.]+)"/i
                )?.[1]?.toLowerCase() as "microsoft.minecraftuwp" | "microsoft.minecraftwindowsbeta" | undefined;
                const versionSegments = AppxManifestXMLVersion.split(".") as [`${number}`, `${number}`, `${number}`, `${number}`];
                let version: `${number}.${number}.${number}.${number}`;
                if (versionSegments[0] === "0") {
                    if (versionSegments[1].length < 3) {
                        version = `0.${Number(versionSegments[1])}.0.${Number(versionSegments[2])}` as const;
                    } else if (versionSegments[1].length < 4) {
                        version = `0.${Number(versionSegments[1]?.slice(0, -1))}.${Number(versionSegments[1]?.slice(-1))}.${Number(
                            versionSegments[2]
                        )}` as const;
                    } else {
                        version = `0.${Number(versionSegments[1]?.slice(0, -2))}.${Number(versionSegments[1]?.slice(-2))}.${Number(
                            versionSegments[2]
                        )}` as const;
                    }
                } else {
                    version = `${Number(versionSegments[0])}.${Number(versionSegments[1])}.${Number(versionSegments[2]?.slice(0, -2))}.${Number(
                        versionSegments[2]?.slice(-2)
                    )}` as const;
                }
                details.channel =
                    AppxManifestXMLEdition === "microsoft.minecraftuwp" ? "Release"
                    : AppxManifestXMLEdition === "microsoft.minecraftwindowsbeta" ? "Preview"
                    : "Unknown";
                details.dev = AppxManifestPhonePublisherId === "00000000-0000-0000-0000-000000000000"; // TODO: Figure out how to check this for GDK builds.
                const threePartVersion: string = version.split(".").slice(0, 3).join(".");
                const versionPartFour: number = Number(version.split(".")[3]);
                if (AppxManifestXMLEdition === "microsoft.minecraftuwp" /* && semver.gt("1.18.30", threePartVersion) */) {
                    switch (true) {
                        case semver.lt("1.17.0", threePartVersion):
                            if (versionPartFour >= 20) details.channel = "Beta";
                            break;
                        case semver.lte("1.14.0", threePartVersion):
                            if (versionPartFour >= 50) details.channel = "Beta";
                            break;
                        case threePartVersion === "1.15.0":
                        case version === "1.14.25.1":
                        case threePartVersion === "1.14.1" && versionPartFour < 5:
                        case threePartVersion === "1.14.0" && versionPartFour < 9:
                        case threePartVersion === "1.13.0" && versionPartFour < 34:
                        case threePartVersion === "1.12.0" && versionPartFour < 28:
                        case threePartVersion === "1.11.0" && versionPartFour < 23:
                        case threePartVersion === "1.10.0" && versionPartFour < 7:
                        case threePartVersion === "1.9.0" && versionPartFour < 15:
                        case threePartVersion === "1.8.0" && versionPartFour < 24:
                        case threePartVersion === "1.7.0" && versionPartFour < 13:
                        case threePartVersion === "1.6.0" && versionPartFour !== 14:
                        case threePartVersion === "1.5.0" && versionPartFour < 14:
                        case threePartVersion === "1.4.0" && versionPartFour < 5:
                        case semver.lt("1.2.13", threePartVersion) && semver.gt("1.4.0", threePartVersion):
                        case threePartVersion === "1.2.5" && versionPartFour < 52:
                        case threePartVersion === "1.2.3" && versionPartFour < 6:
                        case threePartVersion === "1.2.0":
                            details.channel = "Beta";
                            break;
                    }
                }
                if (includeInstallationStatus) details.installationStatus = InstallationManager.getInstallationStatusOfVersionFolder(versionFolderPath);
                else delete details.installationStatus;
                details.rawVersion = AppxManifestXMLVersion;
                details.version = (version.split(".") as [`${number}`, `${number}`, `${number}`, `${number}`]).map(Number) as [
                    major: number,
                    minor: number,
                    patch: number,
                    revision: number,
                ];
                return details;
            }
        }
        // Linux/macOS
        AndroidManifestXML: {
            const AndroidManifestXMLPath: string = path.join(versionFolderPath, "AndroidManifest.xml");
            if (!existsSync(AndroidManifestXMLPath)) break AndroidManifestXML;
            try {
                const AndroidManifestXMLData: BinaryXMLDocument = new BinaryXML(readFileSync(AndroidManifestXMLPath)).parse();
                let AndroidManifestXMLVersionName: `${number}.${number}.${number}.${number}` | undefined;
                let AndroidManifestXMLversionNameInvalid: string | undefined;
                AndroidManifestXMLDataVersionNameSearch: for (const attribute of AndroidManifestXMLData.attributes) {
                    if (attribute.nodeName !== "versionName") continue;
                    if (attribute.typedValue.type !== "string") continue;
                    if (!/^\d+\.\d+\.\d+\.\d+$/.test(attribute.typedValue.value)) {
                        AndroidManifestXMLversionNameInvalid = attribute.typedValue.value;
                        break AndroidManifestXMLDataVersionNameSearch;
                    }
                    AndroidManifestXMLVersionName = attribute.typedValue.value as `${number}.${number}.${number}.${number}`;
                    break AndroidManifestXMLDataVersionNameSearch;
                }
                if (AndroidManifestXMLVersionName === undefined && AndroidManifestXMLversionNameInvalid === undefined) break AndroidManifestXML;
                let AndroidManifestXMLEdition: LooseAutocomplete<"minecraft" | "minecraft-preview"> | undefined;
                AndroidManifestXMLDataEditionSearch: for (const childNode of AndroidManifestXMLData.childNodes) {
                    if (childNode.nodeName !== "application") continue;
                    for (const childNode2 of childNode.childNodes) {
                        if (childNode2.nodeName !== "activity") continue;
                        for (const childNode3 of childNode2.childNodes) {
                            if (childNode3.nodeName !== "intent-filter") continue;
                            for (const childNode4 of childNode3.childNodes) {
                                if (childNode4.nodeName !== "data") continue;
                                for (const attribute of childNode4.attributes) {
                                    if (attribute.nodeName !== "scheme") continue;
                                    if (attribute.typedValue.type !== "string") continue;
                                    if (attribute.typedValue.value === "file") continue;
                                    if (attribute.typedValue.value === "content") continue;
                                    AndroidManifestXMLEdition = attribute.typedValue.value;
                                    break AndroidManifestXMLDataEditionSearch;
                                }
                            }
                        }
                    }
                }
                let AndroidManifestXMLEditionPackage: LooseAutocomplete<"com.mojang.minecraftpe" | "com.mojang.minecraftpe.Dev"> | undefined;
                AndroidManifestXMLDataPackageSearch: for (const attribute of AndroidManifestXMLData.attributes) {
                    if (attribute.nodeName !== "package") continue;
                    if (attribute.typedValue.type !== "string") continue;
                    AndroidManifestXMLEditionPackage = attribute.typedValue.value;
                    break AndroidManifestXMLDataPackageSearch;
                }
                details.channel =
                    AndroidManifestXMLEdition === "minecraft" ? "Release"
                    : AndroidManifestXMLEdition === "minecraft-preview" ? "Beta"
                    : "Unknown";
                details.dev = AndroidManifestXMLEditionPackage === "com.mojang.minecraftpe.Dev";
                if (AndroidManifestXMLEditionPackage === undefined) {
                    console.warn("Missing AndroidManifest.xml package ID. Folder:", versionFolderPath, "Data:", AndroidManifestXMLData);
                } else if (!["com.mojang.minecraftpe", "com.mojang.minecraftpe.Dev"].includes(AndroidManifestXMLEditionPackage)) {
                    console.warn(
                        "Unknown AndroidManifest.xml package ID:",
                        AndroidManifestXMLEditionPackage,
                        "Folder:",
                        versionFolderPath,
                        "Data:",
                        AndroidManifestXMLData
                    );
                }
                if (includeInstallationStatus) details.installationStatus = InstallationManager.getInstallationStatusOfVersionFolder(versionFolderPath);
                else delete details.installationStatus;
                if (AndroidManifestXMLVersionName === undefined) {
                    if (AndroidManifestXMLversionNameInvalid === undefined) break AndroidManifestXML;
                    details.rawVersion = AndroidManifestXMLversionNameInvalid;
                    console.error(
                        "Invalid version found in AndroidManifest.xml: ",
                        AndroidManifestXMLversionNameInvalid,
                        "Path:",
                        AndroidManifestXMLPath,
                        "Details:",
                        details
                    );
                    break AndroidManifestXML;
                } else {
                    details.rawVersion = AndroidManifestXMLVersionName;
                    details.version = (AndroidManifestXMLVersionName.split(".") as [`${number}`, `${number}`, `${number}`, `${number}`]).map(Number) as [
                        major: number,
                        minor: number,
                        patch: number,
                        revision: number,
                    ];
                }
            } catch (e) {
                console.error("Error parsing AndroidManifest.xml:", e, "Path:", AndroidManifestXMLPath, "Details:", details);
                break AndroidManifestXML;
            }
            return details;
        }
        // Other
        return undefined;
    }
    public static async compareVersionFolderBackupContents(
        versionFolder1: VersionFolder,
        versionFolder2: VersionFolder,
        mode: "onlyNames" | "namesAndFileSizes" | "full" = "namesAndFileSizes"
    ): Promise<boolean> {
        const backupPath1: string | undefined = versionFolder1.getBackupFolderZipPath();
        if (backupPath1 === undefined) throw new ReferenceError("Backup zip path not found for version folder 1.");
        const backupPath2: string | undefined = versionFolder2.getBackupFolderZipPath();
        if (backupPath2 === undefined) throw new ReferenceError("Backup zip path not found for version folder 2.");
        const zipFs1 = new zip.fs.FS();
        const zipFs2 = new zip.fs.FS();
        await Promise.all([
            zipFs1.importUint8Array(new Uint8Array(require("fs").readFileSync(backupPath1).buffer)),
            zipFs2.importUint8Array(new Uint8Array(require("fs").readFileSync(backupPath2).buffer)),
        ]);
        if (mode === "full") return await compareZipsFull(zipFs1, zipFs2);
        return compareZips(zipFs1, zipFs2, mode);
    }
}

export class VersionFolder implements Omit<VersionFolderVersionDetailsExtended, "toJSON"> {
    /**
     * The path to the version folder.
     *
     * @readonly
     */
    public readonly path: string;
    /**
     * The Minecraft version of the version folder.
     *
     * @readonly
     */
    public readonly version: VersionFolderVersionDetails["version"];
    /**
     * The release channel of the version folder.
     *
     * @readonly
     */
    public readonly channel: VersionFolderVersionDetails["channel"];
    /**
     * Whether the version folder is a development version.
     *
     * @readonly
     */
    public readonly dev: VersionFolderVersionDetails["dev"];
    /**
     * Whether the version folder is a GDK version.
     *
     * @readonly
     */
    public readonly isGDK: VersionFolderVersionDetails["isGDK"];
    /**
     * The raw version of the version folder.
     *
     * @readonly
     */
    public readonly rawVersion: VersionFolderVersionDetails["rawVersion"];
    /**
     * Creates a new VersionFolder instance.
     *
     * @param path The path to the version folder.
     */
    public constructor(path: string) {
        this.path = path;
        ({
            version: this.version,
            channel: this.channel,
            dev: this.dev,
            isGDK: this.isGDK,
            rawVersion: this.rawVersion,
        } = InstallationManager.getVersionFromVersionFolder(path, false)!);
    }
    /**
     * The ID of the release channel of the version folder.
     */
    public get channelID(): 0 | 1 | 2 | 3 {
        return (
            {
                Unknown: 0,
                Release: 1,
                Preview: 2,
                Beta: 3,
            } as const
        )[this.channel];
    }
    /**
     * The installation status of the version folder.
     */
    public get installationStatus(): InstallationStatus {
        return InstallationManager.getInstallationStatusOfVersionFolder(this.path);
    }
    /**
     * The path to the GUI folder.
     *
     * @throws {ReferenceError} If the GUI folder could not be found.
     */
    public get guiFolderPath(): string {
        if (existsSync(path.join(this.path, "data/gui"))) {
            return path.join(this.path, "data/gui");
        }
        if (existsSync(path.join(this.path, "assets/assets/gui"))) {
            return path.join(this.path, "assets/assets/gui");
        }
        if (existsSync(path.join(this.path, "assets/gui"))) {
            return path.join(this.path, "assets/gui");
        }
        throw new ReferenceError("Could not find gui folder.");
    }
    /**
     * Gets the display version of the version folder.
     *
     * @returns The display version of the version folder.
     */
    public getDisplayVersion(this: Pick<VersionFolderVersionDetails, "version" | "channel" | "dev">): string {
        return `v${this.version.join(".")} (${this.channel}${this.dev ? " [Dev]" : ""})`;
    }
    /**
     * Gets the display version of the version folder with colored HTML.
     *
     * @returns The display version of the version folder with colored HTML.
     */
    public getDisplayVersionColoredHTML(this: Pick<VersionFolderVersionDetails, "version" | "channel" | "dev">): string {
        return `<span style="color: #00FF88">v${this.version.join(".")}</span><span style="color: #00FFFF"> (</span><span style="color: ${
            this.channel === "Release" ? "#00FF00"
            : this.channel === "Preview" ? "#FFFF00"
            : this.channel === "Beta" ? "#FF8800"
            : "#FF0000"
        }">${this.channel}</span>${
            this.dev ? `<span style="color: #00FFFF"> [</span><span style="color: #FF0000">Dev</span><span style="color: #00FFFF">]</span>` : ""
        }<span style="color: #00FFFF">)</span>`;
    }
    /**
     * The version of the Ore UI Customizer that is installed on the version folder, or `undefined` if it is not installed.
     */
    public get installedVersion(): string | undefined {
        /**
         * The path to the GUI folder.
         */
        const guiFolderPath: string = this.guiFolderPath;
        if (existsSync(path.join(guiFolderPath, "dist/hbui/oreUICustomizer8CrafterConfig.js"))) {
            return readFileSync(path.join(guiFolderPath, "dist/hbui/oreUICustomizer8CrafterConfig.js"), "utf8").match(
                /(?<=^|[\n])const oreUICustomizerVersion = "([^"]*)";(?=[\s\n]*$)/
            )?.[1] as string;
        }
        return undefined;
    }
    /**
     * Gets whether or not the version of the Ore UI Customizer that is installed on the version folder is outdated.
     *
     * @returns `true` if the version of the Ore UI Customizer that is installed on the version folder is outdated, `false` otherwise.
     */
    public getIsUpdateAvailable(): boolean {
        const v1: SemVer | null = semver.parse(this.installedVersion!);
        const v2: SemVer | null = semver.parse(format_version);
        if (v1 !== null && v2 !== null && v1.version === v2.version && !v1.build.length !== !v2.build.length) {
            if (v1.build.length === 0) return false;
            return true;
        }
        return semver.compareBuild(this.installedVersion!, format_version) === -1;
    }
    /**
     * Gets the data folder subpath of the version folder.
     *
     * @returns The data folder subpath of the version folder.
     */
    public getDataFolderSubpath(): ReturnType<(typeof InstallationManager)["getDataFolderSubpathOfVersionFolder"]> {
        return InstallationManager.getDataFolderSubpathOfVersionFolder(this.path);
    }
    /**
     * Gets the path to the backup folder.
     *
     * @returns The path to the backup folder, or `undefined` if it does not exist.
     */
    public getBackupFolderPath(): string | undefined {
        const hashes = getHashes().map((v) => v.toLowerCase());
        if (hashes.includes("md4")) {
            /**
             * The path to the current md4 hashed backup folder location.
             */
            const backupFolderPath: string = path.join(
                APP_DATA_FOLDER_PATH,
                "backups",
                hash(
                    "md4",
                    (path.posix.resolve(this.path).replaceAll("\\", "/") + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev).toLowerCase()
                ),
                "data",
                "gui_vanilla_backup"
            );
            if (existsSync(backupFolderPath)) {
                return backupFolderPath;
            }
        }
        if (hashes.includes("md5")) {
            /**
             * The path to the current md5 hashed backup folder location.
             */
            const backupFolderPath: string = path.join(
                APP_DATA_FOLDER_PATH,
                "backups",
                hash(
                    "md5",
                    (path.posix.resolve(this.path).replaceAll("\\", "/") + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev).toLowerCase()
                ),
                "data",
                "gui_vanilla_backup"
            );
            if (existsSync(backupFolderPath)) {
                return backupFolderPath;
            }
        }
        /**
         * The path to the current versioned backup folder location.
         */
        const backupFolderPath_versioned: string = path.join(
            APP_DATA_FOLDER_PATH,
            "backups",
            path.basename(this.path) + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev,
            "data",
            "gui_vanilla_backup"
        );
        if (existsSync(backupFolderPath_versioned)) {
            return backupFolderPath_versioned;
        }
        /**
         * The path to the current version-only backup folder location.
         */
        const backupFolderPath_version_only: string = path.join(
            APP_DATA_FOLDER_PATH,
            "backups",
            "__VERSION_" + this.version.join(".") + "." + this.channelID + "." + +this.dev,
            "data",
            "gui_vanilla_backup"
        );
        if (existsSync(backupFolderPath_version_only)) {
            return backupFolderPath_version_only;
        }
        /**
         * The path to the current non-versioned backup folder location.
         */
        const backupFolderPath: string = path.join(APP_DATA_FOLDER_PATH, "backups", path.basename(this.path), "data", "gui_vanilla_backup");
        if (existsSync(backupFolderPath)) {
            return backupFolderPath;
        }
        /**
         * The path to the old backup folder location.
         */
        const oldBackupFolderPath: string = path.join(OLD_APP_DATA_FOLDER_PATH, path.basename(this.path), "data", "gui_vanilla_backup");
        if (existsSync(oldBackupFolderPath)) {
            return oldBackupFolderPath;
        }
        const dataFolderSubpath: ReturnType<(typeof InstallationManager)["getDataFolderSubpathOfVersionFolder"]> = this.getDataFolderSubpath();
        if (!dataFolderSubpath) return undefined;
        /**
         * The path to the first alternative backup folder location.
         */
        const altBackupFolderPathA: string = path.join(this.path, dataFolderSubpath, "gui_vanilla_backup");
        if (existsSync(altBackupFolderPathA)) {
            return altBackupFolderPathA;
        }
        /**
         * The path to the second alternative backup folder location.
         */
        const altBackupFolderPathB: string = path.join(this.path, dataFolderSubpath, "gui_vanilla");
        if (existsSync(altBackupFolderPathB)) {
            return altBackupFolderPathB;
        }
        return undefined;
    }
    /**
     * Gets the path to the backup folder zip.
     *
     * @returns The path to the backup folder zip, or `undefined` if it does not exist.
     *
     * @throws {ReferenceError} If the GUI folder could not be found.
     */
    public getBackupFolderZipPath(): string | undefined {
        // TODO: Add hash-based backup paths.
        // const hashes = getHashes().map((v) => v.toLowerCase());
        // if (hashes.includes("md4")) {
        //     /**
        //      * The path to the current md4 hashed backup folder location.
        //      */
        //     var backupFolderPath: string = path.join(
        //         APP_DATA_FOLDER_PATH,
        //         "backups",
        //         hash("md4", (path.posix.resolve(this.path).replaceAll("\\", "/") + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev).toLowerCase()),
        //         "data",
        //         "gui_vanilla_backup"
        //     );
        //     if (existsSync(backupFolderPath)) {
        //         return backupFolderPath;
        //     }
        // }
        // if (hashes.includes("md5")) {
        //     /**
        //      * The path to the current md5 hashed backup folder location.
        //      */
        //     var backupFolderPath: string = path.join(
        //         APP_DATA_FOLDER_PATH,
        //         "backups",
        //         hash("md5", (path.posix.resolve(this.path).replaceAll("\\", "/") + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev).toLowerCase()),
        //         "data",
        //         "gui_vanilla_backup"
        //     );
        //     if (existsSync(backupFolderPath)) {
        //         return backupFolderPath;
        //     }
        // }
        /**
         * The path to the current backup folder location.
         */
        const backupFolderZipPath: string = path.join(
            APP_DATA_FOLDER_PATH,
            "backups",
            path.basename(this.path) + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev,
            "data",
            "gui_vanilla_backup.zip"
        );
        if (existsSync(backupFolderZipPath)) {
            return backupFolderZipPath;
        }
        /**
         * The path to the old backup folder location.
         */
        const oldBackupFolderZipPath: string = path.join(APP_DATA_FOLDER_PATH, "backups", path.basename(this.path), "data", "gui_vanilla_backup.zip");
        if (existsSync(oldBackupFolderZipPath)) {
            return oldBackupFolderZipPath;
        }
    }
    /**
     * Gets the failed plugins data.
     *
     * @returns The failed plugins data, or `undefined` if the installation was not partially failed.
     *
     * @throws {ReferenceError} If the GUI folder could not be found.
     */
    public getFailedPlugins(): FailedPluginsJSON | undefined {
        const guiFolderPath: string = this.guiFolderPath;
        if (existsSync(path.join(guiFolderPath, "dist/hbui/failed_plugins.json"))) {
            const data: FailedPluginsJSON = JSON.parse(readFileSync(path.join(guiFolderPath, "dist/hbui/failed_plugins.json"), "utf8"));
            if (typeof data === "object" && Object.keys(data).length) return data;
        }
    }
    /**
     * Sets the failed plugins data.
     *
     * @param data The failed plugins data, or `undefined` to remove the file.
     *
     * @throws {ReferenceError} If the GUI folder could not be found.
     */
    public setFailedPlugins(data?: FailedPluginsJSON | undefined): void {
        const guiFolderPath: string = this.guiFolderPath;
        if (typeof data === "object" && data !== null) {
            writeFileSync(path.join(guiFolderPath, "dist/hbui/failed_plugins.json"), JSON.stringify(data, null, 4), "utf8");
        } else {
            rmSync(path.join(guiFolderPath, "dist/hbui/failed_plugins.json"), { force: true });
        }
    }
    private setInstallationTargetedMCVersion(): void {
        const guiFolderPath: string = this.guiFolderPath;
        writeFileSync(path.join(guiFolderPath, "dist/hbui/OUIC_INSTALLATION_TARGETED_MC_VERSION"), this.getDisplayVersion(), "utf8");
    }
    /**
     * Installs the Ore UI Customizer on the version folder.
     *
     * @param showProgressBar Whether or not to show a progress bar. Defaults to `true`.
     * @returns A promise that resolves when the installation is complete.
     *
     * @throws {any} If the installation fails.
     * @throws {ReferenceError} If the data folder subpath of the version folder is not found.
     * @throws {ReferenceError} If the GUI folder could not be found.
     */
    public async install(showProgressBar: boolean = true): Promise<void> {
        const dataFolderSubpath: ReturnType<(typeof InstallationManager)["getDataFolderSubpathOfVersionFolder"]> = this.getDataFolderSubpath();
        if (!dataFolderSubpath) throw new ReferenceError("Failed to get data folder subpath of version folder.");
        const progressBar: ProgressBar | undefined =
            showProgressBar ?
                new ProgressBar({
                    detail: "Preparing to install...",
                    abortOnError: true,
                    indeterminate: true,
                    title: "Installing Ore UI Customizer",
                    text: "Preparing to install...",
                    browserWindow: {
                        closable: false,
                        parent: getCurrentWindow(),
                        icon: "./resources/icon.png",
                    },
                    completionEnabled: false,
                })
            :   undefined;

        if (progressBar)
            await new Promise((resolve: (value: void) => void): Electron.WebContents | undefined =>
                progressBar?._window?.webContents.on("did-finish-load", resolve)
            );
        try {
            /**
             * The path to the current backup folder location.
             */
            const currentBackupFolderPath: string | undefined = this.getBackupFolderPath();
            if (
                !existsSync(
                    path.join(
                        APP_DATA_FOLDER_PATH,
                        "backups",
                        path.basename(this.path) + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev,
                        "data",
                        "gui_vanilla_backup"
                    )
                )
            ) {
                mkdirSync(
                    path.join(
                        APP_DATA_FOLDER_PATH,
                        "backups",
                        path.basename(this.path) + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev,
                        "data",
                        "gui_vanilla_backup"
                    ),
                    {
                        recursive: true,
                    }
                );
            }
            writeFileSync(
                path.join(
                    APP_DATA_FOLDER_PATH,
                    "backups",
                    path.basename(this.path) + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev,
                    "lastOreUICustomizerVersionUsed.json"
                ),
                JSON.stringify(
                    {
                        customizerVersion: format_version,
                        appVersion: VERSION,
                    },
                    null,
                    4
                )
            );
            writeFileSync(
                path.join(
                    APP_DATA_FOLDER_PATH,
                    "backups",
                    path.basename(this.path) + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev,
                    "associatedMCVersion.json"
                ),
                JSON.stringify([...this.version, this.channel, this.dev], null, 4)
            );
            /**
             * The zip file system.
             */
            const zipFs: zip.FS = new zip.fs.FS();
            /**
             * The path to the vanilla gui backup folder for the provided version folder.
             */
            const vanillaBackupPath: string = path.join(
                APP_DATA_FOLDER_PATH,
                "backups",
                path.basename(this.path) + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev,
                "data",
                "gui_vanilla_backup"
            );
            let vanillaBackupFolderZipPath: string | undefined = this.getBackupFolderZipPath();
            if (
                vanillaBackupFolderZipPath !==
                path.join(
                    APP_DATA_FOLDER_PATH,
                    "backups",
                    path.basename(this.path) + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev,
                    "data",
                    "gui_vanilla_backup.zip"
                )
            ) {
                // Disable keeping the old one as it will cause issues when migrating to the new version and having old folders for paths that are constant across versions.
                vanillaBackupFolderZipPath = undefined;
            }
            if (currentBackupFolderPath !== vanillaBackupPath) {
                // Disable keeping the old one as it will cause issues when migrating to the new version and having old folders for paths that are constant across versions.
                // if (currentBackupFolderPath) {
                //     if (progressBar) progressBar.detail = "Copying existing GUI backup folder to the new location...";
                //     copyFolder(currentBackupFolderPath, vanillaBackupPath);
                // } else {
                if (progressBar) progressBar.detail = "Creating backup of the vanilla GUI folder...";
                copyFolder(this.guiFolderPath, vanillaBackupPath);
                // }
            }

            const vanillaGUIFolderItemCount: number = readdirSync(vanillaBackupPath, { withFileTypes: true, recursive: true }).filter(
                (content: Dirent<string>): boolean => content.isFile()
            ).length;
            let zipItemCount: number = 0;

            /**
             * Adds the contents of a folder to the zip file system.
             *
             * @param directoryEntry The zip directory entry.
             * @param basePath The base path.
             * @param folder The folder.
             */
            function addFolderContents(directoryEntry: zip.ZipDirectoryEntry, basePath: string, folder: string = ""): void {
                const folderContents: Dirent<string>[] = readdirSync(path.join(basePath, folder), { withFileTypes: true });
                for (const item of folderContents) {
                    if (item.isFile()) {
                        directoryEntry.addBlob(item.name, new Blob([readFileSync(path.resolve(basePath, folder, item.name))]));
                        zipItemCount++;
                        // console.log(`Adding contents (${zipItemCount}/${vanillaGUIFolderItemCount})...`);
                        if (progressBar) {
                            progressBar.detail = `Adding contents (${zipItemCount}/${vanillaGUIFolderItemCount})...`;
                            progressBar.value = zipItemCount;
                        }
                    } else if (item.isDirectory()) {
                        addFolderContents(directoryEntry.addDirectory(item.name), basePath, path.join(folder, item.name));
                    }
                }
            }
            // console.log("Generating zip file...");
            // console.log(`Adding contents (0/${vanillaGUIFolderItemCount})...`);
            if (vanillaBackupFolderZipPath) {
                await zipFs.importData64URI(`data:application/zip;base64,${readFileSync(vanillaBackupFolderZipPath, { encoding: "base64" })}`);
            } else {
                if (progressBar) {
                    progressBar.text = "Generating zip file...";
                    progressBar.detail = `Adding contents (0/${vanillaGUIFolderItemCount})...`;
                    progressBar.indeterminate = false;
                    progressBar.maxValue = vanillaGUIFolderItemCount;
                    progressBar.value = 0;
                }
                addFolderContents(zipFs.addDirectory("gui"), vanillaBackupPath);

                // console.log("Loading config...");
                if (progressBar) {
                    progressBar.text = "Loading config...";
                    progressBar.detail = `Loading config data...`;
                    progressBar.indeterminate = true;
                }
            }
            /**
             * The plugins to use.
             */
            const plugins: EncodedPluginData[] = [];
            for (const plugin of PluginManager.getActivePlugins()) {
                if (plugin instanceof OreUICustomizerPlugin) {
                    plugins.push(await plugin.toEncodedPluginData());
                }
            }
            /**
             * The themes to use.
             */
            const themes: EncodedThemeData[] = [];
            for (const theme of ThemeManager.getActiveThemes()) {
                if (theme instanceof OreUICustomizerTheme) {
                    themes.push(await theme.toEncodedThemeData());
                }
            }
            /**
             * The config data to use.
             */
            const configData: (OreUICustomizerConfig_Settings & Omit<OreUICustomizerSettings, keyof OreUICustomizerConfig_Settings>) | undefined = {
                ...ConfigManager.currentConfig.oreUICustomizerConfig,
                plugins,
                themes,
            };
            /**
             * Whether or not to enable debug logging.
             *
             * @todo
             */
            const enableDebugLogging: boolean = false;

            if (progressBar) {
                progressBar.text = "Converting zip file to blob...";
                progressBar.detail = `Converting zip file to blob...`;
            }
            /**
             * The original zip folder blob.
             */
            const originalZipData: Blob = await zipFs.exportBlob();

            if (!vanillaBackupFolderZipPath) {
                writeFileSync(
                    path.join(
                        APP_DATA_FOLDER_PATH,
                        "backups",
                        path.basename(this.path) + "_" + this.version.join(".") + "." + this.channelID + "." + +this.dev,
                        "data",
                        "gui_vanilla_backup.zip"
                    ),
                    Buffer.from(await originalZipData.arrayBuffer())
                );
            }

            if (progressBar) {
                progressBar.text = "Applying mods...";
                progressBar.detail = `Applying mods...`;
            }
            /**
             * The zip folder blob with the modded GUI folder.
             */
            const moddedZipData: import("./ore-ui-customizer-api.ts").ApplyModsResult = await applyMods(originalZipData, {
                baseURI: "resource://.",
                enableDebugLogging,
                nodeFS: undefined,
                settings: configData,
            });

            if (progressBar) {
                progressBar.text = "Applying modded zip...";
                progressBar.detail = `Applying modded zip...`;
            }
            const GUIFolderpath: string = this.guiFolderPath;
            /**
             * Apply a modded zip to a version.
             *
             * @param moddedZip The modded zip to apply.
             * @param versionFolder The path to the version folder of the version to apply the modded zip to.
             * @returns A promise that resolves when the modded zip is applied.
             */
            async function applyModdedZip(moddedZip: Blob, versionFolder: string): Promise<void> {
                /**
                 * The zip file system.
                 */
                const zipFs: zip.FS = new zip.fs.FS();
                await zipFs.importBlob(moddedZip);
                const moddedZipItemCount: number = zipFs.entries.filter((entry: zip.ZipEntry): boolean => entry instanceof zip.fs.ZipFileEntry).length;
                let moddedZipItemIndex: number = 0;
                if (progressBar) {
                    progressBar.detail = `Adding contents (${moddedZipItemIndex}/${moddedZipItemCount})...`;
                    progressBar.indeterminate = false;
                    progressBar.value = moddedZipItemIndex;
                    progressBar.maxValue = moddedZipItemCount;
                    progressBar.value = 0;
                }
                try {
                    rmSync(GUIFolderpath, { recursive: true, force: true });
                } catch {}
                await addFolderContentsReversed(
                    zipFs.getChildByName("gui") as zip.ZipDirectoryEntry,
                    GUIFolderpath,
                    undefined,
                    (_item: zip.ZipFileEntry<any, any>): void => {
                        moddedZipItemIndex++;
                        if (progressBar) {
                            progressBar.detail = `Adding contents (${moddedZipItemIndex}/${moddedZipItemCount})...`;
                            progressBar.value = moddedZipItemIndex;
                        }
                    }
                );
            }

            await applyModdedZip(moddedZipData.zip, this.path);

            this.setInstallationTargetedMCVersion();

            if (Object.keys(moddedZipData.allFailedReplaces).length > 0) {
                this.setFailedPlugins(moddedZipData.allFailedReplaces);
                progressBar?.setProgressBarMode("error");
                if (progressBar?._window) progressBar._window.closable = true;
                console.warn("Some customizations failed.", moddedZipData.allFailedReplaces);
                await dialog.showMessageBox(getCurrentWindow(), {
                    type: "warning",
                    title: "Installation Partially Failed",
                    message:
                        "Some customizations failed, this could be due to the provided file being modified, or that version is not supported for the failed customizations.",
                    detail: JSON.stringify(moddedZipData.allFailedReplaces, null, 4),
                    buttons: ["OK"],
                    noLink: true,
                });
                getCurrentWindow().setProgressBar(-1);
            } else {
                this.setFailedPlugins();
                progressBar?.close();
                getCurrentWindow().flashFrame(true);
            }
        } catch (e: any) {
            console.error(e, e?.stack);
            progressBar?.setProgressBarMode("error");
            if (progressBar?._window) progressBar._window.closable = true;
            await dialog.showMessageBox(getCurrentWindow(), {
                type: "error",
                title: "An Error Occurred While Installing.",
                message: e.message,
                detail: e.stack,
                buttons: ["OK"],
                noLink: true,
            });
            getCurrentWindow().setProgressBar(-1);
        }
    }
    public async update(showProgressBar: boolean = true): Promise<void> {
        // TO-DO
        dialog.showMessageBox(getCurrentWindow(), {
            type: "info",
            title: "Update",
            message: "Not yet implemented.",
            buttons: ["OK"],
            noLink: true,
        });
    }
    public async repairInstallation(showProgressBar: boolean = true): Promise<void> {
        // TO-DO
        dialog.showMessageBox(getCurrentWindow(), {
            type: "info",
            title: "Repair Installation",
            message: "Not yet implemented.",
            buttons: ["OK"],
            noLink: true,
        });
    }
    /**
     * Uninstalls the Ore UI Customizer from the version folder.
     *
     * @param suppressErrors Whether or not to suppress errors. Defaults to `false`.
     * @param showProgressBar Whether or not to show a progress bar. Currently is not functional. Defaults to `true`.
     *
     * @throws {ReferenceError} If the backup folder could not be found.
     * @throws {ReferenceError} If the data folder subpath could not be found.
     */
    public uninstall(suppressErrors: boolean = false, showProgressBar: boolean = true): void {
        const backupFolderPath: string | undefined = this.getBackupFolderPath();
        const dataFolderSubpath: string | undefined = this.getDataFolderSubpath();
        if (!dataFolderSubpath) throw new ReferenceError("Could not find data folder subpath.");
        const guiFolderPath: string = path.join(this.path, dataFolderSubpath, "gui");
        if (!backupFolderPath) throw new ReferenceError("Could not find backup folder.");
        try {
            if (existsSync(guiFolderPath)) rmdirSync(guiFolderPath, { recursive: true });
            copyFolder(backupFolderPath, guiFolderPath);
        } catch (e: any) {
            if (e instanceof Error && e.message.startsWith("EBUSY: resource busy or locked, unlink")) {
                let failedFileRemovals: Dirent<string>[] = [];
                for (const item of readdirSync(guiFolderPath, { recursive: true, withFileTypes: true })) {
                    if (item.isFile()) {
                        try {
                            rmSync(path.join(item.parentPath, item.name), { force: true });
                        } catch {
                            failedFileRemovals.push(item);
                        }
                    }
                }
                if (!suppressErrors) {
                    dialog
                        .showMessageBox(getCurrentWindow(), {
                            type: "error",
                            title: "Resource Busy",
                            message: "Please close Minecraft first.",
                            detail: `The following files were unable to be removed: ${failedFileRemovals
                                .map((v: Dirent<string>): string => path.join(v.parentPath, v.name))
                                .join("\n")}`,
                            buttons: ["OK", "Show Error"],
                            noLink: true,
                        })
                        .then((result: MessageBoxReturnValue): void => {
                            if (result.response === 1) {
                                dialog.showErrorBox("Error", e.message);
                            }
                        });
                }
                copyFolder(backupFolderPath, guiFolderPath);
            } else {
                if (!suppressErrors) {
                    throw e;
                }
            }
        }
    }
    /**
     * Repairs the vanilla `gui` folder of a GDK installation of Minecraft by.
     *
     * Only works on GDK installations of Minecraft installed in the default location.
     *
     * @param showProgressBar Whether or not to show a progress bar. Defaults to `true`.
     * @returns A promise that resolves with whether the GUI folder was repaired when the repair is complete or canceled.
     *
     * @throws {ReferenceError} If the data folder subpath could not be found.
     * @throws {ReferenceError} If the Minecraft installation is not a GDK installation or is not installed in the default location.
     * @throws {TypeError} If the channel of the version folder is not "Release" or "Preview".
     * @throws {any} If the provided {@link signal} was aborted before this function was called. The thrown value is the {@link AbortSignal.reason | reason} of the aborted {@link signal}.
     * @throws {any} If an error occurs.
     *
     * @description
     * Checks to see if an already saved version of the GUI folder for this version is available from 8Crafter's website,
     * and if one is available, it restores from that, otherwise it prompts the user, and if they confirm, it downgrades Minecraft to an older GDK version,
     * deletes the `gui` folder, and then updates Minecraft again.
     */
    public async repairVanillaGUI(showProgressBar: boolean = true, signal?: AbortSignal | undefined): Promise<boolean> {
        signal?.throwIfAborted();
        const dataFolderSubpath: string | undefined = this.getDataFolderSubpath();
        if (!dataFolderSubpath) throw new ReferenceError("Could not find data folder subpath.");
        if (this.channel !== "Release" && this.channel !== "Preview") throw new TypeError("Only Release and Preview channels' GUI folders can be repaired.");
        const progressBar: ProgressBar | undefined =
            showProgressBar ?
                new ProgressBar({
                    detail: "Fetching list of available backups...",
                    abortOnError: true,
                    indeterminate: true,
                    title: "Repairing GUI Folder",
                    text: "Checking for available backup...",
                    browserWindow: {
                        closable: true,
                        parent: getCurrentWindow(),
                        icon: "./resources/icon.png",
                    },
                    completionEnabled: false,
                })
            :   undefined;
        const abortController: AbortController = new AbortController();
        // Have one signal so that once it is aborted, the function will not attempt anything else.
        const abortControllerSignal: AbortSignal = abortController.signal;
        __signalsToAbortBeforeUnload__.push(abortController);
        const signalAbortedCallback = (): void => abortController.abort(signal?.reason);
        signal?.addEventListener("abort", signalAbortedCallback, {
            once: true,
            signal: abortControllerSignal,
        });
        const beforeProgressBarCloseCallback = (event: Electron.Event): void => {
            if (!event.defaultPrevented) {
                event.preventDefault();
                if (!abortControllerSignal.aborted) abortController.abort(new DOMException("Canceled by user", "AbortError"));
            }
        };
        progressBar?._window?.on("close", beforeProgressBarCloseCallback);
        // Even though the ` | void` does nothing here, leave it to make it clear that the type parameter should include void in its union type.
        const activeUnloadPreventingPromises: PromiseWithResolvers<any | void>[] = [];
        function executeBeforeSettledActions(): void {
            // This try...catch statement isn't merged with the one right after it so that if this errors, the progress bar can still attempt to close.
            if (progressBar) {
                try {
                    if (progressBar._window && !progressBar._window?.isDestroyed()) progressBar._window.off("close", beforeProgressBarCloseCallback);
                } catch (e) {
                    console.error(e);
                }
                try {
                    if (
                        !abortControllerSignal.aborted ||
                        (abortControllerSignal.reason instanceof DOMException && abortControllerSignal.reason.message === "Canceled by user")
                    ) {
                        progressBar.completionEnabled = true;
                        progressBar.setCompleted();
                    } else {
                        progressBar.close();
                    }
                } catch (e) {
                    console.error(e);
                }
            }
            signal?.removeEventListener("abort", signalAbortedCallback);
            activeUnloadPreventingPromises.forEach(
                (v: PromiseWithResolvers<void>): void =>
                    void (v.resolve(),
                    activeUnloadPreventingPromises.includes(v) && activeUnloadPreventingPromises.splice(activeUnloadPreventingPromises.indexOf(v), 1),
                    __promisesToResolveBeforeUnload__.includes(v.promise) &&
                        __promisesToResolveBeforeUnload__.splice(__promisesToResolveBeforeUnload__.indexOf(v.promise), 1))
            );
        }
        function createUnloadPreventingPromise<T>(): PromiseWithResolvers<T | void> {
            const promise: PromiseWithResolvers<T | void> = Promise.withResolvers();
            promise.promise.finally(
                (): void =>
                    void (activeUnloadPreventingPromises.includes(promise) &&
                        activeUnloadPreventingPromises.splice(activeUnloadPreventingPromises.indexOf(promise), 1),
                    __promisesToResolveBeforeUnload__.includes(promise.promise) &&
                        __promisesToResolveBeforeUnload__.splice(__promisesToResolveBeforeUnload__.indexOf(promise.promise), 1))
            );
            activeUnloadPreventingPromises.push(promise);
            __promisesToResolveBeforeUnload__.push(promise.promise);
            return promise;
        }
        try {
            const backupsListResponse: Response = await fetch("https://www.8crafter.com/api/gdk-gui-folder-backups-list.json", {
                signal: abortControllerSignal,
            });
            if (backupsListResponse.ok) {
                type BackupList = Record<"release" | "preview", { [version: string]: string | null }>;
                if (progressBar) progressBar.detail = "Checking list for available backup...";
                const backupsList: BackupList | null = await backupsListResponse.json().catch((): null => null);
                if (backupsList) {
                    const backupURI: string | null | undefined =
                        backupsList?.[this.channel.toLowerCase() as Lowercase<typeof this.channel>][this.version.join(".")];
                    if (backupURI) {
                        if (progressBar) {
                            progressBar.text = "Downloading backup...";
                            progressBar.detail = "Downloading backup...";
                        }
                        const backupResponse: Response = await fetch(backupURI, {
                            signal: abortControllerSignal,
                        });
                        if (backupResponse.ok) {
                            if (progressBar) {
                                progressBar.text = "Restoring backup...";
                                progressBar.detail = "Extracting backup...";
                            }
                            const zipFs: zip.FS = new zip.fs.FS();
                            await zipFs.importBlob(await backupResponse.blob(), {
                                signal: abortControllerSignal,
                            });
                            if (progressBar) progressBar.detail = "Deleting current GUI folder...";
                            const guiFolderPath: string = path.join(this.path, dataFolderSubpath, "gui");
                            if (existsSync(guiFolderPath)) await rmdir(guiFolderPath, { recursive: true });
                            if (progressBar) progressBar.detail = "Writing new GUI folder...";
                            const backupZipItemCount: number = zipFs.entries.filter(
                                (entry: zip.ZipEntry): boolean => entry instanceof zip.fs.ZipFileEntry
                            ).length;
                            let backupZipItemIndex: number = 0;
                            if (progressBar) {
                                progressBar.detail = `Writing new GUI folder (${backupZipItemIndex}/${backupZipItemCount})...`;
                                progressBar.indeterminate = false;
                                progressBar.value = backupZipItemIndex;
                                progressBar.maxValue = backupZipItemCount;
                                progressBar.value = 0;
                            }
                            await addFolderContentsReversed(
                                zipFs.getChildByName("gui") as zip.ZipDirectoryEntry,
                                guiFolderPath,
                                undefined,
                                (_item: zip.ZipFileEntry<any, any>): void => {
                                    backupZipItemIndex++;
                                    if (progressBar) {
                                        progressBar.detail = `Adding contents (${backupZipItemIndex}/${backupZipItemCount})...`;
                                        progressBar.value = backupZipItemIndex;
                                    }
                                },
                                abortControllerSignal
                            );
                            executeBeforeSettledActions();
                            await dialog.showMessageBox(getCurrentWindow(), {
                                type: "info",
                                title: "GUI Folder Repaired",
                                message: "The GUI folder for this version of Minecraft has been repaired.",
                                buttons: ["OK"],
                                noLink: true,
                                signal: abortControllerSignal,
                            });
                            return true;
                        } else {
                            const repairModeChoice: MessageBoxReturnValue = await dialog.showMessageBox(getCurrentWindow(), {
                                type: "question",
                                title: "Downgrade and Update Minecraft?",
                                message: `The backup of the GUI folder for this version of Minecraft could be downloaded.
Would you like the app to downgrade Minecraft and update it again in order to repair the GUI folder?
All your Minecraft data will be kept intact, you will not lose any data.
This may take several minutes depending on your internet speed as the app will have to download about 3.5 GiB worth of data.\
NOTE: If you have used this option before it will likely be much faster as the version this will downgrade to is probably still cached.
If you select "Full Repair", all of this Minecraft version's files will be repaired, if you select "Repair Only GUI Folder" only the GUI folder will be repaired\
(this may cause the Minecraft installation to take up more space due to leftover files from the previous version (caused by the new way Minecraft updates),\
but this would happen with normal updating as well).`,
                                buttons: ["Full Repair", "Repair Only GUI Folder", "Cancel"],
                                noLink: true,
                                defaultId: 0,
                                // TODO: Add advanced mode.
                                // checkboxChecked: false,
                                // checkboxLabel: "Advanced Mode",
                                signal: abortControllerSignal,
                            });
                            if (repairModeChoice.response === 2) {
                                executeBeforeSettledActions();
                                return false;
                            }
                            var repairMode: "full" | "gui-folder-only" = repairModeChoice.response ? "gui-folder-only" : "full";
                            var advancedMode: boolean = false;
                            var tempVersionMSIXVCFilePath: string | null = null;
                            var currentVersionMSIXVCFilePath: string | null = null;
                        }
                    } else {
                        const repairModeChoice: MessageBoxReturnValue = await dialog.showMessageBox(getCurrentWindow(), {
                            type: "question",
                            title: "Downgrade and Update Minecraft?",
                            message: `No backup of the GUI folder for this version of Minecraft could be found.
Would you like the app to downgrade Minecraft and update it again in order to repair the GUI folder?
All your Minecraft data will be kept intact, you will not lose any data.
This may take several minutes depending on your internet speed as the app will have to download about 3.5 GiB worth of data.\
NOTE: If you have used this option before it will likely be much faster as the version this will downgrade to is probably still cached.
If you select "Full Repair", all of this Minecraft version's files will be repaired, if you select "Repair Only GUI Folder" only the GUI folder will be repaired\
(this may cause the Minecraft installation to take up more space due to leftover files from the previous version (caused by the new way Minecraft updates),\
but this would happen with normal updating as well).`,
                            buttons: ["Full Repair", "Repair Only GUI Folder", "Cancel"],
                            noLink: true,
                            defaultId: 0,
                            // TODO: Add advanced mode.
                            // checkboxChecked: false,
                            // checkboxLabel: "Advanced Mode",
                            signal: abortControllerSignal,
                        });
                        if (repairModeChoice.response === 2) {
                            executeBeforeSettledActions();
                            return false;
                        }
                        var repairMode: "full" | "gui-folder-only" = repairModeChoice.response ? "gui-folder-only" : "full";
                        var advancedMode: boolean = false;
                        var tempVersionMSIXVCFilePath: string | null = null;
                        var currentVersionMSIXVCFilePath: string | null = null;
                    }
                } else {
                    const repairModeChoice: MessageBoxReturnValue = await dialog.showMessageBox(getCurrentWindow(), {
                        type: "question",
                        title: "Downgrade and Update Minecraft?",
                        message: `The list of GUI folder backups was not valid JSON.
Would you like the app to downgrade Minecraft and update it again in order to repair the GUI folder?
All your Minecraft data will be kept intact, you will not lose any data.
This may take several minutes depending on your internet speed as the app will have to download about 3.5 GiB worth of data.\
NOTE: If you have used this option before it will likely be much faster as the version this will downgrade to is probably still cached.
If you select "Full Repair", all of this Minecraft version's files will be repaired, if you select "Repair Only GUI Folder" only the GUI folder will be repaired\
(this may cause the Minecraft installation to take up more space due to leftover files from the previous version (caused by the new way Minecraft updates),\
but this would happen with normal updating as well).`,
                        buttons: ["Full Repair", "Repair Only GUI Folder", "Cancel"],
                        noLink: true,
                        defaultId: 0,
                        // TODO: Add advanced mode.
                        // checkboxChecked: false,
                        // checkboxLabel: "Advanced Mode",
                        signal: abortControllerSignal,
                    });
                    if (repairModeChoice.response === 2) {
                        executeBeforeSettledActions();
                        return false;
                    }
                    var repairMode: "full" | "gui-folder-only" = repairModeChoice.response ? "gui-folder-only" : "full";
                    var advancedMode: boolean = false;
                    var tempVersionMSIXVCFilePath: string | null = null;
                    var currentVersionMSIXVCFilePath: string | null = null;
                }
            } else {
                const repairModeChoice: MessageBoxReturnValue = await dialog.showMessageBox(getCurrentWindow(), {
                    type: "question",
                    title: "Downgrade and Update Minecraft?",
                    message: `The list of available GUI folder backups could be loaded.
Would you like the app to downgrade Minecraft and update it again in order to repair the GUI folder?
All your Minecraft data will be kept intact, you will not lose any data.
This may take several minutes depending on your internet speed as the app will have to download about 3.5 GiB worth of data.\
NOTE: If you have used this option before it will likely be much faster as the version this will downgrade to is probably still cached.
If you select "Full Repair", all of this Minecraft version's files will be repaired, if you select "Repair Only GUI Folder" only the GUI folder will be repaired\
(this may cause the Minecraft installation to take up more space due to leftover files from the previous version (caused by the new way Minecraft updates),\
but this would happen with normal updating as well).`,
                    buttons: ["Full Repair", "Repair Only GUI Folder", "Cancel"],
                    noLink: true,
                    defaultId: 0,
                    // TODO: Add advanced mode.
                    // checkboxChecked: false,
                    // checkboxLabel: "Advanced Mode",
                    signal: abortControllerSignal,
                });
                if (repairModeChoice.response === 2) {
                    executeBeforeSettledActions();
                    return false;
                }
                var repairMode: "full" | "gui-folder-only" = repairModeChoice.response ? "gui-folder-only" : "full";
                var advancedMode: boolean = false;
                var tempVersionMSIXVCFilePath: string | null = null;
                var currentVersionMSIXVCFilePath: string | null = null;
            }
            if (progressBar) progressBar.text = progressBar.detail = "Fetching version list...";
            // TODO: If advanced mode is enabled the user should have the option to manually select already downloaded `.msixvc` files, allowing them to bypass the fetching of the version download links list and allowing offline use.
            const downloadsListResponse: Response = await fetch(
                "https://raw.githubusercontent.com/MinecraftBedrockArchiver/GdkLinks/refs/heads/master/urls.json"
            );
            if (!downloadsListResponse.ok) {
                executeBeforeSettledActions();
                await dialog
                    .showMessageBox(getCurrentWindow(), {
                        type: "error",
                        title: "Error",
                        message: "The list of Minecraft version download links could not be fetched.",
                        buttons: ["OK", "Show Error"],
                        noLink: true,
                        signal: abortControllerSignal,
                    })
                    .then(async (result: MessageBoxReturnValue): Promise<void> => {
                        if (result.response === 1) {
                            dialog.showErrorBox(
                                "Error",
                                `The request for "https://raw.githubusercontent.com/MinecraftBedrockArchiver/GdkLinks/refs/heads/master/urls.json" failed with status code ${
                                    downloadsListResponse.status
                                } (${downloadsListResponse.statusText}).
Body: ${(await downloadsListResponse.text()).slice(0, 1000)}`
                            );
                        }
                    });
                return false;
            }
            // TO-DO: Add an advanced mode that allows selecting `.msixvc` files for the downgrade and update.
            if (progressBar) progressBar.text = progressBar.detail = "Loading version list...";
            type DownloadsList = Record<"release" | "preview", { [version: string]: [server1?: string, server2?: string] }>;
            const downloadsList: DownloadsList | null = await downloadsListResponse.json().catch(async (e): Promise<null> => {
                executeBeforeSettledActions();
                await dialog.showMessageBox(getCurrentWindow(), {
                    type: "error",
                    title: "Error",
                    message: "The list of Minecraft version download links could not be parsed.",
                    detail: String(e),
                    buttons: ["OK", "Show Error"],
                    noLink: true,
                    signal: abortControllerSignal,
                });
                return null;
            });
            if (!downloadsList) return false;
            abortControllerSignal.throwIfAborted();
            const downloadLinksForVersion =
                currentVersionMSIXVCFilePath ? null : downloadsList[this.channel.toLowerCase() as Lowercase<typeof this.channel>][this.version.join(".")];
            let tempVersion: string | null =
                tempVersionMSIXVCFilePath ? null
                : this.channel === "Release" ?
                    this.version.join(".") === "1.21.120.4" ?
                        "1.21.121.1"
                    :   "1.21.120.4"
                : this.version.join(".") === "1.21.120.21" ? "1.21.120.22"
                : "1.21.120.21";
            if (!downloadLinksForVersion?.length) {
                const shouldReturn: boolean = await dialog
                    .showMessageBox(getCurrentWindow(), {
                        type: "warning",
                        title: "Download Link Not Found",
                        message: `The list of Minecraft version download links does not contain the download link for the Minecraft version of this installation (${this.version.join(
                            "."
                        )}).\nWould you like to continue?\nIf you choose to continue, then once the downgrade is complete, a dialog will appear asking you to update Minecraft. When it appears, update Minecraft through one of the following methods: Open Minecraft and wait for it to update; Update it through the Xbox app; Update it through the Microsoft Store; Update it through the Minecraft Launcher. Once you have updated Minecraft, you will click on the "I have updated Minecraft" button and the app will continue.\nIf you already have the .msixvc file for this version (${this.version.join(
                            "."
                        )}) downloaded on your device you can select the "Select .msixvc File" option below and select the .msixvc file, and the app will use that so you don't need to manually update.`,
                        buttons: ["Select .msixvc File", "Continue", "Cancel"],
                        noLink: true,
                        defaultId: 1,
                        signal: abortControllerSignal,
                    })
                    .then(async (result: MessageBoxReturnValue): Promise<boolean> => {
                        if (result.response === 2) return true;
                        if (result.response === 0) {
                            const file: OpenDialogReturnValue = await dialog.showOpenDialog(getCurrentWindow(), {
                                buttonLabel: "Select",
                                filters: [{ name: "Microsoft Installer for Xbox Virtual Console/Computer", extensions: ["msixvc"] }],
                                message: "Select the .msixvc file for the your current version of Minecraft.",
                                properties: ["openFile", "showHiddenFiles"],
                                title: "Select .msixvc File",
                            });
                            if (file.canceled) {
                                await dialog.showMessageBox(getCurrentWindow(), {
                                    type: "info",
                                    title: "Canceled",
                                    message: "Repair was canceled.",
                                    buttons: ["OK"],
                                    noLink: true,
                                    signal: abortControllerSignal,
                                });
                                return true;
                            }
                            currentVersionMSIXVCFilePath = file.filePaths[0]!;
                        }
                        return false;
                    });
                if (shouldReturn) {
                    executeBeforeSettledActions();
                    return false;
                }
            }
            abortControllerSignal.throwIfAborted();
            if (!tempVersionMSIXVCFilePath && tempVersion) {
                let possibleFileNames: string[] = [
                    ...new Set(
                        [
                            (
                                {
                                    "1.21.120.4": "MICROSOFT.MINECRAFTUWP_1.21.12004.0_x64__8wekyb3d8bbwe.msixvc",
                                    "1.21.121.1": "MICROSOFT.MINECRAFTUWP_1.21.12101.0_x64__8wekyb3d8bbwe.msixvc",
                                    "1.21.120.21": "Microsoft.MinecraftWindowsBeta_1.21.12021.0_x64__8wekyb3d8bbwe.msixvc",
                                    "1.21.120.22": "Microsoft.MinecraftWindowsBeta_1.21.12022.0_x64__8wekyb3d8bbwe.msixvc",
                                } as Record<string, string>
                            )[tempVersion],
                            downloadsList[this.channel.toLowerCase() as Lowercase<typeof this.channel>][tempVersion]?.[0]?.split("/").at(-1),
                        ].filter((v: string | undefined): v is string => v !== undefined)
                    ),
                ];
                if (!possibleFileNames?.length) {
                    const alternativeVersionsList: string[] = Object.entries(
                        downloadsList[this.channel.toLowerCase() as Lowercase<typeof this.channel>]
                    ).reduce(
                        (list: string[], [key, value]: [string, [server1?: string | undefined, server2?: string | undefined]]): string[] =>
                            value.length && key !== this.version.join(".") ? [...list, key] : list,
                        []
                    );
                    const alternativeVersionsAvailable: boolean = !!alternativeVersionsList.length;
                    const shouldReturn: boolean = await dialog
                        .showMessageBox(getCurrentWindow(), {
                            type: "warning",
                            title: "Download Link Not Found",
                            message: `The list of Minecraft version download links does not contain the download link for the target temporary Minecraft version to downgrade to (${tempVersion}).\nIf you already have a .msixvc file for a version of Minecraft other than the currently installed one (${this.version.join(
                                "."
                            )}) downloaded on your device you can select the "Select .msixvc File" option below and select the .msixvc file, and the app will use that.\n${
                                alternativeVersionsAvailable ?
                                    `If not, please click "Select Temp Version" and select a version to download and use as the temp version.`
                                :   `No alternative versions were found in the version download links list, so if you don't have a .msixvc file for a version of Minecraft other than the currently installed one (${this.version.join(
                                        "."
                                    )}), then the repair cannot proceed, so please click "Cancel" below.`
                            }`,
                            buttons: ["Select .msixvc File", ...(alternativeVersionsAvailable ? ["Select Temp Version"] : []), "Cancel"],
                            noLink: true,
                            defaultId: +alternativeVersionsAvailable,
                            signal: abortControllerSignal,
                        })
                        .then(async (result: MessageBoxReturnValue): Promise<boolean> => {
                            if (result.response === 1 + +alternativeVersionsAvailable) return true;
                            if (result.response === 0) {
                                const file: OpenDialogReturnValue = await dialog.showOpenDialog(getCurrentWindow(), {
                                    buttonLabel: "Select",
                                    filters: [{ name: "Microsoft Installer for Xbox Virtual Console/Computer", extensions: ["msixvc"] }],
                                    message: "Select the .msixvc file for the your current version of Minecraft.",
                                    properties: ["openFile", "showHiddenFiles"],
                                    title: "Select .msixvc File",
                                });
                                if (file.canceled) {
                                    await dialog.showMessageBox(getCurrentWindow(), {
                                        type: "info",
                                        title: "Canceled",
                                        message: "Repair was canceled.",
                                        buttons: ["OK"],
                                        noLink: true,
                                        signal: abortControllerSignal,
                                    });
                                    return true;
                                }
                                tempVersionMSIXVCFilePath = file.filePaths[0]!;
                            } else {
                                const tempVersionSelection: MessageBoxReturnValue = await dialog.showMessageBox(getCurrentWindow(), {
                                    type: "question",
                                    title: "Select Temp Version",
                                    message: "Select the version to download and use as the temp version.",
                                    // HACK: This is a hacky temporary solution that will have more delay before the menu opens as the list of versions gets longer, this should be swapped to a custom menu soon.
                                    buttons: [...alternativeVersionsList, "Cancel"],
                                    cancelId: 0,
                                    defaultId: 0,
                                    noLink: true,
                                    signal: abortControllerSignal,
                                });
                                if (tempVersionSelection.response === alternativeVersionsList.length) {
                                    await dialog.showMessageBox(getCurrentWindow(), {
                                        type: "info",
                                        title: "Canceled",
                                        message: "Repair was canceled.",
                                        buttons: ["OK"],
                                        noLink: true,
                                        signal: abortControllerSignal,
                                    });
                                    return true;
                                }
                                tempVersion = alternativeVersionsList[tempVersionSelection.response]!;
                                possibleFileNames = [
                                    downloadsList[this.channel.toLowerCase() as Lowercase<typeof this.channel>][tempVersion]![0]!.split("/").at(-1)!,
                                ];
                            }
                            return false;
                        });
                    if (shouldReturn) {
                        executeBeforeSettledActions();
                        return false;
                    }
                }
                if (!tempVersionMSIXVCFilePath)
                    for (const possibleFileName of possibleFileNames) {
                        if (existsSync(path.join(APP_DATA_FOLDER_PATH, CACHE_FOLDER_PATH, CACHE_FOLDER_SUBPATHS.MSIXVC, possibleFileName))) {
                            tempVersionMSIXVCFilePath = path.join(APP_DATA_FOLDER_PATH, CACHE_FOLDER_PATH, CACHE_FOLDER_SUBPATHS.MSIXVC, possibleFileName);
                            break;
                        }
                        if (existsSync(path.join(APP_DATA_FOLDER_PATH, CACHE_FOLDER_PATH, CACHE_FOLDER_SUBPATHS.TMP.MSIXVC, possibleFileName))) {
                            tempVersionMSIXVCFilePath = path.join(APP_DATA_FOLDER_PATH, CACHE_FOLDER_PATH, CACHE_FOLDER_SUBPATHS.TMP.MSIXVC, possibleFileName);
                            break;
                        }
                    }
                if (!tempVersionMSIXVCFilePath) {
                    // TODO: Make this dynamically determine whether to save to the normal or temp cache.
                    if (progressBar) {
                        progressBar.text = "Downloading .msixvc file for temp version...";
                        progressBar.detail = "Fetching...";
                    }
                    const downloadLinks = downloadsList[this.channel.toLowerCase() as Lowercase<typeof this.channel>][tempVersion]!;
                    const fileDownloadUnloadPreventer: PromiseWithResolvers<void> = createUnloadPreventingPromise<void>();
                    let waitForDownloadFileAbortCleanupPromise: PromiseWithResolvers<void> | undefined = undefined as PromiseWithResolvers<void> | undefined;
                    try {
                        const outputPath: string = path.join(
                            APP_DATA_FOLDER_PATH,
                            CACHE_FOLDER_PATH,
                            /* TODO */ CACHE_FOLDER_SUBPATHS.MSIXVC,
                            possibleFileNames[0]!
                        );
                        await downloadFileWithProgress(
                            downloadLinks[Math.floor(Math.random() * downloadLinks.length)]!,
                            outputPath,
                            progressBar ?
                                {
                                    onFetched(_response, stats) {
                                        progressBar.detail = `Downloading (<span style="font-family: monospace;">0 bytes${
                                            stats.totalSize !== null ? `/${formatFileSizeBinary(stats.totalSize, { trailingZeros: true })}` : ""
                                        }</span>) (<span style="font-family: monospace;">0 chunks</span>) (<span style="font-family: monospace;">0 bytes/s</span>)...${
                                            stats.totalSize !== null ? `<br/>Time remaining: <span style="font-family: monospace;">Calculating...</span>` : ""
                                        }`;
                                        if (stats.totalSize !== null) {
                                            progressBar.indeterminate = false;
                                            progressBar.maxValue = stats.totalSize!;
                                        }
                                    },
                                    onComplete(stats) {
                                        progressBar.detail = `Done.`;
                                        if (stats.totalSize !== null) progressBar.value = progressBar.maxValue;
                                    },
                                    onProgress(stats) {
                                        progressBar.detail = `Downloading (<span style="font-family: monospace;">${formatFileSizeBinary(stats.downloadedBytes, {
                                            trailingZeros: true,
                                        })}${
                                            stats.totalSize !== null ? `/${formatFileSizeBinary(stats.totalSize, { trailingZeros: true })}` : ""
                                        }</span>) (<span style="font-family: monospace;">${
                                            stats.chunkCount
                                        } chunks</span>) (<span style="font-family: monospace;">${formatFileSizeBinary(
                                            stats.downloadedBytes / ((stats.chunkEndTime - stats.downloadStartTime) / 1000),
                                            { trailingZeros: true }
                                        )}/s</span>)...${
                                            stats.totalSize !== null ?
                                                `<br/>Time remaining: <span style="font-family: monospace;">${
                                                    // TODO: Make this use the `moment` node module to format the time.
                                                    Math.round(
                                                        (stats.totalSize - stats.downloadedBytes) /
                                                            (stats.downloadedBytes / ((stats.chunkEndTime - stats.downloadStartTime) / 1000))
                                                    )
                                                }s</span>`
                                            :   ""
                                        }`;
                                        progressBar.value = stats.downloadedBytes;
                                    },
                                    async onEnd(endReason) {
                                        if (endReason.reason === "Abort" || endReason.reason === "Error") {
                                            // This must be before any awaits are run, so that the promise is created before the catch statement is triggered.
                                            waitForDownloadFileAbortCleanupPromise = Promise.withResolvers();
                                        }
                                        try {
                                            try {
                                                if (endReason.reason === "Abort") {
                                                    const canceledByUser: boolean =
                                                        (endReason.cause instanceof DOMException ? endReason.cause
                                                        : endReason.cause.cause instanceof Error || endReason.cause.cause instanceof DOMException ?
                                                            endReason.cause.cause
                                                        :   undefined
                                                        )?.message === "Canceled by user";
                                                    dialog.showMessageBoxSync(getCurrentWindow(), {
                                                        type: "info",
                                                        title: canceledByUser ? "Canceled" : "Aborted",
                                                        message: `Download was ${canceledByUser ? "canceled" : "aborted"}.`,
                                                        detail:
                                                            endReason.cause instanceof DOMException ?
                                                                String(endReason.cause)
                                                            :   endReason.cause + "\n" + "Cause: " + endReason.cause.cause,
                                                        buttons: ["OK"],
                                                        noLink: true,
                                                    });
                                                } else if (endReason.reason === "Error") {
                                                    dialog.showMessageBoxSync(getCurrentWindow(), {
                                                        type: "error",
                                                        title: "Error",
                                                        message: `An error occurred while downloading the .msixvc file for the temp version (${tempVersion}).`,
                                                        detail: String(endReason.error),
                                                        buttons: ["OK"],
                                                        noLink: true,
                                                    });
                                                }
                                            } finally {
                                                if (
                                                    (endReason.reason === "Abort" || endReason.reason === "Error") &&
                                                    endReason.stats.downloadStartTime &&
                                                    !endReason.stats.downloadTime
                                                ) {
                                                    await rm(outputPath, { force: true });
                                                }
                                            }
                                        } finally {
                                            waitForDownloadFileAbortCleanupPromise?.resolve();
                                        }
                                    },
                                }
                            :   {},
                            {
                                signal: abortControllerSignal,
                            }
                        );
                        tempVersionMSIXVCFilePath = outputPath;
                    } catch (e) {
                        await waitForDownloadFileAbortCleanupPromise?.promise;
                        executeBeforeSettledActions();
                        return false;
                    }
                    // Resolve the unload preventer here, since the download is complete.
                    fileDownloadUnloadPreventer.resolve();
                }
            }
            if (!currentVersionMSIXVCFilePath) {
                const fileName: string = downloadsList[this.channel.toLowerCase() as Lowercase<typeof this.channel>]
                    [this.version.join(".")]![0]!.split("/")
                    .at(-1)!;
                if (existsSync(path.join(APP_DATA_FOLDER_PATH, CACHE_FOLDER_PATH, CACHE_FOLDER_SUBPATHS.MSIXVC, fileName))) {
                    currentVersionMSIXVCFilePath = path.join(APP_DATA_FOLDER_PATH, CACHE_FOLDER_PATH, CACHE_FOLDER_SUBPATHS.MSIXVC, fileName);
                } else if (existsSync(path.join(APP_DATA_FOLDER_PATH, CACHE_FOLDER_PATH, CACHE_FOLDER_SUBPATHS.TMP.MSIXVC, fileName))) {
                    currentVersionMSIXVCFilePath = path.join(APP_DATA_FOLDER_PATH, CACHE_FOLDER_PATH, CACHE_FOLDER_SUBPATHS.TMP.MSIXVC, fileName);
                }
                if (!currentVersionMSIXVCFilePath && downloadLinksForVersion) {
                    // TODO: Make this dynamically determine whether to save to the normal or temp cache.
                    if (progressBar) {
                        progressBar.text = "Downloading .msixvc file for current version...";
                        progressBar.detail = "Fetching...";
                    }
                    const fileDownloadUnloadPreventer: PromiseWithResolvers<void> = createUnloadPreventingPromise<void>();
                    let waitForDownloadFileAbortCleanupPromise: PromiseWithResolvers<void> | undefined = undefined as PromiseWithResolvers<void> | undefined;
                    try {
                        const currentVersion: string = this.version.join(".");
                        const outputPath: string = path.join(APP_DATA_FOLDER_PATH, CACHE_FOLDER_PATH, /* TODO */ CACHE_FOLDER_SUBPATHS.MSIXVC, fileName);
                        await downloadFileWithProgress(
                            downloadLinksForVersion[Math.floor(Math.random() * downloadLinksForVersion.length)]!,
                            outputPath,
                            progressBar ?
                                {
                                    onFetched(_response, stats) {
                                        progressBar.detail = `Downloading (<span style="font-family: monospace;">0 bytes${
                                            stats.totalSize !== null ? `/${formatFileSizeBinary(stats.totalSize, { trailingZeros: true })}` : ""
                                        }</span>) (<span style="font-family: monospace;">0 chunks</span>) (<span style="font-family: monospace;">0 bytes/s</span>)...${
                                            stats.totalSize !== null ? `<br/>Time remaining: <span style="font-family: monospace;">Calculating...</span>` : ""
                                        }`;
                                        if (stats.totalSize !== null) {
                                            progressBar.indeterminate = false;
                                            progressBar.maxValue = stats.totalSize!;
                                        }
                                    },
                                    onComplete(stats) {
                                        progressBar.detail = `Done.`;
                                        if (stats.totalSize !== null) progressBar.value = progressBar.maxValue;
                                    },
                                    onProgress(stats) {
                                        progressBar.detail = `Downloading (<span style="font-family: monospace;">${formatFileSizeBinary(stats.downloadedBytes, {
                                            trailingZeros: true,
                                        })}${
                                            stats.totalSize !== null ? `/${formatFileSizeBinary(stats.totalSize, { trailingZeros: true })}` : ""
                                        }</span>) (<span style="font-family: monospace;">${
                                            stats.chunkCount
                                        } chunks</span>) (<span style="font-family: monospace;">${formatFileSizeBinary(
                                            stats.downloadedBytes / ((stats.chunkEndTime - stats.downloadStartTime) / 1000),
                                            { trailingZeros: true }
                                        )}/s</span>)...${
                                            stats.totalSize !== null ?
                                                `<br/>Time remaining: <span style="font-family: monospace;">${
                                                    // TODO: Make this use the `moment` node module to format the time.
                                                    Math.round(
                                                        (stats.totalSize - stats.downloadedBytes) /
                                                            (stats.downloadedBytes / ((stats.chunkEndTime - stats.downloadStartTime) / 1000))
                                                    )
                                                }s</span>`
                                            :   ""
                                        }`;
                                        progressBar.value = stats.downloadedBytes;
                                    },
                                    async onEnd(endReason) {
                                        if (endReason.reason === "Abort" || endReason.reason === "Error") {
                                            // This must be before any awaits are run, so that the promise is created before the catch statement is triggered.
                                            waitForDownloadFileAbortCleanupPromise = Promise.withResolvers();
                                        }
                                        try {
                                            try {
                                                if (endReason.reason === "Abort") {
                                                    const canceledByUser: boolean =
                                                        (endReason.cause instanceof DOMException ? endReason.cause
                                                        : endReason.cause.cause instanceof Error || endReason.cause.cause instanceof DOMException ?
                                                            endReason.cause.cause
                                                        :   undefined
                                                        )?.message === "Canceled by user";
                                                    dialog.showMessageBoxSync(getCurrentWindow(), {
                                                        type: "info",
                                                        title: canceledByUser ? "Canceled" : "Aborted",
                                                        message: `Download was ${canceledByUser ? "canceled" : "aborted"}.`,
                                                        detail:
                                                            endReason.cause instanceof DOMException ?
                                                                String(endReason.cause)
                                                            :   endReason.cause + "\n" + "Cause: " + endReason.cause.cause,
                                                        buttons: ["OK"],
                                                        noLink: true,
                                                    });
                                                } else if (endReason.reason === "Error") {
                                                    dialog.showMessageBoxSync(getCurrentWindow(), {
                                                        type: "error",
                                                        title: "Error",
                                                        message: `An error occurred while downloading the .msixvc file for the current version (${currentVersion}).`,
                                                        detail: String(endReason.error),
                                                        buttons: ["OK"],
                                                        noLink: true,
                                                    });
                                                }
                                            } finally {
                                                if (
                                                    (endReason.reason === "Abort" || endReason.reason === "Error") &&
                                                    endReason.stats.downloadStartTime &&
                                                    !endReason.stats.downloadTime
                                                ) {
                                                    try {
                                                        if (progressBar) {
                                                            progressBar.indeterminate = true;
                                                            progressBar.text = "Cleaning up...";
                                                            progressBar.detail = "Removing corrupted .msixvc file...";
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                    }
                                                    await rm(outputPath, { force: true });
                                                    try {
                                                        if (progressBar) {
                                                            progressBar.detail = "Done.";
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                    }
                                                }
                                            }
                                        } finally {
                                            waitForDownloadFileAbortCleanupPromise?.resolve();
                                        }
                                    },
                                }
                            :   {},
                            {
                                signal: abortControllerSignal,
                            }
                        );
                        currentVersionMSIXVCFilePath = outputPath;
                    } catch (e) {
                        await waitForDownloadFileAbortCleanupPromise?.promise;
                        executeBeforeSettledActions();
                        return false;
                    }
                    // Resolve the unload preventer here, since the download is complete.
                    fileDownloadUnloadPreventer.resolve();
                }
            }
            if (progressBar) {
                progressBar.indeterminate = true;
                progressBar.text = "Installing temp version...";
                progressBar.detail = "Installing msixvc...<br/>This may take a few minutes.";
            }
            {
                const result = await runCommmand(`Add-AppxPackage "${tempVersionMSIXVCFilePath}" -ForceUpdateFromAnyVersion`, {
                    shell: "powershell.exe",
                    signal: abortControllerSignal,
                });
                if (result.err) {
                    executeBeforeSettledActions();
                    if (result.err.name === "AbortError") {
                        const canceledByUser: boolean =
                            (result.err.cause instanceof Error || result.err.cause instanceof DOMException ? result.err.cause : undefined)?.message ===
                            "Canceled by user";
                        await dialog.showMessageBox(getCurrentWindow(), {
                            type: "info",
                            title: canceledByUser ? "Canceled" : "Aborted",
                            message: `Installation was ${canceledByUser ? "canceled" : "aborted"}.`,
                            detail: result.err + "\n" + "Cause: " + result.err.cause,
                            buttons: ["OK"],
                            noLink: true,
                        });
                        return false;
                    }
                    await dialog.showMessageBox(getCurrentWindow(), {
                        type: "error",
                        title: "Error",
                        message: `An error occurred while installing the .msixvc file for the temp version (${tempVersion}).`,
                        detail: String(result.err),
                        buttons: ["OK"],
                        noLink: true,
                    });
                    return false;
                }
            }
            if (progressBar) {
                progressBar.text = "Deleting version files...";
                progressBar.detail = "Deleting...";
            }
            if (repairMode === "full") {
                const results = await Promise.allSettled(
                    readdirSync(path.join(this.path, "data"), { withFileTypes: true }).map((f) =>
                        rm(path.join(this.path, "data", f.name), { force: true, recursive: true })
                    )
                );
                if (results.some((r) => r.status === "rejected")) {
                    await dialog.showMessageBox(getCurrentWindow(), {
                        type: "warning",
                        title: "Warning",
                        message: "Some files could not be deleted.",
                        detail: [...new Set(results.filter((r) => r.status === "rejected").map((r) => r.reason))].join("\n"),
                        buttons: ["Continue"],
                        noLink: true,
                        signal: abortControllerSignal,
                    });
                }
            } else if (repairMode === "gui-folder-only") {
                try {
                    await rm(path.join(this.path, "data", "gui"), { recursive: true, force: true });
                } catch (e) {
                    await dialog.showMessageBox(getCurrentWindow(), {
                        type: "warning",
                        title: "Warning",
                        message: `An error occurred while deleting the gui folder of the temp version (${tempVersion}).`,
                        detail: String(e),
                        buttons: ["Continue"],
                        noLink: true,
                    });
                }
            } else {
                executeBeforeSettledActions();
                await dialog.showMessageBox(getCurrentWindow(), {
                    type: "error",
                    title: "Error",
                    message: `Unsupported repair mode: ${repairMode}.`,
                    buttons: ["OK"],
                    noLink: true,
                });
                return false;
            }
            if (progressBar) {
                progressBar.indeterminate = true;
                progressBar.text = "Installing current version...";
                progressBar.detail = "Installing msixvc...<br/>This may take a few minutes.";
            }
            {
                const result = await runCommmand(`Add-AppxPackage "${currentVersionMSIXVCFilePath}" -ForceUpdateFromAnyVersion`, {
                    shell: "powershell.exe",
                    signal: abortControllerSignal,
                });
                if (result.err) {
                    executeBeforeSettledActions();
                    if (result.err.name === "AbortError") {
                        const canceledByUser: boolean =
                            (result.err.cause instanceof Error || result.err.cause instanceof DOMException ? result.err.cause : undefined)?.message ===
                            "Canceled by user";
                        await dialog.showMessageBox(getCurrentWindow(), {
                            type: "info",
                            title: canceledByUser ? "Canceled" : "Aborted",
                            message: `Installation was ${canceledByUser ? "canceled" : "aborted"}.`,
                            detail: result.err + "\n" + "Cause: " + result.err.cause,
                            buttons: ["OK"],
                            noLink: true,
                        });
                        return false;
                    }
                    await dialog.showMessageBox(getCurrentWindow(), {
                        type: "error",
                        title: "Error",
                        message: `An error occurred while installing the .msixvc file for the current version (${this.version.join(".")}).`,
                        detail: String(result.err),
                        buttons: ["OK"],
                        noLink: true,
                    });
                    return false;
                }
            }
            executeBeforeSettledActions();
            if (repairMode === "full") {
                await dialog.showMessageBox(getCurrentWindow(), {
                    type: "info",
                    title: "Data Folder Repaired",
                    message: "The data folder for this version of Minecraft has been repaired.",
                    buttons: ["OK"],
                    noLink: true,
                    signal: abortControllerSignal,
                });
            } else if (repairMode === "gui-folder-only") {
                await dialog.showMessageBox(getCurrentWindow(), {
                    type: "info",
                    title: "GUI Folder Repaired",
                    message: "The gui folder for this version of Minecraft has been repaired.",
                    buttons: ["OK"],
                    noLink: true,
                    signal: abortControllerSignal,
                });
            }
            return true;
        } finally {
            executeBeforeSettledActions();
        }
    }
}
