/**
 * src/utils/InstallationManager.ts
 * @module
 * @description A file containing utility functions for managing the isntallations of 8Crafter's Ore UI Customizer.
 * @supports Preload, Renderer
 */
import path from "node:path";
import { copyFileSync, Dirent, existsSync, mkdirSync, readdirSync, readFileSync, rmdirSync, rmSync, writeFileSync } from "node:fs";
import semver from "semver";
import { API_SOURCE_WEBSITE_URL, APP_DATA_FOLDER_PATH, OLD_APP_DATA_FOLDER_PATH } from "./URLs";
import "./zip.js";
import { ConfigManager } from "./ConfigManager.ts";
import type { EncodedPluginData, OreUICustomizerSettings } from "./ore-ui-customizer-assets.ts";
import { applyMods, format_version } from "./ore-ui-customizer-api.ts";
import { addFolderContentsReversed } from "./folderContentsUtils.ts";
import { OreUICustomizerPlugin, PluginManager, type MissingPluginInfo } from "./PluginManager.ts";
import type { MessageBoxReturnValue } from "electron";
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
    | "Missing (Backup Available)"
    | "Unknown (Backup Available)"
    | "Unknown";

export interface VersionFolderVersionDetails {
    version: [major: number, minor: number, patch: number, revision: number];
    channel: "Release" | "Preview" | "Beta" | "Unknown";
    dev: boolean;
    installationStatus: InstallationStatus;
}

export interface FailedPluginsJSON {
    [filename: string]: string[];
}

export class InstallationManager {
    public static getDataFolderSubpathOfVersionFolder(versionFolderPath: string): "data" | "assets" | undefined {
        if (existsSync(path.join(versionFolderPath, "data"))) return "data";
        if (existsSync(path.join(versionFolderPath, "assets"))) return "assets";
        return undefined;
    }
    public static getInstallationStatusOfVersionFolder(versionFolderPath: string): InstallationStatus {
        // Windows
        if (existsSync(path.join(versionFolderPath, "data/gui"))) {
            if (existsSync(path.join(versionFolderPath, "data/gui/dist/hbui/oreUICustomizer8CrafterConfig.js"))) {
                if (existsSync(path.join(versionFolderPath, "data/gui/dist/hbui/INSTALLING_ORE_UI_CUSTOMIZER"))) {
                    return "Installing";
                } else if (existsSync(path.join(versionFolderPath, "data/gui/dist/hbui/UNINSTALLING_ORE_UI_CUSTOMIZER"))) {
                    return "Uninstalling";
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
                } else if (existsSync(path.join(versionFolderPath, "assets/assets/gui/dist/hbui/failed_plugins.json"))) {
                    try {
                        const failedPlugins: FailedPluginsJSON = JSON.parse(
                            readFileSync(path.join(versionFolderPath, "assets/assets/gui/dist/hbui/failed_plugins.json"), "utf-8")
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
        const dataFolderSubpath: "data" | "assets" | undefined = this.getDataFolderSubpathOfVersionFolder(versionFolderPath);
        if (!dataFolderSubpath) {
            return "Unknown (Backup Available)";
        }
        /**
         * The path to the current backup folder location.
         */
        const backupFolderPath: string = path.join(APP_DATA_FOLDER_PATH, "backups", path.basename(versionFolderPath), dataFolderSubpath, "gui_vanilla_backup");
        if (existsSync(backupFolderPath)) {
            return "Missing (Backup Available)";
        }
        /**
         * The path to the old backup folder location.
         */
        const oldBackupFolderPath: string = path.join(OLD_APP_DATA_FOLDER_PATH, path.basename(versionFolderPath), dataFolderSubpath, "gui_vanilla_backup");
        if (existsSync(oldBackupFolderPath)) {
            return "Missing (Backup Available)";
        }
        /**
         * The path to the first alternative backup folder location.
         */
        const altBackupFolderPathA: string = path.join(versionFolderPath, dataFolderSubpath, "gui_vanilla_backup");
        if (existsSync(altBackupFolderPathA)) {
            return "Missing (Backup Available)";
        }
        /**
         * The path to the second alternative backup folder location.
         */
        const altBackupFolderPathB: string = path.join(versionFolderPath, dataFolderSubpath, "gui_vanilla");
        if (existsSync(altBackupFolderPathB)) {
            return "Missing (Backup Available)";
        }
        // Other
        return "Unknown";
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
    public static getVersionFromVersionFolder(versionFolderPath: string): VersionFolderVersionDetails | undefined {
        const details: VersionFolderVersionDetails = {
            version: [0, 0, 0, 0],
            channel: "Unknown",
            dev: false,
            installationStatus: "Unknown",
        };
        // Windows
        const AppxManifestXMLPath: string = path.join(versionFolderPath, "AppxManifest.xml");
        if (existsSync(AppxManifestXMLPath)) {
            const AppxManifestXMLContent: string = readFileSync(AppxManifestXMLPath, "utf-8");
            const AppxManifestXMLVersion: `${number}.${number}.${number}.${number}` | undefined = AppxManifestXMLContent.match(
                /<Identity Name="(?:Microsoft\.MinecraftUWP|Microsoft\.MinecraftWindowsBeta)" Publisher="[^"]*" Version="([\d.]+)"/
            )?.[1] as `${number}.${number}.${number}.${number}` | undefined;
            const [AppxManifestPhoneProductId, AppxManifestPhonePublisherId]: [
                AppxManifestPhoneProductId: string | undefined,
                AppxManifestPhonePublisherId: string | undefined
            ] = AppxManifestXMLContent.match(/<mp:PhoneIdentity PhoneProductId="([a-f0-9-]+)" PhonePublisherId="([a-f0-9-]+)" \/>/)?.slice(1, 3) as [
                AppxManifestPhoneProductId: string | undefined,
                AppxManifestPhonePublisherId: string | undefined
            ];
            if (!AppxManifestXMLVersion) {
            } else {
                const AppxManifestXMLEdition: "Microsoft.MinecraftUWP" | "Microsoft.MinecraftWindowsBeta" | undefined = AppxManifestXMLContent.match(
                    /<Identity Name="(Microsoft\.MinecraftUWP|Microsoft\.MinecraftWindowsBeta)" Publisher="[^"]*" Version="(?:[\d.]+)"/
                )?.[1] as "Microsoft.MinecraftUWP" | "Microsoft.MinecraftWindowsBeta" | undefined;
                const versionSegments = AppxManifestXMLVersion.split(".") as [`${number}`, `${number}`, `${number}`, `${number}`];
                let version: `${number}.${number}.${number}.${number}`;
                if (versionSegments[0] === "0") {
                    if (versionSegments[1].length < 4) {
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
                    AppxManifestXMLEdition === "Microsoft.MinecraftUWP"
                        ? "Release"
                        : AppxManifestXMLEdition === "Microsoft.MinecraftWindowsBeta"
                        ? "Preview"
                        : "Unknown";
                details.dev = AppxManifestPhonePublisherId === "00000000-0000-0000-0000-000000000000";
                details.installationStatus = InstallationManager.getInstallationStatusOfVersionFolder(versionFolderPath);
                details.version = (version.split(".") as [`${number}`, `${number}`, `${number}`, `${number}`]).map(Number) as [
                    major: number,
                    minor: number,
                    patch: number,
                    revision: number
                ];
                return details;
            }
        }
        // Linux
        if (true /* TO-DO */) {
            // TO-DO
        }
        // Other
        return undefined;
    }
}

export class VersionFolder {
    /**
     * The path to the version folder.
     */
    public readonly path: string;
    /**
     * The Minecraft version of the version folder.
     */
    public readonly version: VersionFolderVersionDetails["version"];
    /**
     * The release channel of the version folder.
     */
    public readonly channel: VersionFolderVersionDetails["channel"];
    /**
     * Whether the version folder is a development version.
     */
    public readonly dev: VersionFolderVersionDetails["dev"];
    /**
     * Creates a new VersionFolder instance.
     *
     * @param path The path to the version folder.
     */
    public constructor(path: string) {
        this.path = path;
        ({ version: this.version, channel: this.channel, dev: this.dev } = InstallationManager.getVersionFromVersionFolder(path)!);
    }
    /**
     * The installation status of the version folder.
     */
    public get installationStatus(): InstallationStatus {
        return InstallationManager.getInstallationStatusOfVersionFolder(this.path);
    }
    /**
     * The path to the GUI folder.
     */
    public get guiFolderPath(): string {
        if (existsSync(path.join(this.path, "data/gui"))) {
            return path.join(this.path, "data/gui");
        }
        if (existsSync(path.join(this.path, "assets/assets/gui"))) {
            return path.join(this.path, "assets/assets/gui");
        }
        throw new Error("Could not find gui folder.");
    }
    /**
     * Gets the display version of the version folder.
     *
     * @returns The display version of the version folder.
     */
    public getDisplayVersion(): string {
        return `v${this.version.join(".")} (${this.channel}${this.dev ? " [Dev]" : ""})`;
    }
    /**
     * Gets the display version of the version folder with colored HTML.
     *
     * @returns The display version of the version folder with colored HTML.
     */
    public getDisplayVersionColoredHTML(): string {
        return `<span style="color: #00FF88">v${this.version.join(".")}</span><span style="color: #00FFFF"> (</span><span style="color: ${
            this.channel === "Release" ? "#00FF00" : this.channel === "Preview" ? "#FFFF00" : this.channel === "Beta" ? "#FF8800" : "#FF0000"
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
        /**
         * The path to the current backup folder location.
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
    public getBackupFolderZipPath(): string | undefined {
        /**
         * The path to the current backup folder location.
         */
        const backupFolderZipPath: string = path.join(APP_DATA_FOLDER_PATH, "backups", path.basename(this.path), "data", "gui_vanilla_backup.zip");
        if (existsSync(backupFolderZipPath)) {
            return backupFolderZipPath;
        }
    }
    /**
     * Installs the Ore UI Customizer on the version folder.
     *
     * @param showProgressBar Whether or not to show a progress bar, defaults to `true`.
     * @returns A promise that resolves when the installation is complete.
     *
     * @throws {any} If the installation fails.
     * @throws {ReferenceError} If the data folder subpath of the version folder is not found.
     */
    public async install(showProgressBar: boolean = true): Promise<void> {
        const dataFolderSubpath: ReturnType<(typeof InstallationManager)["getDataFolderSubpathOfVersionFolder"]> = this.getDataFolderSubpath();
        if (!dataFolderSubpath) throw new ReferenceError("Failed to get data folder subpath of version folder.");
        const progressBar: ProgressBar | undefined = showProgressBar
            ? new ProgressBar({
                  detail: "Preparing to install...",
                  abortOnError: true,
                  indeterminate: true,
                  title: "Installing Ore UI Customizer",
                  text: "Preparing to install...",
                  //   debug: true,
                  browserWindow: {
                      closable: false,
                      parent: getCurrentWindow(),
                      icon: "./resources/icon.png",
                  },
                  completionEnabled: false,
              })
            : undefined;

        progressBar &&
            (await new Promise((resolve: (value: void) => void): Electron.WebContents | undefined =>
                progressBar?._window?.webContents.on("did-finish-load", resolve)
            ));
        try {
            /**
             * The path to the current backup folder location.
             */
            const currentBackupFolderPath: string | undefined = this.getBackupFolderPath();
            if (!existsSync(path.join(APP_DATA_FOLDER_PATH, "backups", path.basename(this.path), "data", "gui_vanilla_backup"))) {
                mkdirSync(path.join(APP_DATA_FOLDER_PATH, "backups", path.basename(this.path), "data", "gui_vanilla_backup"), { recursive: true });
            }
            writeFileSync(
                path.join(APP_DATA_FOLDER_PATH, "backups", path.basename(this.path), "lastOreUICustomizerVersionUsed.json"),
                JSON.stringify(
                    {
                        customizerVersion: format_version,
                        appVersion: VERSION,
                    },
                    null,
                    4
                )
            );
            /**
             * The zip file system.
             */
            const zipFs: zip.FS = new zip.fs.FS();
            /**
             * The path to the vanilla gui backup folder for the provided version folder.
             */
            const vanillaBackupPath: string = path.join(APP_DATA_FOLDER_PATH, "backups", path.basename(this.path), "data", "gui_vanilla_backup");
            const vanillaBackupFolderZipPath: string | undefined = this.getBackupFolderZipPath();
            if (currentBackupFolderPath !== vanillaBackupPath) {
                if (currentBackupFolderPath) {
                    if (progressBar) progressBar.detail = "Copying existing GUI backup folder to the new location...";
                    copyFolder(currentBackupFolderPath, vanillaBackupPath);
                } else {
                    if (progressBar) progressBar.detail = "Creating backup of the vanilla GUI folder...";
                    copyFolder(this.guiFolderPath, vanillaBackupPath);
                }
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
             * The config data to use.
             */
            const configData: OreUICustomizerSettings | undefined = {
                ...ConfigManager.currentConfig.oreUICustomizerConfig,
                plugins,
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
                    path.join(APP_DATA_FOLDER_PATH, "backups", path.basename(this.path), "data", "gui_vanilla_backup.zip"),
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
            const GUIFolderpath = this.guiFolderPath;
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
                globalThis.generatedZip = zipFs;
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

            if (Object.keys(moddedZipData.allFailedReplaces).length > 0) {
                progressBar?.setProgressBarMode("error");
                if (progressBar?._window) progressBar._window.closable = true;
                await dialog.showMessageBox(getCurrentWindow(), {
                    type: "warning",
                    title: "Installation Partially Failed",
                    message:
                        "Some customizations failed, this could be due to the provided file being modified, or that version is not supported for the failed customizations.",
                    detail: JSON.stringify(moddedZipData.allFailedReplaces, null, 4),
                    buttons: ["OK"],
                    noLink: true,
                });
                console.warn("Some customizations failed.", moddedZipData.allFailedReplaces);
            } else {
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
}
