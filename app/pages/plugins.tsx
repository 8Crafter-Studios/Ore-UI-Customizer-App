import type { JSX, RefObject } from "preact";
import _React, { hydrate, render, useEffect, useRef } from "preact/compat";
import { OreUICustomizerPlugin, PluginManager, type MissingPluginInfo } from "../../src/utils/PluginManager";
import type { CustomizerAppPage, SearchParamTypes } from "../../src/utils/pageList";
import CollapsibleSection from "../components/CollapsibleSection";
import { dialog } from "@electron/remote";
import { createToast } from "../components/Toast";

export default function PluginsPage(): JSX.SpecificElement<"center"> {
    const centerRef: RefObject<HTMLElement> = useRef<HTMLElement>(null);
    return (
        <center style={{ backgroundColor: "#44444488", padding: "0 12px 12px 12px", height: "100%", overflow: "auto" }} ref={centerRef}>
            <h1>Plugins</h1>
            <PluginsList />
            <div style={{ height: "calc(8px * var(--gui-scale))", width: "100%" }}></div>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }} class="button_container horizontal">
                {/* <button
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
                    }}
                >
                    Create Plugin
                </button> */}
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
                            filters: [
                                { name: "Plugin", extensions: ["mcouicplugin", "ouicplugin"] },
                                { name: "Single-File Plugin", extensions: ["cjs", "mjs", "js"] },
                            ],
                            message: "Select plugin files to import",
                            properties: ["openFile", "showHiddenFiles", "treatPackageAsDirectory", "multiSelections"],
                            title: "Import Plugins",
                        });
                        if (result.canceled) return;
                        const pluginPaths: string[] = result.filePaths;
                        pluginPaths.forEach((pluginPath: string): void => {
                            currentWindow.webContents.send<1>("import-from-file", pluginPath, "plugin");
                        });
                    }}
                >
                    Import Plugin
                </button>
            </div>
        </center>
    );
}

export function PluginsList(): JSX.SpecificElement<"ul"> {
    const activeAmountRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const activeContainerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const activeContentRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const myPluginsAmountRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const myPluginsContainerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const myPluginsContentRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    let activePlugins: (OreUICustomizerPlugin | MissingPluginInfo)[] = PluginManager.getActivePlugins();
    let inactivePlugins: OreUICustomizerPlugin[] = PluginManager.getInactivePlugins();
    useEffect((): (() => void) => {
        function handlePluginChanged(): void {
            activePlugins = PluginManager.getActivePlugins();
            inactivePlugins = PluginManager.getInactivePlugins();
            activeAmountRef.current!.textContent = (activePlugins.length + 1).toString();
            myPluginsAmountRef.current!.textContent = inactivePlugins.length.toString();
            render(
                <div class="plugins-list" /* style={{ overflow: "auto" }} */>
                    {...activePlugins.toReversed().map(
                        (
                            plugin: OreUICustomizerPlugin | MissingPluginInfo,
                            index: number,
                            array: (OreUICustomizerPlugin | MissingPluginInfo)[]
                        ): JSX.SpecificElement<"div"> => (
                            // Add undefined to array to make there be an extra border below the last plugin in the list.
                            <PluginsListItem
                                {...{
                                    plugin,
                                    index,
                                    array: [...array, undefined!],
                                    active: true,
                                    status:
                                        plugin instanceof OreUICustomizerPlugin
                                            ? plugin.getIsUpdateAvailable()
                                                ? "update-available"
                                                : plugin.getMessages(["error"]).length > 0
                                                ? "error"
                                                : plugin.getMessages(["warning"]).length > 0
                                                ? "warning"
                                                : "none"
                                            : "missing",
                                }}
                            />
                        )
                    )}
                    <DefaultPluginsListItem />
                    <div class="nsel" style={{ textAlign: "left", fontFamily: "NotoSans-Regular", fontSize: "calc(9px * var(--gui-scale))" }}>
                        Plugins are applied bottom to top. This means higher plugins will run after lower plugins.
                    </div>
                </div>,
                activeContentRef.current!
            );
            render(
                <div class="plugins-list nsel" /* style={{ overflow: "auto" }} */>
                    {inactivePlugins.length === 0 ? <p class="nsel">No plugins found.</p> : undefined}
                    {...inactivePlugins.toReversed().map(
                        (plugin: OreUICustomizerPlugin | MissingPluginInfo, index: number, array: OreUICustomizerPlugin[]): JSX.SpecificElement<"div"> => (
                            // Add undefined to array to make there be an extra border below the last plugin in the list.
                            <PluginsListItem
                                {...{
                                    plugin,
                                    index,
                                    array: [...array, undefined!],
                                    active: false,
                                    status:
                                        plugin instanceof OreUICustomizerPlugin
                                            ? plugin.getIsUpdateAvailable()
                                                ? "update-available"
                                                : plugin.getMessages(["error"]).length > 0
                                                ? "error"
                                                : plugin.getMessages(["warning"]).length > 0
                                                ? "warning"
                                                : "none"
                                            : "missing",
                                }}
                            />
                        )
                    )}
                </div>,
                myPluginsContentRef.current!
            );
        }
        PluginManager.on("pluginImported", handlePluginChanged);
        PluginManager.on("pluginRemoved", handlePluginChanged);
        PluginManager.on("pluginRefreshed", handlePluginChanged);
        PluginManager.on("activePluginsChanged", handlePluginChanged);
        return (): void => {
            PluginManager.off("pluginImported", handlePluginChanged);
            PluginManager.off("pluginRemoved", handlePluginChanged);
            PluginManager.off("pluginRefreshed", handlePluginChanged);
            PluginManager.off("activePluginsChanged", handlePluginChanged);
        };
    });
    return (
        <>
            <CollapsibleSection
                title="Active"
                amount={activePlugins.length + 1}
                amountRef={activeAmountRef}
                containerRef={activeContainerRef}
                contentRef={activeContentRef}
            >
                <div class="plugins-list" /* style={{ overflow: "auto" }} */>
                    {...activePlugins.toReversed().map(
                        (
                            plugin: OreUICustomizerPlugin | MissingPluginInfo,
                            index: number,
                            array: (OreUICustomizerPlugin | MissingPluginInfo)[]
                        ): JSX.SpecificElement<"div"> => (
                            // Add undefined to array to make there be an extra border below the last plugin in the list.
                            <PluginsListItem
                                {...{
                                    plugin,
                                    index,
                                    array: [...array, undefined!],
                                    active: true,
                                    status:
                                        plugin instanceof OreUICustomizerPlugin
                                            ? plugin.getIsUpdateAvailable()
                                                ? "update-available"
                                                : plugin.getMessages(["error"]).length > 0
                                                ? "error"
                                                : plugin.getMessages(["warning"]).length > 0
                                                ? "warning"
                                                : "none"
                                            : "missing",
                                }}
                            />
                        )
                    )}
                    <DefaultPluginsListItem />
                    <div class="nsel" style={{ textAlign: "left", fontFamily: "NotoSans-Regular", fontSize: "calc(9px * var(--gui-scale))" }}>
                        Plugins are applied bottom to top. This means any option that is in two plugins will be overridden by the higher plugin.
                    </div>
                </div>
            </CollapsibleSection>
            <div style={{ height: "calc(8px * var(--gui-scale))", width: "100%" }}></div>
            <CollapsibleSection
                title="My Plugins"
                amount={inactivePlugins.length}
                amountRef={myPluginsAmountRef}
                containerRef={myPluginsContainerRef}
                contentRef={myPluginsContentRef}
            >
                <div class="plugins-list nsel" /* style={{ overflow: "auto" }} */>
                    {inactivePlugins.length === 0 ? <p class="nsel">No plugins found.</p> : undefined}
                    {...inactivePlugins.toReversed().map(
                        (plugin: OreUICustomizerPlugin, index: number, array: OreUICustomizerPlugin[]): JSX.SpecificElement<"div"> => (
                            // Add undefined to array to make there be an extra border below the last plugin in the list.
                            <PluginsListItem
                                {...{
                                    plugin,
                                    index,
                                    array: [...array, undefined!],
                                    active: false,
                                    status:
                                        plugin instanceof OreUICustomizerPlugin
                                            ? plugin.getIsUpdateAvailable()
                                                ? "update-available"
                                                : plugin.getMessages(["error"]).length > 0
                                                ? "error"
                                                : plugin.getMessages(["warning"]).length > 0
                                                ? "warning"
                                                : "none"
                                            : "missing",
                                }}
                            />
                        )
                    )}
                </div>
            </CollapsibleSection>
        </>
    );
}

export type PluginStatus = "none" | "missing" | "update-available" | "warning" | "error";

export interface PluginListItemProps {
    /**
     * The plugin this list item represents.
     */
    plugin: OreUICustomizerPlugin | MissingPluginInfo;
    /**
     * The index of the plugin in the array of plugins.
     */
    index: number;
    /**
     * The array of plugins.
     */
    array: (OreUICustomizerPlugin | MissingPluginInfo)[];
    /**
     * Whether the plugin is currently active.
     *
     * @default false
     */
    active?: boolean;
    /**
     * Whether to disable the plugin activation state toggle button.
     *
     * @default false
     */
    disableActivationToggling?: boolean;
    /**
     * The status of the plugin.
     *
     * @default "none"
     */
    status?: PluginStatus;
}

export function PluginsListItem(props: PluginListItemProps): JSX.SpecificElement<"div"> {
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    function onDetailsClick(event: JSX.TargetedMouseEvent<HTMLDivElement>): void {
        router.history.push(
            `/plugin-details?${
                props.plugin instanceof OreUICustomizerPlugin
                    ? new URLSearchParams({
                          folderPath: props.plugin.folderPath,
                      } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.PluginDetails]>).toString()
                    : new URLSearchParams(
                          Object.fromEntries(
                              Object.entries({
                                  missingPluginDetails: props.plugin,
                              } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.PluginDetails]>).map(
                                  ([key, value]: [key: string, value: MissingPluginInfo]): [key: string, value: string] => [
                                      key,
                                      typeof value === "string" ? value : JSON.stringify(value),
                                  ]
                              )
                          )
                      ).toString()
            }`
        );
    }
    useEffect((): (() => void) => {
        function handleWindowMouseDown(event: MouseEvent): void {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                containerRef.current.classList.remove("plugin-list-item-options-visible");
            }
        }
        window.addEventListener("mousedown", handleWindowMouseDown);
        return (): void => {
            window.removeEventListener("mousedown", handleWindowMouseDown);
        };
    });
    return (
        <div
            class="plugin-list-item nsel"
            style={{
                // height: "calc(42px * var(--gui-scale))",
                width: "100%",
            }}
            ref={containerRef}
        >
            <div
                class="plugin-list-item-main-container nsel"
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
                    $(event.currentTarget.parentElement?.parentElement!).find(".plugin-list-item").removeClass("plugin-list-item-options-visible");
                    event.currentTarget.parentElement?.classList.add("plugin-list-item-options-visible");
                }}
            >
                <div
                    class="plugin-icon-container nsel"
                    style={{ float: "left", width: "calc(34px * var(--gui-scale))", padding: "calc(4px * var(--gui-scale))" }}
                >
                    <img
                        title="Plugin Icon"
                        class="piximg nsel ndrg"
                        src={
                            props.plugin instanceof OreUICustomizerPlugin
                                ? props.plugin.icon ?? "resource://images/ui/glyphs/Source.png"
                                : "resource://images/ui/misc/missing_pack_icon.png"
                        }
                        style={{ width: "calc(34px * var(--gui-scale))", height: "calc(34px * var(--gui-scale))" }}
                    />
                </div>
                <div
                    class="plugin-text-containers-container nsel"
                    style={{
                        height: "calc(34px * var(--gui-scale))",
                        width: "-webkit-fill-available",
                        minWidth: 0,
                        padding: "calc(4px * var(--gui-scale)) 0",
                        textAlign: "left",
                    }}
                >
                    <div
                        class="plugin-name nsel"
                        style={{
                            height: "calc(10px * var(--gui-scale))",
                            width: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textWrap: "nowrap",
                        }}
                    >
                        {props.plugin instanceof OreUICustomizerPlugin ? props.plugin.name : props.plugin.name ?? "MISSING"}
                    </div>
                    {props.plugin.metadata && props.plugin.metadata.authors && props.plugin.metadata.authors.length > 0 && (
                        <div
                            class="plugin-author nsel"
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
                            {props.plugin.metadata.authors.length === 1 ? props.plugin.metadata.authors[0] : props.plugin.metadata.authors.join(", ")}
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
                        {props.plugin instanceof OreUICustomizerPlugin && props.plugin.description && (
                            <div
                                class="plugin-description nsel"
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
                                {props.plugin instanceof OreUICustomizerPlugin ? props.plugin.description : "This plugin is missing!"}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div
                class="plugin-list-item-options-container nsel"
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
                        class="btn nsel plugin-list-item-toggle-activation-button"
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
                                const activePlugins: (OreUICustomizerPlugin | MissingPluginInfo)[] = PluginManager.getActivePlugins();
                                const index: number =
                                    props.plugin instanceof OreUICustomizerPlugin
                                        ? activePlugins.indexOf(props.plugin)
                                        : activePlugins.findIndex(
                                              (plugin: OreUICustomizerPlugin | MissingPluginInfo): boolean =>
                                                  !(plugin instanceof OreUICustomizerPlugin) &&
                                                  plugin.uuid === (props.plugin as MissingPluginInfo).uuid &&
                                                  plugin.version === (props.plugin as MissingPluginInfo).version
                                          );
                                console.log(1);
                                if (index === -1) return;
                                console.log(2);
                                activePlugins.splice(index, 1);
                                PluginManager.setActivePlugins(activePlugins);
                                createToast({
                                    title: `${props.plugin.name} deactivated`,
                                });
                            } else {
                                const activePlugins: (OreUICustomizerPlugin | MissingPluginInfo)[] = PluginManager.getActivePlugins();
                                const index: number = activePlugins.indexOf(props.plugin);
                                console.log(3);
                                if (index !== -1) return;
                                console.log(4);
                                activePlugins.push(props.plugin);
                                PluginManager.setActivePlugins(activePlugins);
                                createToast({
                                    title: `${props.plugin.name} activated`,
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
                        class="plugin-list-item-move-up-button nsel"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            if (event.currentTarget.hasAttribute("disabled")) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            event.currentTarget.blur();
                            event.preventDefault();
                            event.stopPropagation();
                            const activePlugins: (OreUICustomizerPlugin | MissingPluginInfo)[] = PluginManager.getActivePlugins();
                            const index: number = activePlugins.indexOf(props.plugin);
                            if (index === -1 || index === activePlugins.length - 1) return;
                            event.currentTarget.parentElement?.parentElement?.classList.remove("plugin-list-item-options-visible");
                            activePlugins.splice(index, 1);
                            activePlugins.splice(index + 1, 0, props.plugin);
                            PluginManager.setActivePlugins(activePlugins);
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
                        class="plugin-list-item-move-down-button nsel"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            if (event.currentTarget.hasAttribute("disabled")) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            event.currentTarget.blur();
                            event.preventDefault();
                            event.stopPropagation();
                            const activePlugins: (OreUICustomizerPlugin | MissingPluginInfo)[] = PluginManager.getActivePlugins();
                            const index: number = activePlugins.indexOf(props.plugin);
                            if (index <= 0) return;
                            event.currentTarget.parentElement?.parentElement?.classList.remove("plugin-list-item-options-visible");
                            activePlugins.splice(index, 1);
                            activePlugins.splice(index - 1, 0, props.plugin);
                            PluginManager.setActivePlugins(activePlugins);
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
                <div
                    title="Plugin Details"
                    class="plugin-list-item-details-button nsel"
                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                        if (event.currentTarget.hasAttribute("disabled")) return;
                        SoundEffects.popB();
                    }}
                    onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                        event.currentTarget.blur();
                        event.preventDefault();
                        event.stopPropagation();
                        onDetailsClick(event);
                    }}
                    onMouseOver={(event: JSX.TargetedMouseEvent<HTMLImageElement>): void => {
                        const imageElement: HTMLImageElement = event.currentTarget.children[0] as HTMLImageElement;
                        if (imageElement.src === "resource://images/ui/misc/loading_bar.gif") return;
                        if (!imageElement.src.includes("_hover")) imageElement.src = imageElement.src.replace(/(?=\.[^.]+$)/, "_hover");
                    }}
                    onMouseOut={(event: JSX.TargetedMouseEvent<HTMLImageElement>): void => {
                        const imageElement: HTMLImageElement = event.currentTarget.children[0] as HTMLImageElement;
                        if (imageElement.src === "resource://images/ui/misc/loading_bar.gif") return;
                        if (imageElement.src.includes("_hover")) imageElement.src = imageElement.src.replace(/_hover(?=\.[^.]+$)/, "");
                    }}
                    style={{
                        width: "calc(14px * var(--gui-scale))",
                        height: "calc(14px * var(--gui-scale))",
                        cursor: "pointer",
                        margin: "calc(4px * var(--gui-scale)) 0",
                        padding: "0 calc(2px * var(--gui-scale))",
                    }}
                >
                    <img
                        aria-hidden="true"
                        class="piximg nsel ndrg"
                        src={
                            props.status === "error"
                                ? "resource://images/ui/glyphs/ErrorGlyph_small.png"
                                : props.status === "warning"
                                ? "resource://images/ui/glyphs/WarningGlyph_small.png"
                                : props.status === "update-available"
                                ? "resource://images/ui/glyphs/UpdateGlyph_small.png"
                                : props.status === "missing"
                                ? "resource://images/ui/misc/loading_bar.gif"
                                : "resource://images/ui/glyphs/infobulb.png"
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

export function DefaultPluginsListItem(): JSX.SpecificElement<"div"> {
    return (
        <div
            class="plugin-list-item nsel ndrg no-bottom-border"
            style={{
                // height: "calc(42px * var(--gui-scale))",
                width: "100%",
                pointerEvents: "none",
            }}
            inert
            tabIndex={-1}
        >
            <div
                class="plugin-list-item-main-container nsel"
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
                    class="plugin-icon-container nsel"
                    style={{ float: "left", width: "calc(34px * var(--gui-scale))", padding: "calc(4px * var(--gui-scale))" }}
                >
                    <img
                        title="Plugin Icon"
                        class="piximg nsel ndrg"
                        src="resource://icon.png"
                        style={{ width: "calc(34px * var(--gui-scale))", height: "calc(34px * var(--gui-scale))" }}
                    />
                </div>
                <div
                    class="plugin-text-containers-container nsel"
                    style={{
                        height: "calc(34px * var(--gui-scale))",
                        width: "-webkit-fill-available",
                        minWidth: 0,
                        padding: "calc(4px * var(--gui-scale)) 0",
                        textAlign: "left",
                    }}
                >
                    <div
                        class="plugin-name nsel"
                        style={{
                            height: "calc(10px * var(--gui-scale))",
                            width: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textWrap: "nowrap",
                        }}
                    >
                        Ore UI Customizer
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
                            class="plugin-description nsel"
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
                            The built-in Ore UI Customizer functionality.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
