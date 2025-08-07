/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

// import type { MessageBoxReturnValue } from "electron";
// import { reloadMainPageContents } from "../app/app.tsx";
import "../app/renderer.tsx";
import "./api/renderer.ts";
// import { CustomizerAppPage, pageSpecificSearchParams, type SearchParamTypes } from "./utils/pageList.ts";
// const { dialog } = require("@electron/remote") as typeof import("@electron/remote");
import "./globalify_renderer.ts";

/* globalThis.goToPage = function goToPage(page: CustomizerAppPage, pageSearchParams?: SearchParamTypes[CustomizerAppPage]): void {
    const url: URL = new URL(window.location.href);
    const searchParams: URLSearchParams = url.searchParams;
    if ((searchParams.get("page") ?? CustomizerAppPage.Home) !== page) {
        for (const [param, _type] of pageSpecificSearchParams[(searchParams.get("page") ?? CustomizerAppPage.Home) as CustomizerAppPage]) {
            if (!pageSpecificSearchParams[page].includes((param as unknown as undefined)!)) {
                searchParams.delete(param);
            }
        }
    }
    if (pageSearchParams) {
        for (const [param, type] of pageSpecificSearchParams[page]) {
            if (param in pageSearchParams) {
                searchParams.set(
                    param,
                    type === "string"
                        ? pageSearchParams[param as keyof typeof pageSearchParams]
                        : JSON.stringify(pageSearchParams[param as keyof typeof pageSearchParams])
                );
            }
        }
    }
    searchParams.set("page", page);

    history.pushState(null, "", url.href);

    // Temporary until an actual Router class is made.
    reloadMainPageContents();
}; */

/* declare global {
    namespace globalThis {
        function goToPage(page: CustomizerAppPage): void;
    }
} */

/* if (!isLocalAPICopyDownloaded()) {
    downloadLocalAPICopy();
} else {
    if (!checkIfCurrentOreUICustomizerVersionIsLatest()) {
        (async (): Promise<void> => {
            const currentVersion: APIVersionJSON | undefined = getCurrentOreUICustomizerVersion();
            const latestVersion: APIVersionJSON | undefined = await getLatestOreUICustomizerVersion();
            dialog
                .showMessageBox({
                    type: "info",
                    title: "Ore UI Customizer Update Available",
                    message: `A new version of the Ore UI Customizer is available.\nVersion: ${latestVersion?.version}\nCurrent Version: ${currentVersion?.version}\n\nWould you like to download it now?`,
                    buttons: ["Download", "Cancel"],
                    noLink: true,
                    cancelId: 1,
                    defaultId: 0,
                })
                .then((result: MessageBoxReturnValue): void => {
                    if (result.response === 0) {
                        updateLocalAPICopy(getCurrentWindow());
                        return;
                    } else {
                        return;
                    }
                });
        })();
    }
} */

// Load the data from the session storage into the router once all the event subscriptions have been added.
router.loadDataFromSessionStorage();

