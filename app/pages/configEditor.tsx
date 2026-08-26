import type { Component, FunctionComponent, JSX, RefObject } from "preact";
import _React, { hydrate, render, useEffect, useRef, version } from "preact/compat";
import Toggle from "../components/Toggle";
import Slider, { type SliderInnerHTMLInputElement, type SliderProps } from "../components/Slider";
import { updateGUIScale } from "../app";
import { app, dialog, nativeTheme, shell } from "@electron/remote";
import type { MessageBoxReturnValue, OpenDialogReturnValue, SaveDialogReturnValue } from "electron";
import Dropdown from "../components/Dropdown";
import { ConfigManager, OreUICustomizerConfig, type SavedOreUICustomizerConfig_Type } from "../../src/utils/ConfigManager";
import { SettingsSectionContainer, SettingsSidebar, SettingsSidebarSection, SettingsSidebarSectionButton } from "./preferences";
// import { OverlayScrollbars } from "overlayscrollbars";
import CommentJSON from "comment-json";
import semver from "semver";
import json5 from "json5";
import { defaultOreUICustomizerSettings } from "../../src/utils/ore-ui-customizer-assets";
import type { OreUICustomizerSettings } from "ore-ui-customizer-types";
import TextBox from "../components/TextBox";
import { createToast } from "../components/Toast";
import type tinycolor from "../../src/tinycolor2";
import { OreUIPreviewManager, type OreUIPreview } from "../../src/utils/OreUIPreviewManager";
import { applyColorReplacementsToFileContents, resolveOreUICustomizerSettings } from "../../src/utils/ore-ui-customizer-api";
import { VersionFolder } from "../../src/utils/InstallationManager";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { CustomizerAppPage } from "../../src/utils/pageList";
import { showSelectVersionFolderOverlayPage } from "../overlay_pages/SelectVersionFolderOverlayPage";

const generalSectionOptions = [
    {
        key: "add8CrafterUtilitiesMainMenuButton",
        hidden: true,
        component(props: { config: SavedOreUICustomizerConfig_Type }): JSX.Element {
            const ref: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
            return (
                <Toggle
                    inputRef={ref}
                    inputProperties={{
                        "data-config-key": "add8CrafterUtilitiesMainMenuButton",
                        disabled: true,
                    }}
                    label="Add 8Crafter Utilities Main Menu Button"
                    onChange={(event: JSX.TargetedEvent<HTMLInputElement>): void => {
                        props.config.oreUICustomizerConfig.add8CrafterUtilitiesMainMenuButton = event.currentTarget.checked;
                    }}
                    checked={
                        props.config.oreUICustomizerConfig.add8CrafterUtilitiesMainMenuButton ??
                        defaultOreUICustomizerSettings.add8CrafterUtilitiesMainMenuButton
                    }
                />
            );
        },
    },
    {
        key: "hardcoreModeToggleAlwaysClickable",
        component(props: { config: SavedOreUICustomizerConfig_Type }): JSX.Element {
            const ref: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
            return (
                <Toggle
                    inputRef={ref}
                    inputProperties={{
                        "data-config-key": "hardcoreModeToggleAlwaysClickable",
                    }}
                    label="Make Hardcore Mode Toggle Always Clickable"
                    description={"This will allow you to turn hardcore mode on and off whenever you want."}
                    onChange={(event: JSX.TargetedEvent<HTMLInputElement>): void => {
                        props.config.oreUICustomizerConfig.hardcoreModeToggleAlwaysClickable = event.currentTarget.checked;
                    }}
                    checked={
                        props.config.oreUICustomizerConfig.hardcoreModeToggleAlwaysClickable ?? defaultOreUICustomizerSettings.hardcoreModeToggleAlwaysClickable
                    }
                />
            );
        },
    },
    {
        key: "allowDisablingEnabledExperimentalToggles",
        component(props: { config: SavedOreUICustomizerConfig_Type }): JSX.Element {
            const ref: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
            return (
                <Toggle
                    inputRef={ref}
                    inputProperties={{
                        "data-config-key": "allowDisablingEnabledExperimentalToggles",
                    }}
                    label="Allow Disabling Enabled Experimental Toggles"
                    description={
                        <div class="mctoggledescription">
                            This will allow you to disable the experimental toggles even after the world hasbeen played with them on, also applies to the{" "}
                            <code>Education Edition</code> toggle.
                        </div>
                    }
                    onChange={(event: JSX.TargetedEvent<HTMLInputElement>): void => {
                        props.config.oreUICustomizerConfig.allowDisablingEnabledExperimentalToggles = event.currentTarget.checked;
                    }}
                    checked={
                        props.config.oreUICustomizerConfig.allowDisablingEnabledExperimentalToggles ??
                        defaultOreUICustomizerSettings.allowDisablingEnabledExperimentalToggles
                    }
                />
            );
        },
    },
    {
        key: "addGeneratorTypeDropdown",
        component(props: { config: SavedOreUICustomizerConfig_Type }): JSX.Element {
            const ref: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
            return (
                <Toggle
                    inputRef={ref}
                    inputProperties={{
                        "data-config-key": "addGeneratorTypeDropdown",
                    }}
                    label="Add Generator Type Dropdown"
                    description={
                        <>
                            This will add a dropdown that allows you to select the world generator type.
                            <br />
                            It lets you choose any of the following world generator types:
                            <br />
                            <ul style="text-align: left; list-style: circle">
                                <li>Legacy</li>
                                <li>Infinite world</li>
                                <li>Flat world</li>
                                <li>Void world</li>
                            </ul>
                        </>
                    }
                    onChange={(event: JSX.TargetedEvent<HTMLInputElement>): void => {
                        props.config.oreUICustomizerConfig.addGeneratorTypeDropdown = event.currentTarget.checked;
                    }}
                    checked={props.config.oreUICustomizerConfig.addGeneratorTypeDropdown ?? defaultOreUICustomizerSettings.addGeneratorTypeDropdown}
                />
            );
        },
    },
    {
        key: "addMoreDefaultGameModes",
        component(props: { config: SavedOreUICustomizerConfig_Type }): JSX.Element {
            const ref: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
            return (
                <Toggle
                    inputRef={ref}
                    inputProperties={{
                        "data-config-key": "addMoreDefaultGameModes",
                    }}
                    label="Add More Default Game Modes"
                    description={
                        <>
                            This will add more options to the <code>Game Mode</code> dropdown.
                            <br />
                            It will cause the dropdown to have the following options:
                            <br />
                            <ul style="text-align: left; list-style: circle">
                                <li>Survival</li>
                                <li>Creative</li>
                                <li>Adventure</li>
                                <li>Default</li>
                                <li>Spectator</li>
                            </ul>
                        </>
                    }
                    onChange={(event: JSX.TargetedEvent<HTMLInputElement>): void => {
                        props.config.oreUICustomizerConfig.addMoreDefaultGameModes = event.currentTarget.checked;
                    }}
                    checked={props.config.oreUICustomizerConfig.addMoreDefaultGameModes ?? defaultOreUICustomizerSettings.addMoreDefaultGameModes}
                />
            );
        },
    },
    {
        key: "allowForChangingSeeds",
        component(props: { config: SavedOreUICustomizerConfig_Type }): JSX.Element {
            const ref: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
            return (
                <Toggle
                    inputRef={ref}
                    inputProperties={{
                        "data-config-key": "allowForChangingSeeds",
                    }}
                    label="Allow For Changing Seeds"
                    description={
                        "This will allow you to change the world seed whenever you want, also works on marketplace worlds that don't let you change the seed."
                    }
                    onChange={(event: JSX.TargetedEvent<HTMLInputElement>): void => {
                        props.config.oreUICustomizerConfig.allowForChangingSeeds = event.currentTarget.checked;
                    }}
                    checked={props.config.oreUICustomizerConfig.allowForChangingSeeds ?? defaultOreUICustomizerSettings.allowForChangingSeeds}
                />
            );
        },
    },
    {
        key: "allowForChangingFlatWorldPreset",
        component(props: { config: SavedOreUICustomizerConfig_Type }): JSX.Element {
            const ref: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
            return (
                <Toggle
                    inputRef={ref}
                    inputProperties={{
                        "data-config-key": "allowForChangingFlatWorldPreset",
                        disabled: (props.config.oreUICustomizerConfig.addGeneratorTypeDropdown ?? true) === false || undefined,
                    }}
                    label="Allow For Changing Flat World Preset"
                    description={
                        <>
                            This will allow you to change the flat world preset, even after the world has been created.
                            <br />
                            Requires the Add Generator Type Dropdown option to be enabled.
                            <br />
                            Note: This only works in Minecraft versions 1.21.80 and above, and Minecraft Preview versions 1.21.80.20 and above.
                        </>
                    }
                    onChange={(event: JSX.TargetedEvent<HTMLInputElement>): void => {
                        props.config.oreUICustomizerConfig.allowForChangingFlatWorldPreset = event.currentTarget.checked;
                    }}
                    checked={
                        props.config.oreUICustomizerConfig.allowForChangingFlatWorldPreset ?? defaultOreUICustomizerSettings.allowForChangingFlatWorldPreset
                    }
                />
            );
        },
    },
    {
        key: "addDebugTab",
        component(props: { config: SavedOreUICustomizerConfig_Type }): JSX.Element {
            const ref: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
            return (
                <Toggle
                    inputRef={ref}
                    inputProperties={{
                        "data-config-key": "addDebugTab",
                    }}
                    label="Add Debug Tab"
                    description={
                        <>
                            This adds the <code>Debug</code> tab to the create and edit world screens (it also adds a bunch of additional options added to the
                            tab that aren't normally in there).
                        </>
                    }
                    onChange={(event: JSX.TargetedEvent<HTMLInputElement>): void => {
                        props.config.oreUICustomizerConfig.addDebugTab = event.currentTarget.checked;
                    }}
                    checked={props.config.oreUICustomizerConfig.addDebugTab ?? defaultOreUICustomizerSettings.addDebugTab}
                />
            );
        },
    },
    {
        key: "maxTextLengthOverride",
        component(props: { config: SavedOreUICustomizerConfig_Type }): JSX.Element {
            const ref: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
            return (
                <TextBox
                    inputRef={ref}
                    inputProperties={{
                        "data-config-key": "maxTextLengthOverride",
                        type: "number",
                        inputMode: "numeric",
                    }}
                    label="Max Text Length Override"
                    description="This will override the max text length."
                    onInput={(event: JSX.TargetedInputEvent<HTMLInputElement>): void => {
                        if (/^(?:[-+]?[0-9]+)?$/.test(event.currentTarget.value)) {
                            event.currentTarget.style.color = "";
                        } else {
                            event.currentTarget.style.color = "red";
                        }
                    }}
                    onChange={function onChange(this: HTMLInputElement): void {
                        if (/^(?:[-+]?[0-9]+)?$/.test(this.value)) {
                            props.config.oreUICustomizerConfig.maxTextLengthOverride = this.value as `${number}` | "";
                        }
                    }}
                    placeholder={defaultOreUICustomizerSettings.maxTextLengthOverride}
                    value={props.config.oreUICustomizerConfig.maxTextLengthOverride ?? defaultOreUICustomizerSettings.maxTextLengthOverride}
                />
            );
        },
    },
] as const satisfies {
    [key in keyof Omit<
        OreUICustomizerSettings,
        | "activePluginsDetails"
        | "bundleEncodedPluginDataInConfigFile"
        | "colorReplacements"
        | "advancedColorReplacements"
        | "enabledBuiltInPlugins"
        | "plugins"
        | "preloadedPlugins"
    >]: {
        key: key;
        hidden?: boolean;
        component(props: { config: SavedOreUICustomizerConfig_Type }): JSX.Element;
    };
}[keyof Omit<
    OreUICustomizerSettings,
    | "activePluginsDetails"
    | "bundleEncodedPluginDataInConfigFile"
    | "colorReplacements"
    | "advancedColorReplacements"
    | "enabledBuiltInPlugins"
    | "plugins"
    | "preloadedPlugins"
>][];

{
    /**
     * This is to generate an error if an option is missing from the general section.
     *
     * @internal
     */
    const _validateGeneralSectionOptions: (typeof generalSectionOptions)[number]["key"] = undefined! as keyof Omit<
        OreUICustomizerSettings,
        | "activePluginsDetails"
        | "bundleEncodedPluginDataInConfigFile"
        | "colorReplacements"
        | "advancedColorReplacements"
        | "enabledBuiltInPlugins"
        | "plugins"
        | "preloadedPlugins"
    >;
}

const colorReplacements = {
    green10: {
        defaultColor: "#a0e081",
        configColorReplacementsKey: "#a0e081",
    },
    green20: {
        defaultColor: "#86d562",
        configColorReplacementsKey: "#86d562",
    },
    green30: {
        defaultColor: "#6cc349",
        configColorReplacementsKey: "#6cc349",
    },
    green40: {
        defaultColor: "#52a535",
        configColorReplacementsKey: "#52a535",
    },
    green50: {
        defaultColor: "#3c8527",
        configColorReplacementsKey: "#3c8527",
    },
    green60: {
        defaultColor: "#2a641c",
        configColorReplacementsKey: "#2a641c",
    },
    green70: {
        defaultColor: "#1d4d13",
        configColorReplacementsKey: "#1d4d13",
    },
    green80: {
        defaultColor: "#153a0e",
        configColorReplacementsKey: "#153a0e",
    },
    green90: {
        defaultColor: "#112f0b",
        configColorReplacementsKey: "#112f0b",
    },
    green100: {
        defaultColor: "#0f2b0a",
        configColorReplacementsKey: "#0f2b0a",
    },
    white: {
        defaultColor: "#ffffff",
        configColorReplacementsKey: "#ffffff",
    },
    black: {
        defaultColor: "#000000",
        configColorReplacementsKey: "#000000",
    },
    gray10: {
        defaultColor: "#f4f6f9",
        configColorReplacementsKey: "#f4f6f9",
    },
    gray20: {
        defaultColor: "#e6e8eb",
        configColorReplacementsKey: "#e6e8eb",
    },
    gray30: {
        defaultColor: "#d0d1d4",
        configColorReplacementsKey: "#d0d1d4",
    },
    gray40: {
        defaultColor: "#b1b2b5",
        configColorReplacementsKey: "#b1b2b5",
    },
    gray50: {
        defaultColor: "#8c8d90",
        configColorReplacementsKey: "#8c8d90",
    },
    gray60: {
        defaultColor: "#58585a",
        configColorReplacementsKey: "#58585a",
    },
    gray70: {
        defaultColor: "#48494a",
        configColorReplacementsKey: "#48494a",
    },
    gray80: {
        defaultColor: "#313233",
        configColorReplacementsKey: "#313233",
    },
    gray90: {
        defaultColor: "#242425",
        configColorReplacementsKey: "#242425",
    },
    gray100: {
        defaultColor: "#1e1e1f",
        configColorReplacementsKey: "#1e1e1f",
    },
    red10: {
        defaultColor: "#ff8080",
        configColorReplacementsKey: "#ff8080",
    },
    red20: {
        defaultColor: "#d93636",
        configColorReplacementsKey: "#d93636",
    },
    red30: {
        defaultColor: "#b31b1b",
        configColorReplacementsKey: "#b31b1b",
    },
    red40: {
        defaultColor: "#d54242",
        configColorReplacementsKey: "#d54242",
    },
    red50: {
        defaultColor: "#ca3636",
        configColorReplacementsKey: "#ca3636",
    },
    red60: {
        defaultColor: "#c02d2d",
        configColorReplacementsKey: "#c02d2d",
    },
    red70: {
        defaultColor: "#b62525",
        configColorReplacementsKey: "#b62525",
    },
    red80: {
        defaultColor: "#ad1d1d",
        configColorReplacementsKey: "#ad1d1d",
    },
    red90: {
        defaultColor: "#a31616",
        configColorReplacementsKey: "#a31616",
    },
    red100: {
        defaultColor: "#990f0f",
        configColorReplacementsKey: "#990f0f",
    },
    orange10: {
        defaultColor: "#ffb366",
        configColorReplacementsKey: "#ffb366",
    },
    orange20: {
        defaultColor: "#d3791f",
        configColorReplacementsKey: "#d3791f",
    },
    orange30: {
        defaultColor: "#a65b11",
        configColorReplacementsKey: "#a65b11",
    },
    yellow10: {
        defaultColor: "#ffe866",
        configColorReplacementsKey: "#ffe866",
    },
    yellow20: {
        defaultColor: "#e5c317",
        configColorReplacementsKey: "#e5c317",
    },
    yellow30: {
        defaultColor: "#8a7500",
        configColorReplacementsKey: "#8a7500",
    },
    gold10: {
        defaultColor: "#fff0c5",
        configColorReplacementsKey: "#fff0c5",
    },
    gold20: {
        defaultColor: "#ffd783",
        configColorReplacementsKey: "#ffd783",
    },
    gold30: {
        defaultColor: "#f8af2b",
        configColorReplacementsKey: "#f8af2b",
    },
    gold40: {
        defaultColor: "#ce8706",
        configColorReplacementsKey: "#ce8706",
    },
    gold50: {
        defaultColor: "#ae7100",
        configColorReplacementsKey: "#ae7100",
    },
    blue10: {
        defaultColor: "#8cb3ff",
        configColorReplacementsKey: "#8cb3ff",
    },
    blue20: {
        defaultColor: "#2e6be5",
        configColorReplacementsKey: "#2e6be5",
    },
    blue30: {
        defaultColor: "#1452cc",
        configColorReplacementsKey: "#1452cc",
    },
    blackOpacity10: {
        defaultColor: "rgba(0, 0, 0, 0.1)",
        configColorReplacementsKey: "rgba(0, 0, 0, 0.1)",
    },
    blackOpacity20: {
        defaultColor: "rgba(0, 0, 0, 0.2)",
        configColorReplacementsKey: "rgba(0, 0, 0, 0.2)",
    },
    blackOpacity25: {
        defaultColor: "rgba(0, 0, 0, 0.25)",
        configColorReplacementsKey: "rgba(0, 0, 0, 0.25)",
    },
    blackOpacity30: {
        defaultColor: "rgba(0, 0, 0, 0.3)",
        configColorReplacementsKey: "rgba(0, 0, 0, 0.3)",
    },
    blackOpacity40: {
        defaultColor: "rgba(0, 0, 0, 0.4)",
        configColorReplacementsKey: "rgba(0, 0, 0, 0.4)",
    },
    blackOpacity50: {
        defaultColor: "rgba(0, 0, 0, 0.5)",
        configColorReplacementsKey: "rgba(0, 0, 0, 0.5)",
    },
    blackOpacity60: {
        defaultColor: "rgba(0, 0, 0, 0.6)",
        configColorReplacementsKey: "rgba(0, 0, 0, 0.6)",
    },
    blackOpacity70: {
        defaultColor: "rgba(0, 0, 0, 0.7)",
        configColorReplacementsKey: "rgba(0, 0, 0, 0.7)",
    },
    blackOpacity80: {
        defaultColor: "rgba(0, 0, 0, 0.8)",
        configColorReplacementsKey: "rgba(0, 0, 0, 0.8)",
    },
    blackOpacity90: {
        defaultColor: "rgba(0, 0, 0, 0.9)",
        configColorReplacementsKey: "rgba(0, 0, 0, 0.9)",
    },
    blackOpacity100: {
        defaultColor: "rgba(0, 0, 0, 1)",
        configColorReplacementsKey: "rgba(0, 0, 0, 1)",
    },
    whiteOpacity10: {
        defaultColor: "rgba(255, 255, 255, 0.1)",
        configColorReplacementsKey: "rgba(255, 255, 255, 0.1)",
    },
    whiteOpacity20: {
        defaultColor: "rgba(255, 255, 255, 0.2)",
        configColorReplacementsKey: "rgba(255, 255, 255, 0.2)",
    },
    whiteOpacity30: {
        defaultColor: "rgba(255, 255, 255, 0.3)",
        configColorReplacementsKey: "rgba(255, 255, 255, 0.3)",
    },
    whiteOpacity40: {
        defaultColor: "rgba(255, 255, 255, 0.4)",
        configColorReplacementsKey: "rgba(255, 255, 255, 0.4)",
    },
    whiteOpacity50: {
        defaultColor: "rgba(255, 255, 255, 0.5)",
        configColorReplacementsKey: "rgba(255, 255, 255, 0.5)",
    },
    whiteOpacity60: {
        defaultColor: "rgba(255, 255, 255, 0.6)",
        configColorReplacementsKey: "rgba(255, 255, 255, 0.6)",
    },
    whiteOpacity70: {
        defaultColor: "rgba(255, 255, 255, 0.7)",
        configColorReplacementsKey: "rgba(255, 255, 255, 0.7)",
    },
    whiteOpacity80: {
        defaultColor: "rgba(255, 255, 255, 0.8)",
        configColorReplacementsKey: "rgba(255, 255, 255, 0.8)",
    },
    whiteOpacity90: {
        defaultColor: "rgba(255, 255, 255, 0.9)",
        configColorReplacementsKey: "rgba(255, 255, 255, 0.9)",
    },
    pink10: {
        defaultColor: "#FB95E2",
        configColorReplacementsKey: "#FB95E2",
    },
    pink20: {
        defaultColor: "#FFB1EC",
        configColorReplacementsKey: "#FFB1EC",
    },
    pink30: {
        defaultColor: "#E833C2",
        configColorReplacementsKey: "#E833C2",
    },
    pink40: {
        defaultColor: "#F877DC",
        configColorReplacementsKey: "#F877DC",
    },
    purple40: {
        defaultColor: "#643ACB",
        configColorReplacementsKey: "#643ACB",
    },
    deepBlue10: {
        defaultColor: "#AC90F3",
        configColorReplacementsKey: "#AC90F3",
    },
    deepBlue20: {
        defaultColor: "#9471E0",
        configColorReplacementsKey: "#9471E0",
    },
    deepBlue40: {
        defaultColor: "#8557F8",
        configColorReplacementsKey: "#8557F8",
    },
    deepBlue50: {
        defaultColor: "#7345E5",
        configColorReplacementsKey: "#7345E5",
    },
    deepBlue60: {
        defaultColor: "#5D2CC6",
        configColorReplacementsKey: "#5D2CC6",
    },
    deepBlue70: {
        defaultColor: "#4A1CAC",
        configColorReplacementsKey: "#4A1CAC",
    },
    deepBlue100: {
        defaultColor: "#050029",
        configColorReplacementsKey: "#050029",
    },
    deepBlueOpacity50: {
        defaultColor: "rgba(5, 0, 41, 0.5)",
        configColorReplacementsKey: "rgba(5, 0, 41, 0.5)",
    },
} as const satisfies {
    [key in keyof OreUICustomizerSettings["colorReplacements"] as string]: {
        defaultColor: string;
        configColorReplacementsKey: key;
    };
};

const advancedColorReplacements = {
    menusTheme: {
        ".menus": {
            colorsPrimary: {
                defaultColor: "#3c8527",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "colorsPrimary",
            },
            colorsSecondary: {
                defaultColor: "#d0d1d4",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "colorsSecondary",
            },
            colorsDestructive: {
                defaultColor: "#ca3636",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "colorsDestructive",
            },
            colorsText: {
                defaultColor: "#ffffff",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "colorsText",
            },
            colorsMuted0: {
                defaultColor: "#d0d1d4",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "colorsMuted0",
            },
            colorsMuted1: {
                defaultColor: "#b1b2b5",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "colorsMuted1",
            },
            colorsDisabled: {
                defaultColor: "#d0d1d4",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "colorsDisabled",
            },
            baseTextFieldColor: {
                defaultColor: "#ffffff",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "baseTextFieldColor",
            },
            baseTextFieldPlaceholderColor: {
                defaultColor: "#b1b2b5",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "baseTextFieldPlaceholderColor",
            },
            baseTextFieldDisabledColor: {
                defaultColor: "#58585a",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "baseTextFieldDisabledColor",
            },
            baseTextFieldCaretColor: {
                defaultColor: "#6cc349",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "baseTextFieldCaretColor",
            },
            inputFieldPlaceholderUnderlineColor: {
                defaultColor: "#ffffff",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "inputFieldPlaceholderUnderlineColor",
            },
            inputLegendWrapperBackgroundColor: {
                defaultColor: "#1e1e1f",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "inputLegendWrapperBackgroundColor",
            },
            inputLegendWrapperBorderTopColor: {
                defaultColor: "rgba(255, 255, 255, 0.2)",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "inputLegendWrapperBorderTopColor",
            },
            inputLegendInputHintColor: {
                defaultColor: "#fff",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "inputLegendInputHintColor",
            },
            buttonIconKeyboardTextColor: {
                defaultColor: "#313233",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus",
                configColorReplacementsKey3: "buttonIconKeyboardTextColor",
            },
        },
        ".menus.realms": {
            colorsPrimary: {
                defaultColor: "#7345e5",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus.realms",
                configColorReplacementsKey3: "colorsPrimary",
            },
        },
        ".menus.neutral90": {
            baseTextFieldColor: {
                defaultColor: "#ffffff",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus.neutral90",
                configColorReplacementsKey3: "baseTextFieldColor",
            },
            baseTextFieldPlaceholderColor: {
                defaultColor: "#b1b2b5",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus.neutral90",
                configColorReplacementsKey3: "baseTextFieldPlaceholderColor",
            },
            baseTextFieldColorDisabled: {
                defaultColor: "#58585a",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus.neutral90",
                configColorReplacementsKey3: "baseTextFieldColorDisabled",
            },
            baseTextFieldPlaceholderColorDisabled: {
                defaultColor: "#58585a",
                configColorReplacementsKey: "menusTheme",
                configColorReplacementsKey2: ".menus.neutral90",
                configColorReplacementsKey3: "baseTextFieldPlaceholderColorDisabled",
            },
        },
    },
    custom: {
        ".vanilla-neutral-text,.vanilla-neutral-text-interactive": {
            color: {
                defaultColor: "#ffffff",
                configColorReplacementsKey: "custom",
                configColorReplacementsKey2: ".vanilla-neutral-text,.vanilla-neutral-text-interactive",
                configColorReplacementsKey3: "color",
            },
        },
        ".vanilla-neutral-text.dimmer,.vanilla-neutral-text-interactive.dimmer": {
            color: {
                defaultColor: "#d0d1d4",
                configColorReplacementsKey: "custom",
                configColorReplacementsKey2: ".vanilla-neutral-text.dimmer,.vanilla-neutral-text-interactive.dimmer",
                configColorReplacementsKey3: "color",
            },
        },
        ".vanilla-neutral-text.dimmest,.vanilla-neutral-text-interactive.dimmest": {
            color: {
                defaultColor: "#b1b2b5",
                configColorReplacementsKey: "custom",
                configColorReplacementsKey2: ".vanilla-neutral-text.dimmest,.vanilla-neutral-text-interactive.dimmest",
                configColorReplacementsKey3: "color",
            },
        },
        ".realms-neutral80-text,.realms-neutral80-text-interactive": {
            color: {
                defaultColor: "#ffffff",
                configColorReplacementsKey: "custom",
                configColorReplacementsKey2: ".realms-neutral80-text,.realms-neutral80-text-interactive",
                configColorReplacementsKey3: "color",
            },
        },
        ".realms-neutral80-text.dimmer,.realms-neutral80-text-interactive.dimmer": {
            color: {
                defaultColor: "#d0d1d4",
                configColorReplacementsKey: "custom",
                configColorReplacementsKey2: ".realms-neutral80-text.dimmer,.realms-neutral80-text-interactive.dimmer",
                configColorReplacementsKey3: "color",
            },
        },
        ".realms-neutral80-text.dimmest,.realms-neutral80-text-interactive.dimmest": {
            color: {
                defaultColor: "#b1b2b5",
                configColorReplacementsKey: "custom",
                configColorReplacementsKey2: ".realms-neutral80-text.dimmest,.realms-neutral80-text-interactive.dimmest",
                configColorReplacementsKey3: "color",
            },
        },
        ".realms-neutral-text,.realms-neutral-text-interactive": {
            color: {
                defaultColor: "#ffffff",
                configColorReplacementsKey: "custom",
                configColorReplacementsKey2: ".realms-neutral-text,.realms-neutral-text-interactive",
                configColorReplacementsKey3: "color",
            },
        },
        ".realms-neutral-text.dimmer,.realms-neutral-text-interactive.dimmer": {
            color: {
                defaultColor: "#d0d1d4",
                configColorReplacementsKey: "custom",
                configColorReplacementsKey2: ".realms-neutral-text.dimmer,.realms-neutral-text-interactive.dimmer",
                configColorReplacementsKey3: "color",
            },
        },
        ".realms-neutral-text.dimmest,.realms-neutral-text-interactive.dimmest": {
            color: {
                defaultColor: "#b1b2b5",
                configColorReplacementsKey: "custom",
                configColorReplacementsKey2: ".realms-neutral-text.dimmest,.realms-neutral-text-interactive.dimmest",
                configColorReplacementsKey3: "color",
            },
        },
    },
} as const satisfies {
    [key in keyof Full<NonNullable<OreUICustomizerSettings["advancedColorReplacements"]>>]: {
        [key2 in keyof Full<NonNullable<NonNullable<OreUICustomizerSettings["advancedColorReplacements"]>[key]>>]: {
            [key3 in keyof Full<NonNullable<NonNullable<NonNullable<OreUICustomizerSettings["advancedColorReplacements"]>[key]>[key2]>>]: {
                defaultColor: string;
                configColorReplacementsKey: key;
                configColorReplacementsKey2: key2;
                configColorReplacementsKey3: key3;
            };
        };
    };
};
export default function ConfigEditorPage(): JSX.SpecificElement<"center"> {
    const oreUIPreviews: OreUIPreview[] = [];
    const sectionRefs = {
        generalSectionRef: useRef<HTMLDivElement>(null),
        colorsSectionRef: useRef<HTMLDivElement>(null),
        metadataSectionRef: useRef<HTMLDivElement>(null),
        rawConfigSectionRef: useRef<HTMLDivElement>(null),
    };
    const metadataSectionInputRefs = {
        name: useRef<HTMLInputElement>(null),
        icon: useRef<HTMLInputElement>(null),
        authors: useRef<HTMLInputElement>(null),
        version: useRef<HTMLInputElement>(null),
        description: useRef<HTMLTextAreaElement>(null),
        license: useRef<HTMLInputElement>(null),
        url: useRef<HTMLInputElement>(null),
        id: useRef<HTMLInputElement>(null),
        uuid: useRef<HTMLInputElement>(null),
        checkForUpdatesDetails: {
            enabled: useRef<HTMLInputElement>(null),
            url: useRef<HTMLInputElement>(null),
        },
        marketplaceDetails: {
            enabled: useRef<HTMLInputElement>(null),
            marketplaceID: useRef<HTMLInputElement>(null),
            originalDownloadURL: useRef<HTMLInputElement>(null),
            url: useRef<HTMLInputElement>(null),
        },
    } as const;
    const metadataSectionInputChangeCallbacks = {
        name(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
            config!.metadata.name = event.currentTarget.value;
        },
        icon(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
            if (event.currentTarget.value) {
                config!.metadata.pack_icon_data_uri = event.currentTarget.value as any;
            } else {
                delete config!.metadata.pack_icon_data_uri;
            }
        },
        authors(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
            if (event.currentTarget.value) {
                try {
                    const authors: string[] = JSON.parse(event.currentTarget.value) as string[];
                    if (authors instanceof Array && authors.every((author: string): author is string => typeof author === "string")) {
                        config!.metadata.authors = authors;
                    }
                } catch {}
            } else {
                delete config!.metadata.authors;
            }
        },
        version(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
            if (semver.valid(event.currentTarget.value)) {
                config!.metadata.version = event.currentTarget.value;
            }
        },
        description(event: JSX.TargetedInputEvent<HTMLTextAreaElement>): void {
            if (event.currentTarget.value) {
                config!.metadata.description = event.currentTarget.value;
            } else {
                delete config!.metadata.description;
            }
        },
        license(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
            if (event.currentTarget.value) {
                config!.metadata.license = event.currentTarget.value;
            } else {
                delete config!.metadata.license;
            }
        },
        url(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
            if (event.currentTarget.value) {
                config!.metadata.url = event.currentTarget.value;
            } else {
                delete config!.metadata.url;
            }
        },
        id(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
            if (event.currentTarget.value) {
                config!.metadata.id = event.currentTarget.value;
            } else {
                delete config!.metadata.id;
            }
        },
        uuid(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
            config!.metadata.uuid = event.currentTarget.value;
        },
        checkForUpdatesDetails: {
            enabled(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
                if (event.currentTarget.checked) {
                    config!.checkForUpdatesDetails = {
                        versionInfoURL: "",
                    };
                    metadataSectionInputRefs.checkForUpdatesDetails.url.current!.disabled = false;
                } else {
                    delete config!.checkForUpdatesDetails;
                    metadataSectionInputRefs.checkForUpdatesDetails.url.current!.value = "";
                    metadataSectionInputRefs.checkForUpdatesDetails.url.current!.disabled = true;
                }
            },
            url(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
                config!.checkForUpdatesDetails!.versionInfoURL = event.currentTarget.value;
            },
        },
        marketplaceDetails: {
            enabled(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
                if (event.currentTarget.checked) {
                    config!.marketplaceDetails = {
                        marketplaceId: "",
                        originalDownloadURL: "",
                        marketplaceURL: "",
                    };
                    metadataSectionInputRefs.marketplaceDetails.marketplaceID.current!.disabled = false;
                    metadataSectionInputRefs.marketplaceDetails.originalDownloadURL.current!.disabled = false;
                    metadataSectionInputRefs.marketplaceDetails.url.current!.disabled = false;
                } else {
                    delete config!.marketplaceDetails;
                    metadataSectionInputRefs.marketplaceDetails.marketplaceID.current!.value = "";
                    metadataSectionInputRefs.marketplaceDetails.originalDownloadURL.current!.value = "";
                    metadataSectionInputRefs.marketplaceDetails.url.current!.value = "";
                    metadataSectionInputRefs.marketplaceDetails.marketplaceID.current!.disabled = true;
                    metadataSectionInputRefs.marketplaceDetails.originalDownloadURL.current!.disabled = true;
                    metadataSectionInputRefs.marketplaceDetails.url.current!.disabled = true;
                }
            },
            marketplaceID(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
                config!.marketplaceDetails!.marketplaceId = event.currentTarget.value;
            },
            originalDownloadURL(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
                config!.marketplaceDetails!.originalDownloadURL = event.currentTarget.value;
            },
            url(event: JSX.TargetedInputEvent<HTMLInputElement>): void {
                config!.marketplaceDetails!.marketplaceURL = event.currentTarget.value;
            },
        },
    } as const satisfies {
        [key in keyof typeof metadataSectionInputRefs]: (typeof metadataSectionInputRefs)[key] extends RefObject<infer T extends EventTarget> ?
            (event: JSX.TargetedInputEvent<T>) => void
        :   {
                [key2 in keyof (typeof metadataSectionInputRefs)[key]]: (event: JSX.TargetedInputEvent<HTMLInputElement>) => void;
            };
    };
    const configPath: string | null = router.history.location.searchParams.get("configPath");
    const configID: string | null = router.history.location.searchParams.get("configId");
    const configVersion: string | null = router.history.location.searchParams.get("configVersion");
    if (!configPath && (!configID || !configVersion)) return <h1>No config selected.</h1>;
    const config: OreUICustomizerConfig | undefined =
        configPath ?
            ConfigManager.loadedConfigs.find((config: OreUICustomizerConfig): boolean => config.filePath === configPath)
        :   ConfigManager.loadedConfigs.find(
                (config: OreUICustomizerConfig): boolean => config.metadata.uuid === configID && config.metadata.version === configVersion
            );
    if (!config) return <h1>Config not found.</h1>;
    function GeneralSectionOptions(): JSX.Element {
        return (
            <>
                {...generalSectionOptions.map((option: (typeof generalSectionOptions)[number]): JSX.Element | null => {
                    if ("hidden" in option && option.hidden) {
                        return null;
                    } else {
                        return option.component({ config: config! });
                    }
                })}
            </>
        );
    }
    function ColorsSectionOptions(): JSX.Element {
        const colorsSectionRef: RefObject<HTMLFormElement> = useRef<HTMLFormElement>(null);
        useEffect((): void => {
            $(colorsSectionRef.current!)
                .find<HTMLInputElement>(".spectrum-colorpicker-color-override-option")
                .each(
                    (i: number, element: HTMLInputElement): void =>
                        void $(element).spectrum({
                            allowEmpty: true,
                            noColorSelectedText: "Do not replace color.",
                            preferredFormat:
                                /^#([0-9a-fA-F]{3}){1,2}$/.test(element.value!) ? "hex"
                                : /^#([0-9a-fA-F]{4}){1,2}$/.test(element.value!) ? "hex8"
                                : /^hsl/.test(element.value!) ? "hsl"
                                : /^hsv/.test(element.value!) ? "hsl"
                                : /^rgb/.test(element.value!) ? "rgb"
                                : /^hsb/.test(element.value!) ? "hsb"
                                : ((element.getAttribute("format") as "rgb" | undefined) ?? "rgb"),
                            beforeShow: (color: tinycolor.Instance, element: HTMLElement): void => {
                                try {
                                    $(".sp-picker-container select").val(color?.getFormat());
                                } catch (e) {
                                    console.error(e, (e as any)?.stack);
                                }
                                currentColorPickerTarget = element;
                            },
                            showAlpha: true,
                            showInitial: true,
                            showInput: true,
                            showPalette: true,
                            showSelectionPalette: true,
                            localStorageKey: "ore-ui-customizer",
                            change(_color: tinycolor.Instance): void {
                                config!.oreUICustomizerConfig.colorReplacements ??= { ...defaultOreUICustomizerSettings.colorReplacements };
                                config!.oreUICustomizerConfig.advancedColorReplacements ??= { ...defaultOreUICustomizerSettings.advancedColorReplacements };
                                if (element.getAttribute("data-isAdvancedConfigColorReplacementsKey")) {
                                    // type T1 = typeof advancedColorReplacements;
                                    // type T2 = T1[keyof T1];
                                    // type T3 = T2[keyof T2];
                                    // type T4 = UnionToIntersection<T3>[KeysOfUnion<T3>];
                                    type TB1 = NonNullable<OreUICustomizerConfig["oreUICustomizerConfig"]["advancedColorReplacements"]>;
                                    type TB2 = NonNullable<TB1[keyof TB1]>;
                                    type TB2B = UnionToIntersection<TB2>;
                                    type TB3 = NonNullable<TB2B[keyof TB2B]>;
                                    type TB3B = UnionToIntersection<TB3>;
                                    type TB4 = NonNullable<TB3B[keyof TB3B]>;
                                    ((
                                        ((
                                            (config!.oreUICustomizerConfig.advancedColorReplacements![
                                                element.getAttribute("data-configColorReplacementsKey")! as keyof NonNullable<
                                                    OreUICustomizerConfig["oreUICustomizerConfig"]["advancedColorReplacements"]
                                                >
                                            ]! ??= {}) as TB2B
                                        )[element.getAttribute("data-configColorReplacementsKey2")! as keyof TB2B]! ??= {}) as TB3B
                                    )[element.getAttribute("data-configColorReplacementsKey3")! as keyof TB3B] as TB4) = element.value;
                                    oreUIPreviews.forEach((preview: OreUIPreview): void => void preview.window?.reload());
                                    return;
                                }
                                config!.oreUICustomizerConfig.colorReplacements![
                                    element.getAttribute(
                                        "data-configColorReplacementsKey"
                                    )! as (typeof colorReplacements)[keyof typeof colorReplacements]["configColorReplacementsKey"]
                                ] = element.value;
                                oreUIPreviews.forEach((preview: OreUIPreview): void => void preview.window?.reload());
                            },
                        })
                );
        });
        const resolvedConfig: OreUICustomizerSettings = resolveOreUICustomizerSettings(config!.oreUICustomizerConfig);
        return (
            <>
                <center>
                    <h1>Color Replacements Options</h1>
                </center>
                <p>
                    <a
                        href="https://www.youtube.com/@TheOctazen/featured"
                        target="_blank"
                        class="ndrg"
                        onClick={(event: JSX.TargetedMouseEvent<HTMLAnchorElement>): void => {
                            event.preventDefault();
                            event.currentTarget.blur();
                            shell.openExternal(event.currentTarget.href);
                        }}
                    >
                        The Octazen
                    </a>{" "}
                    has made a guide to help with color customizations, you can see it here:{" "}
                    <a
                        href="https://bgdocs.netlify.app/#/ore_ui_colors/home"
                        target="_blank"
                        class="ndrg"
                        onClick={(event: JSX.TargetedMouseEvent<HTMLAnchorElement>): void => {
                            event.preventDefault();
                            event.currentTarget.blur();
                            shell.openExternal(event.currentTarget.href);
                        }}
                    >
                        https://bgdocs.netlify.app/#/ore_ui_colors/home
                    </a>
                </p>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <button
                        type="button"
                        class="btn nsel"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            event.preventDefault();
                            event.currentTarget.blur();
                            if (event.currentTarget.disabled) return;
                            SoundEffects.popB();
                        }}
                        onClick={(_event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            try {
                                const port: number | undefined = OreUIPreviewManager.getNextPort();
                                if (port === undefined) {
                                    dialog.showMessageBox({
                                        type: "error",
                                        title: "No Ports Available",
                                        message: "There are no ports available for the Ore UI Preview.",
                                        buttons: ["Okay"],
                                        noLink: true,
                                    });
                                    return;
                                }
                                const versionFolder = globalThis.config.defaultPreviewVersionFolder;
                                if (versionFolder === null) {
                                    // TODO: This should show the option to select a version folder.
                                    dialog.showMessageBox({
                                        type: "error",
                                        title: "No Default Preview Version Folder",
                                        message: "There is no defualt version folder configured for the Ore UI Preview. Please set one in settings.",
                                        buttons: ["Okay"],
                                        noLink: true,
                                    });
                                    return;
                                }
                                // TEMP: Remove this once support is implemented.
                                if (versionFolder.type === "isolated") {
                                    dialog.showMessageBox({
                                        type: "error",
                                        title: "Not Implemented Yet",
                                        message: "Support for isolated preview version folders is not implemented yet.",
                                        buttons: ["Okay"],
                                        noLink: true,
                                    });
                                    return;
                                }
                                if (!existsSync(versionFolder.path)) {
                                    dialog.showMessageBox({
                                        type: "error",
                                        title: "Version Folder Not Found",
                                        message: "The configured version folder for the Ore UI Preview does not exist.",
                                        buttons: ["Okay"],
                                        noLink: true,
                                    });
                                    return;
                                }
                                const resolvedVersionFolder: VersionFolder = new VersionFolder(versionFolder.path);
                                let useBackup = false;
                                checkShouldUseBackup: switch (globalThis.config.defaultPreviewVersionFolder_useBackup) {
                                    case "never":
                                        break;
                                    case "always":
                                        useBackup = true;
                                        break;
                                    case "if_ouic_installed": {
                                        const installationStatus = resolvedVersionFolder.installationStatus;
                                        switch (installationStatus) {
                                            case "Not Installed":
                                                useBackup = false;
                                                break checkShouldUseBackup;
                                            case "Installed":
                                            case "Partially Failed Installation":
                                            case "Installing":
                                            case "Uninstalling":
                                            case "Corrupted (By Minecraft Update) (Backup Available)":
                                            case "Corrupted (By Minecraft Update)":
                                            case "Missing (Backup Available)":
                                            case "Unknown (Backup Available)":
                                            case "Unknown":
                                                useBackup = true;
                                                break checkShouldUseBackup;
                                            default:
                                                throw new Error(`Unknown installation status: ${installationStatus}`);
                                        }
                                    }
                                }
                                const guiFolderPath: string =
                                    useBackup ?
                                        (resolvedVersionFolder.getBackupFolderPath() ?? resolvedVersionFolder.guiFolderPath)
                                    :   resolvedVersionFolder.guiFolderPath;
                                const dataFolderSubpath = resolvedVersionFolder.getDataFolderSubpath();
                                const resourcePacksPath: string | undefined =
                                    dataFolderSubpath && path.join(resolvedVersionFolder.path, dataFolderSubpath, "resource_packs");
                                const resourcePacksPathExists: boolean = !!resourcePacksPath && existsSync(resourcePacksPath);
                                oreUIPreviews.push(
                                    OreUIPreviewManager.createPreview(
                                        port,
                                        // {
                                        //     guiDistPath: String.raw`C:\Users\ander\AppData\Roaming\levilauncher.exe\versions\1.26.42.01\data\gui\dist`,
                                        //     vanillaResourcePacksContainerFolderPath: String.raw`C:\Users\ander\AppData\Roaming\levilauncher.exe\versions\1.26.42.01\data\resource_packs`,
                                        //     textsPath: String.raw`C:\Users\ander\AppData\Roaming\levilauncher.exe\versions\1.26.42.01\data\resource_packs`,
                                        // },
                                        {
                                            guiDistPath: path.join(guiFolderPath, "dist"),
                                            vanillaResourcePacksContainerFolderPath: resourcePacksPathExists ? resourcePacksPath : undefined,
                                            textsPath: resourcePacksPathExists ? resourcePacksPath : undefined,
                                        },
                                        {
                                            /* pathname: "/vanilla/achievements"  */
                                        },
                                        {
                                            hbuiUIFileEntryProxy(fileContents, filePath, _req, _res) {
                                                if (
                                                    !/^\/hbui\/(?:index|gameplay|editor(?:-menu|-project)?)-[a-zA-Z0-9]+\.(?:js|css)$/.test(filePath) &&
                                                    !/^\/hbui\/(?:index|gameplay|editor(?:-menu|-project)?).html$/.test(filePath) &&
                                                    !/^\/hbui\/(?:menus|gameplay)-theme-[a-zA-Z0-9]+\.css$/.test(filePath)
                                                )
                                                    return null;
                                                return applyColorReplacementsToFileContents(fileContents, filePath, {
                                                    ...config!.oreUICustomizerConfig,
                                                    colorReplacements: config!.oreUICustomizerConfig.colorReplacements ?? {},
                                                });
                                            },
                                        }
                                    )
                                );
                            } catch (e) {
                                console.error(e);
                                dialog.showMessageBox({
                                    type: "error",
                                    title: "Error",
                                    message: "An error occurred while starting the Ore UI Preview.",
                                    detail: String(e),
                                    buttons: ["Okay"],
                                    noLink: true,
                                });
                            }
                        }}
                    >
                        Show Preview
                    </button>
                    <button
                        type="button"
                        class="btn nsel"
                        title="Select version"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            event.preventDefault();
                            event.currentTarget.blur();
                            if (event.currentTarget.disabled) return;
                            SoundEffects.popB();
                        }}
                        onClick={(_event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            try {
                                const port: number | undefined = OreUIPreviewManager.getNextPort();
                                if (port === undefined) {
                                    dialog.showMessageBox({
                                        type: "error",
                                        title: "No Ports Available",
                                        message: "There are no ports available for the Ore UI Preview.",
                                        buttons: ["Okay"],
                                        noLink: true,
                                    });
                                    return;
                                }
                                // TODO: Add a way to select isolated version folders, and options for selecting folders manually via the folder picker dialog, and one to select the 3 individual folders rather than the version folder.
                                showSelectVersionFolderOverlayPage({
                                    onSelected(versionFolder: VersionFolder): void {
                                        try {
                                            if (!existsSync(versionFolder.path)) {
                                                dialog.showMessageBox({
                                                    type: "error",
                                                    title: "Version Folder Not Found",
                                                    message: "The configured version folder for the Ore UI Preview does not exist.",
                                                    buttons: ["Okay"],
                                                    noLink: true,
                                                });
                                                return;
                                            }
                                            const resolvedVersionFolder: VersionFolder = new VersionFolder(versionFolder.path);
                                            let useBackup = false;
                                            // TODO: This option should be able to be specified in a prompt.
                                            checkShouldUseBackup: switch (globalThis.config.defaultPreviewVersionFolder_useBackup) {
                                                case "never":
                                                    break;
                                                case "always":
                                                    useBackup = true;
                                                    break;
                                                case "if_ouic_installed": {
                                                    const installationStatus = resolvedVersionFolder.installationStatus;
                                                    switch (installationStatus) {
                                                        case "Not Installed":
                                                            useBackup = false;
                                                            break checkShouldUseBackup;
                                                        case "Installed":
                                                        case "Partially Failed Installation":
                                                        case "Installing":
                                                        case "Uninstalling":
                                                        case "Corrupted (By Minecraft Update) (Backup Available)":
                                                        case "Corrupted (By Minecraft Update)":
                                                        case "Missing (Backup Available)":
                                                        case "Unknown (Backup Available)":
                                                        case "Unknown":
                                                            useBackup = true;
                                                            break checkShouldUseBackup;
                                                        default:
                                                            throw new Error(`Unknown installation status: ${installationStatus}`);
                                                    }
                                                }
                                            }
                                            const guiFolderPath: string =
                                                useBackup ?
                                                    (resolvedVersionFolder.getBackupFolderPath() ?? resolvedVersionFolder.guiFolderPath)
                                                :   resolvedVersionFolder.guiFolderPath;
                                            const dataFolderSubpath = resolvedVersionFolder.getDataFolderSubpath();
                                            const resourcePacksPath: string | undefined =
                                                dataFolderSubpath && path.join(resolvedVersionFolder.path, dataFolderSubpath, "resource_packs");
                                            const resourcePacksPathExists: boolean = !!resourcePacksPath && existsSync(resourcePacksPath);
                                            oreUIPreviews.push(
                                                OreUIPreviewManager.createPreview(
                                                    port,
                                                    // {
                                                    //     guiDistPath: String.raw`C:\Users\ander\AppData\Roaming\levilauncher.exe\versions\1.26.42.01\data\gui\dist`,
                                                    //     vanillaResourcePacksContainerFolderPath: String.raw`C:\Users\ander\AppData\Roaming\levilauncher.exe\versions\1.26.42.01\data\resource_packs`,
                                                    //     textsPath: String.raw`C:\Users\ander\AppData\Roaming\levilauncher.exe\versions\1.26.42.01\data\resource_packs`,
                                                    // },
                                                    {
                                                        guiDistPath: path.join(guiFolderPath, "dist"),
                                                        vanillaResourcePacksContainerFolderPath: resourcePacksPathExists ? resourcePacksPath : undefined,
                                                        textsPath: resourcePacksPathExists ? resourcePacksPath : undefined,
                                                    },
                                                    {
                                                        /* pathname: "/vanilla/achievements"  */
                                                    },
                                                    {
                                                        hbuiUIFileEntryProxy(fileContents, filePath, _req, _res) {
                                                            if (
                                                                !/^\/hbui\/(?:index|gameplay|editor(?:-menu|-project)?)-[a-zA-Z0-9]+\.(?:js|css)$/.test(
                                                                    filePath
                                                                ) &&
                                                                !/^\/hbui\/(?:index|gameplay|editor(?:-menu|-project)?).html$/.test(filePath) &&
                                                                !/^\/hbui\/(?:menus|gameplay)-theme-[a-zA-Z0-9]+\.css$/.test(filePath)
                                                            )
                                                                return null;
                                                            return applyColorReplacementsToFileContents(fileContents, filePath, {
                                                                ...config!.oreUICustomizerConfig,
                                                                colorReplacements: config!.oreUICustomizerConfig.colorReplacements ?? {},
                                                            });
                                                        },
                                                    }
                                                )
                                            );
                                        } catch (e) {
                                            console.error(e);
                                            dialog.showMessageBox({
                                                type: "error",
                                                title: "Error",
                                                message: "An error occurred while starting the Ore UI Preview.",
                                                detail: String(e),
                                                buttons: ["Okay"],
                                                noLink: true,
                                            });
                                        }
                                    },
                                });
                            } catch (e) {
                                console.error(e);
                                dialog.showMessageBox({
                                    type: "error",
                                    title: "Error",
                                    message: "An error occurred while starting the Ore UI Preview.",
                                    detail: String(e),
                                    buttons: ["Okay"],
                                    noLink: true,
                                });
                            }
                        }}
                    >
                        <only_visible_on_themes light blue>
                            <img
                                width="16"
                                height="16"
                                src="resource://images/ui/glyphs/Options-Horizontal.png"
                                style="image-rendering: pixelated; filter: invert(); width: calc(8px * var(--gui-scale)); height: calc(8px * var(--gui-scale));"
                                aria-hidden="true"
                            ></img>
                        </only_visible_on_themes>
                        <only_visible_on_themes dark>
                            <img
                                width="16"
                                height="16"
                                src="resource://images/ui/glyphs/Options-Horizontal.png"
                                style="image-rendering: pixelated; width: calc(8px * var(--gui-scale)); height: calc(8px * var(--gui-scale));"
                                aria-hidden="true"
                            ></img>
                        </only_visible_on_themes>
                    </button>
                </div>
                <form id="colors_options_box" style="text-align: left; width: fit-content" ref={colorsSectionRef}>
                    <hr />
                    <h2>Special Color Options</h2>
                    {...(
                        Object.values(
                            advancedColorReplacements["custom"]
                        ) as (typeof advancedColorReplacements)["custom"][keyof (typeof advancedColorReplacements)["custom"]][]
                    ).flatMap((value: (typeof advancedColorReplacements)["custom"][keyof (typeof advancedColorReplacements)["custom"]]): JSX.Element[] => {
                        type TB1 = NonNullable<OreUICustomizerConfig["oreUICustomizerConfig"]["advancedColorReplacements"]>;
                        type TB2 = NonNullable<TB1[keyof TB1]>;
                        type TB2B = UnionToIntersection<TB2>;
                        type TB3 = NonNullable<TB2B[keyof TB2B]>;
                        type TB3B = UnionToIntersection<TB3>;
                        return (Object.values(value) as UnionToIntersection<typeof value>[keyof UnionToIntersection<typeof value>][]).map(
                            (
                                value2:
                                    | UnionToIntersection<typeof value>[keyof UnionToIntersection<typeof value>]
                                    | (typeof value)[keyof UnionToIntersection<typeof value>]
                            ): JSX.Element => {
                                return (
                                    <>
                                        <div class="form-group">
                                            <div class="form-group-header">
                                                <label
                                                    for={`colors_customizer_settings_section_${value2.configColorReplacementsKey}_${value2.configColorReplacementsKey2}_${value2.configColorReplacementsKey3}`}
                                                >
                                                    {value2.configColorReplacementsKey} &gt; {value2.configColorReplacementsKey2} &gt;{" "}
                                                    {value2.configColorReplacementsKey3}
                                                    <br />
                                                    Default: {value2.defaultColor}
                                                </label>
                                            </div>
                                            <div class="form-group-body">
                                                <input
                                                    type="text"
                                                    class="spectrum-colorpicker-color-override-option"
                                                    value={
                                                        (
                                                            (
                                                                resolvedConfig.advancedColorReplacements?.[value2.configColorReplacementsKey] as
                                                                    | TB2B
                                                                    | undefined
                                                            )?.[value2.configColorReplacementsKey2 as keyof TB2B] as TB3B | undefined
                                                        )?.[value2.configColorReplacementsKey3 as keyof TB3B] ?? ""
                                                    }
                                                    id={`colors_customizer_settings_section_${value2.configColorReplacementsKey}_${value2.configColorReplacementsKey2}_${value2.configColorReplacementsKey3}`}
                                                    onTouchStart={(): void => {}}
                                                    style="width: 100%"
                                                    data-isAdvancedConfigColorReplacementsKey="true"
                                                    data-configColorReplacementsKey={value2.configColorReplacementsKey}
                                                    data-configColorReplacementsKey2={value2.configColorReplacementsKey2}
                                                    data-configColorReplacementsKey3={value2.configColorReplacementsKey3}
                                                />
                                            </div>
                                        </div>
                                        <br />
                                    </>
                                );
                            }
                        );
                    })}
                    <hr />
                    <h2>menus-theme.css</h2>
                    {...(
                        Object.values(
                            advancedColorReplacements["menusTheme"]
                        ) as (typeof advancedColorReplacements)["menusTheme"][keyof (typeof advancedColorReplacements)["menusTheme"]][]
                    ).flatMap(
                        (value: (typeof advancedColorReplacements)["menusTheme"][keyof (typeof advancedColorReplacements)["menusTheme"]]): JSX.Element[] => {
                            type TB1 = NonNullable<OreUICustomizerConfig["oreUICustomizerConfig"]["advancedColorReplacements"]>;
                            type TB2 = NonNullable<TB1[keyof TB1]>;
                            type TB2B = UnionToIntersection<TB2>;
                            type TB3 = NonNullable<TB2B[keyof TB2B]>;
                            type TB3B = UnionToIntersection<TB3>;
                            return (Object.values(value) as UnionToIntersection<typeof value>[keyof UnionToIntersection<typeof value>][]).map(
                                (value2: UnionToIntersection<typeof value>[keyof UnionToIntersection<typeof value>]): JSX.Element => {
                                    return (
                                        <>
                                            <div class="form-group">
                                                <div class="form-group-header">
                                                    <label
                                                        for={`colors_customizer_settings_section_${value2.configColorReplacementsKey}_${value2.configColorReplacementsKey2}_${value2.configColorReplacementsKey3}`}
                                                    >
                                                        {value2.configColorReplacementsKey2} &gt; {value2.configColorReplacementsKey3}
                                                        <br />
                                                        Default: {value2.defaultColor}
                                                    </label>
                                                </div>
                                                <div class="form-group-body">
                                                    <input
                                                        type="text"
                                                        class="spectrum-colorpicker-color-override-option"
                                                        value={
                                                            (
                                                                (
                                                                    resolvedConfig.advancedColorReplacements?.[value2.configColorReplacementsKey] as
                                                                        | TB2B
                                                                        | undefined
                                                                )?.[value2.configColorReplacementsKey2 as keyof TB2B] as TB3B | undefined
                                                            )?.[value2.configColorReplacementsKey3 as keyof TB3B] ?? ""
                                                        }
                                                        id={`colors_customizer_settings_section_${value2.configColorReplacementsKey}_${value2.configColorReplacementsKey2}_${value2.configColorReplacementsKey3}`}
                                                        onTouchStart={(): void => {}}
                                                        style="width: 100%"
                                                        data-isAdvancedConfigColorReplacementsKey="true"
                                                        data-configColorReplacementsKey={value2.configColorReplacementsKey}
                                                        data-configColorReplacementsKey2={value2.configColorReplacementsKey2}
                                                        data-configColorReplacementsKey3={value2.configColorReplacementsKey3}
                                                    />
                                                </div>
                                            </div>
                                            <br />
                                        </>
                                    );
                                }
                            );
                        }
                    )}
                    <hr />
                    {/* <h2>gameplay-theme.css</h2>
                <hr /> */}
                    <h2>Other Color Replacements</h2>
                    {...(
                        Object.entries(colorReplacements) as [
                            key: keyof typeof colorReplacements,
                            value: (typeof colorReplacements)[keyof typeof colorReplacements],
                        ][]
                    ).map(
                        ([key, value]: [
                            key: keyof typeof colorReplacements,
                            value: (typeof colorReplacements)[keyof typeof colorReplacements],
                        ]): JSX.Element => {
                            return (
                                <>
                                    <div class="form-group">
                                        <div class="form-group-header">
                                            <label for={`colors_customizer_settings_section_${key}`}>
                                                {key}
                                                <br />
                                                Default: {value.defaultColor}
                                            </label>
                                        </div>
                                        <div class="form-group-body">
                                            <input
                                                type="text"
                                                class="spectrum-colorpicker-color-override-option"
                                                value={config!.oreUICustomizerConfig.colorReplacements?.[value.configColorReplacementsKey] ?? ""}
                                                id={`colors_customizer_settings_section_${key}`}
                                                onTouchStart={(): void => {}}
                                                style="width: 100%"
                                                data-configColorReplacementsKey={value.configColorReplacementsKey}
                                            />
                                        </div>
                                    </div>
                                    <br />
                                </>
                            );
                        }
                    )}
                </form>
            </>
        );
    }
    function MetadataSectionOptions(): JSX.Element {
        useEffect((): (() => void) => {
            function onDescriptionChange(this: HTMLTextAreaElement, _event: Event): void {
                if (this.value) {
                    config!.metadata.description = this.value;
                } else {
                    delete config!.metadata.description;
                }
            }
            if (metadataSectionInputRefs.description.current) {
                metadataSectionInputRefs.description.current.addEventListener("change", onDescriptionChange);
            }
            return (): void => {
                if (metadataSectionInputRefs.description.current) {
                    metadataSectionInputRefs.description.current.removeEventListener("change", onDescriptionChange);
                }
            };
        });
        return (
            <>
                {/* <label style={{ display: "block", marginBottom: "calc(5px * var(--gui-scale))" }}>
                    <span class="nsel ndrg">Name</span>
                    <br />
                    <input
                        title="The name of the config."
                        type="text"
                        class="form-control"
                        style={{
                            width: "-webkit-fill-available",
                        }}
                        ref={metadataSectionInputRefs.name}
                        value={config!.metadata.name}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        spellcheck={false}
                        inputMode="text"
                        required
                        aria-autocomplete="none"
                    />
                </label> */}
                <TextBox
                    label="Name"
                    title="The name of the config."
                    inputRef={metadataSectionInputRefs.name}
                    value={config!.metadata.name}
                    required
                    onChange={function onChange(this: HTMLInputElement, _event: Event): void {
                        if (this.value) {
                            config!.metadata.name = this.value;
                        }
                    }}
                />
                <TextBox
                    label="Authors"
                    title="The authors of the config as a JSON array."
                    inputRef={metadataSectionInputRefs.authors}
                    value={JSON.stringify(config!.metadata.authors ?? [])}
                    required
                    onInput={(event: JSX.TargetedEvent<HTMLInputElement, Event>): void => {
                        let authors: string[] | undefined;
                        try {
                            authors = JSON.parse(event.currentTarget.value);
                            event.currentTarget.style.color = "";
                            const errorMessageDisplayElement: HTMLDivElement = event.currentTarget.parentElement!.querySelector(
                                ".text-box-error-message"
                            ) as HTMLDivElement;
                            errorMessageDisplayElement.style.display = "none";
                            errorMessageDisplayElement.textContent = "";
                        } catch (e: any) {
                            event.currentTarget.style.color = "red";
                            const errorMessageDisplayElement: HTMLDivElement = event.currentTarget.parentElement!.querySelector(
                                ".text-box-error-message"
                            ) as HTMLDivElement;
                            errorMessageDisplayElement.style.color = "red";
                            errorMessageDisplayElement.textContent = e;
                            errorMessageDisplayElement.style.display = "block";
                        }
                        if (authors) {
                            if (!(authors instanceof Array)) {
                                event.currentTarget.style.color = "orange";
                                const errorMessageDisplayElement: HTMLDivElement = event.currentTarget.parentElement!.querySelector(
                                    ".text-box-error-message"
                                ) as HTMLDivElement;
                                errorMessageDisplayElement.style.color = "orange";
                                errorMessageDisplayElement.textContent = "Authors must be a JSON array.";
                                errorMessageDisplayElement.style.display = "block";
                            } else if (authors.length > 0 && !authors.every((author: string): author is string => typeof author === "string")) {
                                event.currentTarget.style.color = "orange";
                                const errorMessageDisplayElement: HTMLDivElement = event.currentTarget.parentElement!.querySelector(
                                    ".text-box-error-message"
                                ) as HTMLDivElement;
                                errorMessageDisplayElement.style.color = "orange";
                                errorMessageDisplayElement.textContent = "Authors must be a JSON array of strings.";
                                errorMessageDisplayElement.style.display = "block";
                            }
                        }
                    }}
                    onChange={function onChange(this: HTMLInputElement, _event: Event): void {
                        if (this.value) {
                            try {
                                const authors: string[] = JSON.parse(this.value) as string[];
                                if (authors instanceof Array && authors.every((author: string): author is string => typeof author === "string")) {
                                    config!.metadata.authors = authors;
                                }
                            } catch {}
                        }
                    }}
                />
                <TextBox
                    label="Version"
                    title="The version of the config as a valid semantic version."
                    inputRef={metadataSectionInputRefs.version}
                    value={config!.metadata.version}
                    required
                    onInput={(event: JSX.TargetedEvent<HTMLInputElement, Event>): void => {
                        let version: string = event.currentTarget.value;
                        if (!semver.valid(version)) {
                            event.currentTarget.style.color = "orange";
                            const errorMessageDisplayElement: HTMLDivElement = event.currentTarget.parentElement!.querySelector(
                                ".text-box-error-message"
                            ) as HTMLDivElement;
                            errorMessageDisplayElement.style.color = "orange";
                            errorMessageDisplayElement.textContent = "Version must be a valid semantic version.";
                            errorMessageDisplayElement.style.display = "block";
                        } else {
                            event.currentTarget.style.color = "";
                            const errorMessageDisplayElement: HTMLDivElement = event.currentTarget.parentElement!.querySelector(
                                ".text-box-error-message"
                            ) as HTMLDivElement;
                            errorMessageDisplayElement.style.display = "none";
                            errorMessageDisplayElement.textContent = "";
                        }
                    }}
                    onChange={function onChange(this: HTMLInputElement, _event: Event): void {
                        if (this.value && semver.valid(this.value)) {
                            config!.metadata.version = this.value;
                        }
                    }}
                />
                <label style={{ display: "block", marginBottom: "calc(5px * var(--gui-scale))" }}>
                    <span class="nsel ndrg">Description</span>
                    <br />
                    <textarea
                        title="The description of the config."
                        class="form-control"
                        style={{
                            width: "-webkit-fill-available",
                        }}
                        ref={metadataSectionInputRefs.description}
                        value={config!.metadata.description ?? ""}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        spellcheck={false}
                        inputMode="text"
                        required
                        aria-autocomplete="none"
                    />
                </label>
                <TextBox
                    label="License"
                    title="The license of the config."
                    inputRef={metadataSectionInputRefs.license}
                    value={config!.metadata.license ?? ""}
                    required
                    onChange={function onChange(this: HTMLInputElement, _event: Event): void {
                        if (this.value) {
                            config!.metadata.license = this.value;
                        } else {
                            delete config!.metadata.license;
                        }
                    }}
                />
                <TextBox
                    label="URL"
                    title="The URL of the website for the config."
                    inputProperties={{
                        inputMode: "url",
                    }}
                    inputRef={metadataSectionInputRefs.url}
                    value={config!.metadata.url ?? ""}
                    onChange={function onChange(this: HTMLInputElement, _event: Event): void {
                        if (this.value) {
                            config!.metadata.url = this.value;
                        } else {
                            delete config!.metadata.url;
                        }
                    }}
                />
                <TextBox
                    label="ID"
                    title="The id of the config, this should be unique. This is required if the config is from the marketplace."
                    inputRef={metadataSectionInputRefs.id}
                    value={config!.metadata.id ?? ""}
                    onInput={(event: JSX.TargetedEvent<HTMLInputElement, Event>): void => {
                        let id: string = event.currentTarget.value;
                        if (!/^[a-zA-Z_\-.]+$/.test(id)) {
                            event.currentTarget.style.color = "orange";
                            const errorMessageDisplayElement: HTMLDivElement = event.currentTarget.parentElement!.querySelector(
                                ".text-box-error-message"
                            ) as HTMLDivElement;
                            errorMessageDisplayElement.style.color = "orange";
                            errorMessageDisplayElement.textContent = "ID must be match the following format: /^[a-zA-Z_-.]+$/";
                            errorMessageDisplayElement.style.display = "block";
                        } else {
                            event.currentTarget.style.color = "";
                            const errorMessageDisplayElement: HTMLDivElement = event.currentTarget.parentElement!.querySelector(
                                ".text-box-error-message"
                            ) as HTMLDivElement;
                            errorMessageDisplayElement.style.display = "none";
                            errorMessageDisplayElement.textContent = "";
                        }
                    }}
                    onChange={function onChange(this: HTMLInputElement, _event: Event): void {
                        if (this.value) {
                            if (/^[a-zA-Z_\-.]+$/.test(this.value)) {
                                config!.metadata.id = this.value;
                            }
                        } else {
                            delete config!.metadata.id;
                        }
                    }}
                />
                <TextBox
                    label="UUID"
                    title="The UUID of the config."
                    inputRef={metadataSectionInputRefs.uuid}
                    value={config!.metadata.uuid}
                    onInput={(event: JSX.TargetedEvent<HTMLInputElement, Event>): void => {
                        let id: string = event.currentTarget.value;
                        if (!/^[a-z,0-9]{8}-[a-z,0-9]{4}-4[a-z,0-9]{3}-[89AB][a-z,0-9]{3}-[a-z,0-9]{12}$/i.test(id)) {
                            event.currentTarget.style.color = "orange";
                            const errorMessageDisplayElement: HTMLDivElement = event.currentTarget.parentElement!.querySelector(
                                ".text-box-error-message"
                            ) as HTMLDivElement;
                            errorMessageDisplayElement.style.color = "orange";
                            errorMessageDisplayElement.textContent = "UUID must be a valid UUID v4.";
                            errorMessageDisplayElement.style.display = "block";
                        } else {
                            event.currentTarget.style.color = "";
                            const errorMessageDisplayElement: HTMLDivElement = event.currentTarget.parentElement!.querySelector(
                                ".text-box-error-message"
                            ) as HTMLDivElement;
                            errorMessageDisplayElement.style.display = "none";
                            errorMessageDisplayElement.textContent = "";
                        }
                    }}
                    onChange={function onChange(this: HTMLInputElement, _event: Event): void {
                        if (this.value && /^[a-z,0-9]{8}-[a-z,0-9]{4}-4[a-z,0-9]{3}-[89AB][a-z,0-9]{3}-[a-z,0-9]{12}$/i.test(this.value)) {
                            config!.metadata.uuid = this.value;
                        }
                    }}
                />
            </>
        );
    }
    function RawConfigSectionOptions(): JSX.Element {
        const rawConfigTextAreaRef: RefObject<HTMLTextAreaElement> = useRef<HTMLTextAreaElement>(null);
        function onRawConfigTextAreaChange(this: HTMLTextAreaElement, _event: Event): void {
            let value: SavedOreUICustomizerConfig_Type | undefined = undefined;
            const errorMessageDisplayTextBox: HTMLPreElement = document.getElementById("raw-config-text-box-error-message") as HTMLPreElement;
            try {
                value = CommentJSON.parse(this.value, null, true) as any;
                this.style.color = "#FFFF";
                errorMessageDisplayTextBox.style.display = "none";
            } catch {
                try {
                    // To get the stack location.
                    json5.parse(this.value);
                } catch (e: any) {
                    this.style.color = "red";
                    errorMessageDisplayTextBox.style.color = "red";
                    errorMessageDisplayTextBox.textContent = e;
                    errorMessageDisplayTextBox.style.display = "block";
                }
            }
            // TO-DO: Add an actual schema validation or something similar.
            if (value) {
                if (!("oreUICustomizerConfig" in value) || typeof value.oreUICustomizerConfig !== "object" || !value.oreUICustomizerConfig) {
                    this.style.color = "yellow";
                    errorMessageDisplayTextBox.style.color = "yellow";
                    errorMessageDisplayTextBox.textContent = 'Property "oreUICustomizerConfig" is missing or is not an object.';
                    errorMessageDisplayTextBox.style.display = "block";
                } else if (
                    !("oreUICustomizerVersion" in value) ||
                    typeof value.oreUICustomizerVersion !== "string" ||
                    semver.valid(value.oreUICustomizerVersion) === null
                ) {
                    this.style.color = "yellow";
                    errorMessageDisplayTextBox.style.color = "yellow";
                    errorMessageDisplayTextBox.textContent =
                        'Property "oreUICustomizerVersion" is missing, is not a string, or is not a valid semantic version.';
                    errorMessageDisplayTextBox.style.display = "block";
                } else if (!("metadata" in value) || typeof value.metadata !== "object" || !value.metadata) {
                    this.style.color = "yellow";
                    errorMessageDisplayTextBox.style.color = "yellow";
                    errorMessageDisplayTextBox.textContent = 'Property "metadata" is missing or is not an object.';
                    errorMessageDisplayTextBox.style.display = "block";
                } else if (typeof value.metadata.version !== "string" || semver.valid(value.metadata.version) === null) {
                    this.style.color = "yellow";
                    errorMessageDisplayTextBox.style.color = "yellow";
                    errorMessageDisplayTextBox.textContent = 'Property "metadata.version" is missing, is not a string, or is not a valid semantic version.';
                    errorMessageDisplayTextBox.style.display = "block";
                } else if (
                    typeof value.metadata.uuid !== "string" ||
                    !/^[a-z,0-9]{8}-[a-z,0-9]{4}-4[a-z,0-9]{3}-[89AB][a-z,0-9]{3}-[a-z,0-9]{12}$/i.test(value.metadata.uuid)
                ) {
                    this.style.color = "yellow";
                    errorMessageDisplayTextBox.style.color = "yellow";
                    errorMessageDisplayTextBox.textContent = 'Property "metadata.uui" is missing, is not a string, or is not a valid UUID v4.';
                    errorMessageDisplayTextBox.style.display = "block";
                } else if (typeof value.metadata.name !== "string") {
                    this.style.color = "yellow";
                    errorMessageDisplayTextBox.style.color = "yellow";
                    errorMessageDisplayTextBox.textContent = 'Property "metadata.name" is missing or is not a string.';
                    errorMessageDisplayTextBox.style.display = "block";
                } else if (value.metadata.product_type !== "config") {
                    this.style.color = "yellow";
                    errorMessageDisplayTextBox.style.color = "yellow";
                    errorMessageDisplayTextBox.textContent = 'Property "metadata.product_type" is missing or is not "config".';
                    errorMessageDisplayTextBox.style.display = "block";
                } else {
                    errorMessageDisplayTextBox.style.display = "none";
                    if (!config) return;
                    config.manifest = {
                        ...value,
                        metadata: {
                            name: config.metadata.name,
                            uuid: config.metadata.uuid,
                            version: config.metadata.version,
                            ...(value.metadata as Partial<SavedOreUICustomizerConfig_Type["metadata"]>),
                            product_type: "config",
                        },
                    };
                }
            }
        }
        useEffect((): (() => void) => {
            if (rawConfigTextAreaRef.current) {
                rawConfigTextAreaRef.current.addEventListener("change", onRawConfigTextAreaChange);
                /* OverlayScrollbars(
                {
                    target: rawConfigTextAreaRef.current.parentElement!,
                    elements: { viewport: rawConfigTextAreaRef.current.parentElement!, content: rawConfigTextAreaRef.current! },
                },
                { overflow: { y: "scroll" } }
            ); */
            }
            return (): void => {
                if (rawConfigTextAreaRef.current) rawConfigTextAreaRef.current.removeEventListener("change", onRawConfigTextAreaChange);
            };
        }, []);
        return (
            <>
                <div>
                    <span style={{ display: "block", marginBottom: "calc((2px * var(--gui-scale)) + 1px)" }}>Raw Config</span>
                    <textarea
                        title="Raw Config"
                        class="form-control"
                        ref={rawConfigTextAreaRef}
                        value={JSON.stringify(config!.toSavedConfigData(), null, 4)}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        spellcheck={false}
                        inputMode="text"
                        required
                        aria-autocomplete="none"
                        style={{
                            fontFamily: "Monocraft",
                            width: "-webkit-fill-available",
                            height: "50vh",
                        }}
                    ></textarea>
                    <div id="raw-config-text-box-error-message" style={{ display: "none", color: "red", fontFamily: "Monocraft" }}></div>
                </div>
            </>
        );
    }
    function reloadSettings(): void {
        render(
            <GeneralSectionOptions />,
            sectionRefs.generalSectionRef.current!
            // Array.from($(sectionRefs.generalSectionRef.current!).find("> div")).find((element: Element): boolean =>
            //     element.hasAttribute("data-overlayscrollbars-viewport")
            // )!
        );
        render(
            <ColorsSectionOptions />,
            sectionRefs.colorsSectionRef.current!
            // Array.from($(sectionRefs.colorsSectionRef.current!).find("> div")).find((element: Element): boolean =>
            //     element.hasAttribute("data-overlayscrollbars-viewport")
            // )!
        );
        render(
            <MetadataSectionOptions />,
            sectionRefs.metadataSectionRef.current!
            // Array.from($(sectionRefs.metadataSectionRef.current!).find("> div")).find((element: Element): boolean =>
            //     element.hasAttribute("data-overlayscrollbars-viewport")
            // )!
        );
        render(
            <RawConfigSectionOptions />,
            sectionRefs.rawConfigSectionRef.current!
            // Array.from($(sectionRefs.rawConfigSectionRef.current!).find("> div")).find((element: Element): boolean =>
            //     element.hasAttribute("data-overlayscrollbars-viewport")
            // )!
        );
    }
    let lastSettingsSidebarSection: string | null = null;
    function onSettingsSidebarSectionSwitch(sectionID: string): void {
        if (lastSettingsSidebarSection === sectionID) return;
        if (lastSettingsSidebarSection === "raw_config" || sectionID === "raw_config") {
            reloadSettings();
        }
        lastSettingsSidebarSection = sectionID;
    }
    useEffect((): (() => void) => {
        function configUpdatedCallback(updatedConfig: OreUICustomizerConfig): void {
            if (updatedConfig !== config) return;
            reloadSettings();
        }
        ConfigManager.on("configEdited", configUpdatedCallback);
        ConfigManager.on("configRefreshed", configUpdatedCallback);
        return (): void => {
            ConfigManager.off("configEdited", configUpdatedCallback);
            ConfigManager.off("configRefreshed", configUpdatedCallback);
            oreUIPreviews.forEach((preview: OreUIPreview): void => void preview.forceClose());
        };
    }, []);

    return (
        <div style={{ width: "-webkit-fill-available", height: "100%" }}>
            <SettingsSidebar sidebarWidth="40%" sidebarContainerID="config-editor-sidebar">
                <SettingsSidebarSection>
                    <SettingsSidebarSectionButton
                        text="General"
                        sectionID="general"
                        sidebarRadioID="config_editor_section"
                        image="resource://images/ui/glyphs/dev_glyph_color.png"
                        hoverImage="resource://images/ui/glyphs/dev_glyph.png"
                        imageSize={[14, 14]}
                        onClick={(): void => {
                            onSettingsSidebarSectionSwitch("general");
                        }}
                        default
                    ></SettingsSidebarSectionButton>
                    <SettingsSidebarSectionButton
                        text="Colors"
                        sectionID="colors"
                        sidebarRadioID="config_editor_section"
                        image="resource://images/ui/glyphs/color_picker_glyph_color.png"
                        hoverImage="resource://images/ui/glyphs/color_picker_glyph.png"
                        imageSize={[16, 16]}
                        hoverImageSize={[18, 18]}
                        onClick={(): void => {
                            onSettingsSidebarSectionSwitch("colors");
                        }}
                    ></SettingsSidebarSectionButton>
                    <SettingsSidebarSectionButton
                        text="Metadata"
                        sectionID="metadata"
                        sidebarRadioID="config_editor_section"
                        image="resource://images/ui/glyphs/storageIconColor.png"
                        hoverImage="resource://images/ui/glyphs/storageIcon.png"
                        imageSize={[17, 16]}
                        onClick={(): void => {
                            onSettingsSidebarSectionSwitch("metadata");
                        }}
                    ></SettingsSidebarSectionButton>
                </SettingsSidebarSection>
                <SettingsSidebarSection sectionHeader="Advanced">
                    <SettingsSidebarSectionButton
                        text="Raw Config"
                        sectionID="raw_config"
                        sidebarRadioID="config_editor_section"
                        image="resource://images/ui/glyphs/debug_glyph_color.png"
                        hoverImage="resource://images/ui/glyphs/debug_glyph.png"
                        imageSize={[14, 14]}
                        onClick={(): void => {
                            onSettingsSidebarSectionSwitch("raw_config");
                        }}
                    ></SettingsSidebarSectionButton>
                </SettingsSidebarSection>
                <div style={{ flexGrow: 1 }} />
                <div class="button_container">
                    <button
                        type="button"
                        onTouchStart={(): void => {}}
                        class="radio_button_container_label"
                        style="width: -webkit-fill-available; text-align: left;"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            event.preventDefault();
                            event.currentTarget.blur();
                            if (event.currentTarget.disabled) return;
                            SoundEffects.popB();
                        }}
                        onClick={async (event: JSX.TargetedMouseEvent<HTMLButtonElement>): Promise<void> => {
                            event.preventDefault();
                            event.currentTarget.blur();
                            if (event.currentTarget.disabled) return;
                            if (JSON.stringify(config.toSavedConfigData(), null, 4) !== readFileSync(config.filePath, "utf-8")) {
                                const result: MessageBoxReturnValue = await dialog.showMessageBox(getCurrentWindow(), {
                                    type: "warning",
                                    title: "Unsaved Changes",
                                    message: `${config.metadata.name} has unsaved changes.`,
                                    detail: "Your changes will not be applied to the exported config if you don't save them first.",
                                    buttons: ["Save Changes and Proceed", "Proceed Anyway", "Cancel"],
                                    noLink: true,
                                    defaultId: 0,
                                    cancelId: 2,
                                });
                                switch (result.response) {
                                    case 0:
                                        config.saveChanges();
                                        break;
                                    case 1:
                                        break;
                                    case 2:
                                        return;
                                }
                            }
                            const result: SaveDialogReturnValue = await dialog.showSaveDialog(getCurrentWindow(), {
                                buttonLabel: "Save",
                                defaultPath: path.join(app.getPath("downloads"), `${config.metadata.name}-${config.metadata.version}.ouicconfig`),
                                properties: ["showHiddenFiles", "showOverwriteConfirmation", "treatPackageAsDirectory"],
                                title: "Export Config",
                                message: "Select a location to export the config.",
                                filters: [
                                    { name: "Config (Recommended)", extensions: ["mcouicconfig", "ouicconfig"] },
                                    { name: "Config (JSON)", extensions: ["json", "jsonc", "jsonl"] },
                                ],
                            });
                            if (result.canceled) return;
                            writeFileSync(result.filePath, readFileSync(config.filePath));
                            shell.showItemInFolder(result.filePath);
                            createToast({
                                title: "Config exported successfully",
                            });
                        }}
                    >
                        <div
                            class="button-image-container"
                            style={{
                                height: `calc(17px * var(--gui-scale))`,
                                width: `calc(17px * var(--gui-scale))`,
                                // display: "inline-block",
                                position: "absolute",
                                // marginTop: "calc(-2px * var(--gui-scale) / 3)",
                                // marginLeft: "auto",
                                // marginRight: "auto",
                                top: `round(down, calc((calc(calc((29 * var(--gui-scale)) - 2) * 1px) - (17px * var(--gui-scale))) / 2), 1px)`,
                            }}
                        >
                            <img
                                aria-hidden="true"
                                src="resource://images/ui/glyphs/download.png"
                                class="no-remove-disabled nsel ndrg button-image"
                                style={{
                                    height: `calc(17px * var(--gui-scale))`,
                                    width: `calc(17px * var(--gui-scale))`,
                                    imageRendering: "pixelated",
                                    zIndex: 3,
                                    position: "absolute",
                                    // top: 0,
                                    // left: 0,
                                }}
                            />
                        </div>
                        <div
                            class="no-remove-disabled nsel"
                            style={{
                                display: "inline-block",
                                position: "relative",
                                left: "calc(calc(17px * var(--gui-scale)) + 21px)",
                            }}
                        >
                            Export Config
                        </div>
                    </button>
                    <button
                        type="button"
                        onTouchStart={(): void => {}}
                        class="radio_button_container_label"
                        style="width: -webkit-fill-available; text-align: left;"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            event.preventDefault();
                            event.currentTarget.blur();
                            if (event.currentTarget.disabled) return;
                            SoundEffects.popB();
                        }}
                        onClick={async (event: JSX.TargetedMouseEvent<HTMLButtonElement>): Promise<void> => {
                            event.preventDefault();
                            event.currentTarget.blur();
                            if (event.currentTarget.disabled) return;
                            const result: MessageBoxReturnValue = await dialog.showMessageBox(getCurrentWindow(), {
                                type: "warning",
                                buttons: ["Confirm", "Cancel"],
                                defaultId: 1,
                                cancelId: 1,
                                message: "Are you sure you want to discard your changes? This action cannot be undone.",
                                noLink: true,
                                title: "Confirm Discard Changes",
                            });
                            if (result.response === 1) return;
                            config.refresh();
                            oreUIPreviews.forEach((preview: OreUIPreview): void => void preview.window?.reload());
                            createToast({
                                title: "Changes discarded",
                            });
                        }}
                    >
                        <div
                            class="button-image-container"
                            style={{
                                height: `calc(17px * var(--gui-scale))`,
                                width: `calc(17px * var(--gui-scale))`,
                                // display: "inline-block",
                                position: "absolute",
                                // marginTop: "calc(-2px * var(--gui-scale) / 3)",
                                // marginLeft: "auto",
                                // marginRight: "auto",
                                top: `round(down, calc((calc(calc((29 * var(--gui-scale)) - 2) * 1px) - (17px * var(--gui-scale))) / 2), 1px)`,
                            }}
                        >
                            <img
                                aria-hidden="true"
                                src="resource://images/ui/glyphs/wysiwyg_reset_white.png"
                                class="no-remove-disabled nsel ndrg button-image"
                                style={{
                                    height: `calc(17px * var(--gui-scale))`,
                                    width: `calc(17px * var(--gui-scale))`,
                                    imageRendering: "pixelated",
                                    zIndex: 3,
                                    position: "absolute",
                                    // top: 0,
                                    // left: 0,
                                }}
                            />
                        </div>
                        <div
                            class="no-remove-disabled nsel"
                            style={{
                                display: "inline-block",
                                position: "relative",
                                left: "calc(calc(17px * var(--gui-scale)) + 21px)",
                            }}
                        >
                            Discard Changes
                        </div>
                    </button>
                    <button
                        type="button"
                        onTouchStart={(): void => {}}
                        class="radio_button_container_label"
                        style="width: -webkit-fill-available; text-align: left;"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            event.preventDefault();
                            event.currentTarget.blur();
                            if (event.currentTarget.disabled) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            event.preventDefault();
                            event.currentTarget.blur();
                            if (event.currentTarget.disabled) return;
                            console.log(1);
                            config.saveChanges();
                            console.log(2);
                            createToast({
                                title: "Config saved",
                            });
                            console.log(3);
                        }}
                    >
                        <div
                            class="button-image-container"
                            style={{
                                height: `calc(17px * var(--gui-scale))`,
                                width: `calc(17px * var(--gui-scale))`,
                                // display: "inline-block",
                                position: "absolute",
                                // marginTop: "calc(-2px * var(--gui-scale) / 3)",
                                // marginLeft: "auto",
                                // marginRight: "auto",
                                top: `round(down, calc((calc(calc((29 * var(--gui-scale)) - 2) * 1px) - (17px * var(--gui-scale))) / 2), 1px)`,
                            }}
                        >
                            <img
                                aria-hidden="true"
                                src="resource://images/ui/glyphs/save.png"
                                class="no-remove-disabled nsel ndrg button-image"
                                style={{
                                    height: `calc(17px * var(--gui-scale))`,
                                    width: `calc(17px * var(--gui-scale))`,
                                    imageRendering: "pixelated",
                                    zIndex: 3,
                                    position: "absolute",
                                    // top: 0,
                                    // left: 0,
                                }}
                            />
                        </div>
                        <div
                            class="no-remove-disabled nsel"
                            style={{
                                display: "inline-block",
                                position: "relative",
                                left: "calc(calc(17px * var(--gui-scale)) + 21px)",
                            }}
                        >
                            Save
                        </div>
                    </button>
                </div>
            </SettingsSidebar>
            <SettingsSectionContainer
                sectionWidth="60%"
                sectionID="general"
                sidebarRadioID="config_editor_section"
                scrollingViewportRef={sectionRefs.generalSectionRef}
                default
            >
                <GeneralSectionOptions />
            </SettingsSectionContainer>
            <SettingsSectionContainer
                sectionWidth="60%"
                sectionID="colors"
                sidebarRadioID="config_editor_section"
                scrollingViewportRef={sectionRefs.colorsSectionRef}
            >
                <ColorsSectionOptions />
            </SettingsSectionContainer>
            <SettingsSectionContainer
                sectionWidth="60%"
                sectionID="metadata"
                sidebarRadioID="config_editor_section"
                scrollingViewportRef={sectionRefs.metadataSectionRef}
            >
                <MetadataSectionOptions />
            </SettingsSectionContainer>
            <SettingsSectionContainer
                sectionWidth="60%"
                sectionID="raw_config"
                sidebarRadioID="config_editor_section"
                scrollingViewportRef={sectionRefs.rawConfigSectionRef}
            >
                <RawConfigSectionOptions />
            </SettingsSectionContainer>
        </div>
    );
}
