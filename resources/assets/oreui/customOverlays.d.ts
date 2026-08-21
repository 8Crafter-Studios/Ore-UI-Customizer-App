/// <reference path="JSONB.d.ts" preserve="true" />
/// <reference path="types.d.ts" preserve="true" />
/// <reference path="oreUICustomizer8CrafterConfig.d.ts" preserve="true" />
/// <reference path="class_path.d.ts" preserve="true" />
/// <reference path="shiki.bundle.d.ts" preserve="true" />
declare const __OUIC_customOverlays_initStartPerf__: number;
declare const __OUIC_customOverlays_initStartMs__: number;
/**
 * IPs and ports of servers to fetch the MOTD in order to fetch certain data.
 *
 * @todo Implement usage of this.
 */
declare const MOTDAPIFetchSources: {
    readonly latestVersion: ["motd.api.ouic.8crafter.com", 19800];
    readonly updateInfo: ["motd.api.ouic.8crafter.com", 19801];
};
/**
 * @decorator
 * @param value Whether the property should be writable or not.
 */
declare function writable(value: boolean): MethodDecorator & PropertyDecorator & ParameterDecorator;
/**
 * @decorator
 * @param value Whether the property should be enumerable or not.
 */
declare function enumerable(value: boolean): MethodDecorator & PropertyDecorator & ParameterDecorator;
/**
 * @decorator
 * @param value Whether the property should be configurable or not.
 */
declare function configurable(value: boolean): MethodDecorator & PropertyDecorator & ParameterDecorator;
declare const shikiLoadedPromise: Promise<{
    default: typeof import("./shiki.bundle.js");
}>;
declare var oreUIEnums: typeof import("@ore-ui-types/enums") | undefined;
declare const oreUIEnumsLoadedPromise: Promise<void>;
interface Console {
    everything: ConsoleEverythingEntry[];
    /**
     * Logs an internal message that only shows up in the Ore UI Customizer's console and not the DevTools console.
     */
    _logInternal(...args: any[]): void;
}
type LogType = "log" | "info" | "error" | "warn" | "debug";
type ConsoleEverythingEntry = {
    type: "log" | "info" | "error" | "warn" | "debug";
    timeStamp: string;
    performanceStamp?: number | undefined;
    value: unknown[];
    stack?: string | undefined;
} | {
    type: "internal";
    timeStamp: string;
    performanceStamp?: number | undefined;
    value: unknown[];
    stack?: string | undefined;
} | {
    type: "exception";
    timeStamp: string;
    performanceStamp?: number | undefined;
    value: ErrorEvent;
    stack?: string | undefined;
} | {
    type: "promiseRejection";
    timeStamp: string;
    performanceStamp?: number | undefined;
    value: PromiseRejectionEvent;
    stack?: string | undefined;
};
type ConsoleLogCallback = (data: ConsoleEverythingEntry) => void;
interface ContextMenuCreationOptions {
    x: number;
    y: number;
    width?: number | undefined;
    height?: number | undefined;
    items: ContextMenuItemCreationOptions[];
}
type ContextMenuItemCreationOptions = {
    type?: "action" | undefined;
    title?: string | undefined;
    label: string;
    action(): Promise<void> | void;
    disabled?: boolean | undefined;
} | {
    type: "separator";
} | {
    type: "submenu";
    label: string;
    title?: string | undefined;
    submenu: ContextMenuItemCreationOptions[];
    disabled?: boolean | undefined;
};
type CSSEditorSelectedType = "none" | "element" | "styleSheet" | "root" | "globalStyleElement";
interface Window {
    /**
     * @internal
     */
    observingExternalServerWorldListForLitePlayScreenServersTab?: boolean | undefined;
    /**
     * @internal
     */
    observingThirdPartyWorldListForLitePlayScreenServersTab?: boolean | undefined;
    /**
     * @internal
     */
    observingRealmsListForLitePlayScreenServersTab?: boolean | undefined;
    /**
     * @internal
     */
    observingFriendWorldListForLitePlayScreenFriendsTab?: boolean | undefined;
    /**
     * @internal
     */
    observingLANWorldListForLitePlayScreenLanTab?: boolean | undefined;
    /**
     * @internal
     */
    observingNetworkWorldDetailsForLitePlayScreenServersTab?: boolean | undefined;
    /**
     * @internal
     */
    copying?: boolean | undefined;
    /**
     * Only present when using the {@link copyTextToClipboard_old} and the `core.router` facet is not available.
     *
     * @deprecated
     */
    __DEBUG_copyTextToClipboard_old_GLOBALS_copyError__?: unknown | undefined;
    [key: `temp${bigint}`]: unknown;
}
declare function fetchURIText(uri: string, suppresConsoleLogs?: boolean): Promise<string | null>;
/**
 * Cached source maps.
 *
 * @internal
 */
declare const cachedSourceMaps: {
    /**
     * Maps the URI of a JS file to the URI of its source map file, or `null` if it does not have one.
     */
    readonly uris: {
        [fileURI: string]: string | null;
    };
    /**
     * Maps the URI of a source map file to its contents.
     */
    readonly maps: {
        [sourceMapURI: string]: SourceMap | null;
    };
};
interface SourceMap {
    version: number;
    file: string;
    sourceRoot: string;
    sources: string[];
    names: string[];
    mappings: string;
}
interface SourceMapSourceLocation {
    fileURI: string;
    source: string;
    line: number;
    column: number;
}
declare function getSourceLocationFromSourceMap(fileURI: string, line: number, column: number, sourceMap: SourceMap): SourceMapSourceLocation | undefined;
declare function getSourceLocationFromSourceMap(line: number, column: number, sourceMap: SourceMap): Omit<SourceMapSourceLocation, "fileURI"> | undefined;
declare function getSourceLocationFromJSLocation(fileURI: string, line: number, column: number): Promise<SourceMapSourceLocation | undefined>;
/**
 * Extracts JS file references of the form:
 *   something.js:LINE:COLUMN
 * Works with ANY URI protocol.
 */
declare const STACK_JS_REGEX: RegExp;
/**
 * Maps a stack trace to include TS equivalents.
 *
 * @param stack The original stack trace string.
 * @param showLoadingPlaceholders Whether to show "(Loading...)" for uncached maps. Defaults to `true`.
 */
declare function mapStackWithTS(stack: string, showLoadingPlaceholders?: boolean): {
    stack: string;
    hasUnloadedStacks: false;
} | {
    stack: string;
    hasUnloadedStacks: true;
    fullyLoadedStack: Promise<string>;
};
declare const facetList: FacetList[number][];
interface EngineInterceptorEventMap {
    beforeMethodCall: EngineInterceptorBeforeMethodCallEvent;
    methodCall: EngineInterceptorAfterMethodCallEvent;
}
interface FacetManagerEventMap {
}
interface QueryManagerEventMap {
}
type EngineMethod = keyof {
    [key in keyof Engine as Engine[key] extends AnyCallableFunction<1> ? key : never]: Engine[key];
};
type PolyfillEventTarget_EventListenerMap = Record<string, {
    readonly callback: EventListenerOrEventListenerObject;
    readonly capture: boolean;
    readonly once: boolean;
    readonly passive: boolean;
    readonly [Symbol.toStringTag]: "EventListenerDetails";
}[]> & {
    readonly [Symbol.toStringTag]: "EventListenerMap";
};
type PolyfillEventTarget_EventListenerMap_Input = Record<string, {
    readonly callback: EventListenerOrEventListenerObject;
    readonly capture: boolean;
    readonly once: boolean;
    readonly passive: boolean;
}[]>;
/**
 * A polyfilled version of {@link EventTarget}.
 *
 * This exists because in Ore UI (Cohtml), {@link EventTarget} is not constructable.
 *
 * EventTarget is a DOM interface implemented by objects that can receive events and may have listeners for them.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget)
 */
declare class PolyfillEventTarget implements EventTarget {
    #private;
    constructor();
    /**
     * The event listeners.
     */
    get listeners(): PolyfillEventTarget_EventListenerMap;
    /**
     * The event listeners.
     */
    set listeners(value: PolyfillEventTarget_EventListenerMap_Input | PolyfillEventTarget_EventListenerMap);
    addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options?: boolean | EventListenerOptions): void;
    dispatchEvent(event: Event): boolean;
}
declare class EngineInterceptorBeforeMethodCallEvent<T extends EngineMethod = EngineMethod> extends Event {
    #private;
    method: T;
    args: Parameters<Engine[T]>;
    constructor(method: T, args: Parameters<Engine[T]> | IArguments, eventInitDict?: EventInit);
    get type(): "beforeMethodCall";
}
declare class EngineInterceptorAfterMethodCallEvent<T extends EngineMethod = EngineMethod> extends Event {
    #private;
    method: T;
    args: Parameters<Engine[T]>;
    result?: ReturnType<Engine[T]>;
    error?: unknown;
    constructor(method: T, args: Parameters<Engine[T]> | IArguments, result: {
        result: ReturnType<Engine[T]>;
    } | {
        error: unknown;
    }, eventInitDict?: EventInit);
    get type(): "methodCall";
}
declare class EngineInterceptorBeforeVanillaEventListenerTriggerEvent<T extends LooseAutocomplete<EngineEventID> = string> extends Event {
    #private;
    eventId: T;
    args: EngineEvent<T>;
    constructor(eventId: T, args: EngineEvent<T> | IArguments, eventInitDict?: EventInit);
    get type(): "beforeVanillaEventListenerTrigger";
    get passingToVanillaUIFilesPrevented(): boolean;
    preventPassingToVanillaUIFiles(): void;
}
/** @ts-ignore: This is necessary, there is no alternative. */ /***/
declare namespace globalThis {
    /** @ts-ignore: This is necessary, there is no alternative. */ /***/
    namespace __OUICInternals__ {
        interface OUICConsoleConfigData {
            /**
             * @experimental
             * @todo Add an actual option for this to the UI.
             * @idea Make these displayed using the `Readonly_icon.png` icon instead of an italic 75% opacity `read-only` before the property name. The icon would be to the left of the expansion arrow (or where it would be when there isn't one).
             */
            showReadonlyPropertiesLabelInConsoleEnabled: boolean;
        }
        /**
         * @alpha This class is still in early development.
         * @hideconstructor
         */
        class OUICConsoleConfig implements OUICConsoleConfigData {
            #private;
            private constructor();
            readonly tempOverrides: {
                [key in keyof OUICConsoleConfigData]: OUICConsoleConfigData[key] | undefined;
            } & {
                readonly [Symbol.toStringTag]: "OUICConsoleConfigTempOverrides";
            };
            /**
             * Whether or not to show labels for read-only properties in the console.
             *
             * @experimental
             *
             * @default false
             */
            get showReadonlyPropertiesLabelInConsoleEnabled(): boolean;
        }
        /**
         * @alpha This class is still in early development.
         */
        export const OUICConsoleConfigInstance: OUICConsoleConfig;
        /**
         * @alpha This class is still in early development.
         * @hideconstructor
         */
        class EngineInterceptor extends PolyfillEventTarget {
            #private;
            readonly originalEngineMethods: {
                readonly [method in EngineMethod]?: Engine[method];
            };
            private readonly _engineMethodsToIntercept;
            private constructor();
            addEventListener<K extends keyof EngineInterceptorEventMap>(type: K, listener: (this: EngineInterceptor, ev: EngineInterceptorEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
            addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
            removeEventListener<K extends keyof EngineInterceptorEventMap>(type: K, listener: (this: EngineInterceptor, ev: EngineInterceptorEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
            removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
            dispatchEvent<K extends keyof EngineInterceptorEventMap>(event: EngineInterceptorEventMap[K]): boolean;
            dispatchEvent(event: Event): boolean;
        }
        /**
         * @alpha This class is still in early development.
         */
        export const EngineInterceptorInstance: EngineInterceptor;
        /**
         * @alpha This class is still in early development.
         * @hideconstructor
         */
        class FacetManager extends PolyfillEventTarget {
            #private;
            private constructor();
            /**
             * The data of the facets that are currently loaded, not including facets that have been discarded.
             */
            readonly facetData: Partial<FacetTypeMap> & Record<string, unknown>;
            /**
             * The data of the facets that have been loaded, including facets that have been discarded.
             */
            readonly facetDataAll: Partial<FacetTypeMap> & Record<string, unknown>;
            /**
             * The list of facets that are currently force loaded.
             */
            readonly forceLoadedFacets: string[];
            /**
             * The list of facets that are currently being used by the vanilla UI files.
             */
            readonly facetsInUseByVanilla: string[];
            /**
             * The list of facets that when updated do not have the update event passed to the vanilla UI files.
             */
            readonly facetsWithUpdatesToVanillaBlocked: string[];
            /**
             * The list of facets that when an event related to them is triggered by the vanilla UI files, the event is blocked from passing to anything else.
             */
            readonly facetsWithUpdatesFromVanillaBlocked: string[];
            /**
             * The list of facets that have been loaded that are new (as in not yet in the {@link facetList}) that have been logged in the console.
             *
             * @internal
             */
            readonly __notedDiscoveredNewLoadedFacets__: string[];
            /**
             * The list of facets that have been loaded that are new (as in not yet in the {@link facetList}).
             */
            readonly discoveredNewLoadedFacets: string[];
            /**
             * The list of facets that have been requested that are new (as in not yet in the {@link facetList}).
             */
            readonly discoveredNewRequestedFacets: string[];
            /**
             * Observes the data of a facet.
             *
             * The callback is not triggered when the facet is discarded.
             *
             * @template T The ID of the facet to observe the data of.
             * @param facet The facet to observe the data of.
             * @param callback The callback to call when the data of the facet changes.
             * @returns Whether the callback was added or not. If it returns false that means that the specified callback was already being used to observe the specified facet.
             */
            observeFacetData<T extends LooseAutocomplete<FacetList[number]>>(facet: T, callback: (facetData: (FacetTypeMap & Record<string, unknown>)[T], facet: T) => Promise<void> | void): boolean;
            /**
             * Stops observing the data of a facet.
             *
             * @template T The ID of the facet to stop observing the data of.
             * @param facet The facet to stop observing the data of.
             * @param callback The callback that was passed to {@link observeFacetData}.
             * @returns Whether the callback was removed or not. If it returns false that means that the specified callback was not being used to observe the specified facet.
             */
            unobserveFacetData<T extends LooseAutocomplete<FacetList[number]>>(facet: T, callback: (facetData: (FacetTypeMap & Record<string, unknown>)[T], facet: T) => Promise<void> | void): boolean;
            /**
             * Sets whether a facet is force loaded or not.
             *
             * Marking a facet as force loaded means that is cannot be discarded.
             *
             * @param facet The facet to set whether it is force loaded or not.
             * @param forceLoaded Whether the facet is force loaded or not.
             *
             * @todo
             */
            setFacetIsForceLoaded(_facet: LooseAutocomplete<FacetList[number]>, _forceLoaded: boolean): void;
        }
        /**
         * The query
         */
        export const FacetManagerInstance: FacetManager;
        /**
         * @alpha This class is still in early development.
         * @hideconstructor
         */
        class QueryManager extends PolyfillEventTarget {
            #private;
            /**
             * The next query ID.
             */
            nextQueryId: bigint;
            /**
             * @todo Document this.
             */
            readonly activeVanillaNonParameterizedQueries: {
                [queryName in LooseAutocomplete<keyof EngineQuerySubscribeEventParamsMap>]?: (number | bigint)[];
            };
            /**
             * @todo Document this.
             */
            readonly activeVanillaNonParameterizedQueriesIdMap: {
                [queryId: `${number | bigint}`]: LooseAutocomplete<keyof EngineQuerySubscribeEventParamsMap>;
            };
            /**
             * @todo Document this.
             */
            readonly activeQueryManagerQueryIds: {
                [queryId: `${number | bigint}`]: ((result: EngineQueryResult<keyof EngineQueryNonFacetResultMap>) => void)[];
            };
            /**
             * The list of known queries.
             */
            readonly knownQueries: readonly ["core.animation", "core.input", "core.locale", "core.safeZone", "core.screenReader", "vanilla.gameplay.furnace", "core.splitScreen", "core.cloudStorage", "core.commandState", "core.device.display", "core.device.network", "core.device.platform", "core.device.storage", "core.staticFeatureFlag", "core.flightingConfig.bool", "core.flightingToggle", "vanilla.core.dataDrivenUICompositionQuery", "vanillaCoreDataDrivenUIDefinitionQuery", "vanillaCoreDataDrivenUIScreenIdQuery", "vanillaCoreDataStoreNumberQuery", "vanillaCoreDataStoreStringQuery", "vanillaCoreDataStoreBoolQuery", "vanillaGameplayContainerSizeQuery", "vanillaGameplayContainerItemQuery", "vanillaGameplayContainerNameQuery", "vanillaGameplayContainerChestTypeQuery", "vanillaGameplayRecipeBookSearchStringQuery", "vanillaGameplayRecipeBookFilteringQuery", "vanillaGameplayUIProfile", "vanillaGameplayAnvilQuery", "vanillaGameplayTradeOverviewQuery", "vanillaGameplayTradeTierQuery", "vanillaGameplayTradeOfferQuery", "vanilla.menus.settingsGroupQuery", "vanilla.menus.settingsGroupInfoQuery", "vanilla.menus.settingsUiDebugQuery", "vanilla.menus.settingsTextQuery", "vanilla.menus.settingsBooleanQuery", "vanilla.menus.settingsNumberQuery", "vanilla.menus.settingsOptionQuery", "vanilla.menus.settingsActionQuery", "vanilla.menus.buildInfoQuery", "vanilla.menus.localWorldListQuery", "vanilla.menus.localWorldQuery", "realmsServerSettingsQuery", "vanilla.currentParty.dataQuery", "vanilla.currentParty.destinationQuery", "vanilla.currentParty.membersQuery", "vanilla.menus.realms.adminLogQuery", "vanilla.menus.realms.realmsBackupDownloadQuery", "vanilla.menus.realms.realmsSavesQuery", "vanilla.partyChat.unreadMessagesQuery", "vanilla.playerFriendList", "vanilla.realms.currentRealm", "vanilla.receivedFriendRequests", "vanilla.CoreDataDrivenUIDefinitionQuery", "vanillaGameplayImmediateRespawnQuery", "vanillaGameplayActiveLevelHardcoreModeQuery", "vanillaGameplayPlayerDeathInfoQuery", "vanillaGameplayIsLocalPlayerAliveQuery"];
            /**
             * The list of facets that have been loaded that are new (as in not yet in the {@link knownQueries}).
             */
            readonly discoveredNewLoadedQueries: string[];
            /**
             * The list of facets that have been requested that are new (as in not yet in the {@link knownQueries}).
             */
            readonly discoveredNewRequestedQueries: string[];
            private constructor();
            /**
             * Gets the query ID for a query name and paramters using the same hashing function as the vanilla UI files do.
             *
             * @param queryName The name of the query.
             * @param queryParameters The parameters of the query.
             * @returns The query ID.
             */
            protected getQueryID<T extends keyof EngineQuerySubscribeEventParamsMap>(queryName: T, queryParameters: unknown[]): number;
            /**
             * Fetches a query.
             *
             * @param queryName The name of the query.
             * @param queryParameters The parameters of the query.
             * @returns The result of the query.
             */
            fetchQuery<T extends keyof EngineQuerySubscribeEventParamsMap>(queryName: T, ...queryParameters: EngineQuerySubscribeEventParamsMap[T]): Promise<EngineQueryResult<T>>;
            /**
             * Subscribes to a query.
             *
             * @param queryName The name of the query.
             * @param callback The callback to call when the query is updated.
             * @param queryParameters The parameters of the query.
             * @returns A function to unsubscribe from the query.
             */
            subscribeToQuery<T extends keyof EngineQuerySubscribeEventParamsMap>(queryName: T, callback: (result: EngineQueryResult<T>) => Promise<void> | void, ...queryParameters: EngineQuerySubscribeEventParamsMap[T]): () => void;
        }
        /**
         * @alpha This class is still in early development.
         */
        export const QueryManagerInstance: QueryManager;
        export {};
    }
    export import OUICConsoleConfig = __OUICInternals__.OUICConsoleConfigInstance;
    export import EngineInterceptor = __OUICInternals__.EngineInterceptorInstance;
    export import FacetManager = __OUICInternals__.FacetManagerInstance;
    export import QueryManager = __OUICInternals__.QueryManagerInstance;
    export {};
}
/**
 * Whether to intercept engine subscriptions and store them in the {@link hookedEngineSubscriptions} object.
 *
 * This stores additions and removals of event subscription callbacks (from {@link engine.on} and {@link engine.off}), as well as the parameters of
 * {@link engine.trigger} calls.
 *
 * To enable it, either set the `setting:__CACHING_ENGINE_SUBSCRIPTIONS_FROM_HOOK_ENABLED__` {@link localStorage} item to `"true"` and reload the page, or set this variable to `true`.
 */
declare var __CACHING_ENGINE_SUBSCRIPTIONS_FROM_HOOK_ENABLED__: boolean;
/**
 * Whether to intercept engine query results and store them in the {@link cachedQueryResults} object.
 *
 * To enable it, either set the `setting:__CACHING_ENGINE_QUERY_RESULTS_FROM_HOOK_ENABLED__` {@link localStorage} item to `"true"` and reload the page, or set this variable to `true`.
 */
declare var __CACHING_ENGINE_QUERY_RESULTS_FROM_HOOK_ENABLED__: boolean;
/**
 * Whether to intercept vanilla command calls and store their parameters and results in the {@link cachedVanillaCommandCalls} object.
 *
 * To enable it, set the `setting:__CACHING_VANILLA_COMMAND_CALLS_ENABLED__` {@link localStorage} item to `"true"`, then reload the page.
 */
declare const __CACHING_VANILLA_COMMAND_CALLS_ENABLED__: boolean;
/**
 * Whether to debug log vanilla command calls, their parameters, and their results to the console.
 *
 * To enable it the {@link __CACHING_VANILLA_COMMAND_CALLS_ENABLED__ | \_\_CACHING_VANILLA_COMMAND_CALLS_ENABLED\_\_} setting must be enabled first, then either set the
 * `setting:__VANILLA_COMMAND_CALL_DEBUG_LOGGING_ENABLED__` {@link localStorage} item to `"true"` and reload the page, or set this variable to `true`.
 */
declare var __VANILLA_COMMAND_CALL_DEBUG_LOGGING_ENABLED__: boolean;
declare const hookedEngineSubscriptions: {
    on: Record<EngineEventID, RemoveFirstNElements<Parameters<typeof engine.on<EngineEventID>>, 1>[]>;
    off: Record<EngineEventID, RemoveFirstNElements<Parameters<typeof engine.off<EngineEventID>>, 1>[]>;
    trigger: Record<EngineEventID, RemoveFirstNElements<Parameters<typeof engine.trigger<EngineEventID>>, 1>[]>;
};
/**
 * @type {{[key in keyof EngineQueryNonFacetResultMap]?: [timestamp: number, responseType: "subscribed" | "updated", value: EngineQueryNonFacetResultMap[key], args: unknown[]][]} & {[key in FacetList[number]]?: [timestamp: number, responseType: "subscribed" | "updated", value: FacetTypeMap[key]][]} & Record<string, [timestamp: number, responseType: "subscribed" | "updated", value: any][]>}
 */
declare const cachedQueryResults: {
    [key in keyof EngineQueryNonFacetResultMap]?: [
        timestamp: number,
        responseType: "subscribed" | "updated",
        value: EngineQueryNonFacetResultMap[key],
        args: unknown[]
    ][];
} & {
    [key in FacetList[number]]?: [timestamp: number, responseType: "subscribed" | "updated", value: FacetTypeMap[key], args: unknown[]][];
} & Record<string, [timestamp: number, responseType: "subscribed" | "updated", value: unknown, args: unknown[]][]>;
/**
 * @type {{[method in keyof typeof hookedEngineSubscriptions]: { "before": ((...args: Parameters<typeof engine[method]>) => void | boolean)[]; "after": ((...args: Parameters<typeof engine[method]>) => void)[] }}}
 */
declare const engineHookTriggerCallbacks: {
    [method in keyof typeof hookedEngineSubscriptions]: {
        before: ((...args: Parameters<(typeof engine)[method]>) => void | boolean)[];
        after: ((...args: Parameters<(typeof engine)[method]>) => void)[];
    };
};
/**
 * @type {{[method in keyof typeof hookedEngineSubscriptions]: typeof engine[method]}}
 */
declare const originalUnboundEngineMethods: {
    [method in keyof typeof hookedEngineSubscriptions]: (typeof engine)[method];
};
/**
 * @type {Pick<typeof engine, keyof typeof hookedEngineSubscriptions>}
 */
declare const originalEngineMethods: Pick<typeof engine, keyof typeof hookedEngineSubscriptions>;
/**
 * @param {keyof typeof hookedEngineSubscriptions} method
 */
declare function hookEngineMethod(method: keyof typeof hookedEngineSubscriptions): void;
/**
 * This will only have values if {@link __CACHING_VANILLA_COMMAND_CALLS_ENABLED__} is set to `true`.
 *
 * @type {{[commandGroup in keyof typeof __commands__]?: {[command in keyof typeof __commands__[commandGroup]]?: { params?: Parameters<typeof __commands__[commandGroup][command]["callable"]>; result?: ReturnType<typeof __commands__[commandGroup][command]["callable"]> }[]}}}
 */
declare const cachedVanillaCommandCalls: {
    [commandGroup in keyof typeof __commands__]?: {
        [command in keyof (typeof __commands__)[commandGroup]]?: {
            params?: Parameters<(typeof __commands__)[commandGroup][command]["callable"]>;
            result?: ReturnType<(typeof __commands__)[commandGroup][command]["callable"]>;
        }[];
    };
};
declare function vanillaCommandsInterceptor(): void;
/**
 * @type {HTMLDivElement}
 */
declare let mainMenu8CrafterUtilities: HTMLDivElement;
/**
 * @type {HTMLDivElement}
 */
declare let consoleOverlayElement: HTMLDivElement;
/**
 * @type {HTMLDivElement}
 */
declare let consoleOverlayTextElement: HTMLDivElement;
/**
 * @type {HTMLTextAreaElement}
 */
declare let consoleOverlayInputFieldElement: HTMLTextAreaElement;
/**
 * @type {HTMLDivElement}
 */
declare let screenDisplayElement: HTMLDivElement;
/**
 * @type {HTMLDivElement}
 */
declare let elementGeneralDebugOverlayElement: HTMLDivElement;
/**
 * @type {HTMLDivElement}
 */
declare let smallCornerDebugOverlayElement: HTMLDivElement;
/**
 * @type {HTMLDivElement}
 */
declare let statsCornerDebugOverlayElement: HTMLDivElement;
/**
 * @type {HTMLDivElement}
 */
declare let cssEditorDisplayElement: HTMLDivElement;
/**
 * @type {HTMLDivElement}
 */
declare let screenInputBlocker: HTMLDivElement;
/**
 * @type {HTMLDivElement}
 */
declare let htmlSourceCodePreviewElement: HTMLDivElement;
/**
 * @type {HTMLParagraphElement}
 */
declare let htmlSourceCodePreviewElementP: HTMLParagraphElement;
/**
 * @type {HTMLDivElement}
 */
declare let cssEditorSubtitleElement: HTMLDivElement;
/**
 * @type {HTMLStyleElement}
 */
declare let customGlobalCSSStyleElement: HTMLStyleElement;
/**
 * @type {HTMLTextAreaElement}
 */
declare let cssEditorTextBox: HTMLTextAreaElement;
/**
 * @type {HTMLParagraphElement}
 */
declare let cssEditorErrorText: HTMLParagraphElement;
/**
 * @type {HTMLButtonElement}
 */
declare let cssEditorSelectTargetButton: HTMLButtonElement;
/**
 * @type {"none" | "hoveredElementDetails"}
 */
declare let currentDebugMode: "none" | "hoveredElementDetails";
/**
 * @type {CSSStyleSheet[]}
 */
declare let cssEditor_selectableStyleSheets: CSSStyleSheet[];
/**
 * @type {HTMLElement}
 */
declare let cssEditorSelectedElement: HTMLElement;
/**
 * The last five elements selected with the inspect tool (CSS editor select target button for now).
 *
 * @default
 * [, , , , ,] // [empty × 5]
 */
declare const elementInspectSelectionHistory: [
    $0?: HTMLElement | null,
    $1?: HTMLElement | null,
    $2?: HTMLElement | null,
    $3?: HTMLElement | null,
    $4?: HTMLElement | null
];
declare let cssEditorSelectedStyleSheet: CSSStyleSheet;
declare let cssEditorSelectedStyleSheet_rules: unknown[];
declare let cssEditorSelectedType: CSSEditorSelectedType;
declare let cssEditorInSelectMode: boolean;
/**
 * @type {HTMLElement & EventTarget}
 */
declare let currentMouseHoverTarget: HTMLElement & EventTarget;
declare var mousePos: {
    clientX: number;
    clientY: number;
    screenX: number;
    screenY: number;
    movementX: number;
    movementY: number;
    mTarget: EventTarget | null;
    kTarget: EventTarget | null;
};
/**
 * The currently held keys.
 *
 * This is used for the small corner debug overlay (`CTRL+I`).
 */
declare var heldKeys: string[];
/**
 * @type {number[]}
 */
declare var heldKeyCodes: number[];
/**
 * @type {string[]}
 */
declare var heldMouseButtons: string[];
/**
 * @type {readonly ["MAIN", "AUX", "SEC", "BACK", "FRWD"]}
 */
declare const MOUSE_BUTTON_NAMES: readonly ["MAIN", "AUX", "SEC", "BACK", "FRWD"];
/**
 * An array of callbacks to be executed when a console message is intercepted.
 */
declare var onConsoleLogCallbacks: ConsoleLogCallback[];
/**
 * Copies the current list of new facets to the clipboard.
 *
 * @returns {ReturnType<typeof copyTextToClipboardAsync>} A promise that resolves with the result of {@link copyTextToClipboardAsync}.
 */
declare function copyNewFacetListToClipboard(): ReturnType<typeof copyTextToClipboardAsync>;
/**
 * Joins a realm by name.
 *
 * @param {string} realmName The name of the realm to join.
 * @returns {Promise<{success: boolean, message: string, error?: unknown}>} The result.
 *
 * @description
 * 1. Switches to the realms tab, it it is not already open.
 * 2. Waits for the realms list to load.
 * 3. Finds the realm in the realms list and clicks on it.
 * 4. Waits for the realm details to load.
 * 5. Clicks the realm play button.
 *
 * @example
 * ```javascript
 * autoJoinRealm("Asteria").then(console.log);
 * ```
 */
declare function autoJoinRealm(realmName: string): Promise<{
    success: boolean;
    message: string;
    error?: unknown;
}>;
/**
 * Joins a server by name.
 *
 * @param {string} serverName The name of the server to join.
 * @returns {Promise<{success: boolean, message: string, error?: unknown}>} The result.
 *
 * @description
 * 1. Switches to the servers tab, it it is not already open.
 * 2. Waits for the servers list to load.
 * 3. Finds the realm in the servers list and clicks on it.
 * 4. Waits for the server details to load.
 * 5. Clicks the server play button.
 */
declare function autoJoinServer(serverName: string): Promise<{
    success: boolean;
    message: string;
    error?: unknown;
}>;
/**
 * Joins a world by name.
 *
 * @param {string} worldName The name of the world to join.
 * @returns {Promise<{success: boolean, message: string, error?: unknown}>} The result.
 *
 * @description
 * 1. Switches to the worlds tab, it it is not already open.
 * 2. Waits for the worlds list to load.
 * 3. Finds the realm in the worlds list and clicks on it.
 * 4. Waits for the world details to load.
 * 5. Clicks the world play button.
 */
declare function autoJoinWorld(worldName: string): Promise<{
    success: boolean;
    message: string;
    error?: unknown;
}>;
declare function enableAutoJoinForOpenServer(): Promise<void>;
/**
 * Prompts the user with a confirmation dialog.
 *
 * @param {string} message The message to prompt the user with.
 * @param {string} [button1="Confirm"] The text of the first button. Defaults to "Confirm".
 * @param {string} [button2="Cancel"] The text of the second button. Defaults to "Cancel".
 * @param {string} [button3] The text of the third button. Defaults to undefined. If undefined, there will be no third button.
 * @param {(container: HTMLDivElement, resolve: (result: 0|1|2) => void, reject: (error: any) => void) => void} [additionalModificationsCallback=()=>{}] A callback function that will be called after the dialog is created.
 * @returns {Promise<0|1|2>} A promise that resovles with `1` if the user clicked the first button and `0` if the user clicked the second button.
 * @throws {any} If the additionalModificationsCallback throws an error.
 */
declare function promptForConfirmation(message: string, button1?: string, button2?: string, button3?: string, additionalModificationsCallback?: (container: HTMLDivElement, resolve: (result: 0 | 1 | 2) => void, reject: (error: unknown) => void) => void): Promise<0 | 1 | 2>;
/**
 * Creates a button selection menu.
 *
 * @param {object} options The options for the button selection menu.
 * @param {string} [options.body] The body of the button selection menu.
 * @param {[text: string, icon?: string][]} options.buttons The buttons of the button selection menu.
 * @param {"1column" | "2columns"} [options.style="2columns"] The style of the button selection menu. "1column" means there is only one column. "2columns" means there are two columns.Defaults to "2columns".
 * @returns {Promise<{canceled: boolean, selection?: number}>} A promise that resolves with the index of the button that was clicked.
 */
declare function buttonSelectionMenu(options: {
    body?: string;
    buttons: [text: string, icon?: string][];
    style?: "1column" | "2columns";
}): Promise<{
    canceled: boolean;
    selection?: number;
}>;
/**
 * Validates the CSS or JSON in the CSS Editor text box.
 *
 * @returns {boolean} true if valid, false if invalid
 *
 * @deprecated Unused.
 */
declare function validateCssEditorTextBoxValue(): boolean;
/**
 * Puts the CSS Editor in style sheet selection mode.
 *
 * @deprecated The style sheet rules are undefined for some reason.
 */
declare function cssEditor_selectDocumentStyleSheet_activate(): void;
/**
 * Used when a style sheet is selected.
 *
 * @param {number} index
 *
 * @deprecated The style sheet rules are undefined for some reason.
 */
declare function cssEditor_selectDocumentStyleSheet_selected(index: number): Promise<void>;
/**
 * Saves the CSS Editor changes.
 */
declare function cssEditor_saveChanges(): Promise<void>;
/**
 * Sets the CSS Editor mode.
 *
 * @param {CSSEditorSelectedType} mode The mode to set the CSS Editor to.
 *
 * @throws {Error} Throws an error if the mode is not valid.
 */
declare function setCSSEditorMode(mode: CSSEditorSelectedType): void;
declare function cssEditor_rootElementStylesMode(): void;
declare function cssEditor_globalStyleElementStylesMode(): void;
/**
 * Sets the tab of the 8Crafter Utilities Main Menu.
 * @param {string} tab
 */
declare function setMainMenu8CrafterUtilitiesTab(tab: string): void;
declare function toggleSmallCornerDebugOverlay(): void;
declare function toggleStatsCornerDebugOverlay(): void;
declare function togglePerfGraphDebugOverlay(graph: "FPS" | "ELL" | "FCD"): void;
declare function toggleGeneralDebugOverlayElement(): void;
declare function toggleHTMLSourceCodePreviewElement(): void;
declare function toggleConsoleOverlay(): void;
interface ConsoleExecutionHistoryEntryJSON {
    code: string;
    time: number;
}
/**
 * Represents an entry in the console execution history.
 */
declare class ConsoleExecutionHistoryEntry implements ConsoleExecutionHistoryEntryJSON {
    /**
     * The code that was executed.
     *
     * @public
     *
     * @type {string}
     */
    code: string;
    /**
     * The time when the code was executed.
     *
     * @public
     *
     * @type {number}
     */
    time: number;
    /**
     * Creates a new ConsoleExecutionHistoryEntry instance.
     *
     * @constructor
     * @param {string} code The code that was executed.
     * @param {number} [time=Date.now()] The time when the code was executed. Defaults to the current time.
     * @returns The ConsoleExecutionHistoryEntry instance.
     *
     * @public
     */
    constructor(code: string, time?: number);
    /**
     * Returns the JSON representation of the ConsoleExecutionHistoryEntry instance.
     *
     * @returns The JSON representation of the ConsoleExecutionHistoryEntry instance.
     *
     * @public
     */
    toJSON(): ConsoleExecutionHistoryEntryJSON;
    /**
     * Creates a new ConsoleExecutionHistoryEntry instance from a JSON object.
     *
     * @param json The JSON object to create the ConsoleExecutionHistoryEntry instance from.
     * @returns The ConsoleExecutionHistoryEntry instance.
     *
     * @public
     * @static
     */
    static fromJSON(this: void, json: ConsoleExecutionHistoryEntryJSON): ConsoleExecutionHistoryEntry;
}
/**
 * Stores the history of executed console commands.
 *
 * @hideconstructor
 */
declare class ConsoleExecutionHistory {
    /**
     * The maximum number of entries to store in the history.
     *
     * @public
     * @static
     *
     * @default 100
     */
    static maxEntries: number;
    /**
     * The maximum length of an entry in the history.
     *
     * @public
     * @static
     *
     * @default 1000
     */
    static maxEntryLength: number;
    /**
     * The entries in the history, oldest first.
     *
     * @readonly
     *
     * @public
     * @static
     */
    static entries: ConsoleExecutionHistoryEntry[];
    /**
     * @constructor
     *
     * @throws {TypeError} Throws an error if the constructor is called.
     *
     * @private
     */
    constructor();
    /**
     * Gets the nth newest entry in the history.
     *
     * @param {number} n The index of the entry to retrieve.
     * @returns {ConsoleExecutionHistoryEntry | undefined} The nth newest entry in the history.
     *
     * @public
     * @static
     */
    static getNthNewestEntry(n: number): ConsoleExecutionHistoryEntry | undefined;
    /**
     * Adds a new entry to the history.
     *
     * @param {string} code The code that was executed.
     * @param {number} [time=Date.now()] The time when the code was executed. Defaults to the current time.
     * @returns {ConsoleExecutionHistoryEntry} The new entry that was added to the history.
     *
     * @public
     * @static
     */
    static addHistoryItem(code: string, time?: number): ConsoleExecutionHistoryEntry;
    /**
     * Clears the history.
     *
     * @public
     * @static
     */
    static clearHistory(): void;
    /**
     * Saves the history to local storage.
     *
     * @public
     * @static
     */
    static saveToLocalStorage(): void;
    /**
     * Loads the history from local storage.
     *
     * @public
     * @static
     */
    static loadFromLocalStorage(): void;
}
/**
 * Reads the keys of the {@link localStorage}.
 *
 * There is a bug with the Ore UI environment where localStorage.key() returns null for all indexes other than 0, so this works by removing keys one at a time
 * to read them and then restoring them.
 *
 * @returns {string[]} The keys of the {@link localStorage}.
 */
declare function readLocalStorageKeys(): string[];
/**
 * The index of the currently selected console execution history item.
 *
 * @type {number}
 *
 * @default -1
 */
declare var currentlySelctedConsoleExecutionHistoryItemIndex: number;
/**
 * The result of the last console overlay execution.
 *
 * @default undefined
 */
declare let lastConsoleOverlayResult: unknown;
/**
 * Executes the console input field contents.
 */
declare function consoleOverlayExecute(): void;
/**
 * The contents of the console input field before it was replaced with a history item.
 *
 * @default ""
 */
declare var savedConsoleInputFieldContents: string;
/**
 * Sets the contents of the console input field to the contents of the nth most recent history item.
 *
 * @param {number} index The index of the history item to set the input field to. It will be bound to be withing the range of the history items, or `-1`. If `-1`, the input field will be restored to what it was before replacing the input field with a history item.
 */
declare function setConsoleInputFieldContentsToHistoryItem(index: number): void;
/**
 * Shows a context menu.
 *
 * @param {ContextMenuCreationOptions} menu The menu to show.
 * @returns {void}
 */
declare function showContextMenu(menu: ContextMenuCreationOptions): void;
declare function quoteStringDynamic(str: string): string;
/**
 * Adds a context menu to a primitive value element at the top level of the console.
 *
 * @template {HTMLElement} T
 * @param {string | number | boolean | bigint | symbol | null | undefined} primitiveValue The primitive value to add a context menu to.
 * @param {T} primitiveValueElement The element to add a context menu to.
 * @param {{ copyConsoleMessageStackCallback?: (() => void) | undefined; copyConsoleMessageStackButtonEnabled?: boolean | undefined }} [options] Additional options for the context menu.
 * @returns {T} The element with a context menu added.
 */
declare function addContextMenuToTopLevelPrimitiveConsoleValue<T extends HTMLElement>(primitiveValue: string | number | boolean | bigint | symbol | null | undefined, primitiveValueElement: T, options?: {
    copyConsoleMessageStackCallback?: (() => Promise<void> | void) | undefined;
    copyConsoleMessageStackButtonEnabled?: boolean | undefined;
}): T;
declare function coherentArrayProxyToArrayReplacer(this: unknown, _key: string, value: unknown): unknown;
declare const propertyIdentifierRegex: RegExp;
/**
 * The last used ID for a temporary variable from the console.
 *
 * @default 0n
 */
declare var __console_last_temp_variable_id__: bigint;
/**
 * The last used ID for a console expansion arrow.
 *
 * @default 0n
 */
declare var consoleExpansionArrowID: bigint;
/**
 * Stringifies a symbol if it is not unique (eg. `Symbol.toStringTag` or `Symbol.for("foo")`).
 *
 * If the symbol is unique, it returns `undefined`.
 */
declare function stringifyNonUniqueSymbol(symbol: symbol): string | undefined;
/**
 * Creates a view for an expandable object for use in the console.
 *
 * @param obj The object to create a view for.
 * @param isRoot Whether the object is the root object. Defaults to `false`.
 * @param forceObjectMode Whether to force the value into object mode. Defaults to `false`.
 * @param options The options for creating the view.
 * @returns The view for the object.
 */
declare function createExpandableObjectView(obj: Record<PropertyKey, any>, isRoot?: boolean, forceObjectMode?: boolean, options?: {
    summaryValueOverride?: string | undefined;
    summaryValueOverride_toStringTag?: string | undefined;
    displayKey?: string | undefined;
    objectKeysSource?: Record<PropertyKey, any> | undefined;
    copyConsoleMessageStackCallback?: (() => Promise<void> | void) | undefined;
    copyConsoleMessageStackButtonEnabled?: boolean | undefined;
    showReadonly?: boolean | undefined;
    currentPath?: PropertyKey[] | undefined;
    currentDisplayedPath?: string[] | undefined;
    /**
     * @default
     * isRoot && typeof obj === "function"
     */
    includeViewableToString?: boolean | undefined;
    /**
     * @default !isRoot
     */
    hideSummaryValueWhenExpanded?: boolean | undefined;
    preSummaryHTML?: string | {
        collapsed?: string | undefined;
        expanded?: string | undefined;
    } | undefined;
}): HTMLDivElement;
/**
 *
 * @param {`temp${bigint}`} variableName
 */
declare function displayStoredConsoleTempVariable(variableName: `temp${bigint}`): void;
/**
 * The queue of messages to display in the console overlay once it is loaded.
 *
 * @type {ConsoleEverythingEntry[]}
 */
declare var consoleOverlayOnLoadMessageQueue: ConsoleEverythingEntry[];
/**
 * The callback called by the hook on the {@link console} methods.
 *
 * @param {ConsoleEverythingEntry} data The data of the message.
 *
 * @idea Make a system where it uses the click location to determine what text was right-clicked or long-pressed on to determine which context menu to show.
 */
declare function consoleOverlayConsoleLogCallback(data: ConsoleEverythingEntry): void;
declare const nonTextKeyCodes: readonly number[];
declare const types_KeyboardKey: {
    readonly 8: "BACKSPACE";
    readonly 9: "TAB";
    readonly 13: "ENTER";
    readonly 16: "SHIFT";
    readonly 17: "CTRL";
    readonly 18: "ALT";
    readonly 20: "CAPS_LOCK";
    readonly 27: "ESCAPE";
    readonly 32: "SPACE";
    readonly 33: "PG_UP";
    readonly 34: "PG_DOWN";
    readonly 35: "END";
    readonly 37: "LEFT";
    readonly 38: "UP";
    readonly 39: "RIGHT";
    readonly 40: "DOWN";
    readonly 45: "INSERT";
    readonly 46: "DELETE";
    readonly 48: "KEY_0";
    readonly 49: "KEY_1";
    readonly 50: "KEY_2";
    readonly 51: "KEY_3";
    readonly 52: "KEY_4";
    readonly 53: "KEY_5";
    readonly 54: "KEY_6";
    readonly 55: "KEY_7";
    readonly 56: "KEY_8";
    readonly 57: "KEY_9";
    readonly 59: "SEMICOLON";
    readonly 61: "EQUALS";
    readonly 65: "KEY_A";
    readonly 66: "KEY_B";
    readonly 67: "KEY_C";
    readonly 68: "KEY_D";
    readonly 69: "KEY_E";
    readonly 70: "KEY_F";
    readonly 71: "KEY_G";
    readonly 72: "KEY_H";
    readonly 73: "KEY_I";
    readonly 74: "KEY_J";
    readonly 75: "KEY_K";
    readonly 76: "KEY_L";
    readonly 77: "KEY_M";
    readonly 78: "KEY_N";
    readonly 79: "KEY_O";
    readonly 80: "KEY_P";
    readonly 81: "KEY_Q";
    readonly 82: "KEY_R";
    readonly 83: "KEY_S";
    readonly 84: "KEY_T";
    readonly 85: "KEY_U";
    readonly 86: "KEY_V";
    readonly 87: "KEY_W";
    readonly 88: "KEY_X";
    readonly 89: "KEY_Y";
    readonly 90: "KEY_Z";
    readonly 96: "NUMPAD_0";
    readonly 97: "NUMPAD_1";
    readonly 98: "NUMPAD_2";
    readonly 99: "NUMPAD_3";
    readonly 100: "NUMPAD_4";
    readonly 101: "NUMPAD_5";
    readonly 102: "NUMPAD_6";
    readonly 103: "NUMPAD_7";
    readonly 104: "NUMPAD_8";
    readonly 105: "NUMPAD_9";
    readonly 109: "MINUS";
    readonly 112: "F1";
    readonly 113: "F2";
    readonly 114: "F3";
    readonly 115: "F4";
    readonly 116: "F5";
    readonly 117: "F6";
    readonly 118: "F7";
    readonly 119: "F8";
    readonly 120: "F9";
    readonly 121: "F10";
    readonly 122: "F11";
    readonly 123: "F12";
    readonly 188: "COMMA";
    readonly 190: "PERIOD";
    readonly 191: "SLASH";
    readonly 192: "GRAVE";
    readonly 195: "MOUSE_MOVEMENT";
    readonly 196: "MOUSE_BUTTON_LEFT";
    readonly 197: "MOUSE_BUTTON_MIDDLE";
    readonly 198: "MOUSE_BUTTON_RIGHT";
    readonly 199: "MOUSE_WHEEL";
    readonly 201: "PSEUDO_KEY_1";
    readonly 202: "PSEUDO_KEY_2";
    readonly 203: "PSEUDO_KEY_3";
    readonly 204: "PSEUDO_KEY_4";
    readonly 205: "PSEUDO_KEY_5";
    readonly 206: "PSEUDO_KEY_6";
    readonly 207: "PSEUDO_KEY_7";
    readonly 208: "PSEUDO_KEY_8";
    readonly 209: "PSEUDO_KEY_9";
    readonly 210: "PSEUDO_KEY_10";
    readonly 219: "BRACKET_OPEN";
    readonly 220: "BACKSLASH";
    readonly 221: "BRACKET_CLOSE";
    readonly 222: "APOSTROPHE";
    readonly BACKSPACE: 8;
    readonly TAB: 9;
    readonly ENTER: 13;
    readonly SHIFT: 16;
    readonly CTRL: 17;
    readonly ALT: 18;
    readonly PAUSE: 19;
    readonly CAPS_LOCK: 20;
    readonly ESCAPE: 27;
    readonly SPACE: 32;
    readonly PG_UP: 33;
    readonly PG_DOWN: 34;
    readonly END: 35;
    readonly HOME: 36;
    readonly LEFT: 37;
    readonly UP: 38;
    readonly RIGHT: 39;
    readonly DOWN: 40;
    readonly INSERT: 45;
    readonly DELETE: 46;
    readonly KEY_0: 48;
    readonly KEY_1: 49;
    readonly KEY_2: 50;
    readonly KEY_3: 51;
    readonly KEY_4: 52;
    readonly KEY_5: 53;
    readonly KEY_6: 54;
    readonly KEY_7: 55;
    readonly KEY_8: 56;
    readonly KEY_9: 57;
    readonly KEY_A: 65;
    readonly KEY_B: 66;
    readonly KEY_C: 67;
    readonly KEY_D: 68;
    readonly KEY_E: 69;
    readonly KEY_F: 70;
    readonly KEY_G: 71;
    readonly KEY_H: 72;
    readonly KEY_I: 73;
    readonly KEY_J: 74;
    readonly KEY_K: 75;
    readonly KEY_L: 76;
    readonly KEY_M: 77;
    readonly KEY_N: 78;
    readonly KEY_O: 79;
    readonly KEY_P: 80;
    readonly KEY_Q: 81;
    readonly KEY_R: 82;
    readonly KEY_S: 83;
    readonly KEY_T: 84;
    readonly KEY_U: 85;
    readonly KEY_V: 86;
    readonly KEY_W: 87;
    readonly KEY_X: 88;
    readonly KEY_Y: 89;
    readonly KEY_Z: 90;
    readonly META_LFET: 91;
    readonly CONTEXT_MENU: 93;
    readonly NUMPAD_0: 96;
    readonly NUMPAD_1: 97;
    readonly NUMPAD_2: 98;
    readonly NUMPAD_3: 99;
    readonly NUMPAD_4: 100;
    readonly NUMPAD_5: 101;
    readonly NUMPAD_6: 102;
    readonly NUMPAD_7: 103;
    readonly NUMPAD_8: 104;
    readonly NUMPAD_9: 105;
    readonly NUMPAD_MULTIPLY: 106;
    readonly NUMPAD_PLUS: 107;
    readonly NUMPAD_MINUS: 109;
    readonly NUMPAD_PERIOD: 110;
    readonly NUMPAD_DIVIDE: 111;
    readonly F1: 112;
    readonly F2: 113;
    readonly F3: 114;
    readonly F4: 115;
    readonly F5: 116;
    readonly F6: 117;
    readonly F7: 118;
    readonly F8: 119;
    readonly F9: 120;
    readonly F10: 121;
    readonly F11: 122;
    readonly F12: 123;
    readonly F13: 124;
    readonly F14: 125;
    readonly F15: 126;
    readonly F16: 127;
    readonly F17: 128;
    readonly F18: 129;
    readonly F19: 130;
    readonly F20: 131;
    readonly F21: 132;
    readonly F22: 133;
    readonly F23: 134;
    readonly F24: 135;
    readonly NUM_LOCK: 144;
    readonly SCROLL_LOCK: 145;
    readonly SEMICOLON: 186;
    readonly EQUALS: 187;
    readonly COMMA: 188;
    readonly MINUS: 189;
    readonly PERIOD: 190;
    readonly SLASH: 191;
    readonly GRAVE: 192;
    readonly MOUSE_MOVEMENT: 195;
    readonly MOUSE_BUTTON_LEFT: 196;
    readonly MOUSE_BUTTON_MIDDLE: 197;
    readonly MOUSE_BUTTON_RIGHT: 198;
    readonly MOUSE_WHEEL: 199;
    readonly PSEUDO_KEY_1: 201;
    readonly PSEUDO_KEY_2: 202;
    readonly PSEUDO_KEY_3: 203;
    readonly PSEUDO_KEY_4: 204;
    readonly PSEUDO_KEY_5: 205;
    readonly PSEUDO_KEY_6: 206;
    readonly PSEUDO_KEY_7: 207;
    readonly PSEUDO_KEY_8: 208;
    readonly PSEUDO_KEY_9: 209;
    readonly PSEUDO_KEY_10: 210;
    readonly BRACKET_OPEN: 219;
    readonly BACKSLASH: 220;
    readonly BRACKET_CLOSE: 221;
    readonly APOSTROPHE: 222;
    readonly INTL_BACKSLASH: 226;
    readonly KANA_MODE: 246;
    readonly CR_SEL: 247;
    readonly EX_SEL: 248;
    readonly ERASE_EOF: 249;
};
/**
 * Creates a custom text box element.
 *
 * @param {HTMLElement} container - The container element to create the custom text box in.
 * @returns {HTMLDivElement | undefined} The created custom text box element, or `undefined` if the element could not be created.
 *
 * @todo This is a work in progress.
 */
declare function createCustomTextBox(container: HTMLElement): HTMLDivElement | undefined;
/**
 * Add a scrollbar to an HTML element.
 *
 * @param {Element} element The HTML element to add a scrollbar to.
 * @returns {boolean} True if the scrollbar was added successfully, false otherwise.
 */
declare function addScrollbarToHTMLElement(element: Element): boolean;
declare var litePlayScreenActive: boolean;
/**
 * Maps game mode IDs to their names.
 */
declare const GameModeIDMap: {
    [-1]: string;
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6: string;
    7: string;
    8: string;
    9: string;
};
/**
 * Takes an async callback function and wraps it in a wrapper to void the promise.
 *
 * @param callback The callback to wrap.
 * @returns The wrapped callback.
 */
declare function voidAsyncCallback(callback: () => Promise<void>): () => void;
/**
 * Enables the lite play screen.
 */
declare function enableLitePlayScreen(noReload?: boolean): Promise<void>;
declare function disableLitePlayScreen(): Promise<void>;
declare function litePlayScreen_friendsMenu(): Promise<void>;
/**
 * Sets whether the lite play screen is enabled.
 *
 * @param {boolean} value Whether to set the lite play screen to enabled or disabled.
 * @param {boolean} [noReload=false] Whether to not reload the page every time it is opened to unload the old contents.
 *
 * @throws {ReferenceError} If the external server world list is not available.
 */
declare function setLitePlayScreenEnabled(value: boolean, noReload?: boolean): void;
/**
 * Copies text to the clipboard.
 *
 * @param {string} text The text to copy to the clipboard.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the text was copied to the clipboard, `false` otherwise.
 *
 * @throws {ReferenceError} If the router facet is not available.
 *
 * @deprecated Use {@link copyTextToClipboard} or {@link copyTextToClipboardAsync} instead.
 */
declare function copyTextToClipboard_old(text: string): Promise<boolean>;
/**
 * Copies text to the clipboard.
 *
 * This will fail if the clipboard facet is no loaded. If you want to force load the clipboard facet, use the {@link copyTextToClipboardAsync} function.
 *
 * @param {string} text The text to copy to the clipboard.
 * @returns {boolean} `true` if the text was copied to the clipboard, `false` otherwise.
 */
declare function copyTextToClipboard(text: string): boolean;
/**
 * Copies text to the clipboard, and if necessary tries to force load the clipboard facet if it is not loaded.
 *
 * @param {string} text The text to copy to the clipboard.
 * @param {number} [timeout=100] The timeout in milliseconds to wait for the facet to load. If set to `0` or `Infinity`, it will never time out. Defaults to `100ms`.
 * @param {boolean} [allowErrorLogging=true] Whether to log errors that occur while force loading the facet to the console. Defaults to `true`.
 * @returns {Promise<[success: true, successType: "alreadyLoaded" | "forceLoaded"] | [sucess: false, error: Error, originalError?: unknown]>} A promise that resolves with a tuple with the first]\item being whether the text was copied to the clipboard, and the second item being whether it was force loaded or already loaded if it was successful or the error that occured if it wasn't, and a third item being the original error if the failure happened while force loading the facet.
 */
declare function copyTextToClipboardAsync(text: string, timeout?: number, allowErrorLogging?: boolean): Promise<[success: true, successType: "alreadyLoaded" | "forceLoaded"] | [sucess: false, error: Error, originalError?: unknown]>;
declare var framesSinceLastSecond: number;
declare var currentFrameTimeHistory: number[];
declare var currentFPS: number;
declare const __OUIC_customOverlays_initSyncEndPerf__: number;
declare const __OUIC_customOverlays_initSyncEndMs__: number;
