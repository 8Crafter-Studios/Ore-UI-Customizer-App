// @ts-nocheck
/**
 * src/utils/PluginManager.ts
 * @module
 * @description A file containing the PluginManager class.
 * @supports Renderer
 */
import path from "node:path";
import fs, { type Dirent } from "node:fs";
import { APP_DATA_FOLDER_PATH, PLUGIN_FOLDER_PATH } from "./URLs.ts";
import type { EncodedPluginData, PluginAction, PluginManifestJSON } from "./ore-ui-customizer-assets.ts";

/**
 * A class for managing plugins.
 *
 * @hideconstructor
 */
export class PluginManager {
    private static readonly pluginsPath: string = path.join(APP_DATA_FOLDER_PATH, PLUGIN_FOLDER_PATH);
    private constructor() {}
    private static readContentsOfPluginsFolder(): string[] {
        return fs.readdirSync(this.pluginsPath, {
            withFileTypes: true
        }).filter((dirent: Dirent<string>): boolean => dirent.isFile()).map((dirent: Dirent<string>): string => dirent.name);
    }
    public static importPluginFromURL(url: string): void {
        throw new Error("Method not implemented.");
    }
    public static importPluginFromFilePath(filePath: string): void {
        throw new Error("Method not implemented.");
    }
    public static importPluginFromDataURI(dataURI: string): void {
        throw new Error("Method not implemented.");
    }
}

export class Plugin {
    /**
     * The source of the plugin.
     */
    public readonly source: { type: "url" | "filePath" | "dataURI"; value: string };
    /**
     * The display name of the plugin.
     */
    public readonly name: string;
    /**
     * The id of the plugin, used to identify the plugin when applying the plugins, also used to identify the plugin in error messages, this should be unique.
     *
     * Must consist only of alphanumeric characters, underscores, hyphens, and periods.
     */
    public readonly id: string;
    /**
     * The UUID of the plugin, used to uniquely identify the plugin.
     *
     * Must be a valid UUID.
     *
     * @example "39a5d251-b6e0-47db-92d1-317eaa7dfe44"
     */
    public readonly uuid: string;
    /**
     * The namespace of the plugin, used to identify the plugin in error messages.
     *
     * Must consist only of alphanumeric characters, underscores, hyphens, and periods.
     *
     * Must not be `built-in`, as it is reserved for built-in plugins.
     */
    public readonly namespace: string;
    /**
     * An optional description of the plugin.
     */
    public readonly description?: string;
    /**
     * The version of the plugin.
     *
     * This must be a valid semver string, without the leading `v`.
     *
     * @example "3.17.4-preview.20+BUILD.5"
     */
    public readonly version: string;
    /**
     * The version of 8Crafter's Ore UI Customizer that this plugin is made for.
     *
     * This must be a valid semver string, without the leading `v`.
     *
     * @example "1.0.0"
     */
    public readonly format_version: string;
    /**
     * The minimum version of 8Crafter's Ore UI Customizer that this plugin is compatible with.
     *
     * This must be a valid semver string, without the leading `v`.
     *
     * If not specified, no check will be done.
     *
     * @example "1.0.0"
     */
    public readonly min_engine_version?: string;
    /**
     * The dependencies of the plugin.
     */
    public readonly dependencies?: (
        | {
              /**
               * The UUID of the plugin dependency.
               *
               * Must be a valid UUID.
               *
               * May also be the UUID of a built-in plugin to force the user to have it enabled to use the plugin.
               *
               * @example "39a5d251-b6e0-47db-92d1-317eaa7dfe44"
               */
              uuid: string;
              /**
               * The version of the plugin dependency.
               *
               * Must be a valid semver string, without the leading `v`.
               *
               * @example "3.17.4-preview.20+BUILD.5"
               */
              version: string;
          }
        | {
              /**
               * The name of a built-in module.
               *
               * @todo This is currently not functional.
               */
              module_name: string;
              /**
               * The version of the module dependency.
               *
               * Must be a valid semver string, without the leading `v`.
               *
               * @example "3.17.4-preview.20+BUILD.5"
               */
              version: string;
          }
    )[];
    /**
     * Additonal metadata about the plugin.
     */
    public readonly metadata?: {
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
         * The type of the plugin.
         *
         * @example "plugin"
         */
        product_type?: "plugin";
        /**
         * The license of the plugin
         */
        license?: string;
        /**
         * Any other metadata you want to add.
         */
        [key: string]: unknown;
    };
    /**
     * The actions of the plugin.
     */
    public readonly actions: PluginAction[];
    /**
     * The file type of the plugin.
     */
    public readonly fileType?: "js" | "mcouicplugin" | "folder" | "manifestJSON";
    private constructor(
        source: { type: "url" | "filePath" | "dataURI"; value: string },
        data: import("./ore-ui-customizer-assets.ts").Plugin & Pick<EncodedPluginData, "fileType">
    ) {
        this.source = source;
        ({
            name: this.name,
            id: this.id,
            uuid: this.uuid,
            namespace: this.namespace,
            description: this.description,
            version: this.version,
            format_version: this.format_version,
            min_engine_version: this.min_engine_version,
            dependencies: this.dependencies,
            metadata: this.metadata,
            actions: this.actions,
            fileType: this.fileType,
        } = data);
    }
    public toJSON(): EncodedPluginData {
        return undefined!;
    }
    public static fromURL(url: string): Plugin {
        return undefined!;
    }
    public static async fromFilePath(filePath: string): Promise<Plugin | undefined> {
        if (/\.js$/.test(filePath)) {
            if (!fs.existsSync(filePath)) return undefined;
            const data: { plugin: import("./ore-ui-customizer-assets.ts").Plugin } = require(filePath);
            const plugin: Plugin = new Plugin({ type: "filePath", value: filePath }, { ...data.plugin, fileType: "js" });
            return plugin;
        } else if (/\.json$/.test(filePath)) {
            if (!fs.existsSync(filePath)) return undefined;
            const manifestData: PluginManifestJSON = require(filePath);
            const data: { plugin: import("./ore-ui-customizer-assets.ts").PluginEntryScriptPlugin } = require(path.join(filePath, "../", manifestData.entry));
            const plugin: Plugin = new Plugin({ type: "filePath", value: filePath }, { ...manifestData, ...manifestData.header, ...data.plugin, fileType: "mcouicplugin" });
            return plugin;
        } else {
            if (!fs.existsSync(path.join(filePath, "manifest.json"))) return undefined;
            const manifestData: PluginManifestJSON = require(path.join(filePath, "manifest.json"));
            const data: { plugin: import("./ore-ui-customizer-assets.ts").PluginEntryScriptPlugin } = require(path.join(filePath, manifestData.entry));
            const plugin: Plugin = new Plugin({ type: "filePath", value: filePath }, { ...manifestData, ...manifestData.header, ...data.plugin, fileType: "mcouicplugin" });
            return plugin;
        }
    }
    public static fromDataURI(dataURI: string): Plugin {
        return undefined!;
    }
}
