import { render, type Component, type FunctionComponent, type JSX, type RefObject } from "preact";
import _React, { hydrate, useEffect, useRef, version } from "preact/compat";
import Toggle from "../components/Toggle";
import Slider, { type SliderInnerHTMLInputElement, type SliderProps } from "../components/Slider";
import { updateGUIScale } from "../app";
import { dialog, nativeTheme, shell } from "@electron/remote";
import type { OpenDialogReturnValue } from "electron";
import Dropdown from "../components/Dropdown";
import { OverlayScrollbars } from "overlayscrollbars";
import mergeRefs from "merge-refs";

export default function PreferencesPage(): JSX.SpecificElement<"center"> {
    const GUIScaleSliderRef: RefObject<SliderInnerHTMLInputElement> = useRef<SliderInnerHTMLInputElement>(null);
    const themeDropdownAutoOptionRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const themeDropdownSelectedOptionTextDisplayRef: RefObject<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    useEffect((): (() => void) => {
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
        window.addEventListener("GUIScaleChange", baseGUIScaleChangeCallback);
        config.addListener("settingChanged:GUIScale", GUIScaleChangeCallback);
        const prefersDarkColorSchemeMediaQueryList: MediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
        prefersDarkColorSchemeMediaQueryList.addEventListener("change", onSystemThemeChange);
        // console.log(GUIScaleSliderRef, GUIScaleSliderRef.current);
        return (): void => {
            window.removeEventListener("GUIScaleChange", baseGUIScaleChangeCallback);
            config.removeListener("settingChanged:GUIScale", GUIScaleChangeCallback);
            prefersDarkColorSchemeMediaQueryList.removeEventListener("change", onSystemThemeChange);
        };
    });
    return (
        <div style={{ width: "100%", height: "100%" }}>
            <SettingsSidebar sidebarWidth="40%" sidebarContainerID="settings-sidebar">
                <SettingsSidebarSection>
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
                ></Slider>
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
                                    ((options.imageSize?.[1] ?? options.hoverImageSize?.[1] ?? 17) - (options.hoverImageSize?.[1] ?? 17)) / 2,
                                    0
                                )}px * var(--gui-scale)) calc(${Math.max(
                                    ((options.imageSize?.[0] ?? options.hoverImageSize?.[0] ?? 17) - (options.hoverImageSize?.[0] ?? 17)) / 2,
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
    useEffect((): void => {
        if (scrollingViewportRef.current) {
            OverlayScrollbars(
                {
                    target: scrollingViewportRef.current,
                    elements: {},
                },
                {
                    overflow: {
                        x: "scroll",
                        y: "scroll",
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
            <div ref={mergeRefs(scrollingViewportRef, options.scrollingViewportRef)} style={{ width: "calc(100% - 24px)", height: "calc(100% - 24px)", padding: "12px" }}>
                {options.children}
            </div>
        </div>
    );
}
