import { render, type JSX, type RefObject } from "preact";
import _React, { hydrate, useEffect, useRef } from "preact/compat";
import Toggle from "../components/Toggle";
import Slider, { type SliderInnerHTMLInputElement } from "../components/Slider";
import { updateGUIScale } from "../app";
import { app, clipboard, dialog, nativeTheme, shell } from "@electron/remote";
import type { OpenDialogReturnValue } from "electron";
import Dropdown, { type DropdownOption } from "../components/Dropdown";
import { OverlayScrollbars } from "overlayscrollbars";
import mergeRefs from "merge-refs";
import { APP_DATA_FOLDER_PATH } from "../../src/utils/URLs";
import { createToast } from "../components/Toast";
import TextBox from "../components/TextBox";

export default function PreferencesPage(): JSX.SpecificElement<"center"> {
    const GUIScaleSliderRef: RefObject<SliderInnerHTMLInputElement> = useRef<SliderInnerHTMLInputElement>(null);
    const themeDropdownAutoOptionRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const themeDropdownSelectedOptionTextDisplayRef: RefObject<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const debugHUDDropdownSelectedOptionTextDisplayRef: RefObject<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const debugHUDDropdownContentsRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const panoramaDropdownSelectedOptionTextDisplayRef: RefObject<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    const panoramaDropdownContentsRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const panoramaPerspectiveOptionRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
    const panoramaRotateDirectionDropdownButtonRef: RefObject<HTMLButtonElement> = useRef<HTMLButtonElement>(null);
    const panoramaRotateSpeedOptionRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
    useEffect((): (() => void) => {
        /**
         * Controller for aborting listeners.
         */
        const controller: AbortController = new AbortController();
        function baseGUIScaleChangeCallback(): void {
            if (GUIScaleSliderRef.current) {
                const element: SliderInnerHTMLInputElement | null = GUIScaleSliderRef.current;
                const sliderIsDisabled: boolean = element.disabled;
                const sliderShouldBeDisabled: boolean = config.baseGUIScale <= 3;
                // console.log(sliderIsDisabled, sliderShouldBeDisabled, (-Math.max(config.baseGUIScale - 3, 0)).toString());
                if (!sliderShouldBeDisabled) GUIScaleSliderRef.current.min = (-Math.max(config.baseGUIScale - 3, 0)).toString();
                if (sliderIsDisabled !== sliderShouldBeDisabled) {
                    element.disabled = sliderShouldBeDisabled;
                }
                element.dispatchEvent(new Event("refreshSlider"));
            }
        }
        function GUIScaleChangeCallback(): void {
            if (GUIScaleSliderRef.current) {
                const element: SliderInnerHTMLInputElement | null = GUIScaleSliderRef.current;
                const GUIScale: number = config.GUIScale;
                element.setAttribute("data-value", GUIScale.toString());
                element.setAttribute("data-precise-value", GUIScale.toString());
                const label: HTMLLabelElement | undefined = element.parentElement?.children[0] as HTMLLabelElement | undefined;
                if (label) label.textContent = `GUI Scale Modifier: ${GUIScale}`;
                element.dispatchEvent(new Event("refreshSlider"));
            }
        }
        function onSystemThemeChange(): void {
            if (nativeTheme.themeSource !== "system" || !themeDropdownAutoOptionRef.current) return;
            themeDropdownAutoOptionRef.current.querySelector("label")!.textContent = `Auto (${
                prefersDarkColorSchemeMediaQueryList.matches ? "Dark" : "Light"
            })`;
            themeDropdownSelectedOptionTextDisplayRef.current!.textContent = `Auto (${prefersDarkColorSchemeMediaQueryList.matches ? "Dark" : "Light"})`;
        }
        function debugHUDChangeCallback(value: typeof config.debugHUD): void {
            if (debugHUDDropdownSelectedOptionTextDisplayRef.current && debugHUDDropdownContentsRef.current) {
                const valueOption: HTMLInputElement | null = debugHUDDropdownContentsRef.current.querySelector(`input[value="${value}"]`);
                if (valueOption) {
                    valueOption.checked = true;
                } else {
                    const selectedValueOption: HTMLInputElement | null = debugHUDDropdownContentsRef.current.querySelector(`input:checked`);
                    if (selectedValueOption) {
                        selectedValueOption.checked = false;
                    }
                }
                debugHUDDropdownSelectedOptionTextDisplayRef.current!.textContent = config.constants.debugOverlayModes[value] ?? value;
            }
        }
        function panoramaChangeCallback(value: typeof config.panorama): void {
            if (panoramaDropdownSelectedOptionTextDisplayRef.current && panoramaDropdownContentsRef.current) {
                const valueOption: HTMLInputElement | null = panoramaDropdownContentsRef.current.querySelector(`input[value="${value}"]`);
                if (valueOption) {
                    valueOption.checked = true;
                } else {
                    const selectedValueOption: HTMLInputElement | null = panoramaDropdownContentsRef.current.querySelector(`input:checked`);
                    if (selectedValueOption) {
                        selectedValueOption.checked = false;
                    }
                }
                panoramaDropdownSelectedOptionTextDisplayRef.current!.textContent = config.constants.panoramaDisplayMapping[value] ?? value;
                if (value === "off") {
                    panoramaPerspectiveOptionRef.current!.disabled = true;
                    panoramaRotateDirectionDropdownButtonRef.current!.disabled = true;
                    panoramaRotateSpeedOptionRef.current!.disabled = true;
                } else {
                    panoramaPerspectiveOptionRef.current!.disabled = false;
                    panoramaRotateDirectionDropdownButtonRef.current!.disabled = false;
                    panoramaRotateSpeedOptionRef.current!.disabled = false;
                }
            }
        }
        // GUI scale option listeners
        window.addEventListener("GUIScaleChange", baseGUIScaleChangeCallback, {
            signal: controller.signal,
        });
        config.addListener("settingChanged:GUIScale", GUIScaleChangeCallback);
        // Debug HUD option listener
        config.addListener("settingChanged:debugHUD", debugHUDChangeCallback);
        // Panorama option listener
        config.addListener("settingChanged:panorama", panoramaChangeCallback);
        // System theme listener
        const prefersDarkColorSchemeMediaQueryList: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
        prefersDarkColorSchemeMediaQueryList.addEventListener("change", onSystemThemeChange, {
            signal: controller.signal,
        });
        // console.log(GUIScaleSliderRef, GUIScaleSliderRef.current);
        return (): void => {
            // Remove listeners
            controller.abort();
            // Remove non-abortable listeners
            config.removeListener("settingChanged:GUIScale", GUIScaleChangeCallback);
            config.removeListener("settingChanged:debugHUD", debugHUDChangeCallback);
            config.removeListener("settingChanged:panorama", panoramaChangeCallback);
        };
    });
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <SettingsSidebar sidebarWidth="40%" sidebarContainerID="settings-sidebar">
                {/* <SettingsSidebarSection>
                    <SettingsSidebarSectionButton
                        text="Accessibility"
                        sectionID="accessibility"
                        sidebarRadioID="perferences_section"
                        image="resource://images/ui/glyphs/accessibility_glyph_color.png"
                        hoverImage="resource://images/ui/glyphs/accessibility_glyph.png"
                        imageSize={[13, 20]}
                        default
                    ></SettingsSidebarSectionButton>
                </SettingsSidebarSection> */}
                <SettingsSidebarSection /* sectionHeader="General" */>
                    <SettingsSidebarSectionButton
                        text="General"
                        sectionID="general"
                        sidebarRadioID="perferences_section"
                        image="resource://images/ui/glyphs/dev_glyph_color.png"
                        hoverImage="resource://images/ui/glyphs/dev_glyph.png"
                        imageSize={[14, 14]}
                        default
                    ></SettingsSidebarSectionButton>
                    <SettingsSidebarSectionButton
                        text="Video"
                        sectionID="video"
                        sidebarRadioID="perferences_section"
                        image="resource://images/ui/glyphs/video_glyph_color.png"
                        hoverImage="resource://images/ui/glyphs/video_glyph.png"
                        imageSize={[15, 12]}
                    ></SettingsSidebarSectionButton>
                    <SettingsSidebarSectionButton
                        text="Audio"
                        sectionID="audio"
                        sidebarRadioID="perferences_section"
                        image="resource://images/ui/glyphs/sound_glyph_color.png"
                        hoverImage="resource://images/ui/glyphs/sound_glyph.png"
                        imageSize={[16, 12]}
                    ></SettingsSidebarSectionButton>
                    <SettingsSidebarSectionButton
                        text="Installing"
                        sectionID="installing"
                        sidebarRadioID="perferences_section"
                        image="resource://images/ui/glyphs/installations_glyph_color.png"
                        hoverImage="resource://images/ui/glyphs/installations_glyph.png"
                        imageSize={[15, 15]}
                    ></SettingsSidebarSectionButton>
                    <SettingsSidebarSectionButton
                        text="Security"
                        sectionID="security"
                        sidebarRadioID="perferences_section"
                        image="resource://images/ui/glyphs/absorption_effect.png"
                        hoverImage="resource://images/ui/glyphs/absorption_effect_outline.png"
                        imageSize={[18, 18]}
                        hoverImageSize={[20, 20]}
                    ></SettingsSidebarSectionButton>
                </SettingsSidebarSection>
                <SettingsSidebarSection sectionHeader="Menus">
                    <SettingsSidebarSectionButton
                        text="Installations Tab"
                        sectionID="installations_tab"
                        sidebarRadioID="perferences_section"
                        disabled
                    ></SettingsSidebarSectionButton>
                    <SettingsSidebarSectionButton
                        text="Configs Tab"
                        sectionID="configs_tab"
                        sidebarRadioID="perferences_section"
                        disabled
                    ></SettingsSidebarSectionButton>
                    <SettingsSidebarSectionButton
                        text="Plugins Tab"
                        sectionID="plugins_tab"
                        sidebarRadioID="perferences_section"
                        disabled
                    ></SettingsSidebarSectionButton>
                    <SettingsSidebarSectionButton
                        text="Themes Tab"
                        sectionID="themes_tab"
                        sidebarRadioID="perferences_section"
                        disabled
                    ></SettingsSidebarSectionButton>
                    <SettingsSidebarSectionButton
                        text="Marketplace Tab"
                        sectionID="marketplace_tab"
                        sidebarRadioID="perferences_section"
                        disabled
                    ></SettingsSidebarSectionButton>
                    <SettingsSidebarSectionButton
                        text="Preferences Tab"
                        sectionID="preferences_tab"
                        sidebarRadioID="perferences_section"
                        disabled
                    ></SettingsSidebarSectionButton>
                </SettingsSidebarSection>
                <SettingsSidebarSection sectionHeader="Advanced">
                    <SettingsSidebarSectionButton
                        text="Debug"
                        sectionID="debug"
                        sidebarRadioID="perferences_section"
                        image="resource://images/ui/glyphs/debug_glyph_color.png"
                        hoverImage="resource://images/ui/glyphs/debug_glyph.png"
                        imageSize={[15, 15]}
                    ></SettingsSidebarSectionButton>
                </SettingsSidebarSection>
            </SettingsSidebar>
            <SettingsSectionContainer sectionWidth="60%" sectionID="general" sidebarRadioID="perferences_section" default>
                <Toggle
                    label="Test Toggle"
                    onChange={(event: JSX.TargetedEvent<HTMLInputElement, Event>): void => {
                        // console.log("test", event.returnValue, event.currentTarget.checked);
                    }}
                ></Toggle>
            </SettingsSectionContainer>
            <SettingsSectionContainer sectionWidth="60%" sectionID="video" sidebarRadioID="perferences_section">
                <Slider
                    inputRef={GUIScaleSliderRef}
                    label="GUI Scale Modifier"
                    min={-Math.max(config.baseGUIScale - 3, 0)}
                    max={0}
                    step={1}
                    defaultValue={config.GUIScale}
                    disabled={config.baseGUIScale <= 3}
                    onChange={function onChange(this: HTMLInputElement, _event: Event): void {
                        config.GUIScale = Number(this.getAttribute("data-value"));
                        updateGUIScale();
                    }}
                />
                <Dropdown
                    label="Theme"
                    id="theme_dropdown"
                    minWidth="100px"
                    options={[
                        {
                            label: `Auto (${nativeTheme.shouldUseDarkColorsForSystemIntegratedUI ? "Dark" : "Light"})`,
                            value: "auto",
                            default: config.theme === "auto",
                            ref: themeDropdownAutoOptionRef,
                        },
                        {
                            label: "Dark",
                            value: "dark",
                            default: config.theme === "dark",
                        },
                        {
                            label: "Light",
                            value: "light",
                            default: config.theme === "light",
                        },
                        {
                            label: "Blue",
                            value: "blue",
                            default: config.theme === "blue",
                        },
                    ]}
                    onChange={(value: typeof config.theme): void => {
                        config.theme = value;
                    }}
                    selectedOptionTextDisplayRef={themeDropdownSelectedOptionTextDisplayRef}
                />
                <Dropdown
                    label="Panorama"
                    id="panorama_dropdown"
                    minWidth="100px"
                    options={config.constants.panoramaList.map(
                        (panorama: typeof config.panorama): DropdownOption<typeof config.panorama> => ({
                            label: config.constants.panoramaDisplayMapping[panorama] ?? panorama,
                            value: panorama,
                            default: config.panorama === panorama,
                        })
                    )}
                    onChange={(value: typeof config.panorama): void => {
                        config.panorama = value;
                    }}
                    selectedOptionTextDisplayRef={panoramaDropdownSelectedOptionTextDisplayRef}
                    dropdownContentsRef={panoramaDropdownContentsRef}
                />
                <TextBox
                    inputRef={panoramaPerspectiveOptionRef}
                    label="Panorama Perspective"
                    value={config.panoramaPerspective.toString()}
                    placeholder="400"
                    inputProperties={{
                        type: "number",
                        inputMode: "numeric",
                        min: "0",
                        step: "1",
                        disabled: config.panorama === "off",
                    }}
                    required
                    onInput={(event: JSX.TargetedInputEvent<HTMLInputElement>): void => {
                        if (event.currentTarget.validity.badInput || !/^-?\d*\.?\d*$/.test(event.currentTarget.value)) {
                            event.currentTarget.style.outline = "calc(var(--gui-scale) * 1px) solid red";
                            event.currentTarget.style.color = "red";
                        } else {
                            event.currentTarget.style.outline = "";
                            event.currentTarget.style.color = "";
                        }
                    }}
                    onChange={function onChange(this: HTMLInputElement, _event: Event): void {
                        this.style.outline = "";
                        this.style.color = "";
                        if (this.value === "") {
                            config.panoramaPerspective = undefined;
                            this.valueAsNumber = config.panoramaPerspective;
                        } else if (!/^-?\d*\.?\d*$/.test(this.value)) {
                            this.valueAsNumber = config.panoramaPerspective;
                        } else {
                            config.panoramaPerspective = this.valueAsNumber;
                        }
                    }}
                />
                <Dropdown
                    dropdownButtonRef={panoramaRotateDirectionDropdownButtonRef}
                    label="Panorama Rotate Direction"
                    id="panorama_rotate_direction_dropdown"
                    minWidth="100px"
                    disabled={config.panorama === "off"}
                    options={[
                        {
                            label: "Clockwise",
                            value: "clockwise",
                            default: config.panoramaRotateDirection === "clockwise",
                        },
                        {
                            label: "Counterclockwise (Default)",
                            value: "counterclockwise",
                            default: config.panoramaRotateDirection === "counterclockwise",
                        },
                    ]}
                    onChange={(value: typeof config.panoramaRotateDirection): void => {
                        config.panoramaRotateDirection = value;
                    }}
                />
                <TextBox
                    inputRef={panoramaRotateSpeedOptionRef}
                    label="Panorama Rotate Speed"
                    value={config.panoramaRotateSpeed.toString()}
                    placeholder="2.5"
                    inputProperties={{
                        type: "number",
                        inputMode: "numeric",
                        min: "0",
                        step: "0.5",
                        disabled: config.panorama === "off",
                    }}
                    required
                    onInput={(event: JSX.TargetedInputEvent<HTMLInputElement>): void => {
                        if (event.currentTarget.validity.badInput || !/^\d*\.?\d*$/.test(event.currentTarget.value)) {
                            event.currentTarget.style.outline = "calc(var(--gui-scale) * 1px) solid red";
                            event.currentTarget.style.color = "red";
                        } else {
                            event.currentTarget.style.outline = "";
                            event.currentTarget.style.color = "";
                        }
                    }}
                    onChange={function onChange(this: HTMLInputElement, _event: Event): void {
                        this.style.outline = "";
                        this.style.color = "";
                        if (this.value === "") {
                            config.panoramaRotateSpeed = undefined;
                            this.valueAsNumber = config.panoramaRotateSpeed;
                        } else if (!/^\d*\.?\d*$/.test(this.value)) {
                            this.valueAsNumber = config.panoramaRotateSpeed;
                        } else {
                            config.panoramaRotateSpeed = this.valueAsNumber;
                        }
                    }}
                />
            </SettingsSectionContainer>
            <SettingsSectionContainer sectionWidth="60%" sectionID="audio" sidebarRadioID="perferences_section">
                <Slider
                    // inputRef={GUIScaleSliderRef}
                    label="Master Volume"
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={config.volume.master}
                    onChange={function onChange(this: HTMLInputElement, _event: Event): void {
                        config.volume.master = Number(this.getAttribute("data-value"));
                    }}
                ></Slider>
                <Slider
                    // inputRef={GUIScaleSliderRef}
                    label="UI Volume"
                    min={0}
                    max={100}
                    step={1}
                    defaultValue={config.volume.ui}
                    onChange={function onChange(this: HTMLInputElement, _event: Event): void {
                        config.volume.ui = Number(this.getAttribute("data-value"));
                    }}
                ></Slider>
            </SettingsSectionContainer>
            <SettingsSectionContainer sectionWidth="60%" sectionID="installing" sidebarRadioID="perferences_section">
                <VersionFolderSearchLocationsOption />
            </SettingsSectionContainer>
            <SettingsSectionContainer sectionWidth="60%" sectionID="debug" sidebarRadioID="perferences_section">
                <Dropdown
                    label="Enable Debug HUD"
                    id="debug_hud_dropdown"
                    minWidth="100px"
                    options={[
                        {
                            label: config.constants.debugOverlayModes.none,
                            value: "none",
                            default: config.debugHUD === "none",
                        },
                        {
                            label: config.constants.debugOverlayModes.top,
                            value: "top",
                            default: config.debugHUD === "top",
                        },
                        {
                            label: config.constants.debugOverlayModes.basic,
                            value: "basic",
                            default: config.debugHUD === "basic",
                        },
                        {
                            label: config.constants.debugOverlayModes.config,
                            value: "config",
                            default: config.debugHUD === "config",
                        },
                    ]}
                    onChange={(value: typeof config.debugHUD): void => {
                        config.debugHUD = value;
                    }}
                    selectedOptionTextDisplayRef={debugHUDDropdownSelectedOptionTextDisplayRef}
                    dropdownContentsRef={debugHUDDropdownContentsRef}
                />
                <div>
                    <span class="option-group-label nsel ndrg">Folders</span>
                    <div class="button_container">
                        <button
                            type="button"
                            class="btn nsel ndrg"
                            style={{ width: "100%" }}
                            onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                                event.currentTarget.blur();
                                if (event.currentTarget.disabled) return;
                                SoundEffects.popB();
                            }}
                            onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                                event.currentTarget.blur();
                                if (event.currentTarget.disabled) return;
                                shell.openPath(APP_DATA_FOLDER_PATH);
                            }}
                        >
                            Open Customizer App Data Folder
                        </button>
                    </div>
                    <div class="button_container">
                        <button
                            type="button"
                            class="btn nsel ndrg"
                            style={{ width: "100%" }}
                            onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                                event.currentTarget.blur();
                                if (event.currentTarget.disabled) return;
                                SoundEffects.popB();
                            }}
                            onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                                event.currentTarget.blur();
                                if (event.currentTarget.disabled) return;
                                shell.openPath(app.getPath("userData"));
                            }}
                        >
                            Open Application App Data Folder
                        </button>
                    </div>
                </div>
                <span class="nsel ndrg" style={{ wordBreak: "break-all" }}>
                    Customizer Data Folder:
                    <br />
                    <span
                        style={{
                            cursor: "copy",
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLSpanElement>): void => {
                            event.preventDefault();
                            event.stopPropagation();
                            clipboard.writeText(APP_DATA_FOLDER_PATH);
                            createToast({
                                title: "Copied customizer data folder location to clipboard.",
                            });
                        }}
                    >
                        {APP_DATA_FOLDER_PATH.replaceAll("\\", "/")}
                    </span>
                </span>
                <span class="nsel ndrg" style={{ wordBreak: "break-all" }}>
                    App Data Folder:
                    <br />
                    <span
                        style={{
                            cursor: "copy",
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLSpanElement>): void => {
                            event.preventDefault();
                            event.stopPropagation();
                            clipboard.writeText(app.getPath("userData"));
                            createToast({
                                title: "Copied app data folder location to clipboard.",
                            });
                        }}
                    >
                        {app.getPath("userData").replaceAll("\\", "/")}
                    </span>
                </span>
                <span class="nsel ndrg" style={{ wordBreak: "break-all" }}>
                    Logs Folder:
                    <br />
                    <span
                        style={{
                            cursor: "copy",
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLSpanElement>): void => {
                            event.preventDefault();
                            event.stopPropagation();
                            clipboard.writeText(app.getPath("logs"));
                            createToast({
                                title: "Copied logs folder location to clipboard.",
                            });
                        }}
                    >
                        {app.getPath("logs").replaceAll("\\", "/")}
                    </span>
                </span>
                <span class="nsel ndrg" style={{ wordBreak: "break-all" }}>
                    Crash Dumps Folder:
                    <br />
                    <span
                        style={{
                            cursor: "copy",
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLSpanElement>): void => {
                            event.preventDefault();
                            event.stopPropagation();
                            clipboard.writeText(app.getPath("crashDumps"));
                            createToast({
                                title: "Copied crash dumps folder location to clipboard.",
                            });
                        }}
                    >
                        {app.getPath("crashDumps").replaceAll("\\", "/")}
                    </span>
                </span>
                <span class="nsel ndrg" style={{ wordBreak: "break-all" }}>
                    Temp Folder:
                    <br />
                    <span
                        style={{
                            cursor: "copy",
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLSpanElement>): void => {
                            event.preventDefault();
                            event.stopPropagation();
                            clipboard.writeText(app.getPath("temp"));
                            createToast({
                                title: "Copied temp folder location to clipboard.",
                            });
                        }}
                    >
                        {app.getPath("temp").replaceAll("\\", "/")}
                    </span>
                </span>
            </SettingsSectionContainer>
        </div>
    );
}

export function VersionFolderSearchLocationsOption(): JSX.SpecificElement<"div"> {
    const versionFolderSearchLocationsLabelPopupHelpInfoRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const versionFolderSearchLocationsListContainerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    let versionFolderSearchLocations: string[] = config.versionFolderSearchLocations;
    function updateVersionFolderSearchLocations(locations?: typeof versionFolderSearchLocations): void {
        if (!versionFolderSearchLocationsListContainerRef.current) return;
        versionFolderSearchLocations = locations ?? config.versionFolderSearchLocations;
        Array.from(versionFolderSearchLocationsListContainerRef.current.children)
            .slice(versionFolderSearchLocations.length)
            .forEach((child: Element): void => child.remove());
        render(<VersionFolderSearchLocationList locations={versionFolderSearchLocations} />, versionFolderSearchLocationsListContainerRef.current);
    }
    function appendVersionFolderSearchLocation(location: string = ""): void {
        if (!versionFolderSearchLocationsListContainerRef.current) return;
        versionFolderSearchLocations = config.versionFolderSearchLocations;
        hydrate(
            <VersionFolderSearchLocationList locations={[...versionFolderSearchLocations, location]} />,
            versionFolderSearchLocationsListContainerRef.current
        );
    }
    function VersionFolderSearchLocationList(props: {
        locations?: typeof versionFolderSearchLocations;
    }): JSX.SpecificElement<"div", JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>[] {
        props.locations ??= versionFolderSearchLocations;
        return props.locations.map((location: string, index: number): JSX.SpecificElement<"div"> => {
            const inputRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);
            useEffect((): void => {
                if (inputRef.current) {
                    inputRef.current.addEventListener("change", (): void => {
                        if (!inputRef.current) return;
                        versionFolderSearchLocations = config.versionFolderSearchLocations;
                        config.versionFolderSearchLocations = [
                            ...versionFolderSearchLocations.slice(0, index),
                            inputRef.current.value,
                            ...versionFolderSearchLocations.slice(index + 1),
                        ];
                    });
                }
            });
            return (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                    }}
                >
                    <input
                        ref={inputRef}
                        title="A file path."
                        type="text"
                        class="form-control"
                        style={{
                            flexGrow: 1,
                        }}
                        value={location}
                        autoCapitalize="off"
                        autoComplete="off"
                        autoCorrect="off"
                        spellcheck={false}
                        inputMode="text"
                        required
                        aria-autocomplete="none"
                        onInput={(event: JSX.TargetedInputEvent<HTMLInputElement>): void => {
                            if (event.currentTarget.value.length === 0 || /[<>:"|?*]/.test(event.currentTarget.value)) {
                                event.currentTarget.style.color = "red";
                            } else {
                                event.currentTarget.style.color = "";
                            }
                        }}
                    />
                    <button
                        type="button"
                        class="btn nsel"
                        title="Remove"
                        style={{ padding: "calc(9px * var(--gui-scale))" }}
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            if (event.currentTarget.disabled) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            if (event.currentTarget.disabled) return;
                            versionFolderSearchLocations = config.versionFolderSearchLocations;
                            config.versionFolderSearchLocations = [
                                ...versionFolderSearchLocations.slice(0, index),
                                ...versionFolderSearchLocations.slice(index + 1),
                            ];
                        }}
                    >
                        <only_visible_on_themes light blue>
                            <img
                                width="15"
                                height="16"
                                src="resource://images/ui/glyphs/trash_default.png"
                                class="nsel ndrg"
                                aria-hidden="true"
                                style={{
                                    imageRendering: "pixelated",
                                    width: "calc(15px * (var(--gui-scale) - 1))",
                                    height: "calc(16px * (var(--gui-scale) - 1))",
                                    padding: "0 round(down, calc(0.5px * var(--gui-scale)), 1px)",
                                }}
                            ></img>
                        </only_visible_on_themes>
                        <only_visible_on_themes dark>
                            <img
                                width="15"
                                height="16"
                                src="resource://images/ui/glyphs/trash_default.png"
                                class="nsel ndrg"
                                aria-hidden="true"
                                style={{
                                    imageRendering: "pixelated",
                                    filter: "invert()",
                                    width: "calc(15px * (var(--gui-scale) - 1))",
                                    height: "calc(16px * (var(--gui-scale) - 1))",
                                    padding: "0 round(down, calc(0.5px * var(--gui-scale)), 1px)",
                                }}
                            ></img>
                        </only_visible_on_themes>
                    </button>
                </div>
            );
        });
    }
    useEffect((): (() => void) => {
        config.on("settingChanged:versionFolderSearchLocations", updateVersionFolderSearchLocations);
        return (): void => {
            config.off("settingChanged:versionFolderSearchLocations", updateVersionFolderSearchLocations);
        };
    });
    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            <style>{`.version-folder-search-locations-label:hover {
                cursor: help;
                text-decoration: underline;
            }
            div:has(> .version-folder-search-locations-label) > div:has(> purple-border_background) {
                pointer-events: none;
                transition: opacity 0.1s;
                opacity: 0;
                z-index: 1000;
            }
            div:has(> .version-folder-search-locations-label:hover) > div:has(> purple-border_background) {
                display: block;
                transition: opacity 0.1s ease 0.5s;
                opacity: 1;
            }`}</style>
            <label
                class="version-folder-search-locations-label"
                onMouseOver={(event: JSX.TargetedMouseEvent<HTMLLabelElement>): void => {
                    if (!versionFolderSearchLocationsLabelPopupHelpInfoRef.current) return;
                    versionFolderSearchLocationsLabelPopupHelpInfoRef.current.style.top = `${event.clientY}px`;
                    versionFolderSearchLocationsLabelPopupHelpInfoRef.current.style.left = `${event.clientX}px`;
                }}
                onMouseMove={(event: JSX.TargetedMouseEvent<HTMLLabelElement>): void => {
                    if (!versionFolderSearchLocationsLabelPopupHelpInfoRef.current) return;
                    versionFolderSearchLocationsLabelPopupHelpInfoRef.current.style.top = `${event.clientY}px`;
                    versionFolderSearchLocationsLabelPopupHelpInfoRef.current.style.left = `${event.clientX}px`;
                }}
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: "calc(2px * var(--gui-scale))",
                }}
            >
                Version Folder Search Locations
                <img
                    title="Help"
                    src="resource://images/ui/glyphs/Information_9x9.png"
                    style={{
                        width: "calc(9px * var(--gui-scale))",
                        imageRendering: "pixelated",
                        marginLeft: "calc(3px * var(--gui-scale))",
                    }}
                />
            </label>
            <div
                ref={versionFolderSearchLocationsLabelPopupHelpInfoRef}
                style={{
                    display: "block",
                    position: "fixed",
                }}
            >
                <purple-border_background>
                    <div style={{ padding: "calc(6px * var(--gui-scale))", wordBreak: "break-word" }}>
                        {`The version folders to search for Minecraft versions in, it will look at folders contained directly within these folders.`.replaceAll(
                            /(?<!^|\s)(?!$|\s)/g,
                            "\xAD"
                        )}
                        <br />
                        <br />
                        {`It allows some special codes to use environment variables in the path (All of them except for Home can be put anywhere in the path, Home must be at the start of the path):`.replaceAll(
                            /(?<!^|\s)(?!$|\s)/g,
                            "\xAD"
                        )}
                        <br />
                        <span
                            style={{
                                fontFamily: "Monocraft",
                            }}
                        >
                            %appdata%: APPDATA
                            <br />
                            Home: HOME
                            <br />
                            %userprofile%: USERPROFILE
                            <br />
                            %programdata%: ProgramData
                            <br />
                            %programfiles%: ProgramFiles
                            <br />
                            %localappdata%: LOCALAPPDATA
                            <br />
                            %temp%: TEMP
                            <br />
                            %tmp%: TMP
                            <br />
                            %public%: PUBLIC
                        </span>
                    </div>
                </purple-border_background>
            </div>
            <div
                ref={versionFolderSearchLocationsListContainerRef}
                style={{
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <VersionFolderSearchLocationList />
            </div>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <button
                    type="button"
                    class="btn"
                    style={{ flexGrow: 1 }}
                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                        if (event.currentTarget.disabled) return;
                        SoundEffects.popB();
                    }}
                    onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                        if (event.currentTarget.disabled) return;
                        appendVersionFolderSearchLocation();
                    }}
                >
                    Add Folder
                </button>
                <button
                    type="button"
                    class="btn"
                    style={{ flexGrow: 1 }}
                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                        if (event.currentTarget.disabled) return;
                        SoundEffects.popB();
                    }}
                    onClick={async (event: JSX.TargetedMouseEvent<HTMLButtonElement>): Promise<void> => {
                        if (event.currentTarget.disabled) return;
                        const result: OpenDialogReturnValue = await dialog.showOpenDialog({
                            properties: ["openDirectory", "multiSelections", "treatPackageAsDirectory", "showHiddenFiles"],
                            buttonLabel: "Add to Version Folder Search Locations",
                            message: "Select a folder to add to the list of version folder search locations",
                            title: "Add Version Folder Search Location",
                        });
                        if (result.canceled) return;
                        config.versionFolderSearchLocations = config.versionFolderSearchLocations.concat(result.filePaths);
                    }}
                >
                    Select Folders
                </button>
            </div>
        </div>
    );
}

export interface SettingsSidebarSectionButtonProps /*  extends JSX.HTMLAttributes<HTMLDivElement> */ {
    children?: never;
    image?: string;
    hoverImage?: string;
    imageSize?: [x: number, y: number];
    hoverImageSize?: [x: number, y: number];
    text: string;
    sectionID: string;
    sidebarRadioID: string;
    default?: boolean;
    disabled?: boolean;
}

export function SettingsSidebarSectionButton(options: SettingsSidebarSectionButtonProps): JSX.SpecificElement<"div"> {
    function settingsSidebarSectionButtonOnClick(event: JSX.TargetedMouseEvent<HTMLInputElement>): void {
        if (event.currentTarget.disabled) return;
        document
            .querySelectorAll(`.settings_section_container[data-sidebar-radio-id=${JSON.stringify(options.sidebarRadioID)}]`)
            .forEach((element: Element): void => {
                if (!(element instanceof HTMLDivElement)) return;
                if (element.getAttribute("data-section-id") === options.sectionID) {
                    element.style.display = "block";
                } else {
                    element.style.display = "none";
                }
            });
    }
    return (
        <label
            onTouchStart={(): void => {}}
            for={options.sidebarRadioID + "_radio_" + options.sectionID}
            class="radio_button_container_label"
            style="width: -webkit-fill-available;"
            onMouseDown={(event: JSX.TargetedMouseEvent<HTMLLabelElement>): void => {
                if ((event.currentTarget.children[0] as HTMLInputElement).disabled) return;
                SoundEffects.popB();
            }}
            onMouseOver={(event: JSX.TargetedMouseEvent<HTMLLabelElement>): void => {
                const hoverImageElement: Element | null = event.currentTarget.querySelector("img.button-hover-image");
                if (!hoverImageElement || !(hoverImageElement instanceof HTMLImageElement) || event.currentTarget.querySelector("input")?.disabled) return;
                hoverImageElement.style.filter = "";
            }}
            onMouseOut={(event: JSX.TargetedMouseEvent<HTMLLabelElement>): void => {
                const hoverImageElement: Element | null = event.currentTarget.querySelector("img.button-hover-image");
                if (!hoverImageElement || !(hoverImageElement instanceof HTMLImageElement) || event.currentTarget.querySelector("input")?.disabled) return;
                hoverImageElement.style.filter = "brightness(0)";
            }}
        >
            <input
                type="radio"
                name={options.sidebarRadioID}
                style="display: none;"
                class="no-remove-disabled nsel"
                id={options.sidebarRadioID + "_radio_" + options.sectionID}
                title={options.text}
                data-section-id={options.sectionID}
                onChange={settingsSidebarSectionButtonOnClick}
                checked={options.default}
                disabled={options.disabled}
            />
            {options.image && (
                <div
                    class="button-image-container"
                    style={{
                        height: `calc(${
                            options.imageSize?.[1] || options.hoverImageSize?.[1] ? Math.max(options.imageSize?.[1] ?? 0, options.hoverImageSize?.[1] ?? 0) : 17
                        }px * var(--gui-scale))`,
                        width:
                            options.imageSize || options.hoverImageSize
                                ? `calc(${Math.max(options.imageSize?.[0] ?? 0, options.hoverImageSize?.[0] ?? 0)} ?? 17}px * var(--gui-scale))`
                                : undefined,
                        // display: "inline-block",
                        position: "absolute",
                        // marginTop: "calc(-2px * var(--gui-scale) / 3)",
                        // marginLeft: "auto",
                        // marginRight: "auto",
                        top: `round(down, calc((calc(calc((29 * var(--gui-scale)) - 2) * 1px) - (${
                            options.imageSize?.[1] || options.hoverImageSize?.[1] ? Math.max(options.imageSize?.[1] ?? 0, options.hoverImageSize?.[1] ?? 0) : 17
                        }px * var(--gui-scale))) / 2), 1px)`,
                    }}
                >
                    <img
                        aria-hidden="true"
                        src={options.image}
                        class="no-remove-disabled nsel ndrg button-image"
                        style={{
                            height: `calc(${options.imageSize?.[1] ?? 17}px * var(--gui-scale))`,
                            width: options.imageSize ? `calc(${options.imageSize?.[0] ?? 17}px * var(--gui-scale))` : undefined,
                            imageRendering: "pixelated",
                            zIndex: 3,
                            position: "absolute",
                            // top: 0,
                            // left: 0,
                            margin: `calc(${Math.max(
                                ((options.hoverImageSize?.[1] ?? options.imageSize?.[1] ?? 17) - (options.imageSize?.[1] ?? 17)) / 2,
                                0
                            )}px * var(--gui-scale)) calc(${Math.max(
                                ((options.hoverImageSize?.[0] ?? options.imageSize?.[0] ?? 17) - (options.imageSize?.[0] ?? 17)) / 2,
                                0
                            )}px * var(--gui-scale))`,
                        }}
                    />
                    {options.hoverImage && (
                        <img
                            title="Hover Icon"
                            src={options.hoverImage}
                            class="no-remove-disabled nsel ndrg button-hover-image"
                            style={{
                                height: `calc(${options.hoverImageSize?.[1] ?? options.imageSize?.[1] ?? 17}px * var(--gui-scale))`,
                                width:
                                    options.imageSize || options.hoverImageSize
                                        ? `calc(${options.hoverImageSize?.[0] ?? options.imageSize?.[0] ?? 17}px * var(--gui-scale))`
                                        : undefined,
                                imageRendering: "pixelated",
                                zIndex: 2,
                                position: "absolute",
                                // top: 0,
                                // left: 0,
                                filter: "brightness(0)",
                                margin: `calc(${Math.max(
                                    ((options.imageSize?.[1] ?? options.hoverImageSize?.[1] ?? 17) -
                                        (options.hoverImageSize?.[1] ?? options.imageSize?.[1] ?? 17)) /
                                        2,
                                    0
                                )}px * var(--gui-scale)) calc(${Math.max(
                                    ((options.imageSize?.[0] ?? options.hoverImageSize?.[0] ?? 17) -
                                        (options.hoverImageSize?.[0] ?? options.imageSize?.[0] ?? 17)) /
                                        2,
                                    0
                                )}px * var(--gui-scale))`,
                            }}
                        />
                    )}
                </div>
            )}
            <div
                class="no-remove-disabled nsel"
                style={{
                    display: "inline-block",
                    ...(options.image ? { position: "relative", left: "calc(calc(17px * var(--gui-scale)) + 21px)" } : undefined),
                }}
            >
                {options.text}
            </div>
        </label>
    );
}

export interface SettingsSidebarSectionProps extends JSX.HTMLAttributes<HTMLDivElement> {
    children:
        | JSX.SpecificElement<JSX.HTMLAttributes<HTMLDivElement> & SettingsSidebarSectionButtonProps>
        | JSX.SpecificElement<JSX.HTMLAttributes<HTMLDivElement> & SettingsSidebarSectionButtonProps>[];
    sectionHeader?: string;
}

export function SettingsSidebarSection(options: SettingsSidebarSectionProps): JSX.SpecificElement<"div"> {
    return (
        <>
            {options.sectionHeader ? <p style={{ textAlign: "left", paddingTop: "20px", margin: 0 }}>{options.sectionHeader}</p> : undefined}
            <div class="button_container" {...options}></div>
        </>
    );
}

export interface SettingsSidebarProps extends JSX.HTMLAttributes<HTMLDivElement> {
    children:
        | JSX.SpecificElement<JSX.HTMLAttributes<HTMLDivElement> & SettingsSidebarSectionProps>
        | JSX.SpecificElement<JSX.HTMLAttributes<HTMLDivElement> & SettingsSidebarSectionProps>[];
    sidebarContainerID: string;
    sidebarWidth: string;
}

export function SettingsSidebar(options: SettingsSidebarProps): JSX.SpecificElement<"div"> {
    return (
        <div
            style={{
                width: `calc(${options.sidebarWidth} - 24px)`,
                height: "calc(100% - 24px)",
                borderRight: "5px solid #87CEEb",
                position: "absolute",
                top: 0,
                left: 0,
                padding: "12px",
                overflowX: "hidden",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
            }}
            {...options}
        ></div>
    );
}

export interface SettingsSectionContainerProps extends JSX.HTMLAttributes<HTMLDivElement> {
    children?: any;
    default?: boolean;
    sectionWidth: string;
    sectionID: string;
    sidebarRadioID: string;
    containerRef?: RefObject<HTMLDivElement>;
    scrollingViewportRef?: RefObject<HTMLDivElement>;
}

export function SettingsSectionContainer(options: SettingsSectionContainerProps): JSX.SpecificElement<"div"> {
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const scrollingViewportRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const scrollingViewportContainerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    useEffect((): void => {
        // MutationObserver.prototype.observe(HTMLElement.prototype, {subtree: true, childList: true, attributes: true, characterData: true});
        if (scrollingViewportRef.current && scrollingViewportContainerRef.current) {
            OverlayScrollbars(
                {
                    target: scrollingViewportContainerRef.current,
                    elements: {
                        viewport: scrollingViewportRef.current,
                    },
                },
                {
                    overflow: {
                        x: "scroll",
                        y: "scroll",
                    },
                    update: {
                        ignoreMutation: null,
                        elementEvents: [["div.settings-section-container-viewport", "resize"]],
                        attributes: ["hidden"],
                    },

                    scrollbars: {},
                }
            );
        }
    });
    return (
        <div
            class="settings_section_container"
            data-sidebar-radio-id={options.sidebarRadioID}
            data-section-id={options.sectionID}
            ref={mergeRefs(containerRef, options.containerRef)}
            style={{
                display: options.default ? "block" : "none",
                width: `calc(${options.sectionWidth} - 5px)`,
                height: "100%",
                position: "absolute",
                top: 0,
                right: 0,
                paddingLeft: "5px",
                // overflow: "auto",
            }}
            {...Object.fromEntries(
                Object.entries(options).filter(
                    ([key, value]: [key: string, value: any]): boolean =>
                        key !== "default" && key !== "sectionWidth" && key !== "sectionID" && key !== "sidebarRadioID" && key !== "children"
                )
            )}
        >
            <div
                ref={scrollingViewportContainerRef}
                class="settings-section-container-viewport-container"
                style={{
                    width: "calc(100% - 24px)",
                    height: "calc(100% - 12px)",
                    padding: "12px",
                    paddingBottom: "0",
                }}
            >
                <div
                    ref={mergeRefs(scrollingViewportRef, options.scrollingViewportRef)}
                    class="settings-section-container-viewport"
                    style={{
                        width: "calc(100% - 24px)",
                        height: "100%",
                        padding: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "calc((2px * var(--gui-scale)) + 1px)",
                    }}
                >
                    {options.children}
                </div>
            </div>
        </div>
    );
}
