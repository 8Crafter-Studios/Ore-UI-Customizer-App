/**
 * src/utils/URLs.ts
 * @module
 * @description A file containing URLs and file paths used by the app.
 * @supports Main, Preload, Renderer
 */
/** */
import path from "node:path";
import { resolve as resolveURL } from "node:url";
import process from "node:process";

/**
 * The source website for 8Crafter's Ore UI Customizer.
 */
export const API_SOURCE_WEBSITE_URL = "https://www.8crafter.com";

/**
 * The path to the API folder for 8Crafter's Ore UI Customizer.
 *
 * This is used for both getting the URL of the API, and determining where to store an archive of the API.
 *
 * @deprecated This is no longer used as the API is now included directly in the app.
 */
export const API_FOLDER_PATH = "./api";

/**
 * The path to the folder that stores all of the saved configs for 8Crafter's Ore UI Customizer.
 */
export const CONFIG_FOLDER_PATH = "./configs";

/**
 * The path to the folder that stores all of the imported plugins for 8Crafter's Ore UI Customizer.
 */
export const PLUGIN_FOLDER_PATH = "./plugins";

/**
 * The path to the folder that stores all of the saved themes for 8Crafter's Ore UI Customizer.
 */
export const THEME_FOLDER_PATH = "./themes";

/**
 * The URL of the API dependency list for 8Crafter's Ore UI Customizer.
 *
 * @deprecated This is no longer used as the API is now included directly in the app.
 */
export const API_DEPENDENCY_LIST_URL: string = resolveURL(
    API_SOURCE_WEBSITE_URL,
    path.posix.join(API_FOLDER_PATH, "./dependency_lists/ore-ui-customizer-api.dependencies.json")
);

/**
 * The URL of the API version details file for 8Crafter's Ore UI Customizer.
 */
export const API_VERSION_URL: string = resolveURL(API_SOURCE_WEBSITE_URL, "./assets/shared/ore-ui-customizer-version.json");

/**
 * The path to the app data folder for the app.
 */
export const APP_DATA_FOLDER_PATH: string = path.join(
    process.env.APPDATA || `${process.env.HOMEDRIVE! + process.env.HOMEPATH!}/.local/share`,
    "ore_ui_customizer"
);

/**
 * The path to the old app data folder for the app.
 */
export const OLD_APP_DATA_FOLDER_PATH: string = path.join(
    process.env.APPDATA || `${process.env.HOMEDRIVE! + process.env.HOMEPATH!}/.local/share`,
    "8Crafter's Ore UI Customizer"
);
