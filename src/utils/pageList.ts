import type { ConfigInfo } from "./ConfigManager";
import type { PluginInfo } from "./PluginManager";

/**
 * src/utils/pageList.ts
 * @module
 * @description A file containing symbols related to the navigation of the app.
 * @supports Main, Preload, Renderer
 */
export enum CustomizerAppPage {
    Home = "home",
    Installations = "installations",
    Marketplace = "marketplace",
    Preferences = "preferences",
    ThemeEditor = "theme-editor",
    ConfigEditor = "config-editor",
    Plugins = "plugins",
    Themes = "themes",
    Configs = "configs",
    PluginDetails = "plugin-details",
    ConfigDetails = "config-details",
    ThemeDetails = "theme-details",
}

export const pageSpecificSearchParams = {
    [CustomizerAppPage.Home]: [],
    [CustomizerAppPage.Installations]: [],
    [CustomizerAppPage.Marketplace]: [
        ["itemId", "string"],
        ["page", "number"],
        ["query", "string"],
        ["filters", "string"],
        ["sort", "string"],
    ],
    [CustomizerAppPage.Preferences]: [
        ["preferencesTab", "string"],
        ["page", "number"],
    ],
    [CustomizerAppPage.ThemeEditor]: [
        ["themePath", "string"],
        ["themeId", "string"],
        ["themeVersion", "string"],
    ],
    [CustomizerAppPage.ConfigEditor]: [
        ["configPath", "string"],
        ["configId", "string"],
        ["configVersion", "string"],
    ],
    [CustomizerAppPage.Plugins]: [],
    [CustomizerAppPage.Themes]: [],
    [CustomizerAppPage.Configs]: [],
    [CustomizerAppPage.PluginDetails]: [
        ["folderPath", "string"],
        ["missingPluginDetails", "JSON"],
    ],
    [CustomizerAppPage.ConfigDetails]: [
        ["filePath", "string"],
        ["missingConfigDetails", "JSON"],
    ],
    [CustomizerAppPage.ThemeDetails]: [
        ["folderPath", "string"],
        // TO-DO
        // ["missingThemeDetails", "JSON"],
    ],
} as const satisfies Record<CustomizerAppPage, [...searchParams: [searchParamKey: string, type: PageSpecificSearchParamType][]]>;

type PageSpecificSearchParamType = "string" | "number" | "boolean" | "JSON";
type PageSpecificSearchParamTypeToSearchParamTypesInterfaceSearchParamType<T extends PageSpecificSearchParamType> =
    | (T extends "string" ? string : T extends "number" ? number : T extends "boolean" ? boolean : T extends "JSON" ? any : never)
    | null
    | undefined
    | never;
type SearchParamTypesInterfaceType = {
    [Page in CustomizerAppPage]: (typeof pageSpecificSearchParams)[Page] extends []
        ? never
        : {
              [SearchParamKey in (typeof pageSpecificSearchParams)[Page][number][0]]: PageSpecificSearchParamTypeToSearchParamTypesInterfaceSearchParamType<
                  Exclude<(typeof pageSpecificSearchParams)[Page][number], Exclude<(typeof pageSpecificSearchParams)[Page][number], [SearchParamKey, any]>>[1]
              >;
          };
};

type VerifySearchParamTypesIsCorrect<T extends SearchParamTypesInterfaceType> = T;

export interface SearchParamTypes
    extends VerifySearchParamTypesIsCorrect<{
        [CustomizerAppPage.Home]: never;
        [CustomizerAppPage.Installations]: never;
        [CustomizerAppPage.Marketplace]: { itemId: string; page: number; query: string; filters: string; sort: string };
        [CustomizerAppPage.Preferences]: { preferencesTab: string; page: number };
        [CustomizerAppPage.ThemeEditor]: { themePath: string; themeId: string; themeVersion: string };
        [CustomizerAppPage.ConfigEditor]: { configPath: string; configId: string; configVersion: string };
        [CustomizerAppPage.Plugins]: never;
        [CustomizerAppPage.Themes]: never;
        [CustomizerAppPage.Configs]: never;
        [CustomizerAppPage.PluginDetails]: { folderPath: string; missingPluginDetails: PluginInfo };
        [CustomizerAppPage.ConfigDetails]: { filePath: string; missingConfigDetails: ConfigInfo };
        // TO-DO
        [CustomizerAppPage.ThemeDetails]: { folderPath: string /* , missingThemeDetails: ThemeInfo */ };
    }> {}
