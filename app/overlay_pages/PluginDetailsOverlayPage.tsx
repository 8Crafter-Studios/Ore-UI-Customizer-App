import type { JSX, RefObject } from "preact";
import { OreUICustomizerPlugin, PluginManager, type OreUICustomizerPluginMessageInfo } from "../../src/utils/PluginManager";
import { clipboard, dialog, shell } from "@electron/remote";
import type { MessageBoxReturnValue } from "electron";
import { createToast } from "../components/Toast";
import { render, useEffect, useRef } from "preact/compat";

export interface PluginDetailsOverlayPageProps {
    folderPath: string;
}

let validLicenses: string[] = [];

let invalidLicenses: string[] = [];

let licensesBeingChecked: string[] = [];

export default function PluginDetailsOverlayPage(props: PluginDetailsOverlayPageProps): JSX.SpecificElement<"div"> {
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const plugin: OreUICustomizerPlugin | undefined = PluginManager.getPluginFromFolderPath(props.folderPath);
    function handleRefresh(refreshedPlugin: OreUICustomizerPlugin): void {
        if (!containerRef.current || refreshedPlugin !== plugin) return;
        render(<PluginDetailsOverlayPageContents />, containerRef.current);
    }
    function PluginDetailsOverlayPageContents(): JSX.Element {
        const licenseRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
        useEffect((): (() => void) => {
            let hasBeenClosed: boolean = false;
            const license: string | undefined = plugin?.metadata.license?.toLowerCase();
            if (licenseRef.current && plugin && license && !invalidLicenses.includes(license) && !licensesBeingChecked.includes(license)) {
                if (!validLicenses.includes(license)) {
                    licensesBeingChecked.push(license);
                    ipcRenderer.invoke<1>("get-is-404-response", `https://choosealicense.com/licenses/${license}/`).then((is404: boolean): void => {
                        if (licensesBeingChecked.includes(license)) {
                            licensesBeingChecked.splice(licensesBeingChecked.indexOf(license), 1);
                        }
                        if (!invalidLicenses.includes(license) && is404) {
                            invalidLicenses.push(license);
                        }
                        if (hasBeenClosed || validLicenses.includes(license) || invalidLicenses.includes(license) || !licenseRef.current) return;
                        licenseRef.current.style.cursor = "help";
                        licenseRef.current.setAttribute("data-choosealicense-license-url", license);
                    });
                } else {
                    licenseRef.current;
                    licenseRef.current.style.cursor = "help";
                    licenseRef.current.setAttribute("data-choosealicense-license-url", license);
                }
            }
            return (): void => {
                hasBeenClosed = true;
            };
        });
        return (
            <>
                <button
                    type="button"
                    class="nsel ndrg dialog-close-button"
                    title="Close"
                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                        if (event.currentTarget.disabled) return;
                        SoundEffects.popB();
                    }}
                    onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                        event.preventDefault();
                        event.currentTarget.blur();
                        if (event.currentTarget.disabled) return;
                        router.history.goBack();
                    }}
                ></button>
                <div
                    class="nsel ndrg piximg crispy fix-crispy-text-sizing-issues"
                    style={{
                        color: "#4C4C4CFF",
                        padding: "calc(8.5px * var(--gui-scale))",
                        position: "absolute",
                        textAlign: "center",
                        width: "100%",
                    }}
                >
                    Plugin Info{"\u200A"}
                </div>
                <div
                    style={{
                        margin: "calc(23px * var(--gui-scale)) calc(8px * var(--gui-scale)) calc(8px * var(--gui-scale))",
                        padding: "calc(7px * var(--gui-scale))",
                        backgroundColor: "#090909FF",
                        width: "calc(100% - (16px * var(--gui-scale)))",
                        height: "calc(100% - (31px * var(--gui-scale)))",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "start",
                            border: "calc(1px * var(--gui-scale)) solid #2d2d2d",
                            backgroundColor: "#111111",
                            padding: "0 calc(3px * var(--gui-scale))",
                        }}
                    >
                        <div
                            style={{
                                padding: "calc(2px * var(--gui-scale)) 0",
                                display: "flex",
                                flexDirection: "row",
                                borderBottom: "calc(1px * var(--gui-scale)) solid #364343FF",
                            }}
                        >
                            <img
                                aria-hidden="true"
                                class="nsel ndrg crispy"
                                style={{
                                    width: "calc(50px * var(--gui-scale))",
                                    height: "calc(50px * var(--gui-scale))",
                                    margin: "calc(1px * var(--gui-scale)) calc(3px * var(--gui-scale)) calc(1px * var(--gui-scale)) 0",
                                }}
                                src={plugin!.icon ?? "resource://images/ui/misc/missing_pack_icon.png"}
                            />
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    textAlign: "left",
                                    marginLeft: "calc(1px * var(--gui-scale))",
                                    marginRight: "calc(10px * var(--gui-scale))",
                                    flexGrow: 1,
                                }}
                            >
                                <div
                                    class="nsel ndrg crispy fix-crispy-text-sizing-issues"
                                    style={{
                                        marginBottom: "calc(3px * var(--gui-scale))",
                                    }}
                                >
                                    {plugin!.name}
                                </div>
                                <div
                                    class="nsel ndrg"
                                    style={{
                                        width: "100%",
                                        fontSize: "calc(8.4px * var(--gui-scale))",
                                        maxHeight: "100%",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        webkitLineClamp: 3,
                                        webkitBoxOrient: "vertical",
                                        display: "-webkit-box",
                                        paddingBottom: "calc(0.5px * var(--gui-scale))",
                                        fontFamily: "NotoSans-Regular",
                                    }}
                                >
                                    {plugin!.description}
                                </div>
                            </div>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "calc(78px * var(--gui-scale))",
                                    justifyContent: "space-around",
                                    flexShrink: 0,
                                }}
                            >
                                <button
                                    type="button"
                                    class="btn add-button-outline"
                                    style={{ padding: "calc(4px * var(--gui-scale))", width: "100%" }}
                                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                                        event.preventDefault();
                                        if (event.currentTarget.disabled) return;
                                        SoundEffects.popB();
                                    }}
                                >
                                    Refresh
                                </button>
                                <button
                                    type="button"
                                    class="btn add-button-outline"
                                    style={{ padding: "calc(4px * var(--gui-scale))", width: "100%" }}
                                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                                        event.preventDefault();
                                        if (event.currentTarget.disabled) return;
                                        SoundEffects.popB();
                                    }}
                                    onClick={async (event: JSX.TargetedMouseEvent<HTMLButtonElement>): Promise<void> => {
                                        event.preventDefault();
                                        event.currentTarget.blur();
                                        if (event.currentTarget.disabled) return;
                                        const result: MessageBoxReturnValue = await dialog.showMessageBox({
                                            type: "question",
                                            title: "Delete Plugin?",
                                            message: "You are about to delete this plugin forever. Are you sure?",
                                            buttons: ["Delete", "Go Back"],
                                            defaultId: 1,
                                            cancelId: 1,
                                            noLink: true,
                                            icon: "resource://images/ui/glyphs/trash_default.png",
                                        });
                                        if (result.response === 0) {
                                            plugin!.delete();
                                        }
                                    }}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div
                            style={{
                                padding: "calc(2px * var(--gui-scale)) 0",
                                display: "flex",
                                flexDirection: "row",
                                borderBottom: "calc(1px * var(--gui-scale)) solid #364343FF",
                            }}
                        >
                            <span
                                class="nsel ndrg crispy fix-crispy-text-sizing-issues"
                                style={{
                                    fontFamily: "Minecraft-Ten",
                                    fontSize: "calc(9.5px * var(--gui-scale))",
                                    color: "rgba(255, 255, 255, 0.59)",
                                    marginRight: "calc(2px * var(--gui-scale))",
                                }}
                            >
                                PACK ID:
                            </span>
                            <span style={{ fontFamily: "NotoSans-Regular", fontSize: "calc(8.4px * var(--gui-scale))" }}>{plugin!.uuid}</span>
                        </div>
                        <div
                            style={{
                                padding: "calc(2px * var(--gui-scale)) 0",
                                display: "flex",
                                flexDirection: "row",
                                borderBottom: "calc(1px * var(--gui-scale)) solid #364343FF",
                            }}
                        >
                            <span
                                class="nsel ndrg crispy fix-crispy-text-sizing-issues"
                                style={{
                                    fontFamily: "Minecraft-Ten",
                                    fontSize: "calc(9.5px * var(--gui-scale))",
                                    color: "rgba(255, 255, 255, 0.59)",
                                    marginRight: "calc(2px * var(--gui-scale))",
                                }}
                            >
                                PACK VERSION:
                            </span>
                            <span style={{ fontFamily: "NotoSans-Regular", fontSize: "calc(8.4px * var(--gui-scale))" }}>{plugin!.version}</span>
                        </div>
                        <div
                            style={{
                                padding: "calc(2px * var(--gui-scale)) 0",
                                display: "flex",
                                flexDirection: "row",
                                borderBottom:
                                    plugin!.metadata.url || plugin!.metadata.license || plugin!.metadata.authors
                                        ? "calc(1px * var(--gui-scale)) solid #364343FF"
                                        : undefined,
                            }}
                        >
                            <span
                                class="nsel ndrg crispy fix-crispy-text-sizing-issues"
                                style={{
                                    fontFamily: "Minecraft-Ten",
                                    fontSize: "calc(9.5px * var(--gui-scale))",
                                    color: "rgba(255, 255, 255, 0.59)",
                                    marginRight: "calc(2px * var(--gui-scale))",
                                    flexShrink: 0,
                                }}
                            >
                                FILE LOCATION:
                            </span>
                            <span
                                class="nsel ndrg"
                                style={{
                                    fontFamily: "NotoSans-Regular",
                                    fontSize: "calc(8.4px * var(--gui-scale))",
                                    textAlign: "left",
                                    overflowWrap: "anywhere",
                                    cursor: "copy",
                                }}
                                onClick={(event: JSX.TargetedMouseEvent<HTMLSpanElement>): void => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    clipboard.writeText(plugin!.folderPath);
                                    createToast({
                                        title: "Copied file location to clipboard.",
                                    });
                                }}
                            >
                                {plugin!.folderPath.replaceAll(/(?<!^|\s)(?!$|\s)/g, "\xAD")}
                            </span>
                        </div>
                        {plugin!.metadata.authors && (
                            <div
                                style={{
                                    padding: "calc(2px * var(--gui-scale)) 0",
                                    display: "flex",
                                    flexDirection: "row",
                                    borderBottom: plugin!.metadata.url || plugin!.metadata.license ? "calc(1px * var(--gui-scale)) solid #364343FF" : undefined,
                                }}
                            >
                                <span
                                    class="nsel ndrg crispy fix-crispy-text-sizing-issues"
                                    style={{
                                        fontFamily: "Minecraft-Ten",
                                        fontSize: "calc(9.5px * var(--gui-scale))",
                                        color: "rgba(255, 255, 255, 0.59)",
                                        marginRight: "calc(2px * var(--gui-scale))",
                                        flexShrink: 0,
                                    }}
                                >
                                    AUTHOR{plugin!.metadata.authors.length !== 1 ? "S" : ""}:
                                </span>
                                <span
                                    class="nsel ndrg"
                                    style={{
                                        fontFamily: "NotoSans-Regular",
                                        fontSize: "calc(8.4px * var(--gui-scale))",
                                        textAlign: "left",
                                        overflowWrap: "anywhere",
                                        cursor: "copy",
                                    }}
                                    onClick={(event: JSX.TargetedMouseEvent<HTMLSpanElement>): void => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        clipboard.writeText(JSON.stringify(plugin!.metadata.authors));
                                        createToast({
                                            title: "Copied authors to clipboard.",
                                        });
                                    }}
                                >
                                    {plugin!.metadata.authors.map((author: string): string => author.replaceAll(/(?<!^|\s)(?!$|\s)/g, "\xAD")).join(", ")}
                                </span>
                            </div>
                        )}
                        {plugin!.metadata.license && (
                            <div
                                style={{
                                    padding: "calc(2px * var(--gui-scale)) 0",
                                    display: "flex",
                                    flexDirection: "row",
                                    borderBottom: plugin!.metadata.url ? "calc(1px * var(--gui-scale)) solid #364343FF" : undefined,
                                }}
                            >
                                <span
                                    class="nsel ndrg crispy fix-crispy-text-sizing-issues"
                                    style={{
                                        fontFamily: "Minecraft-Ten",
                                        fontSize: "calc(9.5px * var(--gui-scale))",
                                        color: "rgba(255, 255, 255, 0.59)",
                                        marginRight: "calc(2px * var(--gui-scale))",
                                        flexShrink: 0,
                                    }}
                                >
                                    LICENSE:
                                </span>
                                <span
                                    class="nsel ndrg"
                                    style={{
                                        fontFamily: "NotoSans-Regular",
                                        fontSize: "calc(8.4px * var(--gui-scale))",
                                        textAlign: "left",
                                        overflowWrap: "anywhere",
                                    }}
                                    ref={licenseRef}
                                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLAnchorElement>): void => {
                                        event.preventDefault();
                                        SoundEffects.popB();
                                    }}
                                    onClick={(event: JSX.TargetedMouseEvent<HTMLSpanElement>): void => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        event.currentTarget.blur();
                                        if (event.currentTarget.getAttribute("data-choosealicense-license-url")) {
                                            shell.openExternal(
                                                `https://choosealicense.com/licenses/${event.currentTarget.getAttribute("data-choosealicense-license-url")}/`
                                            );
                                        }
                                    }}
                                >
                                    {plugin!.metadata.license.replaceAll(/(?<!^|\s)(?!$|\s)/g, "\xAD")}
                                </span>
                            </div>
                        )}
                        {plugin!.metadata.url && (
                            <div
                                style={{
                                    padding: "calc(2px * var(--gui-scale)) 0",
                                    display: "flex",
                                    flexDirection: "row",
                                    // borderBottom: "calc(1px * var(--gui-scale)) solid #364343FF",
                                }}
                            >
                                <span
                                    class="nsel ndrg crispy fix-crispy-text-sizing-issues"
                                    style={{
                                        fontFamily: "Minecraft-Ten",
                                        fontSize: "calc(9.5px * var(--gui-scale))",
                                        color: "rgba(255, 255, 255, 0.59)",
                                        marginRight: "calc(2px * var(--gui-scale))",
                                        flexShrink: 0,
                                    }}
                                >
                                    URL:
                                </span>
                                <a
                                    href={plugin!.metadata.url}
                                    class="nsel ndrg emerald-green-link"
                                    style={{
                                        fontFamily: "NotoSans-Regular",
                                        fontSize: "calc(8.4px * var(--gui-scale))",
                                        textAlign: "left",
                                        overflowWrap: "anywhere",
                                    }}
                                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLAnchorElement>): void => {
                                        event.preventDefault();
                                        SoundEffects.popB();
                                    }}
                                    onClick={(event: JSX.TargetedMouseEvent<HTMLAnchorElement>): void => {
                                        event.preventDefault();
                                        event.currentTarget.blur();
                                        if (!plugin?.metadata.url) return;
                                        shell.openExternal(plugin.metadata.url);
                                    }}
                                >
                                    {plugin!.metadata.url}
                                </a>
                            </div>
                        )}
                    </div>
                    <div
                        class="nsel ndrg crispy fix-crispy-text-sizing-issues"
                        style={{
                            fontFamily: "Minecraft-Ten",
                            fontSize: "calc(9.5px * var(--gui-scale))",
                            color: "rgba(255, 255, 255, 0.59)",
                            marginTop: "calc((4px * var(--gui-scale)) - 1px)",
                            textAlign: "left",
                            width: "100%",
                        }}
                    >
                        ERROR LIST
                    </div>

                    {(function getErrorList(): JSX.SpecificElement<"div">[] {
                        if (!plugin) return [];
                        const messages: OreUICustomizerPluginMessageInfo[] = plugin.getMessages();
                        if (messages.length === 0)
                            messages.push({
                                titleFormat: "html",
                                title: '<span style="color: #55FF55FF;">No errors were found</span>',
                                messageFormat: "text",
                                message: "",
                                type: "info",
                                plugin,
                            });
                        const errorList: JSX.SpecificElement<"div">[] = [];
                        for (const message of messages) {
                            errorList.push(
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "start",
                                        border: "calc(1px * var(--gui-scale)) solid #2d2d2d",
                                        backgroundColor: "#111111",
                                        padding: "0 calc(3px * var(--gui-scale))",
                                    }}
                                >
                                    <div
                                        style={{
                                            borderBottom: "calc(1px * var(--gui-scale)) solid #364343FF",
                                        }}
                                    >
                                        <p
                                            style={{
                                                width: "100%",
                                                fontSize: "calc(8.4px * var(--gui-scale))",
                                                maxHeight: "100%",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                webkitLineClamp: 3,
                                                webkitBoxOrient: "vertical",
                                                display: "-webkit-box",
                                                paddingBottom: "calc(0.5px * var(--gui-scale))",
                                                fontFamily: "NotoSans-Regular",
                                                textAlign: "left",
                                            }}
                                            dangerouslySetInnerHTML={message.title && message.titleFormat === "html" ? { __html: message.title } : undefined}
                                        >
                                            {message.title ? (
                                                message.titleFormat === "html" ? undefined : (
                                                    message.title.replaceAll(/(?<!^|\s)(?!$|\s)/g, "\xAD")
                                                )
                                            ) : message.type === "info" ? (
                                                <span style={{ color: "#5555FFFF" }}>Info</span>
                                            ) : message.type === "warning" ? (
                                                <span style={{ color: "#FFFF55FF" }}>Warning</span>
                                            ) : message.type === "error" ? (
                                                <span style={{ color: "#FF5555FF" }}>Error</span>
                                            ) : (
                                                "Unknown message type"
                                            )}
                                        </p>
                                    </div>
                                    <div
                                        style={{
                                            padding: "calc(2px * var(--gui-scale)) 0",
                                            display: "flex",
                                            flexDirection: "row",
                                        }}
                                    >
                                        <span
                                            class="nsel ndrg crispy fix-crispy-text-sizing-issues"
                                            style={{
                                                fontFamily: "Minecraft-Ten",
                                                fontSize: "calc(9.5px * var(--gui-scale))",
                                                color: "rgba(255, 255, 255, 0.59)",
                                                marginRight: "calc(2px * var(--gui-scale))",
                                                flexShrink: 0,
                                            }}
                                        >
                                            ISSUE:
                                        </span>
                                        <span
                                            style={{
                                                fontFamily: "NotoSans-Regular",
                                                fontSize: "calc(8.4px * var(--gui-scale))",
                                                textAlign: "left",
                                                // overflowWrap: "anywhere",
                                            }}
                                            dangerouslySetInnerHTML={
                                                message.message && message.messageFormat === "html" ? { __html: message.message } : undefined
                                            }
                                        >
                                            {message.messageFormat === "html" ? undefined : message.message}
                                        </span>
                                    </div>
                                </div>
                            );
                        }
                        return errorList;
                    })()}
                </div>
            </>
        );
    }
        useEffect((): (() => void) => {
            PluginManager.on("pluginRefreshed", handleRefresh);
            return (): void => {
                PluginManager.off("pluginRefreshed", handleRefresh);
            };
        });
    return (
        <div
            class="dialog-hollow-3"
            style={{
                margin: "calc(25px * var(--gui-scale)) calc((100% - (370px * var(--gui-scale))) / 2)",
                width: "calc(370px * var(--gui-scale))",
                height: "calc(100% - calc(50px * var(--gui-scale)))",
                position: "fixed",
            }}
            ref={containerRef}
        >
            <PluginDetailsOverlayPageContents />
        </div>
    );
}
