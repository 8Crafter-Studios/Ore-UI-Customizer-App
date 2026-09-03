import type { JSX, RefObject } from "preact";
import _React, { hydrate, render, useEffect, useRef } from "preact/compat";
import { OreUICustomizerTheme, ThemeManager, type MissingThemeInfo } from "../../src/utils/ThemeManager";
import type { CustomizerAppPage, SearchParamTypes } from "../../src/utils/pageList";
import CollapsibleSection from "../components/CollapsibleSection";
import { dialog } from "@electron/remote";
import { createToast } from "../components/Toast";
import { writeFileSync } from "node:fs";
import { sanitizeFilename } from "../../src/utils/sanitize-filename";
import path from "node:path";
import { format_version } from "../../src/utils/ore-ui-customizer-api";

export default function ThemesPage(): JSX.SpecificElement<"center"> {
    const centerRef: RefObject<HTMLElement> = useRef<HTMLElement>(null);
    return (
        <center style={{ backgroundColor: "#44444488", padding: "0 12px 12px 12px", height: "100%", overflow: "auto" }} ref={centerRef}>
            <h1>Themes</h1>
            <ThemesList />
            <div style={{ height: "calc(8px * var(--gui-scale))", width: "100%" }}></div>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }} class="button_container horizontal">
                <button
                    type="button"
                    class="btn"
                    style={{ flexGrow: 1 }}
                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                        SoundEffects.popB();
                        event.currentTarget.blur();
                    }}
                    onClick={async (event: JSX.TargetedMouseEvent<HTMLButtonElement>): Promise<void> => {
                        event.preventDefault();
                        event.currentTarget.blur();
                        if (event.currentTarget.disabled) return;
                        // const container: HTMLDivElement = document.createElement("div");
                        // container.style.width = "calc(300px * var(--gui-scale))";
                        // container.style.height = "calc(100px * var(--gui-scale))";
                        // container.style.position = "fixed";
                        // container.style.top = "calc(50vh - (50px * var(--gui-scale)))";
                        // container.style.left = "calc(50vw - (150px * var(--gui-scale)))";
                        // container.classList.add("dialog-hollow-4-thin");
                        // hydrate(
                        //     <div
                        //         style={{
                        //             margin: "calc(6px * var(--gui-scale))",
                        //             padding: "calc(2px * var(--gui-scale))",
                        //             backgroundColor: "#00000088",
                        //             width: "calc(100% - (12px * var(--gui-scale)))",
                        //             height: "calc(100% - (12px * var(--gui-scale)))",
                        //         }}
                        //     >
                        //         <span>Theme Name</span>
                        //         <input
                        //             title="Theme Name"
                        //             type="text"
                        //             class="form-control"
                        //             placeholder={"Theme Name"}
                        //             onInput={(event: JSX.TargetedInputEvent<HTMLInputElement>): void => {
                        //                 event.currentTarget.parentElement!.querySelector("button")!.disabled = event.currentTarget.value.length === 0;
                        //             }}
                        //             required
                        //             style={{ width: "100%" }}
                        //         />
                        //         <div
                        //             style={{
                        //                 display: "flex",
                        //                 flexDirection: "row",
                        //                 justifyContent: "center",
                        //                 position: "absolute",
                        //                 bottom: "calc(8px * var(--gui-scale))",
                        //                 width: "calc(100% - (16px * var(--gui-scale)))",
                        //             }}
                        //         >
                        //             <button
                        //                 type="button"
                        //                 class="btn"
                        //                 disabled
                        //                 style={{ flexGrow: 1 }}
                        //                 onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                        //                     if (event.currentTarget.disabled) return;
                        //                     SoundEffects.popB();
                        //                 }}
                        //                 onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                        //                     event.currentTarget.blur();
                        //                     event.preventDefault();
                        //                     event.stopPropagation();
                        //                     const name: string = event.currentTarget.parentElement!.parentElement!.querySelector("input")!.value;
                        //                     if (event.currentTarget.disabled || name.length === 0) return;
                        //                     container.remove();
                        //                     const data: SavedOreUICustomizerConfig_Type | undefined = {
                        //                         oreUICustomizerConfig: {},
                        //                         oreUICustomizerVersion: format_version,
                        //                         metadata: {
                        //                             name,
                        //                             uuid: crypto.randomUUID(),
                        //                             version: "1.0.0",
                        //                             product_type: "config",
                        //                         },
                        //                         readonly: false,
                        //                     };
                        //                     const fileName: string = sanitizeFilename(`${data.metadata.name.slice(0, 25)}-${Date.now()}.json`);
                        //                     writeFileSync(path.join(ConfigManager.configsFolder, fileName), JSON.stringify(data, null, 4));
                        //                     const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(ConfigManager.configsFolder, fileName));
                        //                     ConfigManager.loadedConfigs.push(config);
                        //                     ConfigManager.emit("configCreated", config);
                        //                     router.history.push(
                        //                         `/config-editor?${new URLSearchParams({
                        //                             configPath: config.filePath,
                        //                         } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ConfigEditor]>).toString()}`
                        //                     );
                        //                 }}
                        //             >
                        //                 Create
                        //             </button>
                        //             <button type="button" class="btn" style={{ flexGrow: 1 }} onClick={(): void => container.remove()}>
                        //                 Cancel
                        //             </button>
                        //         </div>
                        //     </div>,
                        //     container
                        // );
                        // document.body.appendChild(container);
                    }}
                    disabled
                >
                    Create Theme (COMING SOON!)
                </button>
                <button
                    type="button"
                    class="btn"
                    style={{ flexGrow: 1 }}
                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                        SoundEffects.popB();
                        event.currentTarget.blur();
                    }}
                    onClick={async (event: JSX.TargetedMouseEvent<HTMLButtonElement>): Promise<void> => {
                        event.preventDefault();
                        if (event.currentTarget.disabled) return;
                        event.currentTarget.blur();
                        const currentWindow: Electron.BrowserWindow = getCurrentWindow();
                        const result: Electron.OpenDialogReturnValue = await dialog.showOpenDialog(currentWindow, {
                            buttonLabel: "Import",
                            filters: [{ name: "Theme", extensions: ["mcouictheme", "ouictheme" /* , "json", "jsonc", "jsonl", "jsonld" */] }],
                            message: "Select theme files to import",
                            properties: ["openFile", "showHiddenFiles", "treatPackageAsDirectory", "multiSelections"],
                            title: "Import Themes",
                        });
                        if (result.canceled) return;
                        const themePaths: string[] = result.filePaths;
                        themePaths.forEach((themePath: string): void => {
                            currentWindow.webContents.send<1>("import-from-file", themePath, "theme");
                        });
                    }}
                >
                    Import Theme
                </button>
            </div>
        </center>
    );
}

export function ThemesList(): JSX.Element {
    const activeAmountRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const activeContainerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const activeContentRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const myThemesAmountRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const myThemesContainerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const myThemesContentRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    let activeThemes: (OreUICustomizerTheme | MissingThemeInfo)[] = ThemeManager.getActiveThemes();
    let inactiveThemes: OreUICustomizerTheme[] = ThemeManager.getInactiveThemes();
    useEffect((): (() => void) => {
        function handleThemeChanged(): void {
            activeThemes = ThemeManager.getActiveThemes();
            inactiveThemes = ThemeManager.getInactiveThemes();
            activeAmountRef.current!.textContent = (activeThemes.length + 1).toString();
            myThemesAmountRef.current!.textContent = inactiveThemes.length.toString();
            render(
                <div class="themes-list" /* style={{ overflow: "auto" }} */>
                    {...activeThemes.toReversed().map(
                        (
                            theme: OreUICustomizerTheme | MissingThemeInfo,
                            index: number,
                            array: (OreUICustomizerTheme | MissingThemeInfo)[]
                        ): JSX.SpecificElement<"div"> => (
                            // Add undefined to array to make there be an extra border below the last theme in the list.
                            <ThemesListItem
                                {...{
                                    theme,
                                    index,
                                    array: [...array, undefined!],
                                    active: true,
                                    status:
                                        theme instanceof OreUICustomizerTheme ?
                                            theme.getIsUpdateAvailable() ? "update-available"
                                            : theme.getMessages(["error"]).length > 0 ? "error"
                                            : theme.getMessages(["warning"]).length > 0 ? "warning"
                                            : "none"
                                        :   "missing",
                                }}
                            />
                        )
                    )}
                    <DefaultThemesListItem />
                    <div class="nsel" style={{ textAlign: "left", fontFamily: "NotoSans-Regular", fontSize: "calc(9px * var(--gui-scale))" }}>
                        Themes are applied bottom to top. This means any asset or color customization option that is in two themes will be overridden by the
                        higher theme.
                    </div>
                </div>,
                activeContentRef.current!
            );
            render(
                <div class="themes-list nsel" /* style={{ overflow: "auto" }} */>
                    {inactiveThemes.length === 0 ?
                        <p class="nsel">No themes found.</p>
                    :   undefined}
                    {...inactiveThemes.toReversed().map(
                        (theme: OreUICustomizerTheme | MissingThemeInfo, index: number, array: OreUICustomizerTheme[]): JSX.SpecificElement<"div"> => (
                            // Add undefined to array to make there be an extra border below the last theme in the list.
                            <ThemesListItem
                                {...{
                                    theme,
                                    index,
                                    array: [...array, undefined!],
                                    active: false,
                                    status:
                                        theme instanceof OreUICustomizerTheme ?
                                            theme.getIsUpdateAvailable() ? "update-available"
                                            : theme.getMessages(["error"]).length > 0 ? "error"
                                            : theme.getMessages(["warning"]).length > 0 ? "warning"
                                            : "none"
                                        :   "missing",
                                }}
                            />
                        )
                    )}
                </div>,
                myThemesContentRef.current!
            );
        }
        ThemeManager.on("themeCreated", handleThemeChanged);
        ThemeManager.on("themeEdited", handleThemeChanged);
        ThemeManager.on("themeImported", handleThemeChanged);
        ThemeManager.on("themeRemoved", handleThemeChanged);
        ThemeManager.on("activeThemesChanged", handleThemeChanged);
        return (): void => {
            ThemeManager.off("themeCreated", handleThemeChanged);
            ThemeManager.off("themeEdited", handleThemeChanged);
            ThemeManager.off("themeImported", handleThemeChanged);
            ThemeManager.off("themeRemoved", handleThemeChanged);
            ThemeManager.off("activeThemesChanged", handleThemeChanged);
        };
    });
    return (
        <>
            <CollapsibleSection
                title="Active"
                amount={activeThemes.length + 1}
                amountRef={activeAmountRef}
                containerRef={activeContainerRef}
                contentRef={activeContentRef}
            >
                <div class="themes-list" /* style={{ overflow: "auto" }} */>
                    {...activeThemes.toReversed().map(
                        (
                            theme: OreUICustomizerTheme | MissingThemeInfo,
                            index: number,
                            array: (OreUICustomizerTheme | MissingThemeInfo)[]
                        ): JSX.SpecificElement<"div"> => (
                            // Add undefined to array to make there be an extra border below the last theme in the list.
                            <ThemesListItem
                                {...{
                                    theme,
                                    index,
                                    array: [...array, undefined!],
                                    active: true,
                                    status:
                                        theme instanceof OreUICustomizerTheme ?
                                            theme.getIsUpdateAvailable() ? "update-available"
                                            : theme.getMessages(["error"]).length > 0 ? "error"
                                            : theme.getMessages(["warning"]).length > 0 ? "warning"
                                            : "none"
                                        :   "missing",
                                }}
                            />
                        )
                    )}
                    <DefaultThemesListItem />
                    <div class="nsel" style={{ textAlign: "left", fontFamily: "NotoSans-Regular", fontSize: "calc(9px * var(--gui-scale))" }}>
                        Themes are applied bottom to top. This means any asset or color customization option that is in two themes will be overridden by the
                        higher theme.
                    </div>
                </div>
            </CollapsibleSection>
            <div style={{ height: "calc(8px * var(--gui-scale))", width: "100%" }}></div>
            <CollapsibleSection
                title="My Themes"
                amount={inactiveThemes.length}
                amountRef={myThemesAmountRef}
                containerRef={myThemesContainerRef}
                contentRef={myThemesContentRef}
            >
                <div class="themes-list nsel" /* style={{ overflow: "auto" }} */>
                    {inactiveThemes.length === 0 ?
                        <p class="nsel">No themes found.</p>
                    :   undefined}
                    {...inactiveThemes.toReversed().map(
                        (theme: OreUICustomizerTheme, index: number, array: OreUICustomizerTheme[]): JSX.SpecificElement<"div"> => (
                            // Add undefined to array to make there be an extra border below the last theme in the list.
                            <ThemesListItem
                                {...{
                                    theme,
                                    index,
                                    array: [...array, undefined!],
                                    active: false,
                                    status:
                                        theme instanceof OreUICustomizerTheme ?
                                            theme.getIsUpdateAvailable() ? "update-available"
                                            : theme.getMessages(["error"]).length > 0 ? "error"
                                            : theme.getMessages(["warning"]).length > 0 ? "warning"
                                            : "none"
                                        :   "missing",
                                }}
                            />
                        )
                    )}
                </div>
            </CollapsibleSection>
        </>
    );
}

export type ThemeStatus = "none" | "missing" | "update-available" | "warning" | "error";

export interface ThemeListItemProps {
    /**
     * The theme this list item represents.
     */
    theme: OreUICustomizerTheme | MissingThemeInfo;
    /**
     * The index of the theme in the array of themes.
     */
    index: number;
    /**
     * The array of themes.
     */
    array: (OreUICustomizerTheme | MissingThemeInfo)[];
    /**
     * Whether the theme is currently active.
     *
     * @default false
     */
    active?: boolean;
    /**
     * Whether to disable the theme activation state toggle button.
     *
     * @default false
     */
    disableActivationToggling?: boolean;
    /**
     * The status of the theme.
     *
     * @default "none"
     */
    status?: ThemeStatus;
}

export function ThemesListItem(props: ThemeListItemProps): JSX.SpecificElement<"div"> {
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    function onDetailsClick(event: JSX.TargetedMouseEvent<HTMLDivElement>): void {
        router.history.push(
            `/theme-details?${
                props.theme instanceof OreUICustomizerTheme ?
                    new URLSearchParams({
                        folderPath: props.theme.folderPath,
                    } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ThemeDetails]>).toString()
                :   new URLSearchParams(
                        Object.fromEntries(
                            Object.entries({
                                missingThemeDetails: props.theme,
                            } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ThemeDetails]>).map(
                                ([key, value]: [key: string, value: MissingThemeInfo]): [key: string, value: string] => [
                                    key,
                                    typeof value === "string" ? value : JSON.stringify(value),
                                ]
                            )
                        )
                    ).toString()
            }`
        );
    }
    function onDuplicateClick(event: JSX.TargetedMouseEvent<HTMLDivElement>): void {
        const container: HTMLDivElement = document.createElement("div");
        container.style.width = "calc(300px * var(--gui-scale))";
        container.style.height = "calc(100px * var(--gui-scale))";
        container.style.position = "fixed";
        container.style.top = "calc(50vh - (50px * var(--gui-scale)))";
        container.style.left = "calc(50vw - (150px * var(--gui-scale)))";
        container.classList.add("dialog-hollow-4-thin");
        // hydrate(
        //     <div
        //         style={{
        //             margin: "calc(6px * var(--gui-scale))",
        //             padding: "calc(2px * var(--gui-scale))",
        //             backgroundColor: "#00000088",
        //             width: "calc(100% - (12px * var(--gui-scale)))",
        //             height: "calc(100% - (12px * var(--gui-scale)))",
        //         }}
        //     >
        //         <span>Theme Name</span>
        //         <input
        //             title="Theme Name"
        //             type="text"
        //             class="form-control"
        //             placeholder={props.theme instanceof OreUICustomizerTheme ? `${props.theme.name} - Copy` : "Theme Name"}
        //             onInput={(event: JSX.TargetedInputEvent<HTMLInputElement>): void => {
        //                 event.currentTarget.parentElement!.querySelector("button")!.disabled = event.currentTarget.value.length === 0;
        //             }}
        //             required
        //             style={{ width: "100%" }}
        //         />
        //         <div
        //             style={{
        //                 display: "flex",
        //                 flexDirection: "row",
        //                 justifyContent: "center",
        //                 position: "absolute",
        //                 bottom: "calc(8px * var(--gui-scale))",
        //                 width: "calc(100% - (16px * var(--gui-scale)))",
        //             }}
        //         >
        //             <button
        //                 type="button"
        //                 class="btn"
        //                 disabled
        //                 style={{ flexGrow: 1 }}
        //                 onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
        //                     if (event.currentTarget.disabled) return;
        //                     SoundEffects.popB();
        //                 }}
        //                 onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
        //                     event.currentTarget.blur();
        //                     event.preventDefault();
        //                     event.stopPropagation();
        //                     const name: string = event.currentTarget.parentElement!.parentElement!.querySelector("input")!.value;
        //                     if (event.currentTarget.disabled || name.length === 0) return;
        //                     container.remove();
        //                     const data: SavedOreUICustomizerConfig_Type | undefined =
        //                         props.config instanceof OreUICustomizerConfig ? props.config.toSavedConfigData() : undefined;
        //                     if (!data) return;
        //                     data.metadata.name = name;
        //                     data.metadata.uuid = crypto.randomUUID();
        //                     data.metadata.version = "1.0.0";
        //                     const fileName: string = sanitizeFilename(`${data.metadata.name.slice(0, 25)}-${Date.now()}.json`);
        //                     writeFileSync(path.join(ConfigManager.configsFolder, fileName), JSON.stringify(data, null, 4));
        //                     const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(ConfigManager.configsFolder, fileName));
        //                     ConfigManager.loadedConfigs.push(config);
        //                     ConfigManager.emit("configCreated", config);
        //                 }}
        //             >
        //                 Duplicate
        //             </button>
        //             <button type="button" class="btn" style={{ flexGrow: 1 }} onClick={(): void => container.remove()}>
        //                 Cancel
        //             </button>
        //         </div>
        //     </div>,
        //     container
        // );
        document.body.appendChild(container);
    }
    useEffect((): (() => void) => {
        function handleWindowMouseDown(event: MouseEvent): void {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                containerRef.current.classList.remove("theme-list-item-options-visible");
            }
        }
        window.addEventListener("mousedown", handleWindowMouseDown);
        return (): void => {
            window.removeEventListener("mousedown", handleWindowMouseDown);
        };
    });
    return (
        <div
            class="theme-list-item nsel"
            style={{
                // height: "calc(42px * var(--gui-scale))",
                width: "100%",
            }}
            ref={containerRef}
        >
            <div
                class="theme-list-item-main-container nsel"
                style={{
                    height: "calc((42px * var(--gui-scale)))",
                    width: "calc(100% - (var(--gui-scale) * 2px))",
                    display: "flex",
                    border: "calc(1px * var(--gui-scale)) solid #0000",
                    position: "relative",
                    margin: "calc(3px * var(--gui-scale)) 0",
                }}
                onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                    SoundEffects.popB();
                    event.currentTarget.blur();
                    $(event.currentTarget.parentElement?.parentElement!).find(".theme-list-item").removeClass("theme-list-item-options-visible");
                    event.currentTarget.parentElement?.classList.add("theme-list-item-options-visible");
                }}
            >
                <div
                    class="theme-icon-container nsel"
                    style={{ float: "left", width: "calc(34px * var(--gui-scale))", padding: "calc(4px * var(--gui-scale))" }}
                >
                    <img
                        title="Theme Icon"
                        class="piximg nsel ndrg"
                        src={
                            props.theme instanceof OreUICustomizerTheme ?
                                (props.theme.icon ?? "resource://images/ui/glyphs/brush.png")
                            :   "resource://images/ui/misc/missing_pack_icon.png"
                        }
                        style={{ width: "calc(34px * var(--gui-scale))", height: "calc(34px * var(--gui-scale))" }}
                    />
                </div>
                <div
                    class="theme-text-containers-container nsel"
                    style={{
                        height: "calc(34px * var(--gui-scale))",
                        width: "-webkit-fill-available",
                        minWidth: 0,
                        padding: "calc(4px * var(--gui-scale)) 0",
                        textAlign: "left",
                    }}
                >
                    <div
                        class="theme-name nsel"
                        style={{
                            height: "calc(10px * var(--gui-scale))",
                            width: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textWrap: "nowrap",
                        }}
                    >
                        {props.theme instanceof OreUICustomizerTheme ? props.theme.name : (props.theme.name ?? "MISSING")}
                    </div>
                    {props.theme.metadata && props.theme.metadata.authors && props.theme.metadata.authors.length > 0 && (
                        <div
                            class="theme-author nsel"
                            style={{
                                height: "calc(8.4px * var(--gui-scale))",
                                width: "100%",
                                fontSize: "calc(8.4px * var(--gui-scale))",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                textWrap: "nowrap",
                                fontFamily: "NotoSans-Regular",
                            }}
                        >
                            {props.theme.metadata.authors.length === 1 ? props.theme.metadata.authors[0] : props.theme.metadata.authors.join(", ")}
                        </div>
                    )}
                    <div
                        class="nsel"
                        style={{
                            height: "calc(17px * var(--gui-scale))",
                            width: "100%",
                            fontSize: "calc(8.4px * var(--gui-scale))",
                            // overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontFamily: "NotoSans-Regular",
                        }}
                    >
                        {(props.theme instanceof OreUICustomizerTheme ? props.theme.description : true) && (
                            <div
                                class="theme-description nsel"
                                style={{
                                    // height: "-webkit-fill-available",
                                    width: "100%",
                                    fontSize: "calc(6px * var(--gui-scale))",
                                    maxHeight: "100%",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    webkitLineClamp: 3,
                                    webkitBoxOrient: "vertical",
                                    display: "-webkit-box",
                                    paddingBottom: "calc(1.75px * var(--gui-scale))",
                                    fontFamily: "NotoSans-Regular",
                                }}
                            >
                                {props.theme instanceof OreUICustomizerTheme ? props.theme.description : "This theme is missing!"}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div
                class="theme-list-item-options-container nsel"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    backgroundColor: "#88888844",
                    padding: "calc(1px * var(--gui-scale))",
                    border: "calc(1px * var(--gui-scale)) solid #364343",
                }}
            >
                <div class="button_container disable-sepatator-borderRight nsel" style={{ flexGrow: "1", margin: "calc(2px * var(--gui-scale))" }}>
                    <button
                        type="button"
                        class="btn nsel theme-list-item-toggle-activation-button"
                        disabled={props.disableActivationToggling}
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            if (event.currentTarget.disabled) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            event.currentTarget.blur();
                            event.preventDefault();
                            event.stopPropagation();
                            if (event.currentTarget.disabled) return;
                            if (props.active) {
                                const activeThemes: (OreUICustomizerTheme | MissingThemeInfo)[] = ThemeManager.getActiveThemes();
                                const index: number =
                                    props.theme instanceof OreUICustomizerTheme ?
                                        activeThemes.indexOf(props.theme)
                                    :   activeThemes.findIndex(
                                            (theme: OreUICustomizerTheme | MissingThemeInfo): boolean =>
                                                !(theme instanceof OreUICustomizerTheme) &&
                                                theme.uuid === (props.theme as MissingThemeInfo).uuid &&
                                                theme.version === (props.theme as MissingThemeInfo).version
                                        );
                                console.log(1);
                                if (index === -1) return;
                                console.log(2);
                                activeThemes.splice(index, 1);
                                ThemeManager.setActiveThemes(activeThemes);
                                createToast({
                                    title: `${props.theme.name} deactivated`,
                                });
                            } else {
                                const activeThemes: (OreUICustomizerTheme | MissingThemeInfo)[] = ThemeManager.getActiveThemes();
                                const index: number = activeThemes.indexOf(props.theme);
                                console.log(3);
                                if (index !== -1) return;
                                console.log(4);
                                activeThemes.push(props.theme);
                                ThemeManager.setActiveThemes(activeThemes);
                                createToast({
                                    title: `${props.theme.name} activated`,
                                });
                            }
                        }}
                        style={{ cursor: "pointer", width: "100%", height: "100%", padding: "unset" }}
                    >
                        {props.active ? "Deactivate" : "Activate"}
                    </button>
                </div>
                {props.active && props.index > 0 && (
                    <div
                        title="Move Up"
                        class="theme-list-item-move-up-button nsel"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            if (event.currentTarget.hasAttribute("disabled")) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            event.currentTarget.blur();
                            event.preventDefault();
                            event.stopPropagation();
                            const activeThemes: (OreUICustomizerTheme | MissingThemeInfo)[] = ThemeManager.getActiveThemes();
                            const index: number = activeThemes.indexOf(props.theme);
                            if (index === -1 || index === activeThemes.length - 1) return;
                            event.currentTarget.parentElement?.parentElement?.classList.remove("theme-list-item-options-visible");
                            activeThemes.splice(index, 1);
                            activeThemes.splice(index + 1, 0, props.theme);
                            ThemeManager.setActiveThemes(activeThemes);
                        }}
                        onMouseOver={(event: JSX.TargetedMouseEvent<HTMLImageElement>): void => {
                            const imageElement: HTMLImageElement = event.currentTarget.children[0] as HTMLImageElement;
                            imageElement.style.filter = "";
                        }}
                        onMouseOut={(event: JSX.TargetedMouseEvent<HTMLImageElement>): void => {
                            const imageElement: HTMLImageElement = event.currentTarget.children[0] as HTMLImageElement;
                            imageElement.style.filter = "brightness(0.7)";
                        }}
                        style={{
                            width: "calc(14px * var(--gui-scale))",
                            height: "calc(14px * var(--gui-scale))",
                            cursor: "pointer",
                            margin: "calc(4px * var(--gui-scale)) 0",
                            padding: "0 calc(2.5px * var(--gui-scale))",
                        }}
                    >
                        <img
                            aria-hidden="true"
                            class="piximg nsel ndrg"
                            src="resource://images/ui/glyphs/up_arrow.png"
                            style={{
                                // width: "calc(14px * var(--gui-scale))",
                                height: "calc(14px * var(--gui-scale))",
                                cursor: "pointer",
                                position: "relative",
                                top: "calc((3px * var(--gui-scale) - 1px))",
                                left: "calc(0.5px * var(--gui-scale))",
                                filter: "brightness(0.7)",
                                // margin: "calc(4px * var(--gui-scale)) calc(2px * var(--gui-scale))",
                            }}
                        />
                    </div>
                )}
                {props.active && props.index < props.array.length - 2 && (
                    <div
                        title="Move Down"
                        class="theme-list-item-move-down-button nsel"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            if (event.currentTarget.hasAttribute("disabled")) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            event.currentTarget.blur();
                            event.preventDefault();
                            event.stopPropagation();
                            const activeThemes: (OreUICustomizerTheme | MissingThemeInfo)[] = ThemeManager.getActiveThemes();
                            const index: number = activeThemes.indexOf(props.theme);
                            if (index <= 0) return;
                            event.currentTarget.parentElement?.parentElement?.classList.remove("theme-list-item-options-visible");
                            activeThemes.splice(index, 1);
                            activeThemes.splice(index - 1, 0, props.theme);
                            ThemeManager.setActiveThemes(activeThemes);
                        }}
                        onMouseOver={(event: JSX.TargetedMouseEvent<HTMLImageElement>): void => {
                            const imageElement: HTMLImageElement = event.currentTarget.children[0] as HTMLImageElement;
                            imageElement.style.filter = "";
                        }}
                        onMouseOut={(event: JSX.TargetedMouseEvent<HTMLImageElement>): void => {
                            const imageElement: HTMLImageElement = event.currentTarget.children[0] as HTMLImageElement;
                            imageElement.style.filter = "brightness(0.7)";
                        }}
                        style={{
                            width: "calc(14px * var(--gui-scale))",
                            height: "calc(14px * var(--gui-scale))",
                            cursor: "pointer",
                            margin: "calc(4px * var(--gui-scale)) 0",
                            padding: "0 calc(2.5px * var(--gui-scale))",
                        }}
                    >
                        <img
                            aria-hidden="true"
                            class="piximg nsel ndrg"
                            src="resource://images/ui/glyphs/down_arrow.png"
                            style={{
                                // width: "calc(14px * var(--gui-scale))",
                                height: "calc(14px * var(--gui-scale))",
                                cursor: "pointer",
                                position: "relative",
                                top: "calc(1px * var(--gui-scale))",
                                left: "calc(0.5px * var(--gui-scale))",
                                filter: "brightness(0.7)",
                                // margin: "calc(4px * var(--gui-scale)) calc(2px * var(--gui-scale))",
                            }}
                        />
                    </div>
                )}
                {props.theme instanceof OreUICustomizerTheme && (
                    <div
                        title="Edit"
                        class="theme-list-item-edit-button opacity-effects-on-disabled nsel"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            if (event.currentTarget.hasAttribute("data-disabled")) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            event.currentTarget.blur();
                            event.preventDefault();
                            event.stopPropagation();
                            if (event.currentTarget.hasAttribute("data-disabled")) return;
                            router.history.push(
                                `/theme-editor?${
                                    props.theme instanceof OreUICustomizerTheme ?
                                        new URLSearchParams({
                                            themePath: props.theme.folderPath,
                                        } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ThemeEditor]>).toString()
                                    :   new URLSearchParams({
                                            themeId: props.theme.uuid,
                                            themeVersion: props.theme.version,
                                        } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ThemeEditor]>).toString()
                                }`
                            );
                        }}
                        onMouseOver={(event: JSX.TargetedMouseEvent<HTMLImageElement>): void => {
                            if (event.currentTarget.hasAttribute("data-disabled")) return;
                            const imageElement: HTMLImageElement = event.currentTarget.children[0] as HTMLImageElement;
                            imageElement.style.filter = "";
                        }}
                        onMouseOut={(event: JSX.TargetedMouseEvent<HTMLImageElement>): void => {
                            if (event.currentTarget.hasAttribute("data-disabled")) return;
                            const imageElement: HTMLImageElement = event.currentTarget.children[0] as HTMLImageElement;
                            imageElement.style.filter = "brightness(0.7)";
                        }}
                        style={{
                            width: "calc(14px * var(--gui-scale))",
                            height: "calc(14px * var(--gui-scale))",
                            cursor: "pointer",
                            margin: "calc(4px * var(--gui-scale)) 0",
                            padding: "0 calc(2.5px * var(--gui-scale))",
                        }}
                        data-disabled
                    >
                        <img
                            aria-hidden="true"
                            class="piximg nsel ndrg"
                            src="resource://images/ui/glyphs/Edit.png"
                            style={{
                                // width: "calc(14px * var(--gui-scale))",
                                height: "calc(14px * var(--gui-scale))",
                                cursor: "auto" /* "pointer" */ /* TEMP: Change this back when it is no longer disabled. */,
                                filter: "brightness(0.7)",
                                // margin: "calc(4px * var(--gui-scale)) calc(2px * var(--gui-scale))",
                            }}
                        />
                    </div>
                )}
                {props.theme instanceof OreUICustomizerTheme && (
                    <div
                        title="Duplicate"
                        class="theme-list-item-duplicate-button opacity-effects-on-disabled nsel"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            if (event.currentTarget.hasAttribute("data-disabled")) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            event.currentTarget.blur();
                            event.preventDefault();
                            event.stopPropagation();
                            if (event.currentTarget.hasAttribute("data-disabled")) return;
                            onDuplicateClick(event);
                        }}
                        onMouseOver={(event: JSX.TargetedMouseEvent<HTMLImageElement>): void => {
                            if (event.currentTarget.hasAttribute("data-disabled")) return;
                            const imageElement: HTMLImageElement = event.currentTarget.children[0] as HTMLImageElement;
                            if (imageElement.src === "resource://images/ui/misc/loading_bar.gif") return;
                            if (!imageElement.src.includes("_hover")) imageElement.src = imageElement.src.replace(/(?=\.[^.]+$)/, "_hover");
                        }}
                        onMouseOut={(event: JSX.TargetedMouseEvent<HTMLImageElement>): void => {
                            if (event.currentTarget.hasAttribute("data-disabled")) return;
                            const imageElement: HTMLImageElement = event.currentTarget.children[0] as HTMLImageElement;
                            if (imageElement.src === "resource://images/ui/misc/loading_bar.gif") return;
                            if (imageElement.src.includes("_hover")) imageElement.src = imageElement.src.replace(/_hover(?=\.[^.]+$)/, "");
                        }}
                        style={{
                            width: "calc(14px * var(--gui-scale))",
                            height: "calc(14px * var(--gui-scale))",
                            cursor: "pointer",
                            margin: "calc(4px * var(--gui-scale)) 0",
                            padding: "0 calc(2.5px * var(--gui-scale))",
                        }}
                        data-disabled
                    >
                        <img
                            aria-hidden="true"
                            class="piximg nsel ndrg"
                            src="resource://images/ui/glyphs/copy-color.png"
                            style={{
                                // width: "calc(14px * var(--gui-scale))",
                                height: "calc(14px * var(--gui-scale))",
                                cursor: "auto" /* "pointer" */ /* TEMP: Change this back when it is no longer disabled. */,
                                // margin: "calc(4px * var(--gui-scale)) calc(2px * var(--gui-scale))",
                            }}
                        />
                    </div>
                )}
                <div
                    title="Theme Details"
                    class="theme-list-item-details-button nsel"
                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                        if (event.currentTarget.hasAttribute("disabled")) return;
                        SoundEffects.popB();
                    }}
                    onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                        event.currentTarget.blur();
                        event.preventDefault();
                        event.stopPropagation();
                        if (event.currentTarget.hasAttribute("data-disabled")) return;
                        onDetailsClick(event);
                    }}
                    onMouseOver={(event: JSX.TargetedMouseEvent<HTMLImageElement>): void => {
                        if (event.currentTarget.hasAttribute("data-disabled")) return;
                        const imageElement: HTMLImageElement = event.currentTarget.children[0] as HTMLImageElement;
                        if (imageElement.src === "resource://images/ui/misc/loading_bar.gif") return;
                        if (!imageElement.src.includes("_hover")) imageElement.src = imageElement.src.replace(/(?=\.[^.]+$)/, "_hover");
                    }}
                    onMouseOut={(event: JSX.TargetedMouseEvent<HTMLImageElement>): void => {
                        if (event.currentTarget.hasAttribute("data-disabled")) return;
                        const imageElement: HTMLImageElement = event.currentTarget.children[0] as HTMLImageElement;
                        if (imageElement.src === "resource://images/ui/misc/loading_bar.gif") return;
                        if (imageElement.src.includes("_hover")) imageElement.src = imageElement.src.replace(/_hover(?=\.[^.]+$)/, "");
                    }}
                    style={{
                        width: "calc(14px * var(--gui-scale))",
                        height: "calc(14px * var(--gui-scale))",
                        cursor: "pointer",
                        margin: "calc(4px * var(--gui-scale)) 0",
                        padding: "0 calc(2.5px * var(--gui-scale))",
                    }}
                >
                    <img
                        aria-hidden="true"
                        class="piximg nsel ndrg"
                        src={
                            props.status === "error" ? "resource://images/ui/glyphs/ErrorGlyph_small.png"
                            : props.status === "warning" ?
                                "resource://images/ui/glyphs/WarningGlyph_small.png"
                            : props.status === "update-available" ?
                                "resource://images/ui/glyphs/UpdateGlyph_small.png"
                            : props.status === "missing" ?
                                "resource://images/ui/misc/loading_bar.gif"
                            :   "resource://images/ui/glyphs/infobulb.png"
                        }
                        style={{
                            // width: "calc(14px * var(--gui-scale))",
                            height: props.status === "missing" ? undefined : "calc(14px * var(--gui-scale))",
                            width: props.status === "missing" ? "calc(14px * var(--gui-scale))" : undefined,
                            cursor: "pointer",
                            // margin: "calc(4px * var(--gui-scale)) calc(2px * var(--gui-scale))",
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export function DefaultThemesListItem(): JSX.SpecificElement<"div"> {
    return (
        <div
            class="theme-list-item nsel ndrg no-bottom-border"
            style={{
                // height: "calc(42px * var(--gui-scale))",
                width: "100%",
                pointerEvents: "none",
            }}
            inert
            tabIndex={-1}
        >
            <div
                class="theme-list-item-main-container nsel"
                style={{
                    height: "calc((42px * var(--gui-scale)))",
                    width: "calc(100% - (var(--gui-scale) * 2px))",
                    display: "flex",
                    border: "calc(1px * var(--gui-scale)) solid #0000",
                    position: "relative",
                    margin: "calc(3px * var(--gui-scale)) 0",
                }}
                onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                    event.preventDefault();
                    event.currentTarget.blur();
                }}
            >
                <div
                    class="theme-icon-container nsel"
                    style={{ float: "left", width: "calc(34px * var(--gui-scale))", padding: "calc(4px * var(--gui-scale))" }}
                >
                    <img
                        title="Theme Icon"
                        class="piximg nsel ndrg"
                        src="resource://./icon.png"
                        style={{ width: "calc(34px * var(--gui-scale))", height: "calc(34px * var(--gui-scale))" }}
                    />
                </div>
                <div
                    class="theme-text-containers-container nsel"
                    style={{
                        height: "calc(34px * var(--gui-scale))",
                        width: "-webkit-fill-available",
                        minWidth: 0,
                        padding: "calc(4px * var(--gui-scale)) 0",
                        textAlign: "left",
                    }}
                >
                    <div
                        class="theme-name nsel"
                        style={{
                            height: "calc(10px * var(--gui-scale))",
                            width: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textWrap: "nowrap",
                        }}
                    >
                        Default Theme
                    </div>
                    <div
                        class="nsel"
                        style={{
                            height: "calc(17px * var(--gui-scale))",
                            width: "100%",
                            fontSize: "calc(8.4px * var(--gui-scale))",
                            // overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontFamily: "NotoSans-Regular",
                        }}
                    >
                        <div
                            class="theme-description nsel"
                            style={{
                                // height: "-webkit-fill-available",
                                width: "100%",
                                fontSize: "calc(6px * var(--gui-scale))",
                                maxHeight: "100%",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                webkitLineClamp: 3,
                                webkitBoxOrient: "vertical",
                                display: "-webkit-box",
                                paddingBottom: "calc(1.75px * var(--gui-scale))",
                                fontFamily: "NotoSans-Regular",
                            }}
                        >
                            The default Ore UI Customizer theme.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
