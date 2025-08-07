// @ts-nocheck
import { OreUICustomizerSettings } from "../assets/shared/ore-ui-customizer-assets.js";
import "./zip.js";
/**
 * The version of the Ore UI Customizer API.
 */
export declare const format_version = "1.2.1";
/**
 * The result of the {@link applyMods} function.
 */
export interface ApplyModsResult {
    /**
     * The zip file with the mods applied.
     */
    zip: Blob;
    /**
     * The settings used to apply the mods.
     */
    config: OreUICustomizerSettings;
    /**
     * A list of mods that failed.
     */
    allFailedReplaces: {
        [filename: string]: string[];
    };
    /**
     * The number of entries added.
     */
    addedCount: bigint;
    /**
     * The number of entries removed.
     */
    removedCount: bigint;
    /**
     * The number of entries modified.
     */
    modifiedCount: bigint;
    /**
     * The number of entries unmodified.
     */
    unmodifiedCount: bigint;
    /**
     * The number of entries edited.
     */
    editedCount: bigint;
    /**
     * The number of entries renamed.
     */
    renamedCount: bigint;
    /**
     * The total number of entries.
     */
    totalEntries: number;
}
/**
 * The options for the {@link applyMods} function.
 */
export interface ApplyModsOptions {
    /**
     * The settings used to apply the mods.
     *
     * @see {@link OreUICustomizerSettings}
     * @see {@link defaultOreUICustomizerSettings}
     *
     * @default defaultOreUICustomizerSettings
     */
    settings?: OreUICustomizerSettings;
    /**
     * Enable debug logging.
     *
     * @default false
     */
    enableDebugLogging?: boolean;
    /**
     * The base URI or file path to be used to resolve URIs.
     *
     * @default "https://www.8crafter.com/"
     */
    baseURI?: string;
    /**
     * The NodeJS `fs` module to use if the {@link baseURI} option is a file path.
     *
     * @default undefined
     */
    nodeFS?: typeof import("fs");
}
/**
 * Resolves the settings for the {@link applyMods} function, adding in the default values in place of the missing settigns.
 *
 * @param settings The settings to resolve.
 * @returns The resolved settings.
 */
export declare function resolveOreUICustomizerSettings(settings?: {
    [key in keyof OreUICustomizerSettings]?: key extends "colorReplacements" ? Partial<OreUICustomizerSettings["colorReplacements"]> : key extends "enabledBuiltInPlugins" ? Partial<OreUICustomizerSettings["enabledBuiltInPlugins"]> : OreUICustomizerSettings[key];
}): OreUICustomizerSettings;
/**
 * Applies mods to a zip file.
 *
 * @param {Blob} file The zip file to apply mods to.
 * @param {ApplyModsOptions} options The options.
 * @returns {Promise<ApplyModsResult>} A promise resolving to the result.
 */
export declare function applyMods(file: Blob, options?: ApplyModsOptions): Promise<ApplyModsResult>;
