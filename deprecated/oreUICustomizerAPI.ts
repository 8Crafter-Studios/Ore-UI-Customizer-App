/**
 * deprecated/oreUICustomizerAPI.ts
 * @module
 * @description This file was used for importing the Ore UI Customizer API when it was stored in a local folder on your device.
 * @deprecated This is no longer used as the API is now included directly in the app.
 */
// @ts-nocheck
import path from "node:path";
import { APP_DATA_FOLDER_PATH, API_FOLDER_PATH } from "./URLs.ts";
import EventEmitter from "node:events";

/**
 * @deprecated
 */
export let oreUICustomizerAPI: typeof import("./ore-ui-customizer-api") | undefined = undefined;

/**
 * @deprecated
 */
export const oreUICustomizerAPIUpdateNotifier = new EventEmitter<{ versionUpdated: []; variableUpdated: [] }>();

/**
 * @deprecated
 */
async function updateOreUICustomizerAPIVariable(): Promise<void> {
    try {
        oreUICustomizerAPI = (await import(
            /* @vite-ignore */
            new URL("script://" + path.join(APP_DATA_FOLDER_PATH, API_FOLDER_PATH, "api", "ore-ui-customizer-api.js")).href
        )) as typeof import("./ore-ui-customizer-api");
        oreUICustomizerAPIUpdateNotifier.emit("variableUpdated");
    } catch {}
}

oreUICustomizerAPIUpdateNotifier.on("versionUpdated", updateOreUICustomizerAPIVariable);

await updateOreUICustomizerAPIVariable();
