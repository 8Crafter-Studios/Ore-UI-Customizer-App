/* eslint-disable no-useless-escape */
import {
    builtInPlugins,
    defaultOreUICustomizerSettings,
    type EncodedPluginData,
    type ExtractedSymbolNames,
    getExtractedSymbolNames,
    getReplacerRegexes,
    importPluginFromDataURI,
    type OreUICustomizerSettings,
    type Plugin,
} from "./ore-ui-customizer-assets.js";
import "./zip.js";

/**
 * The version of the Ore UI Customizer API.
 */
export const format_version = "1.3.0";

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
 * Checks if a string is a URI or a path.
 *
 * @param {string} URIOrPath The string to check.
 * @returns {"URI" | "Path"} "URI" if the string is a URI, "Path" if the string is a path.
 */
function checkIsURIOrPath(URIOrPath: string): "URI" | "Path" {
    if (/^[^:\/\\]+:\/\//.test(URIOrPath)) {
        return "URI" as const;
    } else {
        return "Path" as const;
    }
}

/**
 * Resolves the settings for the {@link applyMods} function, adding in the default values in place of the missing settigns.
 *
 * @param settings The settings to resolve.
 * @returns The resolved settings.
 */
export function resolveOreUICustomizerSettings(
    settings: {
        [key in keyof OreUICustomizerSettings]?: key extends "colorReplacements"
            ? Partial<OreUICustomizerSettings["colorReplacements"]>
            : key extends "enabledBuiltInPlugins"
            ? Partial<OreUICustomizerSettings["enabledBuiltInPlugins"]>
            : OreUICustomizerSettings[key];
    } = {}
): OreUICustomizerSettings {
    return {
        ...defaultOreUICustomizerSettings,
        ...settings,
        colorReplacements: { ...defaultOreUICustomizerSettings.colorReplacements, ...settings.colorReplacements },
        enabledBuiltInPlugins: { ...defaultOreUICustomizerSettings.enabledBuiltInPlugins, ...settings.enabledBuiltInPlugins },
    };
}

/**
 * Applies mods to a zip file.
 *
 * @param {Blob} file The zip file to apply mods to.
 * @param {ApplyModsOptions} options The options.
 * @returns {Promise<ApplyModsResult>} A promise resolving to the result.
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
    /**
     * The list of plugins to apply.
     */
    const plugins: Plugin[] = [...builtInPlugins, ...(settings.preloadedPlugins ?? [])];
    for (const encodedPlugin of settings.plugins ?? []) {
        plugins.push(await importPluginFromDataURI(encodedPlugin.dataURI, encodedPlugin.fileType));
    }
    for (const entry of zipFs.entries as (zip.ZipFileEntry<any, any> | zip.ZipDirectoryEntry)[]) {
        if (/^(gui\/)?dist\/hbui\/assets\/[^\/]*?%40/.test(entry.data?.filename!)) {
            let origName = entry.name;
            entry.rename(entry.name.split("/").pop()!.replaceAll("%40", "@"));
            log(`Entry ${origName} has been successfully renamed to ${entry.name}.`);
            modifiedCount++;
            renamedCount++;
        } else if (!/^(gui\/)?dist\/hbui\/[^\/]+\.(js|html|css)$/.test(entry.data?.filename.toLowerCase()!)) {
            if (entry.directory !== void false) {
                unmodifiedCount++;
            } else if (/\.(txt|md|js|jsx|html|css|json|jsonc|jsonl)$/.test(entry.data?.filename.toLowerCase()!)) {
                /**
                 * @type {string}
                 */
                const origData: string = await entry.getText();
                let distData = origData;
                /**
                 * @type {string[]}
                 */
                let failedReplaces: string[] = [];
                for (const plugin of plugins) {
                    if (plugin.namespace !== "built-in" || (settings.enabledBuiltInPlugins[plugin.id as keyof typeof settings.enabledBuiltInPlugins] ?? true)) {
                        for (const action of plugin.actions) {
                            if (action.context !== "per_text_file") continue;
                            try {
                                distData = await action.action(distData, entry, zipFs);
                            } catch (e) {
                                failedReplaces.push(`${plugin.namespace !== "built-in" ? `${plugin.namespace}:` : ""}${plugin.id}:${action.id}`);
                            }
                        }
                    }
                }
                if (failedReplaces.length > 0) allFailedReplaces[entry.data?.filename!] = failedReplaces;
                if (origData !== distData) {
                    if (entry.data?.filename.endsWith(".js")) {
                        distData = `// Modified by 8Crafter's Ore UI Customizer v${format_version}: https://www.8crafter.com/utilities/ore-ui-customizer\n// Options: ${JSON.stringify(
                            { ...settings, plugins: settings.plugins?.map((plugin) => ({ ...plugin, dataURI: "..." })) }
                        )}\n${distData}`;
                    } else if (entry.data?.filename.endsWith(".css")) {
                        distData = `/* Modified by 8Crafter's Ore UI Customizer v${format_version}: https://www.8crafter.com/utilities/ore-ui-customizer */\n/* Options: ${JSON.stringify(
                            { ...settings, plugins: settings.plugins?.map((plugin) => ({ ...plugin, dataURI: "..." })) }
                        )} */\n${distData}`;
                    } else if (entry.data?.filename.endsWith(".html")) {
                        distData = `<!-- Modified by 8Crafter's Ore UI Customizer v${format_version}: https://www.8crafter.com/utilities/ore-ui-customizer -->\n<!-- Options: ${JSON.stringify(
                            { ...settings, plugins: settings.plugins?.map((plugin) => ({ ...plugin, dataURI: "..." })) }
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
                /**
                 * @type {Blob}
                 */
                const origData: Blob = await entry.getBlob();
                let distData = origData;
                /**
                 * @type {string[]}
                 */
                let failedReplaces: string[] = [];
                for (const plugin of plugins) {
                    if (plugin.namespace !== "built-in" || (settings.enabledBuiltInPlugins[plugin.id as keyof typeof settings.enabledBuiltInPlugins] ?? true)) {
                        for (const action of plugin.actions) {
                            if (action.context !== "per_binary_file") continue;
                            try {
                                distData = await action.action(distData, entry, zipFs!);
                            } catch (e) {
                                failedReplaces.push(`${plugin.namespace !== "built-in" ? `${plugin.namespace}:` : ""}${plugin.id}:${action.id}`);
                            }
                        }
                    }
                }
                if (failedReplaces.length > 0) allFailedReplaces[entry.data?.filename!] = failedReplaces;
                if (Buffer.from(await origData.arrayBuffer()).compare(Buffer.from(await distData.arrayBuffer())) !== 0) {
                    entry.replaceBlob(distData);
                    log(`Entry ${entry.name} has been successfully modified.`);
                    modifiedCount++;
                    editedCount++;
                } else {
                    // log(`Entry ${entry.name} has not been modified.`);
                    unmodifiedCount++;
                }
            }
        } else if (entry.data?.filename.endsWith("oreUICustomizer8CrafterConfig.js")) {
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
            let extractedSymbolNames: ExtractedSymbolNames = getExtractedSymbolNames(origData);

            /**
             * Lists of regexes to use for certain modifications.
             */
            const replacerRegexes = getReplacerRegexes(extractedSymbolNames);
            if (settings.hardcoreModeToggleAlwaysClickable) {
                let successfullyReplaced = false;
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
                if (/index-[0-9a-f]{5,20}\.js$/.test(entry.data?.filename!) && !successfullyReplaced) {
                    failedReplaces.push("hardcoreModeToggleAlwaysClickable");
                }
            }
            if (settings.allowDisablingEnabledExperimentalToggles) {
                let successfullyReplaced = false;
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
                                    return null !== ($3AA = translate(tAB, $2AA)) && void 0 !== $3AA ? $3AA : tAB;
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
                            $2AA && tAB
                                ? $16AA.set({ userTriedToActivateToggle: !0, doSetToggleValue: () => (eAB.isEnabled = $2AA), userHasAcceptedBetaFeatures: !1 })
                                : (eAB.isEnabled = $2AA);
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
                if (/index-[0-9a-f]{5,20}\.js$/.test(entry.data?.filename!) && !successfullyReplaced) {
                    failedReplaces.push("allowDisablingEnabledExperimentalToggles");
                }
            }
            // `FUNCTION CODE`.split("${extractedFunctionNames.translationStringResolver}").map(v=>stringToRegexString(v)).join("${extractedFunctionNames.translationStringResolver}")
            if (settings.addMoreDefaultGameModes) {
                let successfullyReplacedA = false;
                let successfullyReplacedB = false;
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
                    fAA = (0, ${extractedSymbolNames.facetHolder}.useNotifyMountComplete)();
                return ${extractedSymbolNames.contextHolder}.createElement($10, {
                    title: iAA(".gameModeTitle"),
                    disabled: mAA,
                    options: pAA,
                    onMountComplete: fAA,
                    value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((eAA) => eAA.gameMode, [], [eAA]),
                    onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                        (eAA, tAA) => ($2) => {
                            const $11 = eAA.gameMode;
                            (eAA.gameMode = $2), uAA && tAA.trackOptionChanged($12.GameModeChanged, $11, $2);
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
                if (/index-[0-9a-f]{5,20}\.js$/.test(entry.data?.filename!)) {
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
                                              ${extractedSymbolNames.facetHolder}.DeferredMount,
                                              null,
                                              ${extractedSymbolNames.contextHolder}.createElement($2, {
                                                  label: $3(".generatorTypeLabel"),
                                                  options: [
                                                      {
                                                          value: $4.Legacy,
                                                          label: "Legacy",
                                                          description: "The old world type.",
                                                      },
                                                      {
                                                          value: $4.Overworld,
                                                          label: $3(".vanillaWorldGeneratorLabel"),
                                                          description: $3(".vanillaWorldGeneratorDescription"),
                                                      },
                                                      {
                                                          value: $4.Flat,
                                                          label: $3(".flatWorldGeneratorLabel"),
                                                          description: $3(".flatWorldGeneratorDescription"),
                                                      },/* 
                                                      {
                                                          value: $4.Nether,
                                                          label: "Nether",
                                                          description: $3(".vanillaWorldGeneratorDescription"),
                                                      },
                                                      {
                                                          value: $4.TheEnd,
                                                          label: "The End",
                                                          description: $3(".vanillaWorldGeneratorDescription"),
                                                      }, */
                                                      {
                                                          value: $4.Void,
                                                          label: $3(".voidWorldGeneratorLabel"),
                                                          description: $3(".voidWorldGeneratorDescription"),
                                                      },/* 
                                                      {
                                                          value: $4.Undefined,
                                                          label: "Undefined",
                                                          description: $3(".vanillaWorldGeneratorDescription"),
                                                      }, */
                                                  ],
                                                  value: $5.value,
                                                  onChange: $5.onChange,
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
                if (/index-[0-9a-f]{5,20}\.js$/.test(entry.data?.filename!)) {
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
                              ${extractedSymbolNames.facetHolder}.DeferredMount,
                              null,
                              ${extractedSymbolNames.contextHolder}.createElement($15, { data: gAA }, (eAA) =>
                                  /* sAA && !eAA
                                      ? ${extractedSymbolNames.contextHolder}.createElement($16, {
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
                                      :  */${extractedSymbolNames.contextHolder}.createElement($16.WithButton, {
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
                if (/index-[0-9a-f]{5,20}\.js$/.test(entry.data?.filename!) && !successfullyReplaced) {
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
                if (/index-[0-9a-f]{5,20}\.js$/.test(entry.data?.filename!) && origData.includes("flatWorldPreset")) {
                    if (!successfullyReplacedA) {
                        failedReplaces.push("allowForChangingFlatWorldPreset_enableToggleAndPresetSelector");
                    }
                    if (!successfullyReplacedB) {
                        failedReplaces.push("allowForChangingFlatWorldPreset_makePresetSelectorDropdownVisible");
                    }
                }
                if (/index-[0-9a-f]{5,20}\.js$/.test(entry.data?.filename!) && origData.includes("flatWorldPreset") && !successfullyReplacedA) {
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
                    p = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => $3(e, (e) => ({ label: e.label, dimension: e.dimension, value: e.id })), [], [s]),
                    f = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e, t) => $4(e, (e) => e.dimension === t), [], [p, m]),
                    g = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.spawnBiomeId, [], [c]),
                    E = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.defaultSpawnBiome || e.isBiomeOverrideActive, [], [c]),
                    h = (0, ${extractedSymbolNames.facetHolder}.useSharedFacet)($5),
                    v = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => $6(e.platform), [], [h]),
                    b = (0, ${extractedSymbolNames.contextHolder}.useContext)($7) !== $8.CREATE,
                    y = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e && b, [b], [v]),
                    rawData = (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e, [], [eAA]);
                return ${extractedSymbolNames.contextHolder}.createElement(
                    ${extractedSymbolNames.facetHolder}.DeferredMountProvider,
                    null,
                    ${extractedSymbolNames.contextHolder}.createElement(
                        $9,
                        {
                            isLockedTemplate: u,
                            achievementsDisabled: d,
                            achievementsDisabledMessages: tAA,
                            narrationText: "Debug",
                            onUnlockTemplateSettings: nAA,
                            isEditorWorld: iAA,
                        },
                        ${extractedSymbolNames.contextHolder}.createElement(
                            ${extractedSymbolNames.facetHolder}.DeferredMount,
                            null,
                            ${extractedSymbolNames.contextHolder}.createElement($10, {
                                title: "Flat nether",
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
                            ${extractedSymbolNames.facetHolder}.DeferredMount,
                            null,
                            ${extractedSymbolNames.contextHolder}.createElement($10, {
                                title: "Enable game version override",
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
                            ${extractedSymbolNames.facetHolder}.DeferredMount,
                            null,
                            ${extractedSymbolNames.contextHolder}.createElement($11, {
                                label: "Game version override",
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
                        ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.facetHolder}.DeferredMount, null, ${extractedSymbolNames.contextHolder}.createElement($12, { title: "World biome settings" })),
                        ${extractedSymbolNames.contextHolder}.createElement($10, {
                            title: "Default spawn biome",
                            description: "Using the default spawn biome will mean a random overworld spawn is selected",
                            gamepad: { index: 3 },
                            disabled: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e) => e.isBiomeOverrideActive, [], [c]),
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
                            ${extractedSymbolNames.facetHolder}.DeferredMount,
                            null,
                            ${extractedSymbolNames.contextHolder}.createElement($13, {
                                onMountComplete: (0, ${extractedSymbolNames.facetHolder}.useNotifyMountComplete)(),
                                title: "Spawn dimension filter",
                                disabled: E,
                                wrapToggleText: !0,
                                options: [
                                    { label: "Overworld", value: 0 },
                                    { label: "Nether", value: 1 },
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
                            ${extractedSymbolNames.facetHolder}.DeferredMount,
                            null,
                            ${extractedSymbolNames.contextHolder}.createElement($14, {
                                title: "Spawn biome",
                                options: f,
                                onItemSelect: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.spawnBiomeId = t), [], [c]),
                                disabled: E,
                                value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((e, t) => (t.filter((t) => t.value === e).length > 0 ? e : t[0].value), [], [g, f]),
                                focusOnSelectedItem: !0,
                            })
                        ),
                        ${extractedSymbolNames.contextHolder}.createElement($10, {
                            title: "Biome override",
                            description: "Set the world to a selected biome. This will override the Spawn biome!",
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
                        ${extractedSymbolNames.contextHolder}.createElement($14, {
                            title: "Biome override",
                            description: "Select biome to be used in the entire world",
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
                        ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.facetHolder}.Mount, { when: y }, ${extractedSymbolNames.contextHolder}.createElement($15, { onExportTemplate: lAA, onClearPlayerData: oAA })),
                        ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.facetHolder}.DeferredMount, null, ${extractedSymbolNames.contextHolder}.createElement(rawValueEditor, { rawData: eAA })),
                        ${extractedSymbolNames.contextHolder}.createElement(() =>
                            ${extractedSymbolNames.contextHolder}.createElement(
                                ${extractedSymbolNames.contextHolder}.Fragment,
                                null,
                                ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.headerFunciton}, null, "Debug Info - Raw"),
                                ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.headerSpacingFunction}, { size: 1 }) /* 
                                ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.facetHolder}.DeferredMount, null, ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.editWorldTextFunction}.Text, null, "worldSummary: " + JSON.stringify(e.get(), undefined, 2))),
                                ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.facetHolder}.DeferredMount, null, ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.editWorldTextFunction}.Text, null, "worldData: " + JSON.stringify(u.get(), undefined, 2))),
                                ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.facetHolder}.DeferredMount, null, ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.editWorldTextFunction}.Text, null, "achievementsDisabledMessages: " + JSON.stringify(t.get(), undefined, 2))), */,
                                ${extractedSymbolNames.contextHolder}.createElement(
                                    ${extractedSymbolNames.facetHolder}.DeferredMount,
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
                                ${extractedSymbolNames.contextHolder}.createElement($11, {
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
                                ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.facetHolder}.DeferredMount, null, ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.editWorldTextFunction}.Text, null, "worldSummary: " + JSON.stringify(Object.getOwnPropertyDescriptors(e.get()), undefined, 2))),
                                ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.facetHolder}.DeferredMount, null, ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.editWorldTextFunction}.Text, null, "worldData: " + JSON.stringify(Object.getOwnPropertyDescriptors(u.get()), undefined, 2))),
                                ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.facetHolder}.DeferredMount, null, ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.editWorldTextFunction}.Text, null, "achievementsDisabledMessages: " + JSON.stringify(Object.getOwnPropertyDescriptors(t.get()), undefined, 2))), */,
                                ${extractedSymbolNames.contextHolder}.createElement(
                                    ${extractedSymbolNames.facetHolder}.DeferredMount,
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
                                ${extractedSymbolNames.contextHolder}.createElement($11, {
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
                        ${extractedSymbolNames.facetHolder}.DeferredMount,
                        null,
                        ${extractedSymbolNames.contextHolder}.createElement(${extractedSymbolNames.headerFunciton}, null, "Raw Value Editor"),
                        ${extractedSymbolNames.contextHolder}.createElement($11, {
                            label: "worldSeed",
                            description: "The seed of the world. (advanced.worldSeed)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().advanced.worldSeed,
                            maxLength: 3000,
                            value: rawData.get().advanced.worldSeed,
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.advanced.worldSeed = t), [], [rawData]),
                            filterProfanity: !1,
                            disabled: false,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($11, {
                            label: "playerPermissions",
                            description: "?. (multiplayer.playerPermissions)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().multiplayer.playerPermissions,
                            maxLength: 3000,
                            value: rawData.get().multiplayer.playerPermissions,
                            onChange: playerPermissionsChange,
                            filterProfanity: !1,
                            disabled: false,
                            title: "Player Permissions",
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($11, {
                            label: "playerAccess",
                            description: "?. (multiplayer.playerAccess)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().multiplayer.playerAccess,
                            maxLength: 3000,
                            value: rawData.get().multiplayer.playerAccess,
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.multiplayer.playerAccess = Number(t)), [], [rawData]),
                            filterProfanity: !1,
                            disabled: false,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($11, {
                            label: "gameMode",
                            description: "?. (general.gameMode)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().general.gameMode,
                            maxLength: 3000,
                            value: rawData.get().general.gameMode,
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.general.gameMode = Number(t)), [], [rawData]),
                            filterProfanity: !1,
                            disabled: false,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($11, {
                            label: "difficulty",
                            description: "?. (general.difficulty)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().general.difficulty,
                            maxLength: 3000,
                            value: rawData.get().general.difficulty,
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.general.difficulty = Number(t)), [], [rawData]),
                            filterProfanity: !1,
                            disabled: false,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($11, {
                            label: "generatorType",
                            description: "?. (advanced.generatorType)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().advanced.generatorType,
                            maxLength: 3000,
                            value: rawData.get().advanced.generatorType,
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.advanced.generatorType = Number(t)), [], [rawData]),
                            filterProfanity: !1,
                            disabled: false,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($11, {
                            label: "simulationDistance",
                            description: "?. (advanced.simulationDistance)",
                            gamepadIndex: 1,
                            placeholder: typeof rawData.get().advanced.simulationDistance,
                            maxLength: 3000,
                            value: rawData.get().advanced.simulationDistance,
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)((e) => (t) => (e.advanced.simulationDistance = Number(t)), [], [rawData]),
                            filterProfanity: !1,
                            disabled: false,
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($10, {
                            title: "achievementsDisabled (read-only)",
                            disabled: true,
                            description: "Whether or not achievements are disabled. (read-only)",
                            value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((/** @type {ReturnType<RawWorldData["get"]>} */ e) => e.achievementsDisabled, [], [eAA]),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                (/** @type {ReturnType<RawWorldData["get"]>} */ e) => (t) => (e.achievementsDisabled = t),
                                [],
                                [rawData]
                            ),
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($10, {
                            title: "achievementsPermanentlyDisabled (read-only)",
                            soundEffectPressed: "ui.hardcore_toggle_press",
                            disabled: true,
                            description: "Whether or not achievements are permanently disabled. (read-only)",
                            value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((/** @type {ReturnType<RawWorldData["get"]>} */ e) => e.achievementsPermanentlyDisabled, [], [eAA]),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                (/** @type {ReturnType<RawWorldData["get"]>} */ e) => (t) => (e.achievementsPermanentlyDisabled = t),
                                [],
                                [rawData]
                            ),
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($10, {
                            title: "isUsingTemplate (read-only)",
                            disabled: true,
                            description: "isUsingTemplate (read-only)",
                            value: (0, ${extractedSymbolNames.facetHolder}.useFacetMap)((/** @type {ReturnType<RawWorldData["get"]>} */ e) => e.isUsingTemplate, [], [eAA]),
                            onChange: (0, ${extractedSymbolNames.facetHolder}.useFacetCallback)(
                                (/** @type {ReturnType<RawWorldData["get"]>} */ e) => (t) => (e.isUsingTemplate = t),
                                [],
                                [rawData]
                            ),
                        }),
                        ${extractedSymbolNames.contextHolder}.createElement($10, {
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
                        ${extractedSymbolNames.contextHolder}.createElement($10, {
                            title: "playerHasDied (read-only)",
                            disabled: true,
                            description: "readonly general.playerHasDied",
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
                if (/index-[0-9a-f]{5,20}\.js$/.test(entry.data?.filename!)) {
                    if (!successfullyReplacedA) {
                        failedReplaces.push("addDebugTab_replaceTab");
                    }
                    if (!successfullyReplacedB) {
                        // console.log(replacerRegexes.addDebugTab[1][0], "\n\n\n");
                        failedReplaces.push("addDebugTab_makeVisible");
                    }
                }
            }
            Object.entries(settings.colorReplacements).forEach(([key, value]) => {
                if (value !== "" && value !== undefined && value !== null && value !== key) {
                    distData = distData.replaceAll(key, value);
                }
            });
            distData = distData
                .replace(
                    /(?=<script defer="defer" src="\/hbui\/(?:index|gameplay|editor)-[a-zA-Z0-9]+\.js"><\/script>)/,
                    `<script defer="defer" src="/hbui/oreUICustomizer8CrafterConfig.js"></script>
        <script defer="defer" src="/hbui/class_path.js"></script>
        <script defer="defer" src="/hbui/css.js"></script>
        <script defer="defer" src="/hbui/JSONB.js"></script>
        <script defer="defer" src="/hbui/customOverlays.js"></script>
        `
                )
                .replace(
                    /(?<=<link href="\/hbui\/gameplay-theme(?:-[a-zA-Z0-9]+)?\.css" rel="stylesheet">)/,
                    `
        <link href="/hbui/customOverlays.css" rel="stylesheet" />`
                );
            distData = distData
                .replace(
                    new RegExp(
                        `(?<=\\{title:(?:[a-zA-Z0-9_\$]{1})\\("\\.bonusChestTitle"\\),description:(?:[a-zA-Z0-9_\$]{1})\\("\\.bonusChestDescription"\\),value:\\(0,(?:[a-zA-Z0-9_\$]{1})\\.useFacetMap\\)\\(\\(\\((?:[a-zA-Z0-9_\$]{1}),(?:[a-zA-Z0-9_\$]{1})\\)=>!(?:[a-zA-Z0-9_\$]{1})&&(?:[a-zA-Z0-9_\$]{1})\\.bonusChest\\),\\[\\],\\[(?:[a-zA-Z0-9_\$]{1}),(?:[a-zA-Z0-9_\$]{1})\\]\\),onChange:\\(0,(?:[a-zA-Z0-9_\$]{1})\\.useFacetCallback\\)\\(\\((?:[a-zA-Z0-9_\$]{1})=>(?:[a-zA-Z0-9_\$]{1})=>\\{(?:[a-zA-Z0-9_\$]{1})\\.bonusChest=(?:[a-zA-Z0-9_\$]{1})\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_\$]{1})\\]\\),disabled:)(?:[a-zA-Z0-9_\$]{1})(?=,visible:(?:[a-zA-Z0-9_\$]{1})\\})`
                    ),
                    `false`
                )
                .replace(
                    new RegExp(
                        `(?<=\\{title:(?:[a-zA-Z0-9_\$]{1})\\("\\.startWithMapTitle"\\),description:(?:[a-zA-Z0-9_\$]{1})\\("\\.startWithMapDescription"\\),value:\\(0,(?:[a-zA-Z0-9_\$]{1})\\.useFacetMap\\)\\(\\(\\((?:[a-zA-Z0-9_\$]{1}),(?:[a-zA-Z0-9_\$]{1})\\)=>!(?:[a-zA-Z0-9_\$]{1})&&(?:[a-zA-Z0-9_\$]{1})\\.startWithMap\\),\\[\\],\\[(?:[a-zA-Z0-9_\$]{1}),(?:[a-zA-Z0-9_\$]{1})\\]\\),onChange:\\(0,(?:[a-zA-Z0-9_\$]{1})\\.useFacetCallback\\)\\(\\((?:[a-zA-Z0-9_\$]{1})=>(?:[a-zA-Z0-9_\$]{1})=>\\{(?:[a-zA-Z0-9_\$]{1})\\.startWithMap=(?:[a-zA-Z0-9_\$]{1})\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_\$]{1})\\]\\),disabled:)(?:[a-zA-Z0-9_\$]{1})(?=,visible:(?:[a-zA-Z0-9_\$]{1})\\})`
                    ),
                    `false`
                )
                .replace(
                    new RegExp(
                        `(?<=\\{title:(?:[a-zA-Z0-9_\$]{1})\\("\\.useFlatWorldTitle"\\),description:(?:[a-zA-Z0-9_\$]{1})\\("\\.useFlatWorldDescription"\\),value:\\(0,(?:[a-zA-Z0-9_\\$]{1}).useFacetMap\\)\\(\\((?:[a-zA-Z0-9_\$]{1})=>(?:[a-zA-Z0-9_\$]{1})\\.useFlatWorld\\),\\[\\],\\[(?:[a-zA-Z0-9_\$]{1})\\]\\),onChange:\\(0,(?:[a-zA-Z0-9_\$]{1})\\.useFacetCallback\\)\\(\\((?:[a-zA-Z0-9_\$]{1})=>(?:[a-zA-Z0-9_\$]{1})=>\\{(?:[a-zA-Z0-9_\$]{1})\\.useFlatWorld=(?:[a-zA-Z0-9_\$]{1})\\}\\),\\[\\],\\[(?:[a-zA-Z0-9_\$]{1})\\]\\),onNarrationText:(?:[a-zA-Z0-9_\$]{1})\\("\\.narrationSuffixDisablesAchievements"\\),offNarrationText:\\(0,(?:[a-zA-Z0-9_\$]{1})\\.useFacetMap\\)\\(\\((?:[a-zA-Z0-9_\$]{1})=>0===(?:[a-zA-Z0-9_\$]{1})\\.length\\?(?:[a-zA-Z0-9_\$]{1})\\("\\.narrationSuffixEnablesAchievements"\\):void 0\\),\\[(?:[a-zA-Z0-9_\$]{1})\\],\\[(?:[a-zA-Z0-9_\$]{1})\\]\\),disabled:)(?:[a-zA-Z0-9_\$]{1})(?=,visible:(?:[a-zA-Z0-9_\$]{1})\\})`
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
                if (/index-[0-9a-f]{5,20}\.js$/.test(entry.data?.filename!) && distData === origDistData) {
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
                            /DebugButton=function\(\{onClick:e,selected:t,disabled:([a-zA-Z0-9_\$]{1}),focusGridIndex:([a-zA-Z0-9_\$]{1}),role:l="inherit",narrationText:o\}\)\{const\{t:(?:[a-zA-Z0-9_\$]{1})\}=(?:[a-zA-Z0-9_\$]{2})\("NavigationBarLayout\.DebugButton"\);return (?:[a-zA-Z0-9_\$]{1})\.createElement\((?:[a-zA-Z0-9_\$]{1})\.Fragment,null,(?:[a-zA-Z0-9_\$]{1})\.createElement\((?:[a-zA-Z0-9_\$]{2}),\{disabled:(?:[a-zA-Z0-9_\$]{1}),focusGridIndex:(?:[a-zA-Z0-9_\$]{1}),inputLegend:(?:[a-zA-Z0-9_\$]{1})\("\.inputLegend"\),narrationText:null!=o\?o:(?:[a-zA-Z0-9_\$]{1})\("\.narration"\),onClick:e,role:l,selected:t\},(?:[a-zA-Z0-9_\$]{1})\.createElement\((?:[a-zA-Z0-9_\$]{2}),\{className:"([a-zA-Z0-9_\$]{5,})",imageRendering:"pixelated",src:(?:[a-zA-Z0-9_\$]{2})\}/
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
                                                        ${extractedSymbolNames.contextHolder}.createElement($2.Divider, null),
                                                        ${extractedSymbolNames.contextHolder}.createElement(() =>
                                                            ${extractedSymbolNames.contextHolder}.createElement(
                                                                function ({ onClick: e, selected: t, disabled: ${disabledVariableSymbolName}, focusGridIndex: rAA, role: l = "inherit" }) {
                                                                    return ${extractedSymbolNames.contextHolder}.createElement(
                                                                        ${extractedSymbolNames.contextHolder}.Fragment,
                                                                        null,
                                                                        ${extractedSymbolNames.contextHolder}.createElement(
                                                                            ${extractedSymbolNames.navbarButtonFunction},
                                                                            {
                                                                                disabled: ${disabledVariableSymbolName},
                                                                                // focusGridIndex: rAA,
                                                                                inputLegend: "8Crafter Utilities",
                                                                                // narrationText: "8Crafter Utilities Button",
                                                                                onClick: e,
                                                                                role: l,
                                                                                selected: t,
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
                                                        ${extractedSymbolNames.contextHolder}.createElement($2.Divider, null),
                                                        ${extractedSymbolNames.contextHolder}.createElement($3, { onClick: $4, screenAnalyticsId: $5 })
                                                    )
                                                )`
                        );
                        successfullyReplaced = true;
                        break;
                    }
                }
                if (/index-[0-9a-f]{5,20}\.js$/.test(entry.data?.filename!) && !successfullyReplaced) {
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
                            failedReplaces.push(`${plugin.namespace !== "built-in" ? `${plugin.namespace}:` : ""}${plugin.id}:${action.id}`);
                        }
                    }
                }
            }
            if (failedReplaces.length > 0) allFailedReplaces[entry.data?.filename!] = failedReplaces;
            if (origData !== distData) {
                if (entry.data?.filename.endsWith(".js")) {
                    distData = `// Modified by 8Crafter's Ore UI Customizer v${format_version}: https://www.8crafter.com/utilities/ore-ui-customizer\n// Options: ${JSON.stringify(
                        { ...settings, plugins: settings.plugins?.map((plugin) => ({ ...plugin, dataURI: "..." })) }
                    )}\n${distData}`;
                } else if (entry.data?.filename.endsWith(".css")) {
                    distData = `/* Modified by 8Crafter's Ore UI Customizer v${format_version}: https://www.8crafter.com/utilities/ore-ui-customizer */\n/* Options: ${JSON.stringify(
                        { ...settings, plugins: settings.plugins?.map((plugin) => ({ ...plugin, dataURI: "..." })) }
                    )} */\n${distData}`;
                } else if (entry.data?.filename.endsWith(".html")) {
                    distData = `<!-- Modified by 8Crafter's Ore UI Customizer v${format_version}: https://www.8crafter.com/utilities/ore-ui-customizer -->\n<!-- Options: ${JSON.stringify(
                        { ...settings, plugins: settings.plugins?.map((plugin) => ({ ...plugin, dataURI: "..." })) }
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
            console.error("Entry is not a ZipFileEntry but has a file extension of js, html, or css: " + entry.data?.filename);
            unmodifiedCount++;
        }
    }
    try {
        zipFs.addBlob("gui/dist/hbui/assets/8crafter.gif", await fetchFileBlob("./assets/oreui/assets/8crafter.gif"));
        log("Added gui/dist/hbui/assets/8crafter.gif");
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
    } catch (e) {
        console.error(e);
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
                } as OreUICustomizerSettings,
                undefined,
                4
            )};
const oreUICustomizerVersion = ${JSON.stringify(format_version)};`
        );
        log("Added gui/dist/hbui/oreUICustomizer8CrafterConfig.js");
        addedCount++;
    } catch (e) {
        console.error(e);
    }
    try {
        zipFs.addBlob("gui/dist/hbui/customOverlays.js", await fetchFileBlob("./assets/oreui/customOverlays.js"));
        log("Added gui/dist/hbui/customOverlays.js");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/customOverlays.css", await fetchFileBlob("./assets/oreui/customOverlays.css"));
        log("Added gui/dist/hbui/customOverlays.css");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/class_path.js", await fetchFileBlob("./assets/oreui/class_path.js"));
        log("Added gui/dist/hbui/class_path.js");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/css.js", await fetchFileBlob("./assets/oreui/css.js"));
        log("Added gui/dist/hbui/css.js");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/JSONB.js", await fetchFileBlob("./assets/oreui/JSONB.js"));
        log("Added gui/dist/hbui/JSONB.js");
        addedCount++;
        zipFs.addBlob("gui/dist/hbui/JSONB.d.ts", await fetchFileBlob("./assets/oreui/JSONB.d.ts"));
        log("Added gui/dist/hbui/JSONB.d.ts");
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
    }
    log(`Added entries: ${addedCount}.`);
    log(`Removed entries: ${removedCount}.`);
    log(`Modified entries: ${modifiedCount}.`);
    log(`Unmodified entries: ${unmodifiedCount}.`);
    log(`Edited ${editedCount} entries.`);
    log(`Renamed ${renamedCount} entries.`);
    log(`Total entries: ${zipFs.entries.length}.`);
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
