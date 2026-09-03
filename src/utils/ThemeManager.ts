/**
 * src/utils/ThemeManager.ts
 * @module
 * @description A file containing the ThemeManager class.
 * @supports Renderer
 */
// TODO: Add a development_themes folder. The app should either watch the paths of the themes in this folder, or reload the themes in this folder before using them or accessing their data (even for the details overlay).
import path from "node:path";
import semver, { type SemVer } from "semver";
import { APP_DATA_FOLDER_PATH, THEME_FOLDER_PATH } from "./URLs.ts";
import EventEmitter from "node:events";
import { Dirent, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import * as CommentJSON from "comment-json";
import type { EncodedThemeData, Theme as Theme_Type, ThemeManifestJSON } from "ore-ui-customizer-types";
import { sanitizeFilename } from "./sanitize-filename.ts";
import { addFolderContents, addFolderContentsReversed } from "./folderContentsUtils.ts";
import "./zip.js";
import { createToast } from "../../app/components/Toast.tsx";
import { format_version } from "./ore-ui-customizer-api.ts";
import type { CustomizerAppPage, SearchParamTypes } from "./pageList.ts";
import { PluginManager } from "./PluginManager.ts";
import { ConfigManager } from "./ConfigManager.ts";

interface ThemeManagerEventMap {
    themeCreated: [newTheme: OreUICustomizerTheme]; // TODO
    themeEdited: [editedTheme: OreUICustomizerTheme]; // TODO
    themeImported: [newTheme: OreUICustomizerTheme];
    themeRemoved: [removedTheme: OreUICustomizerTheme];
    themeRefreshed: [refreshedTheme: OreUICustomizerTheme]; // TODO
    activeThemesChanged: [activeThemes: (OreUICustomizerTheme | ThemeInfo)[]]; // TODO
}
export type OreUICustomizerThemeDependencyData = NonNullable<OreUICustomizerTheme["dependencies"]>[number];

export interface MissingOreUICustomizerThemeDependencyData extends OreUICustomizerThemeDependencyData {
    missingType: "noMatchingUUID" | "noMatchingVersion";
    packType?: "config" | "plugin" | "theme";
}

export interface OreUICustomizerThemeMessageInfo<T extends "info" | "warning" | "error" = "info" | "warning" | "error"> {
    theme: OreUICustomizerTheme;
    messageFormat: "text" | "html";
    message: string;
    titleFormat?: "text" | "html";
    title?: string;
    type: T;
    cause?: unknown;
}

// TODO: Implement theme file validation, especially for file like color_replacements.json.
// TODO: Implement validation to check files in the subfolders like textures, videos, etc. to validate their file extensions.
export class OreUICustomizerTheme implements Omit<Theme_Type, "zip"> {
    #manifest: ThemeManifestJSON;
    /**
     * The path to the folder containing the theme.
     */
    public readonly folderPath: string;
    /**
     * The ID used to uniquely identify the theme from the other imported theme.
     *
     * This is the name of the folder containing the theme.
     */
    public readonly themeID: string;
    public get name(): string {
        return this.#manifest.header.name;
    }
    public get uuid(): string {
        return this.#manifest.header.uuid;
    }
    public get description(): string | undefined {
        return this.#manifest.header.description;
    }
    public get version(): string {
        return this.#manifest.header.version;
    }
    public get format_version(): string {
        return this.#manifest.header.format_version;
    }
    public get min_engine_version(): string | undefined {
        return this.#manifest.header.min_engine_version;
    }
    public get dependencies(): ThemeManifestJSON["dependencies"] | undefined {
        return this.#manifest.dependencies;
    }
    public get metadata(): ThemeManifestJSON["metadata"] {
        return this.#manifest.metadata;
    }
    public get checkForUpdatesDetails(): ThemeManifestJSON["checkForUpdatesDetails"] | undefined {
        return this.#manifest.checkForUpdatesDetails;
    }
    public get marketplaceDetails(): ThemeManifestJSON["marketplaceDetails"] | undefined {
        return this.#manifest.marketplaceDetails;
    }
    /**
     * The data URI of the icon of the plugin.
     */
    public icon?: `data:image/${string};base64,${string}` | undefined;
    public constructor(folderPath: string) {
        this.folderPath = path.resolve(folderPath);
        this.#manifest = CommentJSON.parse(readFileSync(path.join(folderPath, "manifest.json"), { encoding: "utf-8" }), null, true) as any;
        this.themeID = path.basename(this.folderPath);
        if (existsSync(path.join(folderPath, "pack_icon.png"))) {
            this.icon = `data:image/png;base64,${readFileSync(path.join(folderPath, "pack_icon.png"), { encoding: "base64" })}`;
        } else {
            this.icon = this.#manifest.icon_data_uri ?? undefined;
        }
    }
    /**
     * Checks if an update is available for the plugin.
     *
     * @returns Whether an update is available for the plugin.
     *
     * @todo
     */
    public getIsUpdateAvailable(): boolean {
        return false;
    }
    /**
     * Gets the messages for the plugin.
     *
     * This includes info, warning, and error messages.
     *
     * @param types An array of the types of messages to get. Defaults to all messages.
     * @returns The messages for the plugin.
     *
     * @todo
     */
    public getMessages<
        T extends ("info" | "warning" | "error")[] | "all" = "all",
        T2 extends "info" | "warning" | "error" = T extends "all" ? "info" | "warning" | "error" : T[number],
    >(types: T = "all" as T): OreUICustomizerThemeMessageInfo<T2>[] {
        const messages: OreUICustomizerThemeMessageInfo[] = [];
        // IDEA: Maybe add a warning if the theme's format_version is older than the current format_version, since that means the theme may be broken, or maybe have a list of versions with breaking changes and only show the warning if a version with breaking changes is between the two versions.
        minEngineVerisonCheck: {
            if (this.min_engine_version === undefined) break minEngineVerisonCheck;
            const v1: SemVer | null = semver.parse(format_version);
            const v2: SemVer | null = semver.parse(this.min_engine_version);
            if (v1 !== null && v2 !== null && v1.version === v2.version && !v1.build.length !== !v2.build.length) {
                if (v1.build.length === 0) break minEngineVerisonCheck;
            } else if (semver.compareBuild(format_version, this.min_engine_version) !== -1) break minEngineVerisonCheck;
            messages.push({
                message: `The property '/header/min_engine_version' has a version of '${this.min_engine_version}' which is too high. The highest value we accept is '${format_version}'.`,
                messageFormat: "text",
                theme: this,
                type: "error",
            });
        }
        missingDependenciesCheck: {
            const missingDependencies = this.getMissingDependencies();
            if (!missingDependencies) break missingDependenciesCheck;
            messages.push(
                ...missingDependencies.map(
                    (missingDependency: MissingOreUICustomizerThemeDependencyData): OreUICustomizerThemeMessageInfo<"info" | "warning" | "error"> => ({
                        message:
                            missingDependency.missingType === "noMatchingUUID" ?
                                missingDependency.version !== undefined ?
                                    `Missing dependency with ID '${missingDependency.uuid}' and version '${missingDependency.version}'.`
                                :   `Missing dependency with ID '${missingDependency.uuid}'.`
                            : missingDependency.packType ?
                                `Missing dependency with ID '${missingDependency.uuid}' and version '${missingDependency.version}'. A ${missingDependency.packType} with a matching UUID was found, but the version does not match.`
                            :   `Missing dependency with ID '${missingDependency.uuid}' and version '${missingDependency.version}'. Another pack with a matching UUID was found, but the version does not match.`,
                        messageFormat: "text",
                        theme: this,
                        type: "warning",
                    })
                )
            );
        }
        if (types === "all") return messages as OreUICustomizerThemeMessageInfo<T2>[];
        return messages.filter((message: OreUICustomizerThemeMessageInfo): message is OreUICustomizerThemeMessageInfo<T2> =>
            types.includes(message.type as T2)
        );
    }
    public getMissingDependencies(): [MissingOreUICustomizerThemeDependencyData, ...MissingOreUICustomizerThemeDependencyData[]] | undefined {
        if (!this.dependencies) return undefined;
        const list: MissingOreUICustomizerThemeDependencyData[] = this.dependencies
            .map((dependency: OreUICustomizerThemeDependencyData): MissingOreUICustomizerThemeDependencyData | undefined =>
                dependency.version !== undefined ?
                    ThemeManager.getThemeFromUUIDAndVersion(dependency.uuid, dependency.version) ? undefined
                    : PluginManager.getPluginFromUUIDAndVersion(dependency.uuid, dependency.version) ? undefined
                    : ConfigManager.getConfigFromUUIDAndVersion(dependency.uuid, dependency.version) ? undefined
                    : ThemeManager.getThemeFromUUID(dependency.uuid) ? { ...dependency, missingType: "noMatchingVersion", packType: "theme" }
                    : PluginManager.getPluginFromUUID(dependency.uuid) ? { ...dependency, missingType: "noMatchingVersion", packType: "plugin" }
                    : ConfigManager.getConfigFromUUID(dependency.uuid) ? { ...dependency, missingType: "noMatchingVersion", packType: "config" }
                    : { ...dependency, missingType: "noMatchingUUID" }
                : ThemeManager.getThemeFromUUID(dependency.uuid) ? undefined
                : PluginManager.getPluginFromUUID(dependency.uuid) ? undefined
                : ConfigManager.getConfigFromUUID(dependency.uuid) ? undefined
                : { ...dependency, missingType: "noMatchingUUID" }
            )
            .filter(
                (dependency: MissingOreUICustomizerThemeDependencyData | undefined): dependency is MissingOreUICustomizerThemeDependencyData =>
                    dependency !== undefined
            );
        return list.length > 0 ? (list as [MissingOreUICustomizerThemeDependencyData, ...MissingOreUICustomizerThemeDependencyData[]]) : undefined;
    }
    public getContents(): Dirent<string>[] {
        return readdirSync(this.folderPath, { withFileTypes: true, recursive: true });
    }
    public async getZip(): Promise<Blob> {
        const zipFs = new zip.fs.FS();
        addFolderContents(zipFs.root, this.folderPath);
        return await zipFs.exportBlob();
    }
    public async getZipDataURI(): Promise<string> {
        const zipFs = new zip.fs.FS();
        addFolderContents(zipFs.root, this.folderPath);
        return await zipFs.exportData64URI();
    }
    public async toEncodedThemeData(): Promise<EncodedThemeData> {
        return {
            dataURI: (await this.getZipDataURI()) as `data:application/zip;base64,${string}`,
            fileType: "mcouictheme",
            format_version: this.format_version,
            metadata: {
                ...this.metadata,
                product_type: "theme",
            },
            name: this.name,
            uuid: this.uuid,
            version: this.version,
            dependencies: this.dependencies,
            description: this.description,
            min_engine_version: this.min_engine_version,
            checkForUpdatesDetails: this.checkForUpdatesDetails,
            icon_data_uri: this.icon,
            marketplaceDetails: this.marketplaceDetails,
        };
    }
    public toJSON(): ThemeInfo {
        return {
            uuid: this.uuid,
            version: this.version,
            metadata: this.metadata,
            name: this.name,
        };
    }
    public refresh(): void {
        this.#manifest = CommentJSON.parse(readFileSync(path.join(this.folderPath, "manifest.json"), { encoding: "utf-8" }), null, true) as any;
        if (existsSync(path.join(this.folderPath, "pack_icon.png"))) {
            this.icon = `data:image/png;base64,${readFileSync(path.join(this.folderPath, "pack_icon.png"), { encoding: "base64" })}`;
        } else {
            this.icon = this.#manifest.icon_data_uri ?? undefined;
        }
        ThemeManager.emit("themeRefreshed", this);
    }
    public delete(): void {
        if (existsSync(this.folderPath)) {
            rmSync(this.folderPath, { recursive: true, force: true });
            if (ThemeManager.loadedThemes.includes(this)) {
                ThemeManager.loadedThemes.splice(ThemeManager.loadedThemes.indexOf(this), 1);
            }
            ThemeManager.emit("themeRemoved", this);
        }
    }
}

export interface ThemeInfo {
    name?: string;
    metadata?: Partial<OreUICustomizerTheme["metadata"]>;
    uuid: string;
    version: string;
}

export interface MissingThemeInfo extends ThemeInfo {
    missingType: "noMatchingUUID" | "noMatchingVersion";
}

export const ThemeManager = new (class ThemeManager extends EventEmitter<ThemeManagerEventMap> {
    public static readonly themesFolder: string = path.join(APP_DATA_FOLDER_PATH, THEME_FOLDER_PATH);
    public loadedThemes: OreUICustomizerTheme[] = [];
    public constructor() {
        super();
        this.setMaxListeners(1000000);
    }
    public getThemeFromFolderPath(folderPath: string): OreUICustomizerTheme | undefined {
        folderPath = path.resolve(folderPath);
        if (!existsSync(folderPath)) return undefined;
        let theme: OreUICustomizerTheme | undefined = this.loadedThemes.find((theme: OreUICustomizerTheme): boolean => theme.folderPath === folderPath);
        if (!theme) {
            theme = new OreUICustomizerTheme(folderPath);
            this.loadedThemes.push(theme);
        }
        return theme;
    }
    public getThemeFromUUID(uuid: string): OreUICustomizerTheme | undefined {
        return this.loadedThemes.find((theme: OreUICustomizerTheme): boolean => theme.uuid === uuid);
    }
    public getThemeFromUUIDAndVersion(uuid: string, version: string): OreUICustomizerTheme | undefined {
        return this.loadedThemes.find((theme: OreUICustomizerTheme): boolean => theme.uuid === uuid && theme.version === version);
    }
    public getActiveThemes<E extends boolean = false>(
        excludeMissing?: E
    ): E extends true ? OreUICustomizerTheme[] : (OreUICustomizerTheme | MissingThemeInfo)[] {
        if (!existsSync(path.join(APP_DATA_FOLDER_PATH, "active_themes.json"))) {
            writeFileSync(path.join(APP_DATA_FOLDER_PATH, "active_themes.json"), JSON.stringify([], null, 4), { encoding: "utf-8" });
        }
        const activeThemes: ThemeInfo[] = CommentJSON.parse(
            readFileSync(path.join(APP_DATA_FOLDER_PATH, "active_themes.json"), { encoding: "utf-8" }),
            null,
            true
        ) as any;
        return activeThemes
            .map(
                (theme: ThemeInfo): E extends true ? OreUICustomizerTheme | undefined : OreUICustomizerTheme | MissingThemeInfo =>
                    (this.loadedThemes.find(
                        (loadedTheme: OreUICustomizerTheme): boolean => loadedTheme.uuid === theme.uuid && loadedTheme.version === theme.version
                    ) ??
                        (excludeMissing ? undefined
                        : this.loadedThemes.some((loadedTheme: OreUICustomizerTheme): boolean => loadedTheme.uuid === theme.uuid) ?
                            { ...theme, missingType: "noMatchingVersion" }
                        :   { ...theme, missingType: "noMatchingUUID" })) as E extends true ? OreUICustomizerTheme | undefined
                    :   OreUICustomizerTheme | MissingThemeInfo
            )
            .filter(
                (
                    theme: E extends true ? OreUICustomizerTheme | undefined : OreUICustomizerTheme | MissingThemeInfo
                ): theme is E extends true ? OreUICustomizerTheme : OreUICustomizerTheme => !!theme
            );
    }
    public setActiveThemes(activeThemes: (OreUICustomizerTheme | ThemeInfo)[]): void {
        const parsedActiveThemes: (OreUICustomizerTheme | ThemeInfo)[] = activeThemes.map(
            (v: OreUICustomizerTheme | ThemeInfo): OreUICustomizerTheme | ThemeInfo =>
                v instanceof OreUICustomizerTheme ? v : (
                    (Object.fromEntries(Object.entries(v).filter(([key]: [key: string, value: any]): boolean => key !== "missingType")) as ThemeInfo)
                )
        );
        writeFileSync(path.join(APP_DATA_FOLDER_PATH, "active_themes.json"), JSON.stringify(parsedActiveThemes, null, 4), { encoding: "utf-8" });
        this.emit("activeThemesChanged", this.getActiveThemes());
    }
    public getInactiveThemes(): OreUICustomizerTheme[] {
        const activeThemes: (OreUICustomizerTheme | ThemeInfo)[] = this.getActiveThemes();
        return this.loadedThemes.filter((v: OreUICustomizerTheme): boolean => !activeThemes.includes(v));
    }
    public loadThemes(): Error[] {
        const errors: Error[] = [];
        for (const theme of readdirSync(path.join(APP_DATA_FOLDER_PATH, THEME_FOLDER_PATH), { withFileTypes: true })) {
            if (theme.isDirectory()) {
                const folderPath: string = path.join(APP_DATA_FOLDER_PATH, THEME_FOLDER_PATH, theme.name);
                if (!existsSync(path.join(folderPath, "manifest.json"))) continue;
                if (this.loadedThemes.some((loadedTheme: OreUICustomizerTheme): boolean => loadedTheme.folderPath === folderPath)) {
                    this.loadedThemes.splice(
                        this.loadedThemes.findIndex((loadedTheme: OreUICustomizerTheme): boolean => loadedTheme.folderPath === folderPath),
                        1
                    );
                }
                try {
                    this.loadedThemes.push(new OreUICustomizerTheme(folderPath));
                } catch (e: any) {
                    if (e instanceof Error) {
                        errors.push(e);
                    } else {
                        errors.push(new Error(`Error: ${e}`, { cause: e }));
                    }
                }
            }
        }
        return errors;
    }
    public async importFromDataURI(dataURI: string): Promise<OreUICustomizerTheme> {
        if (!dataURI.startsWith("data:")) throw new ReferenceError(`Invalid data URI: ${dataURI}`);
        const dataURIMIMEType: string | undefined = dataURI.split(/[,;]/g)[0]?.split(":")[1];
        switch (dataURIMIMEType) {
            case "application/json":
            case "text/json":
            case "text/plain": {
                const request = new XMLHttpRequest();
                request.open("GET", dataURI, false);
                request.setRequestHeader("Content-Type", dataURIMIMEType);
                request.send();
                const themeData = CommentJSON.parse(request.responseText, null, true) as any;
                throw new Error("JSON-based themes are not implemented.");
                break;
            }
            case "application/octet-stream":
            case "application/ouictheme": {
                /**
                 * The zip file system.
                 */
                const zipFs: zip.FS = new zip.fs.FS();
                try {
                    await zipFs.importData64URI(dataURI);
                } catch (e) {
                    createToast({
                        image: "resource://images/ui/misc/bug_pack_icon.png",
                        title: "Failed to import theme from data URI",
                        message: "Not a valid zip archive",
                        onClick(_event): void {
                            router.history.push(
                                `/theme-details?${new URLSearchParams(
                                    {} as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ThemeDetails]>
                                ).toString()}`
                            );
                        },
                    });
                    throw e;
                }
                const manifest: ThemeManifestJSON = CommentJSON.parse(
                    await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(),
                    null,
                    true
                ) as any;
                // REVIEW: Maybe this should check plugins and configs too.
                if (this.getThemeFromUUIDAndVersion(manifest.header.uuid, manifest.header.version)) {
                    createToast({
                        image:
                            zipFs.getChildByName("pack_icon.png") ?
                                await (zipFs.getChildByName("pack_icon.png") as zip.ZipFileEntry<any, any>).getData64URI("image/png")
                            :   manifest.icon_data_uri || "resource://images/ui/glyphs/brush.png",
                        title: `Failed to import '${manifest.header.name}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                const folderName: string = sanitizeFilename(`${manifest.header.name.slice(0, 25)}-${manifest.header.version}`);
                await addFolderContentsReversed(zipFs.root, path.join(ThemeManager.themesFolder, folderName));
                const theme: OreUICustomizerTheme = new OreUICustomizerTheme(path.join(ThemeManager.themesFolder, folderName));
                this.loadedThemes.push(theme);
                this.emit("themeImported", theme);
                return theme;
            }
            default:
                throw new ReferenceError(
                    `Invalid MIME type: ${dataURIMIMEType}. Must be "application/json", "application/octet-stream", or "application/ouictheme".`
                );
        }
    }
    public async importFromURL(url: string): Promise<OreUICustomizerTheme> {
        const response = await fetch(url);
        const responseMIMEType: string | undefined = response.headers.get("content-type")?.split(";")[0];
        switch (responseMIMEType) {
            case "application/json":
            case "text/json":
            case "text/plain": {
                const themeData = CommentJSON.parse(await response.text(), null, true) as any;
                throw new Error("JSON-based themes are not implemented.");
                break;
            }
            case "application/octet-stream":
            case "application/ouictheme": {
                /**
                 * The zip file system.
                 */
                const zipFs: zip.FS = new zip.fs.FS();
                try {
                    await zipFs.importReadable(response.body!);
                } catch (e) {
                    createToast({
                        image: "resource://images/ui/misc/bug_pack_icon.png",
                        title: `Failed to import '${path.basename(new URL(url).pathname, path.extname(new URL(url).pathname))}'`,
                        message: "Not a valid zip archive",
                        onClick(_event): void {
                            router.history.push(
                                `/theme-details?${new URLSearchParams({} as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ThemeDetails]>).toString()}`
                            );
                        },
                    });
                    throw e;
                }
                const manifest: ThemeManifestJSON = CommentJSON.parse(
                    await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(),
                    null,
                    true
                ) as any;
                // REVIEW: Maybe this should check plugins and configs too.
                if (this.getThemeFromUUIDAndVersion(manifest.header.uuid, manifest.header.version)) {
                    createToast({
                        image:
                            zipFs.getChildByName("pack_icon.png") ?
                                await (zipFs.getChildByName("pack_icon.png") as zip.ZipFileEntry<any, any>).getData64URI("image/png")
                            :   manifest.icon_data_uri || "resource://images/ui/glyphs/brush.png",
                        title: `Failed to import '${manifest.header.name}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                const folderName: string = sanitizeFilename(`${manifest.header.name.slice(0, 25)}-${manifest.header.version}`);
                await addFolderContentsReversed(zipFs.root, path.join(ThemeManager.themesFolder, folderName));
                const theme: OreUICustomizerTheme = new OreUICustomizerTheme(path.join(ThemeManager.themesFolder, folderName));
                this.loadedThemes.push(theme);
                this.emit("themeImported", theme);
                return theme;
            }
            default:
                throw new ReferenceError(
                    `Invalid MIME type: ${responseMIMEType}. Must be "application/json", "application/octet-stream", or "application/ouictheme".`
                );
        }
    }
    public async importFromFilePath(filePath: string): Promise<OreUICustomizerTheme> {
        if (/\.(?:mc)?ouictheme$/i.test(path.basename(filePath).toLowerCase())) {
            /**
             * The zip file system.
             */
            const zipFs: zip.FS = new zip.fs.FS();
            const dataURI = `data:application/octet-stream;base64,${readFileSync(filePath, { encoding: "base64" })}`;
            try {
                await zipFs.importData64URI(dataURI);
            } catch (e) {
                createToast({
                    image: "resource://images/ui/misc/bug_pack_icon.png",
                    title: `Failed to import '${path.basename(filePath, path.extname(filePath))}'`,
                    message: "Not a valid zip archive",
                    onClick(_event): void {
                        router.history.push(
                            `/theme-details?${new URLSearchParams({
                                folderPath: filePath,
                            } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ThemeDetails]>).toString()}`
                        );
                    },
                });
                throw e;
            }
            const manifest: ThemeManifestJSON = CommentJSON.parse(
                await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(),
                null,
                true
            ) as any;
            // REVIEW: Maybe this should check plugins and configs too.
            if (this.getThemeFromUUIDAndVersion(manifest.header.uuid, manifest.header.version)) {
                createToast({
                    image:
                        zipFs.getChildByName("pack_icon.png") ?
                            await (zipFs.getChildByName("pack_icon.png") as zip.ZipFileEntry<any, any>).getData64URI("image/png")
                        :   manifest.icon_data_uri || "resource://images/ui/glyphs/brush.png",
                    title: `Failed to import '${manifest.header.name}'`,
                    message: "Duplicate pack detected",
                });
                throw new ReferenceError("Duplicate pack detected.");
            }
            const folderName: string = sanitizeFilename(`${manifest.header.name.slice(0, 25)}-${manifest.header.version}`);
            await addFolderContentsReversed(zipFs.root, path.join(ThemeManager.themesFolder, folderName));
            const theme: OreUICustomizerTheme = new OreUICustomizerTheme(path.join(ThemeManager.themesFolder, folderName));
            this.loadedThemes.push(theme);
            this.emit("themeImported", theme);
            return theme;
        }
        throw new ReferenceError(`Invalid file type: ${path.extname(filePath)}. Must be ".ouictheme" or ".mcouictheme".`);
    }
})();

ThemeManager.on("themeImported", (importedTheme: OreUICustomizerTheme): void => {
    createToast({
        title: `Successfully imported '${importedTheme.name}'`,
        image: importedTheme.icon || "resource://images/ui/glyphs/brush.png",
    });
});

const loadThemesErrors: Error[] = ThemeManager.loadThemes();
if (loadThemesErrors.length > 0) console.error(loadThemesErrors);
