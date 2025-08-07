/**
 * src/utils/ThemeManager.ts
 * @module
 * @description A file containing the ThemeManager class.
 * @supports Renderer
 */
import path from "node:path";
import { APP_DATA_FOLDER_PATH, THEME_FOLDER_PATH } from "./URLs.ts";
import EventEmitter from "node:events";
import { Dirent, existsSync, readdirSync, readFileSync } from "node:fs";
import * as CommentJSON from "comment-json";
import type { OreUICustomizerSettings, ThemeManifestJSON } from "./ore-ui-customizer-assets.ts";
import { sanitizeFilename } from "./sanitize-filename.ts";
import { addFolderContentsReversed } from "./folderContentsUtils.ts";
import "./zip.js";

interface ThemeManagerEventMap {
    themeImported: [newTheme: OreUICustomizerTheme];
    themeRemoved: [removedTheme: OreUICustomizerTheme];
}

export class OreUICustomizerTheme implements Omit<ThemeManifestJSON, "format_version" | "header">, Omit<ThemeManifestJSON["header"], ""> {
    /**
     * The path to the folder containing the theme.
     */
    public readonly folderPath: string;
    /**
     * The display name of the theme.
     */
    public readonly name: string;
    /**
     * The id of the theme, used to identify the theme when applying the themes, also used to identify the theme in error messages, this should be unique.
     *
     * Must consist only of alphanumeric characters, underscores, hyphens, and periods.
     */
    public readonly id: string;
    /**
     * The UUID of the theme, used to uniquely identify the theme.
     *
     * Must be a valid UUID.
     *
     * @example "39a5d251-b6e0-47db-92d1-317eaa7dfe44"
     */
    public readonly uuid: string;
    /**
     * An optional description of the theme.
     */
    public readonly description?: string;
    /**
     * The version of the theme.
     *
     * This must be a valid semver string, without the leading `v`.
     *
     * @example "3.17.4-preview.20+BUILD.5"
     */
    public readonly version: string;
    /**
     * The version of 8Crafter's Ore UI Customizer that this theme is made for.
     *
     * This must be a valid semver string, without the leading `v`.
     *
     * @example "1.0.0"
     */
    public readonly format_version: string;
    /**
     * The dependencies of the theme.
     *
     * These dependencies can be other themes or plugins.
     */
    public readonly dependencies?: {
        /**
         * The UUID of the theme or plugin dependency.
         *
         * Must be a valid UUID.
         *
         * May also be the UUID of a built-in theme or plugin to force the user to have it enabled to use the theme.
         *
         * @example "39a5d251-b6e0-47db-92d1-317eaa7dfe44"
         */
        uuid: string;
        /**
         * The version of the theme or plugin dependency.
         *
         * Must be a valid semver string, without the leading `v`.
         *
         * @example "3.17.4-preview.20+BUILD.5"
         */
        version: string;
    }[];
    /**
     * Additonal metadata about the theme.
     */
    public readonly metadata: {
        /**
         * The authors of the theme.
         *
         * @example ["8Crafter", "StormStqr"]
         */
        authors?: string[];
        /**
         * The URL of the website for the theme, or just the theme creator's website.
         *
         * @example "https://www.8crafter.com"
         */
        url?: string;
        /**
         * The product type.
         *
         * @example "theme"
         */
        product_type: "theme";
        /**
         * The license of the theme.
         */
        license?: string;
        /**
         * Any other metadata you want to add.
         */
        [key: string]: unknown;
    };
    public readonly checkForUpdatesDetails?: ThemeManifestJSON["checkForUpdatesDetails"];
    public readonly marketplaceDetails?: ThemeManifestJSON["marketplaceDetails"];
    /**
     * The data URI of the icon of the plugin.
     */
    public readonly icon?: `data:image/${string};base64,${string}` | undefined;
    public constructor(folderPath: string) {
        this.folderPath = folderPath;
        const manifest: ThemeManifestJSON = CommentJSON.parse(readFileSync(path.join(folderPath, "manifest.json"), { encoding: "utf-8" }), null, true) as any;
        this.name = manifest.header.name;
        this.id = manifest.header.id;
        this.uuid = manifest.header.uuid;
        this.description = manifest.header.description;
        this.version = manifest.header.version;
        this.format_version = manifest.header.format_version;
        this.dependencies = manifest.dependencies;
        this.metadata = manifest.metadata;
        this.checkForUpdatesDetails = manifest.checkForUpdatesDetails;
        this.marketplaceDetails = manifest.marketplaceDetails;
        if (existsSync(path.join(folderPath, "pack_icon.png"))) {
            this.icon = `data:image/png;base64,${readFileSync(path.join(folderPath, "pack_icon.png"), { encoding: "base64" })}`;
        } else {
            this.icon = manifest.icon_data_uri ?? undefined;
        }
    }
    public getContents(): Dirent<string>[] {
        return readdirSync(this.folderPath, { withFileTypes: true, recursive: true });
    }
    public getAssets(): string[] {
        return readdirSync(path.join(this.folderPath, "assets"), { withFileTypes: true, recursive: true })
            .filter((content: Dirent<string>): boolean => content.isFile())
            .map((content: Dirent<string>): string => path.join(path.relative(this.folderPath, content.parentPath), content.name));
    }
    public getStyleSheets(): string[] {
        return readdirSync(path.join(this.folderPath, "stylesheets"), { withFileTypes: true, recursive: true })
            .filter((content: Dirent<string>): boolean => content.isFile())
            .map((content: Dirent<string>): string => path.join(path.relative(this.folderPath, content.parentPath), content.name));
    }
    public getColorReplacements(): OreUICustomizerSettings["colorReplacements"] | undefined {
        return existsSync(path.join(this.folderPath, "color-replacements.json"))
            ? (CommentJSON.parse(readFileSync(path.join(this.folderPath, "color-replacements.json"), { encoding: "utf-8" }), null, true) as any)
            : undefined;
    }
}

export const ThemeManager = new (class ThemeManager extends EventEmitter<ThemeManagerEventMap> {
    public static readonly themesFolder: string = path.join(APP_DATA_FOLDER_PATH, THEME_FOLDER_PATH);
    public loadedThemes: OreUICustomizerTheme[] = [];
    public constructor() {
        super();
        this.setMaxListeners(1000000);
        this.loadThemes();
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
                await zipFs.importData64URI(dataURI);
                const manifest: ThemeManifestJSON = CommentJSON.parse(
                    await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(),
                    null,
                    true
                ) as any;
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
                await zipFs.importReadable(response.body!);
                const manifest: ThemeManifestJSON = CommentJSON.parse(
                    await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(),
                    null,
                    true
                ) as any;
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
            await zipFs.importData64URI(readFileSync(filePath, { encoding: "base64" }));
            const manifest: ThemeManifestJSON = CommentJSON.parse(
                await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(),
                null,
                true
            ) as any;
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
