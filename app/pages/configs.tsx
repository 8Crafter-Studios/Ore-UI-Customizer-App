import type { JSX, RefObject } from "preact";
import _React, { hydrate, render, useEffect, useRef } from "preact/compat";
import { OreUICustomizerConfig, ConfigManager, type MissingConfigInfo, type SavedOreUICustomizerConfig_Type } from "../../src/utils/ConfigManager";
import type { CustomizerAppPage, SearchParamTypes } from "../../src/utils/pageList";
import CollapsibleSection from "../components/CollapsibleSection";
import { dialog } from "@electron/remote";
import { createToast } from "../components/Toast";
import { writeFileSync } from "node:fs";
import { sanitizeFilename } from "../../src/utils/sanitize-filename";
import path from "node:path";
import { format_version } from "../../src/utils/ore-ui-customizer-api";

export default function ConfigsPage(): JSX.SpecificElement<"center"> {
    const centerRef: RefObject<HTMLElement> = useRef<HTMLElement>(null);
    return (
        <center style={{ backgroundColor: "#44444488", padding: "0 12px 12px 12px", height: "100%", overflow: "auto" }} ref={centerRef}>
            <h1>Configs</h1>
            <ConfigsList />
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
                        const container: HTMLDivElement = document.createElement("div");
                        container.style.width = "calc(300px * var(--gui-scale))";
                        container.style.height = "calc(100px * var(--gui-scale))";
                        container.style.position = "fixed";
                        container.style.top = "calc(50vh - (50px * var(--gui-scale)))";
                        container.style.left = "calc(50vw - (150px * var(--gui-scale)))";
                        container.classList.add("dialog-hollow-4-thin");
                        hydrate(
                            <div
                                style={{
                                    margin: "calc(6px * var(--gui-scale))",
                                    padding: "calc(2px * var(--gui-scale))",
                                    backgroundColor: "#00000088",
                                    width: "calc(100% - (12px * var(--gui-scale)))",
                                    height: "calc(100% - (12px * var(--gui-scale)))",
                                }}
                            >
                                <span>Config Name</span>
                                <input
                                    title="Config Name"
                                    type="text"
                                    class="form-control"
                                    placeholder={"Config Name"}
                                    onInput={(event: JSX.TargetedInputEvent<HTMLInputElement>): void => {
                                        event.currentTarget.parentElement!.querySelector("button")!.disabled = event.currentTarget.value.length === 0;
                                    }}
                                    required
                                    style={{ width: "100%" }}
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        position: "absolute",
                                        bottom: "calc(8px * var(--gui-scale))",
                                        width: "calc(100% - (16px * var(--gui-scale)))",
                                    }}
                                >
                                    <button
                                        type="button"
                                        class="btn"
                                        disabled
                                        style={{ flexGrow: 1 }}
                                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                                            if (event.currentTarget.disabled) return;
                                            SoundEffects.popB();
                                        }}
                                        onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                                            event.currentTarget.blur();
                                            event.preventDefault();
                                            event.stopPropagation();
                                            const name: string = event.currentTarget.parentElement!.parentElement!.querySelector("input")!.value;
                                            if (event.currentTarget.disabled || name.length === 0) return;
                                            container.remove();
                                            const data: SavedOreUICustomizerConfig_Type | undefined = {
                                                oreUICustomizerConfig: {},
                                                oreUICustomizerVersion: format_version,
                                                metadata: {
                                                    name,
                                                    uuid: crypto.randomUUID(),
                                                    version: "1.0.0",
                                                    product_type: "config",
                                                },
                                                readonly: false,
                                            };
                                            const fileName: string = sanitizeFilename(`${data.metadata.name.slice(0, 25)}-${Date.now()}.json`);
                                            writeFileSync(path.join(ConfigManager.configsFolder, fileName), JSON.stringify(data, null, 4));
                                            const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(ConfigManager.configsFolder, fileName));
                                            ConfigManager.loadedConfigs.push(config);
                                            ConfigManager.emit("configCreated", config);
                                            router.history.push(
                                                `/config-editor?${new URLSearchParams({
                                                    configPath: config.filePath,
                                                } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ConfigEditor]>).toString()}`
                                            );
                                        }}
                                    >
                                        Create
                                    </button>
                                    <button type="button" class="btn" style={{ flexGrow: 1 }} onClick={(): void => container.remove()}>
                                        Cancel
                                    </button>
                                </div>
                            </div>,
                            container
                        );
                        document.body.appendChild(container);
                    }}
                >
                    Create Config
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
                            filters: [{ name: "Config", extensions: ["mcouicconfig", "ouicconfig", "json", "jsonc", "jsonl", "jsonld"] }],
                            message: "Select config files to import",
                            properties: ["openFile", "showHiddenFiles", "treatPackageAsDirectory", "multiSelections"],
                            title: "Import Configs",
                        });
                        if (result.canceled) return;
                        const configPaths: string[] = result.filePaths;
                        configPaths.forEach((configPath: string): void => {
                            currentWindow.webContents.send<1>("import-from-file", configPath, "config");
                        });
                    }}
                >
                    Import Config
                </button>
            </div>
        </center>
    );
}

export function ConfigsList(): JSX.Element {
    const activeAmountRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const activeContainerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const activeContentRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const myConfigsAmountRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const myConfigsContainerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const myConfigsContentRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    let activeConfigs: (OreUICustomizerConfig | MissingConfigInfo)[] = ConfigManager.getActiveConfigs();
    let inactiveConfigs: OreUICustomizerConfig[] = ConfigManager.getInactiveConfigs();
    useEffect((): (() => void) => {
        function handleConfigChanged(): void {
            activeConfigs = ConfigManager.getActiveConfigs();
            inactiveConfigs = ConfigManager.getInactiveConfigs();
            activeAmountRef.current!.textContent = (activeConfigs.length + 1).toString();
            myConfigsAmountRef.current!.textContent = inactiveConfigs.length.toString();
            render(
                <div class="configs-list" /* style={{ overflow: "auto" }} */>
                    {...activeConfigs.toReversed().map(
                        (
                            config: OreUICustomizerConfig | MissingConfigInfo,
                            index: number,
                            array: (OreUICustomizerConfig | MissingConfigInfo)[]
                        ): JSX.SpecificElement<"div"> => (
                            // Add undefined to array to make there be an extra border below the last config in the list.
                            <ConfigsListItem
                                {...{
                                    config,
                                    index,
                                    array: [...array, undefined!],
                                    active: true,
                                    status:
                                        config instanceof OreUICustomizerConfig
                                            ? config.getIsUpdateAvailable()
                                                ? "update-available"
                                                : config.getMessages(["error"]).length > 0
                                                ? "error"
                                                : config.getMessages(["warning"]).length > 0
                                                ? "warning"
                                                : "none"
                                            : "missing",
                                }}
                            />
                        )
                    )}
                    <DefaultConfigsListItem />
                    <div class="nsel" style={{ textAlign: "left", fontFamily: "NotoSans-Regular", fontSize: "calc(9px * var(--gui-scale))" }}>
                        Configs are applied bottom to top. This means any option that is in two configs will be overridden by the higher config.
                    </div>
                </div>,
                activeContentRef.current!
            );
            render(
                <div class="configs-list nsel" /* style={{ overflow: "auto" }} */>
                    {inactiveConfigs.length === 0 ? <p class="nsel">No configs found.</p> : undefined}
                    {...inactiveConfigs.toReversed().map(
                        (config: OreUICustomizerConfig | MissingConfigInfo, index: number, array: OreUICustomizerConfig[]): JSX.SpecificElement<"div"> => (
                            // Add undefined to array to make there be an extra border below the last config in the list.
                            <ConfigsListItem
                                {...{
                                    config,
                                    index,
                                    array: [...array, undefined!],
                                    active: false,
                                    status:
                                        config instanceof OreUICustomizerConfig
                                            ? config.getIsUpdateAvailable()
                                                ? "update-available"
                                                : config.getMessages(["error"]).length > 0
                                                ? "error"
                                                : config.getMessages(["warning"]).length > 0
                                                ? "warning"
                                                : "none"
                                            : "missing",
                                }}
                            />
                        )
                    )}
                </div>,
                myConfigsContentRef.current!
            );
        }
        ConfigManager.on("configCreated", handleConfigChanged);
        ConfigManager.on("configEdited", handleConfigChanged);
        ConfigManager.on("configImported", handleConfigChanged);
        ConfigManager.on("configRemoved", handleConfigChanged);
        ConfigManager.on("activeConfigsChanged", handleConfigChanged);
        return (): void => {
            ConfigManager.off("configCreated", handleConfigChanged);
            ConfigManager.off("configEdited", handleConfigChanged);
            ConfigManager.off("configImported", handleConfigChanged);
            ConfigManager.off("configRemoved", handleConfigChanged);
            ConfigManager.off("activeConfigsChanged", handleConfigChanged);
        };
    });
    return (
        <>
            <CollapsibleSection
                title="Active"
                amount={activeConfigs.length + 1}
                amountRef={activeAmountRef}
                containerRef={activeContainerRef}
                contentRef={activeContentRef}
            >
                <div class="configs-list" /* style={{ overflow: "auto" }} */>
                    {...activeConfigs.toReversed().map(
                        (
                            config: OreUICustomizerConfig | MissingConfigInfo,
                            index: number,
                            array: (OreUICustomizerConfig | MissingConfigInfo)[]
                        ): JSX.SpecificElement<"div"> => (
                            // Add undefined to array to make there be an extra border below the last config in the list.
                            <ConfigsListItem
                                {...{
                                    config,
                                    index,
                                    array: [...array, undefined!],
                                    active: true,
                                    status:
                                        config instanceof OreUICustomizerConfig
                                            ? config.getIsUpdateAvailable()
                                                ? "update-available"
                                                : config.getMessages(["error"]).length > 0
                                                ? "error"
                                                : config.getMessages(["warning"]).length > 0
                                                ? "warning"
                                                : "none"
                                            : "missing",
                                }}
                            />
                        )
                    )}
                    <DefaultConfigsListItem />
                    <div class="nsel" style={{ textAlign: "left", fontFamily: "NotoSans-Regular", fontSize: "calc(9px * var(--gui-scale))" }}>
                        Configs are applied bottom to top. This means any option that is in two configs will be overridden by the higher config.
                    </div>
                </div>
            </CollapsibleSection>
            <div style={{ height: "calc(8px * var(--gui-scale))", width: "100%" }}></div>
            <CollapsibleSection
                title="My Configs"
                amount={inactiveConfigs.length}
                amountRef={myConfigsAmountRef}
                containerRef={myConfigsContainerRef}
                contentRef={myConfigsContentRef}
            >
                <div class="configs-list nsel" /* style={{ overflow: "auto" }} */>
                    {inactiveConfigs.length === 0 ? <p class="nsel">No configs found.</p> : undefined}
                    {...inactiveConfigs.toReversed().map(
                        (config: OreUICustomizerConfig, index: number, array: OreUICustomizerConfig[]): JSX.SpecificElement<"div"> => (
                            // Add undefined to array to make there be an extra border below the last config in the list.
                            <ConfigsListItem
                                {...{
                                    config,
                                    index,
                                    array: [...array, undefined!],
                                    active: false,
                                    status:
                                        config instanceof OreUICustomizerConfig
                                            ? config.getIsUpdateAvailable()
                                                ? "update-available"
                                                : config.getMessages(["error"]).length > 0
                                                ? "error"
                                                : config.getMessages(["warning"]).length > 0
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

export type ConfigStatus = "none" | "missing" | "update-available" | "warning" | "error";

export interface ConfigListItemProps {
    /**
     * The config this list item represents.
     */
    config: OreUICustomizerConfig | MissingConfigInfo;
    /**
     * The index of the config in the array of configs.
     */
    index: number;
    /**
     * The array of configs.
     */
    array: (OreUICustomizerConfig | MissingConfigInfo)[];
    /**
     * Whether the config is currently active.
     *
     * @default false
     */
    active?: boolean;
    /**
     * Whether to disable the config activation state toggle button.
     *
     * @default false
     */
    disableActivationToggling?: boolean;
    /**
     * The status of the config.
     *
     * @default "none"
     */
    status?: ConfigStatus;
}

export function ConfigsListItem(props: ConfigListItemProps): JSX.SpecificElement<"div"> {
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    function onDetailsClick(event: JSX.TargetedMouseEvent<HTMLDivElement>): void {
        router.history.push(
            `/config-details?${
                props.config instanceof OreUICustomizerConfig
                    ? new URLSearchParams({
                          filePath: props.config.filePath,
                      } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ConfigDetails]>).toString()
                    : new URLSearchParams(
                          Object.fromEntries(
                              Object.entries({
                                  missingConfigDetails: props.config,
                              } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ConfigDetails]>).map(
                                  ([key, value]: [key: string, value: MissingConfigInfo]): [key: string, value: string] => [
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
        hydrate(
            <div
                style={{
                    margin: "calc(6px * var(--gui-scale))",
                    padding: "calc(2px * var(--gui-scale))",
                    backgroundColor: "#00000088",
                    width: "calc(100% - (12px * var(--gui-scale)))",
                    height: "calc(100% - (12px * var(--gui-scale)))",
                }}
            >
                <span>Config Name</span>
                <input
                    title="Config Name"
                    type="text"
                    class="form-control"
                    placeholder={props.config instanceof OreUICustomizerConfig ? `${props.config.metadata.name} - Copy` : "Config Name"}
                    onInput={(event: JSX.TargetedInputEvent<HTMLInputElement>): void => {
                        event.currentTarget.parentElement!.querySelector("button")!.disabled = event.currentTarget.value.length === 0;
                    }}
                    required
                    style={{ width: "100%" }}
                />
                <div
                    style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                        position: "absolute",
                        bottom: "calc(8px * var(--gui-scale))",
                        width: "calc(100% - (16px * var(--gui-scale)))",
                    }}
                >
                    <button
                        type="button"
                        class="btn"
                        disabled
                        style={{ flexGrow: 1 }}
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            if (event.currentTarget.disabled) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            event.currentTarget.blur();
                            event.preventDefault();
                            event.stopPropagation();
                            const name: string = event.currentTarget.parentElement!.parentElement!.querySelector("input")!.value;
                            if (event.currentTarget.disabled || name.length === 0) return;
                            container.remove();
                            const data: SavedOreUICustomizerConfig_Type | undefined =
                                props.config instanceof OreUICustomizerConfig ? props.config.toSavedConfigData() : undefined;
                            if (!data) return;
                            data.metadata.name = name;
                            data.metadata.uuid = crypto.randomUUID();
                            data.metadata.version = "1.0.0";
                            const fileName: string = sanitizeFilename(`${data.metadata.name.slice(0, 25)}-${Date.now()}.json`);
                            writeFileSync(path.join(ConfigManager.configsFolder, fileName), JSON.stringify(data, null, 4));
                            const config: OreUICustomizerConfig = new OreUICustomizerConfig(path.join(ConfigManager.configsFolder, fileName));
                            ConfigManager.loadedConfigs.push(config);
                            ConfigManager.emit("configCreated", config);
                        }}
                    >
                        Duplicate
                    </button>
                    <button type="button" class="btn" style={{ flexGrow: 1 }} onClick={(): void => container.remove()}>
                        Cancel
                    </button>
                </div>
            </div>,
            container
        );
        document.body.appendChild(container);
    }
    useEffect((): (() => void) => {
        function handleWindowMouseDown(event: MouseEvent): void {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                containerRef.current.classList.remove("config-list-item-options-visible");
            }
        }
        window.addEventListener("mousedown", handleWindowMouseDown);
        return (): void => {
            window.removeEventListener("mousedown", handleWindowMouseDown);
        };
    });
    return (
        <div
            class="config-list-item nsel"
            style={{
                // height: "calc(42px * var(--gui-scale))",
                width: "100%",
            }}
            ref={containerRef}
        >
            <div
                class="config-list-item-main-container nsel"
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
                    $(event.currentTarget.parentElement?.parentElement!).find(".config-list-item").removeClass("config-list-item-options-visible");
                    event.currentTarget.parentElement?.classList.add("config-list-item-options-visible");
                }}
            >
                <div
                    class="config-icon-container nsel"
                    style={{ float: "left", width: "calc(34px * var(--gui-scale))", padding: "calc(4px * var(--gui-scale))" }}
                >
                    <img
                        title="Config Icon"
                        class="piximg nsel ndrg"
                        src={
                            props.config instanceof OreUICustomizerConfig
                                ? props.config.icon ?? "resource://images/ui/glyphs/icon-settings.png"
                                : "resource://images/ui/misc/missing_pack_icon.png"
                        }
                        style={{ width: "calc(34px * var(--gui-scale))", height: "calc(34px * var(--gui-scale))" }}
                    />
                </div>
                <div
                    class="config-text-containers-container nsel"
                    style={{
                        height: "calc(34px * var(--gui-scale))",
                        width: "-webkit-fill-available",
                        minWidth: 0,
                        padding: "calc(4px * var(--gui-scale)) 0",
                        textAlign: "left",
                    }}
                >
                    <div
                        class="config-name nsel"
                        style={{
                            height: "calc(10px * var(--gui-scale))",
                            width: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textWrap: "nowrap",
                        }}
                    >
                        {props.config instanceof OreUICustomizerConfig
                            ? props.config.metadata.name
                            : props.config.name ?? props.config.metadata?.name ?? "MISSING"}
                    </div>
                    {props.config.metadata && props.config.metadata.authors && props.config.metadata.authors.length > 0 && (
                        <div
                            class="config-author nsel"
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
                            {props.config.metadata.authors.length === 1 ? props.config.metadata.authors[0] : props.config.metadata.authors.join(", ")}
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
                        {(props.config instanceof OreUICustomizerConfig ? props.config.metadata.description : true) && (
                            <div
                                class="config-description nsel"
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
                                {props.config instanceof OreUICustomizerConfig ? props.config.metadata.description : "This config is missing!"}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div
                class="config-list-item-options-container nsel"
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
                        class="btn nsel config-list-item-toggle-activation-button"
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
                                const activeConfigs: (OreUICustomizerConfig | MissingConfigInfo)[] = ConfigManager.getActiveConfigs();
                                const index: number =
                                    props.config instanceof OreUICustomizerConfig
                                        ? activeConfigs.indexOf(props.config)
                                        : activeConfigs.findIndex(
                                              (config: OreUICustomizerConfig | MissingConfigInfo): boolean =>
                                                  !(config instanceof OreUICustomizerConfig) &&
                                                  config.uuid === (props.config as MissingConfigInfo).uuid &&
                                                  config.version === (props.config as MissingConfigInfo).version
                                          );
                                console.log(1);
                                if (index === -1) return;
                                console.log(2);
                                activeConfigs.splice(index, 1);
                                ConfigManager.setActiveConfigs(activeConfigs);
                                createToast({
                                    title: `${props.config.metadata?.name} deactivated`,
                                });
                            } else {
                                const activeConfigs: (OreUICustomizerConfig | MissingConfigInfo)[] = ConfigManager.getActiveConfigs();
                                const index: number = activeConfigs.indexOf(props.config);
                                console.log(3);
                                if (index !== -1) return;
                                console.log(4);
                                activeConfigs.push(props.config);
                                ConfigManager.setActiveConfigs(activeConfigs);
                                createToast({
                                    title: `${props.config.metadata?.name} activated`,
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
                        class="config-list-item-move-up-button nsel"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            if (event.currentTarget.hasAttribute("disabled")) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            event.currentTarget.blur();
                            event.preventDefault();
                            event.stopPropagation();
                            const activeConfigs: (OreUICustomizerConfig | MissingConfigInfo)[] = ConfigManager.getActiveConfigs();
                            const index: number = activeConfigs.indexOf(props.config);
                            if (index === -1 || index === activeConfigs.length - 1) return;
                            event.currentTarget.parentElement?.parentElement?.classList.remove("config-list-item-options-visible");
                            activeConfigs.splice(index, 1);
                            activeConfigs.splice(index + 1, 0, props.config);
                            ConfigManager.setActiveConfigs(activeConfigs);
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
                        class="config-list-item-move-down-button nsel"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            if (event.currentTarget.hasAttribute("disabled")) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            event.currentTarget.blur();
                            event.preventDefault();
                            event.stopPropagation();
                            const activeConfigs: (OreUICustomizerConfig | MissingConfigInfo)[] = ConfigManager.getActiveConfigs();
                            const index: number = activeConfigs.indexOf(props.config);
                            if (index <= 0) return;
                            event.currentTarget.parentElement?.parentElement?.classList.remove("config-list-item-options-visible");
                            activeConfigs.splice(index, 1);
                            activeConfigs.splice(index - 1, 0, props.config);
                            ConfigManager.setActiveConfigs(activeConfigs);
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
                {props.config instanceof OreUICustomizerConfig && (
                    <div
                        title="Edit"
                        class="config-list-item-edit-button nsel"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            if (event.currentTarget.hasAttribute("disabled")) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            event.currentTarget.blur();
                            event.preventDefault();
                            event.stopPropagation();
                            router.history.push(
                                `/config-editor?${
                                    props.config instanceof OreUICustomizerConfig
                                        ? new URLSearchParams({
                                              configPath: props.config.filePath,
                                          } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ConfigEditor]>).toString()
                                        : new URLSearchParams({
                                              configId: props.config.uuid,
                                              configVersion: props.config.version,
                                          } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.ConfigEditor]>).toString()
                                }`
                            );
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
                            src="resource://images/ui/glyphs/Edit.png"
                            style={{
                                // width: "calc(14px * var(--gui-scale))",
                                height: "calc(14px * var(--gui-scale))",
                                cursor: "pointer",
                                filter: "brightness(0.7)",
                                // margin: "calc(4px * var(--gui-scale)) calc(2px * var(--gui-scale))",
                            }}
                        />
                    </div>
                )}
                {props.config instanceof OreUICustomizerConfig && (
                    <div
                        title="Duplicate"
                        class="config-list-item-duplicate-button nsel"
                        onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            if (event.currentTarget.hasAttribute("disabled")) return;
                            SoundEffects.popB();
                        }}
                        onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                            event.currentTarget.blur();
                            event.preventDefault();
                            event.stopPropagation();
                            onDuplicateClick(event);
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
                            padding: "0 calc(2.5px * var(--gui-scale))",
                        }}
                    >
                        <img
                            aria-hidden="true"
                            class="piximg nsel ndrg"
                            src="resource://images/ui/glyphs/copy-color.png"
                            style={{
                                // width: "calc(14px * var(--gui-scale))",
                                height: "calc(14px * var(--gui-scale))",
                                cursor: "pointer",
                                // margin: "calc(4px * var(--gui-scale)) calc(2px * var(--gui-scale))",
                            }}
                        />
                    </div>
                )}
                <div
                    title="Config Details"
                    class="config-list-item-details-button nsel"
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
                        padding: "0 calc(2.5px * var(--gui-scale))",
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

export function DefaultConfigsListItem(): JSX.SpecificElement<"div"> {
    return (
        <div
            class="config-list-item nsel ndrg no-bottom-border"
            style={{
                // height: "calc(42px * var(--gui-scale))",
                width: "100%",
                pointerEvents: "none",
            }}
            inert
            tabIndex={-1}
        >
            <div
                class="config-list-item-main-container nsel"
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
                    class="config-icon-container nsel"
                    style={{ float: "left", width: "calc(34px * var(--gui-scale))", padding: "calc(4px * var(--gui-scale))" }}
                >
                    <img
                        title="Config Icon"
                        class="piximg nsel ndrg"
                        src="resource://icon.png"
                        style={{ width: "calc(34px * var(--gui-scale))", height: "calc(34px * var(--gui-scale))" }}
                    />
                </div>
                <div
                    class="config-text-containers-container nsel"
                    style={{
                        height: "calc(34px * var(--gui-scale))",
                        width: "-webkit-fill-available",
                        minWidth: 0,
                        padding: "calc(4px * var(--gui-scale)) 0",
                        textAlign: "left",
                    }}
                >
                    <div
                        class="config-name nsel"
                        style={{
                            height: "calc(10px * var(--gui-scale))",
                            width: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textWrap: "nowrap",
                        }}
                    >
                        Default Config
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
                            class="config-description nsel"
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
                            The default Ore UI Customizer config.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
