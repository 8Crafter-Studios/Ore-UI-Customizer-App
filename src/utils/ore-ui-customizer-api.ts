import {
    builtInPlugins,
    defaultOreUICustomizerSettings,
    type ExtractedSymbolNames,
    getAssetsDataForThemes,
    getColorReplacementsDataForThemes,
    getExtractedSymbolNames,
    getReplacerRegexes,
    importPluginFromDataURI,
    importThemeFromDataURI,
    type ThemeAssetItem,
    type ThemeAssetsData,
    type ThemeAssetType,
} from "./ore-ui-customizer-assets.js";
import type {
    EncodedPluginData,
    OreUICustomizerConfig_Settings,
    OreUICustomizerSettings,
    Plugin,
    Theme,
    ThemeColorReplacements,
} from "ore-ui-customizer-types";
import type {} from "@ore-ui-customizer-api/plugin-env/backend";
import "./zip.js";
// import json5 from "json5";

// IDEA: Add supports for the texts folder for translation strings for plugins, configs, and themes.

/**
 * The version of the Ore UI Customizer API.
 */
// BUILD 11
export const format_version = "1.17.0+BUILD.11";

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
    allFailedReplaces: { [filename: string]: string[] };
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

// /**
//  * @todo
//  */
// export type ApplyModsProgressStep = "importing_zip_blob" | "importing_plugins" | "importing_themes" | "applying_built-in_mods" | "adding_files" | "plugin_action" | "adding_theme_assets";

// /**
//  * @todo
//  */
// export interface ApplyModsProgressState {
//     step: ApplyModsProgressStep;
//     progress: number;
//     total: number;
//     progressBarMode: "normal" | "none" | "indeterminate" | "error" | "paused";
//     message: string | null;
//     detail: string | null;
// }

/**
 * The options for the {@link applyMods} function.
 */
export interface ApplyModsOptions {
    /**
     * The settings used to apply the mods.
     *
     * @see {@link OreUICustomizerSettings}
     * @see {@link OreUICustomizerConfig_Settings}
     * @see {@link defaultOreUICustomizerSettings}
     *
     * @default defaultOreUICustomizerSettings
     */
    settings?: OreUICustomizerConfig_Settings & Omit<OreUICustomizerSettings, keyof OreUICustomizerConfig_Settings>;
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
    /**
     * The type of the Ore UI Customizer.
     *
     * @default "CLI"
     */
    type?: OreUICustomizerType;
    // /**
    //  * @todo
    //  */
    // onProgress?(): Promise<void> | void;
}

/**
 * Checks if a string is a URI or a path.
 *
 * @param {string} URIOrPath The string to check.
 * @returns {"URI" | "Path"} "URI" if the string is a URI, "Path" if the string is a path.
 */
function checkIsURIOrPath(URIOrPath: string): "URI" | "Path" {
    if (/^[^:/\\]+:\/\//.test(URIOrPath)) {
        return "URI" as const;
    } else {
        return "Path" as const;
    }
}

/**
 * Mutates the type by recursively removing the optional modifier (`?`) from all properties.
 *
 * @author 8Crafter
 *
 * @template T The type to mutate.
 *
 * @example
 * ```ts
 * type Original = { readonly name?: string; additionalInfo?: { age?: number; height?: number };
 * type Mutated = MutableRequired<Original>; // { readonly name: string; additionalInfo: { age: number; height: number } }
 * ```
 */
type FullDeep<T> = { [P in keyof T]-?: NonNullable<T[P]> extends object ? FullDeep<NonNullable<T[P]>> : T[P] };

/**
 * Resolves the settings for the {@link applyMods} function, adding in the default values in place of the missing settigns.
 *
 * @param settings The settings to resolve.
 * @returns The resolved settings.
 */
export function resolveOreUICustomizerSettings(
    // TEMP: Replace this with OreUICustomizerSettings_Config when the next ore-ui-customizer-types update is released.
    settings: {
        [key in keyof OreUICustomizerSettings]?: key extends "colorReplacements" ? Partial<OreUICustomizerSettings["colorReplacements"]>
        : key extends "enabledBuiltInPlugins" ? Partial<OreUICustomizerSettings["enabledBuiltInPlugins"]>
        : OreUICustomizerSettings[key];
    } = {}
): OreUICustomizerSettings {
    const resolvedSettings: OreUICustomizerSettings = {
        ...defaultOreUICustomizerSettings,
        ...(Object.fromEntries(Object.entries(settings).filter(([, value]) => value !== undefined && value !== null)) as typeof settings),
        colorReplacements: {
            ...defaultOreUICustomizerSettings.colorReplacements,
            ...(settings.colorReplacements &&
                (Object.fromEntries(
                    Object.entries(settings.colorReplacements).filter(([, value]) => value !== undefined && value !== null)
                ) as typeof settings.colorReplacements)),
        },
        advancedColorReplacements: {
            ...settings.advancedColorReplacements,
            menusTheme: {
                ...settings.advancedColorReplacements?.menusTheme,
                ".menus": {
                    ...settings.advancedColorReplacements?.menusTheme?.[".menus"],
                    colorsPrimary:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["colorsPrimary"] ?? settings.colorReplacements?.["#3c8527"] ?? "#3c8527",
                    colorsSecondary:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["colorsSecondary"] ?? settings.colorReplacements?.["#d0d1d4"] ?? "#d0d1d4",
                    colorsDestructive:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["colorsDestructive"] ??
                        settings.colorReplacements?.["#ca3636"] ??
                        "#ca3636",
                    colorsText:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["colorsText"] ?? settings.colorReplacements?.["#ffffff"] ?? "#ffffff",
                    colorsMuted0:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["colorsMuted0"] ?? settings.colorReplacements?.["#d0d1d4"] ?? "#d0d1d4",
                    colorsMuted1:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["colorsMuted1"] ?? settings.colorReplacements?.["#b1b2b5"] ?? "#b1b2b5",
                    colorsDisabled:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["colorsDisabled"] ?? settings.colorReplacements?.["#d0d1d4"] ?? "#d0d1d4",
                    baseTextFieldColor:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["baseTextFieldColor"] ??
                        settings.colorReplacements?.["#ffffff"] ??
                        "#ffffff",
                    baseTextFieldPlaceholderColor:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["baseTextFieldPlaceholderColor"] ??
                        settings.colorReplacements?.["#b1b2b5"] ??
                        "#b1b2b5",
                    baseTextFieldDisabledColor:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["baseTextFieldDisabledColor"] ??
                        settings.colorReplacements?.["#58585a"] ??
                        "#58585a",
                    baseTextFieldCaretColor:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["baseTextFieldCaretColor"] ??
                        settings.colorReplacements?.["#6cc349"] ??
                        "#6cc349",
                    inputFieldPlaceholderUnderlineColor:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["inputFieldPlaceholderUnderlineColor"] ??
                        settings.colorReplacements?.["#ffffff"] ??
                        "#ffffff",
                    inputLegendWrapperBackgroundColor:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["inputLegendWrapperBackgroundColor"] ??
                        settings.colorReplacements?.["#1e1e1f"] ??
                        "#1e1e1f",
                    inputLegendWrapperBorderTopColor:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["inputLegendWrapperBorderTopColor"] ??
                        settings.colorReplacements?.["rgba(255, 255, 255, 0.2)"] ??
                        "rgba(255, 255, 255, 0.2)",
                    inputLegendInputHintColor: settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["inputLegendInputHintColor"] ?? "#fff",
                    buttonIconKeyboardTextColor:
                        settings.advancedColorReplacements?.menusTheme?.[".menus"]?.["buttonIconKeyboardTextColor"] ??
                        settings.colorReplacements?.["#313233"] ??
                        "#313233",
                },
                ".menus.realms": {
                    ...settings.advancedColorReplacements?.menusTheme?.[".menus.realms"],
                    colorsPrimary: settings.advancedColorReplacements?.menusTheme?.[".menus.realms"]?.["colorsPrimary"] ?? "#7345e5",
                },
                ".menus.neutral90": {
                    ...settings.advancedColorReplacements?.menusTheme?.[".menus.neutral90"],
                    baseTextFieldColor:
                        settings.advancedColorReplacements?.menusTheme?.[".menus.neutral90"]?.["baseTextFieldColor"] ??
                        settings.colorReplacements?.["#ffffff"] ??
                        "#ffffff",
                    baseTextFieldPlaceholderColor:
                        settings.advancedColorReplacements?.menusTheme?.[".menus.neutral90"]?.["baseTextFieldPlaceholderColor"] ??
                        settings.colorReplacements?.["#b1b2b5"] ??
                        "#b1b2b5",
                    baseTextFieldColorDisabled:
                        settings.advancedColorReplacements?.menusTheme?.[".menus.neutral90"]?.["baseTextFieldColorDisabled"] ??
                        settings.colorReplacements?.["#58585a"] ??
                        "#58585a",
                    baseTextFieldPlaceholderColorDisabled:
                        settings.advancedColorReplacements?.menusTheme?.[".menus.neutral90"]?.["baseTextFieldPlaceholderColorDisabled"] ??
                        settings.colorReplacements?.["#58585a"] ??
                        "#58585a",
                },
            },
            // gameplayTheme: {} satisfies Required<NonNullable<NonNullable<OreUICustomizerSettings["advancedColorReplacements"]>["gameplayTheme"]>>,
            custom: {
                ...settings.advancedColorReplacements?.custom,
                ".vanilla-neutral-text,.vanilla-neutral-text-interactive": {
                    ...settings.advancedColorReplacements?.custom?.[".vanilla-neutral-text,.vanilla-neutral-text-interactive"],
                    color:
                        settings.advancedColorReplacements?.custom?.[".vanilla-neutral-text,.vanilla-neutral-text-interactive"]?.["color"] ??
                        settings.colorReplacements?.["#ffffff"] ??
                        "#ffffff",
                },
                ".vanilla-neutral-text.dimmer,.vanilla-neutral-text-interactive.dimmer": {
                    ...settings.advancedColorReplacements?.custom?.[".vanilla-neutral-text.dimmer,.vanilla-neutral-text-interactive.dimmer"],
                    color:
                        settings.advancedColorReplacements?.custom?.[".vanilla-neutral-text.dimmer,.vanilla-neutral-text-interactive.dimmer"]?.["color"] ??
                        settings.colorReplacements?.["#d0d1d4"] ??
                        "#d0d1d4",
                },
                ".vanilla-neutral-text.dimmest,.vanilla-neutral-text-interactive.dimmest": {
                    ...settings.advancedColorReplacements?.custom?.[".vanilla-neutral-text.dimmest,.vanilla-neutral-text-interactive.dimmest"],
                    color:
                        settings.advancedColorReplacements?.custom?.[".vanilla-neutral-text.dimmest,.vanilla-neutral-text-interactive.dimmest"]?.["color"] ??
                        settings.colorReplacements?.["#b1b2b5"] ??
                        "#b1b2b5",
                },
                ".realms-neutral80-text,.realms-neutral80-text-interactive": {
                    ...settings.advancedColorReplacements?.custom?.[".realms-neutral80-text,.realms-neutral80-text-interactive"],
                    color:
                        settings.advancedColorReplacements?.custom?.[".realms-neutral80-text,.realms-neutral80-text-interactive"]?.["color"] ??
                        settings.colorReplacements?.["#ffffff"] ??
                        "#ffffff",
                },
                ".realms-neutral80-text.dimmer,.realms-neutral80-text-interactive.dimmer": {
                    ...settings.advancedColorReplacements?.custom?.[".realms-neutral80-text.dimmer,.realms-neutral80-text-interactive.dimmer"],
                    color:
                        settings.advancedColorReplacements?.custom?.[".realms-neutral80-text.dimmer,.realms-neutral80-text-interactive.dimmer"]?.["color"] ??
                        settings.colorReplacements?.["#d0d1d4"] ??
                        "#d0d1d4",
                },
                ".realms-neutral80-text.dimmest,.realms-neutral80-text-interactive.dimmest": {
                    ...settings.advancedColorReplacements?.custom?.[".realms-neutral80-text.dimmest,.realms-neutral80-text-interactive.dimmest"],
                    color:
                        settings.advancedColorReplacements?.custom?.[".realms-neutral80-text.dimmest,.realms-neutral80-text-interactive.dimmest"]?.["color"] ??
                        settings.colorReplacements?.["#b1b2b5"] ??
                        "#b1b2b5",
                },
                ".realms-neutral-text,.realms-neutral-text-interactive": {
                    ...settings.advancedColorReplacements?.custom?.[".realms-neutral-text,.realms-neutral-text-interactive"],
                    color:
                        settings.advancedColorReplacements?.custom?.[".realms-neutral-text,.realms-neutral-text-interactive"]?.["color"] ??
                        settings.colorReplacements?.["#ffffff"] ??
                        "#ffffff",
                },
                ".realms-neutral-text.dimmer,.realms-neutral-text-interactive.dimmer": {
                    ...settings.advancedColorReplacements?.custom?.[".realms-neutral-text.dimmer,.realms-neutral-text-interactive.dimmer"],
                    color:
                        settings.advancedColorReplacements?.custom?.[".realms-neutral-text.dimmer,.realms-neutral-text-interactive.dimmer"]?.["color"] ??
                        settings.colorReplacements?.["#d0d1d4"] ??
                        "#d0d1d4",
                },
                ".realms-neutral-text.dimmest,.realms-neutral-text-interactive.dimmest": {
                    ...settings.advancedColorReplacements?.custom?.[".realms-neutral-text.dimmest,.realms-neutral-text-interactive.dimmest"],
                    color:
                        settings.advancedColorReplacements?.custom?.[".realms-neutral-text.dimmest,.realms-neutral-text-interactive.dimmest"]?.["color"] ??
                        settings.colorReplacements?.["#b1b2b5"] ??
                        "#b1b2b5",
                },
            },
        } satisfies FullDeep<NonNullable<OreUICustomizerSettings["advancedColorReplacements"]>>,
        enabledBuiltInPlugins: { ...defaultOreUICustomizerSettings.enabledBuiltInPlugins, ...settings.enabledBuiltInPlugins },
    };
    resolvedSettings.plugins?.forEach((plugin) => {
        if (!plugin.dependencies) return;
        plugin.dependencies.forEach((dependency) => {
            if (!("uuid" in dependency)) return;
            const requiredBuiltInPlugin = builtInPlugins.find((plugin) => plugin.uuid === dependency.uuid);
            if (!requiredBuiltInPlugin) return;
            if (resolvedSettings.enabledBuiltInPlugins[requiredBuiltInPlugin.id]) return;
            resolvedSettings.enabledBuiltInPlugins[requiredBuiltInPlugin.id] = true;
            console.warn(
                `Enabling built-in plugin "${requiredBuiltInPlugin.id}" because it is required by ${JSON.stringify(plugin.name)} v${plugin.version} (${
                    plugin.namespace
                }:${plugin.id})`
            );
        });
    });
    resolvedSettings.preloadedPlugins?.forEach((plugin) => {
        if (!plugin.dependencies) return;
        plugin.dependencies.forEach((dependency) => {
            if (!("uuid" in dependency)) return;
            const requiredBuiltInPlugin = builtInPlugins.find((plugin) => plugin.uuid === dependency.uuid);
            if (!requiredBuiltInPlugin) return;
            if (resolvedSettings.enabledBuiltInPlugins[requiredBuiltInPlugin.id]) return;
            resolvedSettings.enabledBuiltInPlugins[requiredBuiltInPlugin.id] = true;
            console.warn(
                `Enabling built-in plugin "${requiredBuiltInPlugin.id}" because it is required by ${JSON.stringify(plugin.name)} v${plugin.version} (${
                    plugin.namespace
                }:${plugin.id})`
            );
        });
    });
    return resolvedSettings;
}

/**
 * Applies color replacements to the provided file contents.
 *
 * @param distData The file contents.
 * @param filePath The file path, relative to the `gui/dist` folder, with a prepended `/`.
 * @param settings The Ore UI Customizer settings.
 * @returns The modified file contents.
 *
 * @todo Add separate handling for gameplay-theme-*.css, it should have its own unique color options for variables in it.
 * @todo Add theme support.
 */
// TODO: The CSS theme functionality needs to be added separately inside applyMods function and the Ore UI preview handler for the Ore UI Customizer App.
export function applyColorReplacementsToFileContents(
    distData: string,
    filePath: string,
    settings: Partial<Omit<OreUICustomizerSettings, "colorReplacements">> & { colorReplacements: Partial<OreUICustomizerSettings["colorReplacements"]> },
    options: { themeColorReplacementsJSONData: ThemeColorReplacements[] }
): string {
    settings = resolveOreUICustomizerSettings(settings);
    if (settings.themes?.length) {
        const colorReplacementsData: Partial<OreUICustomizerSettings["colorReplacements"]>[] = [];
        const advancedColorReplacementsData: OreUICustomizerSettings["advancedColorReplacements"][] = [];
        if (settings.colorReplacements) colorReplacementsData.push(settings.colorReplacements);
        if (settings.advancedColorReplacements) advancedColorReplacementsData.push(settings.advancedColorReplacements);
        // This thing should marge all objects together, where for example
        // {a: "5", b: {c: "6"}}, {a: "6", d: "7", b: {q: "8", e: {f: {g: {k: "45"}}}}}, and {b: {j: {k: "9"}, e: {f: {g: {o: "57"}}}}} merge into {a: "6", b: {c: "6", q: "8", j: {k: "9"}, e: {f: {g: {k: "45", o: "57"}}}}}, d: "7"}
        // This needs to go the full depth of the object and be recursive.
        function recursivelyMergeData(data: Record<string, object | string>[]): Record<string, object | string> {
            if (data.length === 0) return {};
            if (data.length === 1) return data[0]!;

            function mergeTwo<T>(a: Record<string, T>, b: Record<string, T>): Record<string, T> {
                const result: Record<string, T> = { ...a };

                for (const key of Object.keys(b)) {
                    const bv = b[key];
                    const av = result[key];

                    if (av && typeof av === "object" && !Array.isArray(av) && typeof bv === "object" && !Array.isArray(bv)) {
                        result[key] = mergeTwo(av as Record<string, unknown>, bv as Record<string, unknown>) as T;
                    } else {
                        // Primitive or overwrite
                        result[key] = (bv ?? av)!;
                    }
                }

                return result;
            }

            return data.reduce((acc, obj) => mergeTwo(acc, obj), {});
        }
        settings.colorReplacements = recursivelyMergeData([
            settings.colorReplacements ?? {},
            ...options.themeColorReplacementsJSONData.map((v) => v.colorReplacements).filter((v) => v !== undefined),
        ]) as NonNullable<ThemeColorReplacements["colorReplacements"]>;
        settings.advancedColorReplacements = recursivelyMergeData([
            settings.advancedColorReplacements ?? {},
            ...options.themeColorReplacementsJSONData.map((v) => v.advancedColorReplacements).filter((v) => v !== undefined),
        ]) as NonNullable<ThemeColorReplacements["advancedColorReplacements"]>;
    }
    if (/^\/hbui\/menus-theme(?:-[a-zA-Z0-9]+)?\.css$/.test(filePath)) {
        if (settings.advancedColorReplacements?.menusTheme) {
            for (const key in settings.advancedColorReplacements.menusTheme) {
                if (key === "") continue;
                for (const [key2, value] of Object.entries(
                    settings.advancedColorReplacements.menusTheme[key as keyof typeof settings.advancedColorReplacements.menusTheme] ?? {}
                )) {
                    if (value === "" || value === undefined || value === null) continue;
                    type TA1 = UnionToIntersection<NonNullable<NonNullable<OreUICustomizerSettings["advancedColorReplacements"]>["menusTheme"]>>;
                    type TA2 = UnionToIntersection<NonNullable<TA1[keyof TA1]>>;
                    const pattern = new RegExp(
                        `(?<=(?:(?:\\}|^)${key
                            .split(".")
                            .map((v: string): string => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
                            .join(
                                "[\\s\\n]*\\."
                            )}[\\s\\n]*\\{)[^\\}]*--(${key2.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})[\\s\\n]*:[\\s\\n]*)${(defaultOreUICustomizerSettings.advancedColorReplacements!.menusTheme![key as keyof TA1]! as TA2)[key2 as keyof TA2]!.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?=;)`,
                        ""
                    );
                    distData = distData.replace(pattern, (match: string, match1: keyof TA2): string => {
                        if (!(match1 in ((settings.advancedColorReplacements?.menusTheme?.[key as keyof TA1] as TA2 | undefined) ?? {}))) {
                            console.error(`Unknown color replacement: ${match1}`);
                            return match;
                        }
                        const replacement: string | undefined = (settings.advancedColorReplacements!.menusTheme![key as keyof TA1]! as TA2)[match1];
                        return replacement ?? match;
                    });
                }
            }
            if (settings.advancedColorReplacements?.custom) {
                for (const key in settings.advancedColorReplacements.custom) {
                    if (key === "") continue;
                    const cssTextInnerLines: string[] = [];
                    for (const [key2, value] of Object.entries(
                        settings.advancedColorReplacements.custom[key as keyof typeof settings.advancedColorReplacements.custom] ?? {}
                    )) {
                        if (value === "" || value === undefined || value === null) {
                            type TA1 = UnionToIntersection<NonNullable<NonNullable<OreUICustomizerSettings["advancedColorReplacements"]>["custom"]>>;
                            type TA2 = UnionToIntersection<NonNullable<TA1[keyof TA1]>> | NonNullable<TA1[keyof UnionToIntersection<TA1>]>;
                            cssTextInnerLines.push(
                                `${key2}:${(defaultOreUICustomizerSettings.advancedColorReplacements!.custom![key as keyof TA1]! as TA2)[key2 as keyof TA2]};`
                            );
                            continue;
                        }
                        cssTextInnerLines.push(`${key2}:${value};`);
                    }
                    const cssText = `${key
                        .split(",")
                        .map((v: string): string => `:root ${v}`)
                        .join(",")}{${cssTextInnerLines.join("")}}`;
                    distData = `${distData}\n${cssText}`;
                }
            }
        }
        return distData;
    }
    // TODO
    // if (/^\/hbui\/gameplay-theme(?:-[a-zA-Z0-9]+)?\.css$/.test(filePath)) {
    //     if (!settings.advancedColorReplacements?.gameplayTheme) return distData;
    //     return distData;
    // }
    const keys: string[] = [];
    for (const [key, value] of Object.entries(settings.colorReplacements)) {
        if (value === "" || value === undefined || value === null || value === key) continue;
        keys.push(key);
    }

    if (!keys.length) return distData;

    const pattern = new RegExp(keys.map((k: string): string => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "g");

    distData = distData.replace(pattern, (match: string): string => {
        if (!(match in settings.colorReplacements)) {
            console.error(`Unknown color replacement: ${match}`);
            return match;
        }
        const replacement: string | undefined = settings.colorReplacements[match as keyof typeof settings.colorReplacements];
        return replacement ?? match;
    });
    return distData;
}

/**
 * Applies mods to a zip file.
 *
 * @param {Blob} file The zip file to apply mods to.
 * @param {ApplyModsOptions} options The options.
 * @returns {Promise<ApplyModsResult>} A promise resolving to the result.
 *
 * @todo Implement an option for a callback to receive status updates.
 */
export async function applyMods(file: Blob, options: ApplyModsOptions = {}): Promise<ApplyModsResult> {
    /**
     * The zip file system.
     */
    const zipFs: zip.FS = new zip.fs.FS();
    await zipFs.importBlob(file);
    /**
     * The number of entries added.
     */
    var addedCount: bigint = 0n;
    /**
     * The number of entries removed.
     */
    var removedCount: bigint = 0n;
    /**
     * The number of entries modified.
     */
    var modifiedCount: bigint = 0n;
    /**
     * The number of entries unmodified.
     */
    var unmodifiedCount: bigint = 0n;
    /**
     * The number of entries edited.
     */
    var editedCount: bigint = 0n;
    /**
     * The number of entries renamed.
     */
    var renamedCount: bigint = 0n;
    /**
     * A list of mods that failed.
     *
     * @type {{[filename: string]: string[]}}
     */
    var allFailedReplaces: { [filename: string]: string[] } = {};
    /**
     * If {@link options.enableDebugLogging} is true, is set to {@link console.log}, otherwise it is set to a function that does nothing.
     */
    const log = options.enableDebugLogging ? console.log : () => {};
    /**
     * The base URI or file path to be used to resolve URIs.
     *
     * @default "https://www.8crafter.com/"
     */
    const baseURI = options.baseURI ?? "https://www.8crafter.com/";
    if (checkIsURIOrPath(baseURI) === "Path" && !options.nodeFS) {
        throw new TypeError("options.nodeFS is required if options.baseURI is a file path.");
    }
    /**
     * Fetches a file as a blob.
     *
     * @param {string} uri The URI of the file.
     * @returns {Promise<Blob>} A promise resolving to the blob.
     */
    async function fetchFileBlob(uri: string): Promise<Blob> {
        const resolvedURI: string = new URL(uri, baseURI).href;
        if (checkIsURIOrPath(resolvedURI) === "URI") {
            const response = await fetch(resolvedURI);
            return response.blob();
        } else {
            return new Blob([options.nodeFS!.readFileSync(resolvedURI)]);
        }
    }
    /**
     * The settings used to apply the mods.
     */
    const settings: OreUICustomizerSettings = resolveOreUICustomizerSettings(options.settings);
    const oreUICustomizerEnvGlobalVariableName = `__customizer_env_${Date.now()}_${Math.floor(Math.random() * 1000000)}__`;
    ((globalThis as any)[oreUICustomizerEnvGlobalVariableName] as OreUICustomizerEnv) = {
        settings,
        type: options.type ?? ((globalThis as any).electron ? "App" : "CLI"),
        version: format_version,
    };
    /**
     * The list of plugins to apply.
     */
    const plugins: Plugin[] = [...builtInPlugins, ...(settings.preloadedPlugins ?? [])];
    for (const encodedPlugin of settings.plugins ?? []) {
        plugins.push(
            await importPluginFromDataURI(
                encodedPlugin.dataURI,
                {
                    oreUICustomizerEnvGlobalVariableName,
                },
                encodedPlugin.fileType
            )
        );
    }
    const themes: Theme[] = [...(settings.preloadedThemes ?? [])];
    for (const encodedTheme of settings.themes ?? []) {
        themes.push(await importThemeFromDataURI(encodedTheme.dataURI, {}, encodedTheme.fileType));
    }
    const themeColorReplacementsJSONData: ThemeColorReplacements[] = await getColorReplacementsDataForThemes(themes);
    for (const plugin of plugins) {
        if (plugin.namespace !== "built-in" || (settings.enabledBuiltInPlugins[plugin.id as keyof typeof settings.enabledBuiltInPlugins] ?? true)) {
            for (const action of plugin.actions) {
                if (action.context !== "global_before") continue;
                try {
                    await action.action(zipFs);
                } catch (e) {
                    console.error(e);
                    allFailedReplaces.globalPluginActions ??= [];
                    allFailedReplaces.globalPluginActions.push(`${plugin.namespace !== "built-in" ? `${plugin.namespace}:` : ""}${plugin.id}:${action.id}`);
                }
            }
        }
    }
    for (const entry of zipFs.entries as (zip.ZipFileEntry<any, any> | zip.ZipDirectoryEntry)[]) {
        const filePath: string = entry.getFullname();
        if (!filePath) {
            unmodifiedCount++;
        } else if (/^(gui\/)?dist\/hbui\/assets\/[^/]*?%40/.test(filePath)) {
            const origName: string = entry.name;
            entry.rename(entry.name.split("/").pop()!.replaceAll("%40", "@"));
            log(`Entry ${origName} has been successfully renamed to ${entry.name}.`);
            modifiedCount++;
            renamedCount++;
        } else if (!/^(gui\/)?dist\/hbui(?:-(?:tests|docs|perf))?\/[^/]+\.(js|html|css)$/.test(filePath.toLowerCase())) {
            if (entry.directory !== void false) {
                unmodifiedCount++;
            } else if (/\.(txt|md|js|jsx|html|css|json|jsonc|jsonl)$/.test(filePath.toLowerCase())) {
                let origData: string | undefined;
                let distData: string | undefined;
                const failedReplaces: string[] = [];
                for (const plugin of plugins) {
                    if (plugin.namespace !== "built-in" || (settings.enabledBuiltInPlugins[plugin.id as keyof typeof settings.enabledBuiltInPlugins] ?? true)) {
                        for (const action of plugin.actions) {
                            if (action.context !== "per_text_file") continue;
                            origData ??= await entry.getText();
                            distData ??= origData;
                            try {
                                distData = await action.action(distData, entry, zipFs);
                            } catch (e) {
                                console.error(e);
                                failedReplaces.push(`${plugin.namespace !== "built-in" ? `${plugin.namespace}:` : ""}${plugin.id}:${action.id}`);
                            }
                        }
                    }
                }
                if (failedReplaces.length > 0) allFailedReplaces[filePath] = failedReplaces;
                if (origData !== undefined && distData !== undefined && origData !== distData) {
                    // FIXME: Add sanitization to escape possible comment escaping strings.
                    if (filePath.endsWith(".js")) {
                        distData = `// Modified by 8Crafter's Ore UI Customizer v${format_version}: https://www.8crafter.com/utilities/ore-ui-customizer\n// Options: ${JSON.stringify(
                            {
                                ...settings,
                                plugins: settings.plugins?.map((plugin) => ({ ...plugin, dataURI: "...", icon_data_uri: "..." })),
                                themes: settings.themes?.map((theme) => ({ ...theme, dataURI: "...", icon_data_uri: "..." })),
                            }
                        )}\n${distData}`;
                    } else if (filePath.endsWith(".css")) {
                        distData = `/* Modified by 8Crafter's Ore UI Customizer v${format_version}: https://www.8crafter.com/utilities/ore-ui-customizer */\n/* Options: ${JSON.stringify(
                            {
                                ...settings,
                                plugins: settings.plugins?.map((plugin) => ({ ...plugin, dataURI: "...", icon_data_uri: "..." })),
                                themes: settings.themes?.map((theme) => ({ ...theme, dataURI: "...", icon_data_uri: "..." })),
                            }
                        ).replaceAll("*/", "*\\/")} */\n${distData}`;
                    } else if (filePath.endsWith(".html")) {
                        distData = `<!-- Modified by 8Crafter's Ore UI Customizer v${format_version}: https://www.8crafter.com/utilities/ore-ui-customizer -->\n<!-- Options: ${JSON.stringify(
                            {
                                ...settings,
                                plugins: settings.plugins?.map((plugin) => ({ ...plugin, dataURI: "...", icon_data_uri: "..." })),
                                themes: settings.themes?.map((theme) => ({ ...theme, dataURI: "...", icon_data_uri: "..." })),
                            }
                        ).replaceAll("-->", "--\\>")} -->\n${distData}`;
                    }
                    entry.replaceText(distData);
                    log(`Entry ${entry.name} has been successfully modified.`);
                    modifiedCount++;
                    editedCount++;
                } else {
                    // log(`Entry ${entry.name} has not been modified.`);
                    unmodifiedCount++;
                }
            } else {
                let origData: Blob | undefined;
                let distData: Blob | undefined;
                const failedReplaces: string[] = [];
                for (const plugin of plugins) {
                    if (plugin.namespace !== "built-in" || (settings.enabledBuiltInPlugins[plugin.id as keyof typeof settings.enabledBuiltInPlugins] ?? true)) {
                        for (const action of plugin.actions) {
                            if (action.context !== "per_binary_file") continue;
                            origData ??= await entry.getBlob();
                            distData ??= origData;
                            try {
                                distData = await action.action(distData, entry, zipFs!);
                            } catch (e) {
                                console.error(e);
                                failedReplaces.push(`${plugin.namespace !== "built-in" ? `${plugin.namespace}:` : ""}${plugin.id}:${action.id}`);
                            }
                        }
                    }
                }
                if (failedReplaces.length > 0) allFailedReplaces[filePath] = failedReplaces;
                if (origData && distData && Buffer.from(await origData.arrayBuffer()).compare(Buffer.from(await distData.arrayBuffer())) !== 0) {
                    entry.replaceBlob(distData);
                    log(`Entry ${entry.name} has been successfully modified.`);
                    modifiedCount++;
                    editedCount++;
                } else {
                    // log(`Entry ${entry.name} has not been modified.`);
                    unmodifiedCount++;
                }
            }
        } else if (filePath.endsWith("oreUICustomizer8CrafterConfig.js")) {
            unmodifiedCount++;
        } else if (entry.directory === void false) {
            /**
             * The original data.
             *
             * @type {string}
             */
            const origData: string = await entry.getText();
            /**
             * The modified data.
             */
            let distData: string = origData;
            /**
             * The list of failed replaces.
             *
             * @type {string[]}
             */
            let failedReplaces: string[] = [];
            /**
             * The extracted symbol names.
             */
            let extractedSymbolNames: ExtractedSymbolNames = getExtractedSymbolNames(origData, filePath);

            /**
             * Lists of regexes to use for certain modifications.
             */
            const replacerRegexes = getReplacerRegexes(extractedSymbolNames);
            if (settings.hardcoreModeToggleAlwaysClickable) {
                let successfullyReplaced: boolean = false;
                for (const regex of replacerRegexes.hardcoreModeToggleAlwaysClickable[0]) {
                    if (regex.test(distData)) {
                        distData = distData.replace(
                            regex,
                            `/**
             * The hardcore mode toggle.
             *
             * @param {Object} param0
             * @param {unknown} param0.generalData
             * @param {boolean} param0.isLockedTemplate
             */
            function $1({ generalData, isLockedTemplate: isLockedTemplate }) {
                const { t: $12 } = $2("CreateNewWorld.general"),
                    $3 = $4(),
                    oAA = (0, ${extractedSymbolNames.contextHolder}.useContext)($5) === $6.CREATE,
                    iAA = (0, ${extractedSymbolNames.facetHolder}.useSharedFacet)($7),
                    cAA = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((generalData, isLockedTemplate, $12) => $12 || isLockedTemplate || !oAA || (generalData.gameMode !== $8.SURVIVAL && generalData.gameMode !== $9.ADVENTURE), [oAA], [generalData, isLockedTemplate, iAA]);
                return ${extractedSymbolNames.contextHolder}.createElement($10, {
                    title: $11(".hardcoreModeTitle"),
                    soundEffectPressed: "ui.hardcore_toggle_press",
                    disabled: false /* cAA */, // Modified to make the hardcore mode toggle always be enabled.
                    description: $12(".hardcoreModeDescription"),
                    value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((generalData) => generalData.isHardcore, [], [generalData]),
                    onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                        (generalData) => (value) => {
                            (generalData.isHardcore = value), $3(value ? "ui.hardcore_enable" : "ui.hardcore_disable");
                        },
                        [$3],
                        [generalData]
                    ),
                    gamepad: { index: 4 },
                    imgSrc: $13,
                    "data-testid": "hardcore-mode-toggle",
                });
            }`
                        );
                        successfullyReplaced = true;
                        break;
                    }
                }
                if (/^(gui\/)?dist\/hbui\/index-[0-9a-f]{5,20}\.js$/.test(filePath) && !successfullyReplaced) {
                    failedReplaces.push("hardcoreModeToggleAlwaysClickable");
                }
            }
            if (settings.allowDisablingEnabledExperimentalToggles) {
                let successfullyReplaced: boolean = false;
                for (const regex of replacerRegexes.allowDisablingEnabledExperimentalToggles[0]) {
                    if (regex.test(distData)) {
                        distData = distData.replace(
                            regex,
                            `/**
             * Handles the gneration of an experimental toggle, and the education edition toggle.
             *
             * @param {object} param0
             * @param {unknown} param0.experimentalFeature
             * @param {unknown} param0.gamepadIndex
             * @param {boolean} [param0.disabled]
             * @param {unknown} param0.achievementsDisabledMessages
             * @param {unknown} param0.areAllTogglesDisabled
             */
            function $1({ experimentalFeature, gamepadIndex: tAAC, disabled: $2AA, achievementsDisabledMessages: $3AA, areAllTogglesDisabled: $4AA }) {
                const { gt: $5AA } = (function () {
                        const { translate, formatDate } = (0, ${extractedSymbolNames.contextHolder}.useContext)($6);
                        return (0, ${extractedSymbolNames.contextHolder}.useMemo)(
                            () => ({
                                f: { formatDate },
                                gt: (tAB, $2AA) => {
                                    var $3AA;
                                    return null !== ($3AA = translate(tAB, null!=$2AA?$2AA:[])) && void 0 !== $3AA ? $3AA : tAB;
                                },
                            }),
                            [translate, formatDate]
                        );
                    })(),
                    { t: cAA } = ${extractedSymbolNames.translationStringResolver}("CreateNewWorld.all"),
                    $7AA = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((eAB) => eAB.id, [], [experimentalFeature]),
                    $8AA = (0, ${extractedSymbolNames.facetHolder}.useFacetUnwrap)($7AA),
                    $9AA = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((eAB) => eAB.title, [], [experimentalFeature]),
                    $10AA = (0, ${extractedSymbolNames.facetHolder}.useFacetUnwrap)($9AA),
                    $11AA = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((eAB) => eAB.description, [], [experimentalFeature]),
                    $12AA = (0, ${extractedSymbolNames.facetHolder}.useFacetUnwrap)($11AA),
                    $13AA = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((eAB) => eAB.isEnabled, [], [experimentalFeature]),
                    $14AA = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((eAB, tAB) => eAB || tAB.isTogglePermanentlyDisabled, [], [(0, ${extractedSymbolNames.facetHolder}.useFacetWrap)(false /* $2AA */), experimentalFeature]), // Modified
                    $15AA = (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                        (eAB, tAB) => ($2AA) => {
                            /* $2AA && tAB
                                ? $16AA.set({ userTriedToActivateToggle: !0, doSetToggleValue: () => (eAB.isEnabled = $2AA), userHasAcceptedBetaFeatures: !1 })
                                :  */(eAB.isEnabled = $2AA);
                        },
                        [],
                        [experimentalFeature, $4AA]
                    ),
                    $17AA = cAA(".narrationSuffixDisablesAchievements"),
                    $18AA = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((eAB) => (0 === eAB.length ? cAA(".narrationSuffixEnablesAchievements") : void 0), [cAA], [$3AA]);
                return null != $8AA
                    ? ${extractedSymbolNames.contextHolder}.createElement($19, {
                          title: $10AA !== ${extractedSymbolNames.facetHolder}.NO_VALUE ? $5AA($10AA) : "",
                          description: $12AA !== ${extractedSymbolNames.facetHolder}.NO_VALUE ? $5AA($12AA) : "",
                          gamepad: { index: tAAC },
                          value: $13AA,
                          disabled: false /* $14AA */, // Modified
                          onChange: $15AA,
                          onNarrationText: $17AA,
                          offNarrationText: $18AA,
                      })
                    : null;
            }`
                        );
                        successfullyReplaced = true;
                        break;
                    }
                }
                if (/^(gui\/)?dist\/hbui\/index-[0-9a-f]{5,20}\.js$/.test(filePath) && !successfullyReplaced) {
                    failedReplaces.push("allowDisablingEnabledExperimentalToggles");
                }
            }
            // `FUNCTION CODE`.split("${extractedFunctionNames.translationStringResolver}").map(v=>stringToRegexString(v)).join("${extractedFunctionNames.translationStringResolver}")
            if (settings.addMoreDefaultGameModes) {
                let successfullyReplacedA: boolean = false;
                let successfullyReplacedB: boolean = false;
                for (const regex of replacerRegexes.addMoreDefaultGameModes[0]) {
                    if (regex.test(distData)) {
                        distData = distData.replace(
                            regex,
                            `/**
             * The game mode dropdown.
             *
             * @param param0
             * @param {unknown} param0.generalData
             * @param {boolean} param0.isLockedTemplate
             * @param {boolean} param0.isUsingTemplate
             * @param {unknown} param0.achievementsDisabledMessages
             * @param {boolean} param0.isHardcoreMode
             */
            function $1({ generalData: eAA, isLockedTemplate: tAA, isUsingTemplate: $2, achievementsDisabledMessages: $3, isHardcoreMode: oAA }) {
                const { t: iAA } = ${extractedSymbolNames.translationStringResolver}("CreateNewWorld.general"),
                    { t: cAA } = ${extractedSymbolNames.translationStringResolver}("CreateNewWorld.all"),
                    sAA = (0, ${extractedSymbolNames.facetHolder}.useSharedFacet)($4),
                    uAA = (0, ${extractedSymbolNames.contextHolder}.useContext)($5) !== $6.CREATE,
                    dAA = (0, ${extractedSymbolNames.facetHolder}.useSharedFacet)($7),
                    mAA = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((eAA, tAA, $2) => eAA || tAA || $2, [], [tAA, sAA, oAA]),
                    pAA = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)(
                        (eAA, tAA) => {
                            const $2 = [/* 
                                $8(
                                    { label: iAA(".gameModeUnknownLabel"), description: iAA(".gameModeUnknownDescription"), value: $9.UNKNOWN },
                                    1 === eAA.length ? { narrationSuffix: cAA(".narrationSuffixEnablesAchievements") } : {}
                                ), */
                                $8(
                                    { label: iAA(".gameModeSurvivalLabel"), description: iAA(".gameModeSurvivalDescription"), value: $9.SURVIVAL },
                                    1 === eAA.length ? { narrationSuffix: cAA(".narrationSuffixEnablesAchievements") } : {}
                                ),
                                {
                                    label: iAA(".gameModeCreativeLabel"),
                                    description: iAA(".gameModeCreativeDescription"),
                                    value: $9.CREATIVE,
                                    narrationSuffix: cAA(".narrationSuffixDisablesAchievements"),
                                },
                                $8(
                                    {
                                        label: iAA(".gameModeAdventureLabel"),
                                        description: iAA(tAA ? ".gameModeAdventureTemplateDescription" : ".gameModeAdventureDescription"),
                                        value: $9.ADVENTURE,
                                    },
                                    1 === eAA.length ? { narrationSuffix: cAA(".narrationSuffixEnablesAchievements") } : {}
                                ),/* 
                                $8(
                                    {
                                        label: "Game Mode 3",
                                        description: "Secret game mode 3.",
                                        value: $9.GM3,
                                    },
                                    1 === eAA.length ? { narrationSuffix: cAA(".narrationSuffixEnablesAchievements") } : {}
                                ),
                                $8(
                                    {
                                        label: "Game Mode 4",
                                        description: "Secret game mode 4.",
                                        value: $9.GM4,
                                    },
                                    1 === eAA.length ? { narrationSuffix: cAA(".narrationSuffixEnablesAchievements") } : {}
                                ), */
                                $8(
                                    {
                                        label: "Default",
                                        description: "Default game mode, might break things if you set the default game mode to itself.",
                                        value: $9.DEFAULT,
                                    },
                                    1 === eAA.length ? { narrationSuffix: cAA(".narrationSuffixEnablesAchievements") } : {}
                                ),
                                $8(
                                    {
                                        label: "Spectator",
                                        description: "Spectator mode.",
                                        value: $9.SPECTATOR,
                                    },
                                    1 === eAA.length ? { narrationSuffix: cAA(".narrationSuffixEnablesAchievements") } : {}
                                ),/* 
                                $8(
                                    {
                                        label: "Game Mode 7",
                                        description: "Secret game mode 7.",
                                        value: $9.GM7,
                                    },
                                    1 === eAA.length ? { narrationSuffix: cAA(".narrationSuffixEnablesAchievements") } : {}
                                ),
                                $8(
                                    {
                                        label: "Game Mode 8",
                                        description: "Secret game mode 8.",
                                        value: $9.GM8,
                                    },
                                    1 === eAA.length ? { narrationSuffix: cAA(".narrationSuffixEnablesAchievements") } : {}
                                ),
                                $8(
                                    {
                                        label: "Game Mode 9",
                                        description: "Secret game mode 9.",
                                        value: $9.GM9,
                                    },
                                    1 === eAA.length ? { narrationSuffix: cAA(".narrationSuffixEnablesAchievements") } : {}
                                ), */
                            ]; /* 
                            return (
                                (uAA || tAA) &&
                                    $2.push(
                                        $8(
                                            {
                                                label: iAA(".gameModeAdventureLabel"),
                                                description: iAA(tAA ? ".gameModeAdventureTemplateDescription" : ".gameModeAdventureDescription"),
                                                value: $9.ADVENTURE,
                                            },
                                            1 === eAA.length ? { narrationSuffix: cAA(".narrationSuffixEnablesAchievements") } : {}
                                        )
                                    ),
                                $2
                            ); */
                            return $2;
                        },
                        [iAA, cAA, uAA],
                        [$3, $2]
                    ),
                    fAA = $10();
                return ${extractedSymbolNames.contextHolder}.createElement($11, {
                    title: iAA(".gameModeTitle"),
                    disabled: mAA,
                    options: pAA,
                    onMountComplete: fAA,
                    value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((eAA) => eAA.gameMode, [], [eAA]),
                    onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                        (eAA, tAA) => ($2) => {
                            const $12 = eAA.gameMode;
                            (eAA.gameMode = $2), uAA && tAA.trackOptionChanged($13.GameModeChanged, $12, $2);
                        },
                        [uAA],
                        [eAA, dAA]
                    ),
                });
            }`
                        );
                        successfullyReplacedA = true;
                        break;
                    }
                }
                for (const regex of replacerRegexes.addMoreDefaultGameModes[1]) {
                    if (regex.test(distData)) {
                        distData = distData.replace(
                            regex,
                            `(function (e) {
                    // Modified to add more game modes.
                    (e[(e.UNKNOWN = -1)] = "UNKNOWN"),
                        (e[(e.SURVIVAL = 0)] = "SURVIVAL"),
                        (e[(e.CREATIVE = 1)] = "CREATIVE"),
                        (e[(e.ADVENTURE = 2)] = "ADVENTURE"),
                        (e[(e.GM3 = 3)] = "GM3"),
                        (e[(e.GM4 = 4)] = "GM4"),
                        (e[(e.DEFAULT = 5)] = "DEFAULT"),
                        (e[(e.SPECTATOR = 6)] = "SPECTATOR"),
                        (e[(e.GM7 = 7)] = "GM7"),
                        (e[(e.GM8 = 8)] = "GM8"),
                        (e[(e.GM9 = 9)] = "GM9");
                })($1 || ($2 = {})),`
                        );
                        successfullyReplacedB = true;
                        break;
                    }
                }
                if (/^(gui\/)?dist\/hbui\/index-[0-9a-f]{5,20}\.js$/.test(filePath)) {
                    if (!successfullyReplacedA) {
                        failedReplaces.push("addMoreDefaultGameModes_dropdown");
                    }
                    if (!successfullyReplacedB) {
                        failedReplaces.push("addMoreDefaultGameModes_enumeration");
                    }
                }
            }
            if (settings.addGeneratorTypeDropdown) {
                let successfullyReplacedA = false;
                let successfullyReplacedB = false;
                for (const regex of replacerRegexes.addGeneratorTypeDropdown[0]) {
                    if (regex.test(distData)) {
                        distData = distData.replace(
                            regex,
                            `// Modified to add this dropdown
                                      ${extractedSymbolNames.contextHolder}.createElement(
                                          ${extractedSymbolNames.facetHolder}.Mount,
                                          { when: true /* $1 */ },
                                          ${extractedSymbolNames.contextHolder}.createElement(
                                              $2,
                                              null,
                                              ${extractedSymbolNames.contextHolder}.createElement($3, {
                                                  label: $4(".generatorTypeLabel"),
                                                  options: [
                                                      {
                                                          value: $5.Legacy,
                                                          label: "Legacy",
                                                          description: "The old world type.",
                                                      },
                                                      {
                                                          value: $5.Overworld,
                                                          label: $4(".vanillaWorldGeneratorLabel"),
                                                          description: $4(".vanillaWorldGeneratorDescription"),
                                                      },
                                                      {
                                                          value: $5.Flat,
                                                          label: $4(".flatWorldGeneratorLabel"),
                                                          description: $4(".flatWorldGeneratorDescription"),
                                                      },/* 
                                                      {
                                                          value: $5.Nether,
                                                          label: "Nether",
                                                          description: $4(".vanillaWorldGeneratorDescription"),
                                                      },
                                                      {
                                                          value: $5.TheEnd,
                                                          label: "The End",
                                                          description: $4(".vanillaWorldGeneratorDescription"),
                                                      }, */
                                                      {
                                                          value: $5.Void,
                                                          label: $4(".voidWorldGeneratorLabel"),
                                                          description: $4(".voidWorldGeneratorDescription"),
                                                      },/* 
                                                      {
                                                          value: $5.Undefined,
                                                          label: "Undefined",
                                                          description: $4(".vanillaWorldGeneratorDescription"),
                                                      }, */
                                                  ],
                                                  value: $6.value,
                                                  onChange: $6.onChange,
                                              }) /* 
                                              (e[(e.Legacy = 0)] = "Legacy"),
                                                (e[(e.Overworld = 1)] = "Overworld"),
                                                (e[(e.Flat = 2)] = "Flat"),
                                                (e[(e.Nether = 3)] = "Nether"),
                                                (e[(e.TheEnd = 4)] = "TheEnd"),
                                                (e[(e.Void = 5)] = "Void"),
                                                (e[(e.Undefined = 6)] = "Undefined"); */
                                          )
                                      )`
                        );
                        successfullyReplacedA = true;
                        break;
                    }
                }
                for (const regex of replacerRegexes.addGeneratorTypeDropdown[1]) {
                    if (regex.test(distData)) {
                        distData = distData.replace(
                            regex,
                            `(function (e) {
                    (e[(e.Legacy = 0)] = "Legacy"),
                        (e[(e.Overworld = 1)] = "Overworld"),
                        (e[(e.Flat = 2)] = "Flat"),
                        (e[(e.Nether = 3)] = "Nether"),
                        (e[(e.TheEnd = 4)] = "TheEnd"),
                        (e[(e.Void = 5)] = "Void"),
                        (e[(e.Undefined = 6)] = "Undefined");
                })($1 || ($1 = {})),`
                        );
                        successfullyReplacedB = true;
                        break;
                    }
                }
                if (/^(gui\/)?dist\/hbui\/index-[0-9a-f]{5,20}\.js$/.test(filePath)) {
                    if (!successfullyReplacedA) {
                        failedReplaces.push("addGeneratorTypeDropdown_dropdown");
                    }
                    if (!successfullyReplacedB) {
                        failedReplaces.push("addGeneratorTypeDropdown_enumeration");
                    }
                }
            }
            if (settings.allowForChangingSeeds) {
                let successfullyReplaced = false;
                for (const regex of replacerRegexes.allowForChangingSeeds[0]) {
                    if (regex.test(distData)) {
                        distData = distData.replace(
                            regex,
                            `$1 = ({ advancedData: eAA, isEditorWorld: tAA, onSeedValueChange: $2, isSeedChangeLocked: $3, showSeedTemplates: oAA, worldData: wd }) => {
                    const { t: iAA } = $4("CreateNewWorld.advanced"),
                        { t: cAA } = $4("CreateNewWorld.all"),
                        sAA = (0, ${extractedSymbolNames.contextHolder}.useContext)($5) !== $6.CREATE,
                        uAA = true /* $7($8) */,
                        dAA = $9(),
                        mAA = (0, ${extractedSymbolNames.facetHolder}.useSharedFacet)($10),
                        pAA = (0, ${extractedSymbolNames.facetHolder}.useSharedFacet)($11),
                        fAA = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((eAA) => eAA.worldSeed, [], [eAA]),
                        gAA = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((eAA) => eAA.isClipboardCopySupported, [], [mAA]),
                        EAA = (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                            (eAA, tAA, $2) => () => {
                                tAA.copyToClipboard(eAA), $2.queueSnackbar(iAA(".copyToClipboard"));
                            },
                            [iAA],
                            [fAA, mAA, pAA]
                        ),
                        hAA = sAA ? EAA : () => dAA.push("/create-new-world/seed-templates"),
                        $12 = sAA ? "" : iAA(".worldSeedPlaceholder"),
                        $13 = iAA(sAA ? ".worldSeedCopyButton" : ".worldSeedButton"),
                        y = (0, ${
                            extractedSymbolNames.facetHolder
                        }.useFacetMap)((eAA, tAA, $2) => tAA || ($2 && uAA && !sAA && eAA.generatorType != $14.Overworld), [uAA, sAA], [eAA, $3, tAA]);
                    return ${extractedSymbolNames.contextHolder}.createElement(
                              $15,
                              null,
                              ${extractedSymbolNames.contextHolder}.createElement($16, { data: gAA }, (eAA) =>
                                  /* sAA && !eAA
                                      ? ${extractedSymbolNames.contextHolder}.createElement($17, {
                                            disabled: sAA,
                                            label: iAA(".worldSeedLabel"),
                                            description: iAA(".worldSeedDescription"),
                                            maxLength: ${settings.maxTextLengthOverride === "" ? 1000000 : settings.maxTextLengthOverride},
                                            value: fAA,
                                            onChange: $2,
                                            placeholder: iAA(".worldSeedPlaceholder"),
                                            disabledNarrationSuffix: cAA(".narrationSuffixTemplateLocked"),
                                            "data-testid": "world-seed-text-field",
                                        })
                                      :  */${extractedSymbolNames.contextHolder}.createElement($17.WithButton, {
                                            buttonInputLegend: $13,
                                            buttonText: $13,
                                            buttonOnClick: hAA,
                                            textDisabled: false /* sAA */, // Modified
                                            disabled: false /* y */, // Modified
                                            label: iAA(".worldSeedLabel"),
                                            description: iAA(".worldSeedDescription") + (sAA ? " Please go to the Debug tab if you want to change the seed, as any changes made in this text box will not be saved." : ""),
                                            maxLength: ${settings.maxTextLengthOverride === "" ? 1000000 : settings.maxTextLengthOverride},
                                            value: fAA,
                                            onChange: $2,
                                            placeholder: $12,
                                            buttonNarrationHint: iAA(".narrationTemplatesButtonNarrationHint"),
                                            disabledNarrationSuffix: cAA(".narrationSuffixTemplateLocked"),
                                            "data-testid": "world-seed-with-button",
                                        })
                              )
                          );
                },`
                        );
                        successfullyReplaced = true;
                        break;
                    }
                }
                if (/^(gui\/)?dist\/hbui\/index-[0-9a-f]{5,20}\.js$/.test(filePath) && !successfullyReplaced) {
                    failedReplaces.push("allowForChangingSeeds");
                }
            }
            if (settings.allowForChangingFlatWorldPreset) {
                let successfullyReplacedA = false;
                let successfullyReplacedB = false;
                for (const regex of replacerRegexes.allowForChangingFlatWorldPreset[0]) {
                    if (regex.test(distData)) {
                        distData = distData.replace(
                            regex,
                            `${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.facetHolder}.Mount,{when:true},${extractedSymbolNames.contextHolder}.createElement($1,{value:(0,${extractedSymbolNames.facetHolder}.useFacetMap)((e=>e.useFlatWorld),[],[$2]),preset:(0,${extractedSymbolNames.facetHolder}.useFacetMap)((e=>e.flatWorldPreset),[],[$2]),onValueChanged:(0,${extractedSymbolNames.facetHolder}.useFacetCallback)((e=>t=>{e.useFlatWorld=t,t&&e.flatWorldPreset?$3($4[e.flatWorldPreset]):$3("")}),[$3],[$2]),onPresetChanged:(0,${extractedSymbolNames.facetHolder}.useFacetCallback)((e=>t=>{e.flatWorldPreset=t,e.useFlatWorld?$3($4[t]):c("")}),[$3],[$2]),disabled:false,hideAccordion:(0,${extractedSymbolNames.facetHolder}.useFacetMap)((e=>null==e.flatWorldPreset),[],[$2]),achievementsDisabledMessages:$5})))`
                        );
                        successfullyReplacedA = true;
                        break;
                    }
                }
                for (const { regex, replacement } of replacerRegexes.allowForChangingFlatWorldPreset[1]) {
                    if (regex.test(distData)) {
                        distData = distData.replace(regex, replacement);
                        successfullyReplacedB = true;
                        break;
                    }
                }
                if (/^(gui\/)?dist\/hbui\/index-[0-9a-f]{5,20}\.js$/.test(filePath) && origData.includes("flatWorldPreset")) {
                    if (!successfullyReplacedA) {
                        failedReplaces.push("allowForChangingFlatWorldPreset_enableToggleAndPresetSelector");
                    }
                    if (!successfullyReplacedB) {
                        failedReplaces.push("allowForChangingFlatWorldPreset_makePresetSelectorDropdownVisible");
                    }
                }
                if (/^(gui\/)?dist\/hbui\/index-[0-9a-f]{5,20}\.js$/.test(filePath) && origData.includes("flatWorldPreset") && !successfullyReplacedA) {
                    failedReplaces.push("allowForChangingFlatWorldPreset");
                }
            }
            if (settings.addDebugTab) {
                let successfullyReplacedA = false;
                let successfullyReplacedB = false;
                for (const regex of replacerRegexes.addDebugTab[0]) {
                    if (regex.test(distData)) {
                        distData = distData.replace(
                            regex,
                            `/**
             * The function for the Debug tab of the create and edit world screens.
             *
             * @param {object} param0
             * @param {RawWorldData} param0.worldData
             * @param {unknown} param0.achievementsDisabledMessages
             * @param {unknown} param0.onUnlockTemplateSettings
             * @param {unknown} param0.onExportTemplate
             * @param {unknown} param0.onClearPlayerData
             * @param {boolean} param0.isEditorWorld
             */
            function $1({
                worldData: eAA,
                achievementsDisabledMessages: tAA,
                onUnlockTemplateSettings: nAA,
                onExportTemplate: lAA,
                onClearPlayerData: oAA,
                isEditorWorld: iAA,
            }) {
                const c = (0, ${extractedSymbolNames.facetHolder}.useSharedFacet)($2),
                    s = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)(({ allBiomes: e }) => e, [], [c]),
                    u = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.isLockedTemplate, [], [eAA]),
                    d = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.achievementsDisabled, [], [eAA]),
                    m = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)(({ spawnDimensionId: e }) => e, [], [c]),
                    p = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => $3), [], [s]),
                    f = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e, t) => $4(e, (e) => e.dimension === t), [], [p, m]),
                    g = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.spawnBiomeId, [], [c]),
                    E = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.defaultSpawnBiome /* || e.isBiomeOverrideActive */, [], [c]),
                    E2 = (0, r.useFacetMap)((e, t, m) => e.defaultSpawnBiome || (e.isBiomeOverrideActive && m === 0) || t.length === 0, [], [c, f, m]),
                    h = (0, ${extractedSymbolNames.facetHolder}.useSharedFacet)($5),
                    v = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => true /* $6(e.platform) */ /* Makes the export world button always visible. */, [], [h]),
                    b = (0, ${extractedSymbolNames.contextHolder}.useContext)($7) !== $8.CREATE,
                    y = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e && b, [b], [v]),
                    rawData = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e, [], [eAA]);
                return ${extractedSymbolNames.contextHolder}.createElement(
                    $9,
                    null,
                    ${extractedSymbolNames.contextHolder}.createElement(
                        $10,
                        {
                            isLockedTemplate: u,
                            achievementsDisabled: d,
                            achievementsDisabledMessages: tAA,
                            narrationText: "Debug",
                            onUnlockTemplateSettings: nAA,
                            isEditorWorld: iAA,
                        },
                        ${extractedSymbolNames.contextHolder}.createElement(
                            $11,
                            null,
                            ${extractedSymbolNames.contextHolder}.createElement($12, {
                                title: "Flat nether",
                                description: "(this is not functional)",
                                gamepad: { index: 0 },
                                value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.flatNether, [], [c]),
                                onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                    (e) => (t) => {
                                        e.flatNether = t;
                                    },
                                    [],
                                    [c]
                                ),
                            })
                        ),
                        ${extractedSymbolNames.contextHolder}.createElement(
                            $11,
                            null,
                            ${extractedSymbolNames.contextHolder}.createElement($12, {
                                title: "Enable game version override",
                                // TODO: Add a config option to remove this extra information from the vanilla debug options.
                                description: "(this can only be set while creating the world)",
                                gamepad: { index: 1 },
                                value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.enableGameVersionOverride, [], [c]),
                                onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                    (e) => (t) => {
                                        e.enableGameVersionOverride = t;
                                    },
                                    [],
                                    [c]
                                ),
                            })
                        ),
                        ${extractedSymbolNames.contextHolder}.createElement(
                            $11,
                            null,
                            ${extractedSymbolNames.contextHolder}.createElement($13, {
                                label: "Game version override",
                                description: "(this can only be set while creating the world)",
                                gamepadIndex: 2,
                                placeholder: "0.0.0",
                                maxLength: 30000,
                                disabled: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => !e.enableGameVersionOverride, [], [c]),
                                value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.gameVersionOverride, [], [c]),
                                onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                    (e) => (t) => {
                                        e.gameVersionOverride = t;
                                    },
                                    [],
                                    [c]
                                ),
                            })
                        ),
                        ${extractedSymbolNames.contextHolder}.createElement($11, null, ${extractedSymbolNames.contextHolder}.createElement($14, { title: "World biome settings" })),
                        ${extractedSymbolNames.contextHolder}.createElement($12, {
                            title: "Default spawn biome",
                            description: "Using the default spawn biome will mean a random overworld spawn is selected (this can only be set while creating the world)",
                            gamepad: { index: 3 },
                            disabled: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => false /* e.isBiomeOverrideActive */, [], [c]),
                            value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.defaultSpawnBiome, [], [c]),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                (e) => (t) => {
                                    e.defaultSpawnBiome = t;
                                },
                                [],
                                [c]
                            ),
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement(
                            $11,
                            null,
                            ${extractedSymbolNames.contextHolder}.createElement($15, {
                                onMountComplete: (0, $16)(),
                                title: "Spawn dimension filter",
                                description: "(this can only be set while creating the world)",
                                disabled: E,
                                wrapToggleText: !0,
                                options: [
                                    // TEST: See if custom dimension IDs work here, also see what happens if I put a non-existent dimension ID, like -1, -2, 3, or 1000 (when no custom dimensions are defined). If so maybe add a number text box to allow inputting a custom dimension ID.
                                    { label: "Overworld", value: 0 },
                                    { label: "Nether", value: 1 },
                                    { label: "The End", value: 2 },
                                ],
                                value: m,
                                onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                    (e) => (t) => {
                                        e.spawnDimensionId = t;
                                    },
                                    [],
                                    [c]
                                ),
                            })
                        ),
                        ${extractedSymbolNames.contextHolder}.createElement(
                            $11,
                            null,
                            ${extractedSymbolNames.contextHolder}.createElement($17, {
                                title: "Spawn biome",
                                description: "(this can only be set while creating the world)",
                                options: f,
                                onItemSelect: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.spawnBiomeId = t), [], [c]),
                                disabled: E2,
                                value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e, t) => (t.filter((t) => t.value === e).length > 0 ? e : t[0]?.value), [], [g, f]),
                                focusOnSelectedItem: !0,
                            })
                        ),
                        ${extractedSymbolNames.contextHolder}.createElement($12, {
                            title: "Biome override",
                            description: "Set the world to a selected biome. This will override the Spawn biome! (if your spawn biome is in a different dimension, it will still work) (this can only be set while creating the world)",
                            gamepad: { index: 6 },
                            value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.isBiomeOverrideActive, [], [c]),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                (e) => (t) => {
                                    e.isBiomeOverrideActive = t;
                                },
                                [],
                                [c]
                            ),
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($17, {
                            title: "Biome override",
                            description: "Select biome to be used in the entire world (this can only be set while creating the world)",
                            // TODO: Add a config option to remove this extra information from the vanilla debug options, then add the BWE information to the description.
                            // description: "Select biome to be used in the entire world (this does not include cave biomes or The End biome, if you want to make the world into one of those biomes, you can do that using 8Crafter's Bedrock World Editor)",
                            options: p,
                            disabled: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => !e.isBiomeOverrideActive, [], [c]),
                            onItemSelect: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                (e) => (t) => {
                                    e.biomeOverrideId = t;
                                },
                                [],
                                [c]
                            ),
                            value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.biomeOverrideId, [], [c]),
                            focusOnSelectedItem: !0,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.facetHolder}.Mount, { when: y }, ${extractedSymbolNames.contextHolder}.createElement($18, { onExportTemplate: lAA, onClearPlayerData: oAA })),
                        ${extractedSymbolNames.contextHolder}.createElement($11, null, ${extractedSymbolNames.contextHolder}.createElement(rawValueEditor, { rawData: eAA })),
                        ${extractedSymbolNames.contextHolder}.createElement(() =>
                            ${extractedSymbolNames.contextHolder}.createElement(
                                ${extractedSymbolNames.contextHolder}.Fragment,
                                null,
                                ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.headerFunciton}, null, "Debug Info - Raw"),
                                ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.headerSpacingFunction}, { size: 1 }) /* 
                                ${extractedSymbolNames.contextHolder}.createElement($11, null, ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.editWorldTextFunction}.Text, null, "worldSummary: " + JSON.stringify(e.get(), undefined, 2))),
                                ${extractedSymbolNames.contextHolder}.createElement($11, null, ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.editWorldTextFunction}.Text, null, "worldData: " + JSON.stringify(u.get(), undefined, 2))),
                                ${extractedSymbolNames.contextHolder}.createElement($11, null, ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.editWorldTextFunction}.Text, null, "achievementsDisabledMessages: " + JSON.stringify(t.get(), undefined, 2))), */,
                                ${extractedSymbolNames.contextHolder}.createElement(
                                    $11,
                                    null,
                                    ${extractedSymbolNames.contextHolder}.createElement(
                                        function ({ children: e, align: t }) {
                                            return ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.jsText}, { type: "body", role: "inherit", align: t, shouldNarrate: !1, whiteSpace: "pre" }, e);
                                        },
                                        null,
                                        "rawData: " +
                                            JSON.stringify(
                                                {
                                                    ...rawData.get(),
                                                    betaFeatures: rawData.get().betaFeatures.map((v) => JSON.parse(JSON.stringify(v))),
                                                },
                                                undefined,
                                                2
                                            )
                                    )
                                ),
                                ${extractedSymbolNames.contextHolder}.createElement($13, {
                                    label: "rawData (read-only)",
                                    // gamepadIndex: 1,
                                    placeholder: "Raw Data JSON",
                                    maxLength: 3000000,
                                    value: JSON.stringify(
                                        {
                                            ...rawData.get(),
                                            betaFeatures: rawData.get().betaFeatures.map((v) => JSON.parse(JSON.stringify(v))),
                                        },
                                        undefined,
                                        0
                                    ),
                                    // onChange: d,
                                    filterProfanity: !1,
                                    disabled: false,
                                    title: "Raw Data as JSON",
                                }),
                                ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.headerFunciton}, null, "Debug Info - Property Descriptors"),
                                ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.headerSpacingFunction}, { size: 1 }) /* 
                                ${extractedSymbolNames.contextHolder}.createElement($11, null, ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.editWorldTextFunction}.Text, null, "worldSummary: " + JSON.stringify(Object.getOwnPropertyDescriptors(e.get()), undefined, 2))),
                                ${extractedSymbolNames.contextHolder}.createElement($11, null, ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.editWorldTextFunction}.Text, null, "worldData: " + JSON.stringify(Object.getOwnPropertyDescriptors(u.get()), undefined, 2))),
                                ${extractedSymbolNames.contextHolder}.createElement($11, null, ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.editWorldTextFunction}.Text, null, "achievementsDisabledMessages: " + JSON.stringify(Object.getOwnPropertyDescriptors(t.get()), undefined, 2))), */,
                                ${extractedSymbolNames.contextHolder}.createElement(
                                    $11,
                                    null,
                                    ${extractedSymbolNames.contextHolder}.createElement(
                                        function ({ children: e, align: t }) {
                                            return ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.jsText}, { type: "body", role: "inherit", align: t, shouldNarrate: !1, whiteSpace: "pre" }, e);
                                        },
                                        null,
                                        "rawData: " +
                                            JSON.stringify(
                                                {
                                                    ...Object.getOwnPropertyDescriptors(rawData.get()),
                                                    general: {
                                                        ...Object.getOwnPropertyDescriptor(rawData.get(), "general"),
                                                        value: Object.getOwnPropertyDescriptors(rawData.get().general),
                                                    },
                                                },
                                                undefined,
                                                2
                                            )
                                    )
                                ),
                                ${extractedSymbolNames.contextHolder}.createElement($13, {
                                    label: "rawData (Property Descriptors) (read-only)",
                                    // gamepadIndex: 1,
                                    placeholder: "Raw Data JSON",
                                    maxLength: 3000000,
                                    value: JSON.stringify(Object.getOwnPropertyDescriptors(rawData.get()), undefined, 0),
                                    // onChange: d,
                                    filterProfanity: !1,
                                    disabled: false,
                                    title: "Raw Data as JSON",
                                })
                            )
                        )
                    )
                );
            }
            /**
             * a
             * @param {Object} param0
             * @param {RawWorldData} param0.rawData
             */
            function rawValueEditor({ rawData: eAA }) {
                const { t: c } = ${extractedSymbolNames.translationStringResolver}("CreateNewWorld.general") /* ,
                s = 1 == (0, ${extractedSymbolNames.facetHolder}.useFacetUnwrap)(nAA) ? ".editor" : "",
                u = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.worldName, [], [oAA]),
                d = (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.worldName = t), [], [oAA]) */,
                    rawData = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e, [], [eAA]),
                    PHD = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.general, [], [eAA]),
                    p = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.general, [], [eAA]),
                    g = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.playerHasDied, [], [p]),
                    playerPermissionsChange = (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.multiplayer.playerPermissions = Number(t)), [], [rawData]);
                // e.achievementsPermanentlyDisabled = false; // Modified
                // rawData.get().general.playerHasDied = false;
                return ${extractedSymbolNames.contextHolder}.createElement(
                    ${extractedSymbolNames.contextHolder}.Fragment,
                    null,
                    ${extractedSymbolNames.contextHolder}.createElement(
                        $11,
                        null,
                        ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.headerFunciton}, null, "Raw Value Editor"),
                        ${extractedSymbolNames.contextHolder}.createElement($13, {
                            label: "worldSeed",
                            description: "The seed of the world. (advanced.worldSeed)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().advanced.worldSeed,
                            maxLength: 3000,
                            value: String(rawData.get().advanced.worldSeed ?? ""),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.advanced.worldSeed = t), [], [rawData]),
                            filterProfanity: !1,
                            disabled: false,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($13, {
                            label: "playerPermissions",
                            description: "?. (multiplayer.playerPermissions)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().multiplayer.playerPermissions,
                            maxLength: 3000,
                            value: String(rawData.get().multiplayer.playerPermissions ?? ""),
                            onChange: playerPermissionsChange,
                            filterProfanity: !1,
                            disabled: false,
                            title: "Player Permissions",
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($13, {
                            label: "playerAccess",
                            description: "?. (multiplayer.playerAccess)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().multiplayer.playerAccess,
                            maxLength: 3000,
                            value: String(rawData.get().multiplayer.playerAccess ?? ""),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.multiplayer.playerAccess = Number(t)), [], [rawData]),
                            filterProfanity: !1,
                            disabled: false,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($13, {
                            label: "gameMode",
                            description: "?. (general.gameMode)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().general.gameMode,
                            maxLength: 3000,
                            value: String(rawData.get().general.gameMode ?? ""),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.general.gameMode = Number(t)), [], [rawData]),
                            filterProfanity: !1,
                            disabled: false,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($13, {
                            label: "difficulty",
                            description: "?. (general.difficulty)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().general.difficulty,
                            maxLength: 3000,
                            value: String(rawData.get().general.difficulty ?? ""),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.general.difficulty = Number(t)), [], [rawData]),
                            filterProfanity: !1,
                            disabled: false,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($13, {
                            label: "generatorType",
                            description: "?. (advanced.generatorType)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().advanced.generatorType,
                            maxLength: 3000,
                            value: String(rawData.get().advanced.generatorType ?? ""),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.advanced.generatorType = Number(t)), [], [rawData]),
                            filterProfanity: !1,
                            disabled: false,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($13, {
                            label: "simulationDistance",
                            description: "The simulation distance. Sadly this cannot be set lower or higher than the option in the Advanced tab allows. However, this can be set to odd numbers within that range. (advanced.simulationDistance)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().advanced.simulationDistance,
                            maxLength: 3000,
                            value: String(rawData.get().advanced.simulationDistance ?? ""),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.advanced.simulationDistance = Number(t)), [], [rawData]),
                            filterProfanity: !1,
                            disabled: false,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($12, {
                            title: "achievementsDisabled (read-only)",
                            disabled: true,
                            description: "Whether or not achievements are disabled. (it is not possible to change this through the UI)",
                            value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((/** @type {ReturnType<RawWorldData["get"]>} */ e) => e.achievementsDisabled, [], [eAA]),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                (/** @type {ReturnType<RawWorldData["get"]>} */ e) => (t) => (e.achievementsDisabled = t),
                                [],
                                [rawData]
                            ),
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($12, {
                            title: "achievementsPermanentlyDisabled (read-only)",
                            soundEffectPressed: "ui.hardcore_toggle_press",
                            disabled: true,
                            description: "Whether or not achievements are permanently disabled. (it is not possible to change this through the UI)",
                            value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((/** @type {ReturnType<RawWorldData["get"]>} */ e) => e.achievementsPermanentlyDisabled, [], [eAA]),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                (/** @type {ReturnType<RawWorldData["get"]>} */ e) => (t) => (e.achievementsPermanentlyDisabled = t),
                                [],
                                [rawData]
                            ),
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($12, {
                            title: "isUsingTemplate (read-only)",
                            disabled: true,
                            description: "isUsingTemplate (it is not possible to change this through the UI)",
                            value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((/** @type {ReturnType<RawWorldData["get"]>} */ e) => e.isUsingTemplate, [], [eAA]),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                (/** @type {ReturnType<RawWorldData["get"]>} */ e) => (t) => (e.isUsingTemplate = t),
                                [],
                                [rawData]
                            ),
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($12, {
                            title: "isLockedTemplate",
                            disabled: false,
                            description: "isLockedTemplate",
                            value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((/** @type {ReturnType<RawWorldData["get"]>} */ e) => e.isLockedTemplate, [], [eAA]),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                (/** @type {ReturnType<RawWorldData["get"]>} */ e) => (t) => (e.isLockedTemplate = t),
                                [],
                                [rawData]
                            ),
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($12, {
                            title: "playerHasDied (read-only)",
                            disabled: true,
                            description: "readonly general.playerHasDied (it is not possible to change this through the UI)",
                            value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.playerHasDied, [], [p]),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.playerHasDied = t), [], [p]),
                        })
                    )
                );
            }`
                        );
                        successfullyReplacedA = true;
                        break;
                    }
                }
                for (const { regex, replacement } of replacerRegexes.addDebugTab[1]) {
                    if (regex.test(distData)) {
                        distData = distData.replace(regex, replacement);
                        successfullyReplacedB = true;
                        break;
                    }
                }
                if (/^(gui\/)?dist\/hbui\/index-[0-9a-f]{5,20}\.js$/.test(filePath)) {
                    if (!successfullyReplacedA) {
                        failedReplaces.push("addDebugTab_replaceTab");
                    }
                    if (!successfullyReplacedB) {
                        // console.log(replacerRegexes.addDebugTab[1][0], "\n\n\n");
                        failedReplaces.push("addDebugTab_makeVisible");
                    }
                }
            }
            distData = applyColorReplacementsToFileContents(distData, filePath, settings, { themeColorReplacementsJSONData });
            if (/(?=<script defer="defer" src="\/hbui\/(?:index|gameplay|editor)-[a-zA-Z0-9]+\.js"><\/script>)/.test(distData)) {
                distData = distData.replace(
                    /(?=<script defer="defer" src="\/hbui\/(?:index|gameplay|editor)-[a-zA-Z0-9]+\.js"><\/script>)/,
                    `<script defer="defer" src="/hbui/oreUICustomizer8CrafterConfig.js"></script>
        <script defer="defer" src="/hbui/class_path.js"></script>
        <script defer="defer" src="/hbui/css.js"></script>
        <script defer="defer" src="/hbui/JSONB.js"></script>
        <script defer="defer" src="/hbui/customOverlays.js"></script>
        `
                );
            } else {
                distData = distData.replace(
                    /(?=<\/head>)/,
                    `<script defer="defer" src="/hbui/oreUICustomizer8CrafterConfig.js"></script>
        <script defer="defer" src="/hbui/class_path.js"></script>
        <script defer="defer" src="/hbui/css.js"></script>
        <script defer="defer" src="/hbui/JSONB.js"></script>
        <script defer="defer" src="/hbui/customOverlays.js"></script>
        `
                );
            }
            if (/(?<=<link href="\/hbui\/gameplay-theme(?:-[a-zA-Z0-9]+)?\.css" rel="stylesheet">)/.test(distData)) {
                distData = distData.replace(
                    /(?<=<link href="\/hbui\/gameplay-theme(?:-[a-zA-Z0-9]+)?\.css" rel="stylesheet">)/,
                    `
        <link href="/hbui/customOverlays.css" rel="stylesheet" />`
                );
            } else {
                distData = distData.replace(
                    /(?=<\/head>)/,
                    `
        <link href="/hbui/customOverlays.css" rel="stylesheet" />`
                );
            }
            distData = distData
                .replace(
                    new RegExp(
                        `(?<=\\{title:(?:[a-zA-Z0-9_$]{1})\\("\\.bonusChestTitle"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.bonusChestDescription"\\),value:\\(0,(?:[a-zA-Z0-9_$]{1})\\.useFacetMap\\)\\(\\(\\((?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\)=>!(?:[a-zA-Z0-9_$]{1})&&(?:[a-zA-Z0-9_$]{1})\\.bonusChest\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\]\\),onChange:\\(0,(?:[a-zA-Z0-9_$]{1})\\.useFacetCallback\\)\\(\\((?:[a-zA-Z0-9_$]{1})=>(?:[a-zA-Z0-9_$]{1})=>\\{(?:[a-zA-Z0-9_$]{1})\\.bonusChest=(?:[a-zA-Z0-9_$]{1})\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),disabled:)(?:[a-zA-Z0-9_$]{1})(?=,visible:(?:[a-zA-Z0-9_$]{1})\\})`
                    ),
                    `false`
                )
                .replace(
                    new RegExp(
                        `(?<=\\{title:(?:[a-zA-Z0-9_$]{1})\\("\\.startWithMapTitle"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.startWithMapDescription"\\),value:\\(0,(?:[a-zA-Z0-9_$]{1})\\.useFacetMap\\)\\(\\(\\((?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\)=>!(?:[a-zA-Z0-9_$]{1})&&(?:[a-zA-Z0-9_$]{1})\\.startWithMap\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\]\\),onChange:\\(0,(?:[a-zA-Z0-9_$]{1})\\.useFacetCallback\\)\\(\\((?:[a-zA-Z0-9_$]{1})=>(?:[a-zA-Z0-9_$]{1})=>\\{(?:[a-zA-Z0-9_$]{1})\\.startWithMap=(?:[a-zA-Z0-9_$]{1})\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),disabled:)(?:[a-zA-Z0-9_$]{1})(?=,visible:(?:[a-zA-Z0-9_$]{1})\\})`
                    ),
                    `false`
                )
                .replace(
                    new RegExp(
                        `(?<=\\{title:(?:[a-zA-Z0-9_$]{1})\\("\\.useFlatWorldTitle"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.useFlatWorldDescription"\\),value:\\(0,(?:[a-zA-Z0-9_\\$]{1}).useFacetMap\\)\\(\\((?:[a-zA-Z0-9_$]{1})=>(?:[a-zA-Z0-9_$]{1})\\.useFlatWorld\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),onChange:\\(0,(?:[a-zA-Z0-9_$]{1})\\.useFacetCallback\\)\\(\\((?:[a-zA-Z0-9_$]{1})=>(?:[a-zA-Z0-9_$]{1})=>\\{(?:[a-zA-Z0-9_$]{1})\\.useFlatWorld=(?:[a-zA-Z0-9_$]{1})\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),onNarrationText:(?:[a-zA-Z0-9_$]{1})\\("\\.narrationSuffixDisablesAchievements"\\),offNarrationText:\\(0,(?:[a-zA-Z0-9_$]{1})\\.useFacetMap\\)\\(\\((?:[a-zA-Z0-9_$]{1})=>0===(?:[a-zA-Z0-9_$]{1})\\.length\\?(?:[a-zA-Z0-9_$]{1})\\("\\.narrationSuffixEnablesAchievements"\\):void 0\\),\\[(?:[a-zA-Z0-9_$]{1})\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),disabled:)(?:[a-zA-Z0-9_$]{1})(?=,visible:(?:[a-zA-Z0-9_$]{1})\\})`
                    ),
                    `false`
                );
            if (settings.maxTextLengthOverride !== "") {
                const origDistData = distData;
                const textLengthValues = distData.matchAll(/maxLength(:\s?)([0-9]+)/g);
                const values = [...textLengthValues];
                // console.warn(`maxTextLengthOverrideReplacementsLength: ${values.length}`);
                for (const textLengthValue of values) {
                    distData = distData.replace(
                        textLengthValue[0],
                        `maxLength${textLengthValue[1]}${
                            settings.maxTextLengthOverride /* BigInt(settings.maxTextLengthOverride) > BigInt(textLengthValue[1]) ? settings.maxTextLengthOverride : textLengthValue[1] */
                        }`
                    );
                }
                if (/^(gui\/)?dist\/hbui\/index-[0-9a-f]{5,20}\.js$/.test(filePath) && distData === origDistData) {
                    failedReplaces.push("maxTextLengthOverride");
                }
            } else {
                console.warn("maxTextLengthOverride is empty");
            }
            if (settings.add8CrafterUtilitiesMainMenuButton) {
                let successfullyReplaced = false;
                let [disabledVariableSymbolName, focusGridIndexVariableSymbolName, navbarButtonImageClass] =
                    origData
                        .match(
                            /DebugButton=function\(\{onClick:e,selected:t,disabled:([a-zA-Z0-9_$]{1}),focusGridIndex:([a-zA-Z0-9_$]{1}),role:l="inherit",narrationText:o\}\)\{const\{t:(?:[a-zA-Z0-9_$]{1})\}=(?:[a-zA-Z0-9_$]{2})\("NavigationBarLayout\.DebugButton"\);return (?:[a-zA-Z0-9_$]{1})\.createElement\((?:(?:[a-zA-Z0-9_$]{1})\.Fragment,null,(?:[a-zA-Z0-9_$]{1})\.createElement\((?:[a-zA-Z0-9_$]{2})|(?:[a-zA-Z0-9_$]{2})),\{(?:className:"(?:[a-zA-Z0-9_$]{5,})",)?disabled:(?:[a-zA-Z0-9_$]{1}),focusGridIndex:(?:[a-zA-Z0-9_$]{1}),inputLegend:(?:[a-zA-Z0-9_$]{1})\("\.inputLegend"\),narrationText:null!=o\?o:(?:[a-zA-Z0-9_$]{1})\("\.narration"\),onClick:e,role:l,selected:t\},(?:(?:[a-zA-Z0-9_$]{1})\.createElement\("div",\{className:"(?:[a-zA-Z0-9_$]{5,})"\},)?(?:[a-zA-Z0-9_$]{1})\.createElement\((?:[a-zA-Z0-9_$]{2}),\{className:"([a-zA-Z0-9_$]{5,})",imageRendering:"pixelated",src:(?:[a-zA-Z0-9_$]{2})\}/
                        )
                        ?.slice(1, 4) ?? [];
                disabledVariableSymbolName ??= "n";
                focusGridIndexVariableSymbolName ??= "r";
                navbarButtonImageClass ??= "QQfwv";
                for (const regex of replacerRegexes.add8CrafterUtilitiesMainMenuButton[0]) {
                    if (regex.test(distData)) {
                        distData = distData.replace(
                            regex,
                            `${extractedSymbolNames.contextHolder}.createElement(
                                                    ${extractedSymbolNames.facetHolder}.Mount,
                                                    { when: true },
                                                    ${extractedSymbolNames.contextHolder}.createElement(
                                                        ${extractedSymbolNames.contextHolder}.Fragment,
                                                        null,
                                                        ${extractedSymbolNames.contextHolder}.createElement($3.Divider, null),
                                                        ${extractedSymbolNames.contextHolder}.createElement(() =>
                                                            ${extractedSymbolNames.contextHolder}.createElement(
                                                                function ({ onClick: eAA, selected: tAA, disabled: ${disabledVariableSymbolName}AAQ1, focusGridIndex: rAA, role: lAA = "inherit" }) {
                                                                    return ${extractedSymbolNames.contextHolder}.createElement(
                                                                        ${extractedSymbolNames.contextHolder}.Fragment,
                                                                        null,
                                                                        ${extractedSymbolNames.contextHolder}.createElement(
                                                                            ${extractedSymbolNames.navbarButtonFunction},
                                                                            {
                                                                                disabled: ${disabledVariableSymbolName}AAQ1,
                                                                                // focusGridIndex: rAA,
                                                                                inputLegend: "8Crafter Utilities",
                                                                                // narrationText: "8Crafter Utilities Button",
                                                                                onClick: eAA,
                                                                                role: lAA,
                                                                                selected: tAA,
                                                                                className: "reverse_m2lNR_rightPadding",
                                                                            },
                                                                            ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.navbarButtonImageFunction}, {
                                                                                className: "${navbarButtonImageClass}",
                                                                                imageRendering: "pixelated",
                                                                                src: "assets/8crafter.gif",
                                                                                isAnimated: true,
                                                                            })
                                                                        )
                                                                    );
                                                                },
                                                                {
                                                                    onClick: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                                                        () => () => {
                                                                            if (mainMenu8CrafterUtilities.style.display === "none") {
                                                                                mainMenu8CrafterUtilities.style.display = "block";
                                                                            } else {
                                                                                mainMenu8CrafterUtilities.style.display = "none";
                                                                            }
                                                                        },
                                                                        ["", [], () => {}],
                                                                        []
                                                                    ),
                                                                }
                                                            )
                                                        )
                                                    )
                                                ),
                                                ${extractedSymbolNames.contextHolder}.createElement(
                                                    ${extractedSymbolNames.facetHolder}.Mount,
                                                    { when: $1 },
                                                    ${extractedSymbolNames.contextHolder}.createElement(
                                                        ${extractedSymbolNames.contextHolder}.Fragment,
                                                        null,
                                                        $2
                                                        ${extractedSymbolNames.contextHolder}.createElement($3.Divider, null),
                                                        ${extractedSymbolNames.contextHolder}.createElement($4, { onClick: $5, screenAnalyticsId: $6 })
                                                    )
                                                )`
                        );
                        successfullyReplaced = true;
                        break;
                    }
                }
                if (/^(gui\/)?dist\/hbui\/index-[0-9a-f]{5,20}\.js$/.test(filePath) && !successfullyReplaced) {
                    failedReplaces.push("add8CrafterUtilitiesMainMenuButton");
                }
            }
            for (const plugin of plugins) {
                if (plugin.namespace !== "built-in" || (settings.enabledBuiltInPlugins[plugin.id as keyof typeof settings.enabledBuiltInPlugins] ?? true)) {
                    for (const action of plugin.actions) {
                        if (action.context !== "per_text_file") continue;
                        try {
                            distData = await action.action(distData, entry, zipFs);
                        } catch (e) {
                            console.error(e);
                            failedReplaces.push(`${plugin.namespace !== "built-in" ? `${plugin.namespace}:` : ""}${plugin.id}:${action.id}`);
                        }
                    }
                }
            }
            if (failedReplaces.length > 0) allFailedReplaces[filePath] = failedReplaces;
            if (origData !== distData) {
                // FIXME: Add sanitization to escape possible comment escaping strings.
                if (filePath.endsWith(".js")) {
                    distData = `// Modified by 8Crafter's Ore UI Customizer v${format_version}: https://www.8crafter.com/utilities/ore-ui-customizer\n// Options: ${JSON.stringify(
                        {
                            ...settings,
                            plugins: settings.plugins?.map((plugin) => ({ ...plugin, dataURI: "...", icon_data_uri: "..." })),
                            themes: settings.themes?.map((theme) => ({ ...theme, dataURI: "...", icon_data_uri: "..." })),
                        }
                    )}\n${distData}`;
                } else if (filePath.endsWith(".css")) {
                    distData = `/* Modified by 8Crafter's Ore UI Customizer v${format_version}: https://www.8crafter.com/utilities/ore-ui-customizer */\n/* Options: ${JSON.stringify(
                        {
                            ...settings,
                            plugins: settings.plugins?.map((plugin) => ({ ...plugin, dataURI: "...", icon_data_uri: "..." })),
                            themes: settings.themes?.map((theme) => ({ ...theme, dataURI: "...", icon_data_uri: "..." })),
                        }
                    )} */\n${distData}`;
                } else if (filePath.endsWith(".html")) {
                    distData = `<!-- Modified by 8Crafter's Ore UI Customizer v${format_version}: https://www.8crafter.com/utilities/ore-ui-customizer -->\n<!-- Options: ${JSON.stringify(
                        {
                            ...settings,
                            plugins: settings.plugins?.map((plugin) => ({ ...plugin, dataURI: "...", icon_data_uri: "..." })),
                            themes: settings.themes?.map((theme) => ({ ...theme, dataURI: "...", icon_data_uri: "..." })),
                        }
                    )} -->\n${distData}`;
                }
                entry.replaceText(distData);
                log(`Entry ${entry.name} has been successfully modified.`);
                modifiedCount++;
                editedCount++;
            } else {
                // log(`Entry ${entry.name} has not been modified.`);
                unmodifiedCount++;
            }
        } else {
            console.error("Entry is not a ZipFileEntry but has a file extension of js, html, or css: " + filePath);
            unmodifiedCount++;
        }
    }
    try {
        zipFs.addBlob("gui/dist/hbui/assets/8crafter.gif", await fetchFileBlob("./assets/oreui/assets/8crafter.gif"));
        log("Added gui/dist/hbui/assets/8crafter.gif");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/Information_icon.png", await fetchFileBlob("./assets/oreui/assets/Information_icon.png"));
        log("Added gui/dist/hbui/assets/Information_icon.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/Readonly_icon.png", await fetchFileBlob("./assets/oreui/assets/Readonly_icon.png"));
        log("Added gui/dist/hbui/assets/Readonly_icon.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/Nonconfigurable_icon.png", await fetchFileBlob("./assets/oreui/assets/Nonconfigurable_icon.png"));
        log("Added gui/dist/hbui/assets/Nonconfigurable_icon.png");
        addedCount++;
        // Toggle
        zipFs.addBlob("gui/dist/hbui/assets/toggle_off_hover.png", await fetchFileBlob("./assets/oreui/assets/toggle_off_hover.png"));
        log("Added gui/dist/hbui/assets/toggle_off_hover.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/toggle_off.png", await fetchFileBlob("./assets/oreui/assets/toggle_off.png"));
        log("Added gui/dist/hbui/assets/toggle_off.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/toggle_on_hover.png", await fetchFileBlob("./assets/oreui/assets/toggle_on_hover.png"));
        log("Added gui/dist/hbui/assets/toggle_on_hover.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/toggle_on.png", await fetchFileBlob("./assets/oreui/assets/toggle_on.png"));
        log("Added gui/dist/hbui/assets/toggle_on.png");
        addedCount++;
        // Radio
        zipFs.addBlob("gui/dist/hbui/assets/radio_off_hover.png", await fetchFileBlob("./assets/oreui/assets/radio_off_hover.png"));
        log("Added gui/dist/hbui/assets/radio_off_hover.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/radio_off.png", await fetchFileBlob("./assets/oreui/assets/radio_off.png"));
        log("Added gui/dist/hbui/assets/radio_off.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/radio_on_hover.png", await fetchFileBlob("./assets/oreui/assets/radio_on_hover.png"));
        log("Added gui/dist/hbui/assets/radio_on_hover.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/radio_on.png", await fetchFileBlob("./assets/oreui/assets/radio_on.png"));
        log("Added gui/dist/hbui/assets/radio_on.png");
        addedCount++;
        // Checkbox
        // to-do
        // Textboxes
        zipFs.addBlob("gui/dist/hbui/assets/edit_box_indent_hover.png", await fetchFileBlob("./assets/oreui/assets/edit_box_indent_hover.png"));
        log("Added gui/dist/hbui/assets/edit_box_indent_hover.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/edit_box_indent.png", await fetchFileBlob("./assets/oreui/assets/edit_box_indent.png"));
        log("Added gui/dist/hbui/assets/edit_box_indent.png");
        addedCount++;
        // Buttons
        zipFs.addBlob("gui/dist/hbui/assets/button_borderless_dark.png", await fetchFileBlob("./assets/oreui/assets/button_borderless_dark.png"));
        log("Added gui/dist/hbui/assets/button_borderless_dark.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/button_borderless_light.png", await fetchFileBlob("./assets/oreui/assets/button_borderless_light.png"));
        log("Added gui/dist/hbui/assets/button_borderless_light.png");
        addedCount++;
        zipFs.addBlob(
            "gui/dist/hbui/assets/button_borderless_light_blue_default.png",
            await fetchFileBlob("./assets/oreui/assets/button_borderless_light_blue_default.png")
        );
        log("Added gui/dist/hbui/assets/button_borderless_light_blue.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/button_borderless_darkhover.png", await fetchFileBlob("./assets/oreui/assets/button_borderless_darkhover.png"));
        log("Added gui/dist/hbui/assets/button_borderless_darkhover.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/button_borderless_lighthover.png", await fetchFileBlob("./assets/oreui/assets/button_borderless_lighthover.png"));
        log("Added gui/dist/hbui/assets/button_borderless_lighthover.png");
        addedCount++;
        zipFs.addBlob(
            "gui/dist/hbui/assets/button_borderless_light_blue_hover.png",
            await fetchFileBlob("./assets/oreui/assets/button_borderless_light_blue_hover.png")
        );
        log("Added gui/dist/hbui/assets/button_borderless_light_blue_hover.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/button_borderless_darkpressed.png", await fetchFileBlob("./assets/oreui/assets/button_borderless_darkpressed.png"));
        log("Added gui/dist/hbui/assets/button_borderless_darkpressed.png");
        addedCount++;
        zipFs.addBlob(
            "gui/dist/hbui/assets/button_borderless_lightpressed.png",
            await fetchFileBlob("./assets/oreui/assets/button_borderless_lightpressed.png")
        );
        log("Added gui/dist/hbui/assets/button_borderless_lightpressed.png");
        addedCount++;
        zipFs.addBlob(
            "gui/dist/hbui/assets/button_borderless_light_blue_hover_pressed.png",
            await fetchFileBlob("./assets/oreui/assets/button_borderless_light_blue_hover_pressed.png")
        );
        log("Added gui/dist/hbui/assets/button_borderless_light_blue_hover_pressed.png");
        addedCount++;
        zipFs.addBlob(
            "gui/dist/hbui/assets/button_borderless_darkpressednohover.png",
            await fetchFileBlob("./assets/oreui/assets/button_borderless_darkpressednohover.png")
        );
        log("Added gui/dist/hbui/assets/button_borderless_darkpressednohover.png");
        addedCount++;
        zipFs.addBlob(
            "gui/dist/hbui/assets/button_borderless_lightpressednohover.png",
            await fetchFileBlob("./assets/oreui/assets/button_borderless_lightpressednohover.png")
        );
        log("Added gui/dist/hbui/assets/button_borderless_lightpressednohover.png");
        addedCount++;
        zipFs.addBlob(
            "gui/dist/hbui/assets/button_borderless_light_blue_pressed.png",
            await fetchFileBlob("./assets/oreui/assets/button_borderless_light_blue_pressed.png")
        );
        log("Added gui/dist/hbui/assets/button_borderless_light_blue_pressed.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/disabledButton.png", await fetchFileBlob("./assets/oreui/assets/disabledButton.png"));
        log("Added gui/dist/hbui/assets/disabledButton.png");
        addedCount++;
    } catch (e) {
        console.error(e);
        allFailedReplaces.steps ??= [];
        allFailedReplaces.steps.push("addCustomizerImageAssets");
    }
    try {
        zipFs.addText(
            "gui/dist/hbui/oreUICustomizer8CrafterConfig.js",
            `const oreUICustomizerConfig = ${JSON.stringify(
                {
                    ...settings,
                    preloadedPlugins: undefined,
                    activePluginsDetails: [
                        ...(options.settings?.plugins?.map(
                            (plugin: EncodedPluginData): NonNullable<OreUICustomizerSettings["activePluginsDetails"]>[number] => ({
                                format_version: plugin.format_version,
                                id: plugin.id,
                                name: plugin.name,
                                namespace: plugin.namespace,
                                uuid: plugin.uuid,
                                version: plugin.version,
                                checkForUpdatesDetails: plugin.checkForUpdatesDetails,
                                dependencies: plugin.dependencies,
                                description: plugin.description,
                                icon_data_uri: plugin.icon_data_uri,
                                min_engine_version: plugin.min_engine_version,
                                marketplaceDetails: plugin.marketplaceDetails,
                                metadata: plugin.metadata,
                            })
                        ) ?? []),
                        ...(options.settings?.preloadedPlugins?.map((plugin: Plugin): NonNullable<OreUICustomizerSettings["activePluginsDetails"]>[number] => ({
                            format_version: plugin.format_version,
                            id: plugin.id,
                            name: plugin.name,
                            namespace: plugin.namespace,
                            uuid: plugin.uuid,
                            version: plugin.version,
                            checkForUpdatesDetails: plugin.checkForUpdatesDetails,
                            dependencies: plugin.dependencies,
                            description: plugin.description,
                            icon_data_uri: plugin.icon_data_uri,
                            min_engine_version: plugin.min_engine_version,
                            marketplaceDetails: plugin.marketplaceDetails,
                            metadata: plugin.metadata,
                        })) ?? []),
                    ],
                    plugins: options.settings?.bundleEncodedPluginDataInConfigFile ? options.settings?.plugins : undefined,
                    themes: options.settings?.bundleEncodedThemeDataInConfigFile ? options.settings?.themes : undefined,
                } as OreUICustomizerSettings,
                undefined,
                4
            )};
const oreUICustomizerVersion = ${JSON.stringify(format_version)};`
        );
        log("Added gui/dist/hbui/oreUICustomizer8CrafterConfig.js");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/oreUICustomizer8CrafterConfig.d.ts", await fetchFileBlob("./assets/oreui/oreUICustomizer8CrafterConfig.d.ts"));
        log("Added gui/dist/hbui/oreUICustomizer8CrafterConfig.d.ts");
        addedCount++;
    } catch (e) {
        console.error(e);
        allFailedReplaces.steps ??= [];
        allFailedReplaces.steps.push("addCustomizerConfigFile");
    }
    try {
        zipFs.addBlob("gui/dist/hbui/customOverlays.js", await fetchFileBlob("./assets/oreui/customOverlays.js"));
        log("Added gui/dist/hbui/customOverlays.js");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/customOverlays.js.map", await fetchFileBlob("./assets/oreui/customOverlays.js.map"));
        log("Added gui/dist/hbui/customOverlays.js.map");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/customOverlays.d.ts", await fetchFileBlob("./assets/oreui/customOverlays.d.ts"));
        log("Added gui/dist/hbui/customOverlays.d.ts");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/customOverlays.css", await fetchFileBlob("./assets/oreui/customOverlays.css"));
        log("Added gui/dist/hbui/customOverlays.css");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/class_path.js", await fetchFileBlob("./assets/oreui/class_path.js"));
        log("Added gui/dist/hbui/class_path.js");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/class_path.js.map", await fetchFileBlob("./assets/oreui/class_path.js.map"));
        log("Added gui/dist/hbui/class_path.js.map");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/class_path.d.ts", await fetchFileBlob("./assets/oreui/class_path.d.ts"));
        log("Added gui/dist/hbui/class_path.d.ts");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/css.js", await fetchFileBlob("./assets/oreui/css.js"));
        log("Added gui/dist/hbui/css.js");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/css.js.map", await fetchFileBlob("./assets/oreui/css.js.map"));
        log("Added gui/dist/hbui/css.js.map");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/css.d.ts", await fetchFileBlob("./assets/oreui/css.d.ts"));
        log("Added gui/dist/hbui/css.d.ts");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/JSONB.js", await fetchFileBlob("./assets/oreui/JSONB.js"));
        log("Added gui/dist/hbui/JSONB.js");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/JSONB.js.map", await fetchFileBlob("./assets/oreui/JSONB.js.map"));
        log("Added gui/dist/hbui/JSONB.js.map");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/JSONB.d.ts", await fetchFileBlob("./assets/oreui/JSONB.d.ts"));
        log("Added gui/dist/hbui/JSONB.d.ts");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/types.d.ts", await fetchFileBlob("./assets/oreui/types.d.ts"));
        log("Added gui/dist/hbui/types.d.ts");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/@ore-ui-types/enums", await fetchFileBlob("./assets/oreui/@ore-ui-types/enums"));
        log("Added gui/dist/hbui/@ore-ui-types/enums");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/@ore-ui-types/enums.map", await fetchFileBlob("./assets/oreui/@ore-ui-types/enums.map"));
        log("Added gui/dist/hbui/@ore-ui-types/enums.map");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/chevron_new_white_right.png", await fetchFileBlob("./assets/oreui/assets/chevron_new_white_right.png"));
        log("Added gui/dist/hbui/assets/chevron_new_white_right.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/chevron_white_down.png", await fetchFileBlob("./assets/oreui/assets/chevron_white_down.png"));
        log("Added gui/dist/hbui/assets/chevron_white_down.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/assets/chevron_white_up.png", await fetchFileBlob("./assets/oreui/assets/chevron_white_up.png"));
        log("Added gui/dist/hbui/assets/chevron_white_up.png");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/fonts/consola.ttf", await fetchFileBlob("./assets/oreui/fonts/consola.ttf"));
        log("Added gui/dist/hbui/fonts/consola.ttf");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/fonts/consolab.ttf", await fetchFileBlob("./assets/oreui/fonts/consolab.ttf"));
        log("Added gui/dist/hbui/fonts/consolab.ttf");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/fonts/consolai.ttf", await fetchFileBlob("./assets/oreui/fonts/consolai.ttf"));
        log("Added gui/dist/hbui/fonts/consolai.ttf");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/fonts/consolaz.ttf", await fetchFileBlob("./assets/oreui/fonts/consolaz.ttf"));
        log("Added gui/dist/hbui/fonts/consolaz.ttf");
        addedCount++;
    } catch (e) {
        console.error(e);
        allFailedReplaces.steps ??= [];
        allFailedReplaces.steps.push("addCustomizerUIAssets");
    }
    try {
        const themesAssetsData: ThemeAssetsData[] = getAssetsDataForThemes(themes);
        try {
            await Promise.all(
                themesAssetsData.flatMap((themeAssetsData: ThemeAssetsData): Promise<void>[] =>
                    (Object.keys(themeAssetsData.assets) as ThemeAssetType[]).flatMap((type: ThemeAssetType): Promise<void>[] =>
                        themeAssetsData.assets[type].map(async (asset: ThemeAssetItem): Promise<void> => {
                            try {
                                const originalZipEntry = asset.theme.zip.find(asset.filePathInTheme);
                                if (!originalZipEntry) {
                                    throw new ReferenceError(
                                        `[UNEXPECTED INTERNAL ERROR] Previously detected asset ${JSON.stringify(asset.filePathInTheme)} in theme ${JSON.stringify(asset.theme.name)} has gone missing!`,
                                        { cause: asset }
                                    );
                                }
                                if (originalZipEntry.directory) {
                                    throw new ReferenceError(
                                        `[UNEXPECTED INTERNAL ERROR] Previously detected asset ${JSON.stringify(asset.filePathInTheme)} in theme ${JSON.stringify(asset.theme.name)} has spontaneously changed from a file to a directory!`,
                                        { cause: asset }
                                    );
                                }
                                const existingEntry = zipFs.find(asset.distFilePath);
                                if (existingEntry) {
                                    if (existingEntry.directory) {
                                        throw new ReferenceError(
                                            `Destination path for asset ${JSON.stringify(asset.filePathInTheme)} in theme ${JSON.stringify(asset.theme.name)} already exists as a directory at ${JSON.stringify(asset.distFilePath)}.`,
                                            { cause: asset }
                                        );
                                    }
                                    existingEntry.replaceUint8Array(await originalZipEntry.getUint8Array());
                                } else zipFs.addUint8Array(asset.distFilePath, await originalZipEntry.getUint8Array());
                            } catch (e) {
                                console.error(e);
                                allFailedReplaces.themeAssetReplacements ??= [];
                                allFailedReplaces.themeAssetReplacements.push(
                                    `${themeAssetsData.theme.name}:${themeAssetsData.theme.uuid}:${themeAssetsData.theme.version}:${asset.filePathInTheme}`
                                );
                            }
                        })
                    )
                )
            );
        } catch (e) {
            console.error(e);
            allFailedReplaces.steps ??= [];
            allFailedReplaces.steps.push("applyThemeAssetReplacements");
        }
    } catch (e) {
        console.error(e);
        allFailedReplaces.steps ??= [];
        allFailedReplaces.steps.push("loadThemeAssetReplacementsData");
    }
    try {
        interface StyleAsset {
            filePathInTheme: string;
            distFilePath: string;
            importPath: string;
        }
        interface ThemeStyleAssets {
            theme: Theme;
            styleAssets: StyleAsset[];
        }
        const allStyleAssets: ThemeStyleAssets[] = [];
        await Promise.all(
            themes.flatMap((theme: Theme): Promise<void>[] => {
                try {
                    const dirEntry = theme.zip.find("styles");
                    if (!dirEntry) return [];
                    if (!dirEntry.directory) throw new Error(`Theme "styles" directory is not a directory.`, { cause: theme });
                    const styleAssets: StyleAsset[] = [];
                    function recurseEntries(currentDirEntry: zip.ZipDirectoryEntry): void {
                        for (const child of currentDirEntry.children) {
                            if (child.directory) return void recurseEntries(child);
                            if (!child.name.toLowerCase().endsWith(".css")) continue;
                            const importPath = `/hbui/ouic-theme-custom-styles/${theme.uuid}_${theme.version}/${child.getRelativeName(dirEntry as zip.ZipDirectoryEntry)}`;
                            styleAssets.push({
                                filePathInTheme: child.getFullname(),
                                distFilePath: `gui/dist/${importPath}`,
                                importPath,
                            });
                        }
                    }
                    recurseEntries(dirEntry);
                    allStyleAssets.push({ theme, styleAssets });
                    return styleAssets.map(async (asset: StyleAsset): Promise<void> => {
                        try {
                            const originalZipEntry = theme.zip.find(asset.filePathInTheme);
                            if (!originalZipEntry) {
                                throw new ReferenceError(
                                    `[UNEXPECTED INTERNAL ERROR] Previously detected stylesheet ${JSON.stringify(asset.filePathInTheme)} in theme ${JSON.stringify(theme.name)} has gone missing!`,
                                    { cause: asset }
                                );
                            }
                            if (originalZipEntry.directory) {
                                throw new ReferenceError(
                                    `[UNEXPECTED INTERNAL ERROR] Previously detected stylesheet ${JSON.stringify(asset.filePathInTheme)} in theme ${JSON.stringify(theme.name)} has spontaneously changed from a file to a directory!`,
                                    { cause: asset }
                                );
                            }
                            const existingEntry = zipFs.find(asset.distFilePath);
                            if (existingEntry) {
                                if (existingEntry.directory) {
                                    throw new ReferenceError(
                                        `Destination path for stylesheet ${JSON.stringify(asset.filePathInTheme)} in theme ${JSON.stringify(theme.name)} already exists as a directory at ${JSON.stringify(asset.distFilePath)}.`,
                                        { cause: asset }
                                    );
                                }
                                existingEntry.replaceUint8Array(await originalZipEntry.getUint8Array());
                            } else zipFs.addUint8Array(asset.distFilePath, await originalZipEntry.getUint8Array());
                        } catch (e) {
                            console.error(e);
                            allFailedReplaces.themeCustomCSS ??= [];
                            allFailedReplaces.themeCustomCSS.push(`${theme.name}:${theme.uuid}:${theme.version}:${asset.filePathInTheme}`);
                        }
                    });
                } catch (e) {
                    console.error(e);
                    allFailedReplaces.themeCustomCSS ??= [];
                    allFailedReplaces.themeCustomCSS.push(`${theme.name}:${theme.uuid}:${theme.version}`);
                }
                return [];
            })
        );
        for (const entry of zipFs.entries) {
            try {
                if (entry.directory) continue;
                const filePath: string = entry.getFullname();
                if (!/^(gui\/)?dist\/hbui(?:-(?:tests|docs|perf))?\/[^/]+\.html$/.test(filePath.toLowerCase())) continue;
                const origData: string = await entry.getText();
                const distData: string = origData.replace(
                    /(?=<\/head>)/,
                    allStyleAssets
                        .flatMap((themeStyleAssets: ThemeStyleAssets): StyleAsset[] => themeStyleAssets.styleAssets)
                        .map(
                            (asset: StyleAsset): string => `
        <link href=${JSON.stringify(asset.importPath)} rel="stylesheet" />`
                        )
                        .join("")
                );
                if (distData !== origData) entry.replaceText(distData);
            } catch (e) {
                console.error(e);
                allFailedReplaces.themeCustomCSSImportInjection ??= [];
                allFailedReplaces.themeCustomCSSImportInjection.push(entry.getFullname());
            }
        }
    } catch (e) {
        console.error(e);
        allFailedReplaces.steps ??= [];
        allFailedReplaces.steps.push("applyThemeCustomCSS");
    }
    for (const plugin of plugins) {
        if (plugin.namespace !== "built-in" || (settings.enabledBuiltInPlugins[plugin.id as keyof typeof settings.enabledBuiltInPlugins] ?? true)) {
            for (const action of plugin.actions) {
                if (action.context !== "global") continue;
                try {
                    await action.action(zipFs);
                } catch (e) {
                    console.error(e);
                    allFailedReplaces.globalPluginActions ??= [];
                    allFailedReplaces.globalPluginActions.push(`${plugin.namespace !== "built-in" ? `${plugin.namespace}:` : ""}${plugin.id}:${action.id}`);
                }
            }
        }
    }
    log(`Added entries: ${addedCount}.`);
    log(`Removed entries: ${removedCount}.`);
    log(`Modified entries: ${modifiedCount}.`);
    log(`Unmodified entries: ${unmodifiedCount}.`);
    log(`Edited ${editedCount} entries.`);
    log(`Renamed ${renamedCount} entries.`);
    log(`Total entries: ${zipFs.entries.length}.`);
    for (const plugin of plugins) {
        if (!globalPluginEnvIDs.has(plugin)) continue;
        const envID: string = globalPluginEnvIDs.get(plugin)!;
        globalPluginEnvIDs.delete(plugin);
        globalPluginEnvs.delete(envID);
    }
    delete (globalThis as any)[oreUICustomizerEnvGlobalVariableName];
    return {
        zip: await zipFs.exportBlob(),
        config: settings,
        allFailedReplaces,
        addedCount,
        removedCount,
        modifiedCount,
        unmodifiedCount,
        editedCount,
        renamedCount,
        totalEntries: zipFs.entries.length,
    };
}
