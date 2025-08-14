/**
 * src/utils/PluginManager.ts
 * @module
 * @description A file containing the PluginManager class.
 * @supports Renderer
 */
import path from "node:path";
import { APP_DATA_FOLDER_PATH, PLUGIN_FOLDER_PATH } from "./URLs.ts";
import EventEmitter from "node:events";
import { Dirent, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import * as CommentJSON from "comment-json";
import {
    blobToDataURI,
    type EncodedPluginData,
    type OreUICustomizerSettings,
    type Plugin as Plugin_Type,
    type PluginManifestJSON,
} from "./ore-ui-customizer-assets.ts";
import { sanitizeFilename } from "./sanitize-filename.ts";
import { addFolderContents, addFolderContentsReversed } from "./folderContentsUtils.ts";
import { app, dialog } from "@electron/remote";
import type { MessageBoxReturnValue } from "electron";
import "./zip.js";
import { createToast } from "../../app/components/Toast.tsx";

interface PluginManagerEventMap {
    pluginImported: [newPlugin: OreUICustomizerPlugin];
    pluginRemoved: [removedPlugin: OreUICustomizerPlugin];
    pluginRefreshed: [refreshedPlugin: OreUICustomizerPlugin];
    activePluginsChanged: [activePlugins: (OreUICustomizerPlugin | PluginInfo)[]];
}

export type OreUICustomizerPluginDependencyData = NonNullable<OreUICustomizerPlugin["dependencies"]>[number];

export type OreUICustomizerPluginNonModuleDependencyData = Exclude<OreUICustomizerPluginDependencyData, { module_name: string }>;

export interface MissingOreUICustomizerPluginDependencyData extends OreUICustomizerPluginNonModuleDependencyData {
    missingType: "noMatchingUUID" | "noMatchingVersion";
}

export interface OreUICustomizerPluginMessageInfo<T extends "info" | "warning" | "error" = "info" | "warning" | "error"> {
    plugin: OreUICustomizerPlugin;
    messageFormat: "text" | "html";
    message: string;
    titleFormat?: "text" | "html";
    title?: string;
    type: T;
    cause?: unknown;
}

export class OreUICustomizerPlugin implements Omit<Plugin_Type, "actions"> {
    #manifest: PluginManifestJSON;
    /**
     * The path to the folder containing the plugin.
     */
    public readonly folderPath: string;
    /**
     * The ID used to uniquely identify the plugin from the other imported plugins.
     *
     * This is the name of the folder containing the plugin.
     */
    public readonly pluginID: string;
    /**
     * The display name of the plugin.
     */
    public get name(): string {
        return this.#manifest.header.name;
    }
    /**
     * The id of the plugin, used to identify the plugin when applying the plugins, also used to identify the plugin in error messages, this should be unique.
     *
     * Must consist only of alphanumeric characters, underscores, hyphens, and periods.
     */
    public get id(): string {
        return this.#manifest.header.id;
    }
    /**
     * The UUID of the plugin, used to uniquely identify the plugin.
     *
     * Must be a valid UUID.
     *
     * @example "39a5d251-b6e0-47db-92d1-317eaa7dfe44"
     */
    public get uuid(): string {
        return this.#manifest.header.uuid;
    }
    /**
     * The namespace of the plugin, used to identify the plugin in error messages.
     *
     * Must consist only of alphanumeric characters, underscores, hyphens, and periods.
     *
     * Must not be `built-in`, as it is reserved for built-in plugins.
     */
    public get namespace(): string {
        return this.#manifest.header.namespace;
    }
    /**
     * An optional description of the plugin.
     */
    public get description(): string | undefined {
        return this.#manifest.header.description;
    }
    /**
     * The version of the plugin.
     *
     * This must be a valid semver string, without the leading `v`.
     *
     * @example "3.17.4-preview.20+BUILD.5"
     */
    public get version(): string {
        return this.#manifest.header.version;
    }
    /**
     * The version of 8Crafter's Ore UI Customizer that this plugin is made for.
     *
     * This must be a valid semver string, without the leading `v`.
     *
     * @example "1.0.0"
     */
    public get format_version(): string {
        return this.#manifest.header.format_version;
    }
    /**
     * The minimum version of 8Crafter's Ore UI Customizer that this plugin is compatible with.
     *
     * This must be a valid semver string, without the leading `v`.
     *
     * If not specified, no check will be done.
     *
     * @example "1.0.0"
     */
    public get min_engine_version(): string | undefined {
        return this.#manifest.header.min_engine_version;
    }
    /**
     * The entry script of the plugin.
     *
     * Should be a path to a JavaScript file, relative to the location of the manifest.json file.
     *
     * @example "scripts/index.js"
     */
    public get entry(): string | undefined {
        return this.#manifest.entry;
    }
    /**
     * The dependencies of the plugin.
     *
     * These dependencies can be other plugins or plugins.
     */
    public get dependencies(): PluginManifestJSON["dependencies"] | undefined {
        return this.#manifest.dependencies;
    }
    /**
     * Additonal metadata about the plugin.
     */
    public get metadata(): {
        /**
         * The authors of the plugin.
         *
         * @example ["8Crafter", "StormStqr"]
         */
        authors?: string[];
        /**
         * The URL of the website for the plugin, or just the plugin creator's website.
         *
         * @example "https://www.8crafter.com"
         */
        url?: string;
        /**
         * The product type.
         *
         * @example "plugin"
         */
        product_type: "plugin";
        /**
         * The license of the plugin.
         */
        license?: string;
        /**
         * Any other metadata you want to add.
         */
        [key: string]: unknown;
    } {
        return this.#manifest.metadata;
    }
    public get checkForUpdatesDetails(): PluginManifestJSON["checkForUpdatesDetails"] | undefined {
        return this.#manifest.checkForUpdatesDetails;
    }
    public get marketplaceDetails(): PluginManifestJSON["marketplaceDetails"] | undefined {
        return this.#manifest.marketplaceDetails;
    }
    /**
     * The data URI of the icon of the plugin.
     */
    public icon?: `data:image/${string};base64,${string}` | undefined;
    public constructor(folderPath: string) {
        this.folderPath = path.resolve(folderPath);
        this.#manifest = CommentJSON.parse(readFileSync(path.join(folderPath, "manifest.json"), { encoding: "utf-8" }), null, true) as any;
        this.pluginID = path.basename(this.folderPath);
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
        T2 extends "info" | "warning" | "error" = T extends "all" ? "info" | "warning" | "error" : T[number]
    >(types: T = "all" as T): OreUICustomizerPluginMessageInfo<T2>[] {
        const messages: OreUICustomizerPluginMessageInfo[] = [];
        if (types === "all") return messages as OreUICustomizerPluginMessageInfo<T2>[];
        return messages.filter((message: OreUICustomizerPluginMessageInfo): message is OreUICustomizerPluginMessageInfo<T2> =>
            types.includes(message.type as T2)
        );
    }
    public getMissingDependencies(): [MissingOreUICustomizerPluginDependencyData, ...MissingOreUICustomizerPluginDependencyData[]] | undefined {
        if (!this.dependencies) return undefined;
        const list: MissingOreUICustomizerPluginDependencyData[] = this.dependencies
            .map((dependency: OreUICustomizerPluginDependencyData): MissingOreUICustomizerPluginDependencyData | undefined =>
                "uuid" in dependency
                    ? PluginManager.getPluginFromUUIDAndVersion(dependency.uuid, dependency.version)
                        ? undefined
                        : PluginManager.getPluginFromUUID(dependency.uuid)
                        ? { ...dependency, missingType: "noMatchingVersion" }
                        : { ...dependency, missingType: "noMatchingUUID" }
                    : undefined
            )
            .filter(
                (
                    dependency:
                        | (NonNullable<OreUICustomizerPlugin["dependencies"]>[number] & { missingType: "noMatchingUUID" | "noMatchingVersion" })
                        | undefined
                ): boolean => dependency !== undefined
            ) as MissingOreUICustomizerPluginDependencyData[];
        return list.length > 0 ? (list as [MissingOreUICustomizerPluginDependencyData, ...MissingOreUICustomizerPluginDependencyData[]]) : undefined;
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
    public async toEncodedPluginData(): Promise<EncodedPluginData> {
        return {
            dataURI: (await this.getZipDataURI()) as `data:application/zip;base64,${string}`,
            fileType: "mcouicplugin",
            format_version: this.format_version,
            id: this.id,
            metadata: {
                ...this.metadata,
                product_type: "plugin",
            },
            name: this.name,
            namespace: this.namespace,
            uuid: this.uuid,
            version: this.version,
            dependencies: this.dependencies,
            description: this.description,
            min_engine_version: this.min_engine_version,
        };
    }
    public toJSON(): PluginInfo {
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
        PluginManager.emit("pluginRefreshed", this);
    }
    public delete(): void {
        if (existsSync(this.folderPath)) {
            rmSync(this.folderPath, { recursive: true, force: true });
            if (PluginManager.loadedPlugins.includes(this)) {
                PluginManager.loadedPlugins.splice(PluginManager.loadedPlugins.indexOf(this), 1);
            }
            PluginManager.emit("pluginRemoved", this);
        }
    }
}

export interface PluginInfo {
    name?: string;
    metadata?: Partial<OreUICustomizerPlugin["metadata"]>;
    uuid: string;
    version: string;
}

export interface MissingPluginInfo extends PluginInfo {
    missingType: "noMatchingUUID" | "noMatchingVersion";
}

export const PluginManager = new (class PluginManager extends EventEmitter<PluginManagerEventMap> {
    public static readonly pluginsFolder: string = path.join(APP_DATA_FOLDER_PATH, PLUGIN_FOLDER_PATH);
    public loadedPlugins: OreUICustomizerPlugin[] = [];
    public constructor() {
        super();
        this.setMaxListeners(1000000);
    }
    public getPluginFromFolderPath(folderPath: string): OreUICustomizerPlugin | undefined {
        folderPath = path.resolve(folderPath);
        if (!existsSync(folderPath)) return undefined;
        let plugin: OreUICustomizerPlugin | undefined = this.loadedPlugins.find((plugin: OreUICustomizerPlugin): boolean => plugin.folderPath === folderPath);
        if (!plugin) {
            plugin = new OreUICustomizerPlugin(folderPath);
            this.loadedPlugins.push(plugin);
        }
        return plugin;
    }
    public getPluginFromUUID(uuid: string): OreUICustomizerPlugin | undefined {
        return this.loadedPlugins.find((plugin: OreUICustomizerPlugin): boolean => plugin.uuid === uuid);
    }
    public getPluginFromUUIDAndVersion(uuid: string, version: string): OreUICustomizerPlugin | undefined {
        return this.loadedPlugins.find((plugin: OreUICustomizerPlugin): boolean => plugin.uuid === uuid && plugin.version === version);
    }
    public getActivePlugins<E extends boolean = false>(
        excludeMissing?: E
    ): E extends true ? OreUICustomizerPlugin[] : (OreUICustomizerPlugin | MissingPluginInfo)[] {
        if (!existsSync(path.join(APP_DATA_FOLDER_PATH, "active_plugins.json"))) {
            writeFileSync(path.join(APP_DATA_FOLDER_PATH, "active_plugins.json"), JSON.stringify([], null, 4), { encoding: "utf-8" });
        }
        const activePlugins: PluginInfo[] = CommentJSON.parse(
            readFileSync(path.join(APP_DATA_FOLDER_PATH, "active_plugins.json"), { encoding: "utf-8" }),
            null,
            true
        ) as any;
        return activePlugins
            .map(
                (plugin: PluginInfo): E extends true ? OreUICustomizerPlugin | undefined : OreUICustomizerPlugin | MissingPluginInfo =>
                    (this.loadedPlugins.find(
                        (loadedPlugin: OreUICustomizerPlugin): boolean => loadedPlugin.uuid === plugin.uuid && loadedPlugin.version === plugin.version
                    ) ??
                        (excludeMissing
                            ? undefined
                            : this.loadedPlugins.some((loadedPlugin: OreUICustomizerPlugin): boolean => loadedPlugin.uuid === plugin.uuid)
                            ? { ...plugin, missingType: "noMatchingVersion" }
                            : { ...plugin, missingType: "noMatchingUUID" })) as E extends true
                        ? OreUICustomizerPlugin | undefined
                        : OreUICustomizerPlugin | MissingPluginInfo
            )
            .filter(
                (
                    plugin: E extends true ? OreUICustomizerPlugin | undefined : OreUICustomizerPlugin | MissingPluginInfo
                ): plugin is E extends true ? OreUICustomizerPlugin : OreUICustomizerPlugin => !!plugin
            );
    }
    public setActivePlugins(activePlugins: (OreUICustomizerPlugin | PluginInfo)[]): void {
        const parsedActivePlugins: (OreUICustomizerPlugin | PluginInfo)[] = activePlugins.map(
            (v: OreUICustomizerPlugin | PluginInfo): OreUICustomizerPlugin | PluginInfo =>
                v instanceof OreUICustomizerPlugin
                    ? v
                    : (Object.fromEntries(Object.entries(v).filter(([key]: [key: string, value: any]): boolean => key !== "missingType")) as PluginInfo)
        );
        writeFileSync(path.join(APP_DATA_FOLDER_PATH, "active_plugins.json"), JSON.stringify(parsedActivePlugins, null, 4), { encoding: "utf-8" });
        this.emit("activePluginsChanged", this.getActivePlugins());
    }
    public getInactivePlugins(): OreUICustomizerPlugin[] {
        const activePlugins: (OreUICustomizerPlugin | PluginInfo)[] = this.getActivePlugins();
        return this.loadedPlugins.filter((v: OreUICustomizerPlugin): boolean => !activePlugins.includes(v));
    }
    public loadPlugins(): Error[] {
        const errors: Error[] = [];
        for (const plugin of readdirSync(path.join(APP_DATA_FOLDER_PATH, PLUGIN_FOLDER_PATH), { withFileTypes: true })) {
            if (plugin.isDirectory()) {
                const folderPath: string = path.join(APP_DATA_FOLDER_PATH, PLUGIN_FOLDER_PATH, plugin.name);
                if (!existsSync(path.join(folderPath, "manifest.json"))) continue;
                if (this.loadedPlugins.some((loadedPlugin: OreUICustomizerPlugin): boolean => loadedPlugin.folderPath === folderPath)) {
                    this.loadedPlugins.splice(
                        this.loadedPlugins.findIndex((loadedPlugin: OreUICustomizerPlugin): boolean => loadedPlugin.folderPath === folderPath),
                        1
                    );
                }
                try {
                    this.loadedPlugins.push(new OreUICustomizerPlugin(folderPath));
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
    public async importFromDataURI(dataURI: string, bypassPrompt: boolean = config.bypassImportJSPluginPrompt): Promise<OreUICustomizerPlugin> {
        if (!dataURI.startsWith("data:")) throw new ReferenceError(`Invalid data URI: ${dataURI}`);
        const dataURIMIMEType: string | undefined = dataURI.split(/[,;]/g)[0]?.split(":")[1]?.toLowerCase();
        switch (dataURIMIMEType) {
            case "application/javascript":
            case "text/javascript":
            case "text/plain": {
                if (!bypassPrompt) {
                    const result: MessageBoxReturnValue = await dialog.showMessageBox(getCurrentWindow(), {
                        type: "question",
                        buttons: ["Confirm", "Cancel"],
                        defaultId: 1,
                        cancelId: 1,
                        message: "Are you sure you want to import this plugin? Make sure you trust the source.",
                        noLink: true,
                        title: "Confirm Import",
                        checkboxChecked: false,
                        checkboxLabel: "Don't ask again",
                    });
                    if (result.response === 1) {
                        throw new Error("Cancelled by user.");
                    }
                    if (result.checkboxChecked) {
                        config.bypassImportJSPluginPrompt = true;
                    }
                }
                const request = new XMLHttpRequest();
                request.open("GET", dataURI, false);
                request.setRequestHeader("Content-Type", dataURIMIMEType);
                request.send();
                const pluginData: Omit<Plugin_Type, "actions"> = await getCurrentWindow().webContents.executeJavaScriptInIsolatedWorld(9999, [
                    {
                        code: `import("data:${dataURIMIMEType};base64,${btoa(request.responseText)}").then((pluginModule) => {
    const plugin = pluginModule.plugin;
    return {
        name: plugin.name,
        id: plugin.id,
        uuid: plugin.uuid,
        namespace: plugin.namespace,
        description: plugin.description,
        version: plugin.version,
        format_version: plugin.format_version,
        min_engine_version: plugin.min_engine_version,
        dependencies: plugin.dependencies,
        metadata: plugin.metadata,,
        icon_data_uri: plugin.icon_data_uri
    };
});`,
                    },
                ]);
                const manifestData: PluginManifestJSON = {
                    entry: "scripts/index.js",
                    format_version: 1,
                    header: {
                        name: pluginData.name,
                        id: pluginData.id,
                        uuid: pluginData.uuid,
                        namespace: pluginData.namespace,
                        description: pluginData.description,
                        version: pluginData.version,
                        format_version: pluginData.format_version,
                        min_engine_version: pluginData.min_engine_version,
                    },
                    metadata: {
                        product_type: "plugin",
                        ...pluginData.metadata,
                    },
                    dependencies: pluginData.dependencies,
                    icon_data_uri: pluginData.icon_data_uri,
                };
                if (this.getPluginFromUUIDAndVersion(manifestData.header.uuid, manifestData.header.version)) {
                    createToast({
                        image: manifestData.icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${manifestData.header.name}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                const folderName: string = sanitizeFilename(`${manifestData.header.name.slice(0, 25)}-${manifestData.header.version}`);
                mkdirSync(path.join(PluginManager.pluginsFolder, folderName), { recursive: true });
                writeFileSync(path.join(PluginManager.pluginsFolder, folderName, "manifest.json"), JSONB.stringify(manifestData, null, 4));
                mkdirSync(path.join(PluginManager.pluginsFolder, folderName, "scripts"), { recursive: true });
                writeFileSync(path.join(PluginManager.pluginsFolder, folderName, "scripts", "index.js"), request.responseText);
                const plugin: OreUICustomizerPlugin = new OreUICustomizerPlugin(path.join(PluginManager.pluginsFolder, folderName));
                this.loadedPlugins.push(plugin);
                this.emit("pluginImported", plugin);
                return plugin;
            }
            case "application/octet-stream": {
                /**
                 * The zip file system.
                 */
                const zipFs: zip.FS = new zip.fs.FS();
                try {
                    await zipFs.importData64URI(dataURI);
                } catch {
                    if (!bypassPrompt) {
                        const result: MessageBoxReturnValue = await dialog.showMessageBox(getCurrentWindow(), {
                            type: "question",
                            buttons: ["Confirm", "Cancel"],
                            defaultId: 1,
                            cancelId: 1,
                            message: "Are you sure you want to import this plugin? Make sure you trust the source.",
                            noLink: true,
                            title: "Confirm Import",
                            checkboxChecked: false,
                            checkboxLabel: "Don't ask again",
                        });
                        if (result.response === 1) {
                            throw new Error("Cancelled by user.");
                        }
                        if (result.checkboxChecked) {
                            config.bypassImportJSPluginPrompt = true;
                        }
                    }
                    const request = new XMLHttpRequest();
                    request.open("GET", dataURI, false);
                    request.setRequestHeader("Content-Type", dataURIMIMEType);
                    request.send();
                    const pluginData: Omit<Plugin_Type, "actions"> = await getCurrentWindow().webContents.executeJavaScriptInIsolatedWorld(9999, [
                        {
                            code: `import("data:${dataURIMIMEType};base64,${btoa(request.responseText)}").then((pluginModule) => {
    const plugin = pluginModule.plugin;
    return {
        name: plugin.name,
        id: plugin.id,
        uuid: plugin.uuid,
        namespace: plugin.namespace,
        description: plugin.description,
        version: plugin.version,
        format_version: plugin.format_version,
        min_engine_version: plugin.min_engine_version,
        dependencies: plugin.dependencies,
        metadata: plugin.metadata,,
        icon_data_uri: plugin.icon_data_uri
    };
});`,
                        },
                    ]);
                    const manifestData: PluginManifestJSON = {
                        entry: "scripts/index.js",
                        format_version: 1,
                        header: {
                            name: pluginData.name,
                            id: pluginData.id,
                            uuid: pluginData.uuid,
                            namespace: pluginData.namespace,
                            description: pluginData.description,
                            version: pluginData.version,
                            format_version: pluginData.format_version,
                            min_engine_version: pluginData.min_engine_version,
                        },
                        metadata: {
                            product_type: "plugin",
                            ...pluginData.metadata,
                        },
                        dependencies: pluginData.dependencies,
                        icon_data_uri: pluginData.icon_data_uri,
                    };
                    if (this.getPluginFromUUIDAndVersion(manifestData.header.uuid, manifestData.header.version)) {
                        createToast({
                            image: manifestData.icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                            title: `Failed to import '${manifestData.header.name}'`,
                            message: "Duplicate pack detected",
                        });
                        throw new ReferenceError("Duplicate pack detected.");
                    }
                    const folderName: string = sanitizeFilename(`${manifestData.header.name.slice(0, 25)}-${manifestData.header.version}`);
                    mkdirSync(path.join(PluginManager.pluginsFolder, folderName), { recursive: true });
                    writeFileSync(path.join(PluginManager.pluginsFolder, folderName, "manifest.json"), JSONB.stringify(manifestData, null, 4));
                    mkdirSync(path.join(PluginManager.pluginsFolder, folderName, "scripts"), { recursive: true });
                    writeFileSync(path.join(PluginManager.pluginsFolder, folderName, "scripts", "index.js"), request.responseText);
                    const plugin: OreUICustomizerPlugin = new OreUICustomizerPlugin(path.join(PluginManager.pluginsFolder, folderName));
                    this.loadedPlugins.push(plugin);
                    this.emit("pluginImported", plugin);
                    return plugin;
                }
                const manifest: PluginManifestJSON = CommentJSON.parse(
                    await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(),
                    null,
                    true
                ) as any;
                if (this.getPluginFromUUIDAndVersion(manifest.header.uuid, manifest.header.version)) {
                    createToast({
                        image: zipFs.getChildByName("pack_icon.png")
                            ? await (zipFs.getChildByName("pack_icon.png") as zip.ZipFileEntry<any, any>).getData64URI("image/png")
                            : manifest.icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${manifest.header.name}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                const folderName: string = sanitizeFilename(`${manifest.header.name.slice(0, 25)}-${manifest.header.version}`);
                await addFolderContentsReversed(zipFs.root, path.join(PluginManager.pluginsFolder, folderName));
                const plugin: OreUICustomizerPlugin = new OreUICustomizerPlugin(path.join(PluginManager.pluginsFolder, folderName));
                this.loadedPlugins.push(plugin);
                this.emit("pluginImported", plugin);
                return plugin;
            }
            case "application/zip":
            case "application/ouicplugin": {
                /**
                 * The zip file system.
                 */
                const zipFs: zip.FS = new zip.fs.FS();
                await zipFs.importData64URI(dataURI);
                const manifest: PluginManifestJSON = CommentJSON.parse(
                    await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(),
                    null,
                    true
                ) as any;
                if (this.getPluginFromUUIDAndVersion(manifest.header.uuid, manifest.header.version)) {
                    createToast({
                        image: zipFs.getChildByName("pack_icon.png")
                            ? await (zipFs.getChildByName("pack_icon.png") as zip.ZipFileEntry<any, any>).getData64URI("image/png")
                            : manifest.icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${manifest.header.name}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                const folderName: string = sanitizeFilename(`${manifest.header.name.slice(0, 25)}-${manifest.header.version}`);
                await addFolderContentsReversed(zipFs.root, path.join(PluginManager.pluginsFolder, folderName));
                const plugin: OreUICustomizerPlugin = new OreUICustomizerPlugin(path.join(PluginManager.pluginsFolder, folderName));
                this.loadedPlugins.push(plugin);
                this.emit("pluginImported", plugin);
                return plugin;
            }
            default:
                throw new ReferenceError(
                    `Invalid MIME type: ${dataURIMIMEType}. Must be "application/javascript", "text/javascript", "application/octet-stream", "application/zip", or "application/ouicplugin".`
                );
        }
    }
    public async importFromURL(url: string, bypassPrompt: boolean = config.bypassImportJSPluginPrompt): Promise<OreUICustomizerPlugin> {
        const response = await fetch(url);
        const responseMIMEType: string | undefined = response.headers.get("content-type")?.split(";")[0]?.toLowerCase();
        switch (responseMIMEType) {
            case "application/javascript":
            case "text/javascript": {
                if (!bypassPrompt) {
                    const result: MessageBoxReturnValue = await dialog.showMessageBox(getCurrentWindow(), {
                        type: "question",
                        buttons: ["Confirm", "Cancel"],
                        defaultId: 1,
                        cancelId: 1,
                        message: "Are you sure you want to import this plugin? Make sure you trust the source.",
                        noLink: true,
                        title: "Confirm Import",
                        checkboxChecked: false,
                        checkboxLabel: "Don't ask again",
                    });
                    if (result.response === 1) {
                        throw new Error("Cancelled by user.");
                    }
                    if (result.checkboxChecked) {
                        config.bypassImportJSPluginPrompt = true;
                    }
                }
                const responseText: string = await response.text();
                const pluginData: Omit<Plugin_Type, "actions"> = await getCurrentWindow().webContents.executeJavaScriptInIsolatedWorld(9999, [
                    {
                        code: `import("data:${responseMIMEType};base64,${btoa(responseText)}").then((pluginModule) => {
    const plugin = pluginModule.plugin;
    return {
        name: plugin.name,
        id: plugin.id,
        uuid: plugin.uuid,
        namespace: plugin.namespace,
        description: plugin.description,
        version: plugin.version,
        format_version: plugin.format_version,
        min_engine_version: plugin.min_engine_version,
        dependencies: plugin.dependencies,
        metadata: plugin.metadata,,
        icon_data_uri: plugin.icon_data_uri
    };
});`,
                    },
                ]);
                const manifestData: PluginManifestJSON = {
                    entry: "scripts/index.js",
                    format_version: 1,
                    header: {
                        name: pluginData.name,
                        id: pluginData.id,
                        uuid: pluginData.uuid,
                        namespace: pluginData.namespace,
                        description: pluginData.description,
                        version: pluginData.version,
                        format_version: pluginData.format_version,
                        min_engine_version: pluginData.min_engine_version,
                    },
                    metadata: {
                        product_type: "plugin",
                        ...pluginData.metadata,
                    },
                    dependencies: pluginData.dependencies,
                    icon_data_uri: pluginData.icon_data_uri,
                };
                if (this.getPluginFromUUIDAndVersion(manifestData.header.uuid, manifestData.header.version)) {
                    createToast({
                        image: manifestData.icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${manifestData.header.name}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                const folderName: string = sanitizeFilename(`${manifestData.header.name.slice(0, 25)}-${manifestData.header.version}`);
                mkdirSync(path.join(PluginManager.pluginsFolder, folderName), { recursive: true });
                writeFileSync(path.join(PluginManager.pluginsFolder, folderName, "manifest.json"), JSONB.stringify(manifestData, null, 4));
                mkdirSync(path.join(PluginManager.pluginsFolder, folderName, "scripts"), { recursive: true });
                writeFileSync(path.join(PluginManager.pluginsFolder, folderName, "scripts", "index.js"), responseText);
                const plugin: OreUICustomizerPlugin = new OreUICustomizerPlugin(path.join(PluginManager.pluginsFolder, folderName));
                this.loadedPlugins.push(plugin);
                this.emit("pluginImported", plugin);
                return plugin;
            }
            case "application/octet-stream": {
                /**
                 * The zip file system.
                 */
                const zipFs: zip.FS = new zip.fs.FS();
                const blob = await response.blob();
                try {
                    await zipFs.importBlob(blob);
                } catch {
                    if (!bypassPrompt) {
                        const result: MessageBoxReturnValue = await dialog.showMessageBox(getCurrentWindow(), {
                            type: "question",
                            buttons: ["Confirm", "Cancel"],
                            defaultId: 1,
                            cancelId: 1,
                            message: "Are you sure you want to import this plugin? Make sure you trust the source.",
                            noLink: true,
                            title: "Confirm Import",
                            checkboxChecked: false,
                            checkboxLabel: "Don't ask again",
                        });
                        if (result.response === 1) {
                            throw new Error("Cancelled by user.");
                        }
                        if (result.checkboxChecked) {
                            config.bypassImportJSPluginPrompt = true;
                        }
                    }
                    const responseText: string = await blob.text();
                    const pluginData: Omit<Plugin_Type, "actions"> = await getCurrentWindow().webContents.executeJavaScriptInIsolatedWorld(9999, [
                        {
                            code: `import("data:${responseMIMEType};base64,${btoa(responseText)}").then((pluginModule) => {
    const plugin = pluginModule.plugin;
    return {
        name: plugin.name,
        id: plugin.id,
        uuid: plugin.uuid,
        namespace: plugin.namespace,
        description: plugin.description,
        version: plugin.version,
        format_version: plugin.format_version,
        min_engine_version: plugin.min_engine_version,
        dependencies: plugin.dependencies,
        metadata: plugin.metadata,,
        icon_data_uri: plugin.icon_data_uri
    };
});`,
                        },
                    ]);
                    const manifestData: PluginManifestJSON = {
                        entry: "scripts/index.js",
                        format_version: 1,
                        header: {
                            name: pluginData.name,
                            id: pluginData.id,
                            uuid: pluginData.uuid,
                            namespace: pluginData.namespace,
                            description: pluginData.description,
                            version: pluginData.version,
                            format_version: pluginData.format_version,
                            min_engine_version: pluginData.min_engine_version,
                        },
                        metadata: {
                            product_type: "plugin",
                            ...pluginData.metadata,
                        },
                        dependencies: pluginData.dependencies,
                        icon_data_uri: pluginData.icon_data_uri,
                    };
                    if (this.getPluginFromUUIDAndVersion(manifestData.header.uuid, manifestData.header.version)) {
                        createToast({
                            image: manifestData.icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                            title: `Failed to import '${manifestData.header.name}'`,
                            message: "Duplicate pack detected",
                        });
                        throw new ReferenceError("Duplicate pack detected.");
                    }
                    const folderName: string = sanitizeFilename(`${manifestData.header.name.slice(0, 25)}-${manifestData.header.version}`);
                    mkdirSync(path.join(PluginManager.pluginsFolder, folderName), { recursive: true });
                    writeFileSync(path.join(PluginManager.pluginsFolder, folderName, "manifest.json"), JSONB.stringify(manifestData, null, 4));
                    mkdirSync(path.join(PluginManager.pluginsFolder, folderName, "scripts"), { recursive: true });
                    writeFileSync(path.join(PluginManager.pluginsFolder, folderName, "scripts", "index.js"), responseText);
                    const plugin: OreUICustomizerPlugin = new OreUICustomizerPlugin(path.join(PluginManager.pluginsFolder, folderName));
                    this.loadedPlugins.push(plugin);
                    this.emit("pluginImported", plugin);
                    return plugin;
                }
                const manifest: PluginManifestJSON = CommentJSON.parse(
                    await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(),
                    null,
                    true
                ) as any;
                if (this.getPluginFromUUIDAndVersion(manifest.header.uuid, manifest.header.version)) {
                    createToast({
                        image: zipFs.getChildByName("pack_icon.png")
                            ? await (zipFs.getChildByName("pack_icon.png") as zip.ZipFileEntry<any, any>).getData64URI("image/png")
                            : manifest.icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${manifest.header.name}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                const folderName: string = sanitizeFilename(`${manifest.header.name.slice(0, 25)}-${manifest.header.version}`);
                await addFolderContentsReversed(zipFs.root, path.join(PluginManager.pluginsFolder, folderName));
                const plugin: OreUICustomizerPlugin = new OreUICustomizerPlugin(path.join(PluginManager.pluginsFolder, folderName));
                this.loadedPlugins.push(plugin);
                this.emit("pluginImported", plugin);
                return plugin;
            }
            case "application/zip":
            case "application/ouicplugin": {
                /**
                 * The zip file system.
                 */
                const zipFs: zip.FS = new zip.fs.FS();
                await zipFs.importReadable(response.body!);
                const manifest: PluginManifestJSON = CommentJSON.parse(
                    await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(),
                    null,
                    true
                ) as any;
                if (this.getPluginFromUUIDAndVersion(manifest.header.uuid, manifest.header.version)) {
                    createToast({
                        image: zipFs.getChildByName("pack_icon.png")
                            ? await (zipFs.getChildByName("pack_icon.png") as zip.ZipFileEntry<any, any>).getData64URI("image/png")
                            : manifest.icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                        title: `Failed to import '${manifest.header.name}'`,
                        message: "Duplicate pack detected",
                    });
                    throw new ReferenceError("Duplicate pack detected.");
                }
                const folderName: string = sanitizeFilename(`${manifest.header.name.slice(0, 25)}-${manifest.header.version}`);
                await addFolderContentsReversed(zipFs.root, path.join(PluginManager.pluginsFolder, folderName));
                const plugin: OreUICustomizerPlugin = new OreUICustomizerPlugin(path.join(PluginManager.pluginsFolder, folderName));
                this.loadedPlugins.push(plugin);
                this.emit("pluginImported", plugin);
                return plugin;
            }
            default:
                throw new ReferenceError(
                    `Invalid MIME type: ${responseMIMEType}. Must be "application/javascript", "text/javascript", "application/octet-stream", "application/zip", or "application/ouicplugin".`
                );
        }
    }
    public async importFromFilePath(filePath: string, bypassPrompt: boolean = config.bypassImportJSPluginPrompt): Promise<OreUICustomizerPlugin> {
        if (/\.(?:mc)?ouicplugin$/i.test(path.basename(filePath).toLowerCase())) {
            /**
             * The zip file system.
             */
            const zipFs: zip.FS = new zip.fs.FS();
            const dataURI = `data:application/octet-stream;base64,${readFileSync(filePath, { encoding: "base64" })}`;
            await zipFs.importData64URI(dataURI);
            const manifest: PluginManifestJSON = CommentJSON.parse(
                await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText(),
                null,
                true
            ) as any;
            if (this.getPluginFromUUIDAndVersion(manifest.header.uuid, manifest.header.version)) {
                createToast({
                    image: zipFs.getChildByName("pack_icon.png")
                        ? await (zipFs.getChildByName("pack_icon.png") as zip.ZipFileEntry<any, any>).getData64URI("image/png")
                        : manifest.icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                    title: `Failed to import '${manifest.header.name}'`,
                    message: "Duplicate pack detected",
                });
                throw new ReferenceError("Duplicate pack detected.");
            }
            const folderName: string = sanitizeFilename(`${manifest.header.name.slice(0, 25)}-${manifest.header.version}`);
            await addFolderContentsReversed(zipFs.root, path.join(PluginManager.pluginsFolder, folderName));
            const plugin: OreUICustomizerPlugin = new OreUICustomizerPlugin(path.join(PluginManager.pluginsFolder, folderName));
            this.loadedPlugins.push(plugin);
            this.emit("pluginImported", plugin);
            return plugin;
        } else if (path.extname(filePath).toLowerCase() === ".js") {
            if (!bypassPrompt) {
                const result: MessageBoxReturnValue = await dialog.showMessageBox(getCurrentWindow(), {
                    type: "question",
                    buttons: ["Confirm", "Cancel"],
                    defaultId: 1,
                    cancelId: 1,
                    message: "Are you sure you want to import this plugin? Make sure you trust the source.",
                    noLink: true,
                    title: "Confirm Import",
                    checkboxChecked: false,
                    checkboxLabel: "Don't ask again",
                });
                if (result.response === 1) {
                    throw new Error("Cancelled by user.");
                }
                if (result.checkboxChecked) {
                    config.bypassImportJSPluginPrompt = true;
                }
            }
            const scriptText: string = readFileSync(filePath, { encoding: "utf-8" });
            const pluginData: Omit<Plugin_Type, "actions"> = await getCurrentWindow().webContents.executeJavaScriptInIsolatedWorld(9999, [
                {
                    code: `import("data:application/javascript;base64,${btoa(scriptText)}").then((pluginModule) => {
    const plugin = pluginModule.plugin;
    return {
        name: plugin.name,
        id: plugin.id,
        uuid: plugin.uuid,
        namespace: plugin.namespace,
        description: plugin.description,
        version: plugin.version,
        format_version: plugin.format_version,
        min_engine_version: plugin.min_engine_version,
        dependencies: plugin.dependencies,
        metadata: plugin.metadata,
        icon_data_uri: plugin.icon_data_uri
    };
});`,
                },
            ]);
            const manifestData: PluginManifestJSON = {
                entry: "scripts/index.js",
                format_version: 1,
                header: {
                    name: pluginData.name,
                    id: pluginData.id,
                    uuid: pluginData.uuid,
                    namespace: pluginData.namespace,
                    description: pluginData.description,
                    version: pluginData.version,
                    format_version: pluginData.format_version,
                    min_engine_version: pluginData.min_engine_version,
                },
                metadata: {
                    product_type: "plugin",
                    ...pluginData.metadata,
                },
                dependencies: pluginData.dependencies,
                icon_data_uri: pluginData.icon_data_uri,
            };
            if (this.getPluginFromUUIDAndVersion(manifestData.header.uuid, manifestData.header.version)) {
                createToast({
                    image: manifestData.icon_data_uri || "resource://images/ui/glyphs/icon-settings.png",
                    title: `Failed to import '${manifestData.header.name}'`,
                    message: "Duplicate pack detected",
                });
                throw new ReferenceError("Duplicate pack detected.");
            }
            const folderName: string = sanitizeFilename(`${manifestData.header.name.slice(0, 25)}-${manifestData.header.version}`);
            mkdirSync(path.join(PluginManager.pluginsFolder, folderName), { recursive: true });
            writeFileSync(path.join(PluginManager.pluginsFolder, folderName, "manifest.json"), JSONB.stringify(manifestData, null, 4));
            mkdirSync(path.join(PluginManager.pluginsFolder, folderName, "scripts"), { recursive: true });
            writeFileSync(path.join(PluginManager.pluginsFolder, folderName, "scripts", "index.js"), scriptText);
            const plugin: OreUICustomizerPlugin = new OreUICustomizerPlugin(path.join(PluginManager.pluginsFolder, folderName));
            this.loadedPlugins.push(plugin);
            this.emit("pluginImported", plugin);
            return plugin;
        }
        throw new ReferenceError(`Invalid file type: ${path.extname(filePath)}. Must be ".ouicplugin", ".mcouicplugin", or ".js".`);
    }
})();

PluginManager.on("pluginImported", (importedPlugin: OreUICustomizerPlugin): void => {
    createToast({
        title: `Successfully imported '${importedPlugin.metadata.name}'`,
        image: importedPlugin.icon || "resource://images/ui/glyphs/icon-settings.png",
    });
});

const loadPluginsErrors: Error[] = PluginManager.loadPlugins();
if (loadPluginsErrors.length > 0) console.error(loadPluginsErrors);
