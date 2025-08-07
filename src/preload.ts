// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import "./init/JSONB.ts";
import "./init/getCurrentWindow.ts";
import "./init/Router.ts";
import "./init/SoundEffects.ts";
import "./api/preload.ts";
import "./utils/ProgressBar.ts";
import "./utils/config.ts";
import "./utils/version.ts";
import "./utils/URLs.ts";
import { autoUpdater, dialog, Menu, nativeTheme, shell } from "@electron/remote";
import { CustomizerAppPage } from "./utils/pageList.ts";
/* import { Titlebar } from "custom-electron-titlebar";

window.addEventListener('DOMContentLoaded', () => {
  // Title bar implementation
  new Titlebar({
    icon: "resource://icon.png",
  });
}); */

// ipcRenderer.sendSync<1>("set-progress-bar", 0.5, {mode: "paused"});

export function onThemeChange(value: typeof config.theme): void {
    switch (value) {
        default:
        case "auto":
            nativeTheme.themeSource = "system";
            break;
        case "dark":
            nativeTheme.themeSource = "dark";
            break;
        case "light":
        case "blue":
            nativeTheme.themeSource = "light";
            break;
    }

    changeTheme(config.actualTheme);
}

function changeTheme(theme: typeof config.actualTheme): void {
    forEachRuleCallback((rule: CSSStyleDeclaration, _ruleName: string, _styleSheet: CSSStyleSheet): void => {
        if (
            rule?.cssText?.match(
                /(?<=(?:[\n\s;{]|^)---theme-var-switcher--[a-zA-Z0-9\-_]+[\n\s]*:[\n\s]*var\([\n\s]*--[a-zA-Z0-9\-_]*)(?:light|dark|blue-theme)(?=[a-zA-Z0-9\-_]*[\n\s]*\)[\n\s]*;?)/
            )
        ) {
            rule.cssText = rule.cssText.replaceAll(
                /(?<=(?:[\n\s;{]|^)---theme-var-switcher--[a-zA-Z0-9\-_]+[\n\s]*:[\n\s]*var\([\n\s]*--[a-zA-Z0-9\-_]*)(?:light|dark|blue-theme)(?=[a-zA-Z0-9\-_]*[\n\s]*\)[\n\s]*;?)/g,
                theme === "blue" ? "blue-theme" : theme
            );
        }
    });
    document.querySelector(":root")?.classList.remove("dark_theme", "light_theme", "blue_theme");
    document.querySelector(":root")?.classList.add(`${theme}_theme`);
}

/**
 * Executes a callback for each style rule.
 *
 * @param {(rule: CSSStyleDeclaration, ruleName: string, styleSheet: CSSStyleSheet)=>any} callbackfn The callback function.
 * @returns {null} Returns `null`.
 */
function forEachRuleCallback(callbackfn: (rule: CSSStyleDeclaration, ruleName: string, styleSheet: CSSStyleSheet) => any): null {
    for (var i: number = 0; i < document.styleSheets.length; i++) {
        var ix,
            sheet: CSSStyleSheet = document.styleSheets[i]!;
        for (ix = 0; ix < sheet.cssRules.length; ix++) {
            const rule: CSSStyleRule | CSSRule = sheet.cssRules[ix] as CSSStyleRule | CSSRule;
            if (!rule || !("style" in rule)) continue;
            callbackfn(rule.style, rule.selectorText, sheet);
        }
    }
    return null;
}

config.on("settingChanged:theme", onThemeChange);

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if (nativeTheme.themeSource !== "system") return;
    onThemeChange(config.theme);
});

window.addEventListener("DOMContentLoaded", () => {
    onThemeChange(config.theme);
});

const currentWindow: Electron.BrowserWindow = getCurrentWindow();

const fileMenu: Electron.Menu = Menu.buildFromTemplate([
    {
        label: "New Window",
        accelerator: "Ctrl+N",
        click(): void {
            ipcRenderer.send("new-window");
        },
    },
    { type: "separator" },
    {
        type: "submenu",
        label: "Import",
        toolTip: "Import files.",
        submenu: [
            {
                label: "Config",
                toolTip: "Configs are presets of Ore UI Customizer settings.",
                async click(): Promise<void> {
                    currentWindow.webContents.executeJavaScript("try { SoundEffects.popB(); } catch {}");
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
                },
            },
            {
                label: "Plugin",
                toolTip: "Plugins change the behavior of the Ore UI.",
                async click(): Promise<void> {
                    currentWindow.webContents.executeJavaScript("try { SoundEffects.popB(); } catch {}");
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
                },
            },
            {
                label: "Theme",
                toolTip: "Themes change the appearance of the Ore UI.",
                async click(): Promise<void> {
                    currentWindow.webContents.executeJavaScript("try { SoundEffects.popB(); } catch {}");
                    const result: Electron.OpenDialogReturnValue = await dialog.showOpenDialog(currentWindow, {
                        buttonLabel: "Import",
                        filters: [
                            { name: "Theme", extensions: ["mcouictheme", "ouictheme"] },
                            { name: "Single-File Theme", extensions: ["json", "jsonc", "jsonl", "jsonld"] },
                        ],
                        message: "Select theme files to import",
                        properties: ["openFile", "showHiddenFiles", "treatPackageAsDirectory", "multiSelections"],
                        title: "Import Themes",
                    });
                    if (result.canceled) return;
                    const themePaths: string[] = result.filePaths;
                    themePaths.forEach((themePath: string): void => {
                        currentWindow.webContents.send<1>("import-from-file", themePath, "theme");
                    });
                },
            },
            {
                label: "Add-On",
                toolTip:
                    "Add-Ons just renamed .zip files with some configs, plugins, and themes in them. They are used to import multiple configs, plugins, and themes at once.",
                async click(): Promise<void> {
                    currentWindow.webContents.executeJavaScript("try { SoundEffects.popB(); } catch {}");
                    const result: Electron.OpenDialogReturnValue = await dialog.showOpenDialog(currentWindow, {
                        buttonLabel: "Import",
                        filters: [{ name: "Add-On", extensions: ["mcouicaddon", "ouicaddon"] }],
                        message: "Select add-on files to import",
                        properties: ["openFile", "showHiddenFiles", "treatPackageAsDirectory", "multiSelections"],
                        title: "Import Add-Ons",
                    });
                    if (result.canceled) return;
                    const addonPaths: string[] = result.filePaths;
                    addonPaths.forEach((addonPath: string): void => {
                        currentWindow.webContents.send<1>("import-from-file", addonPath, "add-on");
                    });
                },
            },
        ],
    },
    { type: "separator" },
    {
        label: "Preferences",
        click(): void {
            currentWindow.webContents.send<1>("go-menu-action", CustomizerAppPage.Preferences);
        },
    },
    { type: "separator" },
    { role: "quit" },
]);
const menu = Menu.buildFromTemplate([
    {
        role: "fileMenu",
        submenu: fileMenu,
        type: "submenu",
        label: "File",
        enabled: true,
        visible: true,
    },
    { role: "editMenu" },
    { role: "viewMenu" },
    {
        label: "Go",
        submenu: [
            {
                label: "Back",
                accelerator: "Alt+Left",
                click(): void {
                    currentWindow.webContents.send<1>("go-menu-action", "go-back");
                },
            },
            {
                label: "Forward",
                accelerator: "Alt+Right",
                click(): void {
                    currentWindow.webContents.send<1>("go-menu-action", "go-forward");
                },
            },
            {
                type: "separator",
            },
            {
                label: "Home",
                click(): void {
                    currentWindow.webContents.send<1>("go-menu-action", CustomizerAppPage.Home);
                },
            },
            {
                label: "Versions",
                click(): void {
                    currentWindow.webContents.send<1>("go-menu-action", CustomizerAppPage.Installations);
                },
            },
            {
                label: "Plugins",
                click(): void {
                    currentWindow.webContents.send<1>("go-menu-action", CustomizerAppPage.Plugins);
                },
            },
            {
                label: "Themes",
                click(): void {
                    currentWindow.webContents.send<1>("go-menu-action", CustomizerAppPage.Themes);
                },
            },
            {
                label: "Configs",
                click(): void {
                    currentWindow.webContents.send<1>("go-menu-action", CustomizerAppPage.Configs);
                },
            },
            {
                label: "Marketplace",
                click(): void {
                    currentWindow.webContents.send<1>("go-menu-action", CustomizerAppPage.Marketplace);
                },
            },
        ],
    },
    { role: "windowMenu" },
    {
        role: "help",
        type: "submenu",
        submenu: [
            {
                label: "Ore UI Customizer Website",
                click(): void {
                    shell.openExternal("https://www.8crafter.com/utilities/ore-ui-customizer");
                },
            },
            {
                label: "Check for App Updates...",
                click(): void {
                    autoUpdater.checkForUpdates();
                },
            } /* 
                    {
                        label: "Check for Customizer Updates...",
                        async click(_menuItem: Electron.MenuItem, baseWindow: Electron.BaseWindow | undefined): Promise<void> {
                            const isLatestVersion: boolean | undefined = await checkIfCurrentOreUICustomizerVersionIsLatest();
                            if (isLatestVersion === undefined) {
                                dialog.showMessageBox({
                                    type: "error",
                                    title: "Error",
                                    message: "There was an error checking for updates, check your internet connection and try again.",
                                    buttons: ["Okay"],
                                    noLink: true,
                                });
                            } else if (isLatestVersion) {
                                const currentVersion: APIVersionJSON | undefined = getCurrentOreUICustomizerVersion();
                                dialog
                                    .showMessageBox({
                                        type: "info",
                                        title: "No Ore UI Customizer Updates Available",
                                        message: `The latest version of the Ore UI Customizer is already downloaded.\nVersion: ${currentVersion?.version}`,
                                        buttons: ["Okay", "Force Redownload"],
                                        noLink: true,
                                        cancelId: 0,
                                        defaultId: 0,
                                    })
                                    .then((result: MessageBoxReturnValue): void => {
                                        if (result.response === 1) {
                                            updateLocalAPICopy(baseWindow ? BrowserWindow.fromId(baseWindow.id!) ?? undefined : undefined);
                                            return;
                                        } else {
                                            return;
                                        }
                                    });
                            } else {
                                const latestVersion: APIVersionJSON | undefined = await getLatestOreUICustomizerVersion();
                                if (latestVersion === undefined) {
                                    dialog.showMessageBox({
                                        type: "error",
                                        title: "Error",
                                        message: "There was an error checking for updates, check your internet connection and try again.",
                                        buttons: ["Okay"],
                                        noLink: true,
                                    });
                                } else {
                                    const currentVersion: APIVersionJSON | undefined = getCurrentOreUICustomizerVersion();
                                    dialog
                                        .showMessageBox({
                                            type: "info",
                                            title: "Ore UI Customizer Update Available",
                                            message: `A new version of the Ore UI Customizer is available.\nVersion: ${latestVersion.version}\nCurrent Version: ${currentVersion?.version}\n\nWould you like to download it now?`,
                                            buttons: ["Download", "Cancel"],
                                            noLink: true,
                                            cancelId: 1,
                                            defaultId: 0,
                                        })
                                        .then((result: MessageBoxReturnValue): void => {
                                            if (result.response === 0) {
                                                updateLocalAPICopy(baseWindow ? BrowserWindow.fromId(baseWindow.id!) ?? undefined : undefined);
                                                return;
                                            } else {
                                                return;
                                            }
                                        });
                                }
                            }
                        },
                    }, */,
            {
                label: "App Changelogs",
                click(): void {
                    dialog.showMessageBox({
                        type: "error",
                        title: "Function Not Implemented",
                        message: "This feature is not implemented yet.",
                        buttons: ["Okay"],
                        noLink: true,
                    });
                },
            },
            {
                label: "Customizer Changelogs",
                click(): void {
                    dialog.showMessageBox({
                        type: "error",
                        title: "Function Not Implemented",
                        message: "This feature is not implemented yet.",
                        buttons: ["Okay"],
                        noLink: true,
                    });
                },
            },
            {
                type: "separator",
            },
            {
                label: "About",
                accelerator: "CmdOrCtrl+F1",
                click(): void {
                    ipcRenderer.sendSync<1>("open-about-window", currentWindow.id);
                },
            },
        ],
    },
]);
currentWindow.setMenu(menu);

globalThis.currentMenu = menu;

declare global {
    namespace globalThis {
        var currentMenu: Electron.Menu;
    }
}

