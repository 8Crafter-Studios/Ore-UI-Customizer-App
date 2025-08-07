import type { IpcRendererEvent } from "electron";
const { ipcRenderer } = require("electron") as typeof import("electron");
import { dialog } from "@electron/remote";
import { CustomizerAppPage } from "../utils/pageList";
import { ThemeManager } from "../utils/ThemeManager";
import { PluginManager } from "../utils/PluginManager";
import { ConfigManager } from "../utils/ConfigManager";

ipcRenderer.on("go-menu-action", function (_event: IpcRendererEvent, menu: `${CustomizerAppPage}` | "go-back" | "go-forward" | ""): void {
    switch (menu) {
        case CustomizerAppPage.Home:
        case CustomizerAppPage.Installations:
        case CustomizerAppPage.Marketplace:
        case CustomizerAppPage.Preferences:
        case CustomizerAppPage.Configs:
        case CustomizerAppPage.Plugins:
        case CustomizerAppPage.Themes:
        case CustomizerAppPage.ConfigDetails:
        case CustomizerAppPage.ThemeDetails:
        case CustomizerAppPage.PluginDetails:
        case CustomizerAppPage.ConfigEditor:
        case CustomizerAppPage.ThemeEditor: {
            router.history.push(`/${menu}`);
            break;
        }
        case "go-back": {
            router.history.goBack();
            break;
        }
        case "go-forward": {
            router.history.goForward();
            break;
        }
        default:
            dialog.showMessageBox({
                type: "error",
                title: "Page Does Not Exist Yet",
                message: `The ${menu.toLowerCase()} page does not exist yet.`,
                buttons: ["Okay"],
                noLink: true,
            });
    }
});

ipcRenderer.on("console-action", function <
    T extends Exclude<keyof Console, "Console">
>(_event: IpcRendererEvent, action: T, ...args: Parameters<Console[T]>): void {
    console[action](...(args as []));
});

ipcRenderer.on(
    "import-from-file",
    async function (_event: IpcRendererEvent, path: string, type: "config" | "plugin" | "theme" | "add-on" | "unknown"): Promise<void> {
        getCurrentWindow().focus();
        switch (type) {
            case "config":
                try {
                    ConfigManager.importFromFilePath(path); /* 
                    dialog.showMessageBox({
                        type: "warning",
                        title: "Feature Not Implemented",
                        message: `Unable to import the config at ${path}.`,
                        detail: "The ability to import configs from file paths has not been implemented yet.",
                        buttons: ["Okay"],
                        noLink: true,
                    }); */
                    // TO-DO
                    // const config: any = JSON.parse(fs.readFileSync(path, { encoding: "utf-8" })); // eslint-disable-line @typescript-eslint/no-var-requires
                    // ipcRenderer.send("import-config", config);
                } catch (error: any) {
                    dialog.showMessageBox({
                        type: "error",
                        title: "Error Importing Config",
                        message: `There was an error importing the config at ${path}.`,
                        detail: "message" in error ? error + error?.stack : error,
                        buttons: ["Okay"],
                        noLink: true,
                    });
                }
                break;
            case "plugin":
                try {
                    PluginManager.importFromFilePath(path);
                } catch (error: any) {
                    dialog.showMessageBox({
                        type: "error",
                        title: "Error Importing Plugin",
                        message: `There was an error importing the plugin at ${path}.`,
                        detail: "message" in error ? error + error?.stack : error,
                        buttons: ["Okay"],
                        noLink: true,
                    });
                }
                break;
            case "theme":
                try {
                    await ThemeManager.importFromFilePath(path);
                } catch (error: any) {
                    dialog.showMessageBox({
                        type: "error",
                        title: "Error Importing Theme",
                        message: `There was an error importing the theme at ${path}.`,
                        detail: "message" in error ? error + error?.stack : error,
                        buttons: ["Okay"],
                        noLink: true,
                    });
                }
                break;
            case "add-on":
                dialog.showMessageBox({
                    type: "warning",
                    title: "Feature Not Implemented",
                    message: `Unable to import the add-on at ${path}.`,
                    detail: "The ability to import add-ons from file paths has not been implemented yet.",
                    buttons: ["Okay"],
                    noLink: true,
                });
                // TO-DO
                break;
            case "unknown":
                dialog.showMessageBox({
                    type: "warning",
                    title: "Feature Not Implemented",
                    message: `Unable to determine the type of the file at ${path}.`,
                    detail: "The ability to automatically determine import type from file paths has not been implemented yet.",
                    buttons: ["Okay"],
                    noLink: true,
                });
                // TO-DO
                break;
            default:
                throw new TypeError(`Unknown import type: ${type}`);
        }
    }
);

ipcRenderer.on(
    "import-from-url",
    async function (_event: IpcRendererEvent, url: string, type: "config" | "plugin" | "theme" | "add-on" | "unknown"): Promise<void> {
        getCurrentWindow().focus();
        switch (type) {
            case "config":
                try {
                    ConfigManager.importFromURL(url); /* 
                    dialog.showMessageBox({
                        type: "warning",
                        title: "Feature Not Implemented",
                        message: `Unable to import the config at ${url}.`,
                        detail: "The ability to import configs from URLs has not been implemented yet.",
                        buttons: ["Okay"],
                        noLink: true,
                    }); */
                    // TO-DO
                    // const config: any = JSON.parse(fs.readFileSync(path, { encoding: "utf-8" })); // eslint-disable-line @typescript-eslint/no-var-requires
                    // ipcRenderer.send("import-config", config);
                } catch (error: any) {
                    dialog.showMessageBox({
                        type: "error",
                        title: "Error Importing Config",
                        message: `There was an error importing the config at ${url}.`,
                        detail: "message" in error ? error + error?.stack : error,
                        buttons: ["Okay"],
                        noLink: true,
                    });
                }
                break;
            case "plugin":
                try {
                    PluginManager.importFromURL(url);
                } catch (error: any) {
                    dialog.showMessageBox({
                        type: "error",
                        title: "Error Importing Plugin",
                        message: `There was an error importing the plugin at ${url}.`,
                        detail: "message" in error ? error + error?.stack : error,
                        buttons: ["Okay"],
                        noLink: true,
                    });
                }
                break;
            case "theme":
                try {
                    await ThemeManager.importFromURL(url);
                } catch (error: any) {
                    dialog.showMessageBox({
                        type: "error",
                        title: "Error Importing Theme",
                        message: `There was an error importing the theme at ${url}.`,
                        detail: "message" in error ? error + error?.stack : error,
                        buttons: ["Okay"],
                        noLink: true,
                    });
                }
                break;
            case "add-on":
                dialog.showMessageBox({
                    type: "warning",
                    title: "Feature Not Implemented",
                    message: `Unable to import the add-on at ${url}.`,
                    detail: "The ability to import add-ons from URLs has not been implemented yet.",
                    buttons: ["Okay"],
                    noLink: true,
                });
                // TO-DO
                break;
            case "unknown":
                dialog.showMessageBox({
                    type: "warning",
                    title: "Feature Not Implemented",
                    message: `Unable to determine the type of the file at ${url}.`,
                    detail: "The ability to automatically determine import type from URLs has not been implemented yet.",
                    buttons: ["Okay"],
                    noLink: true,
                });
                // TO-DO
                break;
            default:
                throw new TypeError(`Unknown import type: ${type}`);
        }
    }
);

ipcRenderer.on(
    "import-from-data",
    async function (_event: IpcRendererEvent, data: string, type: "config" | "plugin" | "theme" | "add-on" | "unknown"): Promise<void> {
        getCurrentWindow().focus();
        switch (type) {
            case "config":
                try {
                    ConfigManager.importFromDataURI(data); /* 
                    dialog.showMessageBox({
                        type: "warning",
                        title: "Feature Not Implemented",
                        message: `Unable to import the config from a data URI.`,
                        detail: "The ability to import configs from data URIs has not been implemented yet.",
                        buttons: ["Okay"],
                        noLink: true,
                    }); */
                    // TO-DO
                    // const config: any = JSON.parse(fs.readFileSync(path, { encoding: "utf-8" })); // eslint-disable-line @typescript-eslint/no-var-requires
                    // ipcRenderer.send("import-config", config);
                } catch (error: any) {
                    dialog.showMessageBox({
                        type: "error",
                        title: "Error Importing Config",
                        message: `There was an error importing the config from a data URI.`,
                        detail: "message" in error ? error + error?.stack : error,
                        buttons: ["Okay"],
                        noLink: true,
                    });
                }
                break;
            case "plugin":
                try {
                    PluginManager.importFromDataURI(data);
                } catch (error: any) {
                    dialog.showMessageBox({
                        type: "error",
                        title: "Error Importing Plugin",
                        message: `There was an error importing the plugin from a data URI.`,
                        detail: "message" in error ? error + error?.stack : error,
                        buttons: ["Okay"],
                        noLink: true,
                    });
                }
                break;
            case "theme":
                try {
                    await ThemeManager.importFromDataURI(data);
                } catch (error: any) {
                    dialog.showMessageBox({
                        type: "error",
                        title: "Error Importing Theme",
                        message: `There was an error importing the theme from a data URI.`,
                        detail: "message" in error ? error + error?.stack : error,
                        buttons: ["Okay"],
                        noLink: true,
                    });
                }
                break;
            case "add-on":
                dialog.showMessageBox({
                    type: "warning",
                    title: "Feature Not Implemented",
                    message: `Unable to import the add-on from a data URI.`,
                    detail: "The ability to import add-ons from data URIs has not been implemented yet.",
                    buttons: ["Okay"],
                    noLink: true,
                });
                // TO-DO
                break;
            case "unknown":
                dialog.showMessageBox({
                    type: "warning",
                    title: "Feature Not Implemented",
                    message: `Unable to determine the type of the file from a data URI.`,
                    detail: "The ability to automatically determine import type from data URIs has not been implemented yet.",
                    buttons: ["Okay"],
                    noLink: true,
                });
                // TO-DO
                break;
            default:
                throw new TypeError(`Unknown import type: ${type}`);
        }
    }
);

declare global {
    namespace Electron {
        interface WebContents {
            send<_T extends 1>(channel: "go-menu-action", menu: `${CustomizerAppPage}` | "go-back" | "go-forward"): void;
            send<_T extends 1>(channel: "get-router-details"): void;
            send<_T extends 1, T extends Exclude<keyof Console, "Console">>(
                channel: "console-action",
                action: T,
                ...args: globalThis.Parameters<Console[T]>
            ): void;
            send<_T extends 1>(channel: "import-from-file", path: string, type: "config" | "plugin" | "theme" | "add-on" | "unknown"): void;
            send<_T extends 1>(channel: "import-from-url", url: string, type: "config" | "plugin" | "theme" | "add-on" | "unknown"): void;
            send<_T extends 1>(channel: "import-from-data", path: string, type: "config" | "plugin" | "theme" | "add-on" | "unknown"): void;
        }
    }
}
