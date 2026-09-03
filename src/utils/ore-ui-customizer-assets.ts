import semver from "semver";
import json5 from "json5";
import "./zip.js";
import type {
    OreUICustomizerSettings,
    PluginManifestJSON,
    Plugin,
    PluginEntryScriptPlugin,
    BuiltInPluginID,
    EncodedPluginData,
    Theme,
    ThemeManifestJSON,
    ThemeColorReplacements,
} from "ore-ui-customizer-types";
import type {} from "@ore-ui-customizer-api/plugin-env/backend";

/**
 * The default settings for 8Crafter's Ore UI Customizer.
 */
export const defaultOreUICustomizerSettings: OreUICustomizerSettings = {
    /**
     * This will allow you to turn hardcore mode on and off whenever you want.
     *
     * @type {boolean}
     */
    hardcoreModeToggleAlwaysClickable: true,
    /**
     * This will allow you to disable the experimental toggles even after the world has been played with them on, also applies to the `Education Edition` toggle.
     *
     * @type {boolean}
     */
    allowDisablingEnabledExperimentalToggles: true,
    /**
     * This will add a dropdown that allows you to select the world generator type.
     *
     * It lets you choose any of the following world generator types:
     *
     * - `Legacy`
     * - `Infinite world`
     * - `Flat world`
     * - `Void world`
     *
     * @type {boolean}
     */
    addGeneratorTypeDropdown: true,
    /**
     * This will add more options to the `Game Mode` dropdown.
     *
     * It will cause the dropdown to have the following options:
     *
     * - `Survival`
     * - `Creative`
     * - `Adventure`
     * - `Default`
     * - `Spectator`
     *
     * @type {boolean}
     */
    addMoreDefaultGameModes: true,
    /**
     * This will allow you to change the world seed whenever you want, also works on marketplace worlds that don't let you change the seed.
     *
     * @type {boolean}
     */
    allowForChangingSeeds: true,
    /**
     * This will allow you to change the flat world preset, even after the world has been created.
     *
     * Note: This option requires that the {@link addGeneratorTypeDropdown} option is enabled.
     *
     * @type {boolean}
     */
    allowForChangingFlatWorldPreset: true,
    /**
     * If specified, this will override the max length of every text box to be the specified value.
     *
     * Leave it blank to not override it.
     *
     * @type {`${number}` | ""}
     */
    maxTextLengthOverride: "1000000" as const,
    /**
     * This adds the `Debug` tab to the create and edit world screens.
     *
     * It also has a bunch of additional options added to the tab that aren't normally in there.
     *
     * @type {boolean}
     */
    addDebugTab: true,
    add8CrafterUtilitiesMainMenuButton: true,
    enabledBuiltInPlugins: {
        "add-exact-ping-count-to-servers-tab": true,
        "add-max-player-count-to-servers-tab": true,
        "facet-spy": true,
        "make-export-world-button-visible": true,
        "lite-play-screen-routes": true,
    },
    /**
     * These are replacements for the UI colors.
     *
     * @type {Record<string, string>}
     *
     * @todo Make this functional.
     */
    colorReplacements: {
        // /**
        //  * Gray 80
        //  *
        //  * This is used as the solid background for many Ore UI menus.
        //  */
        // "#313233": "#006188",
        // /**
        //  * Gray 70
        //  *
        //  * This is used for the main part of a pressed button.
        //  */
        // "#48494a": "#007eaf",
        // "#3c8527": "#27856e",
        // "#e6e8eb": "#6200ff",
        // "#58585a": "#2c6387",
        // "#242425": "#003347",
        // "#1e1e1f": "#002c3d",
        // "#8c8d90": "#1fbfff",
        "#a0e081": "#a0e081",
        "#86d562": "#86d562",
        "#6cc349": "#6cc349",
        "#52a535": "#52a535",
        "#3c8527": "#3c8527",
        "#2a641c": "#2a641c",
        "#1d4d13": "#1d4d13",
        "#153a0e": "#153a0e",
        "#112f0b": "#112f0b",
        "#0f2b0a": "#0f2b0a",
        "#ffffff": "#ffffff",
        "#000000": "#000000",
        "#f4f6f9": "#f4f6f9",
        "#e6e8eb": "#e6e8eb",
        "#d0d1d4": "#d0d1d4",
        "#b1b2b5": "#b1b2b5",
        "#8c8d90": "#8c8d90",
        "#58585a": "#58585a",
        "#48494a": "#48494a",
        "#313233": "#313233",
        "#242425": "#242425",
        "#1e1e1f": "#1e1e1f",
        "#ff8080": "#ff8080",
        "#d93636": "#d93636",
        "#b31b1b": "#b31b1b",
        "#d54242": "#d54242",
        "#ca3636": "#ca3636",
        "#c02d2d": "#c02d2d",
        "#b62525": "#b62525",
        "#ad1d1d": "#ad1d1d",
        "#a31616": "#a31616",
        "#990f0f": "#990f0f",
        "#ffb366": "#ffb366",
        "#d3791f": "#d3791f",
        "#a65b11": "#a65b11",
        "#ffe866": "#ffe866",
        "#e5c317": "#e5c317",
        "#8a7500": "#8a7500",
        "#fff0c5": "#fff0c5",
        "#ffd783": "#ffd783",
        "#f8af2b": "#f8af2b",
        "#ce8706": "#ce8706",
        "#ae7100": "#ae7100",
        "#8cb3ff": "#8cb3ff",
        "#2e6be5": "#2e6be5",
        "#1452cc": "#1452cc",
        "rgba(0, 0, 0, 0.1)": "rgba(0, 0, 0, 0.1)",
        "rgba(0, 0, 0, 0.2)": "rgba(0, 0, 0, 0.2)",
        "rgba(0, 0, 0, 0.25)": "rgba(0, 0, 0, 0.25)",
        "rgba(0, 0, 0, 0.3)": "rgba(0, 0, 0, 0.3)",
        "rgba(0, 0, 0, 0.4)": "rgba(0, 0, 0, 0.4)",
        "rgba(0, 0, 0, 0.5)": "rgba(0, 0, 0, 0.5)",
        "rgba(0, 0, 0, 0.6)": "rgba(0, 0, 0, 0.6)",
        "rgba(0, 0, 0, 0.7)": "rgba(0, 0, 0, 0.7)",
        "rgba(0, 0, 0, 0.8)": "rgba(0, 0, 0, 0.8)",
        "rgba(0, 0, 0, 0.9)": "rgba(0, 0, 0, 0.9)",
        "rgba(0, 0, 0, 1)": "rgba(0, 0, 0, 1)",
        "rgba(255, 255, 255, 0.1)": "rgba(255, 255, 255, 0.1)",
        "rgba(255, 255, 255, 0.2)": "rgba(255, 255, 255, 0.2)",
        "rgba(255, 255, 255, 0.3)": "rgba(255, 255, 255, 0.3)",
        "rgba(255, 255, 255, 0.4)": "rgba(255, 255, 255, 0.4)",
        "rgba(255, 255, 255, 0.5)": "rgba(255, 255, 255, 0.5)",
        "rgba(255, 255, 255, 0.6)": "rgba(255, 255, 255, 0.6)",
        "rgba(255, 255, 255, 0.7)": "rgba(255, 255, 255, 0.7)",
        "rgba(255, 255, 255, 0.8)": "rgba(255, 255, 255, 0.8)",
        "rgba(255, 255, 255, 0.9)": "rgba(255, 255, 255, 0.9)",
        "#FB95E2": "#FB95E2",
        "#FFB1EC": "#FFB1EC",
        "#E833C2": "#E833C2",
        "#F877DC": "#F877DC",
        "#643ACB": "#643ACB",
        "#AC90F3": "#AC90F3",
        "#9471E0": "#9471E0",
        "#8557F8": "#8557F8",
        "#7345E5": "#7345E5",
        "#5D2CC6": "#5D2CC6",
        "#4A1CAC": "#4A1CAC",
        "#050029": "#050029",
        "rgba(5, 0, 41, 0.5)": "rgba(5, 0, 41, 0.5)",
    },
    advancedColorReplacements: {
        menusTheme: {
            ".menus": {
                colorsPrimary: "#3c8527",
                colorsSecondary: "#d0d1d4",
                colorsDestructive: "#ca3636",
                colorsText: "#ffffff",
                colorsMuted0: "#d0d1d4",
                colorsMuted1: "#b1b2b5",
                colorsDisabled: "#d0d1d4",
                baseTextFieldColor: "#ffffff",
                baseTextFieldPlaceholderColor: "#b1b2b5",
                baseTextFieldDisabledColor: "#58585a",
                baseTextFieldCaretColor: "#6cc349",
                inputFieldPlaceholderUnderlineColor: "#ffffff",
                inputLegendWrapperBackgroundColor: "#1e1e1f",
                inputLegendWrapperBorderTopColor: "rgba(255, 255, 255, 0.2)",
                inputLegendInputHintColor: "#fff",
                buttonIconKeyboardTextColor: "#313233",
            },
            ".menus.realms": {
                colorsPrimary: "#7345e5",
            },
            ".menus.neutral90": {
                baseTextFieldColor: "#ffffff",
                baseTextFieldPlaceholderColor: "#b1b2b5",
                baseTextFieldColorDisabled: "#58585a",
                baseTextFieldPlaceholderColorDisabled: "#58585a",
            },
        },
        custom: {
            ".vanilla-neutral-text,.vanilla-neutral-text-interactive": {
                color: "#ffffff",
            },
            ".vanilla-neutral-text.dimmer,.vanilla-neutral-text-interactive.dimmer": {
                color: "#d0d1d4",
            },
            ".vanilla-neutral-text.dimmest,.vanilla-neutral-text-interactive.dimmest": {
                color: "#b1b2b5",
            },
            ".realms-neutral80-text,.realms-neutral80-text-interactive": {
                color: "#ffffff",
            },
            ".realms-neutral80-text.dimmer,.realms-neutral80-text-interactive.dimmer": {
                color: "#d0d1d4",
            },
            ".realms-neutral80-text.dimmest,.realms-neutral80-text-interactive.dimmest": {
                color: "#b1b2b5",
            },
            ".realms-neutral-text,.realms-neutral-text-interactive": {
                color: "#ffffff",
            },
            ".realms-neutral-text.dimmer,.realms-neutral-text-interactive.dimmer": {
                color: "#d0d1d4",
            },
            ".realms-neutral-text.dimmest,.realms-neutral-text-interactive.dimmest": {
                color: "#b1b2b5",
            },
        },
    },
    activePluginsDetails: [],
    bundleEncodedPluginDataInConfigFile: false,
} as OreUICustomizerSettings;

/**
 * Converts a blob to a data URI.
 *
 * @param {Blob} blob The blob to convert.
 * @returns {Promise<`data:${string};base64,${string}`>} A promise resolving with the data URI.
 */
export async function blobToDataURI(blob: Blob): Promise<`data:${string};base64,${string}`> {
    if (typeof globalThis.Buffer === "undefined") {
        const arrayBuffer = await blob.arrayBuffer();
        const byteArray = new Uint8Array(arrayBuffer);
        const base64String: string = byteArray.reduce((data: string, byte: number): string => data + String.fromCharCode(byte), "");
        const base64Encoded: string = btoa(base64String);
        return `data:${blob.type || "application/octet-stream"};base64,${base64Encoded}`;
    } else {
        const base64Encoded: string = Buffer.from(await blob.bytes()).toString("base64");
        return `data:${blob.type || "application/octet-stream"};base64,${base64Encoded}` as const;
    }
}

/**
 * Joins paths, works like `path.join`.
 *
 * @param input The paths to join.
 * @returns The joined path.
 */
globalThis.joinPath = function joinPath(...input: string[]): string {
    let paths: string[] = input
        .filter((path: string): boolean => !!path) // Remove undefined | null | empty
        .join("/") // Join to string
        .replaceAll("\\", "/") // Replace from \ to /
        .split("/")
        .filter((path: string): boolean => !!path && path !== ".") // Remove empty in case a//b///c or ./a ./b
        .reduce((items: string[], item: string): string[] => {
            if (item === "..") items.pop();
            else items.push(item);
            return items;
        }, [] as string[]); // Jump one level if ../
    if (input[0] && input[0].startsWith("/")) paths.unshift("");

    return paths.join("/") || (paths.length ? "/" : ".");
};

globalThis.globalPluginEnvIDs = new Map();
globalThis.globalPluginEnvs = new Map();

declare global {
    namespace globalThis {
        /**
         * Joins paths, works like `path.join`.
         *
         * @param input The paths to join.
         * @returns The joined path.
         */
        function joinPath(...input: string[]): string;
        /**
         * The global plugin to plugin env ID map.
         */
        var globalPluginEnvIDs: Map<import("ore-ui-customizer-types").Plugin | EncodedPluginData, string>;
        /**
         * The global plugin env ID to plugin env map.
         */
        var globalPluginEnvs: Map<string, OreUICustomizerPluginEnv>;
    }
}

/**
 * Removes empty known type only module imports from a script
 *
 * @param script The script.
 * @returns The script without empty known type only module imports
 */
export function removeEmptyKnownTypeOnlyModuleImportsFromScript(script: string): string {
    const knownTypeOnlyModules: string[] = ["ore-ui-types", "ore-ui-customizer-types", "@ore-ui-customizer-api/plugin-env", "@ore-ui-customizer-api/env"];
    const regex =
        /(?:^(?:(?:(?<=^|\n)\s*?\/\/[^\n]*?\n|(?<=^|\n)\s*?\/\*[\s\S]*?\*\/)*?)?[\n\s]*?)\s*?import\s*?\{(?<imports>[^}]+?)\}\s*?from\s*?(?<quote>['"])(?<module>[^\n].+?)\k<quote>;?(?=\s*?(?:\n|$))/g;
    const keptImportStatements: string[] = [];
    while (!regex.test(script)) {
        const match: RegExpExecArray | null = regex.exec(script);
        if (!match) break;
        const { imports, module } = match.groups!;
        script = script.replace(match[0], "");
        if (imports!.trim() === "") {
            if (knownTypeOnlyModules.includes(module!)) {
                continue;
            }
        }
        keptImportStatements.push(match[0].replace(/^\n/, ""));
    }

    return keptImportStatements.join("\n") + script;
}

/**
 * Normalizes a path for use with {@link zip.FS}.
 *
 * This is made for use with {@link zip.FS.find}.
 *
 * @param path The path to normalize.
 * @returns The normalized path.
 */
export function normalizePathForZipFS(path: string): string {
    return path.replace(/^\.?\/(?:\.?\.\/)*/, "");
}

// TODO: Add config validation.
// TODO: Add min_engine_version checks to the OUIC website for plugins and themes, and maybe configs if min_engine_version is added to it.

/**
 * Imports a plugin from a data URI.
 *
 * @param dataURI The data URI to import the plugin from.
 * @param options Options for importing the plugin file.
 * @param type The type of the plugin to import. Defaults to `"js"`.
 * @returns A promise resolving with the imported plugin.
 *
 * @throws {TypeError} If the plugin type is not supported.
 *
 * @todo Add support for relative script imports in the scripts of .mcouicplugin files, use RollupJS, also use the `rollup-plugin-typescript2` RollupJS plugin to allow for typescript.
 */
export async function importPluginFromDataURI(
    dataURI: string,
    options: {
        oreUICustomizerEnvGlobalVariableName: string | null;
        pluginEnvID?: string | undefined;
    },
    type: "js" | "mcouicplugin" = "js"
): Promise<Plugin> {
    switch (type) {
        case "mcouicplugin": {
            const zipFs = new zip.fs.FS();
            await zipFs.importData64URI(dataURI);
            const manifest: PluginManifestJSON = json5.parse(await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText());
            const entry: string = normalizePathForZipFS(manifest.entry);
            if (!options.pluginEnvID || !(globalThis as any)[options.pluginEnvID]) {
                options.pluginEnvID ??= `__plugin_env_${manifest.header.namespace}:${manifest.header.id}_${manifest.header.version}_${Date.now()}_${Math.floor(Math.random() * 1000000)}__`;
            }
            globalPluginEnvs.set(options.pluginEnvID, {
                fetchFileContents(path: string): Promise<Uint8Array<ArrayBufferLike>> {
                    return (zipFs.find(normalizePathForZipFS(path)) as zip.ZipFileEntry<any, any>).getUint8Array();
                },
                fetchFileStringContents(path: string): Promise<string> {
                    return (zipFs.find(normalizePathForZipFS(path)) as zip.ZipFileEntry<any, any>).getText();
                },
                fetchFileAsBlob(path: string): Promise<Blob> {
                    return (zipFs.find(normalizePathForZipFS(path)) as zip.ZipFileEntry<any, any>).getBlob();
                },
                fetchFileAsWritableStream(path: string): Promise<WritableStream<any>> {
                    return (zipFs.find(normalizePathForZipFS(path)) as zip.ZipFileEntry<any, any>).getWritable();
                },
                findZipEntry(path: string): zip.ZipEntry | undefined {
                    return zipFs.find(normalizePathForZipFS(path));
                },
                findZipFileEntry<ReaderType = any, WriterType = any>(path: string): zip.ZipFileEntry<ReaderType, WriterType> | undefined {
                    const result: zip.ZipEntry | undefined = zipFs.find(normalizePathForZipFS(path));
                    if (result instanceof zip.fs.ZipFileEntry) return result;
                    return undefined;
                },
                findZipDirectoryEntry(path: string): zip.ZipDirectoryEntry | undefined {
                    const result: zip.ZipEntry | undefined = zipFs.find(normalizePathForZipFS(path));
                    if (result instanceof zip.fs.ZipDirectoryEntry) return result;
                    return undefined;
                },
                zipFs,
                manifest: manifest as any,
            });
            // const moduleList: string[] = ["@ore-ui-customizer/utilities"];
            // const addRequireDefinition: string = `function require(path) { return ; };`;
            /* async function loadScriptImports(script: string, path?: string): Promise<string> {
                let result: string = script;
                let match;
                const syncImportsRegex = /import\s*\{(?:[^\}]*)\}\s*from\s*(?:'(.*?)'|"(.*?)")/g;
                while (
                    (match = syncImportsRegex.exec(
                        result.slice(
                            0,
                            result.includes("\nexport") || result.includes("\nconst") || result.includes("\nfunction")
                                ? Math.min(
                                      ...[result.indexOf("\nexport"), result.indexOf("\nconst"), result.indexOf("\nfunction")].filter(
                                          (v: number): boolean => v !== -1
                                      )
                                  )
                                : undefined
                        )
                    ))
                ) {
                    const importPath: string | undefined = match[1] || match[2];
                    if (!importPath || moduleList.includes(importPath)) continue;
                    const importContent: string = await loadScriptImports(await (zipFs.find(normalizePathForZipFS(importPath)) as zip.ZipFileEntry<any, any>).getText(), joinPath(path, importPath));
                    result = result.replace(match[0], `data:text/javascript,${encodeURIComponent(importContent)}`);
                }
                return result;
            }
            let script: string = await loadScriptImports(await (zipFs.find(normalizePathForZipFS(entry)) as zip.ZipFileEntry<any, any>).getText()); */
            const entryScriptTextContents = await (zipFs.find(entry) as zip.ZipFileEntry<any, any>).getText();
            let data: { plugin: PluginEntryScriptPlugin } = await import(
                /* @vite-ignore */
                `data:application/javascript,${encodeURIComponent(
                    `${
                        options.oreUICustomizerEnvGlobalVariableName ?
                            `const customizerEnv = globalThis[${JSON.stringify(options.oreUICustomizerEnvGlobalVariableName)}];\n`
                        :   ""
                    }${
                        options.pluginEnvID ? `const pluginEnv = globalThis.globalPluginEnvs?.get(${JSON.stringify(options.pluginEnvID)});\n` : ""
                    }${removeEmptyKnownTypeOnlyModuleImportsFromScript(entryScriptTextContents)}\n// ${Math.random().toString(36).slice(2)}`
                )}`
            );
            const plugin: Plugin = { ...manifest, ...manifest.header, ...data.plugin };
            globalPluginEnvIDs.set(plugin, options.pluginEnvID);
            return plugin;
        }
        case "js": {
            const data: { plugin: Plugin } = await import(/* @vite-ignore */ dataURI);
            return data.plugin;
        }
        default: {
            throw new TypeError(`Unsupported plugin type "${type}".`);
        }
    }
}

/**
 * Validates a plugin file.
 *
 * @param plugin The plugin file to validate.
 * @param options Options for validating the plugin file.
 * @param type The type of the plugin file.
 * @returns A promise resolving to `void` when the plugin file is validated.
 *
 * @throws {TypeError} If the plugin type is not supported.
 * @throws {TypeError | SyntaxError | ReferenceError | EvalError} If the plugin is not valid.
 */
export async function validatePluginFile(
    plugin: Blob,
    options: {
        oreUICustomizerEnvGlobalVariableName: string | null;
        pluginEnvID?: string | undefined;
    },
    type: "mcouicplugin" | "js"
): Promise<void> {
    switch (type) {
        case "mcouicplugin": {
            const zipFs: zip.FS = new zip.fs.FS();
            await zipFs.importBlob(plugin);
            if (!zipFs.getChildByName("manifest.json")) throw new ReferenceError(`Plugin is missing required file "manifest.json".`);
            try {
                var manifest: PluginManifestJSON = json5.parse(await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText());
            } catch (e: any) {
                throw new SyntaxError(`Plugin "manifest.json" is not valid JSON.`, { cause: e });
            }
            if (!("entry" in manifest)) throw new SyntaxError(`Plugin "manifest.json" is missing required field "entry".`);
            if (typeof manifest.entry !== "string") throw new SyntaxError(`Plugin "manifest.json" field "entry" is not a string.`);
            if (!manifest.entry) throw new SyntaxError(`Plugin "manifest.json" field "entry" is empty.`);
            const entry: string = normalizePathForZipFS(manifest.entry);
            if (!zipFs.find(entry))
                throw new ReferenceError(`Plugin is missing required entry file specified by "entry" field in "manifest.json": "${entry}".`);
            if (!options.pluginEnvID || !(globalThis as any)[options.pluginEnvID]) {
                options.pluginEnvID ??= `__plugin_env_${manifest.header.namespace}:${manifest.header.id}_${manifest.header.version}_${Date.now()}_${Math.floor(Math.random() * 1000000)}__`;
            }
            globalPluginEnvs.set(options.pluginEnvID, {
                fetchFileContents(path: string): Promise<Uint8Array<ArrayBufferLike>> {
                    return (zipFs.find(normalizePathForZipFS(path)) as zip.ZipFileEntry<any, any>).getUint8Array();
                },
                fetchFileStringContents(path: string): Promise<string> {
                    return (zipFs.find(normalizePathForZipFS(path)) as zip.ZipFileEntry<any, any>).getText();
                },
                fetchFileAsBlob(path: string): Promise<Blob> {
                    return (zipFs.find(normalizePathForZipFS(path)) as zip.ZipFileEntry<any, any>).getBlob();
                },
                fetchFileAsWritableStream(path: string): Promise<WritableStream<any>> {
                    return (zipFs.find(normalizePathForZipFS(path)) as zip.ZipFileEntry<any, any>).getWritable();
                },
                findZipEntry(path: string): zip.ZipEntry | undefined {
                    return zipFs.find(normalizePathForZipFS(path));
                },
                findZipFileEntry<ReaderType = any, WriterType = any>(path: string): zip.ZipFileEntry<ReaderType, WriterType> | undefined {
                    const result: zip.ZipEntry | undefined = zipFs.find(normalizePathForZipFS(path));
                    if (result instanceof zip.fs.ZipFileEntry) return result;
                    return undefined;
                },
                findZipDirectoryEntry(path: string): zip.ZipDirectoryEntry | undefined {
                    const result: zip.ZipEntry | undefined = zipFs.find(normalizePathForZipFS(path));
                    if (result instanceof zip.fs.ZipDirectoryEntry) return result;
                    return undefined;
                },
                zipFs,
                manifest: manifest as any,
            });
            const entryScriptTextContents: string = await (zipFs.find(entry) as zip.ZipFileEntry<any, any>).getText();
            try {
                var data: { plugin: PluginEntryScriptPlugin } = await import(
                    /* @vite-ignore */ `data:application/javascript,${encodeURIComponent(
                        `${
                            options.oreUICustomizerEnvGlobalVariableName ?
                                `const customizerEnv = globalThis[${JSON.stringify(options.oreUICustomizerEnvGlobalVariableName)}];\n`
                            :   ""
                        }${
                            options.pluginEnvID ? `const pluginEnv = globalThis.globalPluginEnvs?.get(${JSON.stringify(options.pluginEnvID)});\n` : ""
                        }${removeEmptyKnownTypeOnlyModuleImportsFromScript(entryScriptTextContents)}\n// ${Math.random().toString(36).slice(2)}`
                    )}`
                );
            } catch (e: any) {
                throw new EvalError(`Plugin entry file "${entry}" threw an error when imported: ${e.name}: ${e.message}`, { cause: e });
            }
            if (data?.plugin) {
                validatePluginObject({ ...manifest, ...manifest.header, ...data.plugin } satisfies Plugin);
            } else {
                throw new SyntaxError(`Plugin entry file "${entry}" is missing required variable export "plugin".`);
            }
            return;
        }
        case "js": {
            const dataURI: string = URL.createObjectURL(plugin);
            const data: { plugin: Plugin } = await import(/* @vite-ignore */ dataURI);
            if (data?.plugin) {
                validatePluginObject(data.plugin);
            } else {
                throw new SyntaxError(`Plugin is missing required variable export "plugin".`);
            }
            return;
        }
        default: {
            throw new TypeError(`Unsupported plugin type "${type}".`);
        }
    }
}

/**
 * Validates a plugin object.
 *
 * @param plugin The plugin object to validate.
 * @returns Asserts that the plugin object is valid. If it is not valid, throws an error. Otherwise, returns `void`.
 *
 * @throws {TypeError | SyntaxError} If the plugin object is not valid.
 */
export function validatePluginObject(plugin: any): asserts plugin is Plugin {
    if (typeof plugin !== "object") throw new TypeError(`Plugin must be an object.`);
    const pluginObject: Plugin = plugin;
    // -------- PROPERTY VALIDATION --------
    // actions
    if (!pluginObject.actions) throw new SyntaxError(`Plugin is missing required property "actions".`);
    if (!(pluginObject.actions instanceof Array)) throw new SyntaxError(`Plugin property "actions" must be an array.`);
    // format_version
    if (!pluginObject.format_version) throw new SyntaxError(`Plugin is missing required property "format_version".`);
    if (typeof pluginObject.format_version !== "string") throw new SyntaxError(`Plugin property "format_version" must be a string.`);
    if (pluginObject.format_version.startsWith("v")) throw new SyntaxError(`Plugin property "format_version" must not include the leading "v".`);
    if (semver.valid(pluginObject.format_version) === null) throw new SyntaxError(`Plugin property "format_version" must be a valid semver version.`);
    // id
    if (!pluginObject.id) throw new SyntaxError(`Plugin is missing required property "id".`);
    if (typeof pluginObject.id !== "string") throw new SyntaxError(`Plugin property "id" must be a string.`);
    if (!/^[a-zA-Z0-9_\-.]+$/.test(pluginObject.id)) throw new SyntaxError(`Plugin property "id" does not match the pattern /^[a-zA-Z0-9_\\-.]+$/.`);
    // uuid
    if (!pluginObject.uuid) throw new SyntaxError(`Plugin is missing required property "uuid".`);
    if (typeof pluginObject.uuid !== "string") throw new SyntaxError(`Plugin property "uuid" must be a string.`);
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(pluginObject.uuid))
        throw new SyntaxError(
            `Plugin property "uuid" must be a valid UUID v4, it must match the following pattern: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.`
        );
    // description
    if (typeof pluginObject.description !== "undefined" && typeof pluginObject.description !== "string")
        throw new SyntaxError(`Plugin property "description" must be a string or undefined.`);
    // -------- DEPENDENCY VALIDATION --------
    // dependencies
    if (typeof pluginObject.dependencies !== "undefined") {
        if (!(pluginObject.dependencies instanceof Array)) throw new SyntaxError(`Plugin property "description" must be an array or undefined.`);
        let dependencyIndex: number = -1;
        for (const dependency of pluginObject.dependencies) {
            dependencyIndex++;
            // -------- DEPENDENCY VALIDATION > TYPE VALIDATION --------
            // dependency
            if (typeof dependency === "undefined") continue;
            if (typeof dependency !== "object") throw new SyntaxError(`Plugin dependency ${dependencyIndex} must be an object.`);
            // -------- DEPENDENCY VALIDATION > PROPERTY VALIDATION --------
            // uuid
            if ("uuid" in dependency && typeof dependency.uuid !== "string")
                throw new SyntaxError(`Plugin dependency ${dependencyIndex} property "uuid" must be a string.`);
            if ("uuid" in dependency && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(dependency.uuid))
                throw new SyntaxError(
                    `Plugin dependency ${dependencyIndex} property "uuid" must be a valid UUID v4, it must match the following pattern: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.`
                );
            // module_name
            if ("module_name" in dependency && typeof dependency.module_name !== "string")
                throw new SyntaxError(`Plugin dependency ${dependencyIndex} property "module_name" must be a string.`);
            // uuid or module_name
            if (!("uuid" in dependency || "module_name" in dependency))
                throw new SyntaxError(`Plugin dependency ${dependencyIndex} is missing required property "uuid" or "module_name".`);
            // version
            if (dependency.version !== undefined) {
                if (typeof dependency.version !== "string")
                    throw new SyntaxError(`Plugin dependency ${dependencyIndex} property "version" must be a string or undefined.`);
                if (dependency.version.startsWith("v"))
                    throw new SyntaxError(`Plugin dependency ${dependencyIndex} property "version" must not include the leading "v".`);
                if (semver.valid(dependency.version) === null)
                    throw new SyntaxError(`Plugin dependency ${dependencyIndex} property "version" must be a valid semver version.`);
            }
        }
    }
    // -------- PROPERTY VALIDATION --------
    // metadata
    if (typeof pluginObject.metadata !== "undefined" && typeof pluginObject.metadata !== "object")
        throw new SyntaxError(`Plugin property "metadata" must be an object or undefined.`);
    // name
    if (!pluginObject.name) throw new SyntaxError(`Plugin is missing required property "name".`);
    if (typeof pluginObject.name !== "string") throw new SyntaxError(`Plugin property "name" must be a string.`);
    // min_engine_version
    if (typeof pluginObject.min_engine_version !== "undefined" && typeof pluginObject.min_engine_version !== "string")
        throw new SyntaxError(`Plugin property "min_engine_version" must be a string or undefined.`);
    if (typeof pluginObject.min_engine_version === "string" && pluginObject.min_engine_version.startsWith("v"))
        throw new SyntaxError(`Plugin property "min_engine_version" must not include the leading "v".`);
    if (typeof pluginObject.min_engine_version === "string" && semver.valid(pluginObject.min_engine_version) === null)
        throw new SyntaxError(`Plugin property "min_engine_version" must be a valid semver version or undefined.`);
    // namespace
    if (!pluginObject.namespace) throw new SyntaxError(`Plugin is missing required property "namespace".`);
    if (pluginObject.namespace === "built-in" && !builtInPlugins.includes(pluginObject as (typeof builtInPlugins)[number]))
        throw new SyntaxError(`Plugin is using the reserved namespace "built-in" but is not a built-in plugin.`);
    if (!/^[a-zA-Z0-9_\-.]+$/.test(pluginObject.namespace))
        throw new SyntaxError(`Plugin property "namespace" does not match the pattern /^[a-zA-Z0-9_\\-.]+$/.`);
    // version
    if (!pluginObject.version) throw new SyntaxError(`Plugin is missing required property "version".`);
    if (typeof pluginObject.version !== "string") throw new SyntaxError(`Plugin property "version" must be a string.`);
    if (pluginObject.version.startsWith("v")) throw new SyntaxError(`Plugin property "version" must not include the leading "v".`);
    if (semver.valid(pluginObject.version) === null) throw new SyntaxError(`Plugin property "version" must be a valid semver version.`);
    // -------- ACTION VALIDATION --------
    let actionIndex: number = 0;
    for (const action of pluginObject.actions) {
        // -------- ACTION VALIDATION > PROPERTY VALIDATION --------
        // action
        if (!action.action) throw new SyntaxError(`Plugin action ${actionIndex} is missing required property "action".`);
        if (typeof action.action !== "function") throw new SyntaxError(`Plugin action ${actionIndex} property "action" must be a function.`);
        // context
        if (!action.context) throw new SyntaxError(`Plugin action ${actionIndex} is missing required property "context".`);
        if (typeof action.context !== "string") throw new SyntaxError(`Plugin action ${actionIndex} property "context" must be a string.`);
        if (!["per_text_file", "per_binary_file", "global_before", "global"].includes(action.context))
            throw new SyntaxError(
                `Plugin action ${actionIndex} property "context" must be one of "per_text_file", "per_binary_file", "global_before", "global".`
            );
        // id
        if (!action.id) throw new SyntaxError(`Plugin action ${actionIndex} is missing required property "id".`);
        if (typeof action.id !== "string") throw new SyntaxError(`Plugin action ${actionIndex} property "id" must be a string.`);
        if (!/^[a-zA-Z0-9_\-.]+$/.test(action.id))
            throw new SyntaxError(`Plugin action ${actionIndex} property "id" does not match the pattern /^[a-zA-Z0-9_\\-.]+$/.`);
        actionIndex++;
    }
    return;
}

/**
 * Imports a theme from a data URI.
 *
 * @param dataURI The data URI to import the theme from.
 * @param options Options for importing the theme file.
 * @param type The type of the theme to import. Defaults to `"mcouictheme"`.
 * @returns A promise resolving with the imported theme.
 *
 * @throws {TypeError} If the theme type is not supported.
 *
 * @todo Add support for relative script imports in the scripts of .mcouicplugin files, use RollupJS, also use the `rollup-plugin-typescript2` RollupJS plugin to allow for typescript. (NOTE: Maybe actually just use SystemJS instead.)
 */
export async function importThemeFromDataURI(dataURI: string, _options: { $TODO?: never }, type: "mcouictheme" = "mcouictheme"): Promise<Theme> {
    switch (type) {
        case "mcouictheme": {
            const zipFs = new zip.fs.FS();
            await zipFs.importData64URI(dataURI);
            const manifest: ThemeManifestJSON = json5.parse(await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText());
            const theme: Theme = { ...manifest, ...manifest.header, zip: zipFs };
            return theme;
        }
        default: {
            throw new TypeError(`Unsupported theme type "${type}".`);
        }
    }
}

/**
 * Validates a theme file.
 *
 * @param theme The theme file to validate.
 * @param options Options for validating the theme file.
 * @param type The type of the theme file.
 * @returns A promise resolving to `void` when the theme file is validated.
 *
 * @throws {TypeError} If the theme type is not supported.
 * @throws {TypeError | SyntaxError | ReferenceError} If the theme is not valid.
 *
 * @todo Add a way to use this with a directory without having to ZIP it first, so that it can be used more efficiently in the Ore UI Customizer app.
 * @todo Add a version of this that just outputs a list of the errors instead of only just throwing the first one.
 */
export async function validateThemeFile(theme: Blob, _options: { $TODO?: never }, type: "mcouictheme"): Promise<void> {
    switch (type) {
        case "mcouictheme": {
            const zipFs: zip.FS = new zip.fs.FS();
            await zipFs.importBlob(theme);
            if (!zipFs.getChildByName("manifest.json")) throw new ReferenceError(`Theme is missing required file "manifest.json".`);
            try {
                var manifest: ThemeManifestJSON = json5.parse(await (zipFs.getChildByName("manifest.json") as zip.ZipFileEntry<any, any>).getText());
            } catch (e: any) {
                throw new SyntaxError(`Theme "manifest.json" is not valid JSON.`, { cause: e });
            }
            validateThemeObject({ ...manifest, ...manifest.header, zip: zipFs } satisfies Theme);
            // IDEA: Maybe add file type validation for files in textures, videos, etc.
            const colorReplacementsZipEntry = zipFs.find("color_replacements.json") as zip.ZipFileEntry<any, any> | zip.ZipDirectoryEntry;
            if (colorReplacementsZipEntry) {
                if (colorReplacementsZipEntry.directory) throw new ReferenceError(`Theme "color_replacements.json" file is a directory.`);
                try {
                    var colorReplacements: ThemeColorReplacements = json5.parse(await colorReplacementsZipEntry.getText());
                } catch (e) {
                    throw new SyntaxError(`Theme "color_replacements.json" is not valid JSON.`, { cause: e });
                }
                validateThemeColorReplacementsObject(colorReplacements);
            }
            return;
        }
        default: {
            throw new TypeError(`Unsupported theme type "${type}".`);
        }
    }
}

/**
 * Validates a theme object.
 *
 * @param theme The theme object to validate.
 * @returns Asserts that the theme object is valid. If it is not valid, throws an error. Otherwise, returns `void`.
 *
 * @throws {TypeError | SyntaxError} If the theme object is not valid.
 *
 * @todo Add a way to make it show stuff like `Theme is missing required property "header/format_version".` instead of `Theme is missing required property "format_version".` when this is used by certain functions.
 */
export function validateThemeObject(theme: any): asserts theme is Theme {
    if (typeof theme !== "object") throw new TypeError(`Theme must be an object.`);
    const themeObject: Theme = theme;
    // -------- PROPERTY VALIDATION --------
    // zip
    if (!themeObject.zip) throw new SyntaxError(`Theme is missing required property "zip".`);
    if (!(themeObject.zip instanceof zip.fs.FS)) throw new SyntaxError(`Theme property "zip" must be an instance of zip.fs.FS.`);
    // format_version
    if (!themeObject.format_version) throw new SyntaxError(`Theme is missing required property "format_version".`);
    if (typeof themeObject.format_version !== "string") throw new SyntaxError(`Theme property "format_version" must be a string.`);
    if (themeObject.format_version.startsWith("v")) throw new SyntaxError(`Theme property "format_version" must not include the leading "v".`);
    if (semver.valid(themeObject.format_version) === null) throw new SyntaxError(`Theme property "format_version" must be a valid semver version.`);
    // // id
    // if (!themeObject.id) throw new SyntaxError(`Theme is missing required property "id".`);
    // if (typeof themeObject.id !== "string") throw new SyntaxError(`Theme property "id" must be a string.`);
    // if (!/^[a-zA-Z0-9_\-.]+$/.test(themeObject.id)) throw new SyntaxError(`Theme property "id" does not match the pattern /^[a-zA-Z0-9_\\-.]+$/.`);
    // uuid
    if (!themeObject.uuid) throw new SyntaxError(`Theme is missing required property "uuid".`);
    if (typeof themeObject.uuid !== "string") throw new SyntaxError(`Theme property "uuid" must be a string.`);
    if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(themeObject.uuid))
        throw new SyntaxError(
            `Theme property "uuid" must be a valid UUID v4, it must match the following pattern: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.`
        );
    // description
    if (typeof themeObject.description !== "undefined" && typeof themeObject.description !== "string")
        throw new SyntaxError(`Theme property "description" must be a string or undefined.`);
    // -------- DEPENDENCY VALIDATION --------
    // dependencies
    if (typeof themeObject.dependencies !== "undefined") {
        if (!(themeObject.dependencies instanceof Array)) throw new SyntaxError(`Theme property "description" must be an array or undefined.`);
        let dependencyIndex: number = -1;
        for (const dependency of themeObject.dependencies) {
            dependencyIndex++;
            // -------- DEPENDENCY VALIDATION > TYPE VALIDATION --------
            // dependency
            if (typeof dependency === "undefined") continue;
            if (typeof dependency !== "object") throw new SyntaxError(`Theme dependency ${dependencyIndex} must be an object.`);
            // -------- DEPENDENCY VALIDATION > PROPERTY VALIDATION --------
            // uuid
            if (!("uuid" in dependency)) throw new SyntaxError(`Theme dependency ${dependencyIndex} is missing required property "uuid".`);
            if (typeof dependency.uuid !== "string") throw new SyntaxError(`Theme dependency ${dependencyIndex} property "uuid" must be a string.`);
            if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(dependency.uuid))
                throw new SyntaxError(
                    `Theme dependency ${dependencyIndex} property "uuid" must be a valid UUID v4, it must match the following pattern: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.`
                );
            // version
            if (dependency.version !== undefined) {
                if (typeof dependency.version !== "string")
                    throw new SyntaxError(`Theme dependency ${dependencyIndex} property "version" must be a string or undefined.`);
                if (dependency.version.startsWith("v"))
                    throw new SyntaxError(`Theme dependency ${dependencyIndex} property "version" must not include the leading "v".`);
                if (semver.valid(dependency.version) === null)
                    throw new SyntaxError(`Theme dependency ${dependencyIndex} property "version" must be a valid semver version.`);
            }
        }
    }
    // -------- PROPERTY VALIDATION --------
    // metadata
    if (typeof themeObject.metadata !== "undefined" && typeof themeObject.metadata !== "object")
        throw new SyntaxError(`Theme property "metadata" must be an object or undefined.`);
    // name
    if (!themeObject.name) throw new SyntaxError(`Theme is missing required property "name".`);
    if (typeof themeObject.name !== "string") throw new SyntaxError(`Theme property "name" must be a string.`);
    // min_engine_version
    if (typeof themeObject.min_engine_version !== "undefined") {
        if (typeof themeObject.min_engine_version !== "string") throw new SyntaxError(`Theme property "min_engine_version" must be a string or undefined.`);
        if (themeObject.min_engine_version.startsWith("v")) throw new SyntaxError(`Theme property "min_engine_version" must not include the leading "v".`);
        if (semver.valid(themeObject.min_engine_version) === null)
            throw new SyntaxError(`Theme property "min_engine_version" must be a valid semver version or undefined.`);
    }
    // // namespace
    // if (!themeObject.namespace) throw new SyntaxError(`Theme is missing required property "namespace".`);
    // if (themeObject.namespace === "built-in" && !builtInThemes.includes(themeObject as (typeof builtInThemes)[number]))
    //     throw new SyntaxError(`Theme is using the reserved namespace "built-in" but is not a built-in theme.`);
    // if (!/^[a-zA-Z0-9_\-.]+$/.test(themeObject.namespace))
    //     throw new SyntaxError(`Theme property "namespace" does not match the pattern /^[a-zA-Z0-9_\\-.]+$/.`);
    // version
    if (!themeObject.version) throw new SyntaxError(`Theme is missing required property "version".`);
    if (typeof themeObject.version !== "string") throw new SyntaxError(`Theme property "version" must be a string.`);
    if (themeObject.version.startsWith("v")) throw new SyntaxError(`Theme property "version" must not include the leading "v".`);
    if (semver.valid(themeObject.version) === null) throw new SyntaxError(`Theme property "version" must be a valid semver version.`);
    return;
}

/**
 * Validates a theme `color_replacements.json` JSON object.
 *
 * @param colorReplacements The theme color replacements object to validate.
 * @returns Asserts that the theme color replacements object is valid. If it is not valid, throws an error. Otherwise, returns `void`.
 */
export function validateThemeColorReplacementsObject(colorReplacements: any): asserts colorReplacements is ThemeColorReplacements {
    if (typeof colorReplacements !== "object") throw new TypeError(`Plugin must be an object.`);
    const colorReplacementsObject: ThemeColorReplacements = colorReplacements;
    if (!("format_version" in colorReplacementsObject))
        throw new SyntaxError(`Theme "color_replacements.json" is missing required property "format_version".`, { cause: colorReplacementsObject });
    if (typeof colorReplacementsObject.format_version !== "number")
        throw new SyntaxError(`Theme "color_replacements.json" property "format_version" must be a number.`, { cause: colorReplacementsObject });
    switch (colorReplacementsObject.format_version) {
        case 1: {
            // colorReplacements
            if (typeof colorReplacementsObject.colorReplacements !== "undefined" && typeof colorReplacementsObject.colorReplacements !== "object")
                throw new SyntaxError(`Theme "color_replacements.json" property "colorReplacements" must be an object or undefined.`);
            if (colorReplacementsObject.colorReplacements)
                throw new SyntaxError(`Theme "color_replacements.json" property "colorReplacements" must not be null.`);
            // advancedColorReplacements
            if (
                typeof colorReplacementsObject.advancedColorReplacements !== "undefined" &&
                typeof colorReplacementsObject.advancedColorReplacements !== "object"
            )
                throw new SyntaxError(`Theme "color_replacements.json" property "advancedColorReplacements" must be an object or undefined.`);
            if (colorReplacementsObject.advancedColorReplacements)
                throw new SyntaxError(`Theme "color_replacements.json" property "advancedColorReplacements" must not be null.`);
            // TODO: Maybe add deeper validation for colorReplacements and advancedColorReplacements, to check the types of properties deeper in the tree.
            break;
        }
        default:
            throw new SyntaxError(`Unsupported "color_replacements.json" format_version: ${colorReplacementsObject.format_version}`, {
                cause: colorReplacementsObject,
            });
    }
}

/**
 * Gets the data from the `color_replacements.json` files of the provided themes.
 *
 * @param themes The themes to get the color replacements data for.
 * @returns A promise that resolves with the color replacements data for the themes.
 */
export async function getColorReplacementsDataForThemes(themes: Theme[]): Promise<ThemeColorReplacements[]> {
    return (
        await Promise.all(
            themes.map(async (theme: Theme): Promise<ThemeColorReplacements | undefined> => {
                const zipEntry = theme.zip.getChildByName("color_replacements.json") as zip.ZipFileEntry<any, any> | undefined;
                if (!zipEntry) return undefined;
                const colorReplacementsData: ThemeColorReplacements = json5.parse(await zipEntry.getText()) as ThemeColorReplacements;
                if (colorReplacementsData.format_version !== 1) {
                    throw new Error(`Unsupported format version for color_replacements.json: ${colorReplacementsData.format_version}`);
                }
                return colorReplacementsData;
            })
        )
    ).filter((v: ThemeColorReplacements | undefined): v is ThemeColorReplacements => v !== undefined);
}

/**
 * An object containing details of an asset in a theme.
 */
export interface ThemeAssetItem {
    theme: Theme;
    filePathInTheme: string;
    distFilePath: string;
}

/**
 * The type of an asset in a theme.
 */
export type ThemeAssetType = "textures" | "videos" /* | "sounds" */ | "font";

/**
 * An object containing a list of assets for each type of asset in a theme.
 */
export interface ThemeAssetsData {
    theme: Theme;
    assets: Record<ThemeAssetType, ThemeAssetItem[]>;
}

/**
 * Gets the assets of the provided themes.
 *
 * @param themes The themes to get the assets for.
 * @returns The assets for the themes.
 */
export function getAssetsDataForThemes(themes: Theme[]): ThemeAssetsData[] {
    const typeToValidFileExtensionsMap: Record<ThemeAssetType, `.${string}`[]> = {
        textures: [".gif", ".svg", ".tga" /* REVIEW: See if .tga images are supported. */, ".png", ".jpg", ".jpeg"],
        videos: [".webm"],
        // sounds: [".ogg", ".mp3", ".wav", ".fsb"],
        font: [".otf", ".ttf"],
    };
    const themeAssetsDataList: ThemeAssetsData[] = [];
    for (const theme of themes) {
        const themeAssetsData: ThemeAssetsData = {
            theme,
            assets: {
                textures: [],
                videos: [],
                // sounds: [],
                font: [],
            },
        };
        for (const type of Object.keys(themeAssetsData.assets) as ThemeAssetType[]) {
            const dirEntry = theme.zip.find("textures");
            if (!dirEntry) continue;
            if (!dirEntry.directory) throw new Error(`Theme ${JSON.stringify(type)} directory is not a directory.`, { cause: theme });
            function recurseEntries(currentDirEntry: zip.ZipDirectoryEntry): void {
                for (const child of currentDirEntry.children) {
                    if (child.directory) return void recurseEntries(child);
                    if (!typeToValidFileExtensionsMap[type].some((ext: `.${string}`): boolean => child.name.toLowerCase().endsWith(ext))) continue;
                    themeAssetsData.assets[type].push({
                        theme,
                        filePathInTheme: child.getFullname(),
                        distFilePath: `gui/dist/${child.getRelativeName(dirEntry as zip.ZipDirectoryEntry)}`,
                    });
                }
            }
            recurseEntries(dirEntry);
        }
        themeAssetsDataList.push(themeAssetsData);
    }
    return themeAssetsDataList;
}

/**
 * An interface that contains extracted symbol names from the compiled Ore UI react code.
 */
export interface ExtractedSymbolNames {
    /**
     * The function name for the translation string resolver.
     *
     * @default "wi"
     */
    translationStringResolver: string;
    /**
     * The function name for the header function.
     *
     * @default "fu"
     */
    headerFunciton: string;
    /**
     * The function name for the header spacing function.
     *
     * @default "Gc"
     */
    headerSpacingFunction: string;
    /**
     * The function name for the edit world text function.
     *
     * @default "Dk"
     */
    editWorldTextFunction: string;
    /**
     * The function name for the JS text.
     *
     * @default "js"
     */
    jsText: string;
    /**
     * The function name for the navbar button function.
     *
     * @default "lc"
     */
    navbarButtonFunction: string;
    /**
     * The function name for the navbar button image function.
     *
     * @default "xc"
     */
    navbarButtonImageFunction: string;
    /**
     * The function name for the context holder.
     *
     * @default "a"
     */
    contextHolder: string;
    /**
     * The function name for the facet holder.
     *
     * @default "r"
     */
    facetHolder: string;
}

/**
 * Extracts the symbol names from the given file contents for the Ore UI Customizer.
 *
 * @param {string} fileContents The file contents.
 * @returns {ExtractedSymbolNames} The extracted symbol names.
 */
export function getExtractedSymbolNames(fileContents: string, fileName?: string): ExtractedSymbolNames {
    /**
     * The extracted symbol names.
     */
    let extractedSymbolNames: ExtractedSymbolNames = {
        translationStringResolver: "wi",
        headerFunciton: "fu", // TODO: Fix this for the editor-menu, editor-project, and gameplay scripts.
        headerSpacingFunction: "Gc",
        editWorldTextFunction: "Dk", // TODO: Fix this for the editor-menu, editor-project, and gameplay scripts.
        jsText: "js", // TODO: Fix this for the editor-project, and gameplay scripts.
        navbarButtonFunction: "lc", // TODO: Fix this for the gameplay script.
        navbarButtonImageFunction: "xc", // TODO: Fix this for the editor-project, and gameplay scripts.
        contextHolder: "a",
        facetHolder: "r",
    };

    const showWarnings: boolean = /(?:index|gameplay|editor(?:-menu|-project)?)-[0-9a-f]{5,20}\.js$/.test(fileName!);

    let failures: string[] = [];

    extractedSymbolNames.facetHolder =
        fileContents.match(
            /inverse:\(0,([a-zA-Z0-9_$])\.useFacetMap\)\(\(\(?([a-zA-Z0-9_$])\)?=>"POP"===(?:[a-zA-Z0-9_$])\),\[\],\[([a-zA-Z0-9_$])\]\)\}\)\)\)/
        )?.[1] ?? (failures.push("facetHolder"), extractedSymbolNames.facetHolder);

    extractedSymbolNames.contextHolder =
        fileContents.match(
            /(?:[a-zA-Z0-9_$]{2})=\(\{route:(?:[a-zA-Z0-9_$]),children:(?:[a-zA-Z0-9_$])\}\)=>\{const (?:[a-zA-Z0-9_$])=\(0,([a-zA-Z0-9_$]).useContext\)/
        )?.[1] ?? (failures.push("contextHolder"), extractedSymbolNames.contextHolder);

    extractedSymbolNames.translationStringResolver =
        fileContents.match(/([a-zA-Z0-9_$]{2})\("TitleBar.Buttons.Close"\)/)?.[1] ??
        (failures.push("translationStringResolver"), extractedSymbolNames.translationStringResolver);

    extractedSymbolNames.headerFunciton =
        fileContents.match(
            new RegExp(
                `${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),null,([a-zA-Z0-9_$]{1})\\("\\.microsoftSignInButtonTitle"\\)\\),`
            )
        )?.[1] ?? (failures.push("headerFunction"), extractedSymbolNames.headerFunciton);

    extractedSymbolNames.headerSpacingFunction =
        fileContents.match(
            new RegExp(`${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{size:1\\}\\),`)
        )?.[1] ?? (failures.push("headerSpacingFunction"), extractedSymbolNames.headerSpacingFunction);

    extractedSymbolNames.editWorldTextFunction =
        fileContents.match(/([a-zA-Z0-9_$]{2})\.Text=function\(\{children:e,align:t\}\)/)?.[1] ??
        (failures.push("editWorldTextFunction"), extractedSymbolNames.editWorldTextFunction);

    extractedSymbolNames.jsText =
        fileContents.match(
            new RegExp(`${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{type:"body",variant:"dimmer"\\}`)
        )?.[1] ?? (failures.push("jsText"), extractedSymbolNames.jsText);

    extractedSymbolNames.navbarButtonFunction =
        fileContents.match(
            new RegExp(`return ${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{className:"`)
        )?.[1] ?? (failures.push("navbarButtonFunction"), extractedSymbolNames.navbarButtonFunction);

    extractedSymbolNames.navbarButtonImageFunction =
        fileContents.match(
            new RegExp(
                `${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{className:"[a-zA-Z0-9_$]+",src:[a-zA-Z0-9_$]{2},imageRendering:"pixelated"`
            )
        )?.[1] ?? (failures.push("navbarButtonImageFunction"), extractedSymbolNames.navbarButtonImageFunction);

    if (showWarnings && failures.length > 0) {
        console.debug(`Failed to extract the following symbol names from ${fileName}: ${failures.join(", ")}`);
    }

    if (showWarnings && fileName?.startsWith("gui/dist/hbui/index")) {
        console.debug(`Extracted symbol names for ${fileName}:`, extractedSymbolNames);
    }

    return extractedSymbolNames;
}

/**
 * Extracts the regexes for the replacer function for the Ore UI Customizer.
 *
 * @param {ReturnType<typeof getExtractedSymbolNames>} extractedSymbolNames The extracted function names from the {@link getExtractedSymbolNames} function.
 * @returns An object containing the regexes for the replacer function.
 */
export function getReplacerRegexes(extractedSymbolNames: ReturnType<typeof getExtractedSymbolNames>) {
    /**
     * Lists of regexes to use for certain modifications.
     */
    const replacerRegexes = {
        /**
         * Make the hardcore mode toggle always clickable.
         *
         * ### Minecraft version support:
         *
         * #### Fully Supported:
         * - 1.21.70/71/72 (index-d6df7.js)
         * - 1.21.70/71/72 dev (index-1fd56.js)
         * - 1.21.80.20/21/22 preview (index-1da13.js)
         * - 1.21.80.25 preview (index-b3e96.js)
         * - 1.21.80.27/28 preview (index-07a21.js)
         * - 1.21.80.3 (index-07a21.js)
         * - 1.21.90.20 preview (index-fe5c0.js)
         *
         * #### Partially Supported:
         *
         * #### Not Supported:
         * - < 1.21.70
         * - 1.21.90.21 preview (index-aaad2.js)
         *
         * #### Support Unknown:
         * - \> 1.21.90.21 preview (index-aaad2.js)
         */
        hardcoreModeToggleAlwaysClickable: {
            /**
             * Replacing the hardcore mode toggle (v1).
             *
             * ### Minecraft version support:
             *
             * #### Fully Supported:
             * - 1.21.70/71/72 (index-d6df7.js)
             * - 1.21.70/71/72 dev (index-1fd56.js)
             * - 1.21.80.20/21/22 preview (index-1da13.js)
             * - 1.21.80.25 preview (index-b3e96.js)
             * - 1.21.80.27/28 preview (index-07a21.js)
             * - 1.21.80.3 (index-07a21.js)
             * - 1.21.90.20 preview (index-fe5c0.js)
             *
             * #### Partially Supported:
             *
             * #### Not Supported:
             * - < 1.21.70
             * - 1.21.90.21 preview (index-aaad2.js)
             *
             * #### Support Unknown:
             * - \> 1.21.90.21 preview (index-aaad2.js)
             */
            0: [
                /**
                 * Known supported Minecraft versions:
                 *
                 * - 1.21.70/71/72 (index-d6df7.js)
                 * - 1.21.70/71/72 dev (index-1fd56.js)
                 * - 1.21.80.20/21/22 preview (index-1da13.js)
                 * - 1.21.80.25 preview (index-b3e96.js)
                 * - 1.21.80.27/28 preview (index-07a21.js)
                 * - 1.21.80.3 (index-07a21.js)
                 * - 1.21.90.20 preview (index-fe5c0.js)
                 */
                new RegExp(
                    `function ([a-zA-Z0-9_$]{2,3})\\(\\s*?\\{\\s*?generalData\\s*?:\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?,\\s*?isLockedTemplate\\s*?:\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?\\}\\s*?\\)\\s*?\\{\\s*?const\\s*?\\{\\s*?t\\s*?:\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?\\}\\s*?=\\s*?([a-zA-Z0-9_$]{2})\\("CreateNewWorld\\.general"\\)\\s*?,\\s*?([a-zA-Z0-9_$]{1})\\s*?=\\s*?([a-zA-Z0-9_$]{2})\\(\\)\\s*?,\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?=\\s*?\\(\\s*?0\\s*?,\\s*?${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\s*?\\.\\s*?useContext\\s*?\\)\\s*?\\(\\s*?([a-zA-Z0-9_$]{2})\\s*?\\)\\s*?===\\s*?([a-zA-Z0-9_$]{2})\\.CREATE\\s*?,\\s*?(?:[a-zA-Z0-9_$]{1})=\\s*?\\(\\s*?0\\s*?,\\s*?${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useSharedFacet\\s*?\\)\\s*?\\(\\s*?([a-zA-Z0-9_$]{2})\\s*?\\)\\s*?,\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?=\\s*?\\(\\s*?0\\s*?,\\s*?${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\s*?\\)\\s*?\\(\\s*?\\(\\s*?\\(\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?,\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?,\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?\\)\\s*?=>\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?\\|\\|\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?\\|\\|\\s*?!(?:[a-zA-Z0-9_$]{1})\\s*?\\|\\|\\s*?(?:[a-zA-Z0-9_$]{1})\\.gameMode\\s*?!==\\s*?([a-zA-Z0-9_$]{2})\\.SURVIVAL\\s*?&&\\s*?(?:[a-zA-Z0-9_$]{1})\\.gameMode\\s*?!==\\s*?([a-zA-Z0-9_$]{2})\\.ADVENTURE\\s*?\\)\\s*?,\\s*?\\[\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?\\]\\s*?,\\s*?\\[\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?,\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?,\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?\\]\\s*?\\)\\s*?;\\s*?return \\s*?${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(\\s*?([a-zA-Z0-9_$]{2})\\s*?,\\s*?\\{\\s*?title\\s*?:\\s*?([a-zA-Z0-9_$]{1})\\("\\.hardcoreModeTitle"\\)\\s*?,\\s*?soundEffectPressed\\s*?:\\s*?"ui\\.hardcore_toggle_press"\\s*?,\\s*?disabled\\s*?:\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?,\\s*?description\\s*?:\\s*?([a-zA-Z0-9_$]{1})\\("\\.hardcoreModeDescription"\\)\\s*?,\\s*?value\\s*?:\\s*?\\(\\s*?0\\s*?,\\s*?${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\s*?\\)\\s*?\\(\\s*?\\(\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?=>\\s*?(?:[a-zA-Z0-9_$]{1})\\.isHardcore\\s*?\\)\\s*?,\\s*?\\[\\s*?\\]\\s*?,\\s*?\\[\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?\\]\\s*?\\)\\s*?,\\s*?onChange\\s*?:\\s*?\\(\\s*?0\\s*?,\\s*?${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\s*?\\)\\s*?\\(\\s*?\\(\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?=>\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?=>\\s*?\\{\\s*?(?:[a-zA-Z0-9_$]{1})\\.isHardcore\\s*?=\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?,\\s*?(?:[a-zA-Z0-9_$]{1})\\(\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?\\?\\s*?"ui\\.hardcore_enable"\\s*?:\\s*?"ui\\.hardcore_disable"\\s*?\\)\\s*?\\}\\s*?\\)\\s*?,\\s*?\\[\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?\\]\\s*?,\\s*?\\[\\s*?(?:[a-zA-Z0-9_$]{1})\\s*?\\]\\s*?\\)\\s*?,(?:\\s*?gamepad\\s*?:\\s*?\\{\\s*?index\\s*?:\\s*?4\\s*?\\}\\s*?,)?\\s*?imgSrc\\s*?:\\s*?([a-zA-Z0-9_$]{2,3})\\s*?,\\s*?"data-testid"\\s*?:\\s*?"hardcore-mode-toggle"\\s*?\\}\\s*?\\)\\s*?\\}`,
                    "g"
                ),
            ],
        },
        /**
         * Allow for disabling the experimental toggles even after the world has been played with them on, also applies to the `Education Edition` toggle.
         *
         * ### Minecraft version support:
         *
         * #### Fully Supported:
         * - 1.21.70/71/72 (index-d6df7.js)
         * - 1.21.70/71/72 dev (index-1fd56.js)
         * - 1.21.80.20/21/22 preview (index-1da13.js)
         * - 1.21.80.25 preview (index-b3e96.js)
         * - 1.21.80.27/28 preview (index-07a21.js)
         * - 1.21.80.3 (index-07a21.js)
         * - 1.21.90.20 preview (index-fe5c0.js)
         *
         * #### Partially Supported:
         *
         * #### Not Supported:
         * - < 1.21.70
         * - 1.21.90.21 preview (index-aaad2.js)
         *
         * #### Support Unknown:
         * - \> 1.21.90.21 preview (index-aaad2.js)
         */
        allowDisablingEnabledExperimentalToggles: {
            /**
             * Replacing experimental toggle generation code (v1).
             *
             * ### Minecraft version support:
             *
             * #### Fully Supported:
             * - 1.21.70/71/72 (index-d6df7.js)
             * - 1.21.70/71/72 dev (index-1fd56.js)
             * - 1.21.80.20/21/22 preview (index-1da13.js)
             * - 1.21.80.25 preview (index-b3e96.js)
             * - 1.21.80.27/28 preview (index-07a21.js)
             * - 1.21.80.3 (index-07a21.js)
             * - 1.21.90.20 preview (index-fe5c0.js)
             *
             * #### Partially Supported:
             *
             * #### Not Supported:
             * - < 1.21.70
             * - 1.21.90.21 preview (index-aaad2.js)
             *
             * #### Support Unknown:
             * - \> 1.21.90.21 preview (index-aaad2.js)
             */
            0: [
                /**
                 * Known supported Minecraft versions:
                 *
                 * - 1.21.70/71/72 (index-d6df7.js)
                 * - 1.21.70/71/72 dev (index-1fd56.js)
                 * - 1.21.80.20/21/22 preview (index-1da13.js)
                 * - 1.21.80.25 preview (index-b3e96.js)
                 * - 1.21.80.27/28 preview (index-07a21.js)
                 * - 1.21.80.3 (index-07a21.js)
                 * - 1.21.90.20 preview (index-fe5c0.js)
                 */
                new RegExp(
                    `function ([a-zA-Z0-9_$]{2,3})\\(\\{experimentalFeature:e,(?:gamepadIndex:t,)?disabled:([a-zA-Z0-9_$]{1}),achievementsDisabledMessages:([a-zA-Z0-9_$]{1}),areAllTogglesDisabled:([a-zA-Z0-9_$]{1})\\}\\)\\{const\\{gt:([a-zA-Z0-9_$]{1})\\}=function\\(\\)\\{const\\{translate:e,formatDate:t\\}=\\(0,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.useContext\\)\\(([a-zA-Z0-9_$]{2})\\);return\\(0,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.useMemo\\)\\(\\(\\(\\)=>\\(\\{f:\\{formatDate:t\\},gt:\\(t,(?:[a-zA-Z0-9_$]{1})\\)=>\\{var (?:[a-zA-Z0-9_$]{1});return null!==\\((?:[a-zA-Z0-9_$]{1})=e\\(t,(?:[a-zA-Z0-9_$]{1}|null!=[a-zA-Z0-9_$]{1}\\?[a-zA-Z0-9_$]{1}:\\[\\])\\)\\)&&void 0!==(?:[a-zA-Z0-9_$]{1})\\?(?:[a-zA-Z0-9_$]{1}):t\\}\\}\\)\\),\\[e,t\\]\\)\\}\\(\\),\\{t:c\\}=${extractedSymbolNames.translationStringResolver.replaceAll("$", "\\$")}\\("CreateNewWorld\\.all"\\),([a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.id\\),\\[\\],\\[e\\]\\),([a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetUnwrap\\)\\(\\7\\),([a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.title\\),\\[\\],\\[e\\]\\),([a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetUnwrap\\)\\(\\9\\),([a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.description\\),\\[\\],\\[e\\]\\),([a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetUnwrap\\)\\(\\11\\),([a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.isEnabled\\),\\[\\],\\[e\\]\\),([a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(\\(e,t\\)=>e\\|\\|t\\.isTogglePermanentlyDisabled\\),\\[\\],\\[\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetWrap\\)\\((?:[a-zA-Z0-9_$]{1})\\),e\\]\\),([a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(\\(e,t\\)=>(?:[a-zA-Z0-9_$]{1})=>\\{(?:[a-zA-Z0-9_$]{1})&&t\\?([a-zA-Z0-9_$]{2})\\.set\\(\\{userTriedToActivateToggle:!0,doSetToggleValue:\\(\\)=>e\\.isEnabled=(?:[a-zA-Z0-9_$]{1}),userHasAcceptedBetaFeatures:!1\\}\\):e\\.isEnabled=(?:[a-zA-Z0-9_$]{1})\\}\\),\\[\\],\\[e,\\4\\]\\),([a-zA-Z0-9_$]{1})=c\\("\\.narrationSuffixDisablesAchievements"\\),([a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>0===e\\.length\\?c\\("\\.narrationSuffixEnablesAchievements"\\):void 0\\),\\[c\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\);return null!=\\8\\?${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{title:\\10!==${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.NO_VALUE\\?\\5\\(\\10\\):"",description:\\12!==${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.NO_VALUE\\?\\5\\(\\12\\):"",(?:gamepad:\\{index:t\\},)?value:\\13,disabled:\\14,onChange:\\15,onNarrationText:([a-zA-Z0-9_$]{1}),offNarrationText:(?:[a-zA-Z0-9_$]{1})\\}\\):null\\}`
                ),
            ],
        },
        /**
         * Make the hardcore mode toggle always clickable (v1).
         *
         * ### Minecraft version support:
         *
         * #### Fully Supported:
         * - 1.21.70/71/72 (index-d6df7.js)
         * - 1.21.70/71/72 dev (index-1fd56.js)
         * - 1.21.80.20/21/22 preview (index-1da13.js)
         * - 1.21.80.25 preview (index-b3e96.js)
         * - 1.21.80.27/28 preview (index-07a21.js)
         * - 1.21.80.3 (index-07a21.js)
         * - 1.21.90.20 preview (index-fe5c0.js)
         *
         * #### Partially Supported:
         * - 1.21.90.21 preview (index-aaad2.js)
         *
         * #### Not Supported:
         * - < 1.21.70
         *
         * #### Support Unknown:
         * - \> 1.21.90.21 preview (index-aaad2.js)
         */
        addMoreDefaultGameModes: {
            /**
             * Replacing game mode dropdown code (v1).
             *
             * ### Minecraft version support:
             *
             * #### Fully Supported:
             * - 1.21.70/71/72 (index-d6df7.js)
             * - 1.21.70/71/72 dev (index-1fd56.js)
             * - 1.21.80.20/21/22 preview (index-1da13.js)
             * - 1.21.80.25 preview (index-b3e96.js)
             * - 1.21.80.27/28 preview (index-07a21.js)
             * - 1.21.80.3 (index-07a21.js)
             * - 1.21.90.20 preview (index-fe5c0.js)
             *
             * #### Partially Supported:
             *
             * #### Not Supported:
             * - < 1.21.70
             * - 1.21.90.21 preview (index-aaad2.js)
             *
             * #### Support Unknown:
             * - \> 1.21.90.21 preview (index-aaad2.js)
             */
            0: [
                /**
                 * Known supported Minecraft versions:
                 *
                 * - 1.21.70/71/72 (index-d6df7.js)
                 * - 1.21.70/71/72 dev (index-1fd56.js)
                 * - 1.21.80.20/21/22 preview (index-1da13.js)
                 * - 1.21.80.25 preview (index-b3e96.js)
                 * - 1.21.80.27/28 preview (index-07a21.js)
                 * - 1.21.80.3 (index-07a21.js)
                 * - 1.21.90.20 preview (index-fe5c0.js)
                 */
                new RegExp(
                    `function ([a-zA-Z0-9_$]{2,3})\\(\\{generalData:e,isLockedTemplate:t,isUsingTemplate:([a-zA-Z0-9_$]{1}),achievementsDisabledMessages:([a-zA-Z0-9_$]{1}),isHardcoreMode:o\\}\\)\\{const\\{t:(?:[a-zA-Z0-9_$]{1})\\}=${extractedSymbolNames.translationStringResolver.replaceAll("$", "\\$")}\\("CreateNewWorld\\.general"\\),\\{t:(?:[a-zA-Z0-9_$]{1})\\}=${extractedSymbolNames.translationStringResolver.replaceAll("$", "\\$")}\\("CreateNewWorld\\.all"\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useSharedFacet\\)\\(([a-zA-Z0-9_$]{2})\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.useContext\\)\\(([a-zA-Z0-9_$]{2})\\)!==([a-zA-Z0-9_$]{2})\\.CREATE,(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useSharedFacet\\)\\(([a-zA-Z0-9_$]{2})\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(\\((?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\)=>(?:[a-zA-Z0-9_$]{1})\\|\\|(?:[a-zA-Z0-9_$]{1})\\|\\|(?:[a-zA-Z0-9_$]{1})\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\]\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(\\(e,t\\)=>\\{const (?:[a-zA-Z0-9_$]{1})=\\[([a-zA-Z0-9_$]{2,3})\\(\\{label:(?:[a-zA-Z0-9_$]{1})\\("\\.gameModeSurvivalLabel"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.gameModeSurvivalDescription"\\),value:([a-zA-Z0-9_$]{2})\\.SURVIVAL\\},1===(?:[a-zA-Z0-9_$]{1})\\.length\\?\\{narrationSuffix:(?:[a-zA-Z0-9_$]{1})\\("\\.narrationSuffixEnablesAchievements"\\)\\}:\\{\\}\\),\\{label:(?:[a-zA-Z0-9_$]{1})\\("\\.gameModeCreativeLabel"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.gameModeCreativeDescription"\\),value:(?:[a-zA-Z0-9_$]{2})\\.CREATIVE,narrationSuffix:(?:[a-zA-Z0-9_$]{1})\\("\\.narrationSuffixDisablesAchievements"\\)\\}\\];return\\((?:[a-zA-Z0-9_$]{1})\\|\\|(?:[a-zA-Z0-9_$]{1})\\)&&(?:[a-zA-Z0-9_$]{1})\\.push\\((?:[a-zA-Z0-9_$]{2,3})\\(\\{label:(?:[a-zA-Z0-9_$]{1})\\("\\.gameModeAdventureLabel"\\),description:(?:[a-zA-Z0-9_$]{1})\\(t\\?"\\.gameModeAdventureTemplateDescription":"\\.gameModeAdventureDescription"\\),value:(?:[a-zA-Z0-9_$]{2})\\.ADVENTURE\\},1===(?:[a-zA-Z0-9_$]{1})\\.length\\?\\{narrationSuffix:(?:[a-zA-Z0-9_$]{1})\\("\\.narrationSuffixEnablesAchievements"\\)\\}:\\{\\}\\)\\),(?:[a-zA-Z0-9_$]{1})\\}\\),\\[(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\],\\[(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\]\\),(?:[a-zA-Z0-9_$]{1})=(\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useNotifyMountComplete\\)|[a-zA-Z0-9_$]{2})\\(\\);return ${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{title:(?:[a-zA-Z0-9_$]{1})\\("\\.gameModeTitle"\\),disabled:(?:[a-zA-Z0-9_$]{1}),options:(?:[a-zA-Z0-9_$]{1}),onMountComplete:(?:[a-zA-Z0-9_$]{1}),value:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\((?:[a-zA-Z0-9_$]{1})=>(?:[a-zA-Z0-9_$]{1})\\.gameMode\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),onChange:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(\\((?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\)=>(?:[a-zA-Z0-9_$]{1})=>\\{const ([a-zA-Z0-9_$]{1})=(?:[a-zA-Z0-9_$]{1})\\.gameMode;(?:[a-zA-Z0-9_$]{1})\\.gameMode=(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})&&(?:[a-zA-Z0-9_$]{1})\\.trackOptionChanged\\(([a-zA-Z0-9_$]{2,3})\\.GameModeChanged,(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\)\\}\\),\\[(?:[a-zA-Z0-9_$]{1})\\],\\[(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\]\\)\\}\\)\\}`
                ),
            ],
            /**
             * Replacing game mode id enumeration (v1).
             *
             * ### Minecraft version support:
             *
             * #### Fully Supported:
             * - 1.21.70/71/72 (index-d6df7.js)
             * - 1.21.70/71/72 dev (index-1fd56.js)
             * - 1.21.80.20/21/22 preview (index-1da13.js)
             * - 1.21.80.25 preview (index-b3e96.js)
             * - 1.21.80.27/28 preview (index-07a21.js)
             * - 1.21.80.3 (index-07a21.js)
             * - 1.21.90.20 preview (index-fe5c0.js)
             * - 1.21.90.21 preview (index-aaad2.js)
             *
             * #### Partially Supported:
             *
             * #### Not Supported:
             * - < 1.21.70
             *
             * #### Support Unknown:
             * - \> 1.21.90.21 preview (index-aaad2.js)
             */
            1: [
                /**
                 * Known supported Minecraft versions:
                 *
                 * - 1.21.70/71/72 (index-d6df7.js)
                 * - 1.21.70/71/72 dev (index-1fd56.js)
                 * - 1.21.80.20/21/22 preview (index-1da13.js)
                 * - 1.21.80.25 preview (index-b3e96.js)
                 * - 1.21.80.27/28 preview (index-07a21.js)
                 * - 1.21.80.3 (index-07a21.js)
                 * - 1.21.90.20 preview (index-fe5c0.js)
                 * - 1.21.90.21 preview (index-aaad2.js)
                 */
                /function\(e\)\{e\[e\.UNKNOWN=-1\]="UNKNOWN",e\[e\.SURVIVAL=0\]="SURVIVAL",e\[e\.CREATIVE=1\]="CREATIVE",e\[e\.ADVENTURE=2\]="ADVENTURE"(?:,e\[e\.DEFAULT=5\]="DEFAULT",e\[e\.SPECTATOR=6\]="SPECTATOR")?\}\(([a-zA-Z0-9_$]{2})\|\|\(([a-zA-Z0-9_$]{2})=\{\}\)\),/,
                /\(([a-zA-Z0-9_$]{2})=([a-zA-Z0-9_$]{2})\|\|\(\2=\{\}\)\)\[\1\.UNKNOWN=\x2d1\]="UNKNOWN",\1\[\1\.SURVIVAL=0\]="SURVIVAL",\1\[\1\.CREATIVE=1\]="CREATIVE",\1\[\1\.ADVENTURE=2\]="ADVENTURE",\1\[\1\.DEFAULT=5\]="DEFAULT",\1\[\1\.SPECTATOR=6\]="SPECTATOR",/,
            ],
        },
        /**
         * Add the generator type dropdown to the advanced tab of the create and edit world screens.
         *
         * ### Minecraft version support:
         *
         * #### Fully Supported:
         * - 1.21.70/71/72 (index-d6df7.js)
         * - 1.21.70/71/72 dev (index-1fd56.js)
         * - 1.21.80.20/21/22 preview (index-1da13.js)
         * - 1.21.80.25 preview (index-b3e96.js)
         * - 1.21.80.27/28 preview (index-07a21.js)
         * - 1.21.80.3 (index-07a21.js)
         * - 1.21.90.20 preview (index-fe5c0.js)
         *
         * #### Partially Supported:
         * - 1.21.90.21 preview (index-aaad2.js)
         *
         * #### Not Supported:
         * - < 1.21.70
         *
         * #### Support Unknown:
         * - \> 1.21.90.21 preview (index-aaad2.js)
         */
        addGeneratorTypeDropdown: {
            /**
             * Adding the generator type dropdown (v1).
             *
             * ### Minecraft version support:
             *
             * #### Fully Supported:
             * - 1.21.70/71/72 (index-d6df7.js)
             * - 1.21.70/71/72 dev (index-1fd56.js)
             * - 1.21.80.20/21/22 preview (index-1da13.js)
             * - 1.21.80.25 preview (index-b3e96.js)
             * - 1.21.80.27/28 preview (index-07a21.js)
             * - 1.21.80.3 (index-07a21.js)
             * - 1.21.90.20 preview (index-fe5c0.js)
             *
             * #### Partially Supported:
             *
             * #### Not Supported:
             * - < 1.21.70
             * - 1.21.90.21 preview (index-aaad2.js)
             *
             * #### Support Unknown:
             * - \> 1.21.90.21 preview (index-aaad2.js)
             */
            0: [
                /**
                 * Known supported Minecraft versions:
                 *
                 * - 1.21.70/71/72 (index-d6df7.js)
                 * - 1.21.70/71/72 dev (index-1fd56.js)
                 * - 1.21.80.20/21/22 preview (index-1da13.js)
                 * - 1.21.80.25 preview (index-b3e96.js)
                 * - 1.21.80.27/28 preview (index-07a21.js)
                 * - 1.21.80.3 (index-07a21.js)
                 * - 1.21.90.20 preview (index-fe5c0.js)
                 */
                new RegExp(
                    `(?:[a-zA-Z0-9_$]{1})(?:&&!(?:[a-zA-Z0-9_$]{1})\\?|\\?null:)${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.Mount,\\{when:([a-zA-Z0-9_$]{1})\\},${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.DeferredMount|[a-zA-Z0-9_$]{2}),null,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2,3}),\\{label:([a-zA-Z0-9_$]{1})\\("\\.generatorTypeLabel"\\),options:\\[\\{value:([a-zA-Z0-9_$]{2})\\.Overworld,label:(?:[a-zA-Z0-9_$]{1})\\("\\.vanillaWorldGeneratorLabel"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.vanillaWorldGeneratorDescription"\\)\\},\\{value:(?:[a-zA-Z0-9_$]{2})\\.Flat,label:(?:[a-zA-Z0-9_$]{1})\\("\\.flatWorldGeneratorLabel"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.flatWorldGeneratorDescription"\\)\\},\\{value:(?:[a-zA-Z0-9_$]{2})\\.Void,label:(?:[a-zA-Z0-9_$]{1})\\("\\.voidWorldGeneratorLabel"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.voidWorldGeneratorDescription"\\)\\}\\],value:([a-zA-Z0-9_$]{1})\\.value,onChange:(?:[a-zA-Z0-9_$]{1})\\.onChange\\}\\)\\)\\)(?::null)?`
                ),
            ],
            /**
             * Replacing generator type id enumeration (v1).
             *
             * ### Minecraft version support:
             *
             * #### Fully Supported:
             * - 1.21.70/71/72 (index-d6df7.js)
             * - 1.21.70/71/72 dev (index-1fd56.js)
             * - 1.21.80.20/21/22 preview (index-1da13.js)
             * - 1.21.80.25 preview (index-b3e96.js)
             * - 1.21.80.27/28 preview (index-07a21.js)
             * - 1.21.80.3 (index-07a21.js)
             * - 1.21.90.20 preview (index-fe5c0.js)
             * - 1.21.90.21 preview (index-aaad2.js)
             *
             * #### Partially Supported:
             *
             * #### Not Supported:
             * - < 1.21.70
             *
             * #### Support Unknown:
             * - \> 1.21.90.21 preview (index-aaad2.js)
             */
            1: [
                /**
                 * Known supported Minecraft versions:
                 *
                 * - 1.21.70/71/72 (index-d6df7.js)
                 * - 1.21.70/71/72 dev (index-1fd56.js)
                 * - 1.21.80.20/21/22 preview (index-1da13.js)
                 * - 1.21.80.25 preview (index-b3e96.js)
                 * - 1.21.80.27/28 preview (index-07a21.js)
                 * - 1.21.80.3 (index-07a21.js)
                 * - 1.21.90.20 preview (index-fe5c0.js)
                 * - 1.21.90.21 preview (index-aaad2.js)
                 */
                new RegExp(
                    `function\\(e\\)\\{e\\[e\\.Legacy=0\\]="Legacy",e\\[e\\.Overworld=1\\]="Overworld",e\\[e\\.Flat=2\\]="Flat",e\\[e\\.Nether=3\\]="Nether",e\\[e\\.TheEnd=4\\]="TheEnd",e\\[e\\.Void=5\\]="Void",e\\[e\\.Undefined=6\\]="Undefined"\\}\\(([a-zA-Z0-9_$]{2})\\|\\|\\((?:[a-zA-Z0-9_$]{2})=\\{\\}\\)\\),`
                ),
            ],
        },
        /**
         * Allow for changing the seed in the edit world screen (v1).
         *
         * ### Minecraft version support:
         *
         * #### Fully Supported:
         * - 1.21.70/71/72 (index-d6df7.js)
         * - 1.21.70/71/72 dev (index-1fd56.js)
         * - 1.21.80.20/21/22 preview (index-1da13.js)
         * - 1.21.80.25 preview (index-b3e96.js)
         * - 1.21.80.27/28 preview (index-07a21.js)
         * - 1.21.80.3 (index-07a21.js)
         * - 1.21.90.20 preview (index-fe5c0.js)
         * - 1.21.90.21 preview (index-aaad2.js)
         *
         * #### Partially Supported:
         *
         * #### Not Supported:
         * - < 1.21.70
         *
         * #### Support Unknown:
         * - \> 1.21.90.21 preview (index-aaad2.js)
         */
        allowForChangingSeeds: {
            /**
             * Replacing the seed text box in the advanced edit world tab (v1).
             *
             * ### Minecraft version support:
             *
             * #### Fully Supported:
             * - 1.21.70/71/72 (index-d6df7.js)
             * - 1.21.70/71/72 dev (index-1fd56.js)
             * - 1.21.80.20/21/22 preview (index-1da13.js)
             * - 1.21.80.25 preview (index-b3e96.js)
             * - 1.21.80.27/28 preview (index-07a21.js)
             * - 1.21.80.3 (index-07a21.js)
             * - 1.21.90.20 preview (index-fe5c0.js)
             * - 1.21.90.21 preview (index-aaad2.js)
             *
             * #### Partially Supported:
             *
             * #### Not Supported:
             * - < 1.21.70
             *
             * #### Support Unknown:
             * - \> 1.21.90.21 preview (index-aaad2.js)
             */
            0: [
                /**
                 * Known supported Minecraft versions:
                 *
                 * - 1.21.70/71/72 (index-d6df7.js)
                 * - 1.21.70/71/72 dev (index-1fd56.js)
                 * - 1.21.80.20/21/22 preview (index-1da13.js)
                 * - 1.21.80.25 preview (index-b3e96.js)
                 * - 1.21.80.27/28 preview (index-07a21.js)
                 * - 1.21.80.3 (index-07a21.js)
                 * - 1.21.90.20 preview (index-fe5c0.js)
                 * - 1.21.90.21 preview (index-aaad2.js)
                 */
                new RegExp(
                    `([a-zA-Z0-9_$]{2})=\\(\\{advancedData:e,isEditorWorld:t,onSeedValueChange:([a-zA-Z0-9_$]{1}),isSeedChangeLocked:([a-zA-Z0-9_$]{1}),showSeedTemplates:o\\}\\)=>\\{const\\{t:(?:[a-zA-Z0-9_$]{1})\\}=([a-zA-Z0-9_$]{2})\\("CreateNewWorld\\.advanced"\\),\\{t:(?:[a-zA-Z0-9_$]{1})\\}=(?:[a-zA-Z0-9_$]{2})\\("CreateNewWorld\\.all"\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.useContext\\)\\(([a-zA-Z0-9_$]{2})\\)!==([a-zA-Z0-9_$]{2})\\.CREATE,(?:(?:[a-zA-Z0-9_$]{1})=([a-zA-Z0-9_$]{2})\\(([a-zA-Z0-9_$]{2})\\),)?(?:[a-zA-Z0-9_$]{1})=([a-zA-Z0-9_$]{2})\\(\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useSharedFacet\\)\\(([a-zA-Z0-9_$]{2})\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useSharedFacet\\)\\(([a-zA-Z0-9_$]{2})\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.worldSeed\\),\\[\\],\\[e\\]\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.isClipboardCopySupported\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(\\(e,t,(?:[a-zA-Z0-9_$]{1})\\)=>\\(\\)=>\\{t\\.copyToClipboard\\(e\\),(?:[a-zA-Z0-9_$]{1})\\.queueSnackbar\\((?:[a-zA-Z0-9_$]{1})\\("\\.copyToClipboard"\\)\\)\\}\\),\\[(?:[a-zA-Z0-9_$]{1})\\],\\[(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\]\\),(?:[a-zA-Z0-9_$]{1})=(?:[a-zA-Z0-9_$]{1})\\?(?:[a-zA-Z0-9_$]{1}):\\(\\)=>(?:[a-zA-Z0-9_$]{1})\\.push\\("/create-new-world/seed-templates"\\),([a-zA-Z0-9_$]{1})=(?:[a-zA-Z0-9_$]{1})\\?"":(?:[a-zA-Z0-9_$]{1})\\("\\.worldSeedPlaceholder"\\),([a-zA-Z0-9_$]{1})=(?:[a-zA-Z0-9_$]{1})\\((?:[a-zA-Z0-9_$]{1})\\?"\\.worldSeedCopyButton":"\\.worldSeedButton"\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(\\(e,t,(?:[a-zA-Z0-9_$]{1})\\)=>t\\|\\|(?:[a-zA-Z0-9_$]{1})(?:&&(?:[a-zA-Z0-9_$]{1}))?&&!(?:[a-zA-Z0-9_$]{1})&&e\\.generatorType!=([a-zA-Z0-9_$]{2})\\.Overworld\\),\\[(?:[a-zA-Z0-9_$]{1})(?:,(?:[a-zA-Z0-9_$]{1}))?\\],\\[e,(?:[a-zA-Z0-9_$]{1}),t\\]\\);return o\\?${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.DeferredMount|[a-zA-Z0-9_$]{2}),null,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}|[a-zA-Z0-9_$]\\.Unwrap),\\{data:(?:[a-zA-Z0-9_$]{1})\\},\\(e=>(?:[a-zA-Z0-9_$]{1})&&!e\\?${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{disabled:(?:[a-zA-Z0-9_$]{1}),label:(?:[a-zA-Z0-9_$]{1})\\("\\.worldSeedLabel"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.worldSeedDescription"\\),maxLength:[0-9]+,value:(?:[a-zA-Z0-9_$]{1}),onChange:(?:[a-zA-Z0-9_$]{1}),placeholder:(?:[a-zA-Z0-9_$]{1})\\("\\.worldSeedPlaceholder"\\),disabledNarrationSuffix:(?:[a-zA-Z0-9_$]{1})\\("\\.narrationSuffixTemplateLocked"\\),"data-testid":"world-seed-text-field"\\}\\):${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((?:[a-zA-Z0-9_$]{2})\\.WithButton,\\{buttonInputLegend:(?:[a-zA-Z0-9_$]{1}),buttonText:(?:[a-zA-Z0-9_$]{1}),buttonOnClick:(?:[a-zA-Z0-9_$]{1}),textDisabled:(?:[a-zA-Z0-9_$]{1}),disabled:(?:[a-zA-Z0-9_$]{1}),label:(?:[a-zA-Z0-9_$]{1})\\("\\.worldSeedLabel"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.worldSeedDescription"\\),maxLength:[0-9]+,value:(?:[a-zA-Z0-9_$]{1}),onChange:(?:[a-zA-Z0-9_$]{1}),placeholder:(?:[a-zA-Z0-9_$]{1}),buttonNarrationHint:(?:[a-zA-Z0-9_$]{1})\\("\\.narrationTemplatesButtonNarrationHint"\\),disabledNarrationSuffix:(?:[a-zA-Z0-9_$]{1})\\("\\.narrationSuffixTemplateLocked"\\),"data-testid":"world-seed-with-button"\\}\\)\\)\\)\\):${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((?:${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.DeferredMount|[a-zA-Z0-9_$]{2}),null,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((?:[a-zA-Z0-9_$]{2}|[a-zA-Z0-9_$]\\.Unwrap),\\{disabled:(?:[a-zA-Z0-9_$]{1}),label:(?:[a-zA-Z0-9_$]{1})\\("\\.worldSeedLabel"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.worldSeedDescription"\\),maxLength:[0-9]+,value:(?:[a-zA-Z0-9_$]{1}),onChange:(?:[a-zA-Z0-9_$]{1}),placeholder:(?:[a-zA-Z0-9_$]{1})\\("\\.worldSeedPlaceholder"\\),disabledNarrationSuffix:(?:[a-zA-Z0-9_$]{1})\\("\\.narrationSuffixTemplateLocked"\\)\\}\\)\\)\\},`
                ),
            ],
        },
        /**
         * Allow for changing the flat world preset in the advanced tab of the edit world screen.
         *
         * ### Minecraft version support:
         *
         * #### Fully Supported:
         * - 1.21.80.20/21/22 preview (index-1da13.js)
         * - 1.21.80.25 preview (index-b3e96.js)
         * - 1.21.80.27/28 preview (index-07a21.js)
         * - 1.21.80.3 (index-07a21.js)
         * - 1.21.90.20 preview (index-fe5c0.js)
         * - 1.21.90.21 preview (index-aaad2.js)
         *
         * #### Partially Supported:
         *
         * #### Not Supported:
         * - < 1.21.80.20 preview (index-1da13.js)
         * - < 1.21.80.3 (index-07a21.js)
         *
         * #### Support Unknown:
         * - \> 1.21.90.21 preview (index-aaad2.js)
         */
        allowForChangingFlatWorldPreset: {
            /**
             * Make the flat world toggle and preset selector always enabled in the advanced tab of the edit world screen.
             *
             * ### Minecraft version support:
             *
             * #### Fully Supported:
             * - 1.21.80.20/21/22 preview (index-1da13.js)
             * - 1.21.80.25 preview (index-b3e96.js)
             * - 1.21.80.27/28 preview (index-07a21.js)
             * - 1.21.80.3 (index-07a21.js)
             * - 1.21.90.20 preview (index-fe5c0.js)
             * - 1.21.90.21 preview (index-aaad2.js)
             *
             * #### Partially Supported:
             *
             * #### Not Supported:
             * - < 1.21.80.20 preview (index-1da13.js)
             * - < 1.21.80.3 (index-07a21.js)
             *
             * #### Support Unknown:
             * - \> 1.21.90.21 preview (index-aaad2.js)
             */
            0: [
                /**
                 * ### Minecraft version support:
                 *
                 * #### Fully Supported:
                 * - 1.21.80.20/21/22 preview (index-1da13.js)
                 * - 1.21.80.25 preview (index-b3e96.js)
                 * - 1.21.80.27/28 preview (index-07a21.js)
                 * - 1.21.80.3 (index-07a21.js)
                 * - 1.21.90.20 preview (index-fe5c0.js)
                 * - 1.21.90.21 preview (index-aaad2.js)
                 *
                 * #### Partially Supported:
                 *
                 * #### Not Supported:
                 * - < 1.21.80.20 preview (index-1da13.js)
                 * - < 1.21.80.3 (index-07a21.js)
                 *
                 * #### Support Unknown:
                 * - \> 1.21.90.21 preview (index-aaad2.js)
                 */
                new RegExp(
                    `${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.Mount,\\{when:(?:[a-zA-Z0-9_$]{1})\\},${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2,3}),\\{value:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.useFlatWorld\\),\\[\\],\\[([a-zA-Z0-9_$]{1})\\]\\),preset:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.flatWorldPreset\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),onValueChanged:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(e=>t=>\\{e\\.useFlatWorld=t,t&&e\\.flatWorldPreset\\?([a-zA-Z0-9_$]{1})\\(([a-zA-Z0-9_$]{2,3})\\[e\\.flatWorldPreset\\]\\):(?:[a-zA-Z0-9_$]{1})\\(""\\)\\}\\),\\[(?:[a-zA-Z0-9_$]{1})\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),onPresetChanged:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(e=>t=>\\{e\\.flatWorldPreset=t,e\\.useFlatWorld\\?(?:[a-zA-Z0-9_$]{1})\\((?:[a-zA-Z0-9_$]{2,3})\\[t\\]\\):(?:[a-zA-Z0-9_$]{1})\\(""\\)\\}\\),\\[(?:[a-zA-Z0-9_$]{1})\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),disabled:(?:[a-zA-Z0-9_$]{1}),hideAccordion:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>null==e\\.flatWorldPreset\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),achievementsDisabledMessages:([a-zA-Z0-9_$]{1})\\}\\)\\)\\)`
                ),
            ],
            /**
             * Make the dropdown for the flat world preset selector always visible when the flat world toggle is enabled in the advanced tab of the edit world screen.
             *
             * ### Minecraft version support:
             *
             * #### Fully Supported:
             * - 1.21.80.20/21/22 preview (index-1da13.js)
             * - 1.21.80.25 preview (index-b3e96.js)
             * - 1.21.80.27/28 preview (index-07a21.js)
             * - 1.21.80.3 (index-07a21.js)
             * - 1.21.90.20 preview (index-fe5c0.js)
             * - 1.21.90.21 preview (index-aaad2.js)
             *
             * #### Partially Supported:
             *
             * #### Not Supported:
             * - < 1.21.80.20 preview (index-1da13.js)
             * - < 1.21.80.3 (index-07a21.js)
             *
             * #### Support Unknown:
             * - \> 1.21.90.21 preview (index-aaad2.js)
             */
            1: [
                /**
                 * ### Minecraft version support:
                 *
                 * #### Fully Supported:
                 * - 1.21.80.20/21/22 preview (index-1da13.js)
                 * - 1.21.80.25 preview (index-b3e96.js)
                 * - 1.21.80.27/28 preview (index-07a21.js)
                 * - 1.21.80.3 (index-07a21.js)
                 * - 1.21.90.20 preview (index-fe5c0.js)
                 * - 1.21.90.21 preview (index-aaad2.js)
                 * - 1.21.100.21 preview (index-c7f65a88ed057ec9b0e1.js)
                 *
                 * #### Partially Supported:
                 *
                 * #### Not Supported:
                 * - < 1.21.80.20 preview (index-1da13.js)
                 * - < 1.21.80.3 (index-07a21.js)
                 * - \> 1.21.100.21 preview (index-c7f65a88ed057ec9b0e1.js)
                 *
                 * #### Support Unknown:
                 */
                {
                    regex: new RegExp(
                        `return ${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.Fragment,null,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.Mount,\\{when:(?:[a-zA-Z0-9_$]{1})\\},${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{onChange:([a-zA-Z0-9_$]{1}),value:([a-zA-Z0-9_$]{1}),title:([a-zA-Z0-9_$]{1})\\("\\.useFlatWorldTitle"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.useFlatWorldDescription"\\),disabled:([a-zA-Z0-9_$]{1}),offNarrationText:([a-zA-Z0-9_$]{1}),onNarrationText:([a-zA-Z0-9_$]{1}),narrationSuffix:([a-zA-Z0-9_$]{1})\\}\\)\\),${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.Mount,\\{when:(?:[a-zA-Z0-9_$]{1}),condition:!1\\},${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{title:(?:[a-zA-Z0-9_$]{1})\\("\\.useFlatWorldTitle"\\),description:(?:[a-zA-Z0-9_$]{1})\\("\\.useFlatWorldDescription"\\),value:(?:[a-zA-Z0-9_$]{1}),onChange:(?:[a-zA-Z0-9_$]{1}),disabled:(?:[a-zA-Z0-9_$]{1}),narrationSuffix:(?:[a-zA-Z0-9_$]{1}),offNarrationText:(?:[a-zA-Z0-9_$]{1}),onNarrationText:(?:[a-zA-Z0-9_$]{1}),onExpandNarrationHint:([a-zA-Z0-9_$]{1})\\},${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{title:([a-zA-Z0-9_$]{1})\\("\\.title"\\),customSelectionDescription:${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{preset:([a-zA-Z0-9_$]{1})\\}\\),options:([a-zA-Z0-9_$]{1}),value:([a-zA-Z0-9_$]{1}),onItemSelect:e=>([a-zA-Z0-9_$]{1})\\(([a-zA-Z0-9_$]{2})\\[e\\]\\),disabled:(?:[a-zA-Z0-9_$]{1}),wrapperRole:"neutral80",indented:!0,dropdownNarrationSuffix:([a-zA-Z0-9_$]{1})\\}\\)\\)\\)\\)`
                    ),
                    replacement: `return ${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}.createElement(${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}.Fragment,null,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}.createElement(${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}.Mount,{when:false},${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}.createElement($1,{onChange:$2,value:$3,title:$4(".useFlatWorldTitle"),description:$4(".useFlatWorldDescription"),disabled:$5,offNarrationText:$6,onNarrationText:$7,narrationSuffix:$8})),${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}.createElement(${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}.Mount,{when:false,condition:!1},${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}.createElement($9,{title:$4(".useFlatWorldTitle"),description:$4(".useFlatWorldDescription"),value:$3,onChange:$2,disabled:$5,narrationSuffix:$8,offNarrationText:$6,onNarrationText:$7,onExpandNarrationHint:$10},${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}.createElement($11,{title:$12(".title"),customSelectionDescription:${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}.createElement($13,{preset:$14}),options:$15,value:$16,onItemSelect:e=>$17($18[e]),disabled:$5,wrapperRole:"neutral80",indented:!0,dropdownNarrationSuffix:$19}))))`,
                },
                /**
                 * ### Minecraft version support:
                 *
                 * #### Fully Supported:
                 * - 1.21.100.21/22/23 preview (index-c7f65a88ed057ec9b0e1.js)
                 *
                 * #### Partially Supported:
                 *
                 * #### Not Supported:
                 * - < 1.21.80.20 preview (index-1da13.js)
                 * - < 1.21.80.3 (index-07a21.js)
                 * - < 1.21.100.21 preview (index-c7f65a88ed057ec9b0e1.js)
                 *
                 * #### Support Unknown:
                 */
                {
                    regex: new RegExp(
                        `return ([a-zA-Z0-9_$]{1})\\.createElement\\(([a-zA-Z0-9_$]{2}|[a-zA-Z0-9_$]{1}\\.Unwrap),\\{data:([a-zA-Z0-9_$]{1})\\},\\(([a-zA-Z0-9_$]{1})=>([a-zA-Z0-9_$]{1})\\?([a-zA-Z0-9_$]{1})\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{onChange:([a-zA-Z0-9_$]{1}),value:([a-zA-Z0-9_$]{1}),title:([a-zA-Z0-9_$]{1})\\("\\.useFlatWorldTitle"\\),description:([a-zA-Z0-9_$]{1})\\("\\.useFlatWorldDescription"\\),disabled:([a-zA-Z0-9_$]{1}),offNarrationText:([a-zA-Z0-9_$]{1}),onNarrationText:([a-zA-Z0-9_$]{1}),narrationSuffix:([a-zA-Z0-9_$]{1})\\}\\):([a-zA-Z0-9_$]{1})\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{title:([a-zA-Z0-9_$]{1})\\("\\.useFlatWorldTitle"\\),description:([a-zA-Z0-9_$]{1})\\("\\.useFlatWorldDescription"\\),value:([a-zA-Z0-9_$]{1}),onChange:([a-zA-Z0-9_$]{1}),disabled:([a-zA-Z0-9_$]{1}),narrationSuffix:([a-zA-Z0-9_$]{1}),offNarrationText:([a-zA-Z0-9_$]{1}),onNarrationText:([a-zA-Z0-9_$]{1}),onExpandNarrationHint:([a-zA-Z0-9_$]{1})\\},([a-zA-Z0-9_$]{1})\\.createElement\\(([a-zA-Z0-9_$]{2},\\{(?:indentedPanel:!0,)?)title:([a-zA-Z0-9_$]{1})\\("\\.title"\\),customSelectionDescription:([a-zA-Z0-9_$]{1})\\.createElement\\(([a-zA-Z0-9_$]{2,3}),\\{selectedPreset:([a-zA-Z0-9_$]{1}),selectedPresetID:([a-zA-Z0-9_$]{1})\\}\\),options:([a-zA-Z0-9_$]{1}),value:([a-zA-Z0-9_$]{1}),onItemSelect:([a-zA-Z0-9_$]{1})=>([a-zA-Z0-9_$]{1})\\(([a-zA-Z0-9_$]{2,3})\\[([a-zA-Z0-9_$]{1})\\]\\),disabled:([a-zA-Z0-9_$]{1}),wrapperRole:"neutral80",((?:indented:!0,)?dropdownNarrationSuffix:[a-zA-Z0-9_$]{1})\\}\\)\\)\\)\\)\\}`
                    ),
                    replacement: `return $1.createElement($2,{data:$3},($4=>false /* $5 */ ?$6.createElement($7,{onChange:$8,value:$9,title:$10(".useFlatWorldTitle"),description:$11(".useFlatWorldDescription"),disabled:$12,offNarrationText:$13,onNarrationText:$14,narrationSuffix:$15}):$16.createElement($17,{title:$18(".useFlatWorldTitle"),description:$19(".useFlatWorldDescription"),value:$20,onChange:$21,disabled:$22,narrationSuffix:$23,offNarrationText:$24,onNarrationText:$25,onExpandNarrationHint:$26},$27.createElement($28title:$29(".title"),customSelectionDescription:$30.createElement($31,{selectedPreset:$32,selectedPresetID:$33}),options:$34,value:$35,onItemSelect:$36=>$37($38[$39]),disabled:$40,wrapperRole:"neutral80",indented:!0,$41}))))}`,
                },
            ],
        },
        /**
         * Adds the debug tab to the create and edit world screens.
         *
         * ### Minecraft version support:
         *
         * #### Fully Supported:
         * - 1.21.70/71/72 (index-d6df7.js)
         * - 1.21.70/71/72 dev (index-1fd56.js)
         * - 1.21.80.20/21/22 preview (index-1da13.js)
         * - 1.21.80.27/28 preview (index-07a21.js)
         * - 1.21.80.3 (index-07a21.js)
         * - 1.21.90.20 preview (index-fe5c0.js)
         *
         * #### Partially Supported:
         * - 1.21.60/61/62 (index-41cdf.js) {Only adds debug tab, does not modify it.}
         * - 1.21.60.27/28 preview (index-41cdf.js) {Only adds debug tab, does not modify it.}
         * - 1.21.80.25 preview (index-b3e96.js) {Only adds debug tab, does not modify it.}
         * - 1.21.90.21 preview (index-aaad2.js) {Only adds debug tab, does not modify it.}
         *
         * #### Not Supported:
         * - < 1.21.60
         *
         * ## Support Unknown:
         * - \> 1.21.90.21 preview (index-aaad2.js)
         */
        addDebugTab: {
            /**
             * Replacing the debug tab of the create and edit world screens (v1).
             *
             * ### Minecraft version support:
             *
             * #### Fully Supported:
             * - 1.21.70/71/72 (index-d6df7.js)
             * - 1.21.70/71/72 dev (index-1fd56.js)
             * - 1.21.80.20/21/22 preview (index-1da13.js)
             * - 1.21.80.27/28 preview (index-07a21.js)
             * - 1.21.80.3 (index-07a21.js)
             * - 1.21.90.20 preview (index-fe5c0.js)
             *
             * #### Partially Supported:
             *
             * #### Not Supported:
             * - < 1.21.70
             * - 1.21.80.25 preview (index-b3e96.js)
             * - 1.21.90.21 preview (index-aaad2.js)
             *
             * ## Support Unknown:
             * - \> 1.21.90.21 preview (index-aaad2.js)
             * - 1.21.70.xx preview
             */
            0: [
                /**
                 * Known supported Minecraft versions:
                 *
                 * - 1.21.70/71/72 (index-d6df7.js)
                 * - 1.21.70/71/72 dev (index-1fd56.js)
                 * - 1.21.80.20/21/22 preview (index-1da13.js)
                 * - 1.21.80.27/28 preview (index-07a21.js)
                 * - 1.21.80.3 (index-07a21.js)
                 * - 1.21.90.20 preview (index-fe5c0.js)
                 */
                new RegExp(
                    `function ([a-zA-Z0-9_$]{2,3})\\(\\{(?:worldData:e,achievementsDisabledMessages:t,)?onUnlockTemplateSettings:(?:[a-zA-Z0-9_$]{1}),onExportTemplate:(?:[a-zA-Z0-9_$]{1}),onClearPlayerData:(?:[a-zA-Z0-9_$]{1}),isEditorWorld:(?:[a-zA-Z0-9_$]{1})\\}\\)\\{const (?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useSharedFacet\\)\\(([a-zA-Z0-9_$]{2})\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(\\(\\{allBiomes:e\\}\\)=>e\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),(?:(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.isLockedTemplate\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.achievementsDisabled\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),)?(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(\\(\\{spawnDimensionId:e\\}\\)=>e\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>(function\\(e,t\\)\\{const a=\\[\\];for\\(let t=0;t<e\\.length;t\\+\\+\\)a\\[t\\]=\\{label:\\(n=e\\[t\\]\\)\\.label,dimension:n\\.dimension,value:n\\.id\\};var n;return a\\}\\(e,?|[a-zA-Z0-9_$]{2}\\(e,?|e\\.map\\((?:\\(e=>\\(\\{label:e\\.label,dimension:e\\.dimension,value:e\\.id\\}\\)\\))?)\\)\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(\\(e,t\\)=>([a-zA-Z0-9_$]{2})\\(e,\\(e=>e\\.dimension===t\\)\\)\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\]\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.spawnBiomeId\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.defaultSpawnBiome\\|\\|e\\.isBiomeOverrideActive\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useSharedFacet\\)\\(([a-zA-Z0-9_$]{2})\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>([a-zA-Z0-9_$]{2})\\(e\\.platform\\)\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.useContext\\)\\(([a-zA-Z0-9_$]{2})\\)!==([a-zA-Z0-9_$]{2})\\.CREATE,(?:[a-zA-Z0-9_$]{1})=\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e&&(?:[a-zA-Z0-9_$]{1})\\),\\[(?:[a-zA-Z0-9_$]{1})\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\);return ${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.DeferredMountProvider|[a-zA-Z0-9_$]{2}),null,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2,3}),\\{(?:isLockedTemplate:u,achievementsDisabled:d,achievementsDisabledMessages:t,)?narrationText:"Debug",onUnlockTemplateSettings:(?:[a-zA-Z0-9_$]{1}),isEditorWorld:(?:[a-zA-Z0-9_$]{1})\\},${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.DeferredMount|[a-zA-Z0-9_$]{2}),null,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{title:"Flat nether",(?:gamepad:\\{index:0\\},)?value:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.flatNether\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),onChange` +
                        `:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(e=>t=>\\{e\\.flatNether=t\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\)\\}\\)\\),${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((?:${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.DeferredMount|[a-zA-Z0-9_$]{2}),null,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((?:[a-zA-Z0-9_$]{2}),\\{title:"Enable game version override",(?:gamepad:\\{index:1\\},)?value:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.enableGameVersionOverride\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),onChange:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(e=>t=>\\{e\\.enableGameVersionOverride=t\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\)\\}\\)\\),${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((?:${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.DeferredMount|[a-zA-Z0-9_$]{2}),null,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{label:"Game version override",(?:gamepadIndex:2,)?placeholder:"0\\.0\\.0",maxLength:30,disabled:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>!e\\.enableGameVersionOverride\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),value:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.gameVersionOverride\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),onChange:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(e=>t=>\\{e\\.gameVersionOverride=t\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\)\\}\\)\\),` +
                        `${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((?:${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.DeferredMount|[a-zA-Z0-9_$]{2}),null,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{title:"World biome settings"\\}\\)\\),${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((?:[a-zA-Z0-9_$]{2}),\\{title:"Default spawn biome",description:"Using the default spawn biome will mean a random overworld spawn is selected",(?:gamepad:\\{index:3\\},)?disabled:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.isBiomeOverrideActive\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),value:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.defaultSpawnBiome\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),onChange:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(e=>t=>\\{e\\.defaultSpawnBiome=t\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\)\\}\\),${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((?:${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.DeferredMount|[a-zA-Z0-9_$]{2}),null,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{onMountComplete:(\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useNotifyMountComplete\\)|[a-zA-Z0-9_$]{2})\\(\\),title:"Spawn dimension filter",disabled:(?:[a-zA-Z0-9_$]{1}),wrapToggleText:!0,options:\\[\\{label:"Overworld",value:0\\},\\{label:"Nether",value:1\\}\\],value:(?:[a-zA-Z0-9_$]{1}),onChange:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(e=>t=>\\{e\\.spawnDimensionId=t\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\)\\}\\)\\),${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((?:${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.DeferredMount|[a-zA-Z0-9_$]{2}),null,${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{title:"Spawn biome",options:(?:[a-zA-Z0-9_$]{1}),onItemSelect:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(e=>t=>e\\.spawnBiomeId=t\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),disabled:(?:[a-zA-Z0-9_$]{1}),value:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(\\(e,t\\)=>t\\.filter\\(\\(t=>t\\.value===e\\)\\)\\.length>0\\?e:t\\[0\\]\\.value\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1}),(?:[a-zA-Z0-9_$]{1})\\]\\),focusOnSelectedItem:!0\\}\\)\\),${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((?:[a-zA-Z0-9_$]{2}),\\{title:"Biome override",description:"Set the world to a selected biome\\. This will override the Spawn biome!",(?:gamepad:\\{index:6\\},)?value:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.isBiomeOverrideActive\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),onChange:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(e=>t=>\\{e\\.isBiomeOverrideActive=t\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\)\\}\\),${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\((?:[a-zA-Z0-9_$]{2}),\\{title:"Biome override",` +
                        `description:"Select biome to be used in the entire world",options:(?:[a-zA-Z0-9_$]{1}),disabled:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>!e\\.isBiomeOverrideActive\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),onItemSelect:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetCallback\\)\\(\\(e=>t=>\\{e\\.biomeOverrideId=t\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),value:\\(0,${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.useFacetMap\\)\\(\\(e=>e\\.biomeOverrideId\\),\\[\\],\\[(?:[a-zA-Z0-9_$]{1})\\]\\),focusOnSelectedItem:!0\\}\\),${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.Mount,\\{when:(?:[a-zA-Z0-9_$]{1})\\},${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2,3}),\\{onExportTemplate:(?:[a-zA-Z0-9_$]{1}),onClearPlayerData:(?:[a-zA-Z0-9_$]{1})\\}\\)\\)\\)\\)\\}`
                ),
            ],
            /**
             * Unhiding the debug tab of the create and edit world screens (v1).
             *
             * ### Minecraft version support:
             *
             * #### Fully Supported:
             * - 1.21.60/61/62 (index-41cdf.js)
             * - 1.21.60.27/28 preview (index-41cdf.js)
             * - 1.21.70/71/72 (index-d6df7.js)
             * - 1.21.70/71/72 dev (index-1fd56.js)
             * - 1.21.80.20/21/22 preview (index-1da13.js)
             * - 1.21.80.25 preview (index-b3e96.js)
             * - 1.21.80.27/28 preview (index-07a21.js)
             * - 1.21.80.3 (index-07a21.js)
             * - 1.21.90.20 preview (index-fe5c0.js)
             * - 1.21.90.21 preview (index-aaad2.js)
             *
             * #### Partially Supported:
             *
             * #### Not Supported:
             * - < 1.21.60
             *
             * #### Support Unknown:
             * - \> 1.21.90.21 preview (index-aaad2.js)
             * - 1.21.70.xx preview
             */
            1: [
                /**
                 * Known supported Minecraft versions:
                 *
                 * - 1.21.60/61/62 (index-41cdf.js)
                 * - 1.21.60.27/28 preview (index-41cdf.js)
                 * - 1.21.70/71/72 (index-d6df7.js)
                 * - 1.21.70/71/72 dev (index-1fd56.js)
                 * - 1.21.80.20/21/22 preview (index-1da13.js)
                 * - 1.21.80.25 preview (index-b3e96.js)
                 * - 1.21.80.27/28 preview (index-07a21.js)
                 * - 1.21.80.3 (index-07a21.js)
                 * - 1.21.90.20 preview (index-fe5c0.js)
                 * - 1.21.90.21 preview (index-aaad2.js)
                 */
                {
                    regex: new RegExp(
                        `e&&([tra])\\.push\\(((?:t\\?\\{label:".devTabLabel",image:(?:[a-zA-Z0-9_$]{2}),value:"dev-options"\\}:)?\\{label:"\\.debugTabLabel",image:(?:[a-zA-Z0-9_$]{2}),value:"debug"\\})\\),`
                    ),
                    replacement: `$1.push($2),`,
                },
                {
                    regex: /(?:[a-zA-Z0-9_$]{1})\?\[\{label:"\.debugTabLabel",image:([a-zA-Z0-9_$]{2,3})\.DebugIcon,value:"debug"\}\]:\[\]/,
                    replacement: `[{label:".debugTabLabel",image:$1.DebugIcon,value:"debug"}]`,
                },
            ],
        },
        /**
         * Add the 8Crafter Utilities main menu button to the top right corner of the screen, in the navbar.
         *
         * ### Minecraft version support:
         *
         * #### Fully Supported:
         * - 1.21.70/71/72 (index-d6df7.js)
         * - 1.21.70/71/72 dev (index-1fd56.js)
         * - 1.21.80.20/21/22 preview (index-1da13.js)
         * - 1.21.80.25 preview (index-b3e96.js)
         * - 1.21.80.27/28 preview (index-07a21.js)
         * - 1.21.80.3 (index-07a21.js)
         * - 1.21.90.20 preview (index-fe5c0.js)
         *
         * #### Partially Supported:
         *
         * #### Not Supported:
         * - < 1.21.70
         * - 1.21.90.21 preview (index-aaad2.js)
         *
         * #### Support Unknown:
         * - \> 1.21.90.21 preview (index-aaad2.js)
         */
        add8CrafterUtilitiesMainMenuButton: {
            /**
             * Adding the 8Crafter Utilities main menu button to the top right corner of the screen, in the navbar (v1).
             *
             * ### Minecraft version support:
             *
             * #### Fully Supported:
             * - 1.21.60/61/62 (index-41cdf.js)
             * - 1.21.60.27/28 preview (index-41cdf.js)
             * - 1.21.70/71/72 (index-d6df7.js)
             * - 1.21.70/71/72 dev (index-1fd56.js)
             * - 1.21.80.20/21/22 preview (index-1da13.js)
             * - 1.21.80.25 preview (index-b3e96.js)
             * - 1.21.80.27/28 preview (index-07a21.js)
             * - 1.21.80.3 (index-07a21.js)
             * - 1.21.90.20 preview (index-fe5c0.js)
             *
             * #### Partially Supported:
             *
             * #### Not Supported:
             * - 1.21.90.21 preview (index-aaad2.js)
             *
             * #### Support Unknown:
             * - < 1.21.60
             * - \> 1.21.90.21 preview (index-aaad2.js)
             * - 1.21.70.xx preview
             */
            0: [
                /**
                 * Known supported Minecraft versions:
                 *
                 * - 1.21.60/61/62 (index-41cdf.js)
                 * - 1.21.60.27/28 preview (index-41cdf.js)
                 * - 1.21.70/71/72 (index-d6df7.js)
                 * - 1.21.70/71/72 dev (index-1fd56.js)
                 * - 1.21.80.20/21/22 preview (index-1da13.js)
                 * - 1.21.80.25 preview (index-b3e96.js)
                 * - 1.21.80.27/28 preview (index-07a21.js)
                 * - 1.21.80.3 (index-07a21.js)
                 * - 1.21.90.20 preview (index-fe5c0.js)
                 */
                new RegExp(
                    `${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(${extractedSymbolNames.facetHolder.replaceAll("$", "\\$")}\\.Mount,\\{when:([a-zA-Z0-9_$]{1})\\},${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.Fragment,null,(${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}.createElement\\([a-zA-Z0-9_$]{2},\\{open:[a-zA-Z0-9_$]{1},isOpen:[a-zA-Z0-9_$]{1}\\}\\),)?${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2})\\.Divider,null\\),${extractedSymbolNames.contextHolder.replaceAll("$", "\\$")}\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{onClick:([eo]),screenAnalyticsId:([a-zA-Z0-9_$]{1})\\}\\)\\)\\)`
                ),
            ],
        },
    } as const;
    return replacerRegexes;
}

/**
 * The built-in plugins.
 */
export const builtInPlugins = [
    {
        name: "Add exact ping count to servers tab.",
        id: "add-exact-ping-count-to-servers-tab",
        namespace: "built-in",
        version: "1.0.1",
        uuid: "a1ffa1f2-a8d1-4948-a307-4067d4a82880",
        description: "A built-in plugin that adds the exact ping count to the servers tab.",
        actions: [
            {
                id: "add-exact-ping-count-to-servers-tab",
                context: "per_text_file",
                action: async (currentFileContent: string, file: zip.ZipFileEntry<any, any>): Promise<string> => {
                    const fullFilename: string = file.getFullname();
                    if (!/index-[0-9a-f]{5,20}\.js$/.test(fullFilename)) return currentFileContent;
                    const origData: string = await file.getText();
                    const bindingVaiableTarget = origData
                        .match(
                            /\(0,[\s\n]*?([a-zA-Z0-9_$]).useFacetMap\)\(\(?\(?[a-zA-Z0-9_$]\)?[\s\n]*?=>[\s\n]*?[a-zA-Z0-9_$]\.networkDetails\.pingStatus\)?,[\s\n]*?\[\],[\s\n]*?\[([a-zA-Z0-9_$])\]\)/
                        )
                        ?.slice(1, 3);
                    if (!bindingVaiableTarget) {
                        throw new Error("Unable to find binding variable target.");
                    }
                    if (!/\.createElement\(([a-zA-Z0-9_$]{2}),[\s\n]*?\{[\s\n]*?pingStatus:[\s\n]*?([a-zA-Z0-9_$])[\s\n]*?\}\)/.test(currentFileContent)) {
                        throw new Error("Unable to find ping status text facet map.");
                    }
                    currentFileContent = currentFileContent.replace(
                        /\.createElement\(([a-zA-Z0-9_$]{2}),[\s\n]*?\{[\s\n]*?pingStatus:[\s\n]*?([a-zA-Z0-9_$])[\s\n]*?\}\)/g,
                        `.createElement($1, { pingStatus: $2, ping: (0, ${bindingVaiableTarget[0]}.useFacetMap)((e) => e.networkDetails.ping === "-1" ? "Loading..." : e.networkDetails.ping, [], [${bindingVaiableTarget[1]}]) })`
                    );
                    if (
                        !/function ([a-zA-Z0-9_$]{2})\(\{pingStatus:([a-zA-Z0-9_$])\}\)\{const ([a-zA-Z0-9_$])=([a-zA-Z0-9_$]{2})\((?:[a-zA-Z0-9_$])\);return ([a-zA-Z0-9_$])\.createElement\("div",\{className:"([^"]+?)"\},(?:[a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}|[a-zA-Z0-9_$]\.Unwrap),\{data:(?:[a-zA-Z0-9_$]),children:([a-zA-Z0-9_$]{2})\}\),(?:[a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}),\{size:1\}\),(?:[a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}),\{type:"body",variant:"dimmer"\},(?:[a-zA-Z0-9_$])\)\)\}/.test(
                            currentFileContent
                        )
                    ) {
                        throw new Error("Unable to find ping status text element.");
                    }
                    currentFileContent = currentFileContent.replace(
                        /function ([a-zA-Z0-9_$]{2})\(\{pingStatus:([a-zA-Z0-9_$])\}\)\{const ([a-zA-Z0-9_$])=([a-zA-Z0-9_$]{2})\((?:[a-zA-Z0-9_$])\);return ([a-zA-Z0-9_$])\.createElement\("div",\{className:"([^"]+?)"\},(?:[a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}|[a-zA-Z0-9_$]\.Unwrap),\{data:(?:[a-zA-Z0-9_$]),children:([a-zA-Z0-9_$]{2})\}\),(?:[a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}),\{size:1\}\),(?:[a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}),\{type:"body",variant:"dimmer"\},(?:[a-zA-Z0-9_$])\)\)\}/,
                        `function $1({pingStatus:$2,ping}){const $3=$4($2);return $5.createElement("div",{className:"$6"},$5.createElement($7,{data:$2,children:$8}),$5.createElement($9,{size:1}),$5.createElement($10,{type:"body",variant:"dimmer"},ping))}`
                    );
                    return currentFileContent;
                },
            },
        ],
        format_version: "0.25.0",
        min_engine_version: "0.25.0",
    },
    {
        name: "Add max player count to servers tab.",
        id: "add-max-player-count-to-servers-tab",
        namespace: "built-in",
        version: "1.0.1",
        uuid: "09b88cde-e265-4f42-b203-564f0df6ca1e",
        description: "A built-in plugin that adds the max player count to the servers tab.",
        actions: [
            {
                id: "add-max-player-count-to-servers-tab",
                context: "per_text_file",
                action: async (currentFileContent: string, file: zip.ZipFileEntry<any, any>): Promise<string> => {
                    const fullFilename: string = file.getFullname();
                    if (!/index-[0-9a-f]{5,20}\.js$/.test(fullFilename)) return currentFileContent;
                    if (
                        !/function ([a-zA-Z0-9_$]{2})\(\{playerCount:([a-zA-Z0-9_$]),maximumCapacity:([a-zA-Z0-9_$])\}\)\{const ([a-zA-Z0-9_$])=\(0,([a-zA-Z0-9_$])\.useFacetMap\)\(\(\((?:[a-zA-Z0-9_$]),(?:[a-zA-Z0-9_$])\)=>0!==(?:[a-zA-Z0-9_$])&&(?:[a-zA-Z0-9_$])===(?:[a-zA-Z0-9_$])\),\[\],\[(?:[a-zA-Z0-9_$]),(?:[a-zA-Z0-9_$])\]\),\{(?:[a-zA-Z0-9_$]):([a-zA-Z0-9_$])\}=([a-zA-Z0-9_$]{2})\("PlayScreen\.serverCapacity"\);return ([a-zA-Z0-9_$])\.createElement\("div",\{className:"([^"]+?)"\},(?:[a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}),null\),(?:[a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}),\{size:1\}\),(?:[a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}),\{type:"body",variant:"dimmer"\},(?:[a-zA-Z0-9_$])\)/.test(
                            currentFileContent
                        )
                    ) {
                        throw new Error("Unable to find binding variable target.");
                    }
                    currentFileContent = currentFileContent.replace(
                        /function ([a-zA-Z0-9_$]{2})\(\{playerCount:([a-zA-Z0-9_$]),maximumCapacity:([a-zA-Z0-9_$])\}\)\{const ([a-zA-Z0-9_$])=\(0,([a-zA-Z0-9_$])\.useFacetMap\)\(\(\((?:[a-zA-Z0-9_$]),(?:[a-zA-Z0-9_$])\)=>0!==(?:[a-zA-Z0-9_$])&&(?:[a-zA-Z0-9_$])===(?:[a-zA-Z0-9_$])\),\[\],\[(?:[a-zA-Z0-9_$]),(?:[a-zA-Z0-9_$])\]\),\{(?:[a-zA-Z0-9_$]):([a-zA-Z0-9_$])\}=([a-zA-Z0-9_$]{2})\("PlayScreen\.serverCapacity"\);return ([a-zA-Z0-9_$])\.createElement\("div",\{className:"([^"]+?)"\},(?:[a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}),null\),(?:[a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}),\{size:1\}\),(?:[a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}),\{type:"body",variant:"dimmer"\},(?:[a-zA-Z0-9_$])\)/,
                        `function $1({playerCount:$2,maximumCapacity:$3}){const $4=(0,$5.useFacetMap)((($2,$3)=>0!==$2&&$2===$3),[],[$2,$3]),{$3:$6}=$7("PlayScreen.serverCapacity");return $8.createElement("div",{className:"$9"},$8.createElement($10,null),$8.createElement($11,{size:1}),$8.createElement($12,{type:"body",variant:"dimmer"},(0, $5.useFacetMap)(($2, $3) => \`\${$2}/\${$3}\`, [], [$2, $3]))`
                    );
                    return currentFileContent;
                },
            },
        ],
        format_version: "0.25.0",
        min_engine_version: "0.25.0",
    },
    {
        // DEPRECATED
        name: "Facet spy.",
        id: "facet-spy",
        namespace: "built-in",
        version: "1.2.1",
        uuid: "e2355295-b202-4f4b-96b8-7bd7b6eaac23",
        description: "Facet spy.",
        actions: [
            {
                id: "inject-facet-spy",
                context: "per_text_file",
                async action(currentFileContent: string, file: zip.ZipFileEntry<any, any>): Promise<string> {
                    const fullFilename: string = file.getFullname();
                    if (!/(?:index|gameplay|editor(?:-menu|-project)?)-[0-9a-f]{5,20}\.js$/.test(fullFilename)) return currentFileContent;
                    const origData: string = await file.getText();
                    if (
                        !/inverse:\(0,([a-zA-Z0-9_$])\.useFacetMap\)\(\(([a-zA-Z0-9_$])=>"POP"===(?:[a-zA-Z0-9_$])\),\[\],\[([a-zA-Z0-9_$])\]\)\}\)\)\)/.test(
                            currentFileContent
                        )
                    ) {
                        throw new Error(`Unable to find facet spy render injection location in file "${fullFilename}".`);
                    }
                    /**
                     * The symbol name of the facet access holder.
                     */
                    const facetAccessHolderBindingVariableTarget: string = currentFileContent.match(
                        /inverse:\(0,([a-zA-Z0-9_$])\.useFacetMap\)\(\(\(?([a-zA-Z0-9_$])\)?=>"POP"===(?:[a-zA-Z0-9_$])\),\[\],\[([a-zA-Z0-9_$])\]\)\}\)\)\)/
                    )![1]!;
                    currentFileContent = currentFileContent.replace(
                        /inverse:\(0,([a-zA-Z0-9_$])\.useFacetMap\)\(\(\(?([a-zA-Z0-9_$])\)?=>"POP"===(?:[a-zA-Z0-9_$])\),\[\],\[([a-zA-Z0-9_$])\]\)\}\)\)\)/,
                        `inverse:(0,$1.useFacetMap)((($2)=>"POP"===$2),[],[$3])}))),${origData.match(
                            /([a-zA-Z0-9_$])\.createElement\((?:[a-zA-Z0-9_$]),\{visible:(?:[a-zA-Z0-9_$]),alwaysMounted:(?:[a-zA-Z0-9_$]),/
                        )![1]!}.createElement(facetSpy,null)`
                    );
                    const isEditorMode: boolean = /editor(?:-menu|-project)?-[0-9a-f]{5,20}\.js$/.test(fullFilename);
                    /**
                     * The facet spy function that will be injected into the file.
                     */
                    function getFacetSpyFunction(preString: string) {
                        return `${preString}
            const facetList = [
                "core.animation",
                "core.customScaling",
                "core.deviceInformation",
                "core.featureFlags",
                "core.input",
                "core.locale",
                "core.performanceFacet",
                "core.router",
                "core.safeZone",
                "core.screenReader",
                "core.splitScreen",
                "core.social",
                "core.sound",
                "core.user",
                "core.vrMode", // Found in dev build file.

                "vanilla.achievements",
                "vanilla.achievementsReward",
                "vanilla.buildSettings",
                "vanilla.clipboard",
                "vanilla.createNewWorld",
                "vanilla.createPreviewRealmFacet",
                "vanilla.debugSettings",
                "vanilla.editor",
                "vanilla.editorInput",
                "vanilla.editorScripting",
                "vanilla.editorSelectionFacet",
                "vanilla.editorSettings",
                "vanilla.externalServerWorldList",
                "vanilla.followersList",
                "vanilla.friendsListFacet",
                "vanilla.friendsManagerFacet",
                "vanilla.gameplay.activeLevelHardcoreMode",
                "vanilla.gameplay.bedtime",
                "vanilla.gameplay.closeContainerCommand",
                "vanilla.gameplay.containerBlockActorType",
                "vanilla.gameplay.containerItemQuery",
                "vanilla.gameplay.containerSizeQuery",
                "vanilla.gameplay.furnace",
                "vanilla.gameplay.immediateRespawn",
                "vanilla.gameplay.leaveGame",
                "vanilla.gameplay.playerDeathInfo",
                "vanilla.gameplay.playerPositionHudElement",
                "vanilla.gameplay.playerRespawn",
                "vanilla.gamertagSearch",
                "vanilla.inbox",
                "vanilla.lanWorldList",
                "vanilla.localWorldList",
                "vanilla.marketplaceSuggestions",
                "vanilla.marketplacePassWorldTemplateList",
                "vanilla.networkWorldDetails",
                "vanilla.networkWorldJoiner",
                "vanilla.notificationOptions",
                "vanilla.notifications",
                "vanilla.options",
                "vanilla.party", // Found in dev build file.
                "vanilla.playerAchievements",
                "vanilla.playerBanned",
                "vanilla.playerFollowingList",
                "vanilla.playerLinkedPlatformProfile", // Found in dev build file.
                "vanilla.playermessagingservice",
                "vanilla.playerPermissions",
                "vanilla.playerProfile",
                "vanilla.playerReport",
                "vanilla.playerSocialManager",
                "vanilla.playerStatistics",
                "vanilla.privacyAndOnlineSafetyFacet",
                "vanilla.profanityFilter",
                "vanilla.realmsListFacet",
                "vanilla.realmSlots",
                "vanilla.realmsMembership",
                "vanilla.realmsStories.actions",
                "vanilla.realmsStories.localScreenshots",
                "vanilla.realmsStories.persistentData",
                "vanilla.realmsStories.players",
                "vanilla.realmsStories.realmData",
                "vanilla.realmsStories.settings",
                "vanilla.realmsStories.stories",
                "vanilla.RealmsPDPFacet",
                "vanilla.RealmWorldUploaderFacet",
                "vanilla.recentlyPlayedWithList",
                "vanilla.recommendedFriendsList",
                "vanilla.resourcePackOverrides",
                "vanilla.resourcePacks",
                "vanilla.screenshotGalleryList",
                "vanilla.screenSpecificOptions",
                "vanilla.screenTechStack",
                "vanilla.seedTemplates",
                "vanilla.share",
                "vanilla.simulationDistanceOptions",
                "vanilla.telemetry",
                "vanilla.thirdPartyWorldList",
                "vanilla.unpairedRealmsListFacet",
                "vanilla.userAccount",
                "vanilla.webBrowserFacet",
                "vanilla.worldCloudSyncFacet",
                "vanilla.worldEditor",
                "vanilla.worldOperations",
                "vanilla.worldPackages",
                "vanilla.worldPlayersList",
                "vanilla.worldStartup",
                "vanilla.worldTemplateList",
                "vanilla.worldTransfer",

                "vanilla.friendworldlist",
                "vanilla.offerRepository",
                "vanilla.realmsSettingsFacet",

                "vanilla.achievementCategories",
                "vanilla.blockInformation",
                "debug.worldTransfer",
                "vanilla.flatWorldPresets",
                "vanilla.inGame",
                "vanilla.playerPrivacy",
                "vanilla.realmsPurchase",
                "vanilla.realmsSubscriptionsData",
                "vanilla.realmsSubscriptionsMethods",
                "vanilla.realmsWorldContextCommands",
                "vanilla.realmsWorldContextQueries",
                "vanilla.realmsStories.sessions",
                "vanilla.realmsListActionsFacet",
                "vanilla.developerOptionsFacet",
                "vanilla.realmsStories.comments",
                "vanilla.screenshotGallery",
                "vanilla.playerShowcasedGallery",
                "vanilla.trialMode",
                "vanilla.featuredWorldTemplateList",
                "vanilla.ownedWorldTemplateList",
                "vanilla.worldTemplateOperations",
                "test.vector",
                "vanilla.gameplay.localPlayerWeatherLightningFacet",
                "vanilla.levelInfo",
                "vanilla.currentParty",
                "vanilla.partyCommands",
                "vanilla.worldRealmEditor", // Found in dev build file.
                "vanilla.worldRealmEditorCommands",
                "vanilla.worldRealmEditorQueries",
                "vanilla.realmBackupsCommands",
                "vanilla.realmBackupsQueries",
                "vanilla.realmsPurchaseCommands",
                "vanilla.realmsPurchaseReconcilerQueries",
                "vanilla.character-selector",
                "vanilla.progressTracker",

                // Found in preview 1.21.100.21.
                "vanilla.realmsWorldEditorGameRulesCommands",
                "vanilla.realmsWorldEditorGameRulesQueries",
                "vanilla.realmsWorldEditorWorldDetailsQueries",
                "vanilla.realmsCommitCommandsFacet",
                "vanilla.realmsCommitQueriesFacet",
                "vanilla.realmsPurchaseQueries",

                // Found in 1.21.120.4 (but may have existed before that).
                "vanilla.connectionErrorInfoFacet",
                "vanilla.partyReceivedInviteList",
                "vanilla.joinablePartyList",
                "vanilla.realmsFeatureFlags",
                "vanilla.realmsStories.reports",
                "vanilla.realmsStories.reportCommands",
                "vanilla.openAndCloseRealmCommandsFacet",
                "dev.realmsCommitCommandsFacet",
                "dev.realmsCommitQueriesFacet",
                "vanilla.newPlayerChoices",

                // Found in 1.21.130.26 Preview (but may have existed before that).
                "vanilla.realmsRolesAndPermissionsQueries",
                "vanilla.realmsRolesAndPermissionsCommands",
                "vanilla.realmsPlayerListQueries",
                "vanilla.realmsPlayerListCommands",

                // Found in 1.26.0.26 preview (but may have existed before that).
                "vanilla.realmsWorldEditorWorldDetailsCommands",
                "vanilla.realmsWorldPackEditorQueries",
                "vanilla.realmsWorldPackEditorCommands",

                // Found in 1.26.0.2 Release (it is unknown what preview these were added in).
                "vanilla.realmsRegionSettingsCommands",
                "vanilla.realmsRegionSettingsQueries",

                // Editor mode only facets (crashes the game when not in editor mode).
                ${isEditorMode ? "" : "// "}"vanilla.editorLogging", // Crashes the game in the v1.21.110.23 preview when not in editor mode.
                ${isEditorMode ? "" : "// "}"vanilla.editorBlockPalette", // Crashes the game when not in editor mode
                ${isEditorMode ? "" : "// "}"vanilla.editorInputBinding", // Crashes the game when not in editor mode
                ${isEditorMode ? "" : "// "}"vanilla.editorInputState", // Crashes the game when not in editor mode
                ${isEditorMode ? "" : "// "}"vanilla.editorProjectConstants", // Crashes the game when not in editor mode
                ${isEditorMode ? "" : "// "}"vanilla.editorStructure", // Crashes the game when not in editor mode
                ${isEditorMode ? "" : "// "}"vanilla.editorTutorial", // Crashes the game when not in editor mode
            ];
            let isUseSharedFacetLimited = true;
            try {
                isUseSharedFacetLimited = !facetAccessHolder.useSharedFacet.toString().includes("sharedFacetDriverContext");
            } catch (e) {
                console.error(e);
            }
            // If the useSharedFacet method is limited such that is does not include the set and setWithCallback methods in the return value, then fallback to a copy of the old one that isn't limited.
            const fullUseSharedFacet =
                isUseSharedFacetLimited ?
                    (e) => globalThis.contextHolder ? e(contextHolder.useContext(facetAccessHolder.SharedFacetDriverProvider._context)) : facetAccessHolder.useSharedFacet(e)
                :   facetAccessHolder.useSharedFacet;
            function facetSpy({}) {
                let data = globalThis.facetSpyData ?? {
                    sharedFacets: Object.fromEntries(facetList.map((name) => [name, (0, fullUseSharedFacet)((0, ${facetAccessHolderBindingVariableTarget}.sharedFacet)(name))])),
                };
                // // This is commented out to fix the increased load times it causes.
                // /**
                //  * Gets access to the provided facet.
                //  *
                //  * @param {string} facet The identifier of the facet to get access to.
                //  */
                // function getFacetAccess(facet) {
                //     ${facetAccessHolderBindingVariableTarget}.render(
                //         contextHolder.createElement(() => {
                //             const a = (0, ${facetAccessHolderBindingVariableTarget}.useSharedFacet)(${facetAccessHolderBindingVariableTarget}.sharedFacet(facet)),
                //                 b = (0, ${facetAccessHolderBindingVariableTarget}.useFacetCallback)((a) => () => {}, [], [a]);
                //             return null;
                //         }),
                //         document.createElement("div")
                //     );
                // }
                // for (const name of facetList) {
                //     try {
                //         if (data.sharedFacets[name].get()?.toString?.() === "Symbol(NoValue)") {
                //             getFacetAccess(name);
                //         }
                //     } catch {}
                // }

                globalThis.facetSpyData = data;

                // for (const facetName of globalThis.__facetSpy_forceLoadedFacetsToPropogateStoredValues__ ?? []) {
                //     if (!(facetName in (globalThis.FacetManager?.facetData ?? {}))) continue;
                //     const value = globalThis.FacetManager.facetData[facetName];
                //     globalThis.forceLoadedFacets[facetName] = true;
                //     const targetFacetA = globalThis.facetSpyData?.sharedFacets?.[facetName];
                //     const targetFacetB = globalThis.accessedFacets?.[facetName]?.();
                //     if (!targetFacetA && !targetFacetB) {
                //         console.warn(new ReferenceError(
                //             \`No target facet matching the facet's name could be found in facetSpyData.sharedFacets or accessedFacets while attempting to propogate stored values for facet: \${facetName}\`
                //         ));
                //         continue;
                //     }
                //     if (!targetFacetA?.set && !targetFacetB?.set) {
                //         console.warn(new ReferenceError(
                //             \`No target facet matching the facet's name could be found in facetSpyData.sharedFacets or accessedFacets that had a set method while attempting to propogate stored values for facet: \${facetName}\`
                //         ));
                //         continue;
                //     }
                //     targetFacetA?.set(value);
                //     targetFacetB?.set(value);
                // }

                return null;
            }
            function forceLoadFacet(facetName, timeout = 5000, ignoreAlreadyLoadedData = false) {
                return new Promise((resolve, reject) => {
                    const currentFacetData = ignoreAlreadyLoadedData ? undefined : (globalThis.facetSpyData?.sharedFacets?.[facetName] ?? accessedFacets[facetName]?.())?.get();
                    if ((currentFacetData?.toString?.() ?? "Symbol(NoValue)") !== "Symbol(NoValue)") {
                        resolve(currentFacetData);
                        return;
                    }
                    /**
                     * @type {"unloaded" | "loaded" | "failed"}
                     */
                    let facetStatus = "unloaded";
                    const callback = (value) => {
                        try {
                            globalThis.forceLoadedFacets[facetName] = true;
                            if (globalThis.FacetManager?.forceLoadedFacets?.includes?.(facetName) === false) globalThis.FacetManager.forceLoadedFacets.push(facetName);
                            const targetFacetA = globalThis.facetSpyData?.sharedFacets?.[facetName];
                            const targetFacetB = globalThis.accessedFacets?.[facetName]?.();
                            if (!targetFacetA && !targetFacetB)
                                throw new ReferenceError(
                                    \`No target facet matching the facet's name could be found in facetSpyData.sharedFacets or accessedFacets for facet: \${facetName}\`
                                );
                            if (!targetFacetA?.set && !targetFacetB?.set)
                                console.warn(new ReferenceError(
                                    \`No target facet matching the facet's name could be found in facetSpyData.sharedFacets or accessedFacets that had a set method for facet: \${facetName}\`
                                ));
                            targetFacetA?.set?.(value);
                            targetFacetB?.set?.(value);
                            engine.off(\`facet:updated:\${facetName}\`, callback);
                            engine.off(\`facet:error:\${facetName}\`, failureCallback);
                            facetStatus = "loaded";
                            resolve(value);
                        } catch (e) {
                            facetStatus = "failed";
                            reject(e);
                        }
                    };
                    const failureCallback = (e) => {
                        try {
                            engine.off(\`facet:updated:\${facetName}\`, callback);
                            engine.off(\`facet:error:\${facetName}\`, failureCallback);
                            facetStatus = "failed";
                            reject(e);
                        } catch (e) {
                            facetStatus = "failed";
                            reject(e);
                        }
                    };
                    engine.on(\`facet:updated:\${facetName}\`, callback);
                    engine.on(\`facet:error:\${facetName}\`, failureCallback);
                    engine.trigger("facet:request", facetName, facetName, {});
                    timeout &&
                        timeout < Infinity &&
                        setTimeout(() => {
                            if (facetStatus !== "unloaded") return;
                            facetStatus = "failed";
                            engine.off(\`facet:updated:\${facetName}\`, callback);
                            engine.off(\`facet:error:\${facetName}\`, failureCallback);
                            reject(new ReferenceError(\`Timed out while fetching facet: \${facetName} (timeout: \${timeout})\`));
                        }, timeout);
                });
            }
            function unloadForceLoadedFacet(facetName) {
                if (globalThis.forceLoadedFacets[facetName] || globalThis.FacetManager?.forceLoadedFacets?.includes?.(facetName)) {
                    forceUnloadFacet(facetName);
                    delete globalThis.forceLoadedFacets[facetName];
                    if (globalThis.FacetManager?.forceLoadedFacets?.includes?.(facetName)) globalThis.FacetManager.forceLoadedFacets.splice(globalThis.FacetManager.forceLoadedFacets.indexOf(facetName), 1);
                    return true;
                }
                return false;
            }
            function forceUnloadFacet(facetName) {
                engine.trigger("facet:discard", facetName);
                const targetFacetA = globalThis.facetSpyData?.sharedFacets?.[facetName];
                const targetFacetB = globalThis.accessedFacets?.[facetName]?.();
                try {
                    targetFacetA?.set(Symbol.for("NoValue"));
                } catch (e) {
                    if (globalThis.logForceUnloadFacetSetValueErrors) {
                        console.error(e);
                    }
                }
                try {
                    targetFacetB?.set(Symbol.for("NoValue"));
                } catch (e) {
                    if (globalThis.logForceUnloadFacetSetValueErrors) {
                        console.error(e);
                    }
                }
            }
            function forceLoadUnloadedFacets({
                enableErrorLogging = false,
                enableSuccessLogging = false,
                enableAlreadyLoadedLogging = false,
                enableLoadingFacetsTracking = false,
            } = {}) {
                if (!globalThis.facetSpyData) throw new ReferenceError("The global facetSpyData variable was not found.");
                enableLoadingFacetsTracking && (globalThis.loadingFacets = {});
                return Promise.all(
                    facetList.map(async (facetName, i) => {
                        enableLoadingFacetsTracking && (loadingFacets[facetName + i] = true);
                        try {
                            const currentFacetData = (globalThis.facetSpyData.sharedFacets[facetName] ?? accessedFacets[facetName]())?.get();
                            if ((currentFacetData?.toString?.() ?? "Symbol(NoValue)") === "Symbol(NoValue)") {
                                const result = [facetName, await forceLoadFacet(facetName), "success", !facetList.includes(facetName)];
                                if (enableSuccessLogging) console.log(i, ...result);
                                return result;
                            } else {
                                const result = [facetName, currentFacetData, "alreadyLoaded", !facetList.includes(facetName)];
                                enableAlreadyLoadedLogging && console.log(i, ...result);
                                return result;
                            }
                        } catch (e) {
                            enableErrorLogging && console.error(e, i, facetName, "error");
                            return [facetName, e, "error"];
                        } finally {
                            enableLoadingFacetsTracking && delete loadingFacets[facetName + i];
                        }
                    })
                );
            }
            function unloadForceLoadedFacets() {
                return [...Object.keys(globalThis.forceLoadedFacets), ...(globalThis.FacetManager?.forceLoadedFacets ?? [])].map((facetName) => [facetName, unloadForceLoadedFacet(facetName)]);
            }
            // globalThis.__facetSpy_forceLoadedFacetsToPropogateStoredValues__ = globalThis.forceLoadedFacets && globalThis.FacetManager && Object.keys(globalThis.forceLoadedFacets).length ? Object.keys(globalThis.forceLoadedFacets).filter((facetName) => globalThis.forceLoadedFacets[facetName] === true) : null;
            globalThis.forceLoadedFacets = {};
            globalThis.facetSpy = facetSpy;
            globalThis.forceLoadFacet = forceLoadFacet;
            globalThis.forceUnloadFacet = forceUnloadFacet;
            globalThis.unloadForceLoadedFacet = unloadForceLoadedFacet;
            globalThis.forceLoadUnloadedFacets = forceLoadUnloadedFacets;
            globalThis.unloadForceLoadedFacets = unloadForceLoadedFacets;
            globalThis.accessedFacets = {};
            globalThis.notedNewFacets = [];
            setInterval(function checkForNewFacets() {
                if (!globalThis.accessedFacets || typeof globalThis.accessedFacets !== "object") return;
                for (const facetName in globalThis.accessedFacets) {
                    if (facetList.includes(facetName)) continue;
                    if (globalThis.FacetManager?.__notedDiscoveredNewLoadedFacets__?.includes?.(facetName)) continue;
                    if (globalThis.notedNewFacets.includes(facetName)) continue;
                    globalThis.notedNewFacets.push(facetName);
                    console.info(\`New facet discovered!: \${facetName}\`);
                }
            }, 1);

            /* function facetSpy({}) {
                let data = {
                    sharedFacets: {
                        "vanilla.clipboard": (0, ${facetAccessHolderBindingVariableTarget}.useSharedFacet)(Ii),
                        "core.sound": (0, ${facetAccessHolderBindingVariableTarget}.useSharedFacet)(Hl),
                        "core.deviceInformation": (0, ${facetAccessHolderBindingVariableTarget}.useSharedFacet)(${facetAccessHolderBindingVariableTarget}.sharedFacet("core.deviceInformation")),
                        "core.performanceFacet": (0, ${facetAccessHolderBindingVariableTarget}.useSharedFacet)(${facetAccessHolderBindingVariableTarget}.sharedFacet("core.performanceFacet")),
                    }
                };
                if (globalThis.facetSpyData) {
                    data = globalThis.facetSpyData;
                    try {
                        if (data.sharedFacets["vanilla.clipboard"].get()?.toString?.() === "Symbol(NoValue)") {
                            data.sharedFacets["vanilla.clipboard"] = (0, ${facetAccessHolderBindingVariableTarget}.useSharedFacet)(Ii);
                        }
                    } catch {}
                    try {
                        if (data.sharedFacets["core.sound"].get()?.toString?.() === "Symbol(NoValue)") {
                            data.sharedFacets["core.sound"] = (0, ${facetAccessHolderBindingVariableTarget}.useSharedFacet)(Hl);
                        }
                    } catch {}
                    try {
                        if (data.sharedFacets["core.deviceInformation"].get()?.toString?.() === "Symbol(NoValue)") {
                            data.sharedFacets["core.deviceInformation"] = (0, ${facetAccessHolderBindingVariableTarget}.useSharedFacet)(${facetAccessHolderBindingVariableTarget}.sharedFacet("core.deviceInformation"));
                        }
                    } catch {}
                    try {
                        if (data.sharedFacets["core.performanceFacet"].get()?.toString?.() === "Symbol(NoValue)") {
                            data.sharedFacets["core.performanceFacet"] = (0, ${facetAccessHolderBindingVariableTarget}.useSharedFacet)(${facetAccessHolderBindingVariableTarget}.sharedFacet("core.performanceFacet"));
                        }
                    } catch {}
                }
                
                globalThis.facetSpyData = data;
                return null;
            }
            globalThis.facetSpy = facetSpy; */
            /**
             * Returns a list of all accessible facets from the facetSpy data.
             *
             * It sources from both {@link facetSpyData.sharedFacets} and {@link accessedFacets}.
             *
             * @returns The accessible facets.
             *
             * @todo Maybe add a parameter for context for getting facets from accessedFacets.
             */
            function getAccessibleFacetSpyFacets_internal() {
                return Object.fromEntries(
                    Object.entries({ ...globalThis.accessedFacets, ...(globalThis.facetSpyData?.sharedFacets || {}) })
                        .filter(([_name, facet]) => {
                            try {
                                return facet && ("get" in facet ? facet : facet()).get()?.toString?.() !== "Symbol(NoValue)";
                            } catch {
                                return false;
                            }
                        })
                        .map(([name, facet]) => [name, ("get" in facet ? facet : facet())?.get?.() ?? ("get" in facet ? facet : facet())])
                );
            }
            globalThis.getAccessibleFacetSpyFacets_internal = getAccessibleFacetSpyFacets_internal;
            // Fallback when customOverlay.js does not load.
            if (globalThis.getAccessibleFacetSpyFacets === undefined) {
                console.warn("getAccessibleFacetSpyFacets is undefined. Falling back to getAccessibleFacetSpyFacets_internal.");
                globalThis.getAccessibleFacetSpyFacets ??= getAccessibleFacetSpyFacets_internal;
            }` as const;
                    }
                    {
                        // Brackets so that the 5 MiB variable is discarded immediately afterwards.
                        const preInjectionContent: string = currentFileContent;
                        const facetAccessHolderReplacementTarget: RegExp =
                            /index-[0-9a-f]{5,20}\.js$/.test(fullFilename) ?
                                new RegExp(
                                    `(?<!\\(\\)=>(?:[a-zA-Z0-9_$])\\}\\);)var ([a-zA-Z0-9_$])=([a-zA-Z0-9_$])\\(([0-9]+)\\),${facetAccessHolderBindingVariableTarget}=\\2\\(([0-9]+)\\);(?=const (?:[a-zA-Z0-9_$])=\\(0,(?:[a-zA-Z0-9_$])\\.createContext\\))`
                                )
                            : /gameplay-[0-9a-f]{5,20}\.js$/.test(fullFilename) ?
                                new RegExp(`.URLSearchParams;var ${facetAccessHolderBindingVariableTarget}=([a-zA-Z0-9_$])\\(([0-9]+)\\);`)
                            :   new RegExp(`var ${facetAccessHolderBindingVariableTarget}=([a-zA-Z0-9_$])\\(([0-9]+)\\);`);
                        let contextHolderNotInjected: boolean = !/index-[0-9a-f]{5,20}\.js$/.test(fullFilename);
                        if (!facetAccessHolderReplacementTarget.test(currentFileContent)) {
                            throw new Error(`Unable to find facet spy facet access holder variable injection location in file "${fullFilename}".`);
                        }
                        currentFileContent = currentFileContent.replace(
                            facetAccessHolderReplacementTarget,
                            getFacetSpyFunction(
                                /index-[0-9a-f]{5,20}\.js$/.test(fullFilename) ?
                                    `var $1 = (globalThis.contextHolder = $2($3)),
                ${facetAccessHolderBindingVariableTarget} = (globalThis.facetAccessHolder = $2($4));`
                                : /gameplay-[0-9a-f]{5,20}\.js$/.test(fullFilename) ?
                                    `.URLSearchParams;
            var ${facetAccessHolderBindingVariableTarget} = (globalThis.facetAccessHolder = $1($2));`
                                :   `var ${facetAccessHolderBindingVariableTarget} = (globalThis.facetAccessHolder = $1($2));`
                            )
                        );
                        if (currentFileContent === preInjectionContent && /gameplay-[0-9a-f]{5,20}\.js$/.test(fullFilename)) {
                            const preContextHolderReplacementFileContent: string = currentFileContent;
                            currentFileContent = currentFileContent.replace(
                                new RegExp(
                                    `var ([a-zA-Z0-9_$])=([a-zA-Z0-9_$])\\(([0-9]+)\\),${facetAccessHolderBindingVariableTarget}=\\2\\(([0-9]+)\\);(?=const (?:[a-zA-Z0-9_$])=\\(0,(?:[a-zA-Z0-9_$])\\.createContext\\))`
                                ),
                                getFacetSpyFunction(`var $1 = (globalThis.contextHolder = $2($3)),
                ${facetAccessHolderBindingVariableTarget} = (globalThis.facetAccessHolder = $2($4));`)
                            );
                            if (currentFileContent !== preContextHolderReplacementFileContent) contextHolderNotInjected = false;
                        }
                        if (currentFileContent === preInjectionContent) {
                            throw new Error(`Failed to inject facetSpy function into file "${fullFilename}".`);
                        }
                        // if (contextHolderNotInjected) throw new Error(`Facet spy context holder variable not injected into file "${fullFilename}".`);
                        if (contextHolderNotInjected) {
                            console.warn(new Error(`Facet spy context holder variable not injected into file "${fullFilename}".`));
                        }
                    }
                    {
                        // Brackets so that the 5 MiB variable is discarded immediately afterwards.
                        const preInjectionContent = currentFileContent;
                        currentFileContent = currentFileContent.replace(
                            /(?:[a-zA-Z0-9_$])\.sharedFacet=function\(([a-zA-Z0-9_$]),([a-zA-Z0-9_$])=([a-zA-Z0-9_$])\.NO_VALUE\)\{const ([a-zA-Z0-9_$])=\(0,([a-zA-Z0-9_$])\.default\)\(\(([a-zA-Z0-9_$])=>\(0,\3\.createFacet\)\(\{initialValue:\2,startSubscription:\2=>\6\(\1,\2\)\}\)\)\);return \4.factory=\3\.FACET_FACTORY,\4\}/,
                            `$2.sharedFacet = (name, $2) => {
                    if (globalThis.accessedFacets[name]) {
                        return globalThis.accessedFacets[name];
                    }
                    return (globalThis.accessedFacets[name] = (function ($1, $2 = $3.NO_VALUE) {
                        const $4 = (0, $5.default)(($6) => (0, $3.createFacet)({ initialValue: $2, startSubscription: ($2) => $6($1, $2) }));
                        return ($4.factory = $3.FACET_FACTORY), $4;
                    })(name, $2));
                };`
                        );
                        if (currentFileContent === preInjectionContent) {
                            throw new Error(`Failed to inject into sharedFacet function into file "${fullFilename}".`);
                        }
                    }
                    return currentFileContent;
                },
            },
        ],
        format_version: "1.0.0",
        min_engine_version: "1.0.0",
    },
    {
        name: "Lite play screen routes.",
        id: "lite-play-screen-routes",
        namespace: "built-in",
        version: "1.0.1",
        uuid: "61991c84-c751-4d48-8412-5acd690144f3",
        description: "Injects the routes for the lite play screen into the routes.json and index.js files.",
        actions: [
            {
                id: "inject-into-routes",
                context: "per_text_file",
                async action(currentFileContent: string, file: zip.ZipFileEntry<any, any>): Promise<string> {
                    const fullFilename: string = file.getFullname();
                    if (/routes\.json$/.test(fullFilename)) {
                        if (
                            !/(?<="fileName"(?:[\s\n]*):([\s\n]*)"\/hbui\/index\.html",(?:[\s\n]*)"scope":(?:[\s\n]*)\[(?:[\s\n]*)"in-game"(?:[\s\n]*),(?:[\s\n]*)"out-of-game"(?:[\s\n]*)\](?:[\s\n]*),(?:[\s\n]*)(?:"defaultRoute"(?:[\s\n]*):(?:[\s\n]*)""(?:[\s\n]*),(?:[\s\n]*))?"supportedRoutes"(?:[\s\n]*):(?:[\s\n]*)\[([\s\n]*))(?=\{([\s\n]*)")/.test(
                                currentFileContent
                            )
                        ) {
                            throw new Error("Failed to inject routes into routes.json.");
                        }
                        currentFileContent = currentFileContent.replace(
                            /(?<="fileName"(?:[\s\n]*):([\s\n]*)"\/hbui\/index\.html",(?:[\s\n]*)"scope":(?:[\s\n]*)\[(?:[\s\n]*)"in-game"(?:[\s\n]*),(?:[\s\n]*)"out-of-game"(?:[\s\n]*)\](?:[\s\n]*),(?:[\s\n]*)(?:"defaultRoute"(?:[\s\n]*):(?:[\s\n]*)""(?:[\s\n]*),(?:[\s\n]*))?"supportedRoutes"(?:[\s\n]*):(?:[\s\n]*)\[([\s\n]*))(?=\{([\s\n]*)")/,
                            `{$3"route":$1"/ouic/:menu/:tab?",$3"modes":$1[],$3"regexp":$1"^\\\\/ouic\\\\/([^\\\\/]+?)(?:\\\\/([^\\\\/]+?))?(?:\\\\/)?$",$3"params":$1[{"name":"menu","prefix":"/","delimiter":"/","optional":false,"repeat":false,"pattern":"[^\\\\/]+?"},{"name":"tab","prefix":"/","delimiter":"/","optional":true,"repeat":false,"pattern":"[^\\\\/]+?"}],$3"transition":$1"RouteSlideTransition"$2},$2`
                        );
                        return currentFileContent;
                    } else if (/index-[0-9a-f]{5,20}\.js$/.test(fullFilename)) {
                        const origData: string = await file.getText();
                        /**
                         * The symbol name of the facet access holder.
                         */
                        const bindingVariableTargets: [
                            translatorPropertyKey: string,
                            translatorPropertyVariableName: string,
                            translatorSymbolName: string,
                            contextHolder: string,
                            screenLayoutCopmonent: string,
                        ] = origData
                            .match(
                                /const\{([a-zA-Z0-9_$]):([a-zA-Z0-9_$])\}=([a-zA-Z0-9_$]{2})\("PlayScreen"\)(?:,(?:[a-zA-Z0-9_$])=\(\)=>\{const (?:[a-zA-Z0-9_$])=(?:[a-zA-Z0-9_$]{2})\((?:[a-zA-Z0-9_$]{2})\.serversTabV2\);return (?:[a-zA-Z0-9_$])\.createElement\((?:[a-zA-Z0-9_$])\.Unwrap,\{data:(?:[a-zA-Z0-9_$])\},\((?:[a-zA-Z0-9_$])=>(?:[a-zA-Z0-9_$])\.enabled\?(?:[a-zA-Z0-9_$])\.createElement\((?:[a-zA-Z0-9_$]{2}),null\):(?:[a-zA-Z0-9_$])\.createElement\((?:[a-zA-Z0-9_$]{2}),null\)\)\)\})?;return ([a-zA-Z0-9_$])\.createElement\(([a-zA-Z0-9_$]{2}),\{debugDrawer:\[/
                            )!
                            .slice(1, 6) as [string, string, string, string, string];
                        if (
                            !new RegExp(
                                `(?<=([a-zA-Z0-9_$])\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{route:"/play/servers/add",component:(?:[a-zA-Z0-9_$]{2})(?:\\.ExternalServerForm)?,transitionComponent:([a-zA-Z0-9_$]{2})\\}\\),)`
                            ).test(currentFileContent)
                        ) {
                            throw new Error(`Unable to find routes in file "${fullFilename}".`);
                        }
                        currentFileContent = currentFileContent.replace(
                            new RegExp(
                                `(?<=([a-zA-Z0-9_$])\\.createElement\\(([a-zA-Z0-9_$]{2}),\\{route:"/play/servers/add",component:(?:[a-zA-Z0-9_$]{2})(?:\\.ExternalServerForm)?,transitionComponent:([a-zA-Z0-9_$]{2})\\}\\),)`
                            ),
                            `$1.createElement($2, {
                        route: "/ouic/play/:tab?",
                        component: () => {
                            // const { ${bindingVariableTargets[0]}: ${bindingVariableTargets[1]} } = ${bindingVariableTargets[2]}("PlayScreen");
                            return ${bindingVariableTargets[3]}.createElement(
                                ${bindingVariableTargets[4]},
                                {
                                    debugDrawer: ["create-test-world", "debug-import-worlds"],
                                    friendsDrawer: false,
                                    gamepadAlias: "play-layout-content",
                                    delegateByAlias: "play-screen-tab-bar-wrapper",
                                    screenAnalyticsId: "Play",
                                    title: "Title",
                                },
                                () => ${bindingVariableTargets[3]}.createElement(${bindingVariableTargets[3]}.Fragment, null)
                            );
                        },
                        transitionComponent: $3,
                    }),$1.createElement($2, {
                        route: "/ouic/friends/:tab?",
                        component: () => {
                            return ${bindingVariableTargets[3]}.createElement(
                                ${bindingVariableTargets[4]},
                                {
                                    debugDrawer: [],
                                    friendsDrawer: false,
                                    title: "Title",
                                },
                                () => ${bindingVariableTargets[3]}.createElement(${bindingVariableTargets[3]}.Fragment, null)
                            );
                        },
                        transitionComponent: $3,
                    }),$1.createElement($2, {
                        route: "/ouic/:menu/:tab?",
                        component: () => {
                            return ${bindingVariableTargets[3]}.createElement(
                                ${bindingVariableTargets[4]},
                                {
                                    debugDrawer: [],
                                    friendsDrawer: false,
                                    title: "Title",
                                },
                                () => ${bindingVariableTargets[3]}.createElement(${bindingVariableTargets[3]}.Fragment, null)
                            );
                        },
                        transitionComponent: $3,
                    }),`
                        );
                        return currentFileContent;
                    } else {
                        return currentFileContent;
                    }
                },
            },
        ],
        format_version: "1.17.0+BUILD.8",
        min_engine_version: "1.0.0",
    },
    {
        name: "Make export world button visible.",
        id: "make-export-world-button-visible",
        namespace: "built-in",
        version: "1.0.1",
        uuid: "69e1926b-f1d6-4744-8fe7-a64aed9d6d91",
        description: "A built-in plugin that makes the export world button visible on non-Windows platforms, such as Android.",
        actions: [
            {
                id: "make-export-world-button-visible",
                context: "per_text_file",
                action: async (currentFileContent: string, file: zip.ZipFileEntry<any, any>): Promise<string> => {
                    const fullFilename: string = file.getFullname();
                    if (!/index-[0-9a-f]{5,20}\.js$/.test(fullFilename)) return currentFileContent;
                    if (!/(?<=createElement\([a-zA-Z0-9_$]{3},\{[a-zA-Z0-9_$:,\s]*,showExportButton:)[a-zA-Z0-9_$]{1}(?=,|\})/g.test(currentFileContent)) {
                        throw new Error("Unable to find binding variable target.");
                    }
                    currentFileContent = currentFileContent.replace(
                        /(?<=createElement\([a-zA-Z0-9_$]{3},\{[a-zA-Z0-9_$:,\s]*,showExportButton:)[a-zA-Z0-9_$]{1}(?=,|\})/g,
                        "true"
                    );
                    return currentFileContent;
                },
            },
        ],
        format_version: "1.16.0",
        min_engine_version: "0.25.0",
    },
] as const satisfies (Plugin & { namespace: "built-in" })[];

/**
 * The built-in themes.
 */
// IDEA: Add some build-in themes here.
export const builtInThemes = [] as const satisfies (Theme & { namespace: "built-in" })[];

type __INTERNAL_DEV_MissingBuiltInPluginIDs__ = Exclude<(typeof builtInPlugins)[number]["id"], BuiltInPluginID>;
