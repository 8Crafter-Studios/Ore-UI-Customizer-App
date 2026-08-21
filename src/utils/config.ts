/**
 * src/utils/config.ts
 * @module
 * @description A file containing the config class, which is used to store and retrieve app settings.
 * @supports Main, Preload, Renderer
 */
import { existsSync, mkdirSync, readFileSync, Stats, watchFile, writeFileSync } from "node:fs";
import path from "node:path";
// import os from "node:os";
import { APP_DATA_FOLDER_PATH } from "./URLs";
import process from "node:process";
import { EventEmitter } from "node:events";
import "../init/JSONB.ts";
import "./version.ts";
import semver from "semver";
const nativeTheme =
    process.type === "browser" ?
        (require("electron") as typeof import("electron")).nativeTheme
    :   (require("@electron/remote") as typeof import("@electron/remote")).nativeTheme;

namespace exports {
    export const volumeCategories: ["master", "ui"] = ["master", "ui"];
    export const volumeCategoryDisplayMapping = {
        master: "Master",
        ui: "UI",
    } as const satisfies { [category in (typeof volumeCategories)[number]]: string };
    type VolumeConfigBase = { [category in (typeof volumeCategories)[number]]: number };
    type ConfigEventMap_SettingChangedEvents = {
        /**
         * Emitted when the corresponding setting is changed.
         */
        [key in PropertyPathsWithoutOuterContainingProperties<ConfigJSON> as `settingChanged:${Join<key, ".">}`]: [
            value: GetPropertyValueAtPath<ConfigJSON, key>,
        ];
    };
    export interface ConfigEventMap extends ConfigEventMap_SettingChangedEvents {
        /**
         * Emitted when the config is updated.
         */
        configUpdated: [data: ConfigJSON];
        /**
         * Emitted when a setting is changed.
         */
        settingChanged: {
            [key in PropertyPathsWithoutOuterContainingProperties<ConfigJSON> as Join<key, ".">]: [
                key: Join<key, ".">,
                value: GetPropertyValueAtPath<ConfigJSON, key>,
            ];
        }[Join<PropertyPathsWithoutOuterContainingProperties<ConfigJSON>, ".">];
    }
    type GetBaseJSONTypeOfConfig_Inner<T extends Config | SubConfigValueTypes> = Omit<
        ExcludeMethods<ExcludeReadonlyProps<T>>,
        "constructor" | keyof EventEmitter
    >;
    type GetBaseJSONTypeOfConfig<T extends Config | SubConfigValueTypes, P extends boolean = false> =
        P extends true ? Partial<GetBaseJSONTypeOfConfig_Inner<T>> : GetBaseJSONTypeOfConfig_Inner<T>;
    type GetSubConfigJSONTypeOfConfig_Inner<T extends Config | SubConfigValueTypes, P extends boolean = false> = Mutable<{
        [key in keyof T as T[key] extends SubConfigValueTypes ? key : never]: T[key] extends SubConfigValueTypes ? GetJSONTypeOfConfig<T[key], P> : never;
    }>;
    type GetSubConfigJSONTypeOfConfig<T extends Config | SubConfigValueTypes, P extends boolean = false> =
        P extends true ? Partial<GetSubConfigJSONTypeOfConfig_Inner<T, P>> : GetSubConfigJSONTypeOfConfig_Inner<T>;
    type GetJSONTypeOfConfigA<T extends Config | SubConfigValueTypes, P extends boolean = false> = {
        [key in NonNullable<keyof GetBaseJSONTypeOfConfig<T, false>>]: GetBaseJSONTypeOfConfig<T, P>[key];
    } & {
        [key in NonNullable<keyof GetSubConfigJSONTypeOfConfig<T, false>>]: T[key] extends SubConfigValueTypes ? GetJSONTypeOfConfig<T[key], P> : never;
    };
    type GetJSONTypeOfConfigB<T extends Config | SubConfigValueTypes, P extends boolean = false> =
        P extends true ? Partial<MergeObjectTypes<GetJSONTypeOfConfigA<T, P>>> : MergeObjectTypes<GetJSONTypeOfConfigA<T, P>>;

    type GetJSONTypeOfConfigInner<T extends Config | SubConfigValueTypes, P extends boolean = false> = {
        [key in NonNullable<keyof GetBaseJSONTypeOfConfig<T, false> | keyof GetSubConfigJSONTypeOfConfig<T, false>>]: key extends (
            keyof GetSubConfigJSONTypeOfConfig<T>
        ) ?
            T[key] extends SubConfigValueTypes ?
                GetJSONTypeOfConfig<T[key], P>
            :   never
        : key extends keyof GetBaseJSONTypeOfConfig<T, false> ? GetBaseJSONTypeOfConfig<T, P>[key]
        : never;
    };
    type GetJSONTypeOfConfig<T extends Config | SubConfigValueTypes, P extends boolean = false> =
        P extends true ? Partial<GetJSONTypeOfConfigInner<T, P>> : GetJSONTypeOfConfigInner<T>;
    type ConfigJSONBase<P extends boolean = false> = GetBaseJSONTypeOfConfig<Config, P>;
    type ConfigJSONSubConfigs<P extends boolean = false> =
        P extends true ? Partial<Mutable<{ [key in keyof Config as Config[key] extends SubConfigValueTypes ? key : never]: Config[key] }>>
        :   Mutable<{ [key in keyof Config as Config[key] extends SubConfigValueTypes ? key : never]: Config[key] }>;
    export type ConfigJSON<P extends boolean = false> = GetJSONTypeOfConfig<Config, P>;
    function cullUndefinedProperties<T extends { [key: PropertyKey]: unknown }>(
        obj: T
    ): { [key in keyof T as undefined extends T[key] ? never : key]: Exclude<T[key], undefined> } {
        return Object.fromEntries(Object.entries(obj).filter(([key, value]: [key: string, value: unknown]): boolean => value !== undefined)) as any;
    }
    type DeepSubConfigKeyStructureOfConfig<T extends Config | SubConfigValueTypes> = {
        [key in keyof T as T[key] extends SubConfigValueTypes ? key : never]: T[key] extends SubConfigValueTypes ? DeepSubConfigKeyStructureOfConfig<T[key]>
        :   never;
    };
    const subConfigKeyStructure = {
        volume: {},
    } as const satisfies DeepSubConfigKeyStructureOfConfig<Config>;
    /**
     * A class for managing the config file.
     */
    class Config extends EventEmitter<ConfigEventMap> {
        /**
         * The default values for the config file.
         */
        public static readonly defaults = Object.freeze({
            versionFolderSearchLocations: [
                // Bedrock Launcher (Windows)
                "%appdata%/.minecraft_bedrock/versions",
                // MCPELauncher (Linux/macOS)
                "Home/.var/app/io.mrarm.mcpelauncher/data/mcpelauncher/versions",
                "Home/.local/share/mcpelauncher/versions",
                "Home/Library/Application Support/mcpelauncher/versions",
                // GDK Preview (Windows)
                "%appdata%/../../../../XboxGames/Minecraft Preview for Windows",
                "%appdata%/../../../../XboxGames/Minecraft Preview for Windows_1",
                // GDK (Windows)
                "%appdata%/../../../../XboxGames/Minecraft for Windows",
                "%appdata%/../../../../XboxGames/Minecraft for Windows_1",
                "%appdata%/../../../../XboxGames/7792D9CE-355A-493C-AFBD-768F4A77C3B0",
                // LeviLauncher (Windows GDK)
                "%appdata%/levilauncher.exe/versions",
            ],
            attemptToKeepCurrentConfigWhenUpdatingVersion: false,
            bypassImportJSPluginPrompt: false,
            hideUntrustedPluginWarningPopup: false,
            GUIScale: 0,
            GUIScaleOverride: null,
            downloadOreUICustomizerUpdatesSeparately: false,
            theme: "auto",
            debugHUD: "none",
            panorama: "off",
            panoramaPerspective: 400,
            panoramaRotateDirection: "counterclockwise",
            panoramaRotateSpeed: 2.5,
            volume: { master: 100, ui: 100 },
            shownDialogs: [],
            autoUpdateEnabled: true,
            // TODO: Implement build numbers, like how it is implemented for Bedrock World Editor.
            version: VERSION,
        } as const satisfies ConfigJSON);
        /**
         * The currently loaded data from the config file.
         */
        #currentlyLoadedData: ConfigJSON = this.readConfigFile();
        public constructor(options?: ConstructorParameters<typeof EventEmitter>[0]) {
            super(options);
            this.readConfigFile();
            watchFile(path.join(APP_DATA_FOLDER_PATH, "./config.json"), (current: Stats, previous: Stats): void => {
                if (current.mtimeMs !== previous.mtimeMs) {
                    this.#currentlyLoadedData = this.readConfigFile() ?? this.#currentlyLoadedData;
                }
            });
            this.handleConfigVersionUpdate();
        }
        /**
         * Updates the config when the app is updated.
         */
        public handleConfigVersionUpdate(): void {
            const currentConfigVersion: string = this.version;
            if (semver.satisfies(currentConfigVersion, "< 1.0.0-beta.25")) {
                const currentVersionFolderSearchLocations: string[] = this.versionFolderSearchLocations;
                const originalLength: number = currentVersionFolderSearchLocations.length;
                for (const path of [
                    "Home/.var/app/io.mrarm.mcpelauncher/data/mcpelauncher/versions",
                    "Home/.local/share/mcpelauncher/versions",
                    "Home/Library/Application Support/mcpelauncher/versions",
                    "%appdata%/../../../../XboxGames/Minecraft Preview for Windows",
                    "%appdata%/../../../../XboxGames/Minecraft Preview for Windows_1",
                    "%appdata%/../../../../XboxGames/Minecraft for Windows",
                    "%appdata%/../../../../XboxGames/Minecraft for Windows_1",
                    "%appdata%/../../../../XboxGames/7792D9CE-355A-493C-AFBD-768F4A77C3B0",
                ]) {
                    if (!currentVersionFolderSearchLocations.includes(path)) currentVersionFolderSearchLocations.push(path);
                }
                if (currentVersionFolderSearchLocations.length !== originalLength) this.versionFolderSearchLocations = currentVersionFolderSearchLocations;
            }
            if (semver.satisfies(currentConfigVersion, "< 1.0.0-beta.28")) {
                const currentVersionFolderSearchLocations: string[] = this.versionFolderSearchLocations;
                const originalLength: number = currentVersionFolderSearchLocations.length;
                if (!currentVersionFolderSearchLocations.includes("%appdata%/levilauncher.exe/versions")) {
                    currentVersionFolderSearchLocations.push("%appdata%/levilauncher.exe/versions");
                }
                if (currentVersionFolderSearchLocations.length !== originalLength) this.versionFolderSearchLocations = currentVersionFolderSearchLocations;
            }
            if (semver.compareBuild(currentConfigVersion, VERSION) < 0) {
                this.version = VERSION;
            }
        }
        /**
         * Saves changes to the config file.
         *
         * @param data The data to save.
         */
        public saveChanges(data: ConfigJSON<true>): void {
            const existingData: ConfigJSON = this.getConfigData(true);
            function mergeConfigData<T extends Config | SubConfigValueTypes, Path extends PropertyPathsWithoutOuterContainingProperties<T> | [] = []>(
                oldData: GetJSONTypeOfConfig<T>,
                newData: GetJSONTypeOfConfig<T, true>,
                path: Path = [] as unknown as Path
            ): GetJSONTypeOfConfig<T> {
                let data = { ...oldData, ...newData };
                for (const [key, value] of Object.entries(data) as ConfigEventMap["settingChanged"][]) {
                    // console.log(0, path, key, value);
                    if (key in Config.defaults && getPropertyAtPath(subConfigKeyStructure, [...(path as Path), key])) {
                        // console.log(0.1, path, key, value);
                        [...path, key].reduce(
                            (previousValue: any, currentValue: string | number, currentIndex: number, array: (Path[number] | typeof key)[]): any => {
                                if (
                                    previousValue[currentValue] !== undefined &&
                                    (typeof previousValue[currentValue] !== "object" || previousValue[currentValue] === null)
                                ) {
                                    return;
                                }
                                if (currentIndex === array.length - 1) {
                                    // console.log(1, path, currentValue, currentIndex, previousValue[currentValue], previousValue);
                                    if (getPropertyAtPath(newData, array as Path) !== undefined) {
                                        previousValue[currentValue] = mergeConfigData(oldData[currentValue as never], newData[currentValue as never]);
                                    } else {
                                        previousValue[currentValue] =
                                            getPropertyAtPath(existingData, array as Path) ?? getPropertyAtPath(Config.defaults, array as Path) ?? {};
                                    }
                                    // console.log(2, path, currentValue, currentIndex, previousValue[currentValue], previousValue);
                                    return previousValue[currentValue];
                                } else if (currentValue in previousValue) {
                                    // console.log(3, path, currentValue, currentIndex, previousValue[currentValue], previousValue);
                                    return previousValue[currentValue];
                                } else {
                                    // console.log(4, path, currentValue, currentIndex, previousValue[currentValue], previousValue);
                                    previousValue[currentValue] =
                                        getPropertyAtPath(existingData, array.slice(0, currentIndex + 1)) ??
                                        getPropertyAtPath(Config.defaults, array.slice(0, currentIndex + 1)) ??
                                        {};
                                    // console.log(5, path, currentValue, currentIndex, previousValue[currentValue], previousValue);
                                    return previousValue[currentValue];
                                }
                            },
                            data
                        );
                    }
                }
                return data;
            }
            const newData: ConfigJSON = mergeConfigData<Config, []>(existingData, data);
            this.#currentlyLoadedData = newData;
            if (!existsSync(APP_DATA_FOLDER_PATH)) {
                mkdirSync(APP_DATA_FOLDER_PATH, { recursive: true });
            }
            writeFileSync(path.join(APP_DATA_FOLDER_PATH, "./config.json"), JSONB.stringify(newData, null, 4), { encoding: "utf-8" });
            for (const [key, value] of Object.entries(data) as ConfigEventMap["settingChanged"][]) {
                if (key in Config.defaults) {
                    this.emit(`settingChanged:${key}`, value as any);
                    this.emit("settingChanged", key, value as any);
                }
            }
            this.emit("configUpdated", newData);
        }
        /**
         * Gets the config data.
         *
         * @param forceReloadIfUndefined Whether to force a reload if the data is undefined. Defaults to `false`.
         * @returns The config data.
         */
        public getConfigData(forceReloadIfUndefined: boolean = false): ConfigJSON {
            /* 
            if (!disableConfigUpdate && Date.now() - this.#lastDataLoadTime > 1000) {
                this.#currentlyLoadedData = this.readConfigFile() ?? this.#currentlyLoadedData;
                this.#lastDataLoadTime = Date.now();
            } */
            return this.#currentlyLoadedData ?? (forceReloadIfUndefined ? this.readConfigFile() : undefined);
        }
        /**
         * Reads the config file.
         *
         * @returns The data from the config file.
         */
        public readConfigFile(): ConfigJSON {
            if (!existsSync(path.join(APP_DATA_FOLDER_PATH, "./config.json"))) {
                mkdirSync(APP_DATA_FOLDER_PATH, { recursive: true });
                writeFileSync(path.join(APP_DATA_FOLDER_PATH, "./config.json"), JSONB.stringify(Config.defaults, null, 4), { encoding: "utf-8" });
            }
            return { ...Config.defaults, ...JSONB.parse(readFileSync(path.join(APP_DATA_FOLDER_PATH, "./config.json"), { encoding: "utf-8" })) };
        }
        /**
         * The newest version of the app that this config was used for.
         *
         * @default "0.0.0"
         */
        public get version(): string {
            return this.getConfigData().version ?? "0.0.0";
        }
        public set version(value: string | undefined) {
            this.saveChanges({ version: value ?? Config.defaults.version });
        }
        /**
         * The version folder search locations.
         *
         * These are folders that will directly contain version folders.
         *
         * @default
         * ```typescript
         * [
         *     // Bedrock Launcher (Windows)
         *     "%appdata%/.minecraft_bedrock/versions",
         *     // MCPELauncher (Linux/macOS)
         *     "Home/.var/app/io.mrarm.mcpelauncher/data/mcpelauncher/versions",
         *     "Home/.local/share/mcpelauncher/versions",
         *     "Home/Library/Application Support/mcpelauncher/versions",
         *     // GDK Preview (Windows)
         *     "%appdata%/../../../../XboxGames/Minecraft Preview for Windows",
         *     // GDK (Windows)
         *     "%appdata%/../../../../XboxGames/Minecraft for Windows",
         * ]
         * ```
         */
        public get versionFolderSearchLocations(): string[] {
            return this.getConfigData().versionFolderSearchLocations ?? Config.defaults.versionFolderSearchLocations;
        }
        public set versionFolderSearchLocations(value: string[] | undefined) {
            this.saveChanges({ versionFolderSearchLocations: value ?? Config.defaults.versionFolderSearchLocations });
        }
        /**
         * The parsed version folder search locations.
         *
         * This replaces special codes with their corresponding environment variable values.
         */
        public get parsedVersionFolderSearchLocations(): string[] {
            return this.versionFolderSearchLocations.map((location: string): string =>
                location
                    .replaceAll(/%appdata%/gi, process.env.APPDATA!)
                    .replace(/^Home(?=\/)/, process.env.HOME!)
                    .replaceAll(/%userprofile%/gi, process.env.USERPROFILE!)
                    .replaceAll(/%programdata%/gi, process.env.ProgramData!)
                    .replaceAll(/%programfiles%/gi, process.env.ProgramFiles!)
                    .replaceAll(/%localappdata%/gi, process.env.LOCALAPPDATA!)
                    .replaceAll(/%temp%/gi, process.env.TEMP!)
                    .replaceAll(/%tmp%/gi, process.env.TMP!)
                    .replaceAll(/%public%/gi, process.env.PUBLIC!)
                    .replaceAll(/\\/g, "/")
            );
        }
        /**
         * The list of dialogs that have been shown.
         *
         * @default
         * ```typescript
         * []
         * ```
         */
        public get shownDialogs(): LooseAutocomplete<ConfigConstants.DialogId>[] {
            return this.getConfigData().shownDialogs ?? Config.defaults.shownDialogs;
        }
        public set shownDialogs(value: LooseAutocomplete<ConfigConstants.DialogId>[] | undefined) {
            this.saveChanges({ shownDialogs: value ?? Config.defaults.shownDialogs });
        }
        /**
         * The GUI scale of the app.
         *
         * This is added to {@link baseGUIScale} to get the actual GUI scale.
         *
         * @default 0
         *
         * @example -1
         */
        public get GUIScale(): number {
            return this.getConfigData().GUIScale ?? Config.defaults.GUIScale;
        }
        public set GUIScale(value: number | undefined) {
            this.saveChanges({ GUIScale: value ?? Config.defaults.GUIScale });
        }
        /**
         * The GUI scale override of the app.
         *
         * If this is not `null`, this will override the value of {@link actualGUIScale}.
         *
         * @default null
         *
         * @example 3
         */
        public get GUIScaleOverride(): number | null {
            return this.getConfigData().GUIScaleOverride ?? Config.defaults.GUIScaleOverride;
        }
        public set GUIScaleOverride(value: number | null | undefined) {
            this.saveChanges({ GUIScaleOverride: value ?? Config.defaults.GUIScaleOverride });
        }
        /**
         * The base GUI scale of the app.
         *
         * It is calculated using this expression:
         * ```typescript
         * Math.max(1, Math.min(Math.floor(innerWidth / 320), Math.floor(innerHeight / 240)))
         * ```
         *
         * @readonly
         */
        public get baseGUIScale(): number {
            return Math.max(1, Math.min(Math.floor((innerWidth - 280) / 320), Math.floor(innerHeight / 240)));
        }
        /**
         * The calculated GUI scale of the app.
         *
         * This is the sum of {@link baseGUIScale} and {@link GUIScale}.
         *
         * Note: {@link GUIScale} will be clamped to be between `-Math.max(baseGUIScale - 3, 0)` and `0`.
         *
         * @readonly
         */
        public get calculatedGUIScale(): number {
            const baseGUIScale: number = this.baseGUIScale;
            return Math.max(baseGUIScale + Math.max(this.GUIScale, -Math.max(baseGUIScale - 3, 0)), 1);
        }
        /**
         * The actual GUI scale of the app.
         *
         * If {@link GUIScaleOverride} is not `null`, this will be the value of {@link GUIScaleOverride}.
         *
         * Otherwise, this is the sum of {@link baseGUIScale} and {@link GUIScaleOverride}.
         *
         * @readonly
         */
        public get actualGUIScale(): number {
            return this.GUIScaleOverride ?? this.calculatedGUIScale;
        }
        /**
         * Whether to attempt to keep the current config when updating the version.
         */
        public get attemptToKeepCurrentConfigWhenUpdatingVersion(): boolean {
            return this.getConfigData().attemptToKeepCurrentConfigWhenUpdatingVersion ?? Config.defaults.attemptToKeepCurrentConfigWhenUpdatingVersion;
        }
        public set attemptToKeepCurrentConfigWhenUpdatingVersion(value: boolean | undefined) {
            this.saveChanges({ attemptToKeepCurrentConfigWhenUpdatingVersion: value ?? Config.defaults.attemptToKeepCurrentConfigWhenUpdatingVersion });
        }
        /**
         * Whether to bypass the import JS plugin prompt.
         */
        public get bypassImportJSPluginPrompt(): boolean {
            return this.getConfigData().bypassImportJSPluginPrompt ?? Config.defaults.bypassImportJSPluginPrompt;
        }
        public set bypassImportJSPluginPrompt(value: boolean | undefined) {
            this.saveChanges({ bypassImportJSPluginPrompt: value ?? Config.defaults.bypassImportJSPluginPrompt });
        }
        /**
         * Whether to hide the untrusted plugin warning popup.
         */
        public get hideUntrustedPluginWarningPopup(): boolean {
            return this.getConfigData().hideUntrustedPluginWarningPopup ?? Config.defaults.hideUntrustedPluginWarningPopup;
        }
        public set hideUntrustedPluginWarningPopup(value: boolean | undefined) {
            this.saveChanges({ hideUntrustedPluginWarningPopup: value ?? Config.defaults.hideUntrustedPluginWarningPopup });
        }
        /**
         * Whether to allow downloading versions of the Ore UI Customizer directly from 8Crafter's website.
         *
         * This allows for getting the latest version of the Ore UI Customizer without requiring updating the app.
         *
         * This has some security risk, so it is disabled by default.
         *
         * The security risk is that the files are stored in the AppData folder, where other programs could modify it to make the app run arbitrary Node.JS programs.
         *
         * Note that this security risk is not that bad as the same exploit could be achieved by modifying the node_modules folder.
         *
         * @default false
         *
         * @todo
         */
        public get downloadOreUICustomizerUpdatesSeparately(): boolean {
            return this.getConfigData().downloadOreUICustomizerUpdatesSeparately ?? Config.defaults.downloadOreUICustomizerUpdatesSeparately;
        }
        public set downloadOreUICustomizerUpdatesSeparately(value: boolean | undefined) {
            this.saveChanges({ downloadOreUICustomizerUpdatesSeparately: value ?? Config.defaults.downloadOreUICustomizerUpdatesSeparately });
        }
        public get theme(): "auto" | "dark" | "light" | "blue" {
            return this.getConfigData().theme ?? Config.defaults.theme;
        }
        public set theme(value: "auto" | "dark" | "light" | "blue" | undefined) {
            this.saveChanges({ theme: value ?? Config.defaults.theme });
        }
        public get actualTheme(): "dark" | "light" | "blue" {
            return (
                this.theme === "auto" ?
                    nativeTheme.shouldUseDarkColors ?
                        "dark"
                    :   "light"
                :   this.theme
            );
        }
        public get debugHUD(): (typeof ConfigConstants.debugOverlayModeList)[number] {
            return this.getConfigData().debugHUD ?? Config.defaults.debugHUD;
        }
        public set debugHUD(value: (typeof ConfigConstants.debugOverlayModeList)[number] | undefined) {
            this.saveChanges({ debugHUD: value ?? Config.defaults.debugHUD });
        }
        public get panorama(): (typeof ConfigConstants.panoramaList)[number] {
            return this.getConfigData().panorama ?? Config.defaults.panorama;
        }
        public set panorama(value: (typeof ConfigConstants.panoramaList)[number] | undefined) {
            this.saveChanges({ panorama: value ?? Config.defaults.panorama });
        }
        public get panoramaPerspective(): number {
            return this.getConfigData().panoramaPerspective ?? Config.defaults.panoramaPerspective;
        }
        public set panoramaPerspective(value: number | undefined) {
            this.saveChanges({ panoramaPerspective: value ?? Config.defaults.panoramaPerspective });
        }
        public get panoramaRotateDirection(): "clockwise" | "counterclockwise" {
            return this.getConfigData().panoramaRotateDirection ?? Config.defaults.panoramaRotateDirection;
        }
        public set panoramaRotateDirection(value: "clockwise" | "counterclockwise" | undefined) {
            this.saveChanges({ panoramaRotateDirection: value ?? Config.defaults.panoramaRotateDirection });
        }
        public get panoramaRotateSpeed(): number {
            return this.getConfigData().panoramaRotateSpeed ?? Config.defaults.panoramaRotateSpeed;
        }
        public set panoramaRotateSpeed(value: number | undefined) {
            this.saveChanges({ panoramaRotateSpeed: value ?? Config.defaults.panoramaRotateSpeed });
        }
        /**
         * Whether or not to try to automatically update the app when a new version is available.
         *
         * @platform darwin,win32
         *
         * @default true
         */
        public get autoUpdateEnabled(): boolean {
            return this.getConfigData().autoUpdateEnabled ?? Config.defaults.autoUpdateEnabled;
        }
        public set autoUpdateEnabled(value: boolean | undefined) {
            this.saveChanges({ autoUpdateEnabled: value ?? Config.defaults.autoUpdateEnabled });
        }
        /**
         * The volume options.
         *
         * Each category *should* be between 0 and 100 (inclusive).
         *
         * @readonly
         */
        public readonly volume: VolumeConfig = new VolumeConfig(this);
        /**
         * Constants for properties of the config.
         *
         * These are not settings.
         */
        public readonly constants: typeof ConfigConstants = ConfigConstants;
    }
    type SubConfigValueTypes = (typeof subConfigValueClasses)[number]["prototype"];
    /**
     * The volume config.
     */
    class VolumeConfig implements VolumeConfigBase {
        /**
         * The config that this volume config belongs to.
         *
         * @readonly
         */
        readonly #config: Config;
        /**
         * Creates a new volume config.
         *
         * @param config The config that this volume config belongs to.
         */
        public constructor(config: Config) {
            this.#config = config;
        }
        /**
         * The master volume.
         *
         * @default 100
         */
        public get master(): number {
            return this.#config.getConfigData().volume?.master ?? Config.defaults.volume.master;
        }
        public set master(value: number | undefined) {
            this.#config.saveChanges({ volume: { master: value ?? Config.defaults.volume.master } });
        }
        /**
         * The UI volume.
         *
         * @default 100
         */
        public get ui(): number {
            return this.#config.getConfigData().volume?.ui ?? Config.defaults.volume.ui;
        }
        public set ui(value: number | undefined) {
            this.#config.saveChanges({ volume: { ui: value ?? Config.defaults.volume.ui } });
        }
    }
    const subConfigValueClasses = [VolumeConfig] as const;

    namespace ConfigConstants {
        export type DialogId = "allow_automatic_updates";
        export const debugOverlayModeList = ["none", "top", "basic", "config"] as const;
        export const debugOverlayModes = {
            none: "Off",
            top: "Top",
            basic: "Basic",
            config: "Config",
        } as const satisfies { [key in (typeof config)["debugHUD"]]: string };
        export const panoramaList = [
            "off",
            "beta",
            "buzzy-bees",
            "chaos-cubed",
            "chase-the-skies",
            "copper-age",
            "creeking",
            "education-demo",
            "mounts-of-mayhem",
            "preview",
            "spring-to-life",
            "tiny-takeover",
            "trails-and-tales",
            "tricky-trials",
            "wild-update",
            "windows-10-edition-beta",
            "latest",
        ] as const;
        export const panoramaDisplayMapping = {
            off: "Off",
            beta: "Beta",
            "buzzy-bees": "Buzzy Bees",
            "chaos-cubed": "Chaos Cubed",
            "chase-the-skies": "Chase the Skies",
            "copper-age": "Copper Age",
            creeking: "Creeking",
            "education-demo": "Education Demo",
            "mounts-of-mayhem": "Mounts of Mayhem",
            preview: "Preview",
            "spring-to-life": "Spring to Life",
            "tiny-takeover": "Tiny Takeover",
            "trails-and-tales": "Trails and Tales",
            "tricky-trials": "Tricky Trials",
            "wild-update": "Wild Update",
            "windows-10-edition-beta": "Windows 10 Edition Beta",
            latest: "Latest",
        } satisfies { [key in (typeof config)["panorama"]]: string };
        export const latestConfig: Exclude<(typeof panoramaList)[number], "off" | "latest"> = "chaos-cubed";
    }

    /**
     * A class for managing the config file.
     */
    export const config = new Config();
}

export import config = exports.config;
import { getPropertyAtPath } from "./getPropertyAtPath";

globalThis.volumeCategories = exports.volumeCategories;
globalThis.volumeCategoryDisplayMapping = exports.volumeCategoryDisplayMapping;
globalThis.config = config;

declare global {
    export import volumeCategories = exports.volumeCategories;
    export import volumeCategoryDisplayMapping = exports.volumeCategoryDisplayMapping;
    export import config = exports.config;
    export import ConfigEventMap = exports.ConfigEventMap;
    export import ConfigJSON = exports.ConfigJSON;
}
