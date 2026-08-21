/// <reference path="./JSONB.ts" preserve="true" />
/// <reference path="./types.d.ts" preserve="true" />
/// <reference path="./oreUICustomizer8CrafterConfig.d.ts" preserve="true" />
/// <reference path="./class_path.ts" preserve="true" />
/// <reference path="./shiki.bundle.d.ts" preserve="true" />

const __OUIC_customOverlays_initStartPerf__: number = performance.now();
const __OUIC_customOverlays_initStartMs__: number = Date.now();

// Hooks onto console data.
if (console.everything === undefined!) {
    console.everything = [];
    // Assign the function to a constant to keep it scoped.
    const TS = function TS(date: Date, performanceStamp?: number): string {
        const timezoneOffset: number = date.getTimezoneOffset();
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${date
            .getHours()
            .toString()
            .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}.${date
            .getMilliseconds()
            .toString()
            .padStart(3, "0")}${performanceStamp === undefined ? "" : ` P${performanceStamp.toFixed(4).replace(/(?<=^[+-]?)\d+(?=\d\.)/, "")}`} UTC${
            timezoneOffset < 0 || Object.is(timezoneOffset, -0) ? "+" : "-"
        }${Math.floor(Math.abs(timezoneOffset) / 60).toString()}${
            timezoneOffset % 60 !== 0 ? `:${(Math.abs(timezoneOffset) % 60).toString().padStart(2, "0")}` : ""
        }`;
        // return new Date().toLocaleString("sv", ...([{ timeZone: "UTC" }] as unknown as [])) + "Z";
    };
    window.onerror = function __OUIC_handler_onerror__(
        event: string | ErrorEvent | Event,
        source?: string,
        lineno?: number,
        colno?: number,
        error?: Error
    ): boolean {
        // This callback is from 8Crafter's Ore UI Customizer, and is used to log uncaught errors to the customizer's console.
        const performanceStamp: number = performance.now();
        const msStamp: number = Date.now();
        const date: Date = new Date(msStamp);
        /**
         * @type {ErrorEvent}
         */
        let newEvent: ErrorEvent;
        if (typeof event === "string") {
            newEvent = new ErrorEvent("error", { error, message: event, filename: source!, lineno: lineno!, colno: colno! });
        } else if (!(event instanceof ErrorEvent)) {
            console.warn("window.onerror had an event that was not an instance of ErrorEvent or a string. Arguments: ", arguments);
            return false;
        } else {
            newEvent = event;
        }
        /**
         * @type {Extract<ConsoleEverythingEntry, { type: "exception" }>}
         */
        const data: Extract<ConsoleEverythingEntry, { type: "exception" }> = {
            type: "exception",
            timeStamp: TS(date, performanceStamp),
            performanceStamp,
            value: newEvent,
            stack: new Error().stack?.split("\n").slice(1).join("\n"),
        };
        console.everything.push(data);
        (globalThis.onConsoleLogCallbacks ?? []).forEach((f: ConsoleLogCallback): void => {
            f(data);
        });
        return false;
    };
    window.onunhandledrejection = function __OUIC_handler_onunhandledrejection__(e: PromiseRejectionEvent): void {
        // This callback is from 8Crafter's Ore UI Customizer, and is used to log unhandled promise rejections to the customizer's console.
        const performanceStamp: number = performance.now();
        const msStamp: number = Date.now();
        const date: Date = new Date(msStamp);
        /**
         * @type {Extract<ConsoleEverythingEntry, { type: "promiseRejection" }>}
         */
        const data: Extract<ConsoleEverythingEntry, { type: "promiseRejection" }> = {
            type: "promiseRejection",
            timeStamp: TS(date, performanceStamp),
            performanceStamp,
            value: e,
            stack: new Error().stack?.split("\n").slice(1).join("\n"),
        };
        console.everything.push(data);
        (globalThis.onConsoleLogCallbacks ?? []).forEach((f: ConsoleLogCallback): void => {
            f(data);
        });
    };

    /**
     * Hooks onto a {@link console} method.
     *
     * @param {LogType} logType
     * @returns
     */
    // Assign the function to a constant to keep it scoped.
    const hookLogType = function hookLogType(logType: LogType): (...args: unknown[]) => void {
        const original = console[logType].bind(console);
        return {
            [logType](): void {
                // This console method is being intercepted by 8Crafter's Ore UI Customizer to allow logs to be shown in the customizer's console.
                const performanceStamp: number = performance.now();
                const msStamp: number = Date.now();
                const date: Date = new Date(msStamp);
                /**
                 * @type {Extract<ConsoleEverythingEntry, { type: LogType }>}
                 */
                const data: Extract<ConsoleEverythingEntry, { type: LogType }> = {
                    type: logType,
                    timeStamp: TS(date, performanceStamp),
                    performanceStamp,
                    value: Array.from(arguments),
                    stack: new Error().stack?.split("\n").slice(1).join("\n"),
                };
                console.everything.push(data);
                //@ts-ignore
                original.apply(console, arguments);
                (globalThis.onConsoleLogCallbacks ?? []).forEach((f: ConsoleLogCallback): void => {
                    f(data);
                });
            },
        }[logType]!;
    };

    /**
     * @type {LogType[]}
     */
    const logTypes: LogType[] = ["log", "info", "error", "warn", "debug"];

    logTypes.forEach((logType: LogType): void => {
        console[logType] = hookLogType(logType);
    });

    console._logInternal = function _logInternal(..._args: unknown[]): void {
        // This console method is for logging internal messages that only show up in the Ore UI Customizer's console and not the DevTools console.
        const performanceStamp: number = performance.now();
        const msStamp: number = Date.now();
        const date: Date = new Date(msStamp);
        const data = {
            type: "internal",
            timeStamp: TS(date, performanceStamp),
            performanceStamp,
            value: Array.from(arguments),
            stack: new Error().stack?.split("\n").slice(1).join("\n"),
        } as const;
        console.everything.push(data);
        (globalThis.onConsoleLogCallbacks ?? []).forEach((f: ConsoleLogCallback): void => {
            f(data);
        });
    };
}

/**
 * IPs and ports of servers to fetch the MOTD in order to fetch certain data.
 *
 * @todo Implement usage of this.
 */
const MOTDAPIFetchSources = {
    latestVersion: ["motd.api.ouic.8crafter.com", 19800],
    updateInfo: ["motd.api.ouic.8crafter.com", 19801],
} as const satisfies Record<string, [address: string, port: number]>;

/**
 * @decorator
 * @param value Whether the property should be writable or not.
 */
function writable(value: boolean): MethodDecorator & PropertyDecorator & ParameterDecorator {
    return function setWritableDecorator(...args: Parameters<MethodDecorator | PropertyDecorator | ParameterDecorator>): void {
        if (typeof args[2] === "object") {
            args[2].writable = value;
            return;
        }
        if (args[1] === undefined) return;
        Object.defineProperty(args[0], args[1], { writable: value });
    } as MethodDecorator & PropertyDecorator & ParameterDecorator;
}
/**
 * @decorator
 * @param value Whether the property should be enumerable or not.
 */
function enumerable(value: boolean): MethodDecorator & PropertyDecorator & ParameterDecorator {
    return function setEnumerableDecorator(...args: Parameters<MethodDecorator | PropertyDecorator | ParameterDecorator>): void {
        if (typeof args[2] === "object") {
            args[2].enumerable = value;
            return;
        }
        if (args[1] === undefined) return;
        Object.defineProperty(args[0], args[1], { enumerable: value });
    } as MethodDecorator & PropertyDecorator & ParameterDecorator;
}
/**
 * @decorator
 * @param value Whether the property should be configurable or not.
 */
function configurable(value: boolean): MethodDecorator & PropertyDecorator & ParameterDecorator {
    return function setConfigurableDecorator(...args: Parameters<MethodDecorator | PropertyDecorator | ParameterDecorator>): void {
        if (typeof args[2] === "object") {
            args[2].configurable = value;
            return;
        }
        if (args[1] === undefined) return;
        Object.defineProperty(args[0], args[1], { configurable: value });
    } as MethodDecorator & PropertyDecorator & ParameterDecorator;
}

// Initialize shiki.
globalThis.shiki ??= undefined!;
const shikiLoadedPromise = import("./shiki.bundle.js");
// Initialize Ore UI Types.
var oreUIEnums: typeof import("@ore-ui-types/enums") | undefined;
const oreUIEnumsLoadedPromise = import("@ore-ui-types/enums").then((v): void => void (oreUIEnums = v));

interface Console {
    everything: ConsoleEverythingEntry[];
    /**
     * Logs an internal message that only shows up in the Ore UI Customizer's console and not the DevTools console.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is necessary.
    _logInternal(...args: any[]): void;
}

type LogType = "log" | "info" | "error" | "warn" | "debug";

type ConsoleEverythingEntry =
    | {
          type: "log" | "info" | "error" | "warn" | "debug";
          timeStamp: string;
          performanceStamp?: number | undefined;
          value: unknown[];
          stack?: string | undefined;
      }
    | { type: "internal"; timeStamp: string; performanceStamp?: number | undefined; value: unknown[]; stack?: string | undefined }
    | {
          type: "exception";
          timeStamp: string;
          performanceStamp?: number | undefined;
          value: ErrorEvent;
          stack?: string | undefined;
      }
    | { type: "promiseRejection"; timeStamp: string; performanceStamp?: number | undefined; value: PromiseRejectionEvent; stack?: string | undefined };

type ConsoleLogCallback = (data: ConsoleEverythingEntry) => void;

interface ContextMenuCreationOptions {
    x: number;
    y: number;
    width?: number | undefined;
    height?: number | undefined;
    items: ContextMenuItemCreationOptions[];
}

type ContextMenuItemCreationOptions =
    | {
          type?: "action" | undefined;
          title?: string | undefined;
          label: string;
          action(): Promise<void> | void;
          disabled?: boolean | undefined;
      }
    | {
          type: "separator";
      }
    | {
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
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents -- This is for consistency.
    __DEBUG_copyTextToClipboard_old_GLOBALS_copyError__?: unknown | undefined;
    [key: `temp${bigint}`]: unknown;
}

// IDEA: Make a modified version of the TypeScript ESLint `no-redundant-type-constituents` rule to allow for unknown in unions.
// IDEA: Make a modified version of the TypeScript ESLint `no-duplicate-type-constituents` rule to allow for undefined in unions.

// Hook onto Promise states.
// const originalPromiseConstructor: PromiseConstructor = Promise.prototype.constructor as PromiseConstructor;
// Object.defineProperties(Promise.prototype, {
//     constructor: {
//         value: function Promise(executor: (resolve: (value: unknown) => void, reject: (reason?: any) => void) => void): void {
//             // Modified to include Promise states.
//             const promise = this.originalPromiseConstructor(...(Array.from(arguments) as [executor: typeof executor]));
//             Object.defineProperty(this, "state", { value: "panding", writable: false, enumerable: false, configurable: true });
//             promise.then(
//                 () => Object.defineProperty(this, "state", { value: "fulfilled", writable: false, enumerable: false, configurable: true }),
//                 () => Object.defineProperty(this, "state", { value: "rejected", writable: false, enumerable: false, configurable: true })
//             );
//             console.log(this, promise);
//         },
//         writable: true,
//         enumerable: false,
//         configurable: true,
//     },
//     originalConstructor: {
//         value: originalPromiseConstructor,
//         writable: false,
//         enumerable: false,
//         configurable: true,
//     },
//     state: {
//         value: "unknown",
//         writable: false,
//         enumerable: false,
//         configurable: true,
//     },
// });
// const OriginalPromise = Promise;

// const PromiseStateSymbol = Symbol("Promise state");

// const PromiseB = new Proxy(OriginalPromise, {
//     construct(target, args, newTarget) {
//         // Create the real promise
//         const p = Reflect.construct(target, args, newTarget);

//         Object.defineProperty(p, PromiseStateSymbol, {
//             value: "pending",
//             writable: true,
//             configurable: true,
//         });

//         p.then(
//             () => (p[PromiseStateSymbol] = "fulfilled"),
//             () => (p[PromiseStateSymbol] = "rejected")
//         );

//         // console.log("Promise created:", p);

//         return p;
//     },

//     apply(target, thisArg, args) {
//         // Support calling Promise(...) without new
//         return Reflect.construct(target, args);
//     },
// });

// // Replace global Promise
// window.Promise = PromiseB;

async function fetchURIText(uri: string, suppresConsoleLogs = false): Promise<string | null> {
    try {
        new URL(uri);
    } catch (error) {
        if (error instanceof TypeError && error.message === "TypeError: Failed to construct 'URL': Invalid URL") {
            throw new TypeError(`Invalid URI: ${uri}`);
        }
    }

    const xhr = new XMLHttpRequest();

    return await new Promise((resolve, _reject) => {
        xhr.onload = function onload(this: XMLHttpRequest, _ev: ProgressEvent): void {
            if (this.status < 100 || this.status >= 400) {
                // eslint-disable-next-line ore-ui/no-bugged -- This is for browser compatibility.
                if (!suppresConsoleLogs) console.error("fetchURI request failed:", this.status, this.statusText, uri, this);
                resolve(null);
            }
            resolve(this.responseText);
        };
        xhr.onabort = function onabort(this: XMLHttpRequest, ev: ProgressEvent): void {
            // eslint-disable-next-line ore-ui/no-bugged -- This is for browser compatibility.
            if (!suppresConsoleLogs) console.error("fetchURI request aborted:", this.status, this.statusText, ev, uri, this);
            resolve(null);
        };
        xhr.onerror = function onerror(this: XMLHttpRequest, ev: ProgressEvent): void {
            // eslint-disable-next-line ore-ui/no-bugged -- This is for browser compatibility.
            if (!suppresConsoleLogs) console.error("fetchURI request errored:", this.status, this.statusText, ev, uri, this);
            resolve(null);
        };
        xhr.ontimeout = function ontimeout(this: XMLHttpRequest, ev: ProgressEvent): void {
            // eslint-disable-next-line ore-ui/no-bugged -- This is for browser compatibility.
            if (!suppresConsoleLogs) console.error("fetchURI request timed out:", this.status, this.statusText, ev, uri, this);
            resolve(null);
        };

        try {
            xhr.open("GET", uri, true);
            xhr.send(null);
        } catch (err) {
            // eslint-disable-next-line ore-ui/no-bugged -- This is for browser compatibility.
            if (!suppresConsoleLogs) console.error("fetchURI request failed with error:", err, xhr.status, xhr.statusText, uri, xhr);
            resolve(null);
        }
    });
}

/**
 * Cached source maps.
 *
 * @internal
 */
const cachedSourceMaps: {
    /**
     * Maps the URI of a JS file to the URI of its source map file, or `null` if it does not have one.
     */
    readonly uris: { [fileURI: string]: string | null };
    /**
     * Maps the URI of a source map file to its contents.
     */
    readonly maps: { [sourceMapURI: string]: SourceMap | null };
} = {
    uris: {},
    maps: {},
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

function getSourceLocationFromSourceMap(fileURI: string, line: number, column: number, sourceMap: SourceMap): SourceMapSourceLocation | undefined;
function getSourceLocationFromSourceMap(line: number, column: number, sourceMap: SourceMap): Omit<SourceMapSourceLocation, "fileURI"> | undefined;
function getSourceLocationFromSourceMap(
    ...args: [fileURI: string, line: number, column: number, sourceMap: SourceMap] | [line: number, column: number, sourceMap: SourceMap]
): SourceMapSourceLocation | Omit<SourceMapSourceLocation, "fileURI"> | undefined {
    const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const BASE64_MAP: Record<string, number> = {};
    for (let i = 0; i < BASE64_CHARS.length; i++) {
        BASE64_MAP[BASE64_CHARS[i]!] = i;
    }

    interface IndexRef {
        index: number;
    }
    interface MappingSegment {
        generatedColumn: number;
        source?: number;
        originalLine?: number;
        originalColumn?: number;
        name?: number;
    }

    function decodeVLQ(str: string, indexRef: IndexRef): number {
        let result = 0;
        let shift = 0;
        let continuation: boolean, digit: number | undefined;

        do {
            if (indexRef.index >= str.length) throw new Error("Unexpected end of VLQ string");
            digit = BASE64_MAP[str.charAt(indexRef.index++)];
            if (digit === undefined) throw new Error(`Invalid base64 digit: ${str.charAt(indexRef.index - 1)}`);

            continuation = !!(digit & 32);
            digit &= 31;
            result += digit << shift;
            shift += 5;
        } while (continuation);

        const shouldNegate: number = result & 1;
        result >>= 1;
        return shouldNegate ? -result : result;
    }

    function parseMappings(mappings: string): MappingSegment[][] {
        const lines: string[] = mappings.split(";");
        // let generatedLine: number = 0;
        let previousGeneratedColumn = 0;
        let previousSource = 0;
        let previousOriginalLine = 0;
        let previousOriginalColumn = 0;
        let previousName = 0;

        const parsed: MappingSegment[][] = [];

        for (const line of lines) {
            const segments: string[] = line.split(",");
            const lineMappings: MappingSegment[] = [];
            previousGeneratedColumn = 0;

            for (const seg of segments) {
                if (!seg) continue;
                const indexRef = { index: 0 };
                const segment: MappingSegment = {
                    generatedColumn: (previousGeneratedColumn += decodeVLQ(seg, indexRef)),
                };

                if (indexRef.index < seg.length) {
                    segment.source = previousSource += decodeVLQ(seg, indexRef);
                    segment.originalLine = previousOriginalLine += decodeVLQ(seg, indexRef);
                    segment.originalColumn = previousOriginalColumn += decodeVLQ(seg, indexRef);

                    if (indexRef.index < seg.length) {
                        segment.name = previousName += decodeVLQ(seg, indexRef);
                    }
                }
                lineMappings.push(segment);
            }
            parsed.push(lineMappings);
        }
        return parsed;
    }

    function findOriginalPosition(
        parsedMappings: MappingSegment[][],
        sources: string[],
        jsLine: number,
        jsColumn: number
    ): { source: string; line: number; column: number } | null {
        const lineMappings: MappingSegment[] | undefined = parsedMappings[jsLine - 1];
        if (!lineMappings) return null;

        let candidate: MappingSegment | null = null;
        for (const seg of lineMappings) {
            if (seg.generatedColumn <= jsColumn) {
                candidate = seg;
            } else {
                break;
            }
        }

        if (candidate?.source === undefined) return null;

        return {
            source: sources[candidate.source]!,
            line: candidate.originalLine! + 1,
            column: candidate.originalColumn!,
        };
    }

    const [fileURI, line, column, sourceMap] = args.length === 4 ? args : [undefined, args[0], args[1], args[2]];

    const parsedMappings: MappingSegment[][] = parseMappings(sourceMap.mappings);

    const originalPos = findOriginalPosition(parsedMappings, sourceMap.sources, line, column) ?? undefined;

    if (fileURI!) {
        return originalPos && { ...originalPos, fileURI };
    }
    return originalPos && originalPos;
}

async function getSourceLocationFromJSLocation(fileURI: string, line: number, column: number): Promise<SourceMapSourceLocation | undefined> {
    if (fileURI === "<anonymous>") return;
    try {
        new URL(fileURI);
    } catch {
        return;
    }
    let sourceMapURI: string | null;
    if (cachedSourceMaps.uris[fileURI] !== undefined) {
        sourceMapURI = cachedSourceMaps.uris[fileURI];
    } else {
        sourceMapURI = (await fetchURIText(fileURI, true))?.match(/^\/\/# sourceMappingURL=(.*)$/m)?.[1] ?? null;
    }
    if (sourceMapURI === null) {
        if (cachedSourceMaps.uris[fileURI] === undefined) cachedSourceMaps.uris[fileURI] = null;
        return;
    }
    if (cachedSourceMaps.maps[sourceMapURI] !== undefined) {
        return getSourceLocationFromSourceMap(fileURI, line, column, cachedSourceMaps.maps[sourceMapURI]!);
    }
    const sourceMap: string | null = await fetchURIText(sourceMapURI, true);
    if (sourceMap !== null) {
        if (cachedSourceMaps.maps[sourceMapURI] === null) return;
        cachedSourceMaps.maps[sourceMapURI] ??= JSON.parse(sourceMap) as SourceMap;
        return getSourceLocationFromSourceMap(fileURI, line, column, cachedSourceMaps.maps[sourceMapURI]!);
    }
    cachedSourceMaps.uris[fileURI] ??= null;
    return;
}

/**
 * Extracts JS file references of the form:
 *   something.js:LINE:COLUMN
 * Works with ANY URI protocol.
 */
const STACK_JS_REGEX = /((?:\S(?<!\())+?\.js):(\d+):(\d+)/g;

/**
 * Maps a stack trace to include TS equivalents.
 *
 * @param stack The original stack trace string.
 * @param showLoadingPlaceholders Whether to show "(Loading...)" for uncached maps. Defaults to `true`.
 */
function mapStackWithTS(
    stack: string,
    showLoadingPlaceholders = true
): { stack: string; hasUnloadedStacks: false } | { stack: string; hasUnloadedStacks: true; fullyLoadedStack: Promise<string> } {
    let hasUnloaded = false;

    const pendingReplacements: Promise<{ original: string; replacement: string }>[] = [];
    const rewritten: string = stack.replace(STACK_JS_REGEX, (match: string, jsFile: string, lineStr: string, colStr: string): string => {
        const line = Number(lineStr);
        const column = Number(colStr);

        if (cachedSourceMaps.uris[jsFile] === null) {
            return match;
        }

        if (cachedSourceMaps.uris[jsFile] !== undefined && cachedSourceMaps.maps[cachedSourceMaps.uris[jsFile]] !== undefined) {
            const sourceMapURI: string = cachedSourceMaps.uris[jsFile];
            const sourceMap = cachedSourceMaps.maps[sourceMapURI]!;
            const loc: SourceMapSourceLocation | undefined = getSourceLocationFromSourceMap(jsFile, line, column, sourceMap);

            if (!loc) return match;

            const tsUrl: string = jsFile.replace(/[^/]+\.js$/, loc.source.split("/").pop()!);
            return `${match} (${tsUrl}:${loc.line}:${loc.column})`;
        }

        hasUnloaded = true;

        const placeholder: string = showLoadingPlaceholders ? `${match} (Loading...)` : match;

        const promise = (async (): Promise<{ original: string; replacement: string }> => {
            const loc: SourceMapSourceLocation | undefined = await getSourceLocationFromJSLocation(jsFile, line, column);
            if (!loc) {
                return { original: placeholder, replacement: match };
            }

            const tsUrl: string = jsFile.replace(/[^/]+\.js$/, loc.source.split("/").pop()!);
            return {
                original: placeholder,
                replacement: `${match} (${tsUrl}:${loc.line}:${loc.column})`,
            };
        })();

        pendingReplacements.push(promise);

        return placeholder;
    });

    if (!hasUnloaded) {
        return { stack: rewritten, hasUnloadedStacks: false };
    }

    const fullyLoadedStack = (async (): Promise<string> => {
        let finalStack = rewritten;

        const results = await Promise.all(pendingReplacements);
        for (const { original, replacement } of results) {
            finalStack = finalStack.replace(original, replacement);
        }

        return finalStack;
    })();

    return {
        stack: rewritten,
        hasUnloadedStacks: true,
        fullyLoadedStack,
    };
}

const facetList: FacetList[number][] = [
    "core.animation",
    "core.customScaling",
    "core.deviceInformation",
    "core.featureFlags",
    "core.input",
    "core.locale",
    "core.performanceFacet",
    "core.router",
    "core.safeZone",
    "core.screenReader",
    "core.splitScreen",
    "core.social",
    "core.sound",
    "core.user",
    "core.vrMode", // Found in dev build file.

    "vanilla.achievements",
    "vanilla.achievementsReward",
    "vanilla.buildSettings",
    "vanilla.clipboard",
    "vanilla.createNewWorld",
    "vanilla.createPreviewRealmFacet",
    "vanilla.debugSettings",
    "vanilla.editor",
    "vanilla.editorInput",
    "vanilla.editorScripting",
    "vanilla.editorSelectionFacet",
    "vanilla.editorSettings",
    "vanilla.externalServerWorldList",
    "vanilla.followersList",
    "vanilla.friendsListFacet",
    "vanilla.friendsManagerFacet",
    "vanilla.gameplay.activeLevelHardcoreMode",
    "vanilla.gameplay.bedtime",
    "vanilla.gameplay.closeContainerCommand",
    "vanilla.gameplay.containerBlockActorType",
    "vanilla.gameplay.containerItemQuery",
    "vanilla.gameplay.containerSizeQuery",
    "vanilla.gameplay.furnace",
    "vanilla.gameplay.immediateRespawn",
    "vanilla.gameplay.leaveGame",
    "vanilla.gameplay.playerDeathInfo",
    "vanilla.gameplay.playerPositionHudElement",
    "vanilla.gameplay.playerRespawn",
    "vanilla.gamertagSearch",
    "vanilla.inbox",
    "vanilla.lanWorldList",
    "vanilla.localWorldList",
    "vanilla.marketplaceSuggestions",
    "vanilla.marketplacePassWorldTemplateList",
    "vanilla.networkWorldDetails",
    "vanilla.networkWorldJoiner",
    "vanilla.notificationOptions",
    "vanilla.notifications",
    "vanilla.options",
    "vanilla.party", // Found in dev build file.
    "vanilla.playerAchievements",
    "vanilla.playerBanned",
    "vanilla.playerFollowingList",
    "vanilla.playerLinkedPlatformProfile", // Found in dev build file.
    "vanilla.playermessagingservice",
    "vanilla.playerPermissions",
    "vanilla.playerProfile",
    "vanilla.playerReport",
    "vanilla.playerSocialManager",
    "vanilla.playerStatistics",
    "vanilla.privacyAndOnlineSafetyFacet",
    "vanilla.profanityFilter",
    "vanilla.realmsListFacet",
    "vanilla.realmSlots",
    "vanilla.realmsMembership",
    "vanilla.realmsStories.actions",
    "vanilla.realmsStories.localScreenshots",
    "vanilla.realmsStories.persistentData",
    "vanilla.realmsStories.players",
    "vanilla.realmsStories.realmData",
    "vanilla.realmsStories.settings",
    "vanilla.realmsStories.stories",
    "vanilla.RealmsPDPFacet",
    "vanilla.RealmWorldUploaderFacet",
    "vanilla.recentlyPlayedWithList",
    "vanilla.recommendedFriendsList",
    "vanilla.resourcePackOverrides",
    "vanilla.resourcePacks",
    "vanilla.screenshotGalleryList",
    "vanilla.screenSpecificOptions",
    "vanilla.screenTechStack",
    "vanilla.seedTemplates",
    "vanilla.share",
    "vanilla.simulationDistanceOptions",
    "vanilla.telemetry",
    "vanilla.thirdPartyWorldList",
    "vanilla.unpairedRealmsListFacet",
    "vanilla.userAccount",
    "vanilla.webBrowserFacet",
    "vanilla.worldCloudSyncFacet",
    "vanilla.worldEditor",
    "vanilla.worldOperations",
    "vanilla.worldPackages",
    "vanilla.worldPlayersList",
    "vanilla.worldStartup",
    "vanilla.worldTemplateList",
    "vanilla.worldTransfer",

    "vanilla.friendworldlist",
    "vanilla.offerRepository",
    "vanilla.realmsSettingsFacet",

    "vanilla.achievementCategories",
    "vanilla.blockInformation",
    "debug.worldTransfer",
    "vanilla.flatWorldPresets",
    "vanilla.inGame",
    "vanilla.playerPrivacy",
    "vanilla.realmsPurchase",
    "vanilla.realmsSubscriptionsData",
    "vanilla.realmsSubscriptionsMethods",
    "vanilla.realmsWorldContextCommands",
    "vanilla.realmsWorldContextQueries",
    "vanilla.realmsStories.sessions",
    "vanilla.realmsListActionsFacet",
    "vanilla.developerOptionsFacet",
    "vanilla.realmsStories.comments",
    "vanilla.screenshotGallery",
    "vanilla.playerShowcasedGallery",
    "vanilla.trialMode",
    "vanilla.featuredWorldTemplateList",
    "vanilla.ownedWorldTemplateList",
    "vanilla.worldTemplateOperations",
    "test.vector",
    "vanilla.gameplay.localPlayerWeatherLightningFacet",
    "vanilla.levelInfo",
    "vanilla.currentParty",
    "vanilla.partyCommands",
    "vanilla.worldRealmEditor", // Found in dev build file.
    "vanilla.worldRealmEditorCommands",
    "vanilla.worldRealmEditorQueries",
    "vanilla.realmBackupsCommands",
    "vanilla.realmBackupsQueries",
    "vanilla.realmsPurchaseCommands",
    "vanilla.realmsPurchaseReconcilerQueries",
    "vanilla.character-selector",
    "vanilla.progressTracker",

    // Found in preview 1.21.100.21.
    "vanilla.realmsWorldEditorGameRulesCommands",
    "vanilla.realmsWorldEditorGameRulesQueries",
    "vanilla.realmsWorldEditorWorldDetailsQueries",
    "vanilla.realmsCommitCommandsFacet",
    "vanilla.realmsCommitQueriesFacet",
    "vanilla.realmsPurchaseQueries",

    // Found in 1.21.120.4 (but may have existed before that).
    "vanilla.connectionErrorInfoFacet",
    "vanilla.partyReceivedInviteList",
    "vanilla.joinablePartyList",
    "vanilla.realmsFeatureFlags",
    "vanilla.realmsStories.reports",
    "vanilla.realmsStories.reportCommands",
    "vanilla.openAndCloseRealmCommandsFacet",
    "dev.realmsCommitCommandsFacet",
    "dev.realmsCommitQueriesFacet",
    "vanilla.newPlayerChoices",

    // Found in 1.21.130.26 Preview (but may have existed before that).
    "vanilla.realmsRolesAndPermissionsQueries",
    "vanilla.realmsRolesAndPermissionsCommands",
    "vanilla.realmsPlayerListQueries",
    "vanilla.realmsPlayerListCommands",

    // Found in 1.26.0.26 preview (but may have existed before that).
    "vanilla.realmsWorldEditorWorldDetailsCommands",
    "vanilla.realmsWorldPackEditorQueries",
    "vanilla.realmsWorldPackEditorCommands",

    // Found in 1.26.0.2 Release (it is unknown what preview these were added in).
    "vanilla.realmsRegionSettingsCommands",
    "vanilla.realmsRegionSettingsQueries",

    // Editor mode only facets (crashes the game when not in editor mode).
    ...(location.pathname === "/hbui/editor.html" ?
        ([
            "vanilla.editorLogging", // Crashes the game in the v1.21.110.23 preview when not in editor mode.
            "vanilla.editorBlockPalette", // Crashes the game when not in editor mode
            "vanilla.editorInputBinding", // Crashes the game when not in editor mode
            "vanilla.editorInputState", // Crashes the game when not in editor mode
            "vanilla.editorProjectConstants", // Crashes the game when not in editor mode
            "vanilla.editorStructure", // Crashes the game when not in editor mode
            "vanilla.editorTutorial", // Crashes the game when not in editor mode
        ] as const)
    :   []),
];

//#region Facet Spy Failure Fallback Injections
globalThis.forceLoadFacet ??= async function forceLoadFacet<FacetType extends LooseAutocomplete<FacetList[number]>>(
    facetName: FacetType,
    timeout = 5000,
    ignoreAlreadyLoadedData = false
): Promise<FacetType extends FacetList[number] ? FacetTypeMap[FacetType] : unknown> {
    return await new Promise((resolve, reject) => {
        const currentFacetData = FacetManager.facetData[facetName];
        if (!ignoreAlreadyLoadedData && facetName in FacetManager.facetData) {
            resolve(currentFacetData as FacetType extends FacetList[number] ? FacetTypeMap[FacetType] : unknown);
            return;
        }
        let facetStatus: "unloaded" | "loaded" | "failed" = "unloaded";
        const callback = (value: unknown): void => {
            try {
                // globalThis.forceLoadedFacets[facetName as FacetList[number]] = true;
                if (!FacetManager.forceLoadedFacets.includes(facetName)) FacetManager.forceLoadedFacets.push(facetName);
                // const targetFacetA: SharedFacetBase<string> | undefined = globalThis.facetSpyData?.sharedFacets?.[facetName as FacetList[number]] as
                //     | SharedFacetBase<string>
                //     | undefined;
                // const targetFacetB: SharedFacetBase<string> | undefined = globalThis.accessedFacets?.[facetName as string]?.();
                // if (!targetFacetA && !targetFacetB) {
                //     throw new ReferenceError(
                //         `No target facet matching the facet's name could be found in facetSpyData.sharedFacets or accessedFacets for facet: ${facetName}`
                //     );
                // }
                // targetFacetA?.set(value);
                // targetFacetB?.set(value);
                engine.off(`facet:updated:${facetName as string}`, callback);
                engine.off(`facet:error:${facetName as string}`, failureCallback);
                facetStatus = "loaded";
                resolve(value as FacetType extends FacetList[number] ? FacetTypeMap[FacetType] : unknown);
            } catch (e) {
                facetStatus = "failed";
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject(e);
            }
        };
        const failureCallback = (e: FacetErrorCode): void => {
            try {
                engine.off(`facet:updated:${facetName as string}`, callback);
                engine.off(`facet:error:${facetName as string}`, failureCallback);
                facetStatus = "failed";
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject(e);
            } catch (e) {
                facetStatus = "failed";
                // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
                reject(e);
            }
        };
        engine.on(`facet:updated:${facetName as string}`, callback);
        engine.on(`facet:error:${facetName as string}`, failureCallback);
        engine.trigger("facet:request", facetName as FacetList[number], facetName as FacetList[number], {});
        if (timeout && timeout < Infinity) {
            setTimeout((): void => {
                if (facetStatus !== "unloaded") return;
                facetStatus = "failed";
                engine.off(`facet:updated:${facetName as string}`, callback);
                engine.off(`facet:error:${facetName as string}`, failureCallback);
                reject(new ReferenceError(`Timed out while fetching facet: ${facetName} (timeout: ${timeout})`));
            }, timeout);
        }
    });
};
globalThis.unloadForceLoadedFacet ??= function unloadForceLoadedFacet(facetName): boolean {
    if (FacetManager.forceLoadedFacets.includes(facetName) /* globalThis.forceLoadedFacets[facetName as FacetList[number]] */) {
        forceUnloadFacet(facetName);
        // delete globalThis.forceLoadedFacets[facetName as FacetList[number]];
        if (FacetManager.forceLoadedFacets.includes(facetName)) FacetManager.forceLoadedFacets.splice(FacetManager.forceLoadedFacets.indexOf(facetName), 1);
        return true;
    }
    return false;
};
globalThis.forceUnloadFacet ??= function forceUnloadFacet(facetName): void {
    engine.trigger("facet:discard", facetName as FacetList[number]);
    // const targetFacetA: SharedFacetBase<string> | undefined = globalThis.facetSpyData?.sharedFacets?.[facetName as FacetList[number]] as
    //     | SharedFacetBase<string>
    //     | undefined;
    // const targetFacetB: SharedFacetBase<string> | undefined = globalThis.accessedFacets?.[facetName]?.();
    // try {
    //     targetFacetA?.set(Symbol.for("NoValue") as FacetNoValueSymbol);
    // } catch (e) {
    //     if ((globalThis as Record<string, unknown>)["logForceUnloadFacetSetValueErrors"]) {
    //         console.error(e);
    //     }
    // }
    // try {
    //     targetFacetB?.set(Symbol.for("NoValue") as FacetNoValueSymbol);
    // } catch (e) {
    //     if ((globalThis as Record<string, unknown>)["logForceUnloadFacetSetValueErrors"]) {
    //         console.error(e);
    //     }
    // }
};
globalThis.forceLoadUnloadedFacets ??= async function forceLoadUnloadedFacets({
    enableErrorLogging = false,
    enableSuccessLogging = false,
    enableAlreadyLoadedLogging = false,
    enableLoadingFacetsTracking = false,
}: {
    enableErrorLogging?: boolean | undefined;
    enableSuccessLogging?: boolean | undefined;
    enableAlreadyLoadedLogging?: boolean | undefined;
    enableLoadingFacetsTracking?: boolean | undefined;
} = {}): ReturnType<typeof globalThis.forceLoadUnloadedFacets> {
    if (!globalThis.facetSpyData) throw new ReferenceError("The global facetSpyData variable was not found.");
    if (enableLoadingFacetsTracking) globalThis.loadingFacets = {};
    return await Promise.all(
        facetList.map(async (facetName: FacetList[number], i: number): Promise<Awaited<ReturnType<typeof globalThis.forceLoadUnloadedFacets>>[number]> => {
            // Since i is always an integer, it is safe to cast it to a bigint when putting it into the template string.
            if (enableLoadingFacetsTracking) globalThis.loadingFacets![`${facetName}${i satisfies number as unknown as bigint}`] = true;
            try {
                const currentFacetData: unknown = (globalThis.facetSpyData?.sharedFacets?.[facetName] ?? globalThis.accessedFacets?.[facetName]?.())?.get();
                if ((currentFacetData?.toString?.() ?? "Symbol(NoValue)") === "Symbol(NoValue)") {
                    const result = [facetName, await forceLoadFacet(facetName), "success", !facetList.includes(facetName)] as Awaited<
                        ReturnType<typeof globalThis.forceLoadUnloadedFacets>
                    >[number];
                    if (enableSuccessLogging) console.log(i, ...result);
                    return result;
                }
                const result = [facetName, currentFacetData, "alreadyLoaded", !facetList.includes(facetName)] as Awaited<
                    ReturnType<typeof globalThis.forceLoadUnloadedFacets>
                >[number];
                if (enableAlreadyLoadedLogging) console.log(i, ...result);
                return result;
            } catch (e) {
                if (enableErrorLogging) console.error(e, i, facetName, "error");
                return [facetName, e, "error"];
            } finally {
                if (enableLoadingFacetsTracking) delete globalThis.loadingFacets![`${facetName}${i satisfies number as unknown as bigint}`];
            }
        })
    );
};
globalThis.unloadForceLoadedFacets ??= function unloadForceLoadedFacets(): [facetName: LooseAutocomplete<FacetList[number]>, successfullyUnloaded: boolean][] {
    return FacetManager.forceLoadedFacets /* Object.keys(globalThis.forceLoadedFacets) */
        .map((facetName: LooseAutocomplete<FacetList[number]>): [facetName: LooseAutocomplete<FacetList[number]>, successfullyUnloaded: boolean] => [
            facetName,
            unloadForceLoadedFacet(facetName),
        ]);
};
// globalThis.forceLoadedFacets ??= {};
{
    const checkForNewFacetsFallbackIntervalId: number = setInterval(function checkForNewFacets(): void {
        if (typeof globalThis.facetSpy === "function" && globalThis.facetSpyData?.sharedFacets) return void clearInterval(checkForNewFacetsFallbackIntervalId);
        for (const facetName of FacetManager.discoveredNewLoadedFacets) {
            if ((facetList as string[]).includes(facetName)) continue;
            if (FacetManager.__notedDiscoveredNewLoadedFacets__.includes(facetName)) continue;
            FacetManager.__notedDiscoveredNewLoadedFacets__.push(facetName);
            console.info(`New facet discovered (loaded)!: ${facetName}`);
        }
    }, 1);
}
// queueMicrotask((): void => void globalThis.forceLoadFacet("core.router"));
//#endregion

interface EngineInterceptorEventMap {
    beforeMethodCall: EngineInterceptorBeforeMethodCallEvent;
    methodCall: EngineInterceptorAfterMethodCallEvent;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface FacetManagerEventMap {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface QueryManagerEventMap {}

type EngineMethod = keyof { [key in keyof Engine as Engine[key] extends AnyCallableFunction<1> ? key : never]: Engine[key] };

// ------------------------------
// Types
// ------------------------------

type PolyfillEventTarget_EventListenerMap = Record<
    string,
    {
        readonly callback: EventListenerOrEventListenerObject;
        readonly capture: boolean;
        readonly once: boolean;
        readonly passive: boolean;
        readonly [Symbol.toStringTag]: "EventListenerDetails";
    }[]
> & {
    readonly [Symbol.toStringTag]: "EventListenerMap";
};
type PolyfillEventTarget_EventListenerMap_Input = Record<
    string,
    {
        readonly callback: EventListenerOrEventListenerObject;
        readonly capture: boolean;
        readonly once: boolean;
        readonly passive: boolean;
    }[]
>;

/**
 * A polyfilled version of {@link EventTarget}.
 *
 * This exists because in Ore UI (Cohtml), {@link EventTarget} is not constructable.
 *
 * EventTarget is a DOM interface implemented by objects that can receive events and may have listeners for them.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/EventTarget)
 */
class PolyfillEventTarget implements EventTarget {
    /**
     * The event listeners.
     */
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- This is necessary.
    #listeners: PolyfillEventTarget_EventListenerMap = Object.create(
        Object.create(null, {
            [Symbol.toStringTag]: {
                value: "EventListenerMap",
                configurable: true,
                enumerable: false,
                writable: false,
            },
        }) as object
    );
    public constructor() {}
    /**
     * The event listeners.
     */
    public get listeners(): PolyfillEventTarget_EventListenerMap {
        return this.#listeners;
    }
    /**
     * The event listeners.
     */
    public set listeners(value: PolyfillEventTarget_EventListenerMap_Input | PolyfillEventTarget_EventListenerMap) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.#listeners =
            (value as PolyfillEventTarget_EventListenerMap)?.[Symbol.toStringTag] === "EventListenerMap" ?
                value
            :   Object.assign(
                    Object.create(
                        Object.create(null, {
                            [Symbol.toStringTag]: {
                                value: "EventListenerMap",
                                configurable: true,
                                enumerable: false,
                                writable: false,
                            },
                        }) as object
                    ),
                    Object.fromEntries(
                        Object.entries(value).map(([key, value]) => [
                            key,
                            value.map((listener) => {
                                if ((listener as PolyfillEventTarget_EventListenerMap[string][number])?.[Symbol.toStringTag] === "EventListenerDetails") {
                                    return listener;
                                }
                                const opts = PolyfillEventTarget.#normalizeOptions(listener);
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- This is necessary.
                                return Object.create(
                                    Object.create(null, {
                                        [Symbol.toStringTag]: {
                                            value: "EventListenerDetails",
                                            configurable: true,
                                            enumerable: false,
                                            writable: false,
                                        },
                                    }) as object,
                                    {
                                        callback: {
                                            value: listener.callback,
                                            configurable: true,
                                            enumerable: true,
                                            writable: false,
                                        },
                                        capture: {
                                            value: opts.capture,
                                            configurable: true,
                                            enumerable: true,
                                            writable: false,
                                        },
                                        once: {
                                            value: opts.once,
                                            configurable: true,
                                            enumerable: true,
                                            writable: false,
                                        },
                                        passive: {
                                            value: opts.passive,
                                            configurable: true,
                                            enumerable: true,
                                            writable: false,
                                        },
                                    }
                                );
                            }),
                        ])
                    )
                );
    }
    public addEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options: boolean | AddEventListenerOptions = false): void {
        // eslint-disable-next-line eqeqeq -- This is necessary.
        if (callback == null) return;

        const opts: Required<AddEventListenerOptions> = PolyfillEventTarget.#normalizeOptions(options);
        const list = (this.#listeners[type] ||= []);

        for (const rec of list) {
            if (rec.callback === callback && rec.capture === opts.capture) {
                return;
            }
        }

        list.push(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- This is necessary.
            Object.create(
                Object.create(null, {
                    [Symbol.toStringTag]: {
                        value: "EventListenerDetails",
                        configurable: true,
                        enumerable: false,
                        writable: false,
                    },
                }) as object,
                {
                    callback: {
                        value: callback,
                        configurable: true,
                        enumerable: true,
                        writable: false,
                    },
                    capture: {
                        value: opts.capture,
                        configurable: true,
                        enumerable: true,
                        writable: false,
                    },
                    once: {
                        value: opts.once,
                        configurable: true,
                        enumerable: true,
                        writable: false,
                    },
                    passive: {
                        value: opts.passive,
                        configurable: true,
                        enumerable: true,
                        writable: false,
                    },
                }
            )
        );
    }
    public removeEventListener(type: string, callback: EventListenerOrEventListenerObject | null, options: boolean | EventListenerOptions = false): void {
        // eslint-disable-next-line eqeqeq -- This is necessary.
        if (callback == null) return;

        const list = this.#listeners[type];
        if (!list) return;

        const opts = PolyfillEventTarget.#normalizeOptions(options);

        for (let i = 0; i < list.length; i++) {
            const rec = list[i]!;
            if (rec.callback === callback && rec.capture === opts.capture) {
                list.splice(i, 1);
                return;
            }
        }
    }
    public dispatchEvent(event: Event): boolean {
        if (!event || typeof event.type !== "string") {
            throw new TypeError("Event object missing .type");
        }

        const list = this.#listeners[event.type];
        if (!list) return true;

        let _stopPropagationTriggered = false;
        let stopImmediatePropagationTriggered = false;
        const proxy = new Proxy(event, {
            get: (target, prop, _receiver): unknown => {
                if (prop === "stopPropagation") {
                    return function stopPropagation(): unknown {
                        _stopPropagationTriggered = true;
                        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- This is in case the original actually returns something.
                        return target.stopPropagation();
                    };
                }
                if (prop === "stopImmediatePropagation") {
                    return function stopImmediatePropagation(): unknown {
                        stopImmediatePropagationTriggered = true;
                        _stopPropagationTriggered = true;
                        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- This is in case the original actually returns something.
                        return target.stopImmediatePropagation();
                    };
                }
                if (prop === "target") return this;
                if (prop === "currentTarget") return this;
                // Access it directly to stop TypeErrors when a getter tries to access a private property.
                const targetPropValue = (target as unknown as Record<PropertyKey, unknown>)[prop];
                if (typeof targetPropValue === "function") {
                    try {
                        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
                        const boundMethod = targetPropValue.bind(target) as Function &
                            Record<"originalMethodProp" | "originalMethod" | "originalContainerObject", unknown>;
                        boundMethod.originalMethodProp = prop;
                        boundMethod.originalMethod = targetPropValue;
                        boundMethod.originalContainerObject = target;
                        return boundMethod;
                    } catch {
                        try {
                            const methodProxy = (...args: unknown[]): unknown => {
                                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                                return targetPropValue(...args);
                            };
                            methodProxy.name = `${targetPropValue.name}_proxy`;
                            methodProxy.originalMethodProp = prop;
                            methodProxy.originalMethod = targetPropValue;
                            methodProxy.originalContainerObject = target;
                            return methodProxy;
                        } catch {
                            return targetPropValue;
                        }
                    }
                }
                return targetPropValue;
                // return Reflect.get(target, prop, receiver);
            },
        });

        // Snapshot (spec behavior)
        const queue = list.slice();

        for (const rec of queue) {
            // Skip removed listeners
            if (!list.includes(rec)) continue;

            try {
                if (typeof rec.callback === "function") {
                    rec.callback.call(this, proxy);
                } else {
                    rec.callback.handleEvent(proxy);
                }
            } catch (err) {
                // Browser behavior: async rethrow
                setTimeout(() => {
                    throw err;
                });
            }

            if (rec.once) {
                this.removeEventListener(event.type, rec.callback, { capture: rec.capture });
            }

            if (stopImmediatePropagationTriggered) {
                break;
            }
        }

        return !event.defaultPrevented;
    }
    /**
     * Normalizes event listener options.
     *
     * @param options The event listener options.
     * @returns The normalized event listener options.
     */
    static #normalizeOptions(options: boolean | AddEventListenerOptions | EventListenerOptions): Required<AddEventListenerOptions> {
        if (typeof options === "boolean") {
            return { capture: options, once: false, passive: false };
        }
        return {
            capture: !!options.capture,
            once: !!(options as AddEventListenerOptions).once,
            passive: !!(options as AddEventListenerOptions).passive,
        };
    }
}
// Makes instances of PolyfillEventTarget return true for `polyfillEventTargetInstance instanceof EventTarget`.
Object.setPrototypeOf(PolyfillEventTarget.prototype, EventTarget.prototype);

class EngineInterceptorBeforeMethodCallEvent<T extends EngineMethod = EngineMethod> extends Event {
    readonly #type = "beforeMethodCall";
    public method: T;
    public args: Parameters<Engine[T]>;
    public constructor(method: T, args: Parameters<Engine[T]> | IArguments, eventInitDict?: EventInit) {
        super("beforeMethodCall", eventInitDict);
        this.method = method;
        this.args = Array.from(args) as Parameters<Engine[T]>;
    }
    public override get type(): "beforeMethodCall" {
        if (!this) throw new TypeError("Illegal invocation");
        return this.#type;
    }
}
class EngineInterceptorAfterMethodCallEvent<T extends EngineMethod = EngineMethod> extends Event {
    readonly #type = "methodCall";
    public method: T;
    public args: Parameters<Engine[T]>;
    public result?: ReturnType<Engine[T]>;
    public error?: unknown;
    public constructor(
        method: T,
        args: Parameters<Engine[T]> | IArguments,
        result: { result: ReturnType<Engine[T]> } | { error: unknown },
        eventInitDict?: EventInit
    ) {
        super("methodCall", eventInitDict);
        // Object.defineProperty(this, "method", { value: method });
        this.method = method;
        this.args = Array.from(args) as Parameters<Engine[T]>;
        if (typeof result !== "object" || result === null) {
            throw new TypeError(
                `Parameter "result" expected an object containing either result or error, but instead got: ${result === null ? "null" : typeof result}`
            );
        } else if ("result" in result) {
            if ("error" in result) throw new TypeError('Parameter "result" must be an object containing either result or error, not both.');
            this.result = result.result;
        } else if ("error" in result) {
            this.error = result.error;
        } else {
            throw new TypeError('Parameter "result" must be an object containing either result or error.');
        }
    }
    public override get type(): "methodCall" {
        if (!this) throw new TypeError("Illegal invocation");
        return this.#type;
    }
}

class EngineInterceptorBeforeVanillaEventListenerTriggerEvent<T extends LooseAutocomplete<EngineEventID> = string> extends Event {
    #passingToVanillaUIFilesPrevented = false;
    readonly #type = "beforeVanillaEventListenerTrigger";
    public eventId: T;
    public args: EngineEvent<T>;
    public constructor(eventId: T, args: EngineEvent<T> | IArguments, eventInitDict?: EventInit) {
        super("beforeVanillaEventListenerTrigger", eventInitDict);
        this.eventId = eventId;
        this.args = Array.from(args) as EngineEvent<T>;
    }
    public override get type(): "beforeVanillaEventListenerTrigger" {
        if (!this) throw new TypeError("Illegal invocation");
        return this.#type;
    }
    public get passingToVanillaUIFilesPrevented(): boolean {
        if (!this) throw new TypeError("Illegal invocation");
        return this.#passingToVanillaUIFilesPrevented;
    }
    public preventPassingToVanillaUIFiles(): void {
        if (!this) throw new TypeError("Illegal invocation");
        this.#passingToVanillaUIFilesPrevented = true;
    }
}

/** @ts-ignore: This is necessary, there is no alternative. */ /***/
namespace globalThis {
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
        let _OUICConsoleConfigInstance: OUICConsoleConfig;
        /**
         * @alpha This class is still in early development.
         * @hideconstructor
         */
        class OUICConsoleConfig implements OUICConsoleConfigData {
            static #constructed = false;
            private constructor() {
                if (OUICConsoleConfig.#constructed) throw new TypeError("Illegal constructor");
                OUICConsoleConfig.#constructed = true;
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- This is necessary.
            public readonly tempOverrides: { [key in keyof OUICConsoleConfigData]: OUICConsoleConfigData[key] | undefined } & {
                readonly [Symbol.toStringTag]: "OUICConsoleConfigTempOverrides";
            } = Object.create(
                {
                    [Symbol.toStringTag]: "OUICConsoleConfigTempOverrides",
                },
                Object.getOwnPropertyDescriptors({
                    showReadonlyPropertiesLabelInConsoleEnabled: undefined,
                })
            );
            /**
             * Whether or not to show labels for read-only properties in the console.
             *
             * @experimental
             *
             * @default false
             */
            public get showReadonlyPropertiesLabelInConsoleEnabled(): boolean {
                if (!this) throw new TypeError("Illegal invocation");
                return (
                    this.tempOverrides.showReadonlyPropertiesLabelInConsoleEnabled ??
                    (localStorage.getItem("OUICConsoleConfig:experiments:showReadonlyPropertiesLabelInConsoleEnabled") ?? "false") === "true"
                );
            }
            static {
                _OUICConsoleConfigInstance = new OUICConsoleConfig();
            }
        }
        /**
         * @alpha This class is still in early development.
         */
        export const OUICConsoleConfigInstance: OUICConsoleConfig = _OUICConsoleConfigInstance;
        let _EngineInterceptorInstance: EngineInterceptor;
        /**
         * @alpha This class is still in early development.
         * @hideconstructor
         */
        class EngineInterceptor extends PolyfillEventTarget {
            static #constructed = false;
            @writable(false)
            public readonly originalEngineMethods: { readonly [method in EngineMethod]?: Engine[method] } = {};
            @writable(false)
            @enumerable(false)
            private readonly _engineMethodsToIntercept: readonly EngineMethod[] = Object.freeze(["on", "off", "trigger"] satisfies EngineMethod[]);
            private constructor() {
                if (EngineInterceptor.#constructed) throw new TypeError("Illegal constructor");
                EngineInterceptor.#constructed = true;
                super();
                this.#init();
            }
            #init(): void {
                // Hook onto the engine methods.
                for (const method of this._engineMethodsToIntercept /* in engine */) {
                    if (typeof Object.getOwnPropertyDescriptor(engine, method)?.value !== "function") continue;
                    Object.defineProperty(this.originalEngineMethods, method, { value: engine[method], configurable: true, enumerable: true, writable: false });
                    try {
                        Object.defineProperty(engine, method, {
                            ...Object.getOwnPropertyDescriptor(engine, method),
                            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- `method` may not always be of type `EngineMethod`.
                            value: this.#createHookedEngineMethod(method as EngineMethod, engine[method as EngineMethod]),
                        });
                    } catch (error) {
                        console.error("Error while hooking onto engine method:", method, error);
                    }
                }
            }
            #createHookedEngineMethod<T extends EngineMethod>(method: T, originalEngineMethod: Engine[T]): Engine[T] {
                // eslint-disable-next-line @typescript-eslint/no-this-alias
                const EngineInterceptor: this = this;
                return {
                    [`_OUIC_intercepted_${method}`](this: ThisType<Engine[T]>, ...args: Parameters<Engine[T]>): ReturnType<Engine[T]> | undefined {
                        const beforeEventCanceled = !EngineInterceptor.dispatchEvent(
                            new EngineInterceptorBeforeMethodCallEvent(method, arguments, { cancelable: true })
                        );
                        if (beforeEventCanceled) return;
                        let result:
                            | {
                                  result: ReturnType<Engine[T]>;
                              }
                            | {
                                  error: unknown;
                              };
                        try {
                            result = {
                                result: (originalEngineMethod as (this: ThisType<Engine[T]>, ...args: Parameters<Engine[T]>) => ReturnType<Engine[T]>).apply(
                                    this,
                                    args
                                ),
                            };
                        } catch (error) {
                            result = {
                                error,
                            };
                        }
                        const afterEventCanceled = !EngineInterceptor.dispatchEvent(
                            new EngineInterceptorAfterMethodCallEvent(method, arguments, result, { cancelable: true })
                        );
                        if (afterEventCanceled) return;
                        if ("result" in result) return result.result;
                        throw result.error;
                    },
                }[`_OUIC_intercepted_${method}`] as Engine[T];
            }
            public override addEventListener<K extends keyof EngineInterceptorEventMap>(
                type: K,
                listener: (this: EngineInterceptor, ev: EngineInterceptorEventMap[K]) => unknown,
                options?: boolean | AddEventListenerOptions
            ): void;
            public override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
            public override addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
                // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- This is in case the original actually returns something.
                return super.addEventListener(type, listener, options, ...(Array.from(arguments).slice(3) as []));
            }
            public override removeEventListener<K extends keyof EngineInterceptorEventMap>(
                type: K,
                listener: (this: EngineInterceptor, ev: EngineInterceptorEventMap[K]) => unknown,
                options?: boolean | EventListenerOptions
            ): void;
            public override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
            public override removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void {
                // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- This is in case the original actually returns something.
                return super.removeEventListener(type, listener, options, ...(Array.from(arguments).slice(3) as []));
            }
            public override dispatchEvent<K extends keyof EngineInterceptorEventMap>(event: EngineInterceptorEventMap[K]): boolean;
            public override dispatchEvent(event: Event): boolean;
            public override dispatchEvent(event: Event): boolean {
                return super.dispatchEvent(event, ...(Array.from(arguments).slice(1) as []));
            }
            static {
                _EngineInterceptorInstance = new EngineInterceptor();
            }
        }
        /**
         * @alpha This class is still in early development.
         */
        export const EngineInterceptorInstance: EngineInterceptor = _EngineInterceptorInstance;
        // export const EngineInterceptorInstance: EngineInterceptor = new (EngineInterceptor as new () => EngineInterceptor)();
        // EngineInterceptorInstance.addEventListener("methodCall", console.debug); // DEBUG
        let _FacetManagerInstance: FacetManager;
        /**
         * @alpha This class is still in early development.
         * @hideconstructor
         */
        class FacetManager extends PolyfillEventTarget {
            static #constructed = false;
            #observedFacets: {
                [key in LooseAutocomplete<FacetList[number]>]?: ((
                    facetData: (FacetTypeMap & Record<string, unknown>)[key],
                    facet: key
                ) => Promise<void> | void)[];
            } = {};
            private constructor() {
                if (FacetManager.#constructed) throw new TypeError("Illegal constructor");
                FacetManager.#constructed = true;
                super();
                this.#init();
            }
            /**
             * The data of the facets that are currently loaded, not including facets that have been discarded.
             */
            @writable(false)
            public readonly facetData: Partial<FacetTypeMap> & Record<string, unknown> = {};
            /**
             * The data of the facets that have been loaded, including facets that have been discarded.
             */
            @writable(false)
            public readonly facetDataAll: Partial<FacetTypeMap> & Record<string, unknown> = {};
            /**
             * The list of facets that are currently force loaded.
             */
            @writable(false)
            public readonly forceLoadedFacets: string[] = [];
            /**
             * The list of facets that are currently being used by the vanilla UI files.
             */
            @writable(false)
            public readonly facetsInUseByVanilla: string[] = [];
            /**
             * The list of facets that when updated do not have the update event passed to the vanilla UI files.
             */
            @writable(false)
            public readonly facetsWithUpdatesToVanillaBlocked: string[] = [];
            /**
             * The list of facets that when an event related to them is triggered by the vanilla UI files, the event is blocked from passing to anything else.
             */
            @writable(false)
            public readonly facetsWithUpdatesFromVanillaBlocked: string[] = [];
            /**
             * The list of facets that have been loaded that are new (as in not yet in the {@link facetList}) that have been logged in the console.
             *
             * @internal
             */
            @writable(false)
            public readonly __notedDiscoveredNewLoadedFacets__: string[] = [];
            /**
             * The list of facets that have been loaded that are new (as in not yet in the {@link facetList}).
             */
            @writable(false)
            public readonly discoveredNewLoadedFacets: string[] = [];
            /**
             * The list of facets that have been requested that are new (as in not yet in the {@link facetList}).
             */
            @writable(false)
            public readonly discoveredNewRequestedFacets: string[] = [];

            /**
             * @todo
             */
            #init(): void {
                if (!this) throw new TypeError("Illegal invocation");
                (EngineInterceptorInstance.originalEngineMethods.on?.bind(engine) ?? engine.on)("*", (id: string, facetData: unknown): void => {
                    if (!id.startsWith("facet:updated:")) return;
                    // this.dispatchEvent(new FacetUpdatedEvent(facetName)); // TODO
                    const facetID: string = id.slice("facet:updated:".length);
                    // TEMP
                    this.facetData[facetID] = facetData;
                    this.facetDataAll[facetID] = facetData;
                    this.#triggerFacetDataObservers(facetID, facetData);
                    if (!(facetList as string[]).includes(facetID) && !this.discoveredNewLoadedFacets.includes(facetID)) {
                        // this.dispatchEvent(new FacetNewNotedLoadedFacetEvent(facetName)); // TODO
                        this.discoveredNewLoadedFacets.push(facetID);
                    }
                });
                EngineInterceptorInstance.addEventListener("beforeMethodCall", (event): void => {
                    if (event.method !== "trigger") return;
                    function assertEventMethodType(
                        event: EngineInterceptorBeforeMethodCallEvent
                    ): asserts event is EngineInterceptorBeforeMethodCallEvent<"trigger"> {
                        /* empty */
                    }
                    assertEventMethodType(event);
                    if (event.args[0] !== "facet:request") return;
                    function assertEventArgsType(
                        args: [name: EngineEventID, ...args: unknown[]]
                    ): asserts args is [name: "facet:request", ...args: EngineEvent<"facet:request">] {
                        /* empty */
                    }
                    assertEventArgsType(event.args);
                    const facetID = event.args[1];
                    if (!this.forceLoadedFacets.includes(facetID)) return;
                    if (!(facetID in this.facetData)) return;
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    // IDEA: Maybe create an Error object and check the stack to see if the source of this facet request was a vanilla file, or at least check to make sure the forceLoadFacet function isn't in the error stack.
                    (EngineInterceptorInstance.originalEngineMethods.trigger?.bind(engine) ?? engine.trigger)(
                        `facet:updated:${facetID}`,
                        this.facetData[facetID]
                    );
                });
                (EngineInterceptorInstance.originalEngineMethods.on?.bind(engine) ?? engine.on)(
                    "facet:request",
                    (facetName: LooseAutocomplete<FacetList[number]>): void => {
                        // this.dispatchEvent(new FacetNewNotedRequestedFacetEvent(facetName)); // TODO
                        this.discoveredNewRequestedFacets.push(facetName);
                    }
                );
                (EngineInterceptorInstance.originalEngineMethods.on?.bind(engine) ?? engine.on)("facet:discard", (facetName: FacetList[number]): void => {
                    // this.dispatchEvent(new FacetDiscardedEvent(facetName)); // TODO
                    // TEMP
                    delete this.facetData[facetName];
                });
            }
            /**
             * Triggers the facet data observation callbacks for the specified facet.
             *
             * The should not be called when the facet is discarded.
             *
             * @template T The ID of the facet to trigger the observers of.
             * @param facet The facet to trigger the observers of.
             * @param facetData The data to pass to the callbacks.
             */
            #triggerFacetDataObservers<T extends LooseAutocomplete<FacetList[number]>>(facet: T, facetData: (FacetTypeMap & Record<string, unknown>)[T]): void {
                if (!this) throw new TypeError("Illegal invocation");
                if (!this.#observedFacets[facet]) return;
                for (const callback of this.#observedFacets[facet]) {
                    try {
                        void callback(facetData, facet)?.catch(console.error);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }
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
            @writable(false)
            public observeFacetData<T extends LooseAutocomplete<FacetList[number]>>(
                facet: T,
                callback: (facetData: (FacetTypeMap & Record<string, unknown>)[T], facet: T) => Promise<void> | void
            ): boolean {
                if (!this) throw new TypeError("Illegal invocation");
                if (this.#observedFacets[facet]?.includes(callback)) return false;
                this.#observedFacets[facet] ??= [];
                this.#observedFacets[facet].push(callback);
                return true;
            }
            /**
             * Stops observing the data of a facet.
             *
             * @template T The ID of the facet to stop observing the data of.
             * @param facet The facet to stop observing the data of.
             * @param callback The callback that was passed to {@link observeFacetData}.
             * @returns Whether the callback was removed or not. If it returns false that means that the specified callback was not being used to observe the specified facet.
             */
            @writable(false)
            public unobserveFacetData<T extends LooseAutocomplete<FacetList[number]>>(
                facet: T,
                callback: (facetData: (FacetTypeMap & Record<string, unknown>)[T], facet: T) => Promise<void> | void
            ): boolean {
                if (!this) throw new TypeError("Illegal invocation");
                if (!this.#observedFacets[facet]) return false;
                const callbackIndex: number = this.#observedFacets[facet].indexOf(callback);
                if (callbackIndex === -1) return false;
                this.#observedFacets[facet].splice(callbackIndex, 1);
                return true;
            }
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
            @writable(false)
            public setFacetIsForceLoaded(_facet: LooseAutocomplete<FacetList[number]>, _forceLoaded: boolean): void {
                if (!this) throw new TypeError("Illegal invocation");
                throw new Error("Method not implemented.");
            }
            static {
                _FacetManagerInstance = new FacetManager();
            }
        }
        /**
         * The query
         */
        export const FacetManagerInstance: FacetManager = _FacetManagerInstance;
        // export const FacetManagerInstance: FacetManager = new (FacetManager as new () => FacetManager)();
        let _QueryManagerInstance: QueryManager;
        /**
         * @alpha This class is still in early development.
         * @hideconstructor
         */
        class QueryManager extends PolyfillEventTarget {
            static #constructed = false;
            /**
             * The next query ID.
             */
            public nextQueryId: bigint = 12527412642613253000n + BigInt(Date.now());
            /**
             * @todo Document this.
             */
            @writable(false)
            public readonly activeVanillaNonParameterizedQueries: {
                [queryName in LooseAutocomplete<keyof EngineQuerySubscribeEventParamsMap>]?: (number | bigint)[];
            } = {};
            /**
             * @todo Document this.
             */
            @writable(false)
            public readonly activeVanillaNonParameterizedQueriesIdMap: {
                [queryId: `${number | bigint}`]: LooseAutocomplete<keyof EngineQuerySubscribeEventParamsMap>;
            } = {};
            /**
             * @todo Document this.
             */
            @writable(false)
            public readonly activeQueryManagerQueryIds: {
                [queryId: `${number | bigint}`]: ((result: EngineQueryResult<keyof EngineQueryNonFacetResultMap>) => void)[];
            } = {};
            /**
             * The list of known queries.
             */
            @writable(false)
            public readonly knownQueries = [
                "core.animation",
                "core.input",
                "core.locale",
                "core.safeZone",
                "core.screenReader",
                "vanilla.gameplay.furnace",
                "core.splitScreen",
                "core.cloudStorage",
                "core.commandState",
                "core.device.display",
                "core.device.network",
                "core.device.platform",
                "core.device.storage",
                "core.staticFeatureFlag",
                "core.flightingConfig.bool",
                "core.flightingToggle",
                "vanilla.core.dataDrivenUICompositionQuery",
                "vanillaCoreDataDrivenUIDefinitionQuery",
                "vanillaCoreDataDrivenUIScreenIdQuery",
                "vanillaCoreDataStoreNumberQuery",
                "vanillaCoreDataStoreStringQuery",
                "vanillaCoreDataStoreBoolQuery",
                "vanillaGameplayContainerSizeQuery",
                "vanillaGameplayContainerItemQuery",
                "vanillaGameplayContainerNameQuery",
                "vanillaGameplayContainerChestTypeQuery",
                "vanillaGameplayRecipeBookSearchStringQuery",
                "vanillaGameplayRecipeBookFilteringQuery",
                "vanillaGameplayUIProfile",
                "vanillaGameplayAnvilQuery",
                "vanillaGameplayTradeOverviewQuery",
                "vanillaGameplayTradeTierQuery",
                "vanillaGameplayTradeOfferQuery",
                "vanilla.menus.settingsGroupQuery",
                "vanilla.menus.settingsGroupInfoQuery",
                "vanilla.menus.settingsUiDebugQuery",
                "vanilla.menus.settingsTextQuery",
                "vanilla.menus.settingsBooleanQuery",
                "vanilla.menus.settingsNumberQuery",
                "vanilla.menus.settingsOptionQuery",
                "vanilla.menus.settingsActionQuery",
                "vanilla.menus.buildInfoQuery",
                "vanilla.menus.localWorldListQuery",
                "vanilla.menus.localWorldQuery",
                "realmsServerSettingsQuery",
                "vanilla.currentParty.dataQuery",
                "vanilla.currentParty.destinationQuery",
                "vanilla.currentParty.membersQuery",
                "vanilla.menus.realms.adminLogQuery",
                "vanilla.menus.realms.realmsBackupDownloadQuery",
                "vanilla.menus.realms.realmsSavesQuery",
                "vanilla.partyChat.unreadMessagesQuery",
                "vanilla.playerFriendList",
                "vanilla.realms.currentRealm",
                "vanilla.receivedFriendRequests",
                "vanilla.CoreDataDrivenUIDefinitionQuery",
                "vanillaGameplayImmediateRespawnQuery",
                "vanillaGameplayActiveLevelHardcoreModeQuery",
                "vanillaGameplayPlayerDeathInfoQuery",
                "vanillaGameplayIsLocalPlayerAliveQuery",
            ] as const;
            /**
             * The list of facets that have been loaded that are new (as in not yet in the {@link knownQueries}).
             */
            @writable(false)
            public readonly discoveredNewLoadedQueries: string[] = [];
            /**
             * The list of facets that have been requested that are new (as in not yet in the {@link knownQueries}).
             */
            @writable(false)
            public readonly discoveredNewRequestedQueries: string[] = [];
            private constructor() {
                if (QueryManager.#constructed) throw new TypeError("Illegal constructor");
                QueryManager.#constructed = true;
                super();
                this.#init();
            }

            /**
             * @todo
             */
            #init(): void {
                if (!this) throw new TypeError("Illegal invocation");
            }
            /**
             * Gets the query ID for a query name and paramters using the same hashing function as the vanilla UI files do.
             *
             * @param queryName The name of the query.
             * @param queryParameters The parameters of the query.
             * @returns The query ID.
             */
            protected getQueryID<T extends keyof EngineQuerySubscribeEventParamsMap>(queryName: T, queryParameters: unknown[]): number {
                const t = queryName,
                    a = queryParameters;
                // This has function is from the vanilla Ore UI index.js file's query driver.
                const l = ((e, t): number => {
                    const a = ((e, t): string => t.reduce((e: string, t): string => `${e}\0${t as string}`, e))(e, t);
                    return ((e): number => {
                        let t = 0;
                        for (let a = 0; a < e.length; ++a) t = e.charCodeAt(a) + (t << 5) - t;
                        return t >>> 0;
                    })(a);
                })(t, a);
                return l;
            }
            /**
             * Fetches a query.
             *
             * @param queryName The name of the query.
             * @param queryParameters The parameters of the query.
             * @returns The result of the query.
             */
            @writable(false)
            public async fetchQuery<T extends keyof EngineQuerySubscribeEventParamsMap>(
                queryName: T,
                ...queryParameters: EngineQuerySubscribeEventParamsMap[T]
            ): Promise<EngineQueryResult<T>> {
                let resolvePromise: (value: EngineQueryResult<T>) => void;
                const queryId: bigint = queryParameters.length === 0 ? BigInt(this.getQueryID(queryName, [])) : this.nextQueryId++;
                const queryCallback = (value: unknown): void => {
                    (EngineInterceptorInstance.originalEngineMethods.off?.bind(engine) ?? engine.off.bind(engine))(
                        `query:subscribed/${queryId}`,
                        queryCallback
                    );
                    (EngineInterceptorInstance.originalEngineMethods.off?.bind(engine) ?? engine.off.bind(engine))(
                        `query:updated/${queryId}`,
                        queryCallbackUpdated
                    );
                    (EngineInterceptorInstance.originalEngineMethods.trigger?.bind(engine) ?? engine.trigger.bind(engine))("query:unsubscribe", queryId);

                    resolvePromise(value as EngineQueryResult<T>);
                };
                const queryCallbackUpdated = (value: unknown): void => {
                    (EngineInterceptorInstance.originalEngineMethods.off?.bind(engine) ?? engine.off.bind(engine))(
                        `query:subscribed/${queryId}`,
                        queryCallback
                    );
                    (EngineInterceptorInstance.originalEngineMethods.off?.bind(engine) ?? engine.off.bind(engine))(
                        `query:updated/${queryId}`,
                        queryCallbackUpdated
                    );

                    resolvePromise(value as EngineQueryResult<T>);
                };
                return await new Promise((resolve: (value: EngineQueryResult<T>) => void): void => {
                    resolvePromise = resolve;
                    (EngineInterceptorInstance.originalEngineMethods.on?.bind(engine) ?? engine.on.bind(engine))(`query:subscribed/${queryId}`, queryCallback);
                    (EngineInterceptorInstance.originalEngineMethods.on?.bind(engine) ?? engine.on.bind(engine))(
                        `query:updated/${queryId}`,
                        queryCallbackUpdated
                    );
                    (EngineInterceptorInstance.originalEngineMethods.trigger?.bind(engine) ?? engine.trigger.bind(engine))(
                        `query:subscribe/${queryName as string}`,
                        queryId,
                        ...queryParameters
                    );
                });
            }
            // fetchQueryWithParams
            /**
             * Subscribes to a query.
             *
             * @param queryName The name of the query.
             * @param callback The callback to call when the query is updated.
             * @param queryParameters The parameters of the query.
             * @returns A function to unsubscribe from the query.
             */
            public subscribeToQuery<T extends keyof EngineQuerySubscribeEventParamsMap>(
                queryName: T,
                callback: (result: EngineQueryResult<T>) => Promise<void> | void,
                ...queryParameters: EngineQuerySubscribeEventParamsMap[T]
            ): () => void {
                let unsubscribed = false;
                const queryId: bigint = queryParameters.length === 0 ? BigInt(this.getQueryID(queryName, [])) : this.nextQueryId++;
                const queryCallback = (value: unknown): void => {
                    void callback(value as EngineQueryResult<T>);
                };
                function unsubscribe(): void {
                    if (unsubscribed) throw new Error("Already unsubscribed from query.");
                    unsubscribed = true;
                    (EngineInterceptorInstance.originalEngineMethods.off?.bind(engine) ?? engine.off.bind(engine))(
                        `query:subscribed/${queryId}`,
                        queryCallback
                    );
                    (EngineInterceptorInstance.originalEngineMethods.off?.bind(engine) ?? engine.off.bind(engine))(`query:updated/${queryId}`, queryCallback);
                    if (!QueryManagerInstance.activeQueryManagerQueryIds[`${queryId}`]) return;
                    const callbackIndex: number = QueryManagerInstance.activeQueryManagerQueryIds[`${queryId}`]!.indexOf(queryCallback);
                    if (callbackIndex !== -1) QueryManagerInstance.activeQueryManagerQueryIds[`${queryId}`]!.splice(callbackIndex, 1);
                    if (!QueryManagerInstance.activeQueryManagerQueryIds[`${queryId}`]!.length) {
                        delete QueryManagerInstance.activeQueryManagerQueryIds[`${queryId}`];
                        if (!QueryManagerInstance.activeVanillaNonParameterizedQueries[queryName]?.length) {
                            (EngineInterceptorInstance.originalEngineMethods.trigger?.bind(engine) ?? engine.trigger.bind(engine))(
                                "query:unsubscribe",
                                queryId
                            );
                        }
                    }
                }
                (EngineInterceptorInstance.originalEngineMethods.on?.bind(engine) ?? engine.on.bind(engine))(`query:subscribed/${queryId}`, queryCallback);
                (EngineInterceptorInstance.originalEngineMethods.on?.bind(engine) ?? engine.on.bind(engine))(`query:updated/${queryId}`, queryCallback);
                (EngineInterceptorInstance.originalEngineMethods.trigger?.bind(engine) ?? engine.trigger.bind(engine))(
                    `query:subscribe/${queryName as string}`,
                    queryId,
                    ...queryParameters
                );
                QueryManagerInstance.activeQueryManagerQueryIds[`${queryId}`] ??= [];
                QueryManagerInstance.activeQueryManagerQueryIds[`${queryId}`]!.push(queryCallback);
                return unsubscribe;
            }
            // public async fetchQueryWithTimeout
            // public fetchQuery
            static {
                _QueryManagerInstance = new QueryManager();
            }
        }
        /**
         * @alpha This class is still in early development.
         */
        export const QueryManagerInstance: QueryManager = _QueryManagerInstance;
        // export const QueryManagerInstance: QueryManager = new (QueryManager as new () => QueryManager)();
    }
    export import OUICConsoleConfig = __OUICInternals__.OUICConsoleConfigInstance;
    export import EngineInterceptor = __OUICInternals__.EngineInterceptorInstance;
    export import FacetManager = __OUICInternals__.FacetManagerInstance;
    export import QueryManager = __OUICInternals__.QueryManagerInstance;
    // Make the properties read-only.
    Object.defineProperties(globalThis, {
        OUICConsoleConfig: {
            get: function get(this: typeof __OUICInternals__.OUICConsoleConfigInstance): typeof __OUICInternals__.OUICConsoleConfigInstance {
                return this;
            }.bind(__OUICInternals__.OUICConsoleConfigInstance),
            set(): never {
                throw new TypeError("Assignment to constant variable.");
            },
            configurable: true,
            enumerable: false,
        },
        EngineInterceptor: {
            get: function get(this: typeof __OUICInternals__.EngineInterceptorInstance): typeof __OUICInternals__.EngineInterceptorInstance {
                return this;
            }.bind(__OUICInternals__.EngineInterceptorInstance),
            set(): never {
                throw new TypeError("Assignment to constant variable.");
            },
            configurable: true,
            enumerable: false,
        },
        FacetManager: {
            get: function get(this: typeof __OUICInternals__.FacetManagerInstance): typeof __OUICInternals__.FacetManagerInstance {
                return this;
            }.bind(__OUICInternals__.FacetManagerInstance),
            set(): never {
                throw new TypeError("Assignment to constant variable.");
            },
            configurable: true,
            enumerable: false,
        },
        QueryManager: {
            get: function get(this: typeof __OUICInternals__.QueryManagerInstance): typeof __OUICInternals__.QueryManagerInstance {
                return this;
            }.bind(__OUICInternals__.QueryManagerInstance),
            set(): never {
                throw new TypeError("Assignment to constant variable.");
            },
            configurable: true,
            enumerable: false,
        },
    });
}

globalThis.getAccessibleFacetSpyFacets = function getAccessibleFacetSpyFacets(): ReturnType<typeof globalThis.getAccessibleFacetSpyFacets> {
    if (globalThis.getAccessibleFacetSpyFacets_internal === undefined && typeof FacetManager === "undefined") {
        throw new ReferenceError("[getAccessibleFacetSpyFacets] Neither the facetSpy data nor the FacetManager are available.");
    }
    return { ...globalThis.getAccessibleFacetSpyFacets_internal?.(), ...FacetManager.facetData };
};

/**
 * Whether to intercept engine subscriptions and store them in the {@link hookedEngineSubscriptions} object.
 *
 * This stores additions and removals of event subscription callbacks (from {@link engine.on} and {@link engine.off}), as well as the parameters of
 * {@link engine.trigger} calls.
 *
 * To enable it, either set the `setting:__CACHING_ENGINE_SUBSCRIPTIONS_FROM_HOOK_ENABLED__` {@link localStorage} item to `"true"` and reload the page, or set this variable to `true`.
 */
var __CACHING_ENGINE_SUBSCRIPTIONS_FROM_HOOK_ENABLED__ = Boolean(
    JSON.parse(localStorage.getItem("setting:__CACHING_ENGINE_SUBSCRIPTIONS_FROM_HOOK_ENABLED__") ?? "null") ?? false
);

// localStorage.setItem("setting:__CACHING_ENGINE_SUBSCRIPTIONS_FROM_HOOK_ENABLED__", "true")
// localStorage.setItem("setting:__CACHING_ENGINE_QUERY_RESULTS_FROM_HOOK_ENABLED__", "true")

/**
 * Whether to intercept engine query results and store them in the {@link cachedQueryResults} object.
 *
 * To enable it, either set the `setting:__CACHING_ENGINE_QUERY_RESULTS_FROM_HOOK_ENABLED__` {@link localStorage} item to `"true"` and reload the page, or set this variable to `true`.
 */
var __CACHING_ENGINE_QUERY_RESULTS_FROM_HOOK_ENABLED__ = Boolean(
    JSON.parse(localStorage.getItem("setting:__CACHING_ENGINE_QUERY_RESULTS_FROM_HOOK_ENABLED__") ?? "null") ?? false
);

/**
 * Whether to intercept vanilla command calls and store their parameters and results in the {@link cachedVanillaCommandCalls} object.
 *
 * To enable it, set the `setting:__CACHING_VANILLA_COMMAND_CALLS_ENABLED__` {@link localStorage} item to `"true"`, then reload the page.
 */
const __CACHING_VANILLA_COMMAND_CALLS_ENABLED__ = Boolean(
    JSON.parse(localStorage.getItem("setting:__CACHING_VANILLA_COMMAND_CALLS_ENABLED__") ?? "null") ?? false
);

/**
 * Whether to debug log vanilla command calls, their parameters, and their results to the console.
 *
 * To enable it the {@link __CACHING_VANILLA_COMMAND_CALLS_ENABLED__ | \_\_CACHING_VANILLA_COMMAND_CALLS_ENABLED\_\_} setting must be enabled first, then either set the
 * `setting:__VANILLA_COMMAND_CALL_DEBUG_LOGGING_ENABLED__` {@link localStorage} item to `"true"` and reload the page, or set this variable to `true`.
 */
var __VANILLA_COMMAND_CALL_DEBUG_LOGGING_ENABLED__ = Boolean(
    JSON.parse(localStorage.getItem("setting:__VANILLA_COMMAND_CALL_DEBUG_LOGGING_ENABLED__") ?? "null") ?? false
);

// localStorage.setItem("setting:__CACHING_ENGINE_SUBSCRIPTIONS_FROM_HOOK_ENABLED__", "true");
// localStorage.setItem("setting:__CACHING_ENGINE_QUERY_RESULTS_FROM_HOOK_ENABLED__", "true");

const hookedEngineSubscriptions = {
    on: {} as Record<EngineEventID, RemoveFirstNElements<Parameters<typeof engine.on<EngineEventID>>, 1>[]>,
    off: {} as Record<EngineEventID, RemoveFirstNElements<Parameters<typeof engine.off<EngineEventID>>, 1>[]>,
    trigger: {} as Record<EngineEventID, RemoveFirstNElements<Parameters<typeof engine.trigger<EngineEventID>>, 1>[]>,
};

/**
 * @type {{[key in keyof EngineQueryNonFacetResultMap]?: [timestamp: number, responseType: "subscribed" | "updated", value: EngineQueryNonFacetResultMap[key], args: unknown[]][]} & {[key in FacetList[number]]?: [timestamp: number, responseType: "subscribed" | "updated", value: FacetTypeMap[key]][]} & Record<string, [timestamp: number, responseType: "subscribed" | "updated", value: any][]>}
 */
const cachedQueryResults: {
    [key in keyof EngineQueryNonFacetResultMap]?: [
        timestamp: number,
        responseType: "subscribed" | "updated",
        value: EngineQueryNonFacetResultMap[key],
        args: unknown[],
    ][];
} & {
    [key in FacetList[number]]?: [timestamp: number, responseType: "subscribed" | "updated", value: FacetTypeMap[key], args: unknown[]][];
} & Record<string, [timestamp: number, responseType: "subscribed" | "updated", value: unknown, args: unknown[]][]> = {};

/**
 * @type {{[method in keyof typeof hookedEngineSubscriptions]: { "before": ((...args: Parameters<typeof engine[method]>) => void | boolean)[]; "after": ((...args: Parameters<typeof engine[method]>) => void)[] }}}
 */
const engineHookTriggerCallbacks: {
    [method in keyof typeof hookedEngineSubscriptions]: {
        before: ((...args: Parameters<(typeof engine)[method]>) => void | boolean)[];
        after: ((...args: Parameters<(typeof engine)[method]>) => void)[];
    };
} = {
    on: {
        before: [],
        after: [],
    },
    off: { before: [], after: [] },
    trigger: {
        before: [
            (id: EngineEventID, ...args: unknown[]): void => {
                if (!__CACHING_ENGINE_QUERY_RESULTS_FROM_HOOK_ENABLED__) return;
                if (id.startsWith("query:subscribe/")) {
                    const cacheCallback_subscribed = (value?: unknown, ..._args: unknown[]): void => {
                        const key: string = id.slice("query:subscribe/".length);
                        cachedQueryResults[key] ??= [];
                        cachedQueryResults[key].push([Date.now(), "subscribed", value, args]);
                        originalEngineMethods.off(`query:subscribed/${(args as EngineEvent<`query:subscribe/${string}`>)[0]}`, cacheCallback_subscribed);
                        originalEngineMethods.off(`query:updated/${(args as EngineEvent<`query:subscribe/${string}`>)[0]}`, cacheCallback_updated);
                    };
                    const cacheCallback_updated = (value?: unknown, ..._args: unknown[]): void => {
                        const key: string = id.slice("query:subscribe/".length);
                        cachedQueryResults[key] ??= [];
                        cachedQueryResults[key].push([Date.now(), "updated", value, args]);
                        originalEngineMethods.off(`query:subscribed/${(args as EngineEvent<`query:subscribe/${string}`>)[0]}`, cacheCallback_subscribed);
                        originalEngineMethods.off(`query:updated/${(args as EngineEvent<`query:subscribe/${string}`>)[0]}`, cacheCallback_updated);
                    };
                    originalEngineMethods.on(`query:subscribed/${(args as EngineEvent<`query:subscribe/${string}`>)[0]}`, cacheCallback_subscribed);
                    originalEngineMethods.on(`query:updated/${(args as EngineEvent<`query:subscribe/${string}`>)[0]}`, cacheCallback_updated);
                }
            },
        ],
        after: [],
    },
};

/**
 * @type {{[method in keyof typeof hookedEngineSubscriptions]: typeof engine[method]}}
 */
const originalUnboundEngineMethods: { [method in keyof typeof hookedEngineSubscriptions]: (typeof engine)[method] } = {
    // eslint-disable-next-line @typescript-eslint/unbound-method -- This is intentional.
    on: engine.on,
    // eslint-disable-next-line @typescript-eslint/unbound-method -- This is intentional.
    off: engine.off,
    // eslint-disable-next-line @typescript-eslint/unbound-method -- This is intentional.
    trigger: engine.trigger,
};

/**
 * @type {Pick<typeof engine, keyof typeof hookedEngineSubscriptions>}
 */
const originalEngineMethods: Pick<typeof engine, keyof typeof hookedEngineSubscriptions> = {
    on: originalUnboundEngineMethods.on.bind(engine),
    off: originalUnboundEngineMethods.off.bind(engine),
    trigger: originalUnboundEngineMethods.trigger.bind(engine),
};

{
    /**
     * @type {FacetTypeMap["core.input"] | undefined}
     */
    let __coreInput_value__: FacetTypeMap["core.input"] | undefined;
    /**
     * @type {Record<string, any>}
     */
    const cachedFacetQueryData: Record<string, unknown> = {};
    const cachedFeatureFlagQueries: Record<string, unknown> = {};
    /**
     * @type {{[key in keyof EngineQueryNonFacetResultMap]?: (...args: EngineQuerySubscribeEventParamsMap[key]) => EngineQueryNonFacetResultMap[key]} & Record<PropertyKey, (this: void, ...args: never[]) => unknown>}
     */
    const __queryResolvers__: {
        [key in keyof EngineQueryNonFacetResultMap]?: (...args: EngineQuerySubscribeEventParamsMap[key]) => EngineQueryNonFacetResultMap[key];
    } & Record<PropertyKey, (this: void, ...args: never[]) => unknown> = {
        // "vanilla.core.dataDrivenUICompositionQuery"(screenID) {
        //     const dduiScreens = getDDUIScreens(getDDUIScreensFolders());
        //     return {
        //         __Type: `vanilla.core.dataDrivenUICompositionQuery$_$${
        //             Object.keys(loadedFacets).length + Object.keys(engine.__queryResolvers__).indexOf("vanilla.core.dataDrivenUICompositionQuery")
        //         }`,
        //         children: [],
        //         ...(dduiScreens[screenID] && resolveDDUIScreen(dduiScreens[screenID])),
        //     };
        // },
        "vanilla.gameplay.furnace"() {
            return {
                __Type: `vanilla.gameplay.furnace$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayFurnace")}`,
                burnProgress: 0.5,
                litProgress: 0.5,
            };
        },
        vanillaGameplayContainerItemQuery(containerID, _slotIndex) {
            if (containerID === 59) {
                return {
                    __Type: `vanillaGameplayContainerItemQuery$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayContainerItemQuery")}`,
                    amount: 0,
                    containerItemType: 0,
                    damageValue: 0,
                    hasDamageValue: false,
                    image: "pack://textures/items/stick.png",
                    maxDamage: 0,
                    name: "Sticky the Stick",
                };
            }
            return {
                __Type: `vanillaGameplayContainerItemQuery$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayContainerItemQuery")}`,
                amount: 69,
                containerItemType: 0,
                damageValue: 0,
                hasDamageValue: false,
                image: "pack://textures/items/stick.png",
                maxDamage: 0,
                name: "Sticky the Stick",
            };
        },
        vanillaGameplayContainerSizeQuery() {
            return {
                __Type: `vanillaGameplayContainerSizeQuery$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayContainerSizeQuery")}`,
                size: 36,
            };
        },
        vanillaGameplayContainerNameQuery() {
            return {
                __Type: `vanillaGameplayContainerNameQuery$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayContainerNameQuery")}`,
                name: "CONTAINER TEST",
            };
        },
        vanillaGameplayContainerChestTypeQuery() {
            /**
             * @temp
             */
            const VanillaGameplayContainerChestType = {
                Chest: 0,
                TrappedChest: 1,
                CopperChest: 2,
                Barrel: 3,
                EnderChest: 4,
                ShulkerBox: 5,
            } as const;
            return {
                __Type: `vanillaGameplayContainerChestTypeQuery$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayContainerChestTypeQuery")}`,
                chestType: VanillaGameplayContainerChestType.Barrel,
            };
        },
        vanillaGameplayRecipeBookFilteringQuery() {
            return {
                __Type: `vanillaGameplayRecipeBookFilteringQuery$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayRecipeBookFilteringQuery")}`,
                isFiltering: false,
            };
        },
        vanillaGameplayRecipeBookSearchStringQuery() {
            return {
                __Type: `vanillaGameplayRecipeBookSearchStringQuery$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayRecipeBookSearchStringQuery")}`,
                searchString: "",
            };
        },
        vanillaGameplayUIProfile() {
            return {
                __Type: `vanillaGameplayUIProfile$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayUIProfile")}`,
                uiProfile: 0,
            };
        },
        vanillaGameplayAnvilQuery() {
            return {
                __Type: `vanillaGameplayAnvilQuery$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayAnvilQuery")}`,
                costText: "69 Levels",
                damageState: 1,
                hasInputItem: true,
                previewItemName: "Rick Astley",
                shouldCrossOutIconBeVisible: false,
            };
        },
        vanillaGameplayTradeOverviewQuery() {
            return {
                __Type: `vanillaGameplayTradeOverviewQuery$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayTradeOverviewQuery")}`,
                experiencePossibleProgress: 5,
                experienceProgress: 0.6,
                isExperienceBarVisible: true,
                traderName: "Rick Astley",
                tradeTiers: 5,
            };
        },
        vanillaGameplayTradeTierQuery(tradeTier) {
            return {
                __Type: `vanillaGameplayTradeTierQuery$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayTradeTierQuery")}`,
                isTierUnlocked: tradeTier < 3,
                isTierVisible: true,
                tierName: `Tier ${tradeTier} - ${["Never", "gonna", "give", "you", "up."][tradeTier] ?? "UNNAMED"}`,
                tradeOffers: 2,
            };
        },
        vanillaGameplayTradeOfferQuery(tradeTier, tradeIndex) {
            return {
                __Type: `vanillaGameplayTradeOfferQuery$_$${Object.keys(__queryResolvers__).indexOf("vanillaGameplayTradeOfferQuery")}`,
                buyAItemAmount: 9999,
                buyAItemImage: "pack://textures/items/diamond.png",
                buyAItemName: "Diamond",
                buyBItemAmount: 9999,
                buyBItemImage: "pack://textures/items/netherite_ingot.png",
                buyBItemName: "Netherite Ingot",
                sellItemAmount: 1,
                sellItemImage: "pack://textures/items/rotten_flesh.png",
                sellItemName: "Rotten Flesh",
                hasSecondaryBuyItem: true,
                isOutOfUses: tradeTier === 2 && tradeIndex === 1,
                isSelectedTrade: tradeTier === 1 && tradeIndex === 0,
                playerHasItemsForTrade: true,
            };
        },
    };
    // EngineInterceptor.addEventListener("beforeMethodCall", (ev) => {
    //     if (ev.method !== "trigger") return;
    //     const args = ev.args;
    //     if (args[0] !== "query:subscribe/vanillaCoreDataDrivenUIScreenIdQuery") return;
    //     ev.preventDefault();
    //     ev.stopImmediatePropagation();
    //     originalEngineMethods.trigger(`query:subscribed/${args[1]}`, {
    //         __Type: `vanillaCoreDataDrivenUIScreenIdQuery$_$${Date.now()}`,
    //         screenId: "minecraft:message_box",
    //     });
    // });
    engineHookTriggerCallbacks.trigger.before.push(function beforeQuerySubscribeCallback(id, ...args): void {
        if (id.startsWith("query:subscribe/")) {
            const [queryId] = args as EngineEvent<`query:subscribe/${string}`>;
            const queryName: string = id.slice("query:subscribe/".length);
            if (
                !QueryManager.activeVanillaNonParameterizedQueriesIdMap[`${queryId}`] &&
                !(QueryManager.knownQueries as readonly string[]).includes(queryName) &&
                !QueryManager.discoveredNewRequestedQueries.includes(queryName)
            ) {
                // this.dispatchEvent(new FacetNewNotedLoadedFacetEvent(facetName)); // TODO
                QueryManager.discoveredNewRequestedQueries.push(queryName);

                const callback = (_value: unknown): void => {
                    //@ts-ignore
                    originalEngineMethods.off(`query:subscribed/${queryId}`, callback);
                    //@ts-ignore
                    originalEngineMethods.off(`query:updated/${queryId}`, callback);
                    if (QueryManager.discoveredNewLoadedQueries.includes(queryName)) return;
                    QueryManager.discoveredNewLoadedQueries.push(queryName);
                    console.info(`New query discovered (loaded)!: ${queryName}`);
                };
                //@ts-ignore
                originalEngineMethods.on(`query:subscribed/${queryId}`, callback);
                //@ts-ignore
                originalEngineMethods.on(`query:updated/${queryId}`, callback);
            }
        }
        if (id === "query:subscribe/core.input") {
            // console.debug(6, id, ...args);
            originalEngineMethods.on(
                `query:subscribed/${(args as EngineEvent<"query:subscribe/core.input">)[0]}`,
                //@ts-ignore
                (value: FacetTypeMap["core.input"]): void => {
                    // console.debug(7, arguments);
                    __coreInput_value__ = value;
                }
            );
            originalEngineMethods.on(
                `query:updated/${(args as EngineEvent<"query:subscribe/core.input">)[0]}`,
                //@ts-ignore
                (value: FacetTypeMap["core.input"]): void => {
                    // console.debug(7, arguments);
                    __coreInput_value__ = value;
                }
            );
        } else if (id === "query:subscribe/core.featureFlag") {
            // console.debug(6, id, ...args);
            originalEngineMethods.on(
                `query:subscribed/${(args as EngineEvent<"query:subscribe/core.featureFlag">)[0]}`,
                //@ts-ignore
                (value: unknown): void => {
                    // console.debug(7, arguments);
                    cachedFeatureFlagQueries[args[1] as string] = value;
                }
            );
            originalEngineMethods.on(
                `query:updated/${(args as EngineEvent<"query:subscribe/core.featureFlag">)[0]}`,
                //@ts-ignore
                (value: unknown): void => {
                    // console.debug(7, arguments);
                    cachedFeatureFlagQueries[args[1] as string] = value;
                }
            );
        } else if (id.startsWith("query:subscribe/")) {
            if (args.length > 1) return; // Don't mess with queries that have parameters.
            const queryName: string = id.slice("query:subscribe/".length);
            // ~DEBUG: This is for overriding these queries.
            // if (__queryResolvers__[facetID]) {
            //     originalEngineMethods.trigger(`query:subscribed/${args[0]}`, __queryResolvers__[facetID](...args.slice(1)));
            //     return false;
            // }
            //@ts-ignore
            originalEngineMethods.on(`query:subscribed/${(args as EngineEvent<`query:subscribe/${string}`>)[0]}`, (value: unknown): void => {
                // console.debug(7, arguments);
                cachedFacetQueryData[queryName] = value;
            });
            //@ts-ignore
            originalEngineMethods.on(`query:updated/${(args as EngineEvent<`query:subscribe/${string}`>)[0]}`, (value: unknown): void => {
                // console.debug(7, arguments);
                cachedFacetQueryData[queryName] = value;
            });
        }
    });
    engineHookTriggerCallbacks.trigger.after.push(function afterQuerySubscribeCallback(id, ...args): void {
        if (id.startsWith("query:subscribe/") && args.length === 1) {
            const [queryId] = args as EngineEvent<`query:subscribe/${string}`>;
            const queryName: string = id.slice("query:subscribe/".length);
            QueryManager.activeVanillaNonParameterizedQueries[queryName] ??= [];
            if (!QueryManager.activeVanillaNonParameterizedQueries[queryName].includes(queryId)) {
                QueryManager.activeVanillaNonParameterizedQueries[queryName].push(queryId);
            }
            QueryManager.activeVanillaNonParameterizedQueriesIdMap[`${queryId}`] = queryName;
        }
        if (id === "query:unsubscribe") {
            const [queryId] = args as EngineEvent<`query:subscribe/${string}`>;
            const queryName: string | undefined = QueryManager.activeVanillaNonParameterizedQueriesIdMap[`${queryId}`];
            if (!queryName) return;
            if (!QueryManager.activeVanillaNonParameterizedQueries[queryName]) return;
            const idIndex: number = QueryManager.activeVanillaNonParameterizedQueries[queryName].indexOf(queryId);
            if (idIndex === -1) return;
            QueryManager.activeVanillaNonParameterizedQueries[queryName].splice(idIndex, 1);
            delete QueryManager.activeVanillaNonParameterizedQueriesIdMap[`${queryId}`];
        } else if (id === "query:subscribe/core.input") {
            if (typeof __coreInput_value__ !== "undefined") {
                // console.log(5, __coreInput_value__);

                localStorage.setItem("queryValueCache:query:subscribe/core.input", JSON.stringify(__coreInput_value__));
            } else if (localStorage.getItem("queryValueCache:query:subscribe/core.input")) {
                // console.log(
                //     4,
                //     localStorage.getItem("queryValueCache:query:subscribe/core.input"),
                //     JSON.parse(localStorage.getItem("queryValueCache:query:subscribe/core.input") ?? "null")
                // );
                originalEngineMethods.trigger(
                    `query:subscribed/${(args as EngineEvent<"query:subscribe/core.input">)[0]}`,
                    JSON.parse(localStorage.getItem("queryValueCache:query:subscribe/core.input") ?? "null") as unknown
                );
            } else if (globalThis.getAccessibleFacetSpyFacets?.()["core.input"]) {
                originalEngineMethods.trigger(
                    `query:subscribed/${(args as EngineEvent<"query:subscribe/core.input">)[0]}`,
                    globalThis.getAccessibleFacetSpyFacets?.()["core.input"]
                );
            } /* else {
                globalThis.forceLoadFacet("core.input").then(
                    (facetData): void => {
                        originalEngineMethods.trigger(`query:subscribed/${(args as EngineEvent<"query:subscribe/core.input">)[0]}`, facetData);
                    },
                    (reason: unknown): void => {
                        console.error(
                            new ReferenceError(
                                `Failed to load facet core.input for query subscribe/core.input with ID ${(args as EngineEvent<"query:subscribe/core.input">)[0]}.`
                            ),
                            reason
                        );
                    }
                );
            } */
        } else if (id === "query:subscribe/core.featureFlag") {
            // TEMP: The second as statement should be removed once the module has types for `core.featureFlag`.
            const [_queryID, flag] = args as EngineEvent<"query:subscribe/core.featureFlag"> as [number | bigint, string];
            if (typeof cachedFeatureFlagQueries[flag] !== "undefined") {
                // console.log(5, __coreInput_value__);

                localStorage.setItem(`queryValueCache:query:subscribe/core.featureFlag:${flag}`, JSON.stringify(cachedFeatureFlagQueries[flag]));
            } else if (localStorage.getItem(`queryValueCache:query:subscribe/core.featureFlag:${flag}`)) {
                // console.log(
                //     4,
                //     localStorage.getItem("queryValueCache:query:subscribe/core.input"),
                //     JSON.parse(localStorage.getItem("queryValueCache:query:subscribe/core.input") ?? "null")
                // );
                originalEngineMethods.trigger(
                    `query:subscribed/${(args as EngineEvent<"query:subscribe/core.featureFlag">)[0]}`,
                    JSON.parse(localStorage.getItem(`queryValueCache:query:subscribe/core.featureFlag:${flag}`) ?? "null") as unknown
                );
            }
        } else if (id.startsWith("query:subscribe/")) {
            if (args.length > 1) return /* void console.warn(id, args) */; // Don't mess with queries that have parameters.
            const facetID: string = id.slice("query:subscribe/".length);
            setTimeout((): void => {
                if (typeof cachedFacetQueryData[facetID] !== "undefined") {
                    // console.log(5, __coreInput_value__);

                    localStorage.setItem(`queryValueCache:query:subscribe/${facetID}`, JSON.stringify(cachedFacetQueryData[facetID]));
                } else if (localStorage.getItem(`queryValueCache:query:subscribe/${facetID}`)) {
                    // console.log(
                    //     4,
                    //     localStorage.getItem("queryValueCache:query:subscribe/core.input"),
                    //     JSON.parse(localStorage.getItem("queryValueCache:query:subscribe/core.input") ?? "null")
                    // );
                    originalEngineMethods.trigger(
                        `query:subscribed/${(args as EngineEvent<`query:subscribe/${string}`>)[0]}`,
                        JSON.parse(localStorage.getItem(`queryValueCache:query:subscribe/${facetID}`) ?? "null") as unknown
                    );
                } else if (__queryResolvers__[facetID]) {
                    originalEngineMethods.trigger(
                        `query:subscribed/${(args as EngineEvent<`query:subscribe/${string}`>)[0]}`,
                        __queryResolvers__[facetID](...(args.slice(1) as never[]))
                    );
                } else if (globalThis.getAccessibleFacetSpyFacets?.()[facetID]) {
                    originalEngineMethods.trigger(
                        `query:subscribed/${(args as EngineEvent<`query:subscribe/${string}`>)[0]}`,
                        globalThis.getAccessibleFacetSpyFacets?.()[facetID]
                    );
                } else {
                    globalThis.forceLoadFacet(facetID).then(
                        (facetData): void => {
                            originalEngineMethods.trigger(`query:subscribed/${(args as EngineEvent<`query:subscribe/${string}`>)[0]}`, facetData);
                        },
                        (reason: unknown): void => {
                            console.error(
                                new ReferenceError(
                                    `Failed to load facet ${facetID} for query ${id} with ID ${(args as EngineEvent<"query:subscribe/core.input">)[0]}.`
                                ),
                                reason
                            );
                        }
                    );
                }
            }, 1);
        }
    });
}

/**
 * @param {keyof typeof hookedEngineSubscriptions} method
 */
function hookEngineMethod(method: keyof typeof hookedEngineSubscriptions): void {
    const original = originalEngineMethods[method];
    //@ts-ignore
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, func-names
    engine[method] = function (id, ...args) {
        //@ts-ignore Sometimes this shows an error and sometimes it doesn't, it is very inconsistent.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Sometimes this shows an error and sometimes it doesn't, it is very inconsistent.
        if (!engineHookTriggerCallbacks[method].before.every((f): boolean => f(id, ...args) !== false)) {
            return method === "on" ?
                    {
                        clear(): void {
                            /* empty */
                        },
                    }
                :   void 0;
        }
        //@ts-ignore
        // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression -- Sometimes ESLint thinks this returns void rather than an object.
        const result = original.apply(engine, arguments);
        //@ts-ignore Sometimes this shows an error and sometimes it doesn't, it is very inconsistent.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- Sometimes this shows an error and sometimes it doesn't, it is very inconsistent.
        engineHookTriggerCallbacks[method].after.forEach((f): void => void f(id, ...args));
        if (__CACHING_ENGINE_SUBSCRIPTIONS_FROM_HOOK_ENABLED__) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- This is necessary.
            hookedEngineSubscriptions[method][id] ??= [];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access -- This is necessary.
            hookedEngineSubscriptions[method][id].push(args as any);
        }
        return result;
    };
    //@ts-ignore
    Object.defineProperty(engine[method], "name", { ...Object.getOwnPropertyDescriptor(engine[method], "name"), value: method });
}

/**
 * This will only have values if {@link __CACHING_VANILLA_COMMAND_CALLS_ENABLED__} is set to `true`.
 *
 * @type {{[commandGroup in keyof typeof __commands__]?: {[command in keyof typeof __commands__[commandGroup]]?: { params?: Parameters<typeof __commands__[commandGroup][command]["callable"]>; result?: ReturnType<typeof __commands__[commandGroup][command]["callable"]> }[]}}}
 */
const cachedVanillaCommandCalls: {
    [commandGroup in keyof typeof __commands__]?: {
        [command in keyof (typeof __commands__)[commandGroup]]?: {
            params?: Parameters<(typeof __commands__)[commandGroup][command]["callable"]>;
            result?: ReturnType<(typeof __commands__)[commandGroup][command]["callable"]>;
        }[];
    };
} = {};

function vanillaCommandsInterceptor(): void {
    if (!globalThis.__commands__) {
        console.warn(new ReferenceError("Could not find globalThis.__commands__."));
        return;
    }
    /**
     * @type {(keyof typeof __commands__)[]}
     */
    const commandGroups: (keyof typeof __commands__)[] = Object.keys(__commands__);
    for (const commandGroup of commandGroups) {
        /**
         * @type {(keyof typeof __commands__[typeof commandGroup])[]}
         */
        const commands: (keyof (typeof __commands__)[typeof commandGroup])[] = Object.keys(__commands__[commandGroup]!);
        for (const command of commands) {
            const original = __commands__[commandGroup]![command]!.callable.bind(__commands__[commandGroup]![command]);
            // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
            __commands__[commandGroup]![command]!.callable = function callable(...args) {
                cachedVanillaCommandCalls[commandGroup] ??= {};
                cachedVanillaCommandCalls[commandGroup][command] ??= [];
                try {
                    var result = original(...args);
                    return result;
                } finally {
                    try {
                        /* eslint-disable-next-line @typescript-eslint/no-unused-expressions --
                         * This rule needs to be disabled because this statement is here to throw an error when result is not declared due to an error occuring.
                         **/
                        result;
                        cachedVanillaCommandCalls[commandGroup][command].push({ ...(args.length > 0 ? { params: args } : {}), result });
                    } catch {
                        cachedVanillaCommandCalls[commandGroup][command].push({ ...(args.length > 0 ? { params: args } : {}) });
                    }
                    if (__VANILLA_COMMAND_CALL_DEBUG_LOGGING_ENABLED__) {
                        console.debug(commandGroup, command, ...args, "Result:", typeof result !== "undefined" ? result : undefined);
                    }
                }
            };
        }
    }
}

if (__CACHING_VANILLA_COMMAND_CALLS_ENABLED__) vanillaCommandsInterceptor();

//@ts-ignore
Object.keys(hookedEngineSubscriptions).forEach(hookEngineMethod);

// engine.on("query:subscribe/core.input", console.debug);
// engine.on("query:updated/core.input", console.debug);
// engine.on("query:subscribed/933789883", console.info);
// try {
//     engine.on(
//         "query:subscribe/core.input",
//         /**
//          * @param {number} value
//          */
//         function fixBrokenInput(value) {
//             engine.trigger(`query:subscribed/${value}`, {
//                 keyboardType: 0,
//                 enableControllerHints: true,
//                 currentInputType: 2,
//                 swapXYButtons: false,
//                 swapABButtons: false,
//             });
//         }
//     );
// } catch (e) {
//     console.error(e);
// }

/**
 * @type {HTMLDivElement}
 */
let mainMenu8CrafterUtilities: HTMLDivElement;

/**
 * @type {HTMLDivElement}
 */
let consoleOverlayElement: HTMLDivElement;

/**
 * @type {HTMLDivElement}
 */
let consoleOverlayTextElement: HTMLDivElement;

/**
 * @type {HTMLTextAreaElement}
 */
let consoleOverlayInputFieldElement: HTMLTextAreaElement;

/**
 * @type {HTMLDivElement}
 */
let screenDisplayElement: HTMLDivElement;

/**
 * @type {HTMLDivElement}
 */
let elementGeneralDebugOverlayElement: HTMLDivElement;

/**
 * @type {HTMLDivElement}
 */
let smallCornerDebugOverlayElement: HTMLDivElement;

/**
 * @type {HTMLDivElement}
 */
let statsCornerDebugOverlayElement: HTMLDivElement;

/**
 * @type {HTMLDivElement}
 */
let cssEditorDisplayElement: HTMLDivElement;

/**
 * @type {HTMLDivElement}
 */
let screenInputBlocker: HTMLDivElement;

/**
 * @type {HTMLDivElement}
 */
let htmlSourceCodePreviewElement: HTMLDivElement;

/**
 * @type {HTMLParagraphElement}
 */
let htmlSourceCodePreviewElementP: HTMLParagraphElement;

/**
 * @type {HTMLDivElement}
 */
let cssEditorSubtitleElement: HTMLDivElement;

/**
 * @type {HTMLStyleElement}
 */
let customGlobalCSSStyleElement: HTMLStyleElement;

/**
 * @type {HTMLTextAreaElement}
 */
let cssEditorTextBox: HTMLTextAreaElement;

/**
 * @type {HTMLParagraphElement}
 */
let cssEditorErrorText: HTMLParagraphElement;

/**
 * @type {HTMLButtonElement}
 */
let cssEditorSelectTargetButton: HTMLButtonElement;

/**
 * @type {"none" | "hoveredElementDetails"}
 */
let currentDebugMode: "none" | "hoveredElementDetails" = "none";

/**
 * @type {CSSStyleSheet[]}
 */
let cssEditor_selectableStyleSheets: CSSStyleSheet[] = [];

/**
 * @type {HTMLElement}
 */
let cssEditorSelectedElement: HTMLElement;

/**
 * The last five elements selected with the inspect tool (CSS editor select target button for now).
 *
 * @default
 * [, , , , ,] // [empty × 5]
 */
const elementInspectSelectionHistory: [
    $0?: HTMLElement | null,
    $1?: HTMLElement | null,
    $2?: HTMLElement | null,
    $3?: HTMLElement | null,
    $4?: HTMLElement | null,
] = [, , , , ,];

let cssEditorSelectedStyleSheet: CSSStyleSheet;

let cssEditorSelectedStyleSheet_rules: unknown[] = [];
let cssEditorSelectedType: CSSEditorSelectedType = "none";

let cssEditorInSelectMode = false;

/**
 * @type {HTMLElement & EventTarget}
 */
let currentMouseHoverTarget: HTMLElement & EventTarget;

var mousePos = {
    clientX: 0,
    clientY: 0,
    screenX: 0,
    screenY: 0,
    movementX: 0,
    movementY: 0,
    mTarget: null as EventTarget | null,
    kTarget: null as EventTarget | null,
};

/**
 * The currently held keys.
 *
 * This is used for the small corner debug overlay (`CTRL+I`).
 */
var heldKeys: string[] = [];

/**
 * @type {number[]}
 */
var heldKeyCodes: number[] = [];

/**
 * @type {string[]}
 */
var heldMouseButtons: string[] = [];

/**
 * @type {readonly ["MAIN", "AUX", "SEC", "BACK", "FRWD"]}
 */
const MOUSE_BUTTON_NAMES: readonly ["MAIN", "AUX", "SEC", "BACK", "FRWD"] = ["MAIN", "AUX", "SEC", "BACK", "FRWD"];

/**
 * An array of callbacks to be executed when a console message is intercepted.
 */
var onConsoleLogCallbacks: ConsoleLogCallback[] = "onConsoleLogCallbacks" in globalThis ? (globalThis.onConsoleLogCallbacks ?? []) : [];

/**
 * Copies the current list of new facets to the clipboard.
 *
 * @returns {ReturnType<typeof copyTextToClipboardAsync>} A promise that resolves with the result of {@link copyTextToClipboardAsync}.
 */
async function copyNewFacetListToClipboard(): ReturnType<typeof copyTextToClipboardAsync> {
    return await copyTextToClipboardAsync(notedNewFacets.join("\n"));
}

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
async function autoJoinRealm(realmName: string): Promise<{ success: boolean; message: string; error?: unknown }> {
    try {
        for (let i = 0; i < 100; i++) {
            if (document.querySelector("div[data-testid='play-screen-tab-bar-realms']") !== null) {
                break;
            }
            if (i >= 99) {
                console.error(`Failed to join realm: ${realmName}; Failed to find realms tab button. Timed out.`);
                return {
                    success: false,
                    message: `Failed to join realm: ${realmName}; Failed to find realms tab button. Timed out.`,
                };
            }
            await new Promise((resolve): void => void setTimeout(resolve, 100));
        }
        //@ts-ignore This is supposed to throw an error if it can't find the element.
        document.querySelector("div[data-testid='play-screen-tab-bar-realms']").dispatchEvent(new Event("click"));
        for (let i = 0; i < 100; i++) {
            if (document.querySelector("div[data-testid='realm-list-item-joined-realm']") !== null) {
                break;
            }
            if (i >= 99) {
                console.error(`Failed to join realm: ${realmName}; Failed to load realms. Timed out.`);
                return {
                    success: false,
                    message: `Failed to join realm: ${realmName}; Failed to load realms. Timed out.`,
                };
            }
            await new Promise((resolve): void => void setTimeout(resolve, 100));
        }
        for (let i = 0; i < 100; i++) {
            for (const div of document.querySelectorAll("div[data-testid='realm-list-item-joined-realm'] > div > div > div > div > div")) {
                if (div.textContent === realmName) {
                    /**
                     * @type {HTMLElement}
                     */
                    //@ts-ignore This is supposed to throw an error if it can't find the element.
                    const button: HTMLElement = div.parentElement.parentElement.parentElement.parentElement.parentElement;
                    button.dispatchEvent(new Event("click"));
                    for (let i = 0; i < 100; i++) {
                        if (document.querySelector("div[data-testid='play-realm-button']") !== null) {
                            break;
                        }
                        if (i >= 99) {
                            console.error(`Failed to join realm: ${realmName}; Failed to find the realm play button. Timed out.`);
                            return {
                                success: false,
                                message: `Failed to join realm: ${realmName}; Failed to find the realm play button. Timed out.`,
                            };
                        }
                        await new Promise((resolve): void => void setTimeout(resolve, 100));
                    }
                    let playRealmButton = document.querySelector("div[data-testid='play-realm-button']");
                    let playRealmButtonSection = playRealmButton?.parentElement?.parentElement?.parentElement ?? null;
                    let playRealmButtonSectionRealmNameSpan = playRealmButtonSection?.querySelector("> div > span.vanilla-neutral80-text");
                    for (let i = 0; i < 100; i++) {
                        playRealmButton ??= document.querySelector("div[data-testid='play-realm-button']");
                        playRealmButtonSection ??= playRealmButton?.parentElement?.parentElement?.parentElement ?? null;
                        playRealmButtonSectionRealmNameSpan ??= playRealmButtonSection?.querySelector("> div > span.vanilla-neutral80-text");
                        if (playRealmButton && playRealmButtonSectionRealmNameSpan?.textContent === realmName) {
                            await new Promise((resolve): void => void setTimeout(resolve, 100));
                            playRealmButton.dispatchEvent(new Event("click"));
                            console.log(`Joined realm: ${realmName}`);
                            return {
                                success: true,
                                message: `Joined realm: ${realmName}`,
                            };
                        }
                        await new Promise((resolve): void => void setTimeout(resolve, 100));
                    }
                    console.error(`Failed to join realm: ${realmName}; Failed to load realm details. Timed out.`);
                    return {
                        success: false,
                        message: `Failed to join realm: ${realmName}; Failed to load realm details. Timed out.`,
                    };
                }
            }
            await new Promise((resolve): void => void setTimeout(resolve, 100));
        }
        console.error(`Failed to join realm: ${realmName}; Failed to find realm in realm list. Timed out.`);
        return {
            success: false,
            message: `Failed to join realm: ${realmName}; Failed to find realm in realm list. Timed out.`,
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: e instanceof Error ? e.message : String(e),
            error: e,
        };
    }
}

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
async function autoJoinServer(serverName: string): Promise<{ success: boolean; message: string; error?: unknown }> {
    try {
        for (let i = 0; i < 101; i++) {
            if (document.querySelector("div[data-testid='play-screen-tab-bar-servers']") !== null) {
                break;
            }
            if (i >= 100) {
                console.error(`Failed to join server: ${serverName}; Failed to find servers tab button. Timed out.`);
                return {
                    success: false,
                    message: `Failed to join server: ${serverName}; Failed to find servers tab button. Timed out.`,
                };
            }
            await new Promise((resolve): void => void setTimeout(resolve, 100));
        }
        //@ts-ignore This is supposed to throw an error if it can't find the element.
        document.querySelector("div[data-testid='play-screen-tab-bar-servers']").dispatchEvent(new Event("click"));
        for (let i = 0; i < 101; i++) {
            const addServerButtonClass = /<div class="([a-zA-Z0-9]+)">Add server<\/div>/.exec(document.body.innerHTML)?.[1];
            if (addServerButtonClass !== null) {
                const addServerButton = Array.from(document.querySelectorAll(`div.${addServerButtonClass}`).values()).find(
                    (div) => div.textContent === "Add server"
                )?.parentElement?.parentElement?.parentElement?.parentElement?.parentElement;
                const addServerButtonContainer = addServerButton?.parentElement;
                const serversList = addServerButtonContainer?.parentElement ?? null;
                if (addServerButton && serversList !== null) {
                    if (
                        (serversList.querySelector(`> div.${addServerButton.classList.item(0)} div.vanilla-neutralAlpha60-text > div`) ??
                            Array.from(serversList.querySelectorAll(`> div.${addServerButton.classList.item(0)} div.vanilla-neutralAlpha60-text`)).find(
                                (div) => !div.querySelector("div")
                            )) !== null
                    ) {
                        break;
                    }
                }
            }
            if (i >= 100) {
                console.error(`Failed to join server: ${serverName}; Failed to load servers. Timed out.`);
                return {
                    success: false,
                    message: `Failed to join server: ${serverName}; Failed to load servers. Timed out.`,
                };
            }
            await new Promise((resolve): void => void setTimeout(resolve, 100));
        }
        let addServerButtonClass = /<div class="([a-zA-Z0-9]+)">Add server<\/div>/.exec(document.body.innerHTML)?.[1] ?? null;
        let addServerButton =
            Array.from(document.querySelectorAll(`div.${addServerButtonClass}`).values()).find((div) => div.textContent === "Add server")?.parentElement
                ?.parentElement?.parentElement?.parentElement?.parentElement ?? null;
        let addServerButtonContainer = addServerButton?.parentElement ?? null;
        let serversList = addServerButtonContainer?.parentElement ?? null;
        for (let i = 0; i < 100; i++) {
            addServerButtonClass ??= /<div class="([a-zA-Z0-9]+)">Add server<\/div>/.exec(document.body.innerHTML)?.[1] ?? null;
            addServerButton ??=
                Array.from(document.querySelectorAll(`div.${addServerButtonClass}`).values()).find((div) => div.textContent === "Add server")?.parentElement
                    ?.parentElement?.parentElement?.parentElement?.parentElement ?? null;
            addServerButtonContainer ??= addServerButton?.parentElement ?? null;
            serversList ??= addServerButtonContainer?.parentElement ?? null;
            if (!addServerButton || !serversList) {
                if (i >= 99) {
                    console.error(
                        `Failed to join server: ${serverName}; Failed to find ${!addServerButton ? "add server button" : "servers list"}. Timed out.`
                    );
                    return {
                        success: false,
                        message: `Failed to join server: ${serverName}; Failed to find ${!addServerButton ? "add server button" : "servers list"}. Timed out.`,
                    };
                }
                await new Promise((resolve): void => void setTimeout(resolve, 100));
                continue;
            }
            for (const div of [
                ...Array.from(serversList.querySelectorAll(`> div.${addServerButton.classList.item(0)} * div.vanilla-neutralAlpha60-text > div`)),
                ...Array.from(serversList.querySelectorAll(`> div.${addServerButton.classList.item(0)} * div.vanilla-neutralAlpha60-text`)).filter(
                    (div) => !div.querySelector("div")
                ),
            ]) {
                if (div.textContent === serverName) {
                    const button =
                        div.parentElement?.parentElement?.parentElement?.parentElement?.classList.contains(addServerButton.classList.item(0)!) ?
                            div.parentElement.parentElement.parentElement.parentElement
                        :   (div.parentElement?.parentElement?.parentElement?.parentElement?.parentElement ?? null);
                    if (!button) continue;
                    button.dispatchEvent(new Event("click"));
                    for (let i = 0; i < 100; i++) {
                        if (document.querySelector("div[data-testid='server-play-button']") !== null) {
                            break;
                        }
                        if (i >= 99) {
                            console.error(`Failed to join server: ${serverName}; Failed to find the server play button. Timed out.`);
                            return {
                                success: false,
                                message: `Failed to join server: ${serverName}; Failed to find the server play button. Timed out.`,
                            };
                        }
                        await new Promise((resolve): void => void setTimeout(resolve, 100));
                    }
                    await new Promise((resolve): void => void setTimeout(resolve, 100));
                    const playServerButton = document.querySelector("div[data-testid='server-play-button']");
                    const playServerButtonSection = playServerButton?.parentElement?.parentElement?.parentElement;
                    if (!playServerButtonSection) continue;
                    let playServerButtonSectionServerNameSpan = playServerButtonSection.querySelector("> div > span.vanilla-neutral80-text");
                    for (let i = 0; i < 100; i++) {
                        playServerButtonSectionServerNameSpan ??= playServerButtonSection.querySelector("> div > span.vanilla-neutral80-text");
                        if (playServerButtonSectionServerNameSpan?.textContent === serverName) {
                            playServerButton.dispatchEvent(new Event("click"));
                            console.log(`Joined server: ${serverName}`);
                            return {
                                success: true,
                                message: `Joined server: ${serverName}`,
                            };
                        }
                        await new Promise((resolve): void => void setTimeout(resolve, 100));
                    }
                    console.error(`Failed to join server: ${serverName}; Failed to load server details. Timed out.`);
                    return {
                        success: false,
                        message: `Failed to join server: ${serverName}; Failed to load server details. Timed out.`,
                    };
                }
            }
            await new Promise((resolve): void => void setTimeout(resolve, 100));
        }
        console.error(`Failed to join server: ${serverName}; Failed to find server in server list. Timed out.`);
        return {
            success: false,
            message: `Failed to join server: ${serverName}; Failed to find server in server list. Timed out.`,
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: e instanceof Error ? e.message : String(e),
            error: e,
        };
    }
}

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
async function autoJoinWorld(worldName: string): Promise<{ success: boolean; message: string; error?: unknown }> {
    try {
        let playScreenTabBarAll = null;
        for (let i = 0; i < 100; i++) {
            if ((playScreenTabBarAll = document.querySelector("div[data-testid='play-screen-tab-bar-all']")) !== null) {
                break;
            }
            await new Promise((resolve): void => void setTimeout(resolve, 100));
        }
        if ((playScreenTabBarAll ??= document.querySelector("div[data-testid='play-screen-tab-bar-all']")) === null) {
            console.error(`Failed to join world: ${worldName}; Failed to find worlds tab button. Timed out.`);
            return {
                success: false,
                message: `Failed to join world: ${worldName}; Failed to find worlds tab button. Timed out.`,
            };
        }
        playScreenTabBarAll.dispatchEvent(new Event("click"));
        let multiplayerWorldListItemPrimaryAction0 = null;
        for (let i = 0; i < 100; i++) {
            if ((multiplayerWorldListItemPrimaryAction0 = document.querySelector("div[data-testid='multiplayer-world-list-item-primary-action-0']")) !== null) {
                break;
            }
            await new Promise((resolve): void => void setTimeout(resolve, 100));
        }
        if ((multiplayerWorldListItemPrimaryAction0 ??= document.querySelector("div[data-testid='multiplayer-world-list-item-primary-action-0']")) === null) {
            console.error(`Failed to join world: ${worldName}; Failed to load worlds. Timed out.`);
            return {
                success: false,
                message: `Failed to join world: ${worldName}; Failed to load worlds. Timed out.`,
            };
        }
        let worldsList = multiplayerWorldListItemPrimaryAction0.parentElement?.parentElement ?? null;
        for (let i = 0; i < 100; i++) {
            if ((worldsList ??= multiplayerWorldListItemPrimaryAction0.parentElement?.parentElement ?? null) !== null) {
                for (const div of Array.from(worldsList.querySelectorAll(`> div > div`)).filter((div) =>
                    /^multiplayer-world-list-item-primary-action-[0-9]+$/.test(div.getAttribute("data-testid") ?? "")
                )) {
                    if (div.querySelector("div.vanilla-neutral-text")?.textContent === worldName) {
                        // await new Promise((resolve): void => void setTimeout(resolve, 100));
                        div.dispatchEvent(new Event("click"));
                        console.log(`Joined world: ${worldName}`);
                        return {
                            success: true,
                            message: `Joined world: ${worldName}`,
                        };
                    }
                }
            }
            await new Promise((resolve): void => void setTimeout(resolve, 100));
        }
        if (worldsList === null) {
            console.error(`Failed to join world: ${worldName}; Failed to find world list. Timed out.`);
            return {
                success: false,
                message: `Failed to join world: ${worldName}; Failed to find world list. Timed out.`,
            };
        }
        console.error(`Failed to join world: ${worldName}; Failed to find world in world list. Timed out.`);
        return {
            success: false,
            message: `Failed to join world: ${worldName}; Failed to find world in world list. Timed out.`,
        };
    } catch (e) {
        console.error(e);
        return {
            success: false,
            message: e instanceof Error ? e.message : String(e),
            error: e,
        };
    }
}

async function enableAutoJoinForOpenServer(): Promise<void> {
    if (
        document.querySelector("div[data-testid='play-screen-tab-bar-realms']")?.querySelector("div.vanilla-neutral-icon") !== null &&
        document.querySelector("div[data-testid='play-realm-button']") !== null
    ) {
        const playRealmButton = document.querySelector("div[data-testid='play-realm-button']");
        if (!playRealmButton) throw new Error("Impossible state reached, could not find play realm button even though it was already found.");
        const playRealmButtonSection = playRealmButton.parentElement?.parentElement?.parentElement ?? null;
        if (!playRealmButtonSection) throw new ReferenceError("Could not find play realm button section.");
        const playRealmButtonSectionRealmNameSpan = playRealmButtonSection.querySelector("> div > span.vanilla-neutral80-text");
        if (!playRealmButtonSectionRealmNameSpan) throw new ReferenceError("Could not find play realm button section realm name span.");
        if (!playRealmButtonSectionRealmNameSpan.textContent) throw new ReferenceError("The play realm button section realm name span was empty.");
        window.localStorage.setItem("autoJoinName", playRealmButtonSectionRealmNameSpan.textContent);
        window.localStorage.setItem("autoJoinType", "realm");
        const disableAutoRejoinButton = document.getElementById("8CrafterUtilitiesMenu_button_disableAutoRejoin");
        if (disableAutoRejoinButton) {
            disableAutoRejoinButton.removeAttribute("disabled");
            disableAutoRejoinButton.classList.remove("disabled");
        } else {
            console.warn(new ReferenceError("Could not find disable auto rejoin button."));
        }
        const autoRejoinNameSpan = document.getElementById("8CrafterUtilitiesMenu_span_autoJoinName");
        if (autoRejoinNameSpan) {
            autoRejoinNameSpan.textContent = playRealmButtonSectionRealmNameSpan.textContent;
        } else {
            console.warn(new ReferenceError("Could not find auto rejoin name span."));
        }
        const autoRejoinTypeSpan = document.getElementById("8CrafterUtilitiesMenu_span_autoJoinType");
        if (autoRejoinTypeSpan) {
            autoRejoinTypeSpan.textContent = "Realm";
        } else {
            console.warn(new ReferenceError("Could not find auto rejoin type span."));
        }
        await promptForConfirmation(`Successfully enabled auto rejoin for the following realm: ${playRealmButtonSectionRealmNameSpan.textContent}`, "OK", "");
    } else if (
        document.querySelector("div[data-testid='play-screen-tab-bar-servers']")?.querySelector("div.vanilla-neutral-icon") !== null &&
        document.querySelector("div[data-testid='server-play-button']") !== null
    ) {
        const playServerButton = document.querySelector("div[data-testid='server-play-button']");
        if (!playServerButton) throw new Error("Impossible state reached, could not find play server button even though it was already found.");
        const playServerButtonSection = playServerButton.parentElement?.parentElement?.parentElement ?? null;
        if (!playServerButtonSection) throw new ReferenceError("Could not find play server button section.");
        const playServerButtonSectionServerNameSpan = playServerButtonSection.querySelector("> div > span.vanilla-neutral80-text");
        if (!playServerButtonSectionServerNameSpan) throw new ReferenceError("Could not find play server button section server name span.");
        if (!playServerButtonSectionServerNameSpan.textContent) throw new ReferenceError("The play server button section server name span was empty.");
        window.localStorage.setItem("autoJoinName", playServerButtonSectionServerNameSpan.textContent);
        window.localStorage.setItem("autoJoinType", "server");
        const disableAutoRejoinButton = document.getElementById("8CrafterUtilitiesMenu_button_disableAutoRejoin");
        if (disableAutoRejoinButton) {
            disableAutoRejoinButton.removeAttribute("disabled");
            disableAutoRejoinButton.classList.remove("disabled");
        } else {
            console.warn(new ReferenceError("Could not find disable auto rejoin button."));
        }
        const autoRejoinNameSpan = document.getElementById("8CrafterUtilitiesMenu_span_autoJoinName");
        if (autoRejoinNameSpan) {
            autoRejoinNameSpan.textContent = playServerButtonSectionServerNameSpan.textContent;
        } else {
            console.warn(new ReferenceError("Could not find auto rejoin name span."));
        }
        const autoRejoinTypeSpan = document.getElementById("8CrafterUtilitiesMenu_span_autoJoinType");
        if (autoRejoinTypeSpan) {
            autoRejoinTypeSpan.textContent = "Server";
        } else {
            console.warn(new ReferenceError("Could not find auto rejoin type span."));
        }
        await promptForConfirmation(
            `Successfully enabled auto rejoin for the following server: ${playServerButtonSectionServerNameSpan.textContent}`,
            "OK",
            ""
        );
    } else if (
        document.querySelector("div[data-testid='play-screen-tab-bar-all']")?.querySelector("div.vanilla-neutral-icon") !== null &&
        document.querySelector("div[data-testid='multiplayer-world-list-item-primary-action-0']") !== null
    ) {
        const worldsListItemButton = document.querySelector("div[data-testid='multiplayer-world-list-item-primary-action-0']");
        if (!worldsListItemButton) throw new Error("Impossible state reached, could not find worlds list item button even though it was already found.");
        const worldsList = worldsListItemButton.parentElement?.parentElement;
        if (!worldsList) throw new ReferenceError("Could not find worlds list.");
        const worlds = Array.from(worldsList.querySelectorAll(`> div > div`)).filter((div) =>
            /^multiplayer-world-list-item-primary-action-[0-9]+$/.test(div.getAttribute("data-testid") ?? "")
        );
        const r = await buttonSelectionMenu({
            body: "Select a world to enable auto rejoin for.",
            buttons: worlds.map((world) => [world.querySelector("div.vanilla-neutral-text")?.textContent ?? "MISSING NAME!"]),
            style: "1column",
        });
        if (r.canceled || r.selection === undefined) return;
        const world = worlds[r.selection]!;
        const worldName = world.querySelector("div.vanilla-neutral-text")?.textContent;
        if (!worldName) throw new ReferenceError("Could not find world name.");
        window.localStorage.setItem("autoJoinName", worldName);
        window.localStorage.setItem("autoJoinType", "world");
        const disableAutoRejoinButton = document.getElementById("8CrafterUtilitiesMenu_button_disableAutoRejoin");
        if (disableAutoRejoinButton) {
            disableAutoRejoinButton.removeAttribute("disabled");
            disableAutoRejoinButton.classList.remove("disabled");
        } else {
            console.warn(new ReferenceError("Could not find disable auto rejoin button."));
        }
        const autoRejoinNameSpan = document.getElementById("8CrafterUtilitiesMenu_span_autoJoinName");
        if (autoRejoinNameSpan) {
            autoRejoinNameSpan.textContent = worldName;
        } else {
            console.warn(new ReferenceError("Could not find auto rejoin name span."));
        }
        const autoRejoinTypeSpan = document.getElementById("8CrafterUtilitiesMenu_span_autoJoinType");
        if (autoRejoinTypeSpan) {
            autoRejoinTypeSpan.textContent = "World";
        } else {
            console.warn(new ReferenceError("Could not find auto rejoin type span."));
        }
        await promptForConfirmation(`Successfully enabled auto rejoin for the following world: ${worldName}`, "OK", "");
    } else {
        await promptForConfirmation(
            "Failed to enable auto rejoin, no realm or server play button was found.\nPlease either go to the worlds tab, select a realm, or select a server. Then try again.\nNote: If the currently selected realm is not active, then it will not be detected as selected.",
            "OK",
            ""
        );
    }
}

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
async function promptForConfirmation(
    message: string,
    button1 = "Confirm",
    button2 = "Cancel",
    button3?: string,
    additionalModificationsCallback: (
        container: HTMLDivElement,
        resolve: (result: 0 | 1 | 2) => void,
        reject: (error: unknown) => void
    ) => void = (): void => {}
): Promise<0 | 1 | 2> {
    return await new Promise((resolve, reject) => {
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "12.5vh";
        container.style.left = "12.5vw";
        container.style.width = "75vw";
        container.style.height = "75vh";
        container.style.zIndex = "20000000";
        container.style.backgroundColor = "#00000080";
        container.style.color = "#FFFFFFFF";
        container.style.setProperty("backdrop-filter", "blur(5px)");
        container.style.border = "5px solid #87CEEb";
        const messageElement = document.createElement("pre");
        messageElement.textContent = message;
        messageElement.style.position = "absolute";
        messageElement.style.top = "0";
        messageElement.style.left = "0";
        messageElement.style.width = "100%";
        messageElement.style.height = "90%";
        messageElement.style.overflow = "auto";
        messageElement.style.padding = "10px";
        messageElement.style.fontSize = `2em`;
        messageElement.style.fontFamily = "Minecraft Seven v4";
        messageElement.style.whiteSpace = "pre-wrap";
        messageElement.style.overflowWrap = "anywhere";
        container.appendChild(messageElement);
        const button1Element = document.createElement("button");
        button1Element.textContent = button1;
        button1Element.style.position = "absolute";
        button1Element.style.bottom = button3 ? "25%" : "0";
        button1Element.style.left = "0";
        button1Element.style.width = button2 ? "50%" : "100%";
        button1Element.style.height = "25%";
        button1Element.style.fontSize = `${window.outerHeight * 0.09375}px`;
        button1Element.style.fontFamily = "Minecraft Seven v4";
        button1Element.classList.add("btn");
        button1Element.classList.add("btn-primary");
        button1Element.addEventListener("click", () => {
            container.setAttribute("data-closed", "true");
            container.remove();
            resolve(1);
        });
        container.appendChild(button1Element);
        if (button2) {
            const button2Element = document.createElement("button");
            button2Element.textContent = button2;
            button2Element.style.position = "absolute";
            button2Element.style.bottom = button3 ? "25%" : "0";
            button2Element.style.right = "0";
            button2Element.style.width = "50%";
            button2Element.style.height = "25%";
            button2Element.style.fontSize = `${window.outerHeight * 0.09375}px`;
            button2Element.style.fontFamily = "Minecraft Seven v4";
            button2Element.classList.add("btn");
            button2Element.classList.add("btn-danger");
            button2Element.addEventListener("click", () => {
                container.setAttribute("data-closed", "true");
                container.remove();
                resolve(0);
            });
            container.appendChild(button2Element);
        }
        if (button3) {
            const button3Element = document.createElement("button");
            button3Element.textContent = button3;
            button3Element.style.position = "absolute";
            button3Element.style.bottom = "0";
            button3Element.style.right = "0";
            button3Element.style.width = "100%";
            button3Element.style.height = "25%";
            button3Element.style.fontSize = `${window.outerHeight * 0.09375}px`;
            button3Element.style.fontFamily = "Minecraft Seven v4";
            button3Element.classList.add("btn");
            button3Element.classList.add("btn-danger");
            button3Element.addEventListener("click", () => {
                container.setAttribute("data-closed", "true");
                container.remove();
                resolve(2);
            });
            container.appendChild(button3Element);
        }
        additionalModificationsCallback(container, resolve, reject);
        document.body.appendChild(container);
    });
}

/**
 * Creates a button selection menu.
 *
 * @param {object} options The options for the button selection menu.
 * @param {string} [options.body] The body of the button selection menu.
 * @param {[text: string, icon?: string][]} options.buttons The buttons of the button selection menu.
 * @param {"1column" | "2columns"} [options.style="2columns"] The style of the button selection menu. "1column" means there is only one column. "2columns" means there are two columns.Defaults to "2columns".
 * @returns {Promise<{canceled: boolean, selection?: number}>} A promise that resolves with the index of the button that was clicked.
 */
async function buttonSelectionMenu(options: {
    body?: string;
    buttons: [text: string, icon?: string][];
    style?: "1column" | "2columns";
}): Promise<{ canceled: boolean; selection?: number }> {
    return await new Promise((resolve, _reject) => {
        const outerContainer = document.createElement("div");
        outerContainer.style.position = "fixed";
        outerContainer.style.top = "12.5vh";
        outerContainer.style.left = "12.5vw";
        outerContainer.style.width = "75vw";
        outerContainer.style.height = "75vh";
        outerContainer.style.zIndex = "20000000";
        outerContainer.style.backgroundColor = "#00000080";
        outerContainer.style.color = "#FFFFFFFF";
        outerContainer.style.setProperty("backdrop-filter", "blur(5px)");
        outerContainer.style.border = "5px solid #87CEEb";
        const container = document.createElement("div");
        // container.style.position = "fixed";
        // container.style.top = "12.5vh";
        // container.style.left = "12.5vw";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.overflow = "auto";
        container.classList.add("addScrollbar");
        addScrollbarToHTMLElement(container);
        if (options.body) {
            const messageElement = document.createElement("pre");
            messageElement.textContent = options.body;
            // messageElement.style.position = "absolute";
            // messageElement.style.top = "0";
            // messageElement.style.left = "0";
            messageElement.style.width = "100%";
            messageElement.style.height = "auto";
            messageElement.style.overflow = "auto";
            messageElement.style.padding = "10px";
            messageElement.style.fontSize = `2em`;
            messageElement.style.fontFamily = "Minecraft Seven v4";
            messageElement.style.whiteSpace = "pre-wrap";
            messageElement.style.overflowWrap = "anywhere";
            container.appendChild(messageElement);
        }
        const closeButtonElement = document.createElement("button");
        // @ts-ignore: This is for browser compatibility.
        closeButtonElement.type = "button";
        closeButtonElement.style.position = "absolute";
        closeButtonElement.style.top = "0";
        closeButtonElement.style.right = "0";
        closeButtonElement.style.fontFamily = "Minecraft Seven v2";
        closeButtonElement.style.fontSize = "50px";
        closeButtonElement.style.setProperty("aspect-ratio", "1/1");
        closeButtonElement.style.color = "#000000";
        closeButtonElement.style.width = "50px";
        closeButtonElement.style.height = "50px";
        closeButtonElement.style.zIndex = "1";
        const closeButtonSpanElement = document.createElement("span");
        closeButtonSpanElement.style.marginTop = "-5px";
        closeButtonSpanElement.style.fontFamily = "Minecraft Seven v2";
        closeButtonSpanElement.textContent = "x";
        closeButtonElement.appendChild(closeButtonSpanElement);
        closeButtonElement.addEventListener("click", () => {
            container.setAttribute("data-closed", "true");
            outerContainer.remove();
            resolve({ canceled: true });
        });
        outerContainer.appendChild(closeButtonElement);
        const buttonsContainer = document.createElement("div");
        buttonsContainer.style.width = "100%";
        buttonsContainer.style.height = "100%";
        switch (options.style ?? "2columns") {
            case "1column":
                buttonsContainer.style.height = `${options.buttons.length * window.outerHeight * 0.1875}px`;
                break;
            case "2columns":
                buttonsContainer.style.height = `${Math.ceil(options.buttons.length / 2) * window.outerHeight * 0.1875}px`;
                break;
            default:
                throw new TypeError(
                    `Unknown button layout style: ${options.style}`,
                    // Add the cause for browsers.
                    ...([
                        {
                            cause: {
                                options,
                                style: options.style,
                            },
                        },
                    ] as unknown as [])
                );
        }
        options.buttons.forEach((button, index) => {
            const buttonElement = document.createElement("button");
            buttonElement.textContent = button[0];
            buttonElement.style.position = "absolute";
            switch (options.style ?? "2columns") {
                case "1column":
                    buttonElement.style.top = `${index * window.outerHeight * 0.1875}px`;
                    buttonElement.style.left = "0";
                    buttonElement.style.width = "100%";
                    break;
                case "2columns":
                    buttonElement.style.top = `${Math.floor(index / 2) * window.outerHeight * 0.1875}px`;
                    buttonElement.style.left = index % 2 === 0 ? "0" : "50%";
                    buttonElement.style.width = "50%";
                    break;
                default:
                    throw new TypeError(
                        `Unknown button layout style: ${options.style}`,
                        // Add the cause for browsers.
                        ...([
                            {
                                cause: {
                                    options,
                                    style: options.style,
                                },
                            },
                        ] as unknown as [])
                    );
            }
            buttonElement.style.height = `${window.outerHeight * 0.1875}px`;
            buttonElement.style.fontSize = `${window.outerHeight * 0.0234375}px`;
            buttonElement.style.fontFamily = "Minecraft Seven v4";
            buttonElement.classList.add("btn");
            buttonElement.classList.add("btn-primary");
            buttonElement.addEventListener("click", () => {
                container.setAttribute("data-closed", "true");
                outerContainer.remove();
                resolve({ canceled: false, selection: index });
            });
            buttonElement.style.whiteSpace = "pre-wrap";
            buttonElement.style.overflowWrap = "anywhere";
            buttonElement.style.lineHeight = `${window.outerHeight * 0.0234375}px`;

            buttonsContainer.appendChild(buttonElement);
        });
        container.appendChild(buttonsContainer);
        outerContainer.appendChild(container);
        document.body.appendChild(outerContainer);
    });
}

if (localStorage.getItem("autoJoinName")) {
    setTimeout(() => {
        try {
            const disableAutoRejoinButton = document.getElementById("8CrafterUtilitiesMenu_button_disableAutoRejoin");
            if (disableAutoRejoinButton) {
                disableAutoRejoinButton.removeAttribute("disabled");
                disableAutoRejoinButton.classList.remove("disabled");
            } else {
                console.warn(new ReferenceError("Could not find disable auto rejoin button."));
            }
            const autoRejoinNameSpan = document.getElementById("8CrafterUtilitiesMenu_span_autoJoinName");
            if (autoRejoinNameSpan) {
                autoRejoinNameSpan.textContent = localStorage.getItem("autoJoinName");
            } else {
                console.warn(new ReferenceError("Could not find auto rejoin name span."));
            }
            const autoRejoinTypeSpan = document.getElementById("8CrafterUtilitiesMenu_span_autoJoinType");
            if (autoRejoinTypeSpan) {
                autoRejoinTypeSpan.textContent = localStorage.getItem("autoJoinType");
            } else {
                console.warn(new ReferenceError("Could not find auto rejoin type span."));
            }
        } catch {}
    }, 1);
    switch (localStorage.getItem("autoJoinType")) {
        case "realm":
            void promptForConfirmation(
                `Join realm: ${localStorage.getItem("autoJoinName")}?\nJoining in 10 seconds.`,
                "Join",
                "Cancel",
                "Turn Off Auto Rejoin",
                function addCountdown(container, resolve, _reject) {
                    void new Promise((resolve): void => void setTimeout(resolve, 1000)).then(async (): Promise<void> => {
                        for (let i = 10; i > 0; i--) {
                            if (container.getAttribute("data-closed") === "true") return;
                            //@ts-ignore
                            container.querySelector("pre").textContent = container
                                .querySelector("pre")
                                .textContent.replace(/Joining in [0-9]+ seconds\./, `Joining in ${i} seconds.`);
                            //@ts-ignore
                            console.log(container.querySelector("pre").textContent); // DEBUG
                            await new Promise((resolve): void => void setTimeout(resolve, 1000));
                        }
                        container.setAttribute("data-closed", "true");
                        container.remove();
                        resolve(1);
                    });
                }
            ).then((result) => {
                switch (result) {
                    case 0:
                        break;
                    case 1:
                        //@ts-ignore
                        void autoJoinRealm(localStorage.getItem("autoJoinName"));
                        break;
                    case 2:
                        localStorage.removeItem("autoJoinName");
                        localStorage.removeItem("autoJoinType");
                        break;
                    // no default
                }
            });
            break;
        case "server":
            void promptForConfirmation(
                `Join server: ${localStorage.getItem("autoJoinName")}?\nJoining in 10 seconds.`,
                "Join",
                "Cancel",
                "Turn Off Auto Rejoin",
                function addCountdown(container, resolve, _reject) {
                    void new Promise((resolve): void => void setTimeout(resolve, 1000)).then(async (): Promise<void> => {
                        for (let i = 10; i > 0; i--) {
                            if (container.getAttribute("data-closed") === "true") return;
                            //@ts-ignore
                            container.querySelector("pre").textContent = container
                                .querySelector("pre")
                                .textContent.replace(/Joining in [0-9]+ seconds\./, `Joining in ${i} seconds.`);
                            //@ts-ignore
                            console.log(container.querySelector("pre").textContent); // DEBUG
                            await new Promise((resolve): void => void setTimeout(resolve, 1000));
                        }
                        container.setAttribute("data-closed", "true");
                        container.remove();
                        resolve(1);
                    });
                }
            ).then((result) => {
                switch (result) {
                    case 0:
                        break;
                    case 1:
                        //@ts-ignore
                        void autoJoinServer(localStorage.getItem("autoJoinName"));
                        break;
                    case 2:
                        localStorage.removeItem("autoJoinName");
                        localStorage.removeItem("autoJoinType");
                        break;
                    // no default
                }
            });
            break;
        case "world":
            void promptForConfirmation(
                `Join world: ${localStorage.getItem("autoJoinName")}?\nJoining in 10 seconds.`,
                "Join",
                "Cancel",
                "Turn Off Auto Rejoin",
                function addCountdown(container, resolve, _reject) {
                    void new Promise((resolve): void => void setTimeout(resolve, 1000)).then(async (): Promise<void> => {
                        for (let i = 10; i > 0; i--) {
                            if (container.getAttribute("data-closed") === "true") return;
                            //@ts-ignore
                            container.querySelector("pre").textContent = container
                                .querySelector("pre")
                                .textContent.replace(/Joining in [0-9]+ seconds\./, `Joining in ${i} seconds.`);
                            //@ts-ignore
                            console.log(container.querySelector("pre").textContent); // DEBUG
                            await new Promise((resolve): void => void setTimeout(resolve, 1000));
                        }
                        container.setAttribute("data-closed", "true");
                        container.remove();
                        resolve(1);
                    });
                }
            ).then((result) => {
                switch (result) {
                    case 0:
                        break;
                    case 1:
                        //@ts-ignore
                        void autoJoinWorld(localStorage.getItem("autoJoinName"));
                        break;
                    case 2:
                        localStorage.removeItem("autoJoinName");
                        localStorage.removeItem("autoJoinType");
                        break;
                    // no default
                }
            });
            break;
        case null:
            void promptForConfirmation(`The server type for auto rejoin is missing, as a result auto join will not work.`, "OK", "");
            break;
        default:
            void promptForConfirmation(
                `The server type for auto rejoin is invalid, as a result auto join will not work. It is ${JSON.stringify(
                    localStorage.getItem("autoJoinType")
                )}. It should be one of the following: "realm", "server", "world".`,
                "OK",
                ""
            );
            break;
    }
}

/**
 * Validates the CSS or JSON in the CSS Editor text box.
 *
 * @returns {boolean} true if valid, false if invalid
 *
 * @deprecated Unused.
 */
function validateCssEditorTextBoxValue(): boolean {
    if (cssEditorSelectedType === "element") {
        try {
            const newCSS: string = JSON.parse(cssEditorTextBox.value) as string;
            cssEditorErrorText.textContent = "";
            cssEditorSelectedElement.style = newCSS;
            return true;
        } catch (e) {
            cssEditorErrorText.textContent = String(e instanceof Error && e.stack ? e.stack : e);
            return false;
        }
    } else if (cssEditorSelectedType === "root") {
        try {
            const newCSS: string = JSON.parse(cssEditorTextBox.value) as string;
            cssEditorErrorText.textContent = "";
            //@ts-ignore
            document.getElementById("root").style = newCSS;
            return true;
        } catch (e) {
            //@ts-ignore
            cssEditorErrorText.textContent = String(e instanceof Error && e.stack ? e.stack : e);
            return false;
        }
    } else if (cssEditorSelectedType === "globalStyleElement") {
        try {
            const newCSS: string = JSON.parse(cssEditorTextBox.value) as string;
            cssEditorErrorText.textContent = "";
            customGlobalCSSStyleElement.style = newCSS;
            return true;
        } catch (e) {
            //@ts-ignore
            cssEditorErrorText.textContent = String(e instanceof Error && e.stack ? e.stack : e);
            return false;
        }
    } else if (cssEditorSelectedType === "styleSheet") {
        // throw new Error("validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === 'styleSheet'");
        cssEditorErrorText.textContent = "validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === 'styleSheet'";
        return false;
    } else {
        // throw new Error("validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === '" + cssEditorSelectedType + "'");
        cssEditorErrorText.textContent = `validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === '${cssEditorSelectedType}'`;
        return false;
    }
}

/**
 * Puts the CSS Editor in style sheet selection mode.
 *
 * @deprecated The style sheet rules are undefined for some reason.
 */
function cssEditor_selectDocumentStyleSheet_activate(): void {
    //@ts-ignore
    document.getElementById("cssEditor_mainDiv").style.display = "none";
    cssEditor_selectableStyleSheets = Array.from(document.styleSheets);
    //@ts-ignore
    document.getElementById("cssEditor_documentStyleSelectorDiv").innerHTML = cssEditor_selectableStyleSheets
        .map((_s: CSSStyleSheet, i: number): string => `<button type="button" onclick="cssEditor_selectDocumentStyleSheet_selected(${i})">${i}</button>`)
        .join("");
    //@ts-ignore
    document.getElementById("cssEditor_documentStyleSelectorDiv").style.display = "block";
}

/**
 * Used when a style sheet is selected.
 *
 * @param {number} index
 *
 * @deprecated The style sheet rules are undefined for some reason.
 */
// eslint-disable-next-line @typescript-eslint/require-await -- This will be fixed once style sheet rules are able to be accessed again.
async function cssEditor_selectDocumentStyleSheet_selected(index: number): Promise<void> {
    //@ts-ignore
    document.getElementById("cssEditor_documentStyleSelectorDiv").style.display = "none";
    cssEditorSelectedType = "styleSheet";
    cssEditorSelectedStyleSheet = cssEditor_selectableStyleSheets[index]!;
    cssEditorSelectedStyleSheet_rules = [];
    try {
        // const ownerNode = cssEditorSelectedStyleSheet.ownerNode;
        // if(ownerNode){
        //     if(ownerNode.href){
        //         const srcData = (await fetch(ownerNode.href))
        //     }
        // }
        // cssEditorSelectedStyleSheet = document.styleSheets.item(0)
        // const cssRulesList = cssEditorSelectedStyleSheet.cssRules;
        // const a = Object.getOwnPropertyNames(Array.from(cssEditorSelectedStyleSheet.cssRules));
        // cssEditorSelectedStyleSheet_rules.push(...a.slice(0, 100));
        // for (let i = 0; i < a.length; i++) {
        //     cssEditorSelectedStyleSheet_rules.push(
        //         Object.hasOwn(Array.from(cssEditorSelectedStyleSheet.cssRules), a[i]),
        //         typeof Array.from(cssEditorSelectedStyleSheet.cssRules)[a[i]]
        //     );
        // }
        cssEditorSelectedStyleSheet_rules.push(
            //@ts-ignore
            cssEditorSelectedStyleSheet.ownerNode?.shadowRoot,
            //@ts-ignore
            cssEditorSelectedStyleSheet.ownerNode?.slot,
            //@ts-ignore
            cssEditorSelectedStyleSheet.ownerNode?.tagName,
            //@ts-ignore
            cssEditorSelectedStyleSheet.ownerNode?.href,
            //@ts-ignore
            Object.getOwnPropertyNames(cssEditorSelectedStyleSheet) /* , ownerNode.href ? (f(ownerNode.href)) : "NO HREF!" */
        );
        // eslint-disable-next-line @typescript-eslint/no-base-to-string -- This will be fixed once style sheet rules are able to be accessed again.
        cssEditorTextBox.value = cssEditorSelectedStyleSheet_rules.map((v) => v ?? "MISSING!").join("\n");
    } catch (e) {
        //@ts-ignore
        cssEditorTextBox.value = String(e instanceof Error && e.stack ? e.stack : e);
    }
    setCSSEditorMode("styleSheet");
    //@ts-ignore
    document.getElementById("cssEditor_mainDiv").style.display = "block";
}

/**
 * Saves the CSS Editor changes.
 */
// eslint-disable-next-line @typescript-eslint/require-await -- This will be fixed once style sheet rules are able to be accessed again.
async function cssEditor_saveChanges(): Promise<void> {
    if (cssEditorSelectedType === "element") {
        try {
            const newCSS = cssEditorTextBox.value;
            cssEditorErrorText.textContent = "";
            cssEditorSelectedElement.setAttribute("style", newCSS);
        } catch (e) {
            //@ts-ignore
            cssEditorErrorText.textContent = String(e instanceof Error && e.stack ? e.stack : e);
        }
    } else if (cssEditorSelectedType === "root") {
        try {
            const newCSS = cssEditorTextBox.value;
            cssEditorErrorText.textContent = "";
            //@ts-ignore
            document.getElementById("root").setAttribute("style", newCSS);
        } catch (e) {
            //@ts-ignore
            cssEditorErrorText.textContent = String(e instanceof Error && e.stack ? e.stack : e);
        }
    } else if (cssEditorSelectedType === "globalStyleElement") {
        try {
            const newCSS = cssEditorTextBox.value;
            cssEditorErrorText.textContent = "";
            // const elem = document.getElementById("customGlobalCSSStyle");
            // document.getElementById("customGlobalCSSStyle").remove();
            customGlobalCSSStyleElement.innerHTML = newCSS;
            //initialize parser object
            // var parser = new cssjs();
            //parse css string
            // var parsed = parser.parseCSS(newCSS);

            // console.log(parsed);
            // cssEditorTextBox.value = JSON.stringify(parsed);

            // elem.id = Date.now().toString();
            // document.head.appendChild(elem);
            customGlobalCSSStyleElement.dispatchEvent(new Event("change"));
            for (const styleSheet of document.styleSheets) {
                if (styleSheet.ownerNode === customGlobalCSSStyleElement) {
                    for (let i = 0; i < styleSheet.cssRules.length; i++) {
                        styleSheet.deleteRule(i);
                    }
                    styleSheet.insertRule(newCSS, 0);
                    break;
                }
            }
        } catch (e) {
            //@ts-ignore
            cssEditorErrorText.textContent = String(e instanceof Error && e.stack ? e.stack : e);
        }
    } else if (cssEditorSelectedType === "styleSheet") {
        // throw new Error("validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === 'styleSheet'");
        cssEditorErrorText.textContent = "validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === 'styleSheet'";
    } else {
        // throw new Error("validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === '" + cssEditorSelectedType + "'");
        cssEditorErrorText.textContent = `validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === '${cssEditorSelectedType}'`;
    }
}

/**
 * Sets the CSS Editor mode.
 *
 * @param {CSSEditorSelectedType} mode The mode to set the CSS Editor to.
 *
 * @throws {Error} Throws an error if the mode is not valid.
 */
function setCSSEditorMode(mode: CSSEditorSelectedType): void {
    cssEditorSelectedType = mode;
    cssEditorErrorText.textContent = "";
    switch (mode) {
        case "none":
            //@ts-ignore
            document.getElementById("cssEditor_subtitle").textContent = "Nothing selected!";
            cssEditorTextBox.style.backgroundColor = "#808080FF";
            cssEditorTextBox.style.pointerEvents = "none";
            //@ts-ignore
            document.getElementById("cssEditorSaveChangesButton").disabled = true;
            break;
        case "element":
            //@ts-ignore
            document.getElementById("cssEditor_subtitle").textContent = `Element Style (CSS): ${UTILS.cssPath(cssEditorSelectedElement).split(" > ").pop()}`;
            cssEditorTextBox.style.backgroundColor = "";
            cssEditorTextBox.style.pointerEvents = "";
            //@ts-ignore
            document.getElementById("cssEditorSaveChangesButton").disabled = false;
            break;
        case "root":
            //@ts-ignore
            document.getElementById("cssEditor_subtitle").textContent = `Root Element Style (CSS): ${cssEditorSelectedElement.accessKey}`;
            cssEditorTextBox.style.backgroundColor = "";
            cssEditorTextBox.style.pointerEvents = "";
            //@ts-ignore
            document.getElementById("cssEditorSaveChangesButton").disabled = false;
            break;
        case "globalStyleElement":
            //@ts-ignore
            document.getElementById("cssEditor_subtitle").textContent = "Global CSS (CSS)";
            cssEditorTextBox.style.backgroundColor = "";
            cssEditorTextBox.style.pointerEvents = "";
            //@ts-ignore
            document.getElementById("cssEditorSaveChangesButton").disabled = false;
            break;
        case "styleSheet":
            //@ts-ignore
            document.getElementById("cssEditor_subtitle").textContent = `Style Sheet Rules (JSON): ${cssEditorSelectedStyleSheet.title}`;
            cssEditorTextBox.style.backgroundColor = "";
            cssEditorTextBox.style.pointerEvents = "";
            //@ts-ignore
            document.getElementById("cssEditorSaveChangesButton").disabled = true;
            break;
        default:
            throw new Error(`setCSSEditorMode is not implemented for mode === '${String(mode)}'`);
    }
}

function cssEditor_rootElementStylesMode(): void {
    setCSSEditorMode("root");
    cssEditorTextBox.value = document.getElementById("root")?.getAttribute("style") ?? "";
}

function cssEditor_globalStyleElementStylesMode(): void {
    setCSSEditorMode("globalStyleElement");
    cssEditorTextBox.value = customGlobalCSSStyleElement.textContent ?? "";
}

/**
 * Sets the tab of the 8Crafter Utilities Main Menu.
 * @param {string} tab
 */
function setMainMenu8CrafterUtilitiesTab(tab: string): void {
    //@ts-ignore
    for (const child of document.getElementById("8CrafterUtilitiesMenu_rightSide").children) {
        if (!(child instanceof HTMLElement)) continue;
        if (child.classList.contains("customScrollbarParent")) continue;
        if (child.id === "8CrafterUtilitiesMenu_leftSidebar") continue;
        child.style.display = child.id === `8CrafterUtilitiesMenu_${tab}` ? "block" : "none";
    }
    //@ts-ignore
    for (const child of document.getElementById("8CrafterUtilitiesMenu_leftSidebar").children) {
        if (child.classList.contains("customScrollbarParent")) continue;
        if (child.id === `8CrafterUtilitiesMenu_tabButton_${tab}`) {
            child.classList.add("selected");
        } else {
            child.classList.remove("selected");
        }
    }
}

function toggleSmallCornerDebugOverlay(): void {
    if (smallCornerDebugOverlayElement.style.display === "none") {
        smallCornerDebugOverlayElement.style.display = "block";
    } else {
        smallCornerDebugOverlayElement.style.display = "none";
    }
}

function toggleStatsCornerDebugOverlay(): void {
    if (statsCornerDebugOverlayElement.style.display === "none") {
        statsCornerDebugOverlayElement.style.display = "block";
        localStorage.setItem("statsCornerDebugOverlayVisible", "true");
    } else {
        statsCornerDebugOverlayElement.style.display = "none";
        localStorage.removeItem("statsCornerDebugOverlayVisible");
    }
}

function togglePerfGraphDebugOverlay(graph: "FPS" | "ELL" | "FCD"): void {
    const element: HTMLElement | null = document.getElementById(`perfGraph_${graph}_container`);
    if (!element) throw new ReferenceError(`perfGraph_${graph}_container not found`);
    if (element.style.display === "none") {
        element.style.display = "block";
        localStorage.setItem(`perfGraph_${graph}_visible`, "true");
    } else {
        element.style.display = "none";
        localStorage.removeItem(`perfGraph_${graph}_visible`);
    }
}

function toggleGeneralDebugOverlayElement(): void {
    if (elementGeneralDebugOverlayElement.style.display === "none") {
        elementGeneralDebugOverlayElement.style.display = "block";
        const boundingBox = currentMouseHoverTarget.getBoundingClientRect();
        elementGeneralDebugOverlayElement.textContent = `Element: ${UTILS.cssPath(currentMouseHoverTarget)}
Bounding Box: ${JSON.stringify({
            x: boundingBox.x,
            y: boundingBox.y,
            width: boundingBox.width,
            height: boundingBox.height,
            top: boundingBox.top,
            right: boundingBox.right,
            bottom: boundingBox.bottom,
            left: boundingBox.left,
        })}
Children: ${currentMouseHoverTarget.children.length}
Attributes:
${
    currentMouseHoverTarget.getAttributeNames().length > 0 ?
        currentMouseHoverTarget
            .getAttributeNames()
            .map((name) => `${name}: ${currentMouseHoverTarget.getAttribute(name)}`)
            .join("\n")
    :   "None"
}`;
    } else {
        elementGeneralDebugOverlayElement.style.display = "none";
    }
}

function toggleHTMLSourceCodePreviewElement(): void {
    if (htmlSourceCodePreviewElement.style.display === "block") {
        htmlSourceCodePreviewElement.style.display = "none";
    } else {
        htmlSourceCodePreviewElementP.textContent = "";
        htmlSourceCodePreviewElementP.textContent = document.documentElement.outerHTML;
        htmlSourceCodePreviewElement.style.display = "block";
    }
}

function toggleConsoleOverlay(): void {
    if (consoleOverlayElement.style.display === "block") {
        consoleOverlayElement.style.display = "none";
    } else {
        consoleOverlayElement.style.display = "block";
    }
}

interface ConsoleExecutionHistoryEntryJSON {
    code: string;
    time: number;
}

/**
 * Represents an entry in the console execution history.
 */
class ConsoleExecutionHistoryEntry implements ConsoleExecutionHistoryEntryJSON {
    /**
     * The code that was executed.
     *
     * @public
     *
     * @type {string}
     */
    public code: string;
    /**
     * The time when the code was executed.
     *
     * @public
     *
     * @type {number}
     */
    public time: number;
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
    public constructor(code: string, time: number = Date.now()) {
        this.code = code;
        this.time = time;
    }
    /**
     * Returns the JSON representation of the ConsoleExecutionHistoryEntry instance.
     *
     * @returns The JSON representation of the ConsoleExecutionHistoryEntry instance.
     *
     * @public
     */
    public toJSON(): ConsoleExecutionHistoryEntryJSON {
        return {
            code: this.code,
            time: this.time,
        };
    }
    /**
     * Creates a new ConsoleExecutionHistoryEntry instance from a JSON object.
     *
     * @param json The JSON object to create the ConsoleExecutionHistoryEntry instance from.
     * @returns The ConsoleExecutionHistoryEntry instance.
     *
     * @public
     * @static
     */
    public static fromJSON(this: void, json: ConsoleExecutionHistoryEntryJSON): ConsoleExecutionHistoryEntry {
        return new ConsoleExecutionHistoryEntry(json.code, json.time);
    }
}

/**
 * Stores the history of executed console commands.
 *
 * @hideconstructor
 */
class ConsoleExecutionHistory {
    /**
     * The maximum number of entries to store in the history.
     *
     * @public
     * @static
     *
     * @default 100
     */
    public static maxEntries = 100;
    /**
     * The maximum length of an entry in the history.
     *
     * @public
     * @static
     *
     * @default 1000
     */
    public static maxEntryLength = 1000;
    /**
     * The entries in the history, oldest first.
     *
     * @readonly
     *
     * @public
     * @static
     */
    public static entries: ConsoleExecutionHistoryEntry[] = [];
    /**
     * @constructor
     *
     * @throws {TypeError} Throws an error if the constructor is called.
     *
     * @private
     */
    public constructor() {
        throw new TypeError("Failed to construct 'ConsoleExecutionHistory': Illegal constructor");
    }
    /**
     * Gets the nth newest entry in the history.
     *
     * @param {number} n The index of the entry to retrieve.
     * @returns {ConsoleExecutionHistoryEntry | undefined} The nth newest entry in the history.
     *
     * @public
     * @static
     */
    public static getNthNewestEntry(n: number): ConsoleExecutionHistoryEntry | undefined {
        return ConsoleExecutionHistory.entries.at(-n - 1);
    }
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
    public static addHistoryItem(code: string, time: number = Date.now()): ConsoleExecutionHistoryEntry {
        const entry = new ConsoleExecutionHistoryEntry(code, time);
        if (ConsoleExecutionHistory.entries.at(-1)?.code === entry.code) ConsoleExecutionHistory.entries.pop();
        ConsoleExecutionHistory.entries.push(entry);
        if (ConsoleExecutionHistory.entries.length > ConsoleExecutionHistory.maxEntries) {
            ConsoleExecutionHistory.entries.shift();
        }
        ConsoleExecutionHistory.saveToLocalStorage();
        return entry;
    }
    /**
     * Clears the history.
     *
     * @public
     * @static
     */
    public static clearHistory(): void {
        ConsoleExecutionHistory.entries.length = 0;
        ConsoleExecutionHistory.saveToLocalStorage();
        currentlySelctedConsoleExecutionHistoryItemIndex = -1;
        savedConsoleInputFieldContents = "";
    }
    /**
     * Saves the history to local storage.
     *
     * @public
     * @static
     */
    public static saveToLocalStorage(): void {
        localStorage.setItem("consoleHistory", JSONB.stringify(ConsoleExecutionHistory.entries));
    }
    /**
     * Loads the history from local storage.
     *
     * @public
     * @static
     */
    public static loadFromLocalStorage(): void {
        const data = localStorage.getItem("consoleHistory");
        if (data) {
            ConsoleExecutionHistory.entries.splice(
                0,
                ConsoleExecutionHistory.entries.length,
                ...(JSONB.parse(data) as Parameters<typeof ConsoleExecutionHistoryEntry.fromJSON>[0][]).map(ConsoleExecutionHistoryEntry.fromJSON)
            );
        }
    }
}

ConsoleExecutionHistory.loadFromLocalStorage();

/**
 * Reads the keys of the {@link localStorage}.
 *
 * There is a bug with the Ore UI environment where localStorage.key() returns null for all indexes other than 0, so this works by removing keys one at a time
 * to read them and then restoring them.
 *
 * @returns {string[]} The keys of the {@link localStorage}.
 */
function readLocalStorageKeys(): string[] {
    /**
     * @type {string[]}
     */
    const keys: string[] = [];
    /**
     * @type {[key: string, value: string][]}
     */
    const valueBackups: [key: string, value: string][] = [];
    const length = localStorage.length;
    for (let i = 0; i < length; i++) {
        const key = localStorage.key(0);
        if (key === null) continue;
        const value = localStorage.getItem(key);
        if (value !== null) {
            keys.push(key);
            valueBackups.push([key, value]);
            localStorage.removeItem(key);
        }
    }
    valueBackups.reverse().forEach(([key, value]: [key: string, value: string]): void => void localStorage.setItem(key, value));
    return keys;
}

/* function consoleOverlayExecute() {
    const input = consoleOverlayInputFieldElement.value;
    const elem = document.createElement("pre");
    if(consoleOverlayTextElement.children.length > 0 && !consoleOverlayTextElement.lastChild?.style?.backgroundColor?.length > 0){
        elem.style.borderTop = "1px solid #888888";
    };
    elem.textContent = `> ${input}`;
    consoleOverlayTextElement.appendChild(elem);
    const resultElem = document.createElement("pre");
    try {
        const result = eval(input);
        if(!consoleOverlayTextElement.lastChild?.style?.backgroundColor?.length > 0){
            resultElem.style.borderTop = "1px solid #888888";
        };
        resultElem.style.borderTop = "#";
        resultElem.textContent = `${(() => {
            switch (typeof v) {
                case "symbol":
                case "function":
                    return result.toString();
                default:
                    return JSONB.stringify(result);
            }
        })()}`;
        consoleOverlayTextElement.appendChild(resultElem);
        consoleOverlayInputFieldElement.value = "";
    } catch (e) {
        resultElem.style.backgroundColor = "#FF000055";
        resultElem.textContent = `${e + " " + e?.stack}`;
        consoleOverlayTextElement.appendChild(resultElem);
    }
} */
/**
 * The index of the currently selected console execution history item.
 *
 * @type {number}
 *
 * @default -1
 */
var currentlySelctedConsoleExecutionHistoryItemIndex = -1;

/**
 * The result of the last console overlay execution.
 *
 * @default undefined
 */
let lastConsoleOverlayResult: unknown;

/**
 * Executes the console input field contents.
 */
function consoleOverlayExecute(): void {
    if (consoleOverlayInputFieldElement.value.length === 0) return;
    // Reset the currently selected console execution history item index
    currentlySelctedConsoleExecutionHistoryItemIndex = -1;
    // Erase the saved contents to reduce memory usage.
    savedConsoleInputFieldContents = "";
    /**
     * The input to be executed.
     *
     * @type {string}
     */
    const input: string = consoleOverlayInputFieldElement.value;
    if (input.length <= ConsoleExecutionHistory.maxEntryLength) {
        ConsoleExecutionHistory.addHistoryItem(input, Date.now());
    }
    {
        // Scope the commandElem constant to prevent it from being accesed by the eval.
        /**
         * The command element.
         *
         * @type {HTMLDivElement}
         */
        const commandElem: HTMLDivElement = document.createElement("div");
        commandElem.style.whiteSpace = "pre-wrap";
        commandElem.style.overflowWrap = "anywhere";
        if (
            consoleOverlayTextElement.children.length > 0 &&
            consoleOverlayTextElement.lastChild instanceof HTMLElement &&
            !consoleOverlayTextElement.lastChild?.style?.backgroundColor?.length
        ) {
            commandElem.style.borderTop = "1px solid #888888";
        }
        commandElem.textContent = `> ${input}`;
        consoleOverlayTextElement.appendChild(commandElem);
    }

    /* eslint-disable @typescript-eslint/no-unused-vars */
    /**
     * The value of the most recently evaluated expression.
     *
     * @see {@link https://developer.chrome.com/docs/devtools/console/utilities#recent}
     */
    const $_: unknown = lastConsoleOverlayResult;
    /**
     * @see {@link https://developer.chrome.com/docs/devtools/console/utilities#recent-many}
     */
    const $0: HTMLElement | Node = elementInspectSelectionHistory[0] ?? document.childNodes[0]!;
    /**
     * @see {@link https://developer.chrome.com/docs/devtools/console/utilities#recent-many}
     */
    const $1: void | HTMLElement | null = elementInspectSelectionHistory[1];
    /**
     * @see {@link https://developer.chrome.com/docs/devtools/console/utilities#recent-many}
     */
    const $2: void | HTMLElement | null = elementInspectSelectionHistory[2];
    /**
     * @see {@link https://developer.chrome.com/docs/devtools/console/utilities#recent-many}
     */
    const $3: void | HTMLElement | null = elementInspectSelectionHistory[3];
    /**
     * @see {@link https://developer.chrome.com/docs/devtools/console/utilities#recent-many}
     */
    const $4: void | HTMLElement | null = elementInspectSelectionHistory[4];
    /**
     * @see {@link https://developer.chrome.com/docs/devtools/console/utilities#querySelector-function}
     */
    const $: {
        <K extends keyof HTMLElementTagNameMap>(selectors: K, startNode?: ParentNode): HTMLElementTagNameMap[K] | null;
        <K extends keyof SVGElementTagNameMap>(selectors: K, startNode?: ParentNode): SVGElementTagNameMap[K] | null;
        <K extends keyof HTMLElementDeprecatedTagNameMap>(selectors: K, startNode?: ParentNode): HTMLElementDeprecatedTagNameMap[K] | null;
        <E extends Element = Element>(selectors: string, startNode?: ParentNode): E | null;
    } = (selectors: string, startNode?: ParentNode): Element | null => (startNode ?? document).querySelector(selectors);
    /**
     * @see {@link https://developer.chrome.com/docs/devtools/console/utilities#querySelectorAll-function}
     */
    const $$: {
        <K extends keyof HTMLElementTagNameMap>(selectors: K, startNode?: ParentNode): HTMLElementTagNameMap[K][];
        <K extends keyof SVGElementTagNameMap>(selectors: K, startNode?: ParentNode): SVGElementTagNameMap[K][];
        <K extends keyof HTMLElementDeprecatedTagNameMap>(selectors: K, startNode?: ParentNode): HTMLElementDeprecatedTagNameMap[K][];
        <E extends Element = Element>(selectors: string, startNode?: ParentNode): E[];
    } = (selectors: string, startNode?: ParentNode): Element[] => Array.from((startNode ?? document).querySelectorAll(selectors));
    /**
     * @see {@link https://developer.chrome.com/docs/devtools/console/utilities#clear-function}
     */
    function clear(): void {
        consoleOverlayTextElement.innerHTML = "";
        console.everything.length = 0;
        console._logInternal("Console was cleared");
    }
    type __MarkEvalVarsUsed__ = [typeof $_, typeof $0, typeof $1, typeof $2, typeof $3, typeof $4, typeof $, typeof $$, typeof clear, __MarkEvalVarsUsed2__];
    type __MarkEvalVarsUsed2__ = __MarkEvalVarsUsed__;
    /* eslint-enable @typescript-eslint/no-unused-vars */

    /**
     * The result element that will display the result of the executed command.
     *
     * @type {HTMLDivElement}
     */
    const $resultElem: HTMLDivElement = document.createElement("div");
    $resultElem.style.whiteSpace = "pre-wrap";
    $resultElem.style.overflowWrap = "anywhere";
    const $noResultElemModificationsSymbol: unique symbol = Symbol("DoNotModifyConsoleOverlayExecuteResultElement");
    try {
        /**
         * The result of the executed command.
         *
         * @type {any}
         */
        const result: unknown = eval(input);
        lastConsoleOverlayResult = result;
        if (result !== $noResultElemModificationsSymbol) {
            if ((typeof result === "object" && result !== null) || typeof result === "function") {
                $resultElem.appendChild(
                    createExpandableObjectView(result, true, undefined, {
                        showReadonly: OUICConsoleConfig.showReadonlyPropertiesLabelInConsoleEnabled,
                        currentPath: [],
                        currentDisplayedPath: [],
                    })
                );
            } else if (typeof result === "symbol") {
                $resultElem.textContent = result.toString();
                addContextMenuToTopLevelPrimitiveConsoleValue(result, $resultElem);
            } else {
                $resultElem.textContent = JSONB.stringify(result);
                addContextMenuToTopLevelPrimitiveConsoleValue(result as string | number | boolean | bigint | null | undefined, $resultElem);
            }
            if (
                consoleOverlayTextElement.children.length > 0 &&
                consoleOverlayTextElement.lastChild instanceof HTMLElement &&
                (consoleOverlayTextElement.lastChild?.style?.backgroundColor ?? "") === ($resultElem.style.backgroundColor ?? "")
            ) {
                $resultElem.style.borderTop = "1px solid #888888";
            }
        }
        consoleOverlayTextElement.appendChild($resultElem);
        consoleOverlayInputFieldElement.value = "";
    } catch (e) {
        $resultElem.style.backgroundColor = "#FF000055";
        if (e instanceof Error) {
            const stack = e.stack === undefined ? undefined : mapStackWithTS(e.stack);

            const errorElem = $resultElem.appendChild(
                createExpandableObjectView(e, true, false, {
                    summaryValueOverride: stack?.stack ?? e.stack,
                    showReadonly: OUICConsoleConfig.showReadonlyPropertiesLabelInConsoleEnabled,
                    currentPath: [],
                    currentDisplayedPath: [],
                    hideSummaryValueWhenExpanded: false,
                })
            );
            if (stack?.hasUnloadedStacks) {
                void stack.fullyLoadedStack.then((stack: string): void => {
                    errorElem.parentNode?.replaceChild(
                        createExpandableObjectView(e, true, false, {
                            summaryValueOverride: stack,
                            showReadonly: OUICConsoleConfig.showReadonlyPropertiesLabelInConsoleEnabled,
                            currentPath: [],
                            currentDisplayedPath: [],
                            hideSummaryValueWhenExpanded: false,
                        }),
                        errorElem
                    );
                });
            }
        } else if ((typeof e === "object" && e !== null) || typeof e === "function") {
            $resultElem.appendChild(
                createExpandableObjectView(e, true, undefined, {
                    showReadonly: OUICConsoleConfig.showReadonlyPropertiesLabelInConsoleEnabled,
                    currentPath: [],
                    currentDisplayedPath: [],
                })
            );
        } else if (typeof e === "symbol") {
            $resultElem.textContent = e.toString();
        } else {
            $resultElem.textContent = JSONB.stringify(e);
        }
        if (
            consoleOverlayTextElement.children.length > 0 &&
            consoleOverlayTextElement.lastChild instanceof HTMLElement &&
            (consoleOverlayTextElement.lastChild?.style?.backgroundColor ?? "") === ($resultElem.style.backgroundColor ?? "")
        ) {
            $resultElem.style.borderTop = "1px solid #888888";
        }
        consoleOverlayTextElement.appendChild($resultElem);
    }
}

/**
 * The contents of the console input field before it was replaced with a history item.
 *
 * @default ""
 */
var savedConsoleInputFieldContents = "";

/**
 * Sets the contents of the console input field to the contents of the nth most recent history item.
 *
 * @param {number} index The index of the history item to set the input field to. It will be bound to be withing the range of the history items, or `-1`. If `-1`, the input field will be restored to what it was before replacing the input field with a history item.
 */
function setConsoleInputFieldContentsToHistoryItem(index: number): void {
    index = Math.max(-1, index);
    if (index === -1) {
        if (currentlySelctedConsoleExecutionHistoryItemIndex === -1) {
            // If the index is -1 and no history item is currently selected, do nothing.
            return;
        }
        // If the index is -1 and a history item is currently selected, restore the input field to what it was before replacing it with a history item.
        consoleOverlayInputFieldElement.value = savedConsoleInputFieldContents;
        // Erase the saved contents to reduce memory usage.
        savedConsoleInputFieldContents = "";
        currentlySelctedConsoleExecutionHistoryItemIndex = -1;
        return;
    }
    if (currentlySelctedConsoleExecutionHistoryItemIndex === -1) {
        // Save the current input field contents before replacing it with a history item
        savedConsoleInputFieldContents = consoleOverlayInputFieldElement.value;
    }
    index = Math.max(0, Math.min(index, ConsoleExecutionHistory.entries.length - 1));
    currentlySelctedConsoleExecutionHistoryItemIndex = index;
    consoleOverlayInputFieldElement.value = ConsoleExecutionHistory.getNthNewestEntry(index)?.code ?? "";
}

/**
 * Shows a context menu.
 *
 * @param {ContextMenuCreationOptions} menu The menu to show.
 * @returns {void}
 */
function showContextMenu(menu: ContextMenuCreationOptions): void {
    window.dispatchEvent(new CustomEvent("ouic-context-menu-open"));
    const menuElement = document.createElement("div");
    menuElement.classList.add("context-menu");
    menuElement.style.position = "fixed";
    menuElement.style.top = `${menu.y}px`;
    menuElement.style.left = `${menu.x}px`;
    let width = menu.width ?? Math.min(window.innerWidth - menu.x, 300);
    let height = menu.height ?? Math.min(window.innerHeight - menu.y, 300);
    if (width > window.innerWidth - menu.x) {
        if (menu.x - width < 0) {
            if (window.innerWidth - menu.x > window.innerWidth - width) {
                width = window.innerWidth - menu.x;
            } else {
                width = window.innerWidth - width;
                // These two CSS property assignments may need to be swapped to be in the if statement instead of the else statement, it has not been tested yet.
                menuElement.style.left = "";
                menuElement.style.right = `${window.innerWidth - menu.x}px`;
            }
        } else {
            menuElement.style.left = "";
            menuElement.style.right = `${window.innerWidth - menu.x}px`;
        }
    }
    if (height > window.innerHeight - menu.y) {
        if (menu.y - height < 0) {
            if (window.innerHeight - menu.y > window.innerHeight - height) {
                height = window.innerHeight - menu.y;
            } else {
                height = window.innerHeight - height;
                // These two CSS property assignments may need to be swapped to be in the if statement instead of the else statement, it has not been tested yet.
                menuElement.style.top = "";
                menuElement.style.bottom = `${window.innerHeight - menu.y}px`;
            }
        } else {
            menuElement.style.top = "";
            menuElement.style.bottom = `${window.innerHeight - menu.y}px`;
        }
    }
    menuElement.style.maxWidth = `${width}px`;
    menuElement.style.maxHeight = `${height}px`;
    menuElement.style.zIndex = "20000000";
    menuElement.style.overflow = "hidden";
    menuElement.style.backgroundColor = "#00000080";
    /**
     * @type {(e: MouseEvent) => void}
     */
    const onClickHandler: (e: MouseEvent) => void = (event): void => {
        if (event.target instanceof Node && !menuElement.contains(event.target) && menuElement !== event.target) {
            closeMenu();
        } else if (event.target instanceof HTMLElement && (menuElement.contains(event.target) || menuElement === event.target)) {
            event.target.querySelectorAll(".context-menu-item-submenu-open").forEach((element) => {
                element.classList.remove("context-menu-item-submenu-open");
                const submenuElement = element.querySelector(".context-menu-submenu");
                if (submenuElement instanceof HTMLElement) submenuElement.style.display = "none";
            });
        }
    };
    window.addEventListener("ouic-context-menu-open", closeMenu);
    function closeMenu(): void {
        menuElement.remove();
        window.removeEventListener("click", onClickHandler);
        window.removeEventListener("ouic-context-menu-open", closeMenu);
    }
    /**
     * Creates a view for a context menu submenu.
     *
     * @param {Extract<ContextMenuItemCreationOptions, { type: "submenu" }>} submenu The submenu to create a view for.
     * @param {number} depth The depth of the submenu.
     * @returns {HTMLElement} The view for the submenu.
     */
    function createContextMenuView(submenu: Extract<ContextMenuItemCreationOptions, { type: "submenu" }>, depth: number): HTMLElement {
        const submenuElement = document.createElement("div");
        submenuElement.classList.add("context-menu-submenu");
        submenuElement.style.position = "fixed";
        submenuElement.style.top = menuElement.style.top;
        submenuElement.style.bottom = menuElement.style.bottom;
        submenuElement.style.left = menuElement.style.left;
        submenuElement.style.right = menuElement.style.right;
        submenuElement.style.width = menuElement.style.width;
        submenuElement.style.height = menuElement.style.height;
        submenuElement.style.zIndex = `${20000000 + depth}`;
        submenuElement.style.backgroundColor = "#00000080";
        submenuElement.setAttribute("title", "");
        submenuElement.style.display = "none";
        const backElement = document.createElement("div");
        backElement.textContent = "< Back";
        backElement.classList.add("context-menu-submenu-back");
        backElement.classList.add("context-menu-item");
        backElement.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            submenuElement.style.display = "none";
            submenuElement.parentElement?.classList.remove("context-menu-item-submenu-open");
        });
        submenuElement.appendChild(backElement);
        submenu.submenu.forEach((item) => {
            submenuElement.appendChild(createContextMenuItem(item, depth));
        });
        return submenuElement;
    }
    /**
     * Creates a view for a context menu item.
     *
     * @param {ContextMenuItemCreationOptions} item The item to create a view for.
     * @param {number} depth The depth of the item.
     * @returns {HTMLElement} The view for the item.
     */
    function createContextMenuItem(item: ContextMenuItemCreationOptions, depth = 0): HTMLElement {
        switch (item.type) {
            case "action":
            case undefined: {
                const itemElement = document.createElement("div");
                itemElement.textContent = item.label;
                // TODO: Implement a custom title tooltip functionality for CoHTML.
                // @ts-ignore: This is for the browser.
                if (item.title) itemElement.title = item.title;
                itemElement.classList.add("context-menu-item-action");
                itemElement.classList.add("context-menu-item");
                if (item.disabled) itemElement.setAttribute("disabled", "");
                itemElement.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    void item.action();
                    closeMenu();
                });
                return itemElement;
            }
            case "separator": {
                const itemElement = document.createElement("hr");
                itemElement.classList.add("context-menu-item-separator");
                itemElement.classList.add("context-menu-item");
                return itemElement;
            }
            case "submenu": {
                const itemElement = document.createElement("div");
                itemElement.classList.add("context-menu-item-submenu");
                itemElement.classList.add("context-menu-item");
                itemElement.textContent = item.label;
                // TODO: Implement a custom title tooltip functionality for CoHTML.
                // @ts-ignore: This is for the browser.
                if (item.title) itemElement.title = item.title;
                if (item.disabled) itemElement.setAttribute("disabled", "");
                const submenuElement = itemElement.appendChild(createContextMenuView(item, depth + 1));
                itemElement.addEventListener("click", (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (item.disabled) return;
                    submenuElement.style.display = "";
                    itemElement.classList.add("context-menu-item-submenu-open");
                });
                return itemElement;
            }
            default:
                throw new TypeError(
                    `Unknown item type in context menu: ${(item as ContextMenuItemCreationOptions).type}`,
                    // Add the cause for browsers.
                    ...([
                        {
                            cause: {
                                item,
                                itemType: (item as ContextMenuItemCreationOptions).type,
                            },
                        },
                    ] as unknown as [])
                );
        }
    }
    menu.items.forEach((item) => {
        menuElement.appendChild(createContextMenuItem(item));
    });
    document.body.appendChild(menuElement);
    window.addEventListener("click", onClickHandler);
}

function quoteStringDynamic(str: string): string {
    const jsonifiedStr: string = JSON.stringify(str);
    return (
        str.includes("'") ?
            str.includes('"') ?
                str.includes("`") ?
                    `'${jsonifiedStr.slice(1, -1).replaceAll('\\"', '"').replaceAll("'", "\\'")}'`
                :   `\`${jsonifiedStr.slice(1, -1).replaceAll('\\"', '"')}\``
            :   jsonifiedStr
        :   `'${jsonifiedStr.slice(1, -1).replaceAll('\\"', '"').replaceAll("'", "\\'")}'`
    );
}

/**
 * Adds a context menu to a primitive value element at the top level of the console.
 *
 * @template {HTMLElement} T
 * @param {string | number | boolean | bigint | symbol | null | undefined} primitiveValue The primitive value to add a context menu to.
 * @param {T} primitiveValueElement The element to add a context menu to.
 * @param {{ copyConsoleMessageStackCallback?: (() => void) | undefined; copyConsoleMessageStackButtonEnabled?: boolean | undefined }} [options] Additional options for the context menu.
 * @returns {T} The element with a context menu added.
 */
function addContextMenuToTopLevelPrimitiveConsoleValue<T extends HTMLElement>(
    primitiveValue: string | number | boolean | bigint | symbol | null | undefined,
    primitiveValueElement: T,
    options?: { copyConsoleMessageStackCallback?: (() => Promise<void> | void) | undefined; copyConsoleMessageStackButtonEnabled?: boolean | undefined }
): T {
    if (typeof primitiveValue === "function") throw new TypeError("Functions are not primitive values.");
    if (typeof primitiveValue === "object" && primitiveValue !== null) throw new TypeError("Non-null objects are not primitive values.");
    /**
     * @type {Omit<ContextMenuCreationOptions, "x" | "y">}
     */
    const contextMenu: Omit<ContextMenuCreationOptions, "x" | "y"> = {
        width: 400,
        height: 600,
        items: [],
    };
    switch (typeof primitiveValue) {
        case "bigint":
            contextMenu.items.push({
                label: "Copy bigint",
                action(): void {
                    copyTextToClipboardAsync(`${primitiveValue}n`).catch((reason: unknown): void => {
                        console.error(new Error("[8CrafterConsole::Copy bigint] An error occured while copying to the clipboard."), reason);
                    });
                },
            });
            break;
        case "boolean":
        case "number":
        case "object": // null
        case "undefined":
            contextMenu.items.push({
                label: `Copy ${typeof primitiveValue}`,
                action(): void {
                    copyTextToClipboardAsync(`${primitiveValue}`).catch((reason: unknown): void => {
                        console.error(new Error(`[8CrafterConsole::Copy ${typeof primitiveValue}] An error occured while copying to the clipboard.`), reason);
                    });
                },
            });
            break;
        case "string":
            contextMenu.items.push(
                {
                    label: "Copy string contents",
                    action(): void {
                        copyTextToClipboardAsync(primitiveValue).catch((reason: unknown): void => {
                            console.error(new Error(`[8CrafterConsole::Copy string contents] An error occured while copying to the clipboard.`), reason);
                        });
                    },
                },
                {
                    label: "Copy string as JavaScript literal",
                    action(): void {
                        copyTextToClipboardAsync(quoteStringDynamic(primitiveValue)).catch((reason: unknown): void => {
                            console.error(
                                new Error(`[8CrafterConsole::Copy string as JavaScript literal] An error occured while copying to the clipboard.`),
                                reason
                            );
                        });
                    },
                },
                {
                    label: "Copy string as JSON literal",
                    action(): void {
                        copyTextToClipboardAsync(JSON.stringify(primitiveValue, null, 4)).catch((reason: unknown): void => {
                            console.error(new Error(`[8CrafterConsole::Copy string as JSON literal] An error occured while copying to the clipboard.`), reason);
                        });
                    },
                }
            );
            break;
        case "function":
        case "symbol":
        default:
            break;
    }
    if (contextMenu.items.length > 0) {
        contextMenu.items.push({
            /**
             * @type {"separator"}
             */
            type: "separator",
        });
    }
    contextMenu.items.push({
        label: "Store as global variable",
        action(): void {
            while (`temp${++__console_last_temp_variable_id__}` in window);
            window[`temp${__console_last_temp_variable_id__}`] = primitiveValue;
            displayStoredConsoleTempVariable(`temp${__console_last_temp_variable_id__}`);
        },
    });
    if (options?.copyConsoleMessageStackCallback) {
        contextMenu.items.push(
            { type: "separator" },
            {
                label: "Copy console message stack",
                action: options.copyConsoleMessageStackCallback,
                disabled: !(options.copyConsoleMessageStackButtonEnabled ?? true),
            }
        );
    }
    /**
     * @type {number | null}
     */
    let clickStartTime: number | null = null;
    primitiveValueElement.addEventListener("mousedown", (event) => {
        if (event.button !== 0) return;
        clickStartTime = Date.now();
    });
    primitiveValueElement.addEventListener("mouseleave", () => {
        clickStartTime = null;
    });
    primitiveValueElement.addEventListener("click", (event) => {
        if (event.button !== 0) return;
        if (clickStartTime !== null && Date.now() - clickStartTime >= 500) {
            event.preventDefault();
            event.stopImmediatePropagation();
            setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
        }
        clickStartTime = null;
    });
    primitiveValueElement.addEventListener("mouseup", (event) => {
        if (event.button !== 2) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
        // showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY });
    });
    return primitiveValueElement;
}

function coherentArrayProxyToArrayReplacer(this: unknown, _key: string, value: unknown): unknown {
    try {
        if (typeof value === "object" && value?.constructor?.name === "CoherentArrayProxy") {
            return Object.defineProperty(Array.from(value as Iterable<unknown>), Symbol.toStringTag, {
                value: "CoherentArrayProxy",
                configurable: true,
                enumerable: false,
                writable: true,
            });
        }
    } catch {}
    return value;
}

const propertyIdentifierRegex = new RegExp(
    // eslint-disable-next-line no-misleading-character-class
    String.raw`^[\u0024\u0041-\u005a\u005f\u0061-\u007a\u00aa\u00b5\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376-\u0377\u037a-\u037d\u037f\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e-\u066f\u0671-\u06d3\u06d5\u06e5-\u06e6\u06ee-\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4-\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0-\u08b2\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098c\u098f-\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc-\u09dd\u09df-\u09e1\u09f0-\u09f1\u0a05-\u0a0a\u0a0f-\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36\u0a38-\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0-\u0ae1\u0b05-\u0b0c\u0b0f-\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b35-\u0b39\u0b3d\u0b5c-\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99-\u0b9a\u0b9c\u0b9e-\u0b9f\u0ba3-\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d\u0c58-\u0c59\u0c60-\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0-\u0ce1\u0cf1-\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60-\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32-\u0e33\u0e40-\u0e46\u0e81-\u0e82\u0e84\u0e87-\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa-\u0eab\u0ead-\u0eb0\u0eb2-\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065-\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191e\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae-\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5-\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309b-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a-\ua62b\ua640-\ua66e\ua67f-\ua69d\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua7ad\ua7b0-\ua7b1\ua7f7-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\ua9e0-\ua9e4\ua9e6-\ua9ef\ua9fa-\ua9fe\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa7e-\uaaaf\uaab1\uaab5-\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab5f\uab64-\uab65\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc][\u0009-\u000d\u0020\u0024\u0030-\u0039\u0041-\u005a\u005f\u0061-\u007a\u00a0\u00aa\u00b5\u00b7\u00ba\u00c0-\u00d6\u00d8-\u00f6\u00f8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0300-\u0374\u0376-\u0377\u037a-\u037d\u037f\u0386-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u0483-\u0487\u048a-\u052f\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05bd\u05bf\u05c1-\u05c2\u05c4-\u05c5\u05c7\u05d0-\u05ea\u05f0-\u05f2\u0610-\u061a\u0620-\u0669\u066e-\u06d3\u06d5-\u06dc\u06df-\u06e8\u06ea-\u06fc\u06ff\u0710-\u074a\u074d-\u07b1\u07c0-\u07f5\u07fa\u0800-\u082d\u0840-\u085b\u08a0-\u08b2\u08e4-\u0963\u0966-\u096f\u0971-\u0983\u0985-\u098c\u098f-\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bc-\u09c4\u09c7-\u09c8\u09cb-\u09ce\u09d7\u09dc-\u09dd\u09df-\u09e3\u09e6-\u09f1\u0a01-\u0a03\u0a05-\u0a0a\u0a0f-\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32-\u0a33\u0a35-\u0a36\u0a38-\u0a39\u0a3c\u0a3e-\u0a42\u0a47-\u0a48\u0a4b-\u0a4d\u0a51\u0a59-\u0a5c\u0a5e\u0a66-\u0a75\u0a81-\u0a83\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2-\u0ab3\u0ab5-\u0ab9\u0abc-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ad0\u0ae0-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b05-\u0b0c\u0b0f-\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32-\u0b33\u0b35-\u0b39\u0b3c-\u0b44\u0b47-\u0b48\u0b4b-\u0b4d\u0b56-\u0b57\u0b5c-\u0b5d\u0b5f-\u0b63\u0b66-\u0b6f\u0b71\u0b82-\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99-\u0b9a\u0b9c\u0b9e-\u0b9f\u0ba3-\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd0\u0bd7\u0be6-\u0bef\u0c00-\u0c03\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c39\u0c3d-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55-\u0c56\u0c58-\u0c59\u0c60-\u0c63\u0c66-\u0c6f\u0c81-\u0c83\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbc-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5-\u0cd6\u0cde\u0ce0-\u0ce3\u0ce6-\u0cef\u0cf1-\u0cf2\u0d01-\u0d03\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d-\u0d44\u0d46-\u0d48\u0d4a-\u0d4e\u0d57\u0d60-\u0d63\u0d66-\u0d6f\u0d7a-\u0d7f\u0d82-\u0d83\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0de6-\u0def\u0df2-\u0df3\u0e01-\u0e3a\u0e40-\u0e4e\u0e50-\u0e59\u0e81-\u0e82\u0e84\u0e87-\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa-\u0eab\u0ead-\u0eb9\u0ebb-\u0ebd\u0ec0-\u0ec4\u0ec6\u0ec8-\u0ecd\u0ed0-\u0ed9\u0edc-\u0edf\u0f00\u0f18-\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e-\u0f47\u0f49-\u0f6c\u0f71-\u0f84\u0f86-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1049\u1050-\u109d\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u135d-\u135f\u1369-\u1371\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u169a\u16a0-\u16ea\u16ee-\u16f8\u1700-\u170c\u170e-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176c\u176e-\u1770\u1772-\u1773\u1780-\u17d3\u17d7\u17dc-\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1820-\u1877\u1880-\u18aa\u18b0-\u18f5\u1900-\u191e\u1920-\u192b\u1930-\u193b\u1946-\u196d\u1970-\u1974\u1980-\u19ab\u19b0-\u19c9\u19d0-\u19da\u1a00-\u1a1b\u1a20-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1aa7\u1ab0-\u1abd\u1b00-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1bf3\u1c00-\u1c37\u1c40-\u1c49\u1c4d-\u1c7d\u1cd0-\u1cd2\u1cd4-\u1cf6\u1cf8-\u1cf9\u1d00-\u1df5\u1dfc-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2000-\u200a\u200c-\u200d\u2028-\u2029\u202f\u203f-\u2040\u2054\u205f\u2071\u207f\u2090-\u209c\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2102\u2107\u210a-\u2113\u2115\u2118-\u211d\u2124\u2126\u2128\u212a-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d7f-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2de0-\u2dff\u3000\u3005-\u3007\u3021-\u302f\u3031-\u3035\u3038-\u303c\u3041-\u3096\u3099-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua62b\ua640-\ua66f\ua674-\ua67d\ua67f-\ua69d\ua69f-\ua6f1\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua7ad\ua7b0-\ua7b1\ua7f7-\ua827\ua840-\ua873\ua880-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f7\ua8fb\ua900-\ua92d\ua930-\ua953\ua960-\ua97c\ua980-\ua9c0\ua9cf-\ua9d9\ua9e0-\ua9fe\uaa00-\uaa36\uaa40-\uaa4d\uaa50-\uaa59\uaa60-\uaa76\uaa7a-\uaac2\uaadb-\uaadd\uaae0-\uaaef\uaaf2-\uaaf6\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uab30-\uab5a\uab5c-\uab5f\uab64-\uab65\uabc0-\uabea\uabec-\uabed\uabf0-\uabf9\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40-\ufb41\ufb43-\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe00-\ufe0f\ufe20-\ufe2d\ufe33-\ufe34\ufe4d-\ufe4f\ufe70-\ufe74\ufe76-\ufefc\ufeff\uff10-\uff19\uff21-\uff3a\uff3f\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc]*$`,
    "u"
);

/**
 * The last used ID for a temporary variable from the console.
 *
 * @default 0n
 */
var __console_last_temp_variable_id__ = 0n;

/**
 * The last used ID for a console expansion arrow.
 *
 * @default 0n
 */
var consoleExpansionArrowID = 0n;

/**
 * Stringifies a symbol if it is not unique (eg. `Symbol.toStringTag` or `Symbol.for("foo")`).
 *
 * If the symbol is unique, it returns `undefined`.
 */
function stringifyNonUniqueSymbol(symbol: symbol): string | undefined {
    if (Symbol.keyFor(symbol) !== undefined) return `Symbol.for(${JSON.stringify(Symbol.keyFor(symbol))})`;
    const wellKnownSymbol = Object.getOwnPropertyNames(Symbol).find(
        (key) => typeof Symbol[key as keyof typeof Symbol] === "symbol" && symbol === Symbol[key as keyof typeof Symbol]
    );
    if (wellKnownSymbol !== undefined) {
        return propertyIdentifierRegex.test(wellKnownSymbol) ? `Symbol.${wellKnownSymbol}` : `Symbol[${JSON.stringify(wellKnownSymbol)}]`;
    }
    return undefined;
}

/**
 * Creates a view for an expandable object for use in the console.
 *
 * @param obj The object to create a view for.
 * @param isRoot Whether the object is the root object. Defaults to `false`.
 * @param forceObjectMode Whether to force the value into object mode. Defaults to `false`.
 * @param options The options for creating the view.
 * @returns The view for the object.
 */
function createExpandableObjectView(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required to allow passing any object/function.
    obj: Record<PropertyKey, any>,
    isRoot = false,
    forceObjectMode = false,
    options?: {
        summaryValueOverride?: string | undefined;
        summaryValueOverride_toStringTag?: string | undefined;
        displayKey?: string | undefined;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required to allow passing any object/function.
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
        preSummaryHTML?: string | { collapsed?: string | undefined; expanded?: string | undefined } | undefined;
    }
): HTMLDivElement {
    const arrowID = (consoleExpansionArrowID++).toString(36);
    const container = document.createElement("div"); /* 
    const arrow = document.createElement("img");
    arrow.style = "float: left; display: inline;";
    arrow.src = "assets/arrowForwardWhite-9acff.png";
    container.appendChild(arrow); */
    let isCoherentArrayProxy = false;
    try {
        isCoherentArrayProxy =
            typeof obj === "object" && obj?.constructor?.name === "CoherentArrayProxy" /*  && obj?.constructor?.constructor?.name === "CoherentArrayProxy" */;
    } catch {}
    const summary = document.createElement("div");
    summary.classList.add("console-value-summary");
    summary.textContent = JSONBConsole.stringify(
        //@ts-ignore
        isCoherentArrayProxy ? Array.from(obj) : obj,
        coherentArrayProxyToArrayReplacer,
        4,
        {
            bigint: true,
            undefined: true,
            Infinity: true,
            NegativeInfinity: true,
            NaN: true,
            get: true,
            set: true,
            function: true,
            class: false,
            includeProtoValues: false,
        },
        { maxLength: 1000, maxDepth: 1, inlineArrays: true, inlineObjects: true, maxPropertyCount: 5, maxLineCount: 5 }
    );
    if (options?.summaryValueOverride) {
        summary.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: ${
            isRoot ? 0 : -22
        }px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${
            arrowID
        }"><p cohinline style="margin: 0; display: inline; white-space: pre${isRoot ? "-wrap" : ""};${
            isRoot ? "" : " overflow: hidden; text-overflow: ellipsis;"
        }" class="summaryCollapsed">${
            typeof options.preSummaryHTML === "object" ? (options.preSummaryHTML?.collapsed ?? "") : (options.preSummaryHTML ?? "")
        }${options.displayKey ? `${options.displayKey}: ` : ""}${
            options.summaryValueOverride_toStringTag ?
                `<i style="display: inline; font-style: italic;">${options.summaryValueOverride_toStringTag
                    .replaceAll("<", "&lt;")
                    .replaceAll(">", "&gt;")}</i> `
            :   ""
        }${options.summaryValueOverride
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\n", "<br />")}</p><p cohinline style="margin: 0; display: inline; white-space: pre${isRoot ? "-wrap" : ""};${
            isRoot ? "" : " overflow: hidden; text-overflow: ellipsis;"
        } display: none;" class="summaryExpanded">${
            typeof options.preSummaryHTML === "object" ? (options.preSummaryHTML?.expanded ?? "") : (options.preSummaryHTML ?? "")
        }}${
            options.displayKey ? `${options.displayKey}:${options.summaryValueOverride_toStringTag ? " " : ""}` : ""
        }${options.summaryValueOverride_toStringTag ? `${options.summaryValueOverride_toStringTag.replaceAll("<", "&lt;").replaceAll(">", "&gt;")}` : ""}</p>`;
    } else if (
        // HACK: Make this actually handle if accessing the constructor/constructor name or Symbol.toStringTag throws an error.
        typeof obj?.[Symbol.toStringTag] === "string" &&
        (typeof obj !== "function" ||
            (obj as AnyFunction & { [Symbol.toStringTag]: string })[Symbol.toStringTag] !== obj.constructor?.name ||
            ![
                Function,
                /* eslint-disable @typescript-eslint/no-empty-function */
                (async (): Promise<void> => {}).constructor,
                function* _(): unknown {}.constructor,
                async function* _(): unknown {}.constructor,
                /* eslint-enable @typescript-eslint/no-empty-function */
            ].includes(obj.constructor))
    ) {
        summary.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: ${
            isRoot ? 0 : -22
        }px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${
            arrowID
        }"><p cohinline style="margin: 0; display: inline; white-space: pre${isRoot ? "-wrap" : ""};${
            isRoot ? "" : " overflow: hidden; text-overflow: ellipsis;"
        }" class="summaryCollapsed">${
            typeof options?.preSummaryHTML === "object" ? (options.preSummaryHTML?.collapsed ?? "") : (options?.preSummaryHTML ?? "")
        }${
            options?.displayKey ? `${options.displayKey}: ` : ""
        }<i style="display: inline; font-style: italic;">${String(obj[Symbol.toStringTag]).replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</i> ${
            summary.textContent?.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br />") ?? "MISSING CONTENTS"
        }</p><p cohinline style="margin: 0; display: inline; white-space: pre${isRoot ? "-wrap" : ""};${
            isRoot ? "" : " overflow: hidden; text-overflow: ellipsis;"
        } display: none;" class="summaryExpanded">${
            typeof options?.preSummaryHTML === "object" ? (options.preSummaryHTML?.expanded ?? "") : (options?.preSummaryHTML ?? "")
        }${options?.displayKey ? `${options.displayKey}: ` : ""}${String(obj[Symbol.toStringTag]).replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p>`;
    } else if (
        obj?.constructor?.name &&
        (typeof obj !== "object" || (obj.constructor !== Array && obj.constructor !== Object)) &&
        (typeof obj !== "function" ||
            ![
                Function,
                /* eslint-disable @typescript-eslint/no-empty-function */
                (async (): Promise<void> => {}).constructor,
                function* _(): unknown {}.constructor,
                async function* _(): unknown {}.constructor,
                /* eslint-enable @typescript-eslint/no-empty-function */
            ].includes(obj.constructor))
    ) {
        // TODO (IMPORTANT): Copy these changes to the other versions.
        summary.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: ${
            isRoot ? 0 : -22
        }px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${
            arrowID
        }"><p${isRoot ? " cohinline" : ""} style="margin: 0; display: inline; white-space: pre${isRoot ? "-wrap" : ""};${
            isRoot ? "" : " overflow: hidden; text-overflow: ellipsis; overflow-wrap: anywhere; flex-shink: 1; flex-direction: row;"
        }" class="summaryCollapsed">${
            typeof options?.preSummaryHTML === "object" ? (options.preSummaryHTML?.collapsed ?? "") : (options?.preSummaryHTML ?? "")
        }${options?.displayKey ? `${options.displayKey}: ` : ""}<i style="display: inline; font-style: italic;">${String(obj.constructor.name)
            .replaceAll("<", "&lt;")
            .replaceAll(
                ">",
                "&gt;"
            )}</i>&nbsp;<span style="margin: 0; white-space: pre; overflow: hidden; text-overflow: ellipsis; flex-shrink: 1; min-width: 0px; flex-direction: column;">${
            summary.textContent?.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br />") ?? "MISSING CONTENTS"
        }</span></p><p cohinline style="margin: 0; display: inline; white-space: pre${isRoot ? "-wrap" : ""}; display: none;" class="summaryExpanded">${
            typeof options?.preSummaryHTML === "object" ? (options.preSummaryHTML?.expanded ?? "") : (options?.preSummaryHTML ?? "")
        }${options?.displayKey ? `${options.displayKey}: ` : ""}${String(obj.constructor.name).replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p>`;
    } else {
        summary.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: ${
            isRoot ? 0 : -22
        }px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${
            arrowID
        }"><p cohinline style="margin: 0; display: inline; white-space: pre${isRoot ? "-wrap" : ""};${
            isRoot ? "" : " overflow: hidden; text-overflow: ellipsis;"
        }" class="summaryCollapsed">${
            typeof options?.preSummaryHTML === "object" ? (options.preSummaryHTML?.collapsed ?? "") : (options?.preSummaryHTML ?? "")
        }${options?.displayKey ? `${options.displayKey}: ` : ""}${
            summary.textContent?.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br />") ?? "MISSING CONTENTS"
        }</p><p cohinline style="margin: 0; display: inline; white-space: pre${isRoot ? "-wrap" : ""};${
            isRoot ? "" : " overflow: hidden; text-overflow: ellipsis;"
        } display: none;" class="summaryExpanded">${
            typeof options?.preSummaryHTML === "object" ? (options.preSummaryHTML?.expanded ?? "") : (options?.preSummaryHTML ?? "")
        }${options?.displayKey ? `${options.displayKey}:` : ""}</p>`;
    }
    for (const targetSummaryElement of [summary.querySelector(".summaryCollapsed"), summary.querySelector(".summaryExpanded")]) {
        if (!(targetSummaryElement instanceof HTMLElement)) continue;
        const evaluatedUponFirstExpandingInfo: HTMLDivElement = document.createElement("div");
        evaluatedUponFirstExpandingInfo.style = "display: none; white-space: pre-wrap; position: relative; left: 0px; top: 0px; height: 100%;";
        evaluatedUponFirstExpandingInfo.classList.add("evaluatedUponFirstExpandingInfo");
        const evaluatedUponFirstExpandingInfoIcon: HTMLImageElement = document.createElement("img");
        evaluatedUponFirstExpandingInfoIcon.style =
            "display: inline; width: 24px; height: 24px; position: relative; left: 0px; top: 50%; margin-top: -12px; margin-bottom: -12px; image-rendering: pixelated;";
        evaluatedUponFirstExpandingInfoIcon.src = "assets/Information_icon.png";
        evaluatedUponFirstExpandingInfoIcon.addEventListener("mouseover", (): void => {
            evaluatedUponFirstExpandingInfoText.style.display = "inline";
        });
        evaluatedUponFirstExpandingInfoIcon.addEventListener("mouseout", (): void => {
            evaluatedUponFirstExpandingInfoText.style.display = "none";
        });
        evaluatedUponFirstExpandingInfo.appendChild(evaluatedUponFirstExpandingInfoIcon);
        const evaluatedUponFirstExpandingInfoText: HTMLSpanElement = document.createElement("span");
        evaluatedUponFirstExpandingInfoText.style =
            "position: absolute; top: -100%; left: 0px; display: none; background-color: #FFFFFFAA; color: #000000FF; pointer-events: none;";
        evaluatedUponFirstExpandingInfoText.textContent = "This value was evaluated upon first expanding. It may have changed since then.";
        evaluatedUponFirstExpandingInfo.appendChild(evaluatedUponFirstExpandingInfoText);
        targetSummaryElement.appendChild(evaluatedUponFirstExpandingInfo);
    }
    summary.style.cursor = "pointer";
    summary.style.display = "block";
    if (isRoot) {
        summary.style.paddingLeft = "22px";
        /**
         * @type {Omit<ContextMenuCreationOptions, "x" | "y">}
         */
        const contextMenu: Omit<ContextMenuCreationOptions, "x" | "y"> = {
            width: 400,
            height: 600,
            items: [
                ...(isRoot && !options?.currentPath?.length ?
                    []
                :   [
                        {
                            label: "Copy property path",
                            action(): void {
                                if (!options?.currentPath?.length) {
                                    console.error("The property path could not be copied to the clipboard as it is not available.");
                                    return;
                                }
                                copyTextToClipboardAsync(
                                    options.currentPath
                                        .map((v, i) => {
                                            if (typeof v === "symbol") {
                                                const nonUniqueSymbolAccessor = stringifyNonUniqueSymbol(v);
                                                if (nonUniqueSymbolAccessor) {
                                                    return `[${nonUniqueSymbolAccessor}]`;
                                                }
                                            }
                                            return (
                                                propertyIdentifierRegex.test(String(v)) ?
                                                    i ? `.${String(v)}`
                                                    :   String(v)
                                                :   `[${JSON.stringify(String(v))}]`
                                            );
                                        })
                                        .join("")
                                ).catch((reason: unknown): void => {
                                    console.error(new Error(`[8CrafterConsole::Copy property path] An error occured while copying to the clipboard.`), reason);
                                });
                            },
                            disabled: !options?.currentPath?.length,
                        } satisfies ContextMenuItemCreationOptions,
                    ]),
                ...(obj instanceof Error ?
                    [
                        {
                            label: "Copy error stack",
                            async action(): Promise<void> {
                                if (!obj.stack) {
                                    console.error("The error stack could not be copied to the clipboard as it is not available.");
                                    return;
                                }
                                const stack = mapStackWithTS(obj.stack);
                                await copyTextToClipboardAsync(stack.hasUnloadedStacks ? await stack.fullyLoadedStack : stack.stack);
                            },
                            title: "test title",
                            disabled: !obj.stack,
                        } satisfies ContextMenuItemCreationOptions,
                    ]
                :   []),
                {
                    label: "Copy object",
                    action(): void {
                        console.error(new Error("[8CrafterConsole::Copy object] Not yet implemented."));
                    },
                    disabled: true,
                },
                {
                    label: "Copy object as JSON literal",
                    action(): void {
                        copyTextToClipboardAsync(JSON.stringify(obj, coherentArrayProxyToArrayReplacer, 4)).catch((reason: unknown): void => {
                            console.error(new Error(`[8CrafterConsole::Copy object as JSON literal] An error occured while copying to the clipboard.`), reason);
                        });
                    },
                },
                {
                    label: "Copy object as JSONB literal",
                    action(): void {
                        copyTextToClipboardAsync(
                            JSONB.stringify(obj, coherentArrayProxyToArrayReplacer, 4, {
                                bigint: true,
                                undefined: true,
                                Infinity: true,
                                NegativeInfinity: true,
                                NaN: true,
                                get: false,
                                set: false,
                                function: true,
                                class: false, // IDEA: Add a button to copy with getters and setters.
                                symbol: true,
                            })
                        ).catch((reason: unknown): void => {
                            console.error(
                                new Error(`[8CrafterConsole::Copy object as JSONB literal] An error occured while copying to the clipboard.`),
                                reason
                            );
                        });
                    },
                },
                {
                    label: "Copy object as JSON literal (+non-enumerable)",
                    action(): void {
                        copyTextToClipboardAsync(
                            JSON.stringify(
                                Object.fromEntries(
                                    [...new Set([...Object.keys(obj), ...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)])].map((key) => [
                                        typeof key === "symbol" ? `$__SYMBOL_${Math.floor(Math.random() * 1000000)}_${key.toString()}__` : key,
                                        obj[key],
                                    ])
                                ),
                                coherentArrayProxyToArrayReplacer,
                                4
                            )
                        ).catch((reason: unknown): void => {
                            console.error(
                                new Error(`[8CrafterConsole::Copy object as JSON literal (+non-enumerable)] An error occured while copying to the clipboard.`),
                                reason
                            );
                        });
                    },
                },
                {
                    label: "Copy object as JSONB literal (+non-enumerable)",
                    action(): void {
                        copyTextToClipboardAsync(
                            JSONB.stringify(
                                Object.fromEntries(
                                    [...new Set([...Object.keys(obj), ...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)])].map((key) => [
                                        typeof key === "symbol" ? `$__SYMBOL_${Math.floor(Math.random() * 1000000)}_${key.toString()}__` : key,
                                        obj[key],
                                    ])
                                ),
                                coherentArrayProxyToArrayReplacer,
                                4,
                                {
                                    bigint: true,
                                    undefined: true,
                                    Infinity: true,
                                    NegativeInfinity: true,
                                    NaN: true,
                                    get: false,
                                    set: false,
                                    function: true,
                                    class: false, // IDEA: Add a button to copy with getters and setters.
                                    symbol: true,
                                }
                            )
                        ).catch((reason: unknown): void => {
                            console.error(
                                new Error(`[8CrafterConsole::Copy object as JSONB literal (+non-enumerable)] An error occured while copying to the clipboard.`),
                                reason
                            );
                        });
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Store as global variable",
                    action(): void {
                        while (`temp${++__console_last_temp_variable_id__}` in window);
                        window[`temp${__console_last_temp_variable_id__}`] = obj;
                        displayStoredConsoleTempVariable(`temp${__console_last_temp_variable_id__}`);
                    },
                },
            ],
        };
        if (options?.copyConsoleMessageStackCallback) {
            contextMenu.items.push(
                { type: "separator" },
                {
                    label: "Copy console message stack",
                    action: options.copyConsoleMessageStackCallback,
                    disabled: !(options.copyConsoleMessageStackButtonEnabled ?? true),
                }
            );
        }
        /**
         * @type {number | null}
         */
        let clickStartTime: number | null = null;
        summary.addEventListener("mousedown", (event) => {
            if (event.button !== 0) return;
            clickStartTime = Date.now();
        });
        summary.addEventListener("mouseleave", () => {
            clickStartTime = null;
        });
        summary.addEventListener("click", (event) => {
            if (event.button !== 0) return;
            if (clickStartTime !== null && Date.now() - clickStartTime >= 500) {
                event.preventDefault();
                event.stopImmediatePropagation();
                setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
            }
            clickStartTime = null;
        });
        summary.addEventListener("mouseup", (event) => {
            if (event.button !== 2) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
        });
    }
    container.appendChild(summary);

    summary.addEventListener("click", (event) => {
        setTimeout(() => {
            if (event.defaultPrevented) return;
            if (container.childNodes.length === 1) {
                try {
                    //@ts-ignore
                    document.getElementById(`consoleExpansionArrow-${arrowID}`).style.transform = "rotateZ(90deg)";
                } catch (e) {
                    console.error(e);
                }

                if (options?.hideSummaryValueWhenExpanded ?? !isRoot) {
                    (summary.getElementsByClassName("summaryCollapsed")[0] as HTMLElement).style.display = "none";
                    (summary.getElementsByClassName("summaryExpanded")[0] as HTMLElement).style.display = "";
                }

                (
                    summary.getElementsByClassName("summaryCollapsed")[0]!.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0] as HTMLElement
                ).style.display = "inline";
                (
                    summary.getElementsByClassName("summaryExpanded")[0]!.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0] as HTMLElement
                ).style.display = "inline";
                const details = document.createElement("div");
                details.classList.add("console-value-details");
                // const t = Date.now(); // DEBUG
                // while (t + 50 > Date.now()); // DEBUG
                /**
                 * @type {(string | number | symbol | { displayName: string; key: string } | { displayName: string; objectKeysSource: Record<PropertyKey, any>; summaryValueOverride?: string | undefined; summaryValueOverride_toStringTag?: string | undefined; propertyName?: string | undefined })[]}
                 */
                const keys: (
                    | string
                    | number
                    | symbol
                    | { displayName: string; key: string }
                    | {
                          displayName: string;
                          objectKeysSource: object;
                          summaryValueOverride?: string | undefined;
                          summaryValueOverride_toStringTag?: string | undefined;
                          propertyName?: string | undefined;
                          hideSummaryValueWhenExpanded?: boolean | undefined;
                      }
                )[] = [
                    ...new Set([
                        //@ts-ignore
                        ...Object.keys(options?.objectKeysSource ?? (isCoherentArrayProxy ? Array.from(obj) : obj)),
                        // Proto values should actually only be included in the `[[Prototype]]` key.
                        // ...(() => {
                        //     try {
                        //         return Object.getOwnPropertyNames(obj.__proto__).filter((key) => {
                        //             try {
                        //                 // Make sure the property won't throw an error when accessed.
                        //                 obj[key];
                        //                 return key in obj;
                        //             } catch (e) {
                        //                 return false;
                        //             }
                        //         });
                        //     } catch (e) {
                        //         return [];
                        //     }
                        // })(),
                        ...Object.getOwnPropertyNames(options?.objectKeysSource ?? obj),
                        ...Object.getOwnPropertySymbols(options?.objectKeysSource ?? obj),
                    ]),
                ];
                if ((options?.objectKeysSource ?? obj)?.__proto__ || Object.getPrototypeOf(options?.objectKeysSource ?? obj)) {
                    keys.push({
                        displayName: "[[Prototype]]",
                        objectKeysSource:
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- This is necessary as in some native objects, __proto__ returns an empty string.
                            (options?.objectKeysSource ?? obj).__proto__ || (Object.getPrototypeOf(options?.objectKeysSource ?? obj) as object),
                        summaryValueOverride:
                            (
                                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- This is necessary as in some native objects, __proto__ returns an empty string
                                ((options?.objectKeysSource ?? obj).__proto__ || (Object.getPrototypeOf(options?.objectKeysSource ?? obj) as object)) !==
                                (options?.objectKeysSource ?? obj)
                            ) ?
                                ((
                                    (options?.objectKeysSource ?? obj).__proto__ || // eslint-disable-line @typescript-eslint/prefer-nullish-coalescing -- This is necessary as in some native objects, __proto__ returns an empty string
                                    (Object.getPrototypeOf(options?.objectKeysSource ?? obj) as object)
                                )?.constructor?.name ?? "Object")
                            :   "circular reference",
                        propertyName: "__proto__",
                        hideSummaryValueWhenExpanded: false,
                    });
                }
                for (const keyRaw of keys) {
                    /**
                     * @type {PropertyKey | Extract<typeof keys[number], { objectKeysSource: object }>}
                     */
                    const key: PropertyKey | Extract<(typeof keys)[number], { objectKeysSource: object }> =
                        ["number", "string", "symbol"].includes(typeof keyRaw) ? (keyRaw as string | number | symbol)
                        : "objectKeysSource" in (keyRaw as object) ? (keyRaw as Extract<typeof keyRaw, { objectKeysSource: object }>)
                        : (keyRaw as Exclude<Extract<typeof keyRaw, object>, { objectKeysSource: object }>).key;
                    /**
                     * @type {string}
                     */
                    const displayName: string =
                        ["number", "string"].includes(typeof keyRaw) ? (keyRaw as string | number).toString()
                        : typeof keyRaw === "symbol" ? keyRaw.toString()
                        : (keyRaw as Extract<typeof keyRaw, object>).displayName;
                    const item = document.createElement("div");
                    item.style.marginLeft = isRoot ? "44px" : "22px";
                    try {
                        if (typeof key === "object") {
                            const expandableObjectView = createExpandableObjectView(obj, false, false, {
                                objectKeysSource: key.objectKeysSource,
                                summaryValueOverride: key.summaryValueOverride,
                                summaryValueOverride_toStringTag: key.summaryValueOverride_toStringTag,
                                copyConsoleMessageStackCallback: options?.copyConsoleMessageStackCallback,
                                copyConsoleMessageStackButtonEnabled: options?.copyConsoleMessageStackButtonEnabled,
                                showReadonly: options?.showReadonly,
                                currentPath: options?.currentPath,
                                currentDisplayedPath: options?.currentDisplayedPath?.concat(displayName),
                                hideSummaryValueWhenExpanded: key.hideSummaryValueWhenExpanded,
                                displayKey: displayName,
                            });
                            // expandableObjectView.children[0]!.children[1]!.insertAdjacentText("afterbegin", `${displayName}: `);
                            // expandableObjectView.children[0]!.children[2]!.insertAdjacentText("afterbegin", `${displayName}: `);
                            item.appendChild(expandableObjectView);
                            /**
                             * @type {Omit<ContextMenuCreationOptions, "x" | "y">}
                             */
                            const contextMenu: Omit<ContextMenuCreationOptions, "x" | "y"> = {
                                width: 400,
                                height: 600,
                                items: [
                                    /* {
                                        label: "Copy property path",
                                        action(): void {
                                            if (!options?.currentPath) {
                                                console.error("The property path could not be copied to the clipboard as it is not available.");
                                                return;
                                            }
                                            copyTextToClipboardAsync(
                                                options.currentPath
                                                    .concat(key)
                                                    .map((v, i) =>
                                                        propertyIdentifierRegex.test(String(v)) ? (i ? "." + String(v) : String(v)) : `[${JSON.stringify(String(v))}]`
                                                    )
                                                    .join("")
                                            );
                                        },
                                        disabled: true,
                                    }, */
                                    {
                                        label: "Copy object",
                                        action(): void {
                                            console.error(new Error("[8CrafterConsole::Copy object] Not yet implemented."));
                                        },
                                        disabled: true,
                                    },
                                    {
                                        label: "Copy object as JSON literal",
                                        action(): void {
                                            copyTextToClipboardAsync(
                                                JSON.stringify(
                                                    Object.fromEntries(
                                                        Object.keys(key.objectKeysSource).map((key) => [
                                                            key,
                                                            ((): unknown => {
                                                                try {
                                                                    return obj[key];
                                                                } catch {}
                                                                return;
                                                            })(),
                                                        ])
                                                    ),
                                                    coherentArrayProxyToArrayReplacer,
                                                    4
                                                )
                                            ).catch((reason: unknown): void => {
                                                console.error(
                                                    new Error(
                                                        `[8CrafterConsole::Copy object as JSON literal] An error occured while copying to the clipboard.`
                                                    ),
                                                    reason
                                                );
                                            });
                                        },
                                    },
                                    {
                                        label: "Copy object as JSONB literal",
                                        action(): void {
                                            copyTextToClipboardAsync(
                                                JSONB.stringify(
                                                    Object.fromEntries(
                                                        Object.keys(key.objectKeysSource).map((key) => [
                                                            key,
                                                            ((): unknown => {
                                                                try {
                                                                    return obj[key];
                                                                } catch {}
                                                                return;
                                                            })(),
                                                        ])
                                                    ),
                                                    coherentArrayProxyToArrayReplacer,
                                                    4,
                                                    {
                                                        bigint: true,
                                                        undefined: true,
                                                        Infinity: true,
                                                        NegativeInfinity: true,
                                                        NaN: true,
                                                        get: false,
                                                        set: false,
                                                        function: true,
                                                        class: false, // IDEA: Add a button to copy with getters and setters.
                                                        symbol: true,
                                                    }
                                                )
                                            ).catch((reason: unknown): void => {
                                                console.error(
                                                    new Error(
                                                        `[8CrafterConsole::Copy object as JSONB literal] An error occured while copying to the clipboard.`
                                                    ),
                                                    reason
                                                );
                                            });
                                        },
                                    },
                                    {
                                        label: "Copy object as JSON literal (+non-enumerable)",
                                        action(): void {
                                            copyTextToClipboardAsync(
                                                JSON.stringify(
                                                    Object.fromEntries(
                                                        [
                                                            ...new Set([
                                                                ...Object.keys(key.objectKeysSource),
                                                                ...Object.getOwnPropertyNames(key.objectKeysSource),
                                                                ...Object.getOwnPropertySymbols(key.objectKeysSource),
                                                            ]),
                                                        ].map((key) => [
                                                            typeof key === "symbol" ?
                                                                `$__SYMBOL_${Math.floor(Math.random() * 1000000)}_${key.toString()}__`
                                                            :   key,
                                                            ((): unknown => {
                                                                try {
                                                                    return obj[key];
                                                                } catch {}
                                                                return;
                                                            })(),
                                                        ])
                                                    ),
                                                    coherentArrayProxyToArrayReplacer,
                                                    4
                                                )
                                            ).catch((reason: unknown): void => {
                                                console.error(
                                                    new Error(
                                                        `[8CrafterConsole::Copy object as JSON literal (+non-enumerable)] An error occured while copying to the clipboard.`
                                                    ),
                                                    reason
                                                );
                                            });
                                        },
                                    },
                                    {
                                        label: "Copy object as JSONB literal (+non-enumerable)",
                                        action(): void {
                                            copyTextToClipboardAsync(
                                                JSONB.stringify(
                                                    Object.fromEntries(
                                                        [
                                                            ...new Set([
                                                                ...Object.keys(key.objectKeysSource),
                                                                ...Object.getOwnPropertyNames(key.objectKeysSource),
                                                                ...Object.getOwnPropertySymbols(key.objectKeysSource),
                                                            ]),
                                                        ].map((key) => [
                                                            typeof key === "symbol" ?
                                                                `$__SYMBOL_${Math.floor(Math.random() * 1000000)}_${key.toString()}__`
                                                            :   key,
                                                            ((): unknown => {
                                                                try {
                                                                    return obj[key];
                                                                } catch {}
                                                                return;
                                                            })(),
                                                        ])
                                                    ),
                                                    coherentArrayProxyToArrayReplacer,
                                                    4,
                                                    {
                                                        bigint: true,
                                                        undefined: true,
                                                        Infinity: true,
                                                        NegativeInfinity: true,
                                                        NaN: true,
                                                        get: false,
                                                        set: false,
                                                        function: true,
                                                        class: false, // IDEA: Add a button to copy with getters and setters.
                                                        symbol: true,
                                                    }
                                                )
                                            ).catch((reason: unknown): void => {
                                                console.error(
                                                    new Error(
                                                        `[8CrafterConsole::Copy object as JSONB literal (+non-enumerable)] An error occured while copying to the clipboard.`
                                                    ),
                                                    reason
                                                );
                                            });
                                        },
                                    },
                                    {
                                        type: "separator",
                                    },
                                    {
                                        label: "Store as global variable",
                                        action(): void {
                                            while (`temp${++__console_last_temp_variable_id__}` in window);
                                            window[`temp${__console_last_temp_variable_id__}`] = key.objectKeysSource;
                                            displayStoredConsoleTempVariable(`temp${__console_last_temp_variable_id__}`);
                                        },
                                    },
                                ],
                            };
                            if (options?.copyConsoleMessageStackCallback) {
                                contextMenu.items.push(
                                    { type: "separator" },
                                    {
                                        label: "Copy console message stack",
                                        action: options.copyConsoleMessageStackCallback,
                                        disabled: !(options.copyConsoleMessageStackButtonEnabled ?? true),
                                    }
                                );
                            }
                            /**
                             * @type {number | null}
                             */
                            let clickStartTime: number | null = null;
                            item.addEventListener("mousedown", (event): void => {
                                if (event.button !== 0) return;
                                clickStartTime = Date.now();
                            });
                            item.addEventListener("mouseleave", () => {
                                clickStartTime = null;
                            });
                            item.addEventListener("click", (event): void => {
                                if (event.button !== 0) return;
                                if (clickStartTime !== null && Date.now() - clickStartTime >= 500) {
                                    event.preventDefault();
                                    event.stopImmediatePropagation();
                                    setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
                                }
                                clickStartTime = null;
                            });
                            item.addEventListener("mouseup", (event): void => {
                                if (event.button !== 2) return;
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
                                // showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY });
                            });
                        } else if (forceObjectMode || (typeof obj[key] === "object" && obj[key] !== null) /*  || typeof obj[key] === "function" */) {
                            let preSummaryHTML: string | undefined;
                            if (options?.showReadonly) {
                                if (Object.getOwnPropertyDescriptor(obj, key)?.writable === false) {
                                    preSummaryHTML = `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;${preSummaryHTML ?? ""}`;
                                }
                            }
                            const expandableObjectView = createExpandableObjectView(obj[key] as object, undefined, undefined, {
                                copyConsoleMessageStackCallback: options?.copyConsoleMessageStackCallback,
                                copyConsoleMessageStackButtonEnabled: options?.copyConsoleMessageStackButtonEnabled,
                                showReadonly: options?.showReadonly,
                                currentPath: options?.currentPath?.concat(key),
                                currentDisplayedPath: options?.currentDisplayedPath?.concat(displayName),
                                displayKey: displayName,
                                preSummaryHTML,
                            });
                            // expandableObjectView.children[0]!.children[1]!.insertAdjacentText("afterbegin", `${displayName}: `);
                            // expandableObjectView.children[0]!.children[2]!.insertAdjacentText("afterbegin", `${displayName}: `);
                            // if (options?.showReadonly) {
                            //     if (Object.getOwnPropertyDescriptor(obj, key)?.writable === false) {
                            //         expandableObjectView.children[0]!.children[1]!.insertAdjacentHTML(
                            //             "afterbegin",
                            //             `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;`
                            //         );
                            //     }
                            // }
                            item.appendChild(expandableObjectView);
                            /**
                             * @type {Omit<ContextMenuCreationOptions, "x" | "y">}
                             */
                            const contextMenu: Omit<ContextMenuCreationOptions, "x" | "y"> = {
                                width: 400,
                                height: 600,
                                items: [
                                    {
                                        label: "Copy property path",
                                        action(): void {
                                            if (!options?.currentPath) {
                                                console.error("The property path could not be copied to the clipboard as it is not available.");
                                                return;
                                            }
                                            copyTextToClipboardAsync(
                                                options.currentPath
                                                    .concat(key)
                                                    .map((v, i) => {
                                                        if (typeof v === "symbol") {
                                                            const nonUniqueSymbolAccessor = stringifyNonUniqueSymbol(v);
                                                            if (nonUniqueSymbolAccessor) {
                                                                return `[${nonUniqueSymbolAccessor}]`;
                                                            }
                                                        }
                                                        return (
                                                            propertyIdentifierRegex.test(String(v)) ?
                                                                i ? `.${String(v)}`
                                                                :   String(v)
                                                            :   `[${JSON.stringify(String(v))}]`
                                                        );
                                                    })
                                                    .join("")
                                            ).catch((reason: unknown): void => {
                                                console.error(
                                                    new Error(`[8CrafterConsole::Copy property path] An error occured while copying to the clipboard.`),
                                                    reason
                                                );
                                            });
                                        },
                                        disabled: !options?.currentPath,
                                    },
                                    ...(typeof key === "symbol" ?
                                        [
                                            {
                                                label: "Store key symbol as global variable",
                                                action(): void {
                                                    while (`temp${++__console_last_temp_variable_id__}` in window);
                                                    window[`temp${__console_last_temp_variable_id__}`] = key;
                                                    displayStoredConsoleTempVariable(`temp${__console_last_temp_variable_id__}`);
                                                },
                                            } satisfies ContextMenuItemCreationOptions,
                                        ]
                                    :   []),
                                    {
                                        label: "Copy object",
                                        action(): void {
                                            console.error(new Error("[8CrafterConsole::Copy object] Not yet implemented."));
                                        },
                                        disabled: true,
                                    },
                                    {
                                        label: "Copy object as JSON literal",
                                        action(): void {
                                            copyTextToClipboardAsync(JSON.stringify(obj[key], coherentArrayProxyToArrayReplacer, 4)).catch(
                                                (reason: unknown): void => {
                                                    console.error(
                                                        new Error(
                                                            `[8CrafterConsole::Copy object as JSON literal] An error occured while copying to the clipboard.`
                                                        ),
                                                        reason
                                                    );
                                                }
                                            );
                                        },
                                    },
                                    {
                                        label: "Copy object as JSONB literal",
                                        action(): void {
                                            copyTextToClipboardAsync(
                                                JSONB.stringify(obj[key], coherentArrayProxyToArrayReplacer, 4, {
                                                    bigint: true,
                                                    undefined: true,
                                                    Infinity: true,
                                                    NegativeInfinity: true,
                                                    NaN: true,
                                                    get: false,
                                                    set: false,
                                                    function: true,
                                                    class: false, // IDEA: Add a button to copy with getters and setters.
                                                    symbol: true,
                                                })
                                            ).catch((reason: unknown): void => {
                                                console.error(
                                                    new Error(
                                                        `[8CrafterConsole::Copy object as JSONB literal] An error occured while copying to the clipboard.`
                                                    ),
                                                    reason
                                                );
                                            });
                                        },
                                    },
                                    {
                                        label: "Copy object as JSON literal (+non-enumerable)",
                                        action(): void {
                                            copyTextToClipboardAsync(
                                                JSON.stringify(
                                                    Object.fromEntries(
                                                        [
                                                            ...new Set([
                                                                ...Object.keys(obj[key] as object),
                                                                ...Object.getOwnPropertyNames(obj[key]),
                                                                ...Object.getOwnPropertySymbols(obj[key]),
                                                            ]),
                                                        ].map((objKey) => [
                                                            typeof objKey === "symbol" ?
                                                                `$__SYMBOL_${Math.floor(Math.random() * 1000000)}_${objKey.toString()}__`
                                                            :   objKey,
                                                            (obj[key] as Record<PropertyKey, unknown>)[objKey],
                                                        ])
                                                    ),
                                                    coherentArrayProxyToArrayReplacer,
                                                    4
                                                )
                                            ).catch((reason: unknown): void => {
                                                console.error(
                                                    new Error(
                                                        `[8CrafterConsole::Copy object as JSON literal (+non-enumerable)] An error occured while copying to the clipboard.`
                                                    ),
                                                    reason
                                                );
                                            });
                                        },
                                    },
                                    {
                                        label: "Copy object as JSONB literal (+non-enumerable)",
                                        action(): void {
                                            copyTextToClipboardAsync(
                                                JSONB.stringify(
                                                    Object.fromEntries(
                                                        [
                                                            ...new Set([
                                                                ...Object.keys(obj[key] as object),
                                                                ...Object.getOwnPropertyNames(obj[key]),
                                                                ...Object.getOwnPropertySymbols(obj[key]),
                                                            ]),
                                                        ].map((objKey) => [
                                                            typeof objKey === "symbol" ?
                                                                `$__SYMBOL_${Math.floor(Math.random() * 1000000)}_${objKey.toString()}__`
                                                            :   objKey,
                                                            (obj[key] as Record<PropertyKey, unknown>)[objKey],
                                                        ])
                                                    ),
                                                    coherentArrayProxyToArrayReplacer,
                                                    4,
                                                    {
                                                        bigint: true,
                                                        undefined: true,
                                                        Infinity: true,
                                                        NegativeInfinity: true,
                                                        NaN: true,
                                                        get: false,
                                                        set: false,
                                                        function: true,
                                                        class: false, // IDEA: Add a button to copy with getters and setters.
                                                        symbol: true,
                                                    }
                                                )
                                            ).catch((reason: unknown): void => {
                                                console.error(
                                                    new Error(
                                                        `[8CrafterConsole::Copy object as JSONB literal (+non-enumerable)] An error occured while copying to the clipboard.`
                                                    ),
                                                    reason
                                                );
                                            });
                                        },
                                    },
                                    {
                                        type: "separator",
                                    },
                                    {
                                        label: "Store as global variable",
                                        action(): void {
                                            while (`temp${++__console_last_temp_variable_id__}` in window);
                                            window[`temp${__console_last_temp_variable_id__}`] = obj[key] as unknown;
                                            displayStoredConsoleTempVariable(`temp${__console_last_temp_variable_id__}`);
                                        },
                                    },
                                ],
                            };
                            if (options?.copyConsoleMessageStackCallback) {
                                contextMenu.items.push(
                                    { type: "separator" },
                                    {
                                        label: "Copy console message stack",
                                        action: options.copyConsoleMessageStackCallback,
                                        disabled: !(options.copyConsoleMessageStackButtonEnabled ?? true),
                                    }
                                );
                            }
                            /**
                             * @type {number | null}
                             */
                            let clickStartTime: number | null = null;
                            item.addEventListener("mousedown", (event): void => {
                                if (event.button !== 0) return;
                                clickStartTime = Date.now();
                            });
                            item.addEventListener("mouseleave", (): void => {
                                clickStartTime = null;
                            });
                            item.addEventListener("click", (event): void => {
                                if (event.button !== 0) return;
                                if (clickStartTime !== null && Date.now() - clickStartTime >= 500) {
                                    event.preventDefault();
                                    event.stopImmediatePropagation();
                                    setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
                                }
                                clickStartTime = null;
                            });
                            item.addEventListener("mouseup", (event): void => {
                                if (event.button !== 2) return;
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
                                // showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY });
                            });
                        } else if (typeof obj[key] === "function") {
                            // const arrowID = (consoleExpansionArrowID++).toString(36);
                            // const funcSummary = document.createElement("span");
                            // let preSummaryLabelHTMLContent = "";
                            // if (options?.showReadonly) {
                            //     if (Object.getOwnPropertyDescriptor(obj, key)?.writable === false) {
                            //         preSummaryLabelHTMLContent = `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;`;
                            //     }
                            // }
                            // funcSummary.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: -22px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${arrowID}">${
                            //     preSummaryLabelHTMLContent ?? ""
                            // }<span style="display: inline; white-space: pre-wrap; display: none;" class="funcSummaryExpanded">${displayName}:</span><span style="display: inline; white-space: pre-wrap;" class="funcSummaryCollapsed">${displayName}: ${JSONBConsole.stringify(
                            //     obj[key],
                            //     coherentArrayProxyToArrayReplacer,
                            //     4,
                            //     {
                            //         bigint: true,
                            //         undefined: true,
                            //         Infinity: true,
                            //         NegativeInfinity: true,
                            //         NaN: true,
                            //         get: true,
                            //         set: true,
                            //         function: true,
                            //         class: false,
                            //         includeProtoValues: false,
                            //     },
                            //     { maxLength: 1000, maxDepth: 1 }
                            // )
                            //     .replaceAll("<", "&lt;")
                            //     .replaceAll(">", "&gt;")
                            //     .replaceAll("\n", `</span><span style="display: inline; white-space: pre-wrap;">`)}</span>`;
                            // funcSummary.style.cursor = "pointer";
                            // const evaluatedUponFirstExpandingInfo = document.createElement("div");
                            // evaluatedUponFirstExpandingInfo.style =
                            //     "display: none; white-space: pre-wrap; position: relative; left: 0px; top: 0px; height: 100%;";
                            // evaluatedUponFirstExpandingInfo.classList.add("evaluatedUponFirstExpandingInfo");
                            // const evaluatedUponFirstExpandingInfoIcon = document.createElement("img");
                            // evaluatedUponFirstExpandingInfoIcon.style =
                            //     "display: inline; width: 24px; height: 24px; position: relative; left: 0px; top: 50%; margin-top: -12px; margin-bottom: -12px; image-rendering: pixelated;";
                            // evaluatedUponFirstExpandingInfoIcon.src = "assets/Information_icon.png";
                            // evaluatedUponFirstExpandingInfoIcon.addEventListener("mouseover", () => {
                            //     evaluatedUponFirstExpandingInfoText.style.display = "inline";
                            // });
                            // evaluatedUponFirstExpandingInfoIcon.addEventListener("mouseout", () => {
                            //     evaluatedUponFirstExpandingInfoText.style.display = "none";
                            // });
                            // evaluatedUponFirstExpandingInfo.appendChild(evaluatedUponFirstExpandingInfoIcon);
                            // const evaluatedUponFirstExpandingInfoText = document.createElement("span");
                            // evaluatedUponFirstExpandingInfoText.style =
                            //     "position: absolute; top: -100%; left: 0px; display: none; background-color: #FFFFFFAA; color: #000000FF; pointer-events: none;";
                            // evaluatedUponFirstExpandingInfoText.textContent = "This value was evaluated upon first expanding. It may have changed since then.";
                            // evaluatedUponFirstExpandingInfo.appendChild(evaluatedUponFirstExpandingInfoText);
                            // //@ts-ignore
                            // funcSummary.lastChild.appendChild(evaluatedUponFirstExpandingInfo);
                            // item.appendChild(funcSummary);
                            let preSummaryHTML: string | undefined;
                            if (options?.showReadonly) {
                                if (Object.getOwnPropertyDescriptor(obj, key)?.writable === false) {
                                    preSummaryHTML = `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;${preSummaryHTML ?? ""}`;
                                }
                            }
                            const expandableObjectView = createExpandableObjectView(obj[key] as object, undefined, undefined, {
                                copyConsoleMessageStackCallback: options?.copyConsoleMessageStackCallback,
                                copyConsoleMessageStackButtonEnabled: options?.copyConsoleMessageStackButtonEnabled,
                                showReadonly: options?.showReadonly,
                                currentPath: options?.currentPath?.concat(key),
                                currentDisplayedPath: options?.currentDisplayedPath?.concat(displayName),
                                includeViewableToString: true,
                                hideSummaryValueWhenExpanded: false,
                                displayKey: displayName,
                                preSummaryHTML,
                            });
                            // expandableObjectView.children[0]!.children[1]!.insertAdjacentText("afterbegin", `${displayName}: `);
                            // expandableObjectView.children[0]!.children[2]!.insertAdjacentText("afterbegin", `${displayName}: `);
                            // if (options?.showReadonly) {
                            //     if (Object.getOwnPropertyDescriptor(obj, key)?.writable === false) {
                            //         expandableObjectView.children[0]!.children[1]!.insertAdjacentHTML(
                            //             "afterbegin",
                            //             `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;`
                            //         );
                            //     }
                            // }
                            item.appendChild(expandableObjectView);
                            /**
                             * @type {Omit<ContextMenuCreationOptions, "x" | "y">}
                             */
                            const contextMenu: Omit<ContextMenuCreationOptions, "x" | "y"> = {
                                width: 400,
                                height: 600,
                                items: [
                                    {
                                        label: "Copy property path",
                                        action(): void {
                                            if (!options?.currentPath) {
                                                console.error("The property path could not be copied to the clipboard as it is not available.");
                                                return;
                                            }
                                            copyTextToClipboardAsync(
                                                options.currentPath
                                                    .concat(key)
                                                    .map((v, i) => {
                                                        if (typeof v === "symbol") {
                                                            const nonUniqueSymbolAccessor = stringifyNonUniqueSymbol(v);
                                                            if (nonUniqueSymbolAccessor) {
                                                                return `[${nonUniqueSymbolAccessor}]`;
                                                            }
                                                        }
                                                        return (
                                                            propertyIdentifierRegex.test(String(v)) ?
                                                                i ? `.${String(v)}`
                                                                :   String(v)
                                                            :   `[${JSON.stringify(String(v))}]`
                                                        );
                                                    })
                                                    .join("")
                                            ).catch((reason: unknown): void => {
                                                console.error(
                                                    new Error(`[8CrafterConsole::Copy property path] An error occured while copying to the clipboard.`),
                                                    reason
                                                );
                                            });
                                        },
                                        disabled: !options?.currentPath,
                                    },
                                    ...(typeof key === "symbol" ?
                                        [
                                            {
                                                label: "Store key symbol as global variable",
                                                action(): void {
                                                    while (`temp${++__console_last_temp_variable_id__}` in window);
                                                    window[`temp${__console_last_temp_variable_id__}`] = key;
                                                    displayStoredConsoleTempVariable(`temp${__console_last_temp_variable_id__}`);
                                                },
                                            } satisfies ContextMenuItemCreationOptions,
                                        ]
                                    :   []),
                                    {
                                        label: "Copy stringified function",
                                        action(): void {
                                            copyTextToClipboardAsync((obj[key] as () => void).toString()).catch((reason: unknown): void => {
                                                console.error(
                                                    new Error(`[8CrafterConsole::Copy stringified function] An error occured while copying to the clipboard.`),
                                                    reason
                                                );
                                            });
                                        },
                                    },
                                    {
                                        label: "Copy function as JSONB literal",
                                        action(): void {
                                            copyTextToClipboardAsync(
                                                JSONB.stringify(obj[key], null, 4, {
                                                    bigint: true,
                                                    undefined: true,
                                                    Infinity: true,
                                                    NegativeInfinity: true,
                                                    NaN: true,
                                                    get: false,
                                                    set: false,
                                                    function: true,
                                                    class: false, // IDEA: Add a button to copy with getters and setters.
                                                })
                                            ).catch((reason: unknown): void => {
                                                console.error(
                                                    new Error(
                                                        `[8CrafterConsole::Copy function as JSONB literal] An error occured while copying to the clipboard.`
                                                    ),
                                                    reason
                                                );
                                            });
                                        },
                                    },
                                    {
                                        type: "separator",
                                    },
                                    {
                                        label: "Store as global variable",
                                        action(): void {
                                            while (`temp${++__console_last_temp_variable_id__}` in window);
                                            window[`temp${__console_last_temp_variable_id__}`] = obj[key] as unknown;
                                            displayStoredConsoleTempVariable(`temp${__console_last_temp_variable_id__}`);
                                        },
                                    },
                                ],
                            };
                            if (options?.copyConsoleMessageStackCallback) {
                                contextMenu.items.push(
                                    { type: "separator" },
                                    {
                                        label: "Copy console message stack",
                                        action: options.copyConsoleMessageStackCallback,
                                        disabled: !(options.copyConsoleMessageStackButtonEnabled ?? true),
                                    }
                                );
                            }
                            /**
                             * @type {number | null}
                             */
                            let clickStartTime: number | null = null;
                            item.addEventListener("mousedown", (event): void => {
                                if (event.button !== 0) return;
                                clickStartTime = Date.now();
                            });
                            item.addEventListener("mouseleave", (): void => {
                                clickStartTime = null;
                            });
                            item.addEventListener("click", (event): void => {
                                if (event.button !== 0) return;
                                if (clickStartTime !== null && Date.now() - clickStartTime >= 500) {
                                    event.preventDefault();
                                    event.stopImmediatePropagation();
                                    setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
                                }
                                clickStartTime = null;
                            });
                            item.addEventListener("mouseup", (event): void => {
                                if (event.button !== 2) return;
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
                                // showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY });
                            });
                            // /**
                            //  * @type {number | null}
                            //  */
                            // let clickStartTime: number | null = null;
                            // funcSummary.addEventListener("mousedown", (event) => {
                            //     if (event.button !== 0) return;
                            //     clickStartTime = Date.now();
                            // });
                            // funcSummary.addEventListener("mouseleave", () => {
                            //     clickStartTime = null;
                            // });
                            // funcSummary.addEventListener("click", (event) => {
                            //     if (event.button !== 0) return;
                            //     if (clickStartTime !== null && Date.now() - clickStartTime >= 500) {
                            //         event.preventDefault();
                            //         event.stopImmediatePropagation();
                            //         setTimeout(() => showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
                            //     }
                            //     clickStartTime = null;
                            // });
                            // funcSummary.addEventListener("mouseup", (event) => {
                            //     if (event.button !== 2) return;
                            //     event.preventDefault();
                            //     event.stopImmediatePropagation();
                            //     setTimeout(() => showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
                            //     // showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY });
                            // });

                            // funcSummary.addEventListener("click", () => {
                            //     if (event.defaultPrevented) return;
                            //     if (funcSummary.nextSibling) {
                            //         //@ts-expect-error
                            //         document.getElementById(`consoleExpansionArrow-${arrowID}`).style.transform = "rotateZ(0deg)";
                            //         //@ts-expect-error
                            //         funcSummary.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0].style.display = "none";
                            //         (funcSummary.getElementsByClassName("funcSummaryExpanded")[0] as HTMLElement).style.display = "none";
                            //         (funcSummary.getElementsByClassName("funcSummaryCollapsed")[0] as HTMLElement).style.display = "";
                            //         funcSummary.nextSibling.remove();
                            //     } else {
                            //         //@ts-expect-error
                            //         document.getElementById(`consoleExpansionArrow-${arrowID}`).style.transform = "rotateZ(90deg)";
                            //         //@ts-expect-error
                            //         funcSummary.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0].style.display = "inline";
                            //         (funcSummary.getElementsByClassName("funcSummaryCollapsed")[0] as HTMLElement).style.display = "none";
                            //         (funcSummary.getElementsByClassName("funcSummaryExpanded")[0] as HTMLElement).style.display = "";
                            //         const funcDetails = document.createElement("div");
                            //         const funcName = document.createElement("div");
                            //         funcName.textContent = `name: ${obj[key].name}`;
                            //         funcName.style.marginLeft = "44px";
                            //         funcName.style.whiteSpace = "pre-wrap";
                            //         funcName.style.display = "inline";
                            //         if (options?.showReadonly) {
                            //             if (Object.getOwnPropertyDescriptor(obj[key], "name")?.writable === false) {
                            //                 funcName.insertAdjacentHTML(
                            //                     "afterbegin",
                            //                     `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;`
                            //                 );
                            //             }
                            //         }
                            //         funcDetails.appendChild(funcName);
                            //         const funcLength = document.createElement("div");
                            //         funcLength.textContent = `length: ${obj[key].length}`;
                            //         funcLength.style.marginLeft = "44px";
                            //         funcName.style.whiteSpace = "pre-wrap";
                            //         // funcName.style.display = "inline"; // DEBUG
                            //         if (options?.showReadonly) {
                            //             if (Object.getOwnPropertyDescriptor(obj[key], "length")?.writable === false) {
                            //                 funcLength.insertAdjacentHTML(
                            //                     "afterbegin",
                            //                     `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;`
                            //                 );
                            //             }
                            //         }
                            //         funcDetails.appendChild(funcLength);
                            //         const arrowIDB = (consoleExpansionArrowID++).toString(36);
                            //         const funcToStringContainer = document.createElement("div");
                            //         const funcToString = document.createElement("span");
                            //         funcToString.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: 22px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${arrowIDB}"><span style="display: inline; white-space: pre-wrap;">toString: ƒ toString()</span>`;
                            //         funcToString.style.cursor = "pointer";
                            //         funcToString.style.marginLeft = "44px";
                            //         if (options?.showReadonly) {
                            //             if (Object.getOwnPropertyDescriptor(obj[key], "length")?.writable === false) {
                            //                 funcToString.insertAdjacentHTML(
                            //                     "afterbegin",
                            //                     `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;`
                            //                 );
                            //             }
                            //         }
                            //         const evaluatedUponFirstExpandingInfo = document.createElement("div");
                            //         evaluatedUponFirstExpandingInfo.style =
                            //             "display: none; white-space: pre-wrap; position: relative; left: 0px; top: 0px; height: 100%;";
                            //         evaluatedUponFirstExpandingInfo.classList.add("evaluatedUponFirstExpandingInfo");
                            //         const evaluatedUponFirstExpandingInfoIcon = document.createElement("img");
                            //         evaluatedUponFirstExpandingInfoIcon.style =
                            //             "display: inline; width: 24px; height: 24px; position: relative; left: 0px; top: 50%; margin-top: -12px; margin-bottom: -12px; image-rendering: pixelated;";
                            //         evaluatedUponFirstExpandingInfoIcon.src = "assets/Information_icon.png";
                            //         evaluatedUponFirstExpandingInfoIcon.addEventListener("mouseover", () => {
                            //             evaluatedUponFirstExpandingInfoText.style.display = "inline";
                            //         });
                            //         evaluatedUponFirstExpandingInfoIcon.addEventListener("mouseout", () => {
                            //             evaluatedUponFirstExpandingInfoText.style.display = "none";
                            //         });
                            //         evaluatedUponFirstExpandingInfo.appendChild(evaluatedUponFirstExpandingInfoIcon);
                            //         const evaluatedUponFirstExpandingInfoText = document.createElement("span");
                            //         evaluatedUponFirstExpandingInfoText.style =
                            //             "position: absolute; top: -100%; left: 0px; display: none; background-color: #FFFFFFAA; color: #000000FF; pointer-events: none;";
                            //         evaluatedUponFirstExpandingInfoText.textContent =
                            //             "This value was evaluated upon first expanding. It may have changed since then.";
                            //         evaluatedUponFirstExpandingInfo.appendChild(evaluatedUponFirstExpandingInfoText);
                            //         funcToString.appendChild(evaluatedUponFirstExpandingInfo);
                            //         funcToStringContainer.appendChild(funcToString);
                            //         funcDetails.appendChild(funcToStringContainer);
                            //         Object.getOwnPropertyNames(obj[key]).forEach((property) => {
                            //             try {
                            //                 const propertyDetails = document.createElement("div");
                            //                 propertyDetails.textContent = `${property.toString()}: ${JSONB.stringify(obj[key][property], undefined, undefined, {
                            //                     bigint: true,
                            //                     undefined: true,
                            //                     Infinity: true,
                            //                     NegativeInfinity: true,
                            //                     NaN: true,
                            //                     get: true,
                            //                     set: true,
                            //                     function: true,
                            //                     class: false,
                            //                     symbol: true,
                            //                 })}`;
                            //                 propertyDetails.style.marginLeft = "44px";
                            //                 if (options?.showReadonly) {
                            //                     if (Object.getOwnPropertyDescriptor(obj[key], "name")?.writable === false) {
                            //                         propertyDetails.insertAdjacentHTML(
                            //                             "afterbegin",
                            //                             `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;`
                            //                         );
                            //                     }
                            //                 }
                            //                 funcDetails.appendChild(propertyDetails);
                            //             } catch (e) {
                            //                 console.error(e);
                            //             }
                            //         });
                            //         Object.getOwnPropertySymbols(obj[key]).forEach((symbol) => {
                            //             try {
                            //                 const symbolDetails = document.createElement("div");
                            //                 symbolDetails.textContent = `${symbol.toString()}: ${JSONB.stringify(obj[key][symbol], undefined, undefined, {
                            //                     bigint: true,
                            //                     undefined: true,
                            //                     Infinity: true,
                            //                     NegativeInfinity: true,
                            //                     NaN: true,
                            //                     get: true,
                            //                     set: true,
                            //                     function: true,
                            //                     class: false,
                            //                     symbol: true,
                            //                 })}`;
                            //                 symbolDetails.style.marginLeft = "44px";
                            //                 if (options?.showReadonly) {
                            //                     if (Object.getOwnPropertyDescriptor(obj[key], "name")?.writable === false) {
                            //                         symbolDetails.insertAdjacentHTML(
                            //                             "afterbegin",
                            //                             `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;`
                            //                         );
                            //                     }
                            //                 }
                            //                 funcDetails.appendChild(symbolDetails);
                            //             } catch (e) {
                            //                 console.error(e);
                            //             }
                            //         });

                            //         if (obj[key].__proto__) {
                            //             try {
                            //                 const prototypeExpandableObjectView = createExpandableObjectView(obj[key], false, true, {
                            //                     displayKey: "[[Prototype]]",
                            //                     objectKeysSource: obj[key].__proto__,
                            //                     summaryValueOverride:
                            //                         (options?.objectKeysSource ?? obj).__proto__ !== (options?.objectKeysSource ?? obj)
                            //                             ? "Object"
                            //                             : "circular reference",
                            //                     copyConsoleMessageStackCallback: options?.copyConsoleMessageStackCallback,
                            //                     copyConsoleMessageStackButtonEnabled: options?.copyConsoleMessageStackButtonEnabled,
                            //                     showReadonly: options?.showReadonly,
                            //                     currentPath: options?.currentPath,
                            //                     currentDisplayedPath: options?.currentDisplayedPath?.concat("[[Prototype]]"),
                            //                 });
                            //                 // prototypeExpandableObjectView.children[0]!.children[1]!.insertAdjacentText("afterbegin", `[[Prototype]]: `);
                            //                 // prototypeExpandableObjectView.children[0]!.children[2]!.insertAdjacentText("afterbegin", `[[Prototype]]: `);
                            //                 prototypeExpandableObjectView.style.marginLeft = "44px";
                            //                 if (options?.showReadonly) {
                            //                     if (Object.getOwnPropertyDescriptor(obj[key], "__proto__")?.writable === false) {
                            //                         funcName.insertAdjacentHTML(
                            //                             "afterbegin",
                            //                             `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;`
                            //                         );
                            //                     }
                            //                 }
                            //                 funcDetails.appendChild(prototypeExpandableObjectView);
                            //             } catch (e) {
                            //                 console.error(e);
                            //             }
                            //         } else {
                            //             console.warn(`No prototype found for ${displayName}`);
                            //         }

                            //         funcToString.addEventListener("click", () => {
                            //             if (funcToString.nextSibling) {
                            //                 //@ts-expect-error
                            //                 document.getElementById(`consoleExpansionArrow-${arrowIDB}`).style.transform = "rotateZ(0deg)";
                            //                 //@ts-expect-error
                            //                 funcToString.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0].style.display = "none";
                            //                 funcToString.nextSibling.remove();
                            //             } else {
                            //                 //@ts-expect-error
                            //                 document.getElementById(`consoleExpansionArrow-${arrowIDB}`).style.transform = "rotateZ(90deg)";
                            //                 //@ts-expect-error
                            //                 funcToString.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0].style.display = "inline";
                            //                 const funcSource = document.createElement("pre");
                            //                 funcSource.classList.add("funcSource");
                            //                 funcSource.textContent = obj[key].toString();
                            //                 funcSource.style.marginLeft = "88px";
                            //                 funcToStringContainer.appendChild(funcSource);
                            //             }
                            //         });

                            //         item.appendChild(funcDetails);
                            //     }
                            // });
                        } else {
                            item.textContent = `${displayName}: ${JSONB.stringify(obj[key], undefined, undefined, {
                                bigint: true,
                                undefined: true,
                                Infinity: true,
                                NegativeInfinity: true,
                                NaN: true,
                                get: true,
                                set: true,
                                function: true,
                                class: false,
                                symbol: true,
                            })}`;
                            if (options?.showReadonly) {
                                if (Object.getOwnPropertyDescriptor(obj, key)?.writable === false) {
                                    item.insertAdjacentHTML("afterbegin", `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;`);
                                }
                            }
                            /**
                             * @type {Omit<ContextMenuCreationOptions, "x" | "y">}
                             */
                            const contextMenu: Omit<ContextMenuCreationOptions, "x" | "y"> = {
                                width: 400,
                                height: 600,
                                items: [
                                    {
                                        label: "Copy property path",
                                        action(): void {
                                            if (!options?.currentPath) {
                                                console.error("The property path could not be copied to the clipboard as it is not available.");
                                                return;
                                            }
                                            copyTextToClipboardAsync(
                                                options.currentPath
                                                    .concat(key)
                                                    .map((v, i) => {
                                                        if (typeof v === "symbol") {
                                                            const nonUniqueSymbolAccessor = stringifyNonUniqueSymbol(v);
                                                            if (nonUniqueSymbolAccessor) {
                                                                return `[${nonUniqueSymbolAccessor}]`;
                                                            }
                                                        }
                                                        return (
                                                            propertyIdentifierRegex.test(String(v)) ?
                                                                i ? `.${String(v)}`
                                                                :   String(v)
                                                            :   `[${JSON.stringify(String(v))}]`
                                                        );
                                                    })
                                                    .join("")
                                            ).catch((reason: unknown): void => {
                                                console.error(
                                                    new Error(`[8CrafterConsole::Copy property path] An error occured while copying to the clipboard.`),
                                                    reason
                                                );
                                            });
                                        },
                                        disabled: !options?.currentPath,
                                    },
                                    ...(typeof key === "symbol" ?
                                        [
                                            {
                                                label: "Store key symbol as global variable",
                                                action(): void {
                                                    while (`temp${++__console_last_temp_variable_id__}` in window);
                                                    window[`temp${__console_last_temp_variable_id__}`] = key;
                                                    displayStoredConsoleTempVariable(`temp${__console_last_temp_variable_id__}`);
                                                },
                                            } satisfies ContextMenuItemCreationOptions,
                                        ]
                                    :   []),
                                    ...(typeof obj[key] === "bigint" ?
                                        [
                                            {
                                                label: "Copy bigint",
                                                action(): void {
                                                    copyTextToClipboardAsync(`${obj[key]}n`).catch((reason: unknown): void => {
                                                        console.error(
                                                            new Error(`[8CrafterConsole::Copy bigint] An error occured while copying to the clipboard.`),
                                                            reason
                                                        );
                                                    });
                                                },
                                            },
                                        ]
                                    : (
                                        [
                                            "boolean",
                                            "number",
                                            "object", // null
                                            "undefined",
                                        ].includes(typeof obj[key])
                                    ) ?
                                        [
                                            {
                                                label: `Copy ${typeof obj[key]}`,
                                                action(): void {
                                                    copyTextToClipboardAsync(`${obj[key]}`).catch((reason: unknown): void => {
                                                        console.error(
                                                            new Error(
                                                                `[8CrafterConsole::Copy ${typeof obj[key]}] An error occured while copying to the clipboard.`
                                                            ),
                                                            reason
                                                        );
                                                    });
                                                },
                                            },
                                        ]
                                    : typeof obj[key] === "string" ?
                                        [
                                            {
                                                label: "Copy string contents",
                                                action(): void {
                                                    copyTextToClipboardAsync(obj[key] as string).catch((reason: unknown): void => {
                                                        console.error(
                                                            new Error(
                                                                `[8CrafterConsole::Copy string contents] An error occured while copying to the clipboard.`
                                                            ),
                                                            reason
                                                        );
                                                    });
                                                },
                                            },
                                            {
                                                label: "Copy string as JavaScript literal",
                                                action(): void {
                                                    /**
                                                     * @type {string}
                                                     */
                                                    const str: string = obj[key] as string;
                                                    /**
                                                     * @type {string}
                                                     */
                                                    const jsonifiedStr: string = JSON.stringify(str);
                                                    copyTextToClipboardAsync(
                                                        str.includes("'") ?
                                                            str.includes('"') ?
                                                                str.includes("`") ?
                                                                    `'${jsonifiedStr.slice(1, -1).replaceAll('\\"', '"').replaceAll("'", "\\'")}'`
                                                                :   `\`${jsonifiedStr.slice(1, -1).replaceAll('\\"', '"')}\``
                                                            :   jsonifiedStr
                                                        :   `'${jsonifiedStr.slice(1, -1).replaceAll('\\"', '"').replaceAll("'", "\\'")}'`
                                                    ).catch((reason: unknown): void => {
                                                        console.error(
                                                            new Error(
                                                                `[8CrafterConsole::Copy string as JavaScript literal] An error occured while copying to the clipboard.`
                                                            ),
                                                            reason
                                                        );
                                                    });
                                                },
                                            },
                                            {
                                                label: "Copy string as JSON literal",
                                                action(): void {
                                                    copyTextToClipboardAsync(JSON.stringify(obj[key], null, 4)).catch((reason: unknown): void => {
                                                        console.error(
                                                            new Error(
                                                                `[8CrafterConsole::Copy string as JSON literal] An error occured while copying to the clipboard.`
                                                            ),
                                                            reason
                                                        );
                                                    });
                                                },
                                            },
                                        ]
                                    :   []),
                                    {
                                        type: "separator",
                                    },
                                    {
                                        label: "Store as global variable",
                                        action(): void {
                                            while (`temp${++__console_last_temp_variable_id__}` in window);
                                            window[`temp${__console_last_temp_variable_id__}`] = obj[key] as unknown;
                                            displayStoredConsoleTempVariable(`temp${__console_last_temp_variable_id__}`);
                                        },
                                    },
                                ],
                            };
                            if (options?.copyConsoleMessageStackCallback) {
                                contextMenu.items.push(
                                    { type: "separator" },
                                    {
                                        label: "Copy console message stack",
                                        action: options.copyConsoleMessageStackCallback,
                                        disabled: !(options.copyConsoleMessageStackButtonEnabled ?? true),
                                    }
                                );
                            }
                            /**
                             * @type {number | null}
                             */
                            let clickStartTime: number | null = null;
                            item.addEventListener("mousedown", (event): void => {
                                if (event.button !== 0) return;
                                clickStartTime = Date.now();
                            });
                            item.addEventListener("mouseleave", (): void => {
                                clickStartTime = null;
                            });
                            item.addEventListener("click", (event): void => {
                                if (event.button !== 0) return;
                                if (clickStartTime !== null && Date.now() - clickStartTime >= 500) {
                                    event.preventDefault();
                                    event.stopImmediatePropagation();
                                    setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
                                }
                                clickStartTime = null;
                            });
                            item.addEventListener("mouseup", (event): void => {
                                if (event.button !== 2) return;
                                event.preventDefault();
                                event.stopImmediatePropagation();
                                setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
                                // showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY });
                            });
                        }
                        details.appendChild(item);
                    } catch (e: unknown) {
                        // $resultElem.innerHTML = (await shiki.codeToHtml(`{"default": {…}}`, { lang: "js", theme: "dark-plus" })).replaceAll("<span", "<span cohinline=\"\""); // TODO: Test this.
                        const arrowIDB = (consoleExpansionArrowID++).toString(36);
                        const exceptionExpandableObjectViewContainer = document.createElement("div");
                        const exceptionExpandableObjectView = document.createElement("span");
                        exceptionExpandableObjectView.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: -22px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${
                            arrowIDB
                        }"><p cohinline style="margin: 0; display: inline; white-space: pre;" class="summaryCollapsed">${displayName}: <i style="display: inline; font-style: italic;">${String(
                            (e as Record<PropertyKey, unknown> | undefined)?.["name"] ??
                                (typeof (e as Record<PropertyKey, unknown> | undefined)?.[Symbol.toStringTag] === "string" ?
                                    (e as Record<PropertyKey, unknown>)[Symbol.toStringTag]
                                :   undefined)
                        )
                            .replaceAll("<", "&lt;")
                            .replaceAll(">", "&gt;")}</i> (Exception)</p>`;
                        exceptionExpandableObjectView.style.cursor = "pointer";
                        if (options?.showReadonly) {
                            if (
                                (typeof key === "object" ?
                                    key.propertyName !== undefined ?
                                        Object.getOwnPropertyDescriptor(obj, key.propertyName)
                                    :   undefined
                                :   Object.getOwnPropertyDescriptor(obj, key)
                                )?.writable === false
                            ) {
                                exceptionExpandableObjectView.insertAdjacentHTML(
                                    "afterbegin",
                                    `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;`
                                );
                            }
                        }
                        const evaluatedUponFirstExpandingInfo = document.createElement("div");
                        evaluatedUponFirstExpandingInfo.style = "display: none; white-space: pre-wrap; position: relative; left: 0px; top: 0px; height: 100%;";
                        evaluatedUponFirstExpandingInfo.classList.add("evaluatedUponFirstExpandingInfo");
                        const evaluatedUponFirstExpandingInfoIcon = document.createElement("img");
                        evaluatedUponFirstExpandingInfoIcon.style =
                            "display: inline; width: 24px; height: 24px; position: relative; left: 0px; top: 50%; margin-top: -12px; margin-bottom: -12px; image-rendering: pixelated;";
                        evaluatedUponFirstExpandingInfoIcon.src = "assets/Information_icon.png";
                        evaluatedUponFirstExpandingInfoIcon.addEventListener("mouseover", () => {
                            evaluatedUponFirstExpandingInfoText.style.display = "inline";
                        });
                        evaluatedUponFirstExpandingInfoIcon.addEventListener("mouseout", () => {
                            evaluatedUponFirstExpandingInfoText.style.display = "none";
                        });
                        evaluatedUponFirstExpandingInfo.appendChild(evaluatedUponFirstExpandingInfoIcon);
                        const evaluatedUponFirstExpandingInfoText = document.createElement("span");
                        evaluatedUponFirstExpandingInfoText.style =
                            "position: absolute; top: -100%; left: 0px; display: none; background-color: #FFFFFFAA; color: #000000FF; pointer-events: none;";
                        evaluatedUponFirstExpandingInfoText.textContent = "This value was evaluated upon first expanding. It may have changed since then.";
                        evaluatedUponFirstExpandingInfo.appendChild(evaluatedUponFirstExpandingInfoText);
                        exceptionExpandableObjectView.appendChild(evaluatedUponFirstExpandingInfo);
                        exceptionExpandableObjectViewContainer.appendChild(exceptionExpandableObjectView);
                        details.appendChild(exceptionExpandableObjectViewContainer);
                        exceptionExpandableObjectView.addEventListener("click", () => {
                            if (exceptionExpandableObjectView.nextSibling) {
                                document.getElementById(`consoleExpansionArrow-${arrowIDB}`)!.style.transform = "rotateZ(0deg)";
                                (exceptionExpandableObjectView.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0] as HTMLElement).style.display =
                                    "none";
                                exceptionExpandableObjectView.nextSibling.remove();
                            } else {
                                document.getElementById(`consoleExpansionArrow-${arrowIDB}`)!.style.transform = "rotateZ(90deg)";
                                (exceptionExpandableObjectView.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0] as HTMLElement).style.display =
                                    "inline";
                                if (e instanceof Error) {
                                    const stack = e.stack === undefined ? undefined : mapStackWithTS(e.stack);

                                    const errorElem = exceptionExpandableObjectViewContainer.appendChild(
                                        createExpandableObjectView(e, true, false, {
                                            summaryValueOverride: stack?.stack ?? e.stack,
                                            copyConsoleMessageStackCallback: options?.copyConsoleMessageStackCallback,
                                            copyConsoleMessageStackButtonEnabled: options?.copyConsoleMessageStackButtonEnabled,
                                            showReadonly: options?.showReadonly,
                                            currentPath: [],
                                            currentDisplayedPath: [],
                                            hideSummaryValueWhenExpanded: false,
                                        })
                                    );
                                    // errorElem.style.marginLeft = "22px";
                                    if (stack?.hasUnloadedStacks) {
                                        void stack.fullyLoadedStack.then((stack: string): void => {
                                            /* const newErrorElem = */ errorElem.parentNode?.replaceChild(
                                                createExpandableObjectView(e, true, false, {
                                                    summaryValueOverride: stack,
                                                    copyConsoleMessageStackCallback: options?.copyConsoleMessageStackCallback,
                                                    copyConsoleMessageStackButtonEnabled: options?.copyConsoleMessageStackButtonEnabled,
                                                    showReadonly: options?.showReadonly,
                                                    currentPath: [],
                                                    currentDisplayedPath: [],
                                                    hideSummaryValueWhenExpanded: false,
                                                }),
                                                errorElem
                                            );
                                            // if (newErrorElem) newErrorElem.style.marginLeft = "22px";
                                        });
                                    }
                                } else if ((typeof e === "object" && e !== null) || typeof e === "function") {
                                    /* const errorElem = */ exceptionExpandableObjectViewContainer.appendChild(
                                        createExpandableObjectView(e as object | AnyFunction, true, undefined, {
                                            copyConsoleMessageStackCallback: options?.copyConsoleMessageStackCallback,
                                            copyConsoleMessageStackButtonEnabled: options?.copyConsoleMessageStackButtonEnabled,
                                            showReadonly: options?.showReadonly,
                                            currentPath: [],
                                            currentDisplayedPath: [],
                                        })
                                    );
                                    // errorElem.style.marginLeft = "22px";
                                } else if (typeof e === "symbol") {
                                    const errorElem = exceptionExpandableObjectViewContainer.appendChild(document.createElement("pre"));
                                    errorElem.classList.add("exceptionDetails");
                                    errorElem.textContent = stringifyNonUniqueSymbol(e) ?? e.toString();
                                    // errorElem.style.marginLeft = "22px";
                                } else {
                                    const errorElem = exceptionExpandableObjectViewContainer.appendChild(document.createElement("pre"));
                                    errorElem.classList.add("exceptionDetails");
                                    errorElem.textContent = JSONB.stringify(e);
                                    // errorElem.style.marginLeft = "22px";
                                }
                            }
                        });
                        // const exceptionExpandableObjectView = createExpandableObjectView(e, false, false, {
                        //     summaryValueOverride: `(Exception)`,
                        //     summaryValueOverride_toStringTag: e?.name ?? (typeof e?.[Symbol.toStringTag] === "string" ? e[Symbol.toStringTag] : undefined),
                        //     displayKey: displayName,
                        //     copyConsoleMessageStackCallback: options?.copyConsoleMessageStackCallback,
                        //     copyConsoleMessageStackButtonEnabled: options?.copyConsoleMessageStackButtonEnabled,
                        //     showReadonly: options?.showReadonly,
                        //     currentPath: typeof key !== "object" ? options?.currentPath?.concat(key) : options?.currentPath,
                        //     currentDisplayedPath: options?.currentDisplayedPath?.concat(displayName),
                        //     hideSummaryValueWhenExpanded: false,
                        // });
                        item.appendChild(exceptionExpandableObjectViewContainer);
                        details.appendChild(item);
                    }
                }
                if (options?.includeViewableToString ?? (isRoot && typeof obj === "function")) {
                    const arrowIDB = (consoleExpansionArrowID++).toString(36);
                    const funcToStringContainer = document.createElement("div");
                    const funcToString = document.createElement("span");
                    funcToString.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: 0px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${arrowIDB}"><span style="display: inline; white-space: pre-wrap;">[[toString]]: ƒ toString()</span>`;
                    funcToString.style.cursor = "pointer";
                    funcToString.style.marginLeft = "22px";
                    if (options?.showReadonly) {
                        if (Object.getOwnPropertyDescriptor(obj, "toString")?.writable === false) {
                            funcToString.insertAdjacentHTML("afterbegin", `<i style="display: inline; font-style: italic; opacity: 0.75;">read-only</i>&nbsp;`);
                        }
                    }
                    const evaluatedUponFirstExpandingInfo = document.createElement("div");
                    evaluatedUponFirstExpandingInfo.style = "display: none; white-space: pre-wrap; position: relative; left: 0px; top: 0px; height: 100%;";
                    evaluatedUponFirstExpandingInfo.classList.add("evaluatedUponFirstExpandingInfo");
                    const evaluatedUponFirstExpandingInfoIcon = document.createElement("img");
                    evaluatedUponFirstExpandingInfoIcon.style =
                        "display: inline; width: 24px; height: 24px; position: relative; left: 0px; top: 50%; margin-top: -12px; margin-bottom: -12px; image-rendering: pixelated;";
                    evaluatedUponFirstExpandingInfoIcon.src = "assets/Information_icon.png";
                    evaluatedUponFirstExpandingInfoIcon.addEventListener("mouseover", () => {
                        evaluatedUponFirstExpandingInfoText.style.display = "inline";
                    });
                    evaluatedUponFirstExpandingInfoIcon.addEventListener("mouseout", () => {
                        evaluatedUponFirstExpandingInfoText.style.display = "none";
                    });
                    evaluatedUponFirstExpandingInfo.appendChild(evaluatedUponFirstExpandingInfoIcon);
                    const evaluatedUponFirstExpandingInfoText = document.createElement("span");
                    evaluatedUponFirstExpandingInfoText.style =
                        "position: absolute; top: -100%; left: 0px; display: none; background-color: #FFFFFFAA; color: #000000FF; pointer-events: none;";
                    evaluatedUponFirstExpandingInfoText.textContent = "This value was evaluated upon first expanding. It may have changed since then.";
                    evaluatedUponFirstExpandingInfo.appendChild(evaluatedUponFirstExpandingInfoText);
                    funcToString.appendChild(evaluatedUponFirstExpandingInfo);
                    funcToStringContainer.appendChild(funcToString);
                    details.appendChild(funcToStringContainer);
                    funcToString.addEventListener("click", () => {
                        if (funcToString.nextSibling) {
                            document.getElementById(`consoleExpansionArrow-${arrowIDB}`)!.style.transform = "rotateZ(0deg)";
                            (funcToString.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0] as HTMLElement).style.display = "none";
                            funcToString.nextSibling.remove();
                        } else {
                            document.getElementById(`consoleExpansionArrow-${arrowIDB}`)!.style.transform = "rotateZ(90deg)";
                            (funcToString.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0] as HTMLElement).style.display = "inline";
                            const funcSource = document.createElement("p");
                            funcSource.classList.add("funcSource");
                            funcSource.textContent = (obj as () => void).toString();
                            funcSource.style.margin = "0";
                            funcSource.style.marginLeft = "44px";
                            funcSource.setAttribute("cohinline", "");
                            funcToStringContainer.appendChild(funcSource);
                        }
                    });
                }
                container.appendChild(details);
            } else {
                try {
                    //@ts-ignore
                    document.getElementById(`consoleExpansionArrow-${arrowID}`).style.transform = "rotateZ(0deg)";
                } catch (e) {
                    console.error(e);
                }

                (summary.getElementsByClassName("summaryExpanded")[0] as HTMLElement).style.display = "none";
                (summary.getElementsByClassName("summaryCollapsed")[0] as HTMLElement).style.display = "";

                (
                    summary.getElementsByClassName("summaryCollapsed")[0]!.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0] as HTMLElement
                ).style.display = "none";
                (
                    summary.getElementsByClassName("summaryExpanded")[0]!.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0] as HTMLElement
                ).style.display = "none";
                container.removeChild(container.childNodes[1]!);
            }
        }, 1);
    });

    return container;
}

/**
 *
 * @param {`temp${bigint}`} variableName
 */
function displayStoredConsoleTempVariable(variableName: `temp${bigint}`): void {
    /**
     * The command element.
     *
     * @type {HTMLDivElement}
     */
    const commandElem: HTMLDivElement = document.createElement("div");
    commandElem.style.whiteSpace = "pre-wrap";
    commandElem.style.overflowWrap = "anywhere";
    if (
        consoleOverlayTextElement.children.length > 0 &&
        consoleOverlayTextElement.lastChild instanceof HTMLElement &&
        !consoleOverlayTextElement.lastChild?.style?.backgroundColor?.length
    ) {
        commandElem.style.borderTop = "1px solid #888888";
    }
    commandElem.textContent = `> ${variableName}`;
    consoleOverlayTextElement.appendChild(commandElem);

    /**
     * The result element that will display the result of the executed command.
     *
     * @type {HTMLDivElement}
     */
    const resultElem: HTMLDivElement = document.createElement("div");
    resultElem.style.whiteSpace = "pre-wrap";
    resultElem.style.overflowWrap = "anywhere";
    try {
        /**
         * The value of the temp variable.
         */
        const result: unknown = window[variableName];
        if ((typeof result === "object" && result !== null) || typeof result === "function") {
            resultElem.appendChild(
                createExpandableObjectView(result, true, undefined, {
                    currentPath: [],
                    currentDisplayedPath: [],
                })
            );
        } else if (typeof result === "symbol") {
            resultElem.textContent = result.toString();
        } else {
            resultElem.textContent = JSONB.stringify(result);
        }
        if (
            consoleOverlayTextElement.children.length > 0 &&
            consoleOverlayTextElement.lastChild instanceof HTMLElement &&
            (consoleOverlayTextElement.lastChild?.style?.backgroundColor ?? "") === (resultElem.style.backgroundColor ?? "")
        ) {
            resultElem.style.borderTop = "1px solid #888888";
        }
        consoleOverlayTextElement.appendChild(resultElem);
        consoleOverlayInputFieldElement.value = "";
    } catch (e) {
        resultElem.style.backgroundColor = "#FF000055";
        if (e instanceof Error) {
            const stack = e.stack === undefined ? undefined : mapStackWithTS(e.stack);
            const errorElem = resultElem.appendChild(
                createExpandableObjectView(e, true, false, {
                    summaryValueOverride: stack?.stack ?? e.stack,
                    currentPath: [],
                    currentDisplayedPath: [],
                    hideSummaryValueWhenExpanded: false,
                })
            );
            if (stack?.hasUnloadedStacks) {
                void stack.fullyLoadedStack.then((stack) => {
                    errorElem.parentNode?.replaceChild(
                        createExpandableObjectView(e, true, false, {
                            summaryValueOverride: stack,
                            currentPath: [],
                            currentDisplayedPath: [],
                            hideSummaryValueWhenExpanded: false,
                        }),
                        errorElem
                    );
                });
            }
        } else if ((typeof e === "object" && e !== null) || typeof e === "function") {
            resultElem.appendChild(
                createExpandableObjectView(e, true, undefined, {
                    currentPath: [],
                    currentDisplayedPath: [],
                })
            );
        } else if (typeof e === "symbol") {
            resultElem.textContent = e.toString();
        } else {
            resultElem.textContent = JSONB.stringify(e);
        }
        if (
            consoleOverlayTextElement.children.length > 0 &&
            consoleOverlayTextElement.lastChild instanceof HTMLElement &&
            (consoleOverlayTextElement.lastChild?.style?.backgroundColor ?? "") === (resultElem.style.backgroundColor ?? "")
        ) {
            resultElem.style.borderTop = "1px solid #888888";
        }
        consoleOverlayTextElement.appendChild(resultElem);
    }
}

// This is not good enough yet.
/* 
const facetList = [...new Set([...Object.keys(accessedFacets), ...Object.keys(facetSpyData.sharedFacets)])];

Promise.all(facetList.map((v) => forceLoadFacet(v).catch(() => {}))).then(() =>
    copyTextToClipboardAsync(
        JSONB.stringify({ ...Object.fromEntries(facetList.map((v) => [v, Symbol.for("__MISSING__")])), ...getAccessibleFacetSpyFacets() }, (k, v) => {
            if (typeof v === "object") {
                return v === null
                    ? null
                    : v.constructor?.name === "CoherentArrayProxy"
                    ? { $PartialArrayType: Array.from(v) }
                    : v instanceof Array
                    ? v
                    : Object.fromEntries(
                          [
                              ...new Set([
                                  ...Object.keys(v),
                                  ...(() => {
                                      try {
                                          return Object.getOwnPropertyNames(v.__proto__).filter((key) => {
                                              try {
                                                  // Make sure the property won't throw an error when accessed.
                                                  v[key];
                                                  return key in v;
                                              } catch {
                                                  return false;
                                              }
                                          });
                                      } catch (e) {
                                          return [];
                                      }
                                  })(),
                                  ...Object.getOwnPropertyNames(v),
                                  ...Object.getOwnPropertySymbols(v),
                              ]),
                          ].map((key) => {
                              try {
                                  return [key, v[key]];
                              } catch (e) {
                                  return { ERROR: e };
                              }
                          })
                      );
            }
            if (typeof v === "function") {
                return v.toString();
            }
            if (v === Symbol.for("__MISSING__")) return "__MISSING__";
            return typeof v;
        })
    )
); */

/**
 * The queue of messages to display in the console overlay once it is loaded.
 *
 * @type {ConsoleEverythingEntry[]}
 */
var consoleOverlayOnLoadMessageQueue: ConsoleEverythingEntry[] = [];

/**
 * The callback called by the hook on the {@link console} methods.
 *
 * @param {ConsoleEverythingEntry} data The data of the message.
 *
 * @idea Make a system where it uses the click location to determine what text was right-clicked or long-pressed on to determine which context menu to show.
 */
function consoleOverlayConsoleLogCallback(data: ConsoleEverythingEntry): void {
    if (!consoleOverlayTextElement) {
        consoleOverlayOnLoadMessageQueue.push(data);
        return;
    }
    // To prevent error spam from trying to load all of the vanilla facets.
    if (
        Array.isArray(data.value) &&
        data.value.length === 1 &&
        typeof data.value[0] === "string" &&
        data.value[0]?.startsWith?.('Error "activate-facet-not-found" while using facet ')
    ) {
        return;
    }
    async function copyConsoleMessageStackCallback(): Promise<void> {
        if (data.stack !== undefined) {
            const stack = mapStackWithTS(data.stack);
            await copyTextToClipboardAsync(stack.hasUnloadedStacks ? await stack.fullyLoadedStack : stack.stack);
        } else console.error("The stack of the console message could not be copied to the clipboard as it is not available.");
    }
    const elem = document.createElement("pre");
    // elem.style.display = "flex";
    // elem.style.flexDirection = "row";
    // elem.style.width = "auto";
    // elem.style.whiteSpace = "pre-wrap";
    switch (data.type) {
        case "exception":
            elem.style.backgroundColor = "#ff004055";
            break;
        case "promiseRejection":
            elem.style.backgroundColor = "#ff009555";
            break;
        case "error":
            elem.style.backgroundColor = "#FF000055";
            break;
        case "warn":
            elem.style.backgroundColor = "#FFA50055";
            break;
        case "info":
            elem.style.backgroundColor = "#00FF8855";
            break;
        case "debug":
            elem.style.backgroundColor = "#5555BB55";
            break;
        case "internal":
        case "log":
        default:
    }
    function appendCurrentTextContentElem(force = false): void {
        if (!currentTextContentOuterElem) return;
        if (!currentTextContentElem) return;
        if (force || currentTextContentElem.textContent?.length) {
            if (currentTextContentOuterElem.children.length) {
                const spacer: HTMLSpanElement = currentTextContentOuterElem.appendChild(document.createElement("span"));
                // spacer.style.display = "inline";
                spacer.style.whiteSpace = "pre-wrap";
                spacer.textContent = " ";
            }
            currentTextContentOuterElem.appendChild(currentTextContentElem);
        }
        currentTextContentElem = null;
    }
    function appendCurrentTextContentOuterElem(): void {
        if (!currentTextContentOuterElem) return;
        appendCurrentTextContentElem();
        if (currentTextContentOuterElem.children.length) {
            elem.appendChild(currentTextContentOuterElem);
        }
        currentTextContentOuterElem = null;
    }
    function createNewTextContentOuterElemIfNecessary(): void {
        if (currentTextContentOuterElem) return;
        currentTextContentOuterElem = document.createElement("p");
        // currentTextContentOuterElem.style.cssText = elem.style.cssText;
        // currentTextContentOuterElem.style.display = "inline";
        currentTextContentOuterElem.style.maxWidth = "100%";
        currentTextContentOuterElem.style.whiteSpace = "pre-wrap";
        currentTextContentOuterElem.style.overflowWrap = "break-word";
        currentTextContentOuterElem.style.margin = "0";
        currentTextContentOuterElem.setAttribute("cohinline", "");
    }
    function createNewTextContentElemIfNecessary(): void {
        createNewTextContentOuterElemIfNecessary();
        if (currentTextContentElem) return;
        currentTextContentElem = document.createElement("span");
        // currentTextContentElem.style.display = "inline";
        currentTextContentElem.style.whiteSpace = "pre-wrap";
        currentTextContentElem.style.overflowWrap = "break-word";
    }
    /**
     * @type {HTMLParagraphElement | null}
     */
    let currentTextContentOuterElem: HTMLParagraphElement | null = document.createElement("p");
    currentTextContentOuterElem.style.maxWidth = "100%";
    currentTextContentOuterElem.style.whiteSpace = "pre-wrap";
    currentTextContentOuterElem.style.overflowWrap = "break-word";
    currentTextContentOuterElem.style.margin = "0";
    currentTextContentOuterElem.setAttribute("cohinline", "");
    /**
     * @type {HTMLSpanElement | null}
     */
    let currentTextContentElem: HTMLSpanElement | null = document.createElement("span");
    // currentTextContentElem.style.display = "inline";
    currentTextContentElem.style.whiteSpace = "pre-wrap";
    currentTextContentElem.style.overflowWrap = "break-word";
    if (data.type === "exception") {
        const stack = mapStackWithTS(`${data.value.filename === "undefined" ? "<anonymous>" : data.value.filename}:${data.value.lineno}:${data.value.colno}`);
        currentTextContentElem.textContent = `[${data.timeStamp}] [unhandled exception] [${stack.stack}]`;
        const elem: HTMLSpanElement = currentTextContentElem;
        if (stack?.hasUnloadedStacks) {
            void stack.fullyLoadedStack.then((stack: string): void => {
                elem.textContent = `[${data.timeStamp}] [unhandled exception] [${stack}]`;
            });
        }
    } else {
        currentTextContentElem.textContent = `[${data.timeStamp}] [${data.type === "promiseRejection" ? "unhandled promise rejection" : data.type}]`;
    }
    appendCurrentTextContentElem();
    if (data.type === "exception") {
        appendCurrentTextContentOuterElem();
        const value = data.value;
        const stack = value.error instanceof Error && value.error.stack !== undefined ? mapStackWithTS(value.error.stack) : undefined;
        const errorElem = elem.appendChild(
            createExpandableObjectView(value, true, false, {
                summaryValueOverride: stack?.stack ?? (value.error instanceof Error && value.error.stack !== undefined ? value.error.stack : value.message),
                copyConsoleMessageStackCallback,
                copyConsoleMessageStackButtonEnabled: data.stack !== undefined,
                showReadonly: OUICConsoleConfig.showReadonlyPropertiesLabelInConsoleEnabled,
                currentPath: [],
                currentDisplayedPath: [],
            })
        );
        if (stack?.hasUnloadedStacks) {
            void stack.fullyLoadedStack.then((stack: string): void => {
                errorElem.parentNode?.replaceChild(
                    createExpandableObjectView(value, true, false, {
                        summaryValueOverride: stack,
                        copyConsoleMessageStackCallback,
                        copyConsoleMessageStackButtonEnabled: data.stack !== undefined,
                        showReadonly: OUICConsoleConfig.showReadonlyPropertiesLabelInConsoleEnabled,
                        currentPath: [],
                        currentDisplayedPath: [],
                    }),
                    errorElem
                );
            });
        }
    } else if (data.type === "promiseRejection") {
        appendCurrentTextContentOuterElem();
        const value = data.value;
        const stack = value.reason instanceof Error && value.reason.stack !== undefined ? mapStackWithTS(value.reason.stack) : undefined;
        const errorElem = elem.appendChild(
            createExpandableObjectView(value, true, false, {
                summaryValueOverride:
                    stack?.stack ??
                    (value.reason instanceof Error ?
                        value.reason.stack! !== undefined ?
                            value.reason.stack
                        :   value.reason.message
                    :   String(value.reason)),
                copyConsoleMessageStackCallback,
                copyConsoleMessageStackButtonEnabled: data.stack !== undefined,
                showReadonly: OUICConsoleConfig.showReadonlyPropertiesLabelInConsoleEnabled,
                currentPath: [],
                currentDisplayedPath: [],
            })
        );
        if (stack?.hasUnloadedStacks) {
            void stack.fullyLoadedStack.then((stack: string): void => {
                errorElem.parentNode?.replaceChild(
                    createExpandableObjectView(value, true, false, {
                        summaryValueOverride: stack,
                        copyConsoleMessageStackCallback,
                        copyConsoleMessageStackButtonEnabled: data.stack !== undefined,
                        showReadonly: OUICConsoleConfig.showReadonlyPropertiesLabelInConsoleEnabled,
                        currentPath: [],
                        currentDisplayedPath: [],
                    }),
                    errorElem
                );
            });
        }
    } else {
        for (const v of data.value) {
            if (v instanceof Error) {
                appendCurrentTextContentOuterElem();
                const stack = v.stack === undefined ? undefined : mapStackWithTS(v.stack);
                const errorElem = elem.appendChild(
                    createExpandableObjectView(v, true, false, {
                        summaryValueOverride: stack?.stack ?? v.stack,
                        copyConsoleMessageStackCallback,
                        copyConsoleMessageStackButtonEnabled: data.stack !== undefined,
                        showReadonly: OUICConsoleConfig.showReadonlyPropertiesLabelInConsoleEnabled,
                        currentPath: [],
                        currentDisplayedPath: [],
                        hideSummaryValueWhenExpanded: false,
                    })
                );
                if (stack?.hasUnloadedStacks) {
                    void stack.fullyLoadedStack.then((stack: string): void => {
                        errorElem.parentNode?.replaceChild(
                            createExpandableObjectView(v, true, false, {
                                summaryValueOverride: stack,
                                copyConsoleMessageStackCallback,
                                copyConsoleMessageStackButtonEnabled: data.stack !== undefined,
                                showReadonly: OUICConsoleConfig.showReadonlyPropertiesLabelInConsoleEnabled,
                                currentPath: [],
                                currentDisplayedPath: [],
                                hideSummaryValueWhenExpanded: false,
                            }),
                            errorElem
                        );
                    });
                }
            } else if ((typeof v === "object" && v !== null) || typeof v === "function") {
                appendCurrentTextContentOuterElem();
                elem.appendChild(
                    createExpandableObjectView(v, true, undefined, {
                        copyConsoleMessageStackCallback,
                        copyConsoleMessageStackButtonEnabled: data.stack !== undefined,
                        showReadonly: OUICConsoleConfig.showReadonlyPropertiesLabelInConsoleEnabled,
                        currentPath: [],
                        currentDisplayedPath: [],
                    })
                );
            } else if (v === null) {
                createNewTextContentElemIfNecessary();
                currentTextContentElem.textContent += `${currentTextContentElem.textContent.length ? " " : ""}null`;
                addContextMenuToTopLevelPrimitiveConsoleValue(v, currentTextContentElem, {
                    copyConsoleMessageStackCallback,
                    copyConsoleMessageStackButtonEnabled: data.stack !== undefined,
                });
                appendCurrentTextContentElem();
            } else {
                createNewTextContentElemIfNecessary();
                switch (typeof v) {
                    case "symbol":
                        currentTextContentElem.textContent += (currentTextContentElem.textContent.length ? " " : "") + v.toString();
                        break;
                    case "bigint":
                        currentTextContentElem.textContent += (currentTextContentElem.textContent.length ? " " : "") + JSONB.stringify(v);
                        break;
                    case "string":
                        currentTextContentElem.textContent += `${currentTextContentElem.textContent.length ? " " : ""}${
                            typeof data.value[0] === "string" ? v : quoteStringDynamic(v)
                        }`;
                        break;
                    case "boolean":
                    case "number":
                    case "undefined":
                        currentTextContentElem.textContent += `${currentTextContentElem.textContent.length ? " " : ""}${v}`;
                        break;
                    case "function":
                    case "object":
                    default:
                        currentTextContentElem.textContent += `${currentTextContentElem.textContent.length ? " " : ""}${String(v as unknown)}`;
                }
                addContextMenuToTopLevelPrimitiveConsoleValue(v as string | number | bigint | boolean | symbol | undefined, currentTextContentElem, {
                    copyConsoleMessageStackCallback,
                    copyConsoleMessageStackButtonEnabled: data.stack !== undefined,
                });
                appendCurrentTextContentElem(typeof v === "string" && typeof data.value[0] === "string" && !v);
            }
        }
    }
    if (
        consoleOverlayTextElement.children.length > 0 &&
        consoleOverlayTextElement.lastChild instanceof HTMLElement &&
        (consoleOverlayTextElement.lastChild?.style?.backgroundColor ?? "") === (elem.style.backgroundColor ?? "")
    ) {
        elem.style.borderTop = "1px solid #888888";
    }
    appendCurrentTextContentOuterElem();
    /**
     * @type {Omit<ContextMenuCreationOptions, "x" | "y">}
     */
    const contextMenu: Omit<ContextMenuCreationOptions, "x" | "y"> = {
        width: 400,
        height: 600,
        items: [
            {
                label: "Copy message stack",
                action: copyConsoleMessageStackCallback,
                disabled: data.stack === undefined,
            },
            {
                type: "separator",
            },
            {
                label: "Clear console",
                action(): void {
                    consoleOverlayTextElement.innerHTML = "";
                },
            },
            {
                label: "Clear console history",
                action(): void {
                    ConsoleExecutionHistory.clearHistory();
                },
            },
            {
                type: "separator",
            },
            {
                label: "Copy console",
                action(): void {
                    if (consoleOverlayTextElement.textContent) {
                        copyTextToClipboardAsync(
                            Array.from(consoleOverlayTextElement.children)
                                .map((child) => child.textContent)
                                .filter((v) => v !== null)
                                .join("\n")
                        ).catch((reason: unknown): void => {
                            console.error(new Error(`[8CrafterConsole::Copy console] An error occured while copying to the clipboard.`), reason);
                        });
                    } else console.warn("Could not copy console to clipboard because the console is empty.");
                },
                get disabled(): boolean {
                    return !consoleOverlayTextElement.textContent;
                },
            },
        ],
    };
    /**
     * @type {number | null}
     */
    let clickStartTime: number | null = null;
    elem.addEventListener("mousedown", (event): void => {
        if (event.button !== 0) return;
        clickStartTime = Date.now();
    });
    elem.addEventListener("mouseleave", (): void => {
        clickStartTime = null;
    });
    elem.addEventListener("click", (event): void => {
        if (event.button !== 0) return;
        if (clickStartTime !== null && Date.now() - clickStartTime >= 500) {
            event.preventDefault();
            event.stopImmediatePropagation();
            setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
        }
        clickStartTime = null;
    });
    elem.addEventListener("mouseup", (event): void => {
        if (event.button !== 2) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
    });
    consoleOverlayTextElement.appendChild(elem);
}

// function consoleOverlayConsoleLogCallback(data) {
//     if (!consoleOverlayTextElement) {
//         consoleOverlayOnLoadMessageQueue.push(data);
//         return;
//     }
//     // To prevent error spam from trying to load all of the vanilla facets.
//     if (Array.isArray(data.value) && data.value.length === 1 && data.value[0]?.startsWith?.('Error "activate-facet-not-found" while using facet ')) {
//         return;
//     }
//     const elem = document.createElement("pre");
//     // elem.style.display = "flex";
//     // elem.style.flexDirection = "row";
//     // elem.style.width = "auto";
//     // elem.style.whiteSpace = "pre-wrap";
//     switch (data.type) {
//         case "exception":
//             elem.style.backgroundColor = "#ff004055";
//         case "promiseRejection":
//             elem.style.backgroundColor = "#ff009555";
//         case "error":
//             elem.style.backgroundColor = "#FF000055";
//             break;
//         case "warn":
//             elem.style.backgroundColor = "#FFA50055";
//             break;
//         case "info":
//             elem.style.backgroundColor = "#00FF8855";
//             break;
//         case "debug":
//             elem.style.backgroundColor = "#5555BB55";
//             break;
//         default:
//     }
//     /**
//      * @type {HTMLPreElement | null}
//      */
//     let currentTextContentOuterElem = document.createElement("pre");
//     currentTextContentOuterElem.style.display = "inline";
//     currentTextContentOuterElem.style.width = "100%";
//     currentTextContentOuterElem.style.whiteSpace = "pre-wrap";
//     /**
//      * @type {HTMLSpanElement | null}
//      */
//     let currentTextContentElem = document.createElement("span");
//     currentTextContentElem.style.display = "inline";
//     currentTextContentElem.style.width = "auto";
//     currentTextContentElem.style.whiteSpace = "pre-wrap";
//     currentTextContentElem.textContent = `[${data.timeStamp}] [${
//         data.type === "exception"
//             ? `unhandled exception] [${data.value.filename}:${data.value.lineno}:${data.value.colno}`
//             : data.type === "promiseRejection"
//             ? "unhandled promise rejection"
//             : data.type
//     }]`;
//     function appendCurrentTextContentElem() {
//         if (!currentTextContentOuterElem) return;
//         if (!currentTextContentElem) return;
//         if (currentTextContentElem.textContent?.length) {
//             if (currentTextContentOuterElem.children.length) {
//                 const spacer = currentTextContentOuterElem.appendChild(document.createElement("span"));
//                 spacer.style.display = "inline";
//                 spacer.style.whiteSpace = "pre-wrap";
//                 spacer.textContent = " ";
//             }
//             currentTextContentOuterElem.appendChild(currentTextContentElem);
//         }
//         currentTextContentElem = null;
//     }
//     function appendCurrentTextContentOuterElem() {
//         if (!currentTextContentOuterElem) return;
//         appendCurrentTextContentElem();
//         if (currentTextContentOuterElem.children.length) {
//             elem.appendChild(currentTextContentOuterElem);
//         }
//         currentTextContentOuterElem = null;
//     }
//     function createNewTextContentOuterElemIfNecessary() {
//         if (currentTextContentOuterElem) return;
//         currentTextContentOuterElem = document.createElement("pre");
//         // currentTextContentOuterElem.style.cssText = elem.style.cssText;
//         currentTextContentOuterElem.style.display = "inline";
//         currentTextContentOuterElem.style.overflowX = "auto";
//         currentTextContentOuterElem.style.maxWidth = "100%";
//         currentTextContentOuterElem.style.whiteSpace = "pre-wrap";
//         currentTextContentOuterElem.style.overflowWrap = "break-word";
//     }
//     function createNewTextContentElemIfNecessary() {
//         createNewTextContentOuterElemIfNecessary();
//         if (currentTextContentElem) return;
//         currentTextContentElem = document.createElement("span");
//         currentTextContentElem.style.display = "inline";
//         currentTextContentElem.style.whiteSpace = "pre-wrap";
//         currentTextContentElem.style.overflowWrap = "break-word";
//     }
//     if (data.type === "exception") {
//         const value = data.value;
//         currentTextContentOuterElem.appendChild(
//             createExpandableObjectView(value, true, false, {
//                 summaryValueOverride: value.error?.stack !== undefined ? value.error.stack : value.message,
//                 currentPath: [],
//                 currentDisplayedPath: [],
//             })
//         );
//     } else if (data.type === "promiseRejection") {
//         const value = data.value;
//         currentTextContentOuterElem.appendChild(
//             createExpandableObjectView(value, true, false, {
//                 summaryValueOverride: value.reason?.stack !== undefined ? value.reason.stack : value.reason.message ?? String(value.reason),
//                 currentPath: [],
//                 currentDisplayedPath: [],
//             })
//         );
//     } else {
//         for (const v of data.value) {
//             if (v instanceof Error) {
//                 appendCurrentTextContentElem();
//                 currentTextContentOuterElem.appendChild(
//                     createExpandableObjectView(v, true, false, {
//                         summaryValueOverride: v.stack,
//                         currentPath: [],
//                         currentDisplayedPath: [],
//                         hideSummaryValueWhenExpanded: false,
//                     })
//                 );
//             } else if ((typeof v === "object" && v !== null) || typeof v === "function") {
//                 appendCurrentTextContentOuterElem();
//                 elem.appendChild(createExpandableObjectView(v, true, undefined, {
//                     currentPath: [],
//                     currentDisplayedPath: [],
//                     hideSummaryValueWhenExpanded: false,
//                 }));
//             } else if (v === null) {
//                 appendCurrentTextContentElem();
//                 createNewTextContentElemIfNecessary();
//                 currentTextContentElem.textContent = "null";
//                 addContextMenuToTopLevelPrimitiveConsoleValue(v, currentTextContentElem);
//                 appendCurrentTextContentElem();
//             } else {
//                 appendCurrentTextContentElem();
//                 createNewTextContentElemIfNecessary();
//                 switch (typeof v) {
//                     case "symbol":
//                         currentTextContentElem.textContent = v.toString();
//                         break;
//                     case "bigint":
//                         currentTextContentElem.textContent = JSONB.stringify(v);
//                         break;
//                     case "boolean":
//                     case "number":
//                     case "string":
//                     case "undefined":
//                     default:
//                         currentTextContentElem.textContent = `${v}`;
//                 }
//                 addContextMenuToTopLevelPrimitiveConsoleValue(v, currentTextContentElem);
//                 appendCurrentTextContentElem();
//             }
//         }
//     }
//     if (
//         consoleOverlayTextElement.children.length > 0 &&
//         consoleOverlayTextElement.lastChild instanceof HTMLElement &&
//         (consoleOverlayTextElement.lastChild?.style?.backgroundColor ?? "") === (elem.style.backgroundColor ?? "")
//     ) {
//         elem.style.borderTop = "1px solid #888888";
//     }
//     appendCurrentTextContentOuterElem();
//     consoleOverlayTextElement.appendChild(elem);
// }

// This is so that any messages logged before the console overlay was loaded will be displayed.
queueMicrotask(
    setTimeout.bind(
        void 0,
        async function loadConsoleOverlayOnLoadMessageQueue(): Promise<never> {
            while (true) {
                do {
                    await new Promise((resolve: (value: unknown) => void): void => void setTimeout(resolve, 100));
                    //@ts-ignore This should not have an error.
                } while (!consoleOverlayTextElement);
                if (consoleOverlayOnLoadMessageQueue.length === 0) continue;
                for (const data of consoleOverlayOnLoadMessageQueue) {
                    consoleOverlayOnLoadMessageQueue.splice(consoleOverlayOnLoadMessageQueue.indexOf(data), 1);
                    consoleOverlayConsoleLogCallback(data);
                }
            }
        },
        1
    )
);

/**
 * @param {Parameters<typeof onConsoleLogCallbacks[0]>[0]} data
 */
/* function consoleOverlayConsoleLogCallback(data) {
    const elem = document.createElement("span");
    switch (data.type) {
        case "error":
            elem.style.backgroundColor = "#FF000055";
            break;
        case "warn":
            elem.style.backgroundColor = "#FFA50055";
            break;
        case "debug":
            elem.style.backgroundColor = "#5555BB55";
            break;
        default:
            if(consoleOverlayTextElement.children.length > 0 && !consoleOverlayTextElement.lastChild?.style?.backgroundColor?.length > 0){
                elem.style.borderTop = "1px solid #888888";
            };
    }
    elem.textContent = `[${data.timeStamp}] [${data.type}] ${data.value.map((v) => {
        switch (typeof v) {
            case "bigint":
            case "object":
                return JSONB.stringify(v);
            case "function":
                return v.toString();
            default:
                return v;
        }
    })}`;
    consoleOverlayTextElement.appendChild(elem);
} */

console.everything.forEach(consoleOverlayConsoleLogCallback);
onConsoleLogCallbacks.push(consoleOverlayConsoleLogCallback);

const nonTextKeyCodes: readonly number[] = [
    8, 9, 13, 16, 17, 18, 20, 27, 32, 33, 34, 35, 37, 38, 39, 40, 45, 46, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 112, 113, 114, 115, 116, 117, 118, 119,
    120, 121, 122, 123, 195, 196, 197, 198, 199, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210,
];

const types_KeyboardKey = {
    8: "BACKSPACE",
    9: "TAB",
    13: "ENTER",
    16: "SHIFT",
    17: "CTRL",
    18: "ALT",
    20: "CAPS_LOCK",
    27: "ESCAPE",
    32: "SPACE",
    33: "PG_UP",
    34: "PG_DOWN",
    35: "END",
    37: "LEFT",
    38: "UP",
    39: "RIGHT",
    40: "DOWN",
    45: "INSERT",
    46: "DELETE",
    48: "KEY_0",
    49: "KEY_1",
    50: "KEY_2",
    51: "KEY_3",
    52: "KEY_4",
    53: "KEY_5",
    54: "KEY_6",
    55: "KEY_7",
    56: "KEY_8",
    57: "KEY_9",
    59: "SEMICOLON",
    61: "EQUALS",
    65: "KEY_A",
    66: "KEY_B",
    67: "KEY_C",
    68: "KEY_D",
    69: "KEY_E",
    70: "KEY_F",
    71: "KEY_G",
    72: "KEY_H",
    73: "KEY_I",
    74: "KEY_J",
    75: "KEY_K",
    76: "KEY_L",
    77: "KEY_M",
    78: "KEY_N",
    79: "KEY_O",
    80: "KEY_P",
    81: "KEY_Q",
    82: "KEY_R",
    83: "KEY_S",
    84: "KEY_T",
    85: "KEY_U",
    86: "KEY_V",
    87: "KEY_W",
    88: "KEY_X",
    89: "KEY_Y",
    90: "KEY_Z",
    96: "NUMPAD_0",
    97: "NUMPAD_1",
    98: "NUMPAD_2",
    99: "NUMPAD_3",
    100: "NUMPAD_4",
    101: "NUMPAD_5",
    102: "NUMPAD_6",
    103: "NUMPAD_7",
    104: "NUMPAD_8",
    105: "NUMPAD_9",
    109: "MINUS",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    188: "COMMA",
    190: "PERIOD",
    191: "SLASH",
    192: "GRAVE",
    195: "MOUSE_MOVEMENT",
    196: "MOUSE_BUTTON_LEFT",
    197: "MOUSE_BUTTON_MIDDLE",
    198: "MOUSE_BUTTON_RIGHT",
    199: "MOUSE_WHEEL",
    201: "PSEUDO_KEY_1",
    202: "PSEUDO_KEY_2",
    203: "PSEUDO_KEY_3",
    204: "PSEUDO_KEY_4",
    205: "PSEUDO_KEY_5",
    206: "PSEUDO_KEY_6",
    207: "PSEUDO_KEY_7",
    208: "PSEUDO_KEY_8",
    209: "PSEUDO_KEY_9",
    210: "PSEUDO_KEY_10",
    219: "BRACKET_OPEN",
    220: "BACKSLASH",
    221: "BRACKET_CLOSE",
    222: "APOSTROPHE",
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    SHIFT: 16,
    CTRL: 17,
    ALT: 18,
    PAUSE: 19,
    CAPS_LOCK: 20,
    ESCAPE: 27,
    SPACE: 32,
    PG_UP: 33,
    PG_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    INSERT: 45,
    DELETE: 46,
    KEY_0: 48,
    KEY_1: 49,
    KEY_2: 50,
    KEY_3: 51,
    KEY_4: 52,
    KEY_5: 53,
    KEY_6: 54,
    KEY_7: 55,
    KEY_8: 56,
    KEY_9: 57,
    // SEMICOLON: 59, // Not the actual semicolon key.
    // EQUALS: 61, // Not the actual equal sign key.
    KEY_A: 65,
    KEY_B: 66,
    KEY_C: 67,
    KEY_D: 68,
    KEY_E: 69,
    KEY_F: 70,
    KEY_G: 71,
    KEY_H: 72,
    KEY_I: 73,
    KEY_J: 74,
    KEY_K: 75,
    KEY_L: 76,
    KEY_M: 77,
    KEY_N: 78,
    KEY_O: 79,
    KEY_P: 80,
    KEY_Q: 81,
    KEY_R: 82,
    KEY_S: 83,
    KEY_T: 84,
    KEY_U: 85,
    KEY_V: 86,
    KEY_W: 87,
    KEY_X: 88,
    KEY_Y: 89,
    KEY_Z: 90,
    META_LFET: 91,
    CONTEXT_MENU: 93,
    NUMPAD_0: 96,
    NUMPAD_1: 97,
    NUMPAD_2: 98,
    NUMPAD_3: 99,
    NUMPAD_4: 100,
    NUMPAD_5: 101,
    NUMPAD_6: 102,
    NUMPAD_7: 103,
    NUMPAD_8: 104,
    NUMPAD_9: 105,
    NUMPAD_MULTIPLY: 106,
    NUMPAD_PLUS: 107,
    // NUMPAD_ENTER: 108, // Not supported, it just maps to regular ENTER.
    NUMPAD_MINUS: 109,
    NUMPAD_PERIOD: 110,
    NUMPAD_DIVIDE: 111,
    F1: 112,
    F2: 113,
    F3: 114,
    F4: 115,
    F5: 116,
    F6: 117,
    F7: 118,
    F8: 119,
    F9: 120,
    F10: 121,
    F11: 122,
    F12: 123,
    F13: 124,
    F14: 125,
    F15: 126,
    F16: 127,
    F17: 128,
    F18: 129,
    F19: 130,
    F20: 131,
    F21: 132,
    F22: 133,
    F23: 134,
    F24: 135,
    NUM_LOCK: 144,
    SCROLL_LOCK: 145,
    SEMICOLON: 186,
    EQUALS: 187,
    COMMA: 188,
    MINUS: 189,
    PERIOD: 190,
    SLASH: 191,
    GRAVE: 192,
    MOUSE_MOVEMENT: 195,
    MOUSE_BUTTON_LEFT: 196,
    MOUSE_BUTTON_MIDDLE: 197,
    MOUSE_BUTTON_RIGHT: 198,
    MOUSE_WHEEL: 199,
    PSEUDO_KEY_1: 201,
    PSEUDO_KEY_2: 202,
    PSEUDO_KEY_3: 203,
    PSEUDO_KEY_4: 204,
    PSEUDO_KEY_5: 205,
    PSEUDO_KEY_6: 206,
    PSEUDO_KEY_7: 207,
    PSEUDO_KEY_8: 208,
    PSEUDO_KEY_9: 209,
    PSEUDO_KEY_10: 210,
    BRACKET_OPEN: 219,
    BACKSLASH: 220,
    BRACKET_CLOSE: 221,
    APOSTROPHE: 222,
    INTL_BACKSLASH: 226,
    KANA_MODE: 246,
    CR_SEL: 247,
    EX_SEL: 248,
    ERASE_EOF: 249,
} as const;

// const container = consoleOverlayTextElement;
// const textBox = createCustomTextBox(container);
// consoleOverlayInputFieldElement.style.display = "contents";
// consoleOverlayElement.appendChild(textBox);

/**
 * Creates a custom text box element.
 *
 * @param {HTMLElement} container - The container element to create the custom text box in.
 * @returns {HTMLDivElement | undefined} The created custom text box element, or `undefined` if the element could not be created.
 *
 * @todo This is a work in progress.
 */
function createCustomTextBox(container: HTMLElement): HTMLDivElement | undefined {
    try {
        const textBoxSelection = {
            selectionStart: 0,
            selectionEnd: 0,
        };
        const textBox = document.createElement("div");
        // @ts-ignore: This is for browser compatibility
        textBox.contentEditable = "true";
        textBox.style.width = "100%";
        textBox.style.height = "200px";
        textBox.style.overflowY = "auto";
        // @ts-ignore: This is for browser compatibility
        textBox.style.wordWrap = "break-word";
        textBox.style.overflowWrap = "break-word";
        textBox.style.padding = "10px";
        textBox.style.border = "1px solid #ccc";
        textBox.style.cursor = "text"; // Add cursor
        textBox.setAttribute("tabindex", "0"); // Make focusable
        textBox.classList.add("customTextBox");
        const textBoxValueDisplay = document.createElement("div");
        textBoxValueDisplay.style.width = "100%";
        textBoxValueDisplay.style.height = "100%";
        textBoxValueDisplay.classList.add("customTextBox_valueDisplay");
        textBox.appendChild(textBoxValueDisplay);
        const textBoxTextarea = document.createElement("textarea");
        textBoxTextarea.style.opacity = "0";
        textBoxTextarea.classList.add("customTextBox_textareaElement");

        // Add event listeners for copy, cut, and paste
        textBox.addEventListener("copy", (e) => {
            const selectedText = window.getSelection()?.toString() ?? null;
            if (selectedText === null) {
                console.warn(new ReferenceError("Could not find current text selection."));
                return;
            }
            // @ts-ignore: This is for browser compatibility.
            if (!e.clipboardData) {
                console.warn(new ReferenceError("Could not find clipboard data."));
                return;
            }
            /* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */ /* @ts-ignore: This is for browser compatibility. */
            e.clipboardData.setData("text", selectedText);
            e.preventDefault();
        });

        textBox.addEventListener("cut", (e) => {
            const selectedText = window.getSelection()?.toString() ?? null;
            if (selectedText === null) {
                console.warn(new ReferenceError("Could not find current text selection."));
                return;
            }
            // @ts-ignore: This is for browser compatibility.
            if (!e.clipboardData) {
                console.warn(new ReferenceError("Could not find clipboard data."));
                return;
            }
            /* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */ /* @ts-ignore: This is for browser compatibility. */
            e.clipboardData.setData("text", selectedText);
            if (textBoxValueDisplay.textContent === null) {
                console.warn(new ReferenceError("Text box value display has null text content."));
                return;
            }
            textBoxValueDisplay.textContent = textBoxValueDisplay.textContent.replace(selectedText, "");
            e.preventDefault();
        });

        textBox.addEventListener("paste", (e) => {
            // @ts-ignore: This is for browser compatibility.
            if (!e.clipboardData) {
                console.warn(new ReferenceError("Could not find clipboard data."));
                return;
            }
            /* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */ /* @ts-ignore: This is for browser compatibility. */
            const pastedText = e.clipboardData.getData("text");
            const selection = window.getSelection();
            if (!selection) {
                console.warn(new ReferenceError("Could not find current text selection."));
                return;
            }
            /* eslint-disable-next-line @typescript-eslint/no-unsafe-call */ /* @ts-ignore: This is for browser compatibility. */
            selection.deleteFromDocument();
            textBoxValueDisplay.textContent += pastedText;
            e.preventDefault();
        });

        textBoxValueDisplay.addEventListener("mouseup", () => {
            const selection = window.getSelection();
            if (!selection) {
                console.warn(new ReferenceError("Could not find current text selection."));
                return;
            }
            textBoxSelection.selectionStart = selection.anchorOffset;
            textBoxSelection.selectionEnd = selection.focusOffset;
        });

        // Add event listener for keyboard input
        textBoxTextarea.addEventListener("keydown", (e) => {
            let preventDefault = true;
            if (e.keyCode === types_KeyboardKey.ENTER) {
                textBoxTextarea.value += "\n";
                textBoxValueDisplay.textContent = textBoxTextarea.value;
            }
            const text = textBoxTextarea.value;
            let newText = text;
            if (!nonTextKeyCodes.includes(e.keyCode)) {
                newText =
                    text.substring(0, Math.min(textBoxSelection.selectionStart, textBoxSelection.selectionEnd)) +
                    e.key +
                    text.substring(Math.max(textBoxSelection.selectionStart, textBoxSelection.selectionEnd));
            } else {
                switch (e.keyCode) {
                    case types_KeyboardKey.BACKSPACE:
                        if (textBoxSelection.selectionStart === textBoxSelection.selectionEnd) {
                            newText = text.substring(0, textBoxSelection.selectionStart - 1) + text.substring(textBoxSelection.selectionEnd);
                        } else {
                            newText = text.substring(0, textBoxSelection.selectionStart) + text.substring(textBoxSelection.selectionEnd);
                        }
                        break;
                    case types_KeyboardKey.DELETE:
                        if (textBoxSelection.selectionStart === textBoxSelection.selectionEnd) {
                            newText = text.substring(0, textBoxSelection.selectionStart) + text.substring(textBoxSelection.selectionEnd + 1);
                        } else {
                            newText = text.substring(0, textBoxSelection.selectionStart) + text.substring(textBoxSelection.selectionEnd);
                        }
                        break;
                    case types_KeyboardKey.ENTER:
                        newText = `${text.substring(0, textBoxSelection.selectionStart)}\n${text.substring(textBoxSelection.selectionEnd)}`;
                        break;
                    case types_KeyboardKey.LEFT:
                        if (textBoxSelection.selectionStart === textBoxSelection.selectionEnd) {
                            if (e.shiftKey) {
                                textBoxSelection.selectionStart--;
                            } else {
                                textBoxSelection.selectionStart--;
                                textBoxSelection.selectionEnd--;
                            }
                        } else if (e.shiftKey) {
                            textBoxSelection.selectionEnd--;
                        } else {
                            textBoxSelection.selectionEnd = textBoxSelection.selectionStart;
                        }
                        break;
                    case types_KeyboardKey.RIGHT:
                        if (textBoxSelection.selectionStart === textBoxSelection.selectionEnd) {
                            textBoxSelection.selectionStart++;
                            textBoxSelection.selectionEnd++;
                        } else if (e.shiftKey) {
                            textBoxSelection.selectionEnd++;
                        } else {
                            textBoxSelection.selectionEnd = textBoxSelection.selectionStart;
                        }
                        break;
                    case types_KeyboardKey.HOME:
                        textBoxSelection.selectionStart = 0;
                        textBoxSelection.selectionEnd = 0;
                        break;
                    case types_KeyboardKey.END:
                        textBoxSelection.selectionStart = text.length;
                        textBoxSelection.selectionEnd = text.length;
                        break;
                    default:
                        preventDefault = false;
                }
            }
            textBoxTextarea.value = newText;
            textBoxValueDisplay.textContent = textBoxTextarea.value;
            if (preventDefault) {
                e.preventDefault();
            }
        });
        textBoxValueDisplay.textContent = "test1234";

        // Add event listener for click to focus
        textBox.addEventListener("click", () => {
            textBoxTextarea.focus();
        });

        textBoxTextarea.addEventListener("input", () => {
            textBoxValueDisplay.textContent = textBoxTextarea.value;
        });

        textBox.appendChild(textBoxTextarea);

        container.appendChild(textBox);

        return textBox;
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

/**
 * Add a scrollbar to an HTML element.
 *
 * @param {Element} element The HTML element to add a scrollbar to.
 * @returns {boolean} True if the scrollbar was added successfully, false otherwise.
 */
function addScrollbarToHTMLElement(element: Element): boolean {
    if (!(element instanceof HTMLElement)) return false;
    // Add a scrollbar to the div element
    // element.style.overflowY = "auto";

    element.style.paddingRight = "10px";
    // Create a scrollbar element
    var scrollbarParent = document.createElement("div");
    scrollbarParent.style.position = "absolute";
    scrollbarParent.style.top = "0px";
    scrollbarParent.style.right = "0px";
    scrollbarParent.style.width = "10px";
    scrollbarParent.style.height = "100%";
    scrollbarParent.style.margin = "0";
    scrollbarParent.style.padding = "0";
    scrollbarParent.style.background = "rgba(100, 100, 100, 1)";
    scrollbarParent.style.zIndex = "100000000000";
    scrollbarParent.classList.add("customScrollbarParent");
    var scrollbar = document.createElement("div");
    scrollbar.style.position = "absolute";
    scrollbar.style.top = "0px";
    scrollbar.style.right = "0px";
    scrollbar.style.width = "10px";
    scrollbar.style.height = "100%";
    scrollbar.style.background = "rgba(255, 255, 255, 1)";
    scrollbar.style.borderRadius = "5px";
    scrollbar.style.zIndex = "100000000000";
    scrollbar.classList.add("customScrollbar");

    // Add the scrollbar to the div element
    scrollbarParent.appendChild(scrollbar);
    element.appendChild(scrollbarParent);

    var mouseDownOnScrollbar = false;
    var mousePosOffset = 0;
    var totalHeight = 0;
    var visibleHeight = 0;
    var scrollPosition = 0;
    var scrollbarHeight = 0;
    var scrollbarTop = 0;

    // Add event listeners to the scrollbar
    scrollbarParent.addEventListener("mousedown", function onScrollbarMouseDown(event: MouseEvent): void {
        event.preventDefault();
        var scrollbarParentClientRect = scrollbarParent.getBoundingClientRect();
        mouseDownOnScrollbar = true;
        mousePosOffset = event.clientY - scrollbarParentClientRect.top - scrollbarTop;
        var mouseY = Math.min(
            scrollbarParentClientRect.top + scrollbarParentClientRect.height,
            Math.max(scrollbarParentClientRect.top, event.clientY - mousePosOffset)
        );
        totalHeight = element.scrollHeight;
        if (element.parentElement) visibleHeight = element.parentElement.getBoundingClientRect().height;
        scrollPosition = Math.min(
            Math.max(0, ((mouseY - scrollbarParentClientRect.top) / (scrollbarParentClientRect.height - scrollbarHeight)) * (totalHeight - visibleHeight)),
            totalHeight - visibleHeight
        );
        element.scrollTop = scrollPosition;
        scrollbarHeight = Math.max(60, (visibleHeight / totalHeight) * visibleHeight);
        scrollbarTop = Math.min((scrollPosition / (totalHeight - visibleHeight)) * (visibleHeight - scrollbarHeight), visibleHeight - scrollbarHeight);
        scrollbar.style.height = `${scrollbarHeight}px`;
        scrollbar.style.top = `${scrollbarTop}px`;
        scrollbarParent.style.top = `${element.scrollTop}px`;
    });

    document.addEventListener("mouseup", function onScrollbarMouseUp(event: MouseEvent): void {
        if (mouseDownOnScrollbar) {
            event.preventDefault();
            mouseDownOnScrollbar = false;
        }
    });

    document.addEventListener("mousemove", function onScrollbarDrag(event: MouseEvent): void {
        if (mouseDownOnScrollbar) {
            event.preventDefault();
            var scrollbarParentClientRect: DOMRect = scrollbarParent.getBoundingClientRect();
            var mouseY: number = Math.min(
                scrollbarParentClientRect.top + scrollbarParentClientRect.height,
                Math.max(scrollbarParentClientRect.top, event.clientY - mousePosOffset)
            );
            totalHeight = element.scrollHeight;
            if (element.parentElement) visibleHeight = element.parentElement.getBoundingClientRect().height;
            scrollPosition = Math.min(
                Math.max(0, ((mouseY - scrollbarParentClientRect.top) / (scrollbarParentClientRect.height - scrollbarHeight)) * (totalHeight - visibleHeight)),
                totalHeight - visibleHeight
            );
            element.scrollTop = scrollPosition;
            scrollbarHeight = Math.max(60, (visibleHeight / totalHeight) * visibleHeight);
            scrollbarTop = Math.min((scrollPosition / (totalHeight - visibleHeight)) * (visibleHeight - scrollbarHeight), visibleHeight - scrollbarHeight);
            scrollbar.style.height = `${scrollbarHeight}px`;
            scrollbar.style.top = `${scrollbarTop}px`;
            scrollbarParent.style.top = `${element.scrollTop}px`;
        }
    });

    // Update the scrollbar position when the div is scrolled
    element.addEventListener("scroll", function updateScrollbarOnElementScroll(): void {
        var scrollPosition: number = element.scrollTop;
        totalHeight = element.scrollHeight;
        if (element.parentElement) visibleHeight = element.parentElement.getBoundingClientRect().height;
        scrollbarHeight = Math.max(60, (visibleHeight / totalHeight) * visibleHeight);
        scrollbarTop = Math.min((scrollPosition / (totalHeight - visibleHeight)) * (visibleHeight - scrollbarHeight), visibleHeight - scrollbarHeight);
        scrollbar.style.height = `${scrollbarHeight}px`;
        scrollbar.style.top = `${scrollbarTop}px`;
        scrollbarParent.style.top = `${Math.min(element.scrollTop, element.scrollHeight - visibleHeight)}px`;
        scrollbarParent.style.height = `${visibleHeight}px`;
    });
    const mutationObserver = new MutationObserver((): void => {
        setTimeout(() => {
            totalHeight = element.scrollHeight;
            if (element.parentElement) visibleHeight = element.parentElement.getBoundingClientRect().height;
            // UNDONE: This did not work because element.scrollHeight includes the additional empty space from the larger element.scrollTop.
            // Snap the scroll position to be within the bounds.
            // element.scrollTop = Math.min(element.scrollTop, totalHeight));
            scrollbarHeight = Math.max(60, (visibleHeight / totalHeight) * visibleHeight);
            scrollbarTop = Math.min((element.scrollTop / (totalHeight - visibleHeight)) * (visibleHeight - scrollbarHeight), visibleHeight - scrollbarHeight);
            scrollbar.style.height = `${scrollbarHeight}px`;
            scrollbar.style.top = `${scrollbarTop}px`;
            scrollbarParent.style.top = `${Math.min(element.scrollTop, element.scrollHeight - visibleHeight)}px`;
            scrollbarParent.style.height = `${visibleHeight}px`;
        }, 10);
    });
    mutationObserver.observe(element, {
        childList: true,
        attributes: true,
        subtree: true,
    });
    return true;
}

var litePlayScreenActive = false;

/* eslint-disable no-useless-computed-key */
/**
 * Maps game mode IDs to their names.
 */
const GameModeIDMap = {
    [-1]: "Unknown",
    [0]: "Survival",
    [1]: "Creative",
    [2]: "Adventure",
    [3]: "GM3",
    [4]: "GM4",
    [5]: "Default",
    [6]: "Spectator",
    [7]: "GM7",
    [8]: "GM8",
    [9]: "GM9",
};
/* eslint-enable no-useless-computed-key */

/**
 * Takes an async callback function and wraps it in a wrapper to void the promise.
 *
 * @param callback The callback to wrap.
 * @returns The wrapped callback.
 */
function voidAsyncCallback(callback: () => Promise<void>): () => void {
    return (): void => void callback();
}

/**
 * Enables the lite play screen.
 */
async function enableLitePlayScreen(noReload = false): Promise<void> {
    if (litePlayScreenActive) {
        return;
    }
    globalThis.litePlayScreenActive = true;
    /**
     * The router facet.
     *
     * @type {FacetTypeMap["core.router"] | undefined}
     */
    const router: FacetTypeMap["core.router"] | undefined = globalThis.getAccessibleFacetSpyFacets?.()["core.router"];
    if (!router) {
        throw new ReferenceError("core.router facet not found");
    }
    /**
     * The original router location.
     */
    const originalRouterLocation = { ...router.history.location };
    if (
        !originalRouterLocation.pathname.startsWith("/ouic/play") /*  ||
        !originalRouterLocation.search
            .replace("?", "")
            .split("&")
            .some((param) => param.split("=")[0] === "isLitePlayScreen" && param.split("=")[1] === "true") */
    ) {
        if (noReload) {
            const titleBarElement = Array.from(document.querySelectorAll("div#root > div > div > div > div.vanilla-neutral20-background"))[0];
            if (titleBarElement) {
                titleBarElement.setAttribute("data-old-title-bar", "true");
            }
        }
        // Array.from(document.getElementById("root").children).forEach((element) => (element.innerHTML = ""));
        router.history.replace(
            `/ouic/play?isLitePlayScreen=true${
                originalRouterLocation.pathname.startsWith("/play/") ?
                    `&tab=${
                        { all: "worlds", realms: "realms", servers: "servers" }[originalRouterLocation.pathname.slice(6)] ??
                        originalRouterLocation.pathname.slice(6)
                    }`
                :   ""
            }`
        );
        if (noReload) {
            Array.from(document.querySelectorAll("div#root > div > div")).forEach((v): void => void v.remove());
        } else {
            if (router.history.location.pathname.startsWith("/ouic/play")) {
                location.reload();
                return;
            }
            console.error("Failed to enable lite play screen, the router path was not changed when attempting to change it.");
            return;
        }
    }
    let i = 0;
    while (
        !Array.from(document.querySelectorAll("div#root > div > div > div > div")).find(
            (element) =>
                !element.classList.contains("vanilla-neutral20-background") && element.hasAttribute("data-landmark-id") && !element.hasAttribute("data-in-use")
        )
    ) {
        if (i === 100) {
            return;
        }
        await new Promise((resolve): void => void setTimeout(resolve, 10));
        i++;
    }
    for (let i = 0; i < 1000; i++) {
        await new Promise((resolve): void => void setTimeout(resolve, 10));
        if (
            Array.from(document.querySelectorAll("div#root > div > div > div > div.vanilla-neutral20-background")).find(
                (element) => !element.hasAttribute("data-old-title-bar")
            )
        ) {
            break;
        }
        continue;
    }
    const elements = Array.from(document.querySelectorAll("div#root > div > div > div > div"));
    /**
     * The title bar element.
     *
     * @type {HTMLDivElement | null}
     */
    const titleBarElement: HTMLDivElement | null =
        elements.find(
            /** @returns {element is HTMLDivElement} */ (element): element is HTMLDivElement =>
                element.classList.contains("vanilla-neutral20-background") &&
                !element.hasAttribute("data-landmark-id") &&
                !element.hasAttribute("data-old-title-bar") &&
                element instanceof HTMLDivElement
        ) ?? null;
    //@ts-ignore
    titleBarElement.setAttribute("data-in-use", "true");
    //@ts-ignore
    titleBarElement.querySelector("div.vanilla-neutral20-text").textContent = "Play";
    /**
     * The content container element.
     *
     * @type {HTMLDivElement | null}
     */
    //@ts-ignore
    const contentContainerElement: HTMLDivElement | null =
        elements.find(
            (element) =>
                !element.classList.contains("vanilla-neutral20-background") && element.hasAttribute("data-landmark-id") && !element.hasAttribute("data-in-use")
        ) ?? null;
    try {
        const realmsListFacet = getAccessibleFacetSpyFacets()["vanilla.realmsListFacet"] ?? (await forceLoadFacet("vanilla.realmsListFacet"));
        if (realmsListFacet.state === 0 && realmsListFacet.realms.length === 0) {
            console.debug("Force fetching realms list."); // DEBUG
            realmsListFacet.forceFetchRealmsList?.();
        }
    } catch {}
    //@ts-ignore
    contentContainerElement.setAttribute("data-in-use", "true");
    //@ts-ignore
    contentContainerElement.innerHTML = `<div style="height: 100%; display: flex; flex-direction: column; justify-content: flex-start; overflow-y: scroll"><div id="litePlayScreen_tabList" style="display: flex; flex-direction: row; width: 90%; margin: 0 5%">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_worldsTabButton" data-tab-id="worlds">Worlds (${
        (
            (getAccessibleFacetSpyFacets()["vanilla.localWorldList"] ?? (await forceLoadFacet("vanilla.localWorldList").catch((): undefined => undefined)))
                ?.localWorlds ?? (await QueryManager.fetchQuery("vanilla.menus.localWorldListQuery").catch((): undefined => undefined))?.worlds
        )?.length ?? "..."
    })</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_realmsTabButton" data-tab-id="realms">Realms (${await (async (): Promise<
        number | "??" | "..." | "!"
    > => {
        const realmsListFacet = getAccessibleFacetSpyFacets()["vanilla.realmsListFacet"] ?? (await forceLoadFacet("vanilla.realmsListFacet"));
        if (realmsListFacet?.state === 0 /* Unknown */) return "??";
        if (realmsListFacet?.state === 1 /* Loading */) return "...";
        if (realmsListFacet?.state === 3 /* Error */) return "!";
        return realmsListFacet?.realms?.length ?? "...";
    })()})</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_friendsTabButton" data-tab-id="friends">Friends (${(function getFriendsTabWorldsCount(
        friends: number,
        lan: number
    ): number | "..." {
        return friends !== undefined || lan !== undefined ? (friends ?? 0) + (lan ?? 0) : "...";
    })(
        (getAccessibleFacetSpyFacets()["vanilla.friendworldlist"] ?? (await forceLoadFacet("vanilla.friendworldlist")))?.friendWorlds?.length,
        (getAccessibleFacetSpyFacets()["vanilla.lanWorldList"] ?? (await forceLoadFacet("vanilla.lanWorldList")))?.lanWorlds.length
    )})</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_serversTabButton" data-tab-id="servers">Servers (${
        (getAccessibleFacetSpyFacets()["vanilla.externalServerWorldList"] ?? (await forceLoadFacet("vanilla.externalServerWorldList")))?.externalServerWorlds
            ?.length ?? "..."
    })</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_featuredTabButton" data-tab-id="featured">Featured (${((
        thirdPartyWorldList
    ): string => {
        if (!thirdPartyWorldList) return "...";
        const serverListIterables =
            thirdPartyWorldList ?
                "thirdPartyWorlds" in thirdPartyWorldList ?
                    [thirdPartyWorldList.thirdPartyWorlds]
                :   [thirdPartyWorldList.creatorExperiences, thirdPartyWorldList.featuredExperiences]
            :   [];
        return serverListIterables.map((v) => v.length).join("+");
    })(getAccessibleFacetSpyFacets()["vanilla.thirdPartyWorldList"] ?? (await forceLoadFacet("vanilla.thirdPartyWorldList")))})</button>
</div><div id="litePlayScreen_tabContent" style="display: flex; flex-direction: column; width: 90%; margin: 0 5%; overflow-y: scroll; justify-content: flex-start; flex-grow: 1"></div></div>`;
    const tabContent = document.getElementById("litePlayScreen_tabContent");
    const tabList = document.getElementById("litePlayScreen_tabList");
    //@ts-ignore
    const tabListButtons = tabList.querySelectorAll("button");
    /**
     * The currently selected page.
     */
    let currentPage = Number(
        originalRouterLocation.search
            .replace("?", "")
            .split("&")
            .find((param) => param.split("=")[0] === "page")
            ?.split("=")[1] ?? 0
    );
    /**
     * The currently selected tab.
     */
    //@ts-ignore
    let currentTab: (typeof tabIDs)[number] =
        originalRouterLocation.search
            .replace("?", "")
            .split("&")
            .find((param) => param.split("=")[0] === "tab")
            ?.split("=")[1] ?? "worlds";
    let silentClick = false;
    /**
     * The tab IDs.
     *
     * @type {["worlds", "realms", "friends", "servers", "featured"]}
     */
    const tabIDs: ["worlds", "realms", "friends", "servers", "featured"] = ["worlds", "realms", "friends", "servers", "featured"];
    /**
     * Changes the page and tab.
     *
     * @param {number} page The page to change to.
     * @param {typeof tabIDs[number]} tab The tab to change to.
     * @param {boolean} [clickTab=true] Whether to click the tab button.
     */
    function changePage(page: number, tab: (typeof tabIDs)[number], clickTab = true): void {
        currentPage = page;
        currentTab = tab;
        if (!router) throw new ReferenceError("The router facet has become unavailable.");
        getAccessibleFacetSpyFacets()["core.router"]?.history.replace(
            `/ouic/play/${tab}?${[
                ...router.history.location.search
                    .replace("?", "")
                    .split("&")
                    .filter((param) => !["page", "tab"].includes(param.split("=")[0]!)),
                `page=${page}`,
                `tab=${tab}`,
            ].join("&")}`
        );
        silentClick = true;
        if (clickTab) {
            tabListButtons[Math.max(0, tabIDs.indexOf(currentTab))]!.dispatchEvent(new Event("click"));
        }
    }
    let currentRenderId = 0n;
    for (let i = 0; i < tabListButtons.length; i++) {
        const index = i;
        // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
        tabListButtons[index]!.addEventListener("click", async () => {
            const renderId = ++currentRenderId;
            if (tabListButtons[index]!.getAttribute("data-tab-id") !== currentTab) {
                if (!silentClick) {
                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                }
                currentPage = 0;
                for (const tabListButton of tabListButtons) {
                    tabListButton.classList.remove("selected");
                }
                tabListButtons[index]!.classList.add("selected");
                changePage(0, tabIDs[index]!, false);
            } else if (!tabListButtons[index]!.classList.contains("selected")) {
                tabListButtons[index]!.classList.add("selected");
            }
            silentClick = false;
            if (!tabContent) throw new ReferenceError("The tab content element could not be found.");
            Array.from(tabContent.children).forEach((element): void => void element.remove());
            /**
             * The ID of the tab button.
             *
             * @type {typeof tabIDs[number]}
             */
            const tabButtonID: (typeof tabIDs)[number] = (tabListButtons[index]!.getAttribute("data-tab-id") ?? "worlds") as (typeof tabIDs)[number];
            switch (tabButtonID) {
                case "worlds": {
                    currentTab = "worlds";
                    const worldListIterable =
                        (
                            getAccessibleFacetSpyFacets()["vanilla.localWorldList"] ??
                            (await forceLoadFacet("vanilla.localWorldList").catch((): undefined => undefined))
                        )?.localWorlds ?? (await QueryManager.fetchQuery("vanilla.menus.localWorldListQuery").catch((): undefined => undefined))?.worlds;
                    if (renderId !== currentRenderId) return;
                    /**
                     * The worlds tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    //@ts-ignore
                    const worldsTabButton: HTMLButtonElement | null = document.getElementById("litePlayScreen_worldsTabButton");
                    if (worldsTabButton) {
                        worldsTabButton.textContent = `Worlds (${worldListIterable?.length ?? 0})`;
                    }
                    const pageCount = Math.ceil((worldListIterable?.length ?? 0) / 5);
                    const buttonBar = document.createElement("div");
                    buttonBar.id = "litePlayScreen_worldsTabButtonBar";
                    buttonBar.style = "width: 100%; display: flex; flex-direction: row; justify-content: space-between; margin: 1em 0";
                    buttonBar.innerHTML = `<div id="litePlayScreen_worldsTabButtonBar_leftButtons" style="display: flex; flex-direction: row; width: 50%; justify-content: flex-start">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-right: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_worldsTabButtonBar_previousPage">Prev.</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-right: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_worldsTabButtonBar_nextPage">Next</button>
    <p style="font-size: 2vw; line-height: 2.8571428572vw; padding: 0.2rem 0; margin: 6px 0; font-family: Minecraft Seven v2">Page ${
        pageCount === 0 ? 0 : currentPage + 1
    } of ${pageCount}</p>
</div>
<div id="litePlayScreen_worldsTabButtonBar_rightButtons" style="display: flex; flex-direction: row; width: 50%; justify-content: flex-end">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-left: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_worldsTabButtonBar_createNewWorld">Create New World</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-left: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_worldsTabButtonBar_importWorld">Import World</button>
</div>`;
                    tabContent.appendChild(buttonBar);
                    const worldListContainer = document.createElement("div");
                    worldListContainer.id = "litePlayScreen_worldsTabWorldList_worldListContainer";
                    worldListContainer.style.flexGrow = "1";
                    worldListContainer.style.display = "block";
                    // worldListContainer.style.display = "contents";
                    worldListContainer.style.width = "100%";
                    // worldListContainer.style.height = "100%";
                    if (!worldListIterable || pageCount === 0) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "No worlds found.";
                        emptyListInfo.style.fontSize = "2vw";
                        emptyListInfo.style.lineHeight = "2.8571428572vw";
                        emptyListInfo.style.padding = "0.2rem 0";
                        emptyListInfo.style.margin = "6px 0";
                        emptyListInfo.style.fontFamily = "Minecraft Seven v2";
                        worldListContainer.appendChild(emptyListInfo);
                    } else {
                        if (currentPage < 0 || currentPage >= pageCount) {
                            changePage(Math.max(0, Math.min(pageCount - 1, 0)), currentTab);
                            return;
                        }
                        const worldList = Array.from<(typeof worldListIterable)[number]>(worldListIterable) as
                            | LocalWorldDataType[]
                            | EngineQueryNonFacetResultMap["vanilla.menus.localWorldListQuery"]["worlds"][number][];
                        if ("lastSaved" in worldList[0]!) (worldList as LocalWorldDataType[]).sort((worldA, worldB) => worldB.lastSaved - worldA.lastSaved);
                        for (let i = currentPage * 5; i < Math.min(worldList.length, (currentPage + 1) * 5); i++) {
                            if (renderId !== currentRenderId) return;
                            let world: LocalWorldDataType;
                            getWorldData: {
                                const world_1 = worldList[i]!;
                                if ("lastSaved" in world_1) {
                                    world = world_1;
                                    break getWorldData;
                                }
                                const world_2 = await QueryManager.fetchQuery("vanilla.menus.localWorldQuery", world_1.id);
                                world = world_2;
                            }
                            const worldButtonContainer = document.createElement("div");
                            worldButtonContainer.id = `litePlayScreen_worldsTabWorldList_worldListContainer_worldButtonContainer_${world.id}`;
                            worldButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const worldButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            worldButton.type = "button";
                            worldButton.classList.add("btn", "nsel");
                            worldButton.style =
                                "display: flex; flex-direction: row; font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2; text-align: left;";
                            worldButton.id = `litePlayScreen_worldsTabWorldList_worldListContainer_worldButton_${world.id}`;
                            // const worldButton_iconContainer = document.createElement("div");
                            // worldButton_iconContainer.style =
                            //     "height: 6vw; width: 10.6666666667vw; padding: 0.1vw 0.2555555556vw 0.1vw 0.1vw; margin: -6px 0 0 -12px; width: fit-content;";
                            const worldButton_icon = document.createElement("img");
                            worldButton_icon.src = world.previewImgPath || "/hbui/assets/thumbnail-default-d0210bba13d939ca9e72.jpg";
                            worldButton_icon.style =
                                "height: calc(6vw - 0.8rem); width: calc(10.6666666667vw - 1.4222222222rem); margin-top: 0.05vw; margin-left: 0.05vw; margin-right: 0.05vw; margin-bottom: 0.05vw; position: absolute; top: calc(-0.05vw + 0.2rem); left: calc(-0.05vw + 0.2rem);";
                            // worldButton_iconContainer.appendChild(worldButton_icon);
                            worldButton.appendChild(worldButton_icon);
                            const worldButtonInner = document.createElement("div");
                            worldButtonInner.style =
                                "width: auto; height: 100%; flex: 1; padding-left: calc((6vw - 0.6rem) * 1.7777777778); margin-right: calc((6vw - 1.8rem) * -1.7777777778); min-width: 0; max-width: 100%;";
                            const worldButton_worldName = document.createElement("span");
                            worldButton_worldName.style = "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 90%; display: block;";
                            worldButton_worldName.textContent = world.name;
                            worldButtonInner.appendChild(worldButton_worldName);
                            const worldButton_worldDetails = document.createElement("span");
                            worldButton_worldDetails.style =
                                "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 90%; display: block; position: absolute; bottom: 0; left: calc((6vw - 0.6rem) * 1.7777777778 + 0.4rem); font-size: 1vw; line-height: 1.4285714288vw;";
                            worldButton_worldDetails.textContent = `Size: ${world.fileSize} | Version: ${world.gameVersion.major}.${world.gameVersion.minor}.${
                                world.gameVersion.patch
                            }.${world.gameVersion.revision}${world.gameVersion.isBeta ? "-beta" : ""}${
                                world.isMultiplayerEnabled ? " | Multiplayer" : " | Singleplayer"
                            } | ${
                                //@ts-ignore
                                GameModeIDMap[world.gameMode]
                            }${world.isHardcore ? " | Hardcore" : ""}${world.isExperimental ? " | Experimental" : ""}${
                                world.playerHasDied ? " | Player Has Died" : ""
                            }`;
                            worldButtonInner.appendChild(worldButton_worldDetails);
                            worldButton.appendChild(worldButtonInner);
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
                            worldButton.addEventListener("click", async () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const worldStartup = getAccessibleFacetSpyFacets()["vanilla.worldStartup"] ?? (await forceLoadFacet("vanilla.worldStartup"));
                                if (worldStartup) {
                                    worldStartup.startLocalWorld(world.id);
                                }
                            });
                            const editWorldButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            editWorldButton.type = "button";
                            editWorldButton.classList.add("btn", "nsel");
                            editWorldButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            editWorldButton.id = `litePlayScreen_worldsTabWorldList_worldListContainer_worldButton_editWorldButton_${world.id}`;
                            const worldID = world.id;
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
                            editWorldButton.addEventListener("click", async () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const router = getAccessibleFacetSpyFacets()["core.router"] ?? (await forceLoadFacet("core.router"));
                                if (router) {
                                    router.history.push(`/edit-world/${worldID}`);
                                }
                            });
                            const editWorldButton_icon = document.createElement("img");
                            editWorldButton_icon.src = "/hbui/assets/Edit-887593a7c3d9749e237a.png";
                            editWorldButton_icon.style = "width: 2vw; height: 2vw;";
                            editWorldButton.appendChild(editWorldButton_icon);
                            const editWorldButton_label = document.createElement("span");
                            editWorldButton_label.style = "position: absolute; bottom: 1rem";
                            editWorldButton_label.textContent = "Edit";
                            editWorldButton.appendChild(editWorldButton_label);
                            worldButtonContainer.appendChild(worldButton);
                            worldButtonContainer.appendChild(editWorldButton);
                            worldListContainer.appendChild(worldButtonContainer);
                        }
                    }
                    if (renderId !== currentRenderId) return;
                    tabContent.appendChild(worldListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_worldsTabButtonBar_leftButtons");
                    if (!leftButtons) throw new ReferenceError("Could not find left buttons.");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1]!.classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0]!.classList.add("disabled");
                    }
                    leftButtons.children[0]!.addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1]!.addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    const rightButtons = document.getElementById("litePlayScreen_worldsTabButtonBar_rightButtons");
                    if (!rightButtons) throw new ReferenceError("Could not find right buttons.");
                    rightButtons.children[0]!.addEventListener("click", () => {
                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        const router = getAccessibleFacetSpyFacets()["core.router"];
                        if (router) {
                            router.history.push(`/start-from-template`);
                        }
                    });
                    // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
                    rightButtons.children[1]!.addEventListener("click", async () => {
                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        const worldTransfer = getAccessibleFacetSpyFacets()["vanilla.worldTransfer"] ?? (await forceLoadFacet("vanilla.worldTransfer"));
                        if (worldTransfer) {
                            worldTransfer.importWorld.run();
                        }
                    });
                    break;
                }
                // TODO: If the realms list is loading when this is rendered, it needs to update once it is done loading.
                case "realms": {
                    currentTab = "realms";
                    const realmsRolesAndPermissionsQueriesFacet =
                        getAccessibleFacetSpyFacets()["vanilla.realmsRolesAndPermissionsQueries"] ??
                        (await forceLoadFacet("vanilla.realmsRolesAndPermissionsQueries"));
                    const realmsListFacet = getAccessibleFacetSpyFacets()["vanilla.realmsListFacet"] ?? (await forceLoadFacet("vanilla.realmsListFacet"));
                    if (renderId !== currentRenderId) return;
                    const realmListIterable = realmsListFacet?.realms;
                    /**
                     * The realms tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    //@ts-ignore
                    const realmsTabButton: HTMLButtonElement | null = document.getElementById("litePlayScreen_realmsTabButton");
                    if (realmsTabButton) {
                        realmsTabButton.textContent = `Realms (${
                            realmsListFacet?.state === 0 /* Unknown */ ? "??"
                            : realmsListFacet?.state === 1 /* Loading */ ? "..."
                            : realmsListFacet?.state === 3 /* Error */ ? "!"
                            : (realmListIterable?.length ?? "...")
                        })`;
                    }
                    const pageCount = Math.ceil((realmListIterable?.length ?? 0) / 5);
                    const buttonBar = document.createElement("div");
                    buttonBar.id = "litePlayScreen_realmsTabButtonBar";
                    buttonBar.style = "width: 100%; display: flex; flex-direction: row; justify-content: space-between; margin: 1em 0";
                    buttonBar.innerHTML = `<div id="litePlayScreen_realmsTabButtonBar_leftButtons" style="display: flex; flex-direction: row; width: 50%; justify-content: flex-start">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-right: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_realmsTabButtonBar_previousPage">Prev.</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-right: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_realmsTabButtonBar_nextPage">Next</button>
    <p style="font-size: 2vw; line-height: 2.8571428572vw; padding: 0.2rem 0; margin: 6px 0; font-family: Minecraft Seven v2">Page ${
        pageCount === 0 ? 0 : currentPage + 1
    } of ${pageCount}</p>
</div>
<div id="litePlayScreen_realmsTabButtonBar_rightButtons" style="display: flex; flex-direction: row; width: 50%; justify-content: flex-end">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-left: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_realmsTabButtonBar_joinRealm">Join Realm</button>
</div>`;
                    tabContent.appendChild(buttonBar);
                    const realmListContainer = document.createElement("div");
                    realmListContainer.id = "litePlayScreen_realmsTabRealmList_realmListContainer";
                    realmListContainer.style.flexGrow = "1";
                    realmListContainer.style.display = "block";
                    // realmListContainer.style.display = "contents";
                    realmListContainer.style.width = "100%";
                    // realmListContainer.style.height = "100%";
                    if (realmsListFacet?.state === 0 /* Unknown */) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "Unknown state.";
                        emptyListInfo.style.fontSize = "2vw";
                        emptyListInfo.style.lineHeight = "2.8571428572vw";
                        emptyListInfo.style.padding = "0.2rem 0";
                        emptyListInfo.style.margin = "6px 0";
                        emptyListInfo.style.fontFamily = "Minecraft Seven v2";
                        realmListContainer.appendChild(emptyListInfo);
                    } else if (realmsListFacet?.state === 1 /* Loading */) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "Loading...";
                        emptyListInfo.style.fontSize = "2vw";
                        emptyListInfo.style.lineHeight = "2.8571428572vw";
                        emptyListInfo.style.padding = "0.2rem 0";
                        emptyListInfo.style.margin = "6px 0";
                        emptyListInfo.style.fontFamily = "Minecraft Seven v2";
                        realmListContainer.appendChild(emptyListInfo);
                    } else if (realmsListFacet?.state === 3 /* Error */) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = `Error: ${realmsListFacet.error}`; // TODO: This needs to use the enum mapping for the error.
                        emptyListInfo.style.fontSize = "2vw";
                        emptyListInfo.style.lineHeight = "2.8571428572vw";
                        emptyListInfo.style.padding = "0.2rem 0";
                        emptyListInfo.style.margin = "6px 0";
                        emptyListInfo.style.fontFamily = "Minecraft Seven v2";
                        realmListContainer.appendChild(emptyListInfo);
                    }
                    if (pageCount === 0 && [0, 1, 3].includes(realmsListFacet?.state)) {
                        /* empty */
                    } else if (!realmListIterable) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "Unable to load realms list.";
                        emptyListInfo.style.fontSize = "2vw";
                        emptyListInfo.style.lineHeight = "2.8571428572vw";
                        emptyListInfo.style.padding = "0.2rem 0";
                        emptyListInfo.style.margin = "6px 0";
                        emptyListInfo.style.fontFamily = "Minecraft Seven v2";
                        realmListContainer.appendChild(emptyListInfo);
                    } else if (pageCount === 0) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "No realms found.";
                        emptyListInfo.style.fontSize = "2vw";
                        emptyListInfo.style.lineHeight = "2.8571428572vw";
                        emptyListInfo.style.padding = "0.2rem 0";
                        emptyListInfo.style.margin = "6px 0";
                        emptyListInfo.style.fontFamily = "Minecraft Seven v2";
                        realmListContainer.appendChild(emptyListInfo);
                    } else {
                        if (currentPage < 0 || currentPage >= pageCount) {
                            changePage(Math.max(0, Math.min(pageCount - 1, 0)), currentTab);
                            return;
                        }
                        const realmListA = Array.from(realmListIterable).sort(
                            (realmA, realmB) => (realmB.world.lastSaved ?? -1) - (realmA.world.lastSaved ?? -1)
                        );
                        const realmListB = [
                            ...realmListA.filter((realm) => !realm.world.closed && !realm.world.expired),
                            ...realmListA.filter((realm) => realm.world.closed || realm.world.expired),
                        ];
                        const realmList = [
                            ...realmListB.filter((realm) => realm.isOwner),
                            ...realmListB.filter(
                                (realm) =>
                                    !realm.isOwner &&
                                    oreUIEnums &&
                                    realmsRolesAndPermissionsQueriesFacet.currentUserRolesAndActionsForAllRealms
                                        .find((r) => r.realmId === `${realm.world.id}`)
                                        // TODO: Figure out what permissions are actually needed in order to access the /realms-settings/<REALM_ID> page for the realm.
                                        ?.actions.includes(oreUIEnums.RealmsPermissionAction.ManageWorlds)
                            ),
                            ...realmListB.filter(
                                (realm) =>
                                    !realm.isOwner &&
                                    !(
                                        oreUIEnums &&
                                        realmsRolesAndPermissionsQueriesFacet.currentUserRolesAndActionsForAllRealms
                                            .find((r) => r.realmId === `${realm.world.id}`)
                                            // TODO: Figure out what permissions are actually needed in order to access the /realms-settings/<REALM_ID> page for the realm.
                                            ?.actions.includes(oreUIEnums.RealmsPermissionAction.ManageWorlds)
                                    )
                            ),
                        ];
                        for (let i = currentPage * 5; i < Math.min(realmList.length, (currentPage + 1) * 5); i++) {
                            if (renderId !== currentRenderId) return;
                            const realm = realmList[i]!;
                            const realmButtonContainer = document.createElement("div");
                            realmButtonContainer.id = `litePlayScreen_realmsTabRealmList_realmListContainer_realmButtonContainer_${realm.world.id}`;
                            realmButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const realmButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            realmButton.type = "button";
                            realmButton.classList.add("btn", "nsel");
                            realmButton.style = "font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2; text-align: left;";
                            realmButton.id = `litePlayScreen_realmsTabRealmList_realmListContainer_realmButton_${realm.world.id}`;
                            const realmButton_realmName = document.createElement("span");
                            realmButton_realmName.style = "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 90%; display: block;";
                            realmButton_realmName.textContent = realm.world.realmName;
                            realmButton.appendChild(realmButton_realmName);
                            const realmButton_realmDetails = document.createElement("span");
                            realmButton_realmDetails.style =
                                "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 90%; display: block; position: absolute; bottom: 0; left: 0.4rem; font-size: 1vw; line-height: 1.4285714288vw;";
                            realmButton_realmDetails.textContent = `Players: ${realm.world.onlinePlayers.length}/${realm.world.maxPlayers}${
                                realm.world.full ? " (Full)" : ""
                            }${
                                realm.world.expired ? " | Expired"
                                : realm.world.closed ? " | Closed"
                                    // REVIEW: Maybe this should show for realms you have management permissions for too.
                                : realm.isOwner ? ` | Days Left: ${realm.world.daysLeft}`
                                : ""
                            } | ${
                                //@ts-ignore
                                GameModeIDMap[realm.world.gameMode]
                            }${realm.world.isHardcore ? " | Hardcore" : ""}${!realm.world.isInitialized ? " | Not Initialized" : ""}${
                                realm.world.slotName ? ` | Slot: ${realm.world.slotName}` : ""
                            } | Description: ${realm.world.description}`;
                            realmButton.appendChild(realmButton_realmDetails);
                            const realmID = realm.world.id;
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
                            realmButton.addEventListener("click", async () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner =
                                    getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"] ?? (await forceLoadFacet("vanilla.networkWorldJoiner"));
                                if (networkWorldJoiner) {
                                    networkWorldJoiner.joinRealmWorld(String(realmID), 0);
                                }
                            });
                            realmButtonContainer.appendChild(realmButton);
                            const realmOptionsButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            realmOptionsButton.type = "button";
                            realmOptionsButton.classList.add("btn", "nsel");
                            realmOptionsButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            realmOptionsButton.id = `litePlayScreen_realmsTabRealmList_realmListContainer_realmButton_editRealmButton_${realm.world.id}`;
                            realmOptionsButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const realmOptionsOverlayElement = document.createElement("div");
                                realmOptionsOverlayElement.id = "realmOptionsOverlayElement";
                                realmOptionsOverlayElement.style =
                                    "backdrop-filter: blur(5px); background-color: #00000080; color: #FFFFFFFF; position: fixed; top: 2.5vh; left: 2.5vw; width: 95vw; height: 95vh; z-index: 100; white-space: pre-wrap; overflow-wrap: anywhere; font-family: Minecraft Seven v2;";
                                realmOptionsOverlayElement.innerHTML = `<button type="button" style="position: absolute; top: 0; right: 0; font-family: Minecraft Seven v2; font-size: 50px; aspect-ratio: 1/1; color: #000000; width: 50px; height: 50px; z-index: 1;" onclick="this.parentElement.remove();"><span style="margin-top: -5px; font-family: Minecraft Seven v2;">x</span></button>
<div style="display: flex; flex-direction: row; height: 100%; width: 100%; padding: 0.5vh 0.5vh">
    <div id="realmOptionsOverlayElement_textElement" style="user-select: text; /* white-space: pre-wrap; overflow-wrap: anywhere;  */width: 100%; height: 100%;">
        <h1 data-realm-options-overlay-field="realmName"></h1>
        <p data-realm-options-overlay-field="slotName" style="display: ${realm.world.slotName ? "block" : "none"}"></p>
        <p>Status: ${
            realm.world.expired ? "Expired"
            : realm.world.closed ? "Closed"
            : "Open"
        }</p>
        <p>Players: ${realm.world.onlinePlayers.length}/${realm.world.maxPlayers}${realm.world.full ? " (Full)" : ""}</p>
        <p>Unread Story Count: ${realm.unreadStoryCount}</p>
        <p data-realm-options-overlay-field="description" style="display: ${realm.world.description ? "block" : "none"}"></p>
        <p style="display: ${realm.world.isHardcore ? "block" : "none"}">Hardcore mode is enabled.</p>
        <p style="display: ${!realm.world.isInitialized ? "block" : "none"}">Realm is not initialized.</p>
        <p data-realm-options-overlay-field="lastSaved"></p>
        <p>Realm ID: ${realm.world.id}</p>
        <p>Owner XUID: ${realm.world.ownerXuid}</p>
        <p>Game Mode: ${
            //@ts-ignore
            GameModeIDMap[realm.world.gameMode]
        }</p>
    </div>
    <div id="realmOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="realmOptionsOverlayElement_joinRealmButton">Join Realm</button>
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="realmOptionsOverlayElement_realmHubButton">Realm Hub</button>
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="realmOptionsOverlayElement_realmsStoriesButton">Realms Stories</button>
    </div>
</div>`;
                                //@ts-ignore
                                realmOptionsOverlayElement.querySelector("[data-realm-options-overlay-field='realmName']").textContent = realm.world.realmName;
                                //@ts-ignore
                                realmOptionsOverlayElement.querySelector("[data-realm-options-overlay-field='slotName']").textContent =
                                    `Slot Name: ${realm.world.slotName}`;
                                //@ts-ignore
                                realmOptionsOverlayElement.querySelector("[data-realm-options-overlay-field='description']").textContent =
                                    `Description: ${realm.world.description}`;
                                if (realm.world.lastSaved !== null) {
                                    //@ts-ignore
                                    realmOptionsOverlayElement.querySelector("[data-realm-options-overlay-field='lastSaved']").textContent =
                                        `Last Saved: ${new Date(realm.world.lastSaved * 1000).toLocaleString()}`;
                                } else {
                                    realmOptionsOverlayElement.querySelector("[data-realm-options-overlay-field='lastSaved']")!.remove();
                                }
                                // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
                                realmOptionsOverlayElement.querySelector("#realmOptionsOverlayElement_joinRealmButton")!.addEventListener("click", async () => {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const networkWorldJoiner =
                                        getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"] ?? (await forceLoadFacet("vanilla.networkWorldJoiner"));
                                    if (networkWorldJoiner) {
                                        networkWorldJoiner.joinRealmWorld(realmID.toString(), 0);
                                        realmOptionsOverlayElement.remove();
                                    }
                                });
                                // realmOptionsOverlayElement.querySelector("#realmOptionsOverlayElement_realmsStoriesButton")!.addEventListener("click", () => {
                                //     getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                //     const router = getAccessibleFacetSpyFacets()["core.router"];
                                //     openRoute: if (router) {
                                //         const previousPathname: string = router.history.location.pathname;
                                //         router.history.push(`/realms/${realmID}/hub`);
                                //         if (previousPathname !== router.history.location.pathname) break openRoute;
                                //         router.history.push(`/realms-story-entry-route/feed/${realmID}`);
                                //     }
                                // });
                                realmOptionsOverlayElement.querySelector("#realmOptionsOverlayElement_realmsStoriesButton")!.addEventListener("click", () => {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const router = getAccessibleFacetSpyFacets()["core.router"];
                                    if (router) {
                                        router.history.push(`/realms-story-entry-route/feed/${realmID}`);
                                        realmOptionsOverlayElement.remove();
                                    }
                                });
                                realmOptionsOverlayElement.querySelector("#realmOptionsOverlayElement_realmHubButton")!.addEventListener("click", () => {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const router = getAccessibleFacetSpyFacets()["core.router"];
                                    if (router) {
                                        router.history.push(`/realms/${realmID}/hub`);
                                        realmOptionsOverlayElement.remove();
                                    }
                                });
                                document.body.appendChild(realmOptionsOverlayElement);
                            });
                            const editRealmButton_icon = document.createElement("img");
                            editRealmButton_icon.src = "/hbui/assets/Options-Horizontal-426f7783c8eede73d0a9.png";
                            editRealmButton_icon.style = "width: 2vw; height: 2vw;";
                            realmOptionsButton.appendChild(editRealmButton_icon);
                            const editRealmButton_label = document.createElement("span");
                            editRealmButton_label.style = "position: absolute; bottom: 1rem";
                            editRealmButton_label.textContent = "More";
                            realmOptionsButton.appendChild(editRealmButton_label);
                            realmButtonContainer.appendChild(realmOptionsButton);
                            if (!oreUIEnums) await oreUIEnumsLoadedPromise;
                            if (
                                realm.isOwner ||
                                (oreUIEnums &&
                                    realmsRolesAndPermissionsQueriesFacet.currentUserRolesAndActionsForAllRealms
                                        .find((r) => r.realmId === `${realm.world.id}`)
                                        // TODO: Figure out what permissions are actually needed in order to access the /realms-settings/<REALM_ID> page for the realm.
                                        ?.actions.includes(oreUIEnums.RealmsPermissionAction.ManageWorlds))
                            ) {
                                const editRealmButton = document.createElement("button");
                                // @ts-ignore: This is for browser compatibility.
                                editRealmButton.type = "button";
                                editRealmButton.classList.add("btn", "nsel");
                                editRealmButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                                editRealmButton.id = `litePlayScreen_realmsTabRealmList_realmListContainer_realmButton_editRealmButton_${realm.world.id}`;
                                const realmID = realm.world.id;
                                editRealmButton.addEventListener("click", () => {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const router = getAccessibleFacetSpyFacets()["core.router"];
                                    if (router) {
                                        router.history.push(`/realm-settings/${realmID}`);
                                    }
                                });
                                const editRealmButton_icon = document.createElement("img");
                                editRealmButton_icon.src = "/hbui/assets/Edit-887593a7c3d9749e237a.png";
                                editRealmButton_icon.style = "width: 2vw; height: 2vw;";
                                editRealmButton.appendChild(editRealmButton_icon);
                                const editRealmButton_label = document.createElement("span");
                                editRealmButton_label.style = "position: absolute; bottom: 1rem";
                                editRealmButton_label.textContent = "Edit";
                                editRealmButton.appendChild(editRealmButton_label);
                                realmButtonContainer.appendChild(editRealmButton);
                            }
                            realmListContainer.appendChild(realmButtonContainer);
                        }
                    }
                    if (renderId !== currentRenderId) return;
                    tabContent.appendChild(realmListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_realmsTabButtonBar_leftButtons");
                    if (!leftButtons) throw new ReferenceError("Could not find left buttons.");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1]!.classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0]!.classList.add("disabled");
                    }
                    leftButtons.children[0]!.addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1]!.addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    const rightButtons = document.getElementById("litePlayScreen_realmsTabButtonBar_rightButtons");
                    if (!rightButtons) throw new ReferenceError("Could not find right buttons.");
                    rightButtons.children[0]!.addEventListener("click", () => {
                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        const router = getAccessibleFacetSpyFacets()["core.router"];
                        if (router) {
                            router.history.push(`/join-realms-server`);
                        }
                    });
                    break;
                }
                case "friends": {
                    currentTab = "friends";
                    /**
                     * @type {(ReturnType<NonNullable<FacetTypeMap["vanilla.friendworldlist"]>["friendWorlds"]["slice"]>[number] | ReturnType<NonNullable<FacetTypeMap["vanilla.lanWorldList"]>["lanWorlds"]["slice"]>[number])[]}
                     */
                    const friendWorldList: (
                        | ReturnType<NonNullable<FacetTypeMap["vanilla.friendworldlist"]>["friendWorlds"]["slice"]>[number]
                        | ReturnType<NonNullable<FacetTypeMap["vanilla.lanWorldList"]>["lanWorlds"]["slice"]>[number]
                    )[] = [
                        ...(getAccessibleFacetSpyFacets()["vanilla.friendworldlist"] ?? (await forceLoadFacet("vanilla.friendworldlist"))).friendWorlds.slice(
                            0
                        ),
                        ...(getAccessibleFacetSpyFacets()["vanilla.lanWorldList"] ?? (await forceLoadFacet("vanilla.lanWorldList"))).lanWorlds.slice(0),
                    ];
                    if (renderId !== currentRenderId) return;
                    /**
                     * The friends tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    //@ts-ignore
                    const friendsTabButton: HTMLButtonElement | null = document.getElementById("litePlayScreen_friendsTabButton");
                    if (friendsTabButton) {
                        friendsTabButton.textContent = `Friends (${friendWorldList?.length ?? 0})`;
                    }
                    const pageCount = Math.ceil((friendWorldList?.length ?? 0) / 5);
                    const buttonBar = document.createElement("div");
                    buttonBar.id = "litePlayScreen_friendsTabButtonBar";
                    buttonBar.style = "width: 100%; display: flex; flex-direction: row; justify-content: space-between; margin: 1em 0";
                    buttonBar.innerHTML = `<div id="litePlayScreen_friendsTabButtonBar_leftButtons" style="display: flex; flex-direction: row; width: 50%; justify-content: flex-start">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-right: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_friendsTabButtonBar_previousPage">Prev.</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-right: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_friendsTabButtonBar_nextPage">Next</button>
    <p style="font-size: 2vw; line-height: 2.8571428572vw; padding: 0.2rem 0; margin: 6px 0; font-family: Minecraft Seven v2">Page ${
        pageCount === 0 ? 0 : currentPage + 1
    } of ${pageCount}</p>
</div>
<div id="litePlayScreen_friendsTabButtonBar_rightButtons" style="display: flex; flex-direction: row; width: 50%; justify-content: flex-end">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-left: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_friendsTabButtonBar_friendsList">Friends List</button>
</div>`;
                    tabContent.appendChild(buttonBar);
                    const friendWorldListContainer = document.createElement("div");
                    friendWorldListContainer.id = "litePlayScreen_friendsTabFriendWorldList_friendWorldListContainer";
                    friendWorldListContainer.style.flexGrow = "1";
                    friendWorldListContainer.style.display = "block";
                    // friendWorldListContainer.style.display = "contents";
                    friendWorldListContainer.style.width = "100%";
                    // friendWorldListContainer.style.height = "100%";
                    if (!friendWorldList || pageCount === 0) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "No friend or LAN worlds found.";
                        emptyListInfo.style.fontSize = "2vw";
                        emptyListInfo.style.lineHeight = "2.8571428572vw";
                        emptyListInfo.style.padding = "0.2rem 0";
                        emptyListInfo.style.margin = "6px 0";
                        emptyListInfo.style.fontFamily = "Minecraft Seven v2";
                        friendWorldListContainer.appendChild(emptyListInfo);
                    } else {
                        if (currentPage < 0 || currentPage >= pageCount) {
                            changePage(Math.max(0, Math.min(pageCount - 1, 0)), currentTab);
                            return;
                        }
                        for (let i = currentPage * 5; i < Math.min(friendWorldList.length, (currentPage + 1) * 5); i++) {
                            if (renderId !== currentRenderId) return;
                            const world = friendWorldList[i]!;
                            const friendWorldButtonContainer = document.createElement("div");
                            friendWorldButtonContainer.id = `litePlayScreen_friendsTabFriendWorldList_friendWorldListContainer_friendWorldButtonContainer_${world.id}`;
                            friendWorldButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const friendWorldButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            friendWorldButton.type = "button";
                            friendWorldButton.classList.add("btn", "nsel");
                            friendWorldButton.style =
                                "font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2; text-align: left;";
                            friendWorldButton.id = `litePlayScreen_friendsTabFriendWorldList_friendWorldListContainer_friendWorldButton_${world.id}`;
                            const friendWorldButton_friendWorldName = document.createElement("span");
                            friendWorldButton_friendWorldName.style =
                                "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 90%; display: block;";
                            friendWorldButton_friendWorldName.textContent = world.name;
                            friendWorldButton.appendChild(friendWorldButton_friendWorldName);
                            const friendWorldButton_friendWorldDetails = document.createElement("span");
                            friendWorldButton_friendWorldDetails.style =
                                "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 90%; display: block; position: absolute; bottom: 0; left: 0.4rem; font-size: 1vw; line-height: 1.4285714288vw;";
                            friendWorldButton_friendWorldDetails.textContent = `${world.ownerName} | Players: ${world.playerCount}/${world.capacity}${
                                "friendOfFriendWorld" in world ?
                                    world.friendOfFriendWorld ?
                                        " | Friend of Friend"
                                    :   " | Friend"
                                :   " | LAN"
                            } | ${
                                //@ts-ignore
                                GameModeIDMap[world.gameMode]
                            }${world.isHardcore ? " | Hardcore" : ""}${"ping" in world && world.ping ? ` | Ping: ${world.ping}` : ""}${
                                "address" in world && world.address !== "UNASSIGNED_SYSTEM_ADDRESS" && world.address ?
                                    ` | Address: ${world.address}:${world.port}`
                                :   ""
                            }`;
                            friendWorldButton.appendChild(friendWorldButton_friendWorldDetails);
                            const friendWorldID = world.id;
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
                            friendWorldButton.addEventListener("click", async () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner =
                                    getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"] ?? (await forceLoadFacet("vanilla.networkWorldJoiner"));
                                if (networkWorldJoiner) {
                                    if ("friendOfFriendWorld" in world) networkWorldJoiner.joinFriendServer(friendWorldID);
                                    else networkWorldJoiner.joinLanServer(friendWorldID);
                                }
                            });
                            friendWorldButtonContainer.appendChild(friendWorldButton);
                            const friendWorldOptionsButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            friendWorldOptionsButton.type = "button";
                            friendWorldOptionsButton.classList.add("btn", "nsel");
                            friendWorldOptionsButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            friendWorldOptionsButton.id = `litePlayScreen_friendsTabFriendWorldList_friendWorldListContainer_friendWorldButton_editFriendWorldButton_${world.id}`;
                            friendWorldOptionsButton.addEventListener("click", () => {
                                try {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const friendWorldOptionsOverlayElement = document.createElement("div");
                                    friendWorldOptionsOverlayElement.id = "friendWorldOptionsOverlayElement";
                                    friendWorldOptionsOverlayElement.setAttribute("data-friend-world-id", friendWorldID);
                                    friendWorldOptionsOverlayElement.style =
                                        "backdrop-filter: blur(5px); background-color: #00000080; color: #FFFFFFFF; position: fixed; top: 2.5vh; left: 2.5vw; width: 95vw; height: 95vh; z-index: 100; white-space: pre-wrap; overflow-wrap: anywhere; font-family: Minecraft Seven v2;";
                                    friendWorldOptionsOverlayElement.innerHTML = `<button type="button" style="position: absolute; top: 0; right: 0; font-family: Minecraft Seven v2; font-size: 50px; aspect-ratio: 1/1; color: #000000; width: 50px; height: 50px; z-index: 1;" onclick="this.parentElement.remove();"><span style="margin-top: -5px; font-family: Minecraft Seven v2;">x</span></button>
<div style="display: flex; flex-direction: row; height: 100%; width: 100%; padding: 0.5vh 0.5vh">
    <div id="friendWorldOptionsOverlayElement_textElement" style="user-select: text; /* white-space: pre-wrap; overflow-wrap: anywhere;  */width: 100%; height: 100%;">
        <h1 data-friend-world-options-overlay-field="friendWorldName"></h1>
        <p data-friend-world-options-overlay-field="ownerName"></p>
        <p style="display: ${"ownerId" in world ? "block" : "none"}">Owner XUID: ${("ownerId" in world && world.ownerId) || "N/A"}</p>
        <p>${
            "friendOfFriendWorld" in world ?
                world.friendOfFriendWorld ?
                    "Friend of Friend"
                :   "Friend"
            :   "LAN"
        }</p>
        <p>Players: ${world.playerCount}/${world.capacity}</p>
        <p data-friend-world-options-overlay-field="ping" style="display: ${"ping" in world && world.ping ? "block" : "none"}">Ping: ${
            ("ping" in world && world.ping) || "N/A"
        }</p>
        <p style="display: ${world.isHardcore ? "block" : "none"}">Hardcore mode is enabled.</p>
        <p data-friend-world-options-overlay-field="address" style="display: ${
            "address" in world && world.address !== "UNASSIGNED_SYSTEM_ADDRESS" && world.address ? "block" : "none"
        }"></p>
        <p>World ID: ${world.id}</p>
        <p>Game Mode: ${
            //@ts-ignore
            GameModeIDMap[world.gameMode]
        }</p>
    </div>
    <div id="friendWorldOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="friendWorldOptionsOverlayElement_joinFriendWorldButton">Join World</button>
    </div>
</div>`;
                                    friendWorldOptionsOverlayElement.querySelector("[data-friend-world-options-overlay-field='friendWorldName']")!.textContent =
                                        world.name;
                                    friendWorldOptionsOverlayElement.querySelector("[data-friend-world-options-overlay-field='ownerName']")!.textContent =
                                        world.ownerName;
                                    friendWorldOptionsOverlayElement
                                        .querySelector("#friendWorldOptionsOverlayElement_joinFriendWorldButton")!
                                        // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
                                        .addEventListener("click", async () => {
                                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                            const networkWorldJoiner =
                                                getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"] ??
                                                (await forceLoadFacet("vanilla.networkWorldJoiner"));
                                            if (networkWorldJoiner) {
                                                if ("friendOfFriendWorld" in world) networkWorldJoiner.joinFriendServer(friendWorldID);
                                                else networkWorldJoiner.joinLanServer(friendWorldID);
                                            }
                                        });
                                    document.body.appendChild(friendWorldOptionsOverlayElement);
                                } catch (e) {
                                    console.error(e);
                                }
                            });
                            const friendWorldOptionsButton_icon = document.createElement("img");
                            friendWorldOptionsButton_icon.src = "/hbui/assets/Options-Horizontal-426f7783c8eede73d0a9.png";
                            friendWorldOptionsButton_icon.style = "width: 2vw; height: 2vw;";
                            friendWorldOptionsButton.appendChild(friendWorldOptionsButton_icon);
                            const friendWorldOptionsButton_label = document.createElement("span");
                            friendWorldOptionsButton_label.style = "position: absolute; bottom: 1rem";
                            friendWorldOptionsButton_label.textContent = "More";
                            friendWorldOptionsButton.appendChild(friendWorldOptionsButton_label);
                            friendWorldButtonContainer.appendChild(friendWorldOptionsButton);
                            friendWorldListContainer.appendChild(friendWorldButtonContainer);
                        }
                    }
                    if (renderId !== currentRenderId) return;
                    tabContent.appendChild(friendWorldListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_friendsTabButtonBar_leftButtons");
                    if (!leftButtons) throw new ReferenceError("Could not find left buttons.");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1]!.classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0]!.classList.add("disabled");
                    }
                    leftButtons.children[0]!.addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1]!.addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    const rightButtons = document.getElementById("litePlayScreen_friendsTabButtonBar_rightButtons");
                    if (!rightButtons) throw new ReferenceError("Could not find right buttons.");
                    rightButtons.children[0]!.addEventListener("click", () => {
                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        const router = getAccessibleFacetSpyFacets()["core.router"];
                        if (router) {
                            // router.history.push(`/ouic/friends/friends?page=0&tab=friends`);
                            router.history.push(`/friends-drawer`);
                        }
                    });
                    break;
                }
                case "servers": {
                    currentTab = "servers";
                    const serverListIterable = (
                        getAccessibleFacetSpyFacets()["vanilla.externalServerWorldList"] ?? (await forceLoadFacet("vanilla.externalServerWorldList"))
                    )?.externalServerWorlds.filter((server) => server.name !== "LitePlayScreenEnabled" && !server.name.startsWith("INTERNALSETTINGS:"));
                    if (renderId !== currentRenderId) return;
                    /**
                     * The servers tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    //@ts-ignore
                    const serversTabButton: HTMLButtonElement | null = document.getElementById("litePlayScreen_serversTabButton");
                    if (serversTabButton) {
                        serversTabButton.textContent = `Servers (${serverListIterable?.length ?? 0})`;
                    }
                    const pageCount = Math.ceil((serverListIterable?.length ?? 0) / 5);
                    const buttonBar = document.createElement("div");
                    buttonBar.id = "litePlayScreen_serversTabButtonBar";
                    buttonBar.style = "width: 100%; display: flex; flex-direction: row; justify-content: space-between; margin: 1em 0";
                    buttonBar.innerHTML = `<div id="litePlayScreen_serversTabButtonBar_leftButtons" style="display: flex; flex-direction: row; width: 50%; justify-content: flex-start">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-right: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_serversTabButtonBar_previousPage">Prev.</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-right: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_serversTabButtonBar_nextPage">Next</button>
    <p style="font-size: 2vw; line-height: 2.8571428572vw; padding: 0.2rem 0; margin: 6px 0; font-family: Minecraft Seven v2">Page ${
        pageCount === 0 ? 0 : currentPage + 1
    } of ${pageCount}</p>
</div>
<div id="litePlayScreen_serversTabButtonBar_rightButtons" style="display: flex; flex-direction: row; width: 50%; justify-content: flex-end">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-left: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_serversTabButtonBar_addServer">Add Server</button>
</div>`;
                    tabContent.appendChild(buttonBar);
                    const serverListContainer = document.createElement("div");
                    serverListContainer.id = "litePlayScreen_serversTabServerList_serverListContainer";
                    serverListContainer.style.flexGrow = "1";
                    serverListContainer.style.display = "block";
                    // serverListContainer.style.display = "contents";
                    serverListContainer.style.width = "100%";
                    // serverListContainer.style.height = "100%";
                    if (!serverListIterable || pageCount === 0) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "No external servers found.";
                        emptyListInfo.style.fontSize = "2vw";
                        emptyListInfo.style.lineHeight = "2.8571428572vw";
                        emptyListInfo.style.padding = "0.2rem 0";
                        emptyListInfo.style.margin = "6px 0";
                        emptyListInfo.style.fontFamily = "Minecraft Seven v2";
                        serverListContainer.appendChild(emptyListInfo);
                    } else {
                        if (currentPage < 0 || currentPage >= pageCount) {
                            changePage(Math.max(0, Math.min(pageCount - 1, 0)), currentTab);
                            return;
                        }
                        const serverList = Array.from(serverListIterable).sort((serverA, serverB) => Number(serverA.id) - Number(serverB.id));
                        for (let i = currentPage * 5; i < Math.min(serverList.length, (currentPage + 1) * 5); i++) {
                            if (renderId !== currentRenderId) return;
                            const server = serverList[i]!;
                            const serverButtonContainer = document.createElement("div");
                            serverButtonContainer.id = `litePlayScreen_serversTabServerList_serverListContainer_serverButtonContainer_${server.id}`;
                            serverButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const serverButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            serverButton.type = "button";
                            serverButton.classList.add("btn", "nsel");
                            serverButton.style =
                                "font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2; text-align: left;";
                            serverButton.id = `litePlayScreen_serversTabServerList_serverListContainer_serverButton_${server.id}`;
                            const serverButton_serverName = document.createElement("span");
                            serverButton_serverName.style = "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 90%; display: block;";
                            serverButton_serverName.textContent = server.name;
                            serverButton.appendChild(serverButton_serverName);
                            const serverButton_serverDetails = document.createElement("span");
                            serverButton_serverDetails.style =
                                "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 90%; display: block; position: absolute; bottom: 0; left: 0.4rem; font-size: 1vw; line-height: 1.4285714288vw;";
                            serverButton_serverDetails.textContent = `Players: ${server.playerCount}/${server.capacity}${
                                server.msgOfTheDay ? ` | MOTD: ${server.msgOfTheDay}` : ""
                            } | Ping: ${server.ping} | ID: ${server.id} | ${server.description ? `Description: ${server.description}` : ""}`;
                            serverButton.appendChild(serverButton_serverDetails);
                            const serverID = server.id;
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
                            serverButton.addEventListener("click", async () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner =
                                    getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"] ?? (await forceLoadFacet("vanilla.networkWorldJoiner"));
                                if (networkWorldJoiner) {
                                    networkWorldJoiner.joinExternalServer(String(serverID));
                                }
                            });
                            serverButtonContainer.appendChild(serverButton);
                            const serverOptionsButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            serverOptionsButton.type = "button";
                            serverOptionsButton.classList.add("btn", "nsel");
                            serverOptionsButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            serverOptionsButton.id = `litePlayScreen_serversTabServerList_serverListContainer_serverButton_editServerButton_${server.id}`;
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
                            serverOptionsButton.addEventListener("click", async () => {
                                try {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const serverOptionsOverlayElement = document.createElement("div");
                                    serverOptionsOverlayElement.id = "serverOptionsOverlayElement";
                                    serverOptionsOverlayElement.setAttribute("data-server-id", serverID);
                                    serverOptionsOverlayElement.style =
                                        "backdrop-filter: blur(5px); background-color: #00000080; color: #FFFFFFFF; position: fixed; top: 2.5vh; left: 2.5vw; width: 95vw; height: 95vh; z-index: 100; white-space: pre-wrap; overflow-wrap: anywhere; font-family: Minecraft Seven v2;";
                                    serverOptionsOverlayElement.innerHTML = `<button type="button" style="position: absolute; top: 0; right: 0; font-family: Minecraft Seven v2; font-size: 50px; aspect-ratio: 1/1; color: #000000; width: 50px; height: 50px; z-index: 1;" onclick="this.parentElement.remove();"><span style="margin-top: -5px; font-family: Minecraft Seven v2;">x</span></button>
<div style="display: flex; flex-direction: row; height: 100%; width: 100%; padding: 0.5vh 0.5vh">
    <div id="serverOptionsOverlayElement_textElement" style="user-select: text; /* white-space: pre-wrap; overflow-wrap: anywhere;  */width: 100%; height: 100%;">
        <h1 data-server-options-overlay-field="serverName"></h1>
        <p data-server-options-overlay-field="motd"></p>
        <p>Ping: <span>${server.ping} (${server.pingStatus})</span></p>
        <p>Players: ${server.playerCount}/${server.capacity}</p>
        <p data-server-options-overlay-field="description" style="display: ${server.description ? "block" : "none"}"></p>
        <p>Server ID: ${server.id}</p>
        <p data-server-options-overlay-field="ip">IP: Loading...</p>
        <p data-server-options-overlay-field="type">Type: Loading...</p>
        <p data-server-options-overlay-field="isSupportedForPartyTravel" style="display: none;"></p>
        <img data-server-options-overlay-field="favicon" />
        <img data-server-options-overlay-field="image" />
    </div>
    <div id="serverOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="serverOptionsOverlayElement_joinServerButton">Join Server</button>
    </div>
</div>`;
                                    //@ts-ignore
                                    serverOptionsOverlayElement.querySelector("[data-server-options-overlay-field='serverName']").textContent = server.name;
                                    //@ts-ignore
                                    serverOptionsOverlayElement.querySelector("[data-server-options-overlay-field='description']").textContent =
                                        `Description: ${server.description}`;
                                    //@ts-ignore
                                    serverOptionsOverlayElement.querySelector("[data-server-options-overlay-field='motd']").textContent =
                                        `MOTD: ${server.msgOfTheDay}`;
                                    //@ts-ignore
                                    serverOptionsOverlayElement.querySelector("[data-server-options-overlay-field='favicon']").src = server.image;
                                    //@ts-ignore
                                    serverOptionsOverlayElement
                                        .querySelector("#serverOptionsOverlayElement_joinServerButton")
                                        // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
                                        .addEventListener("click", async () => {
                                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                            const networkWorldJoiner =
                                                getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"] ??
                                                (await forceLoadFacet("vanilla.networkWorldJoiner"));
                                            if (networkWorldJoiner) {
                                                networkWorldJoiner.joinExternalServer(serverID.toString());
                                            }
                                        });
                                    document.body.appendChild(serverOptionsOverlayElement);
                                    (
                                        getAccessibleFacetSpyFacets()["vanilla.networkWorldDetails"] ?? (await forceLoadFacet("vanilla.networkWorldDetails"))
                                    )?.loadNetworkWorldDetails(serverID, 1);
                                } catch (e) {
                                    console.error(e);
                                }
                            });
                            const serverOptionsButton_icon = document.createElement("img");
                            serverOptionsButton_icon.src = "/hbui/assets/Options-Horizontal-426f7783c8eede73d0a9.png";
                            serverOptionsButton_icon.style = "width: 2vw; height: 2vw;";
                            serverOptionsButton.appendChild(serverOptionsButton_icon);
                            const serverOptionsButton_label = document.createElement("span");
                            serverOptionsButton_label.style = "position: absolute; bottom: 1rem";
                            serverOptionsButton_label.textContent = "More";
                            serverOptionsButton.appendChild(serverOptionsButton_label);
                            serverButtonContainer.appendChild(serverOptionsButton);
                            const editServerButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            editServerButton.type = "button";
                            editServerButton.classList.add("btn", "nsel");
                            editServerButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            editServerButton.id = `litePlayScreen_serversTabServerList_serverListContainer_serverButton_editServerButton_${server.id}`;
                            editServerButton.addEventListener(
                                "click",
                                (): void =>
                                    void (async (): Promise<void> => {
                                        (
                                            getAccessibleFacetSpyFacets()["vanilla.networkWorldDetails"] ??
                                            (await forceLoadFacet("vanilla.networkWorldDetails"))
                                        )?.loadNetworkWorldDetails(serverID, 1);
                                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                        const router = getAccessibleFacetSpyFacets()["core.router"];
                                        if (router) {
                                            router.history.push(`/play/servers/${serverID}/external/edit`);
                                        }
                                    })()
                            );
                            const editServerButton_icon = document.createElement("img");
                            editServerButton_icon.src = "/hbui/assets/Edit-887593a7c3d9749e237a.png";
                            editServerButton_icon.style = "width: 2vw; height: 2vw;";
                            editServerButton.appendChild(editServerButton_icon);
                            const editServerButton_label = document.createElement("span");
                            editServerButton_label.style = "position: absolute; bottom: 1rem";
                            editServerButton_label.textContent = "Edit";
                            editServerButton.appendChild(editServerButton_label);
                            serverButtonContainer.appendChild(editServerButton);
                            serverListContainer.appendChild(serverButtonContainer);
                        }
                    }
                    if (renderId !== currentRenderId) return;
                    tabContent.appendChild(serverListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_serversTabButtonBar_leftButtons");
                    if (!leftButtons) throw new ReferenceError("Could not find left buttons.");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1]!.classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0]!.classList.add("disabled");
                    }
                    leftButtons.children[0]!.addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1]!.addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    const rightButtons = document.getElementById("litePlayScreen_serversTabButtonBar_rightButtons");
                    if (!rightButtons) throw new ReferenceError("Could not find right buttons.");
                    rightButtons.children[0]!.addEventListener("click", () => {
                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        const router = getAccessibleFacetSpyFacets()["core.router"];
                        if (router) {
                            router.history.push(`/play/servers/add`);
                        }
                    });
                    break;
                }
                case "featured": {
                    currentTab = "featured";
                    const thirdPartyWorldList =
                        getAccessibleFacetSpyFacets()["vanilla.thirdPartyWorldList"] ?? (await forceLoadFacet("vanilla.thirdPartyWorldList"));
                    if (renderId !== currentRenderId) return;
                    const serverListIterables =
                        thirdPartyWorldList ?
                            "thirdPartyWorlds" in thirdPartyWorldList ?
                                [thirdPartyWorldList.thirdPartyWorlds]
                            :   [thirdPartyWorldList.creatorExperiences, thirdPartyWorldList.featuredExperiences]
                        :   [];
                    const iterableTypeNameMap =
                        thirdPartyWorldList ?
                            "thirdPartyWorlds" in thirdPartyWorldList ?
                                ["Third Party World"]
                            :   ["Creator Experience", "Featured Experience"]
                        :   [];
                    /**
                     * The featured tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    //@ts-ignore
                    const featuredTabButton: HTMLButtonElement | null = document.getElementById("litePlayScreen_featuredTabButton");
                    if (featuredTabButton) {
                        featuredTabButton.textContent = `Featured (${serverListIterables.map((v) => v.length).join("+")})`;
                    }
                    const pageCount = Math.ceil(serverListIterables.reduce((p, v) => p + v.length, 0) / 5);
                    const buttonBar = document.createElement("div");
                    buttonBar.id = "litePlayScreen_featuredTabButtonBar";
                    buttonBar.style = "width: 100%; display: flex; flex-direction: row; justify-content: space-between; margin: 1em 0";
                    buttonBar.innerHTML = `<div id="litePlayScreen_featuredTabButtonBar_leftButtons" style="display: flex; flex-direction: row; width: 50%; justify-content: flex-start">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-right: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_featuredTabButtonBar_previousPage">Prev.</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-right: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_featuredTabButtonBar_nextPage">Next</button>
    <p style="font-size: 2vw; line-height: 2.8571428572vw; padding: 0.2rem 0; margin: 6px 0; font-family: Minecraft Seven v2">Page ${
        pageCount === 0 ? 0 : currentPage + 1
    } of ${pageCount}</p>
</div>
<div id="litePlayScreen_featuredTabButtonBar_rightButtons" style="display: flex; flex-direction: row; width: 50%; justify-content: flex-end"></div>`;
                    tabContent.appendChild(buttonBar);
                    const serverListContainer = document.createElement("div");
                    serverListContainer.id = "litePlayScreen_featuredTabServerList_serverListContainer";
                    serverListContainer.style.flexGrow = "1";
                    serverListContainer.style.display = "block";
                    // serverListContainer.style.display = "contents";
                    serverListContainer.style.width = "100%";
                    // serverListContainer.style.height = "100%";
                    if (!serverListIterables.length || pageCount === 0) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "No featured servers found.";
                        emptyListInfo.style.fontSize = "2vw";
                        emptyListInfo.style.lineHeight = "2.8571428572vw";
                        emptyListInfo.style.padding = "0.2rem 0";
                        emptyListInfo.style.margin = "6px 0";
                        emptyListInfo.style.fontFamily = "Minecraft Seven v2";
                        serverListContainer.appendChild(emptyListInfo);
                    } else {
                        if (currentPage < 0 || currentPage >= pageCount) {
                            changePage(Math.max(0, Math.min(pageCount - 1, 0)), currentTab);
                            return;
                        }
                        const serverList = serverListIterables
                            .map((v) => Array.from(v))
                            .flat()
                            .sort((serverA, serverB) => Number(serverA.id) - Number(serverB.id));
                        for (let i = currentPage * 5; i < Math.min(serverList.length, (currentPage + 1) * 5); i++) {
                            if (renderId !== currentRenderId) return;
                            const server = serverList[i]!;
                            const serverButtonContainer = document.createElement("div");
                            serverButtonContainer.id = `litePlayScreen_featuredTabServerList_serverListContainer_serverButtonContainer_${server.id}`;
                            serverButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const serverButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            serverButton.type = "button";
                            serverButton.classList.add("btn", "nsel");
                            serverButton.style =
                                "font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2; text-align: left;";
                            serverButton.id = `litePlayScreen_featuredTabServerList_serverListContainer_serverButton_${server.id}`;
                            const serverButton_serverName = document.createElement("span");
                            serverButton_serverName.style = "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 90%; display: block;";
                            serverButton_serverName.textContent = server.name;
                            serverButton.appendChild(serverButton_serverName);
                            const serverButton_serverDetails = document.createElement("span");
                            serverButton_serverDetails.style =
                                "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 90%; display: block; position: absolute; bottom: 0; left: 0.4rem; font-size: 1vw; line-height: 1.4285714288vw;";
                            serverButton_serverDetails.classList.add("fc77bf1310dc483c1eba");
                            serverButton_serverDetails.textContent = `${serverListIterables.length > 1 ? `${iterableTypeNameMap[serverListIterables.findIndex((v) => v.includes(server))]} | ` : ""}Players: ${server.playerCount}/${server.capacity}${
                                server.msgOfTheDay ? ` | MOTD: ${server.msgOfTheDay}` : ""
                            } | Ping: ${server.ping} | ${server.description ? `Description: ${server.description}` : ""}`;
                            serverButton.appendChild(serverButton_serverDetails);
                            const serverID = server.id;
                            // eslint-disable-next-line @typescript-eslint/no-misused-promises -- This is intentional.
                            serverButton.addEventListener("click", async () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner =
                                    getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"] ?? (await forceLoadFacet("vanilla.networkWorldJoiner"));
                                if (networkWorldJoiner) {
                                    networkWorldJoiner.joinExternalServer(String(serverID));
                                }
                            });
                            serverButtonContainer.appendChild(serverButton);
                            const serverOptionsButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            serverOptionsButton.type = "button";
                            serverOptionsButton.classList.add("btn", "nsel");
                            serverOptionsButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            serverOptionsButton.id = `litePlayScreen_featuredTabServerList_serverListContainer_serverButton_editServerButton_${server.id}`;
                            serverOptionsButton.addEventListener("click", (async () => {
                                try {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const serverOptionsOverlayElement = document.createElement("div");
                                    serverOptionsOverlayElement.id = "serverOptionsOverlayElement";
                                    serverOptionsOverlayElement.setAttribute("data-server-id", serverID);
                                    serverOptionsOverlayElement.style =
                                        "backdrop-filter: blur(5px); background-color: #00000080; color: #FFFFFFFF; position: fixed; top: 2.5vh; left: 2.5vw; width: 95vw; height: 95vh; z-index: 100; white-space: pre-wrap; overflow-wrap: anywhere; font-family: Minecraft Seven v2;";
                                    serverOptionsOverlayElement.innerHTML = `<button type="button" style="position: absolute; top: 0; right: 0; font-family: Minecraft Seven v2; font-size: 50px; aspect-ratio: 1/1; color: #000000; width: 50px; height: 50px; z-index: 1;" onclick="this.parentElement.remove();"><span style="margin-top: -5px; font-family: Minecraft Seven v2;">x</span></button>
<div style="display: flex; flex-direction: row; height: 100%; width: 100%; padding: 0.5vh 0.5vh">
    <div id="serverOptionsOverlayElement_textElement" style="user-select: text; /* white-space: pre-wrap; overflow-wrap: anywhere;  */width: 100%; height: 100%;">
        <h1 data-server-options-overlay-field="serverName"></h1>
        <p data-server-options-overlay-field="motd"></p>
        <p>Ping: <span>${server.ping} (${server.pingStatus})</span></p>
        <p>Players: ${server.playerCount}/${server.capacity}</p>
        <p data-server-options-overlay-field="description"></p>
        <p>Server ID: ${server.id}</p>
        <p data-server-options-overlay-field="ip">IP: Loading...</p>
        <p data-server-options-overlay-field="type">Type: Loading...</p>
        <p data-server-options-overlay-field="isSupportedForPartyTravel" style="display: none;"></p>
        <img data-server-options-overlay-field="image" />
    </div>
    <div id="serverOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="serverOptionsOverlayElement_joinServerButton">Join Server</button>
    </div>
</div>`;

                                    // Set these options here as text to prevent remote code execution.
                                    //@ts-ignore
                                    serverOptionsOverlayElement.querySelector("[data-server-options-overlay-field='serverName']").textContent = server.name;
                                    //@ts-ignore
                                    serverOptionsOverlayElement.querySelector("[data-server-options-overlay-field='description']").textContent =
                                        `Description: ${server.description}`;
                                    //@ts-ignore
                                    serverOptionsOverlayElement.querySelector("[data-server-options-overlay-field='motd']").textContent =
                                        `MOTD: ${server.msgOfTheDay}`;

                                    //@ts-ignore
                                    serverOptionsOverlayElement
                                        .querySelector("#serverOptionsOverlayElement_joinServerButton")
                                        .addEventListener("click", (async () => {
                                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                            const networkWorldJoiner =
                                                getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"] ??
                                                (await forceLoadFacet("vanilla.networkWorldJoiner"));
                                            if (networkWorldJoiner) {
                                                networkWorldJoiner.joinExternalServer(serverID.toString());
                                            }
                                        }) as () => void);
                                    document.body.appendChild(serverOptionsOverlayElement);
                                    (
                                        getAccessibleFacetSpyFacets()["vanilla.networkWorldDetails"] ?? (await forceLoadFacet("vanilla.networkWorldDetails"))
                                    )?.loadNetworkWorldDetails(serverID, 0);
                                } catch (e) {
                                    console.error(e);
                                }
                            }) as () => void);
                            const serverOptionsButton_icon = document.createElement("img");
                            serverOptionsButton_icon.src = "/hbui/assets/Options-Horizontal-426f7783c8eede73d0a9.png";
                            serverOptionsButton_icon.style = "width: 2vw; height: 2vw;";
                            serverOptionsButton.appendChild(serverOptionsButton_icon);
                            const serverOptionsButton_label = document.createElement("span");
                            serverOptionsButton_label.style = "position: absolute; bottom: 1rem";
                            serverOptionsButton_label.textContent = "More";
                            serverOptionsButton.appendChild(serverOptionsButton_label);
                            serverButtonContainer.appendChild(serverOptionsButton);
                            const editServerButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            editServerButton.type = "button";
                            editServerButton.classList.add("btn", "nsel");
                            editServerButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            editServerButton.id = `litePlayScreen_featuredTabServerList_serverListContainer_serverButton_editServerButton_${server.id}`;
                            editServerButton.addEventListener(
                                "click",
                                (): void =>
                                    void (async (): Promise<void> => {
                                        (
                                            getAccessibleFacetSpyFacets()["vanilla.networkWorldDetails"] ??
                                            (await forceLoadFacet("vanilla.networkWorldDetails"))
                                        )?.loadNetworkWorldDetails(serverID, 0);
                                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                        const router = getAccessibleFacetSpyFacets()["core.router"];
                                        if (router) {
                                            router.history.push(`/play/servers/${serverID}/external/edit`);
                                        }
                                    })()
                            );
                            const editServerButton_icon = document.createElement("img");
                            editServerButton_icon.src = "/hbui/assets/Edit-887593a7c3d9749e237a.png";
                            editServerButton_icon.style = "width: 2vw; height: 2vw;";
                            editServerButton.appendChild(editServerButton_icon);
                            const editServerButton_label = document.createElement("span");
                            editServerButton_label.style = "position: absolute; bottom: 1rem";
                            editServerButton_label.textContent = "Edit";
                            editServerButton.appendChild(editServerButton_label);
                            serverButtonContainer.appendChild(editServerButton);
                            serverListContainer.appendChild(serverButtonContainer);
                        }
                    }
                    if (renderId !== currentRenderId) return;
                    tabContent.appendChild(serverListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_featuredTabButtonBar_leftButtons");
                    if (!leftButtons) throw new ReferenceError("Could not find left buttons.");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1]!.classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0]!.classList.add("disabled");
                    }
                    leftButtons.children[0]!.addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1]!.addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    break;
                }
                // no default
            }
        });
    }
    silentClick = true;
    tabListButtons[Math.max(0, tabIDs.indexOf(currentTab))]!.dispatchEvent(new Event("click"));
    if (window.observingExternalServerWorldListForLitePlayScreenServersTab !== true) {
        window.observingExternalServerWorldListForLitePlayScreenServersTab = true;
        FacetManager.observeFacetData("vanilla.externalServerWorldList", (externalServerWorldList) => {
            /**
             * The servers tab button.
             *
             * @type {HTMLButtonElement | null}
             */
            //@ts-ignore
            const serversTabButton: HTMLButtonElement | null = document.getElementById("litePlayScreen_serversTabButton");
            if (serversTabButton) {
                serversTabButton.textContent = `Servers (${
                    externalServerWorldList.externalServerWorlds.filter(
                        (server) => server.name !== "LitePlayScreenEnabled" && !server.name.startsWith("INTERNALSETTINGS:")
                    ).length
                })`;
            }
            if (currentTab !== "servers") {
                return;
            } /* 
            if (document.getElementById("serverOptionsOverlayElement")) {
            } */
            for (const server of Array.from(externalServerWorldList.externalServerWorlds)) {
                /**
                 * The server button container.
                 *
                 * @type {HTMLDivElement | null}
                 */
                //@ts-ignore
                const serverButtonContainer: HTMLDivElement | null = document.getElementById(
                    `litePlayScreen_serversTabServerList_serverListContainer_serverButtonContainer_${server.id}`
                );
                if (serverButtonContainer) {
                    //@ts-ignore
                    serverButtonContainer.querySelector(
                        `#litePlayScreen_serversTabServerList_serverListContainer_serverButton_${server.id}`
                    ).children[1]!.textContent = `Players: ${server.playerCount}/${server.capacity}${
                        server.msgOfTheDay ? ` | MOTD: ${server.msgOfTheDay}` : ""
                    } | Ping: ${server.ping} | ID: ${server.id} | ${server.description ? `Description: ${server.description}` : ""}`;
                }
            }
        });
    }
    if (window.observingThirdPartyWorldListForLitePlayScreenServersTab !== true) {
        window.observingThirdPartyWorldListForLitePlayScreenServersTab = true;
        FacetManager.observeFacetData("vanilla.thirdPartyWorldList", (thirdPartyWorldList) => {
            const serverListIterables =
                thirdPartyWorldList ?
                    "thirdPartyWorlds" in thirdPartyWorldList ?
                        [thirdPartyWorldList.thirdPartyWorlds]
                    :   [thirdPartyWorldList.creatorExperiences, thirdPartyWorldList.featuredExperiences]
                :   [];
            const iterableTypeNameMap =
                thirdPartyWorldList ?
                    "thirdPartyWorlds" in thirdPartyWorldList ?
                        ["Third Party World"]
                    :   ["Creator Experience", "Featured Experience"]
                :   [];
            /**
             * The featured tab button.
             *
             * @type {HTMLButtonElement | null}
             */
            //@ts-ignore
            const featuredTabButton: HTMLButtonElement | null = document.getElementById("litePlayScreen_featuredTabButton");
            if (featuredTabButton) {
                featuredTabButton.textContent = `Featured (${serverListIterables.map((v) => v.length).join("+")})`;
            }
            if (currentTab !== "featured") {
                return;
            } /* 
            if (document.getElementById("serverOptionsOverlayElement")) {
            } */
            for (const server of "thirdPartyWorlds" in thirdPartyWorldList ?
                Array.from(thirdPartyWorldList.thirdPartyWorlds)
            :   [...Array.from(thirdPartyWorldList.creatorExperiences), ...Array.from(thirdPartyWorldList.featuredExperiences)]) {
                /**
                 * The server button container.
                 *
                 * @type {HTMLDivElement | null}
                 */
                //@ts-ignore
                const serverButtonContainer: HTMLDivElement | null = document.getElementById(
                    `litePlayScreen_featuredTabServerList_serverListContainer_serverButtonContainer_${server.id}`
                );
                if (serverButtonContainer) {
                    //@ts-ignore
                    serverButtonContainer.querySelector(
                        `#litePlayScreen_featuredTabServerList_serverListContainer_serverButton_${server.id}`
                    ).children[1]!.textContent =
                        `${serverListIterables.length > 1 ? `${iterableTypeNameMap[serverListIterables.findIndex((v) => v.includes(server))]} | ` : ""}Players: ${server.playerCount}/${server.capacity}${
                            server.msgOfTheDay ? ` | MOTD: ${server.msgOfTheDay}` : ""
                        } | Ping: ${server.ping} | ${server.description ? `Description: ${server.description}` : ""}`;
                }
            }
        });
    }
    if (window.observingRealmsListForLitePlayScreenServersTab !== true) {
        window.observingRealmsListForLitePlayScreenServersTab = true;
        let rolesAndActionsLoaded = false;
        FacetManager.observeFacetData("vanilla.realmsListFacet", (realmsListFacet): void => {
            queueMicrotask(
                voidAsyncCallback(async (): Promise<void> => {
                    try {
                        if (realmsListFacet.state === 2 && !rolesAndActionsLoaded) {
                            rolesAndActionsLoaded = true;
                            const realmsRolesAndPermissionsCommands =
                                getAccessibleFacetSpyFacets()["vanilla.realmsRolesAndPermissionsCommands"] ??
                                (await forceLoadFacet("vanilla.realmsRolesAndPermissionsCommands"));
                            realmsRolesAndPermissionsCommands.refreshAllRealmRolesAndActionsForCurrentUser();
                        }
                    } catch {}
                })
            );
            if (currentTab !== "realms") {
                try {
                    /**
                     * The realms tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    //@ts-ignore
                    const realmsTabButton: HTMLButtonElement | null = document.getElementById("litePlayScreen_realmsTabButton");
                    if (realmsTabButton) {
                        realmsTabButton.textContent = `Realms (${
                            realmsListFacet?.state === 0 /* Unknown */ ? "??"
                            : realmsListFacet?.state === 1 /* Loading */ ? "..."
                            : realmsListFacet?.state === 3 /* Error */ ? "!"
                            : (realmsListFacet?.realms?.length ?? "...")
                        })`;
                    }
                } catch {}
                return;
            }
            /**
             * The realms tab button.
             *
             * @type {HTMLButtonElement | null}
             */
            //@ts-ignore
            const realmsTabButton: HTMLButtonElement | null = document.getElementById("litePlayScreen_realmsTabButton");
            if (realmsTabButton) silentClick = true;
            realmsTabButton?.dispatchEvent(new Event("click"));
        });
        FacetManager.observeFacetData("vanilla.realmsRolesAndPermissionsQueries", (realmsRolesAndPermissionsCommands) => {
            if (currentTab !== "realms" || !realmsRolesAndPermissionsCommands?.currentUserRolesAndActionsForAllRealms.length) {
                return;
            }
            /**
             * The realms tab button.
             *
             * @type {HTMLButtonElement | null}
             */
            //@ts-ignore
            const realmsTabButton: HTMLButtonElement | null = document.getElementById("litePlayScreen_realmsTabButton");
            if (realmsTabButton) silentClick = true;
            realmsTabButton?.dispatchEvent(new Event("click"));
        });
    }
    if (window.observingFriendWorldListForLitePlayScreenFriendsTab !== true) {
        window.observingFriendWorldListForLitePlayScreenFriendsTab = true;
        FacetManager.observeFacetData("vanilla.friendworldlist", (_friendworldList) => {
            if (currentTab !== "friends") {
                return;
            }
            /**
             * The friends tab button.
             *
             * @type {HTMLButtonElement | null}
             */
            const friendsTabButton: HTMLButtonElement | null = document.getElementById("litePlayScreen_friendsTabButton");
            if (friendsTabButton) silentClick = true;
            friendsTabButton?.dispatchEvent(new Event("click"));
        });
    }
    if (window.observingLANWorldListForLitePlayScreenLanTab !== true) {
        window.observingLANWorldListForLitePlayScreenLanTab = true;
        FacetManager.observeFacetData("vanilla.lanWorldList", (_lanWorldList) => {
            if (currentTab !== "friends") {
                return;
            }
            /**
             * The friends tab button.
             *
             * @type {HTMLButtonElement | null}
             */
            const friendsTabButton: HTMLButtonElement | null = document.getElementById("litePlayScreen_friendsTabButton");
            if (friendsTabButton) silentClick = true;
            friendsTabButton?.dispatchEvent(new Event("click"));
        });
    }
    if (window.observingNetworkWorldDetailsForLitePlayScreenServersTab !== true) {
        window.observingNetworkWorldDetailsForLitePlayScreenServersTab = true;
        FacetManager.observeFacetData("vanilla.networkWorldDetails", (networkWorldDetails) => {
            if (currentTab !== "servers" && currentTab !== "featured") {
                return;
            }
            /**
             * The server options overlay element.
             *
             * @type {HTMLDivElement | null}
             */
            //@ts-ignore
            const serverOptionsOverlayElement: HTMLDivElement | null = document.getElementById("serverOptionsOverlayElement");
            if (serverOptionsOverlayElement) {
                const imageElement = serverOptionsOverlayElement.querySelector('[data-server-options-overlay-field="image"]');
                if (imageElement instanceof HTMLImageElement) {
                    imageElement.src = networkWorldDetails.networkDetails.imagePath;
                }
                const ipElement = serverOptionsOverlayElement.querySelector('[data-server-options-overlay-field="ip"]');
                if (ipElement instanceof HTMLParagraphElement) {
                    ipElement.textContent = `IP: ${networkWorldDetails.networkDetails.address || "N/A"}:${networkWorldDetails.networkDetails.port}`;
                }
                const typeElement = serverOptionsOverlayElement.querySelector('[data-server-options-overlay-field="type"]');
                if (typeElement instanceof HTMLParagraphElement) {
                    typeElement.textContent = `Type: ${networkWorldDetails.networkDetails.type}`;
                }
                const isSupportedForPartyTravelElement = serverOptionsOverlayElement.querySelector(
                    '[data-server-options-overlay-field="isSupportedForPartyTravel"]'
                );
                if (
                    isSupportedForPartyTravelElement instanceof HTMLParagraphElement &&
                    networkWorldDetails.networkDetails.isSupportedForPartyTravel !== undefined
                ) {
                    isSupportedForPartyTravelElement.textContent =
                        networkWorldDetails.networkDetails.isSupportedForPartyTravel ? "Supported for party travel." : "Not supported for party travel.";
                    isSupportedForPartyTravelElement.style.display = "";
                }
            }
        });
    }
} /* 
const a = facetSpyData.sharedFacets["vanilla.screenSpecificOptions"].get();
a.playScreenWorldLayoutMode = 0;
facetSpyData.sharedFacets["vanilla.screenSpecificOptions"].set(a); */

// eslint-disable-next-line @typescript-eslint/require-await -- This is for future compatibility because this may need to be async in the future.
async function disableLitePlayScreen(): Promise<void> {
    globalThis.litePlayScreenActive = false;
}

async function litePlayScreen_friendsMenu(): Promise<void> {
    let i = 0;
    while (
        !Array.from(document.querySelectorAll("div#root > div > div > div > div")).find(
            (element) =>
                !element.classList.contains("vanilla-neutral20-background") && element.hasAttribute("data-landmark-id") && !element.hasAttribute("data-in-use")
        )
    ) {
        if (i === 100) {
            return;
        }
        await new Promise((resolve): void => void setTimeout(resolve, 10));
        i++;
    }
    /**
     * The router facet.
     *
     * @type {FacetTypeMap["core.router"] | undefined}
     */
    const router: FacetTypeMap["core.router"] | undefined = globalThis.getAccessibleFacetSpyFacets?.()["core.router"];
    if (!router) {
        throw new ReferenceError("core.router facet not found");
    }
    /**
     * The original router location.
     */
    const originalRouterLocation = { ...router.history.location };
    const elements = Array.from(document.querySelectorAll("div#root > div > div > div > div"));
    /**
     * The title bar element.
     *
     * @type {HTMLDivElement | null}
     */
    const titleBarElement: HTMLDivElement | null =
        elements.find(
            /** @returns {element is HTMLDivElement} */ (element): element is HTMLDivElement =>
                element.classList.contains("vanilla-neutral20-background") && !element.hasAttribute("data-in-use") && element instanceof HTMLDivElement
        ) ?? null;
    //@ts-ignore
    titleBarElement.setAttribute("data-in-use", "true");
    //@ts-ignore
    titleBarElement.querySelector("div.vanilla-neutral20-text").textContent = "Friends";
    /**
     * The content container element.
     *
     * @type {HTMLDivElement | null}
     */
    const contentContainerElement: HTMLDivElement | null =
        elements.find(
            /** @returns {element is HTMLDivElement} */ (element): element is HTMLDivElement =>
                !element.classList.contains("vanilla-neutral20-background") &&
                element.hasAttribute("data-landmark-id") &&
                !element.hasAttribute("data-in-use") &&
                element instanceof HTMLDivElement
        ) ?? null;
    //@ts-ignore
    contentContainerElement.setAttribute("data-in-use", "true");
    //@ts-ignore
    contentContainerElement.innerHTML = `<div style="height: 100%; display: flex; flex-direction: column; justify-content: flex-start; overflow-y: scroll"><div id="litePlayScreen_tabList" style="display: flex; flex-direction: row; width: 90%; margin: 0 5%">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_friendsMenu_friendsTabButton" data-tab-id="friends">Friends (${
        (getAccessibleFacetSpyFacets()["vanilla.friendsListFacet"] ?? (await forceLoadFacet("vanilla.friendsListFacet")))?.xblFriends?.length ?? "..."
    })</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_friendsMenu_recentsTabButton" data-tab-id="recents">Recent (${
        (getAccessibleFacetSpyFacets()["vanilla.recentlyPlayedWithList"] ?? (await forceLoadFacet("vanilla.recentlyPlayedWithList")))?.playerList?.length ??
        "..."
    })</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_friendsMenu_recommendedTabButton" data-tab-id="recommended">Recommended (${
        (getAccessibleFacetSpyFacets()["vanilla.recommendedFriendsList"] ?? (await forceLoadFacet("vanilla.recommendedFriendsList")))?.playerList?.length ??
        "..."
    })</button>
</div><div id="litePlayScreen_tabContent" style="display: flex; flex-direction: column; width: 90%; margin: 0 5%; overflow-y: scroll; justify-content: flex-start; flex-grow: 1"></div></div>`;
    const tabContent = document.getElementById("litePlayScreen_tabContent");
    const tabList = document.getElementById("litePlayScreen_tabList");
    //@ts-ignore
    const tabListButtons = tabList.querySelectorAll("button");
    /**
     * The currently selected page.
     *
     * @type {number}
     */
    let currentPage = Number(
        originalRouterLocation.search
            .replace("?", "")
            .split("&")
            .find((param) => param.split("=")[0] === "page")
            ?.split("=")[1] ?? 0
    );
    /**
     * The currently selected tab.
     *
     * @type {typeof tabIDs[number]}
     */
    //@ts-ignore
    let currentTab: (typeof tabIDs)[number] =
        originalRouterLocation.search
            .replace("?", "")
            .split("&")
            .find((param: string): boolean => param.split("=")[0] === "tab")
            ?.split("=")[1] ?? "worlds";
    let silentClick = false;
    /**
     * The tab IDs.
     *
     * @type {["friends", "recents", "recommended"]}
     */
    const tabIDs: ["friends", "recents", "recommended"] = ["friends" /* , "platformFriends" */, "recents", "recommended"];
    /**
     * Changes the page and tab.
     *
     * @param page The page to change to.
     * @param tab The tab to change to.
     * @param clickTab Whether to click the tab button.
     */
    function changePage(page: number, tab: (typeof tabIDs)[number], clickTab = true): void {
        currentPage = page;
        currentTab = tab;
        getAccessibleFacetSpyFacets()["core.router"]?.history.replace(
            `/ouic/friends/${tab}?${[
                ...router!.history.location.search
                    .replace("?", "")
                    .split("&")
                    .filter((param: string): boolean => !["page", "tab"].includes(param.split("=")[0]!)),
                `page=${page}`,
                `tab=${tab}`,
            ].join("&")}`
        ); /* 
        console.log(
            `/ouic/play/${tab}?${[
                ...router.history.location.search
                    .replace("?", "")
                    .split("&")
                    .filter((param) => !["page", "tab"].includes(param.split("=")[0])),
                `page=${page}`,
                `tab=${tab}`,
            ].join("&")}`
        ); */
        silentClick = true;
        if (clickTab) {
            tabListButtons[Math.max(0, tabIDs.indexOf(currentTab))]!.dispatchEvent(new Event("click"));
        }
    }
    for (let i = 0; i < tabListButtons.length; i++) {
        const index = i;
        tabListButtons[index]!.addEventListener("click", (async (): Promise<void> => {
            if (tabListButtons[index]!.getAttribute("data-tab-id") !== currentTab) {
                if (!silentClick) {
                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                }
                currentPage = 0;
                for (const tabListButton of tabListButtons) {
                    tabListButton.classList.remove("selected");
                }
                tabListButtons[index]!.classList.add("selected");
                changePage(0, tabIDs[index]!, false);
            } else if (!tabListButtons[index]!.classList.contains("selected")) {
                tabListButtons[index]!.classList.add("selected");
            }
            silentClick = false;
            Array.from(tabContent!.children).forEach((element: Element): void => void element.remove());
            /**
             * The ID of the tab button.
             *
             * @type {typeof tabIDs[number]}
             */
            const tabButtonID: (typeof tabIDs)[number] = (tabListButtons[index]!.getAttribute("data-tab-id") ?? "worlds") as (typeof tabIDs)[number];
            switch (tabButtonID) {
                case "friends": {
                    currentTab = "friends";
                    /**
                     * @type {(ReturnType<NonNullable<ReturnType<typeof getAccessibleFacetSpyFacets>["vanilla.friendworldlist"]>["friendWorlds"]["slice"]>[number] | ReturnType<NonNullable<ReturnType<typeof getAccessibleFacetSpyFacets>["vanilla.lanWorldList"]>["lanWorlds"]["slice"]>[number])[]}
                     */
                    const friendWorldList: (
                        | ReturnType<NonNullable<ReturnType<typeof getAccessibleFacetSpyFacets>["vanilla.friendworldlist"]>["friendWorlds"]["slice"]>[number]
                        | ReturnType<NonNullable<ReturnType<typeof getAccessibleFacetSpyFacets>["vanilla.lanWorldList"]>["lanWorlds"]["slice"]>[number]
                    )[] = [
                        ...(getAccessibleFacetSpyFacets()["vanilla.friendworldlist"] ?? (await forceLoadFacet("vanilla.friendworldlist"))).friendWorlds.slice(
                            0
                        ),
                        ...(getAccessibleFacetSpyFacets()["vanilla.lanWorldList"] ?? (await forceLoadFacet("vanilla.lanWorldList"))).lanWorlds.slice(0),
                    ];
                    const pageCount = Math.ceil((friendWorldList?.length ?? 0) / 5);
                    const buttonBar = document.createElement("div");
                    buttonBar.id = "litePlayScreen_friendsTabButtonBar";
                    buttonBar.style = "width: 100%; display: flex; flex-direction: row; justify-content: space-between; margin: 1em 0";
                    buttonBar.innerHTML = `<div id="litePlayScreen_friendsTabButtonBar_leftButtons" style="display: flex; flex-direction: row; width: 50%; justify-content: flex-start">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-right: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_friendsTabButtonBar_previousPage">Prev.</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-right: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_friendsTabButtonBar_nextPage">Next</button>
    <p style="font-size: 2vw; line-height: 2.8571428572vw; padding: 0.2rem 0; margin: 6px 0; font-family: Minecraft Seven v2">Page ${
        pageCount === 0 ? 0 : currentPage + 1
    } of ${pageCount}</p>
</div>
<div id="litePlayScreen_friendsTabButtonBar_rightButtons" style="display: flex; flex-direction: row; width: 50%; justify-content: flex-end">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; margin-left: 1em; font-family: Minecraft Seven v2" id="litePlayScreen_friendsTabButtonBar_joinFriend">Join Friend</button>
</div>`;
                    //@ts-ignore
                    tabContent.appendChild(buttonBar);
                    const friendWorldListContainer = document.createElement("div");
                    friendWorldListContainer.id = "litePlayScreen_friendsTabFriendWorldList_friendWorldListContainer";
                    friendWorldListContainer.style.flexGrow = "1";
                    friendWorldListContainer.style.display = "block";
                    // friendWorldListContainer.style.display = "contents";
                    friendWorldListContainer.style.width = "100%";
                    // friendWorldListContainer.style.height = "100%";
                    if (!friendWorldList || pageCount === 0) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "No friend or LAN worlds found.";
                        emptyListInfo.style.fontSize = "2vw";
                        emptyListInfo.style.lineHeight = "2.8571428572vw";
                        emptyListInfo.style.padding = "0.2rem 0";
                        emptyListInfo.style.margin = "6px 0";
                        emptyListInfo.style.fontFamily = "Minecraft Seven v2";
                        friendWorldListContainer.appendChild(emptyListInfo);
                    } else {
                        if (currentPage < 0 || currentPage >= pageCount) {
                            changePage(Math.max(0, Math.min(pageCount - 1, 0)), currentTab);
                            return;
                        }
                        for (let i = currentPage * 5; i < Math.min(friendWorldList.length, (currentPage + 1) * 5); i++) {
                            const world = friendWorldList[i]!;
                            const friendWorldButtonContainer = document.createElement("div");
                            friendWorldButtonContainer.id = `litePlayScreen_friendsTabFriendWorldList_friendWorldListContainer_friendWorldButtonContainer_${world.id}`;
                            friendWorldButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const friendWorldButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            friendWorldButton.type = "button";
                            friendWorldButton.classList.add("btn", "nsel");
                            friendWorldButton.style =
                                "font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2; text-align: left;";
                            friendWorldButton.id = `litePlayScreen_friendsTabFriendWorldList_friendWorldListContainer_friendWorldButton_${world.id}`;
                            const friendWorldButton_friendWorldName = document.createElement("span");
                            friendWorldButton_friendWorldName.style =
                                "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; max-width: 90%; display: block;";
                            friendWorldButton_friendWorldName.textContent = world.name;
                            friendWorldButton.appendChild(friendWorldButton_friendWorldName);
                            const friendWorldButton_friendWorldDetails = document.createElement("span");
                            friendWorldButton_friendWorldDetails.style =
                                "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 90%; display: block; position: absolute; bottom: 0; left: 0.4rem; font-size: 1vw; line-height: 1.4285714288vw;";
                            friendWorldButton_friendWorldDetails.textContent = `${world.ownerName} | Players: ${world.playerCount}/${world.capacity}${
                                "friendOfFriendWorld" in world ?
                                    world.friendOfFriendWorld ?
                                        " | Friend of Friend"
                                    :   " | Friend"
                                :   ""
                            } | ${
                                //@ts-ignore
                                GameModeIDMap[world.gameMode]
                            }${world.isHardcore ? " | Hardcore" : ""}${"ping" in world && world.ping ? ` | Ping: ${world.ping}` : ""}${
                                "address" in world && world.address !== "UNASSIGNED_SYSTEM_ADDRESS" && world.address ?
                                    ` | Address: ${world.address}:${world.port}`
                                :   ""
                            }`;
                            friendWorldButton.appendChild(friendWorldButton_friendWorldDetails);
                            const friendWorldID = world.id;
                            friendWorldButton.addEventListener("click", (async () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner =
                                    getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"] ?? (await forceLoadFacet("vanilla.networkWorldJoiner"));
                                if (networkWorldJoiner) {
                                    if ("friendOfFriendWorld" in world) networkWorldJoiner.joinFriendServer(friendWorldID);
                                    else networkWorldJoiner.joinLanServer(friendWorldID);
                                }
                            }) as () => void);
                            friendWorldButtonContainer.appendChild(friendWorldButton);
                            const friendWorldOptionsButton = document.createElement("button");
                            // @ts-ignore: This is for browser compatibility.
                            friendWorldOptionsButton.type = "button";
                            friendWorldOptionsButton.classList.add("btn", "nsel");
                            friendWorldOptionsButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            friendWorldOptionsButton.id = `litePlayScreen_friendsTabFriendWorldList_friendWorldListContainer_friendWorldButton_editFriendWorldButton_${world.id}`;
                            friendWorldOptionsButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const friendWorldOptionsOverlayElement = document.createElement("div");
                                friendWorldOptionsOverlayElement.id = "friendWorldOptionsOverlayElement";
                                friendWorldOptionsOverlayElement.setAttribute("data-friend-id", friendWorldID);
                                friendWorldOptionsOverlayElement.style =
                                    "backdrop-filter: blur(5px); background-color: #00000080; color: #FFFFFFFF; position: fixed; top: 2.5vh; left: 2.5vw; width: 95vw; height: 95vh; z-index: 100; white-space: pre-wrap; overflow-wrap: anywhere; font-family: Minecraft Seven v2;";
                                friendWorldOptionsOverlayElement.innerHTML = `<button type="button" style="position: absolute; top: 0; right: 0; font-family: Minecraft Seven v2; font-size: 50px; aspect-ratio: 1/1; color: #000000; width: 50px; height: 50px; z-index: 1;" onclick="this.parentElement.remove();"><span style="margin-top: -5px; font-family: Minecraft Seven v2;">x</span></button>
<div style="display: flex; flex-direction: row; height: 100%; width: 100%; padding: 0.5vh 0.5vh">
    <div id="friendWorldOptionsOverlayElement_textElement" style="user-select: text; /* white-space: pre-wrap; overflow-wrap: anywhere;  */width: 100%; height: 100%;">
        <h1 data-friend-world-options-overlay-field="friendWorldName"></h1>
        <p data-friend-world-options-overlay-field="ownerName"></p>
        <p style="display: ${"ownerId" in world ? "block" : "none"}">Owner XUID: ${"ownerId" in world && world.ownerId}</p>
        <p style="display: ${"friendOfFriendWorld" in world ? "block" : "none"}">${
            "friendOfFriendWorld" in world && world.friendOfFriendWorld ? "Friend of Friend" : "Friend"
        }</p>
        <p>Players: ${world.playerCount}/${world.capacity}</p>
        <p data-friend-world-options-overlay-field="ping" style="display: ${"ping" in world && world.ping ? "block" : "none"}">Ping: ${
            "ping" in world && world.ping
        }</p>
        <p style="display: ${world.isHardcore ? "block" : "none"}">Hardcore mode is enabled.</p>
        <p data-friend-world-options-overlay-field="address" style="display: ${
            "address" in world && world.address !== "UNASSIGNED_SYSTEM_ADDRESS" && world.address ? "block" : "none"
        }"></p>
        <p>World ID: ${world.id}</p>
        <p>Game Mode: ${
            //@ts-ignore
            GameModeIDMap[world.gameMode]
        }</p>
    </div>
    <div id="friendWorldOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="friendWorldOptionsOverlayElement_joinFriendWorldButton">Join World</button>
    </div>
</div>`;
                                friendWorldOptionsOverlayElement.querySelector("[data-friend-options-overlay-field='friendWorldName']")!.textContent =
                                    world.name;
                                friendWorldOptionsOverlayElement.querySelector("[data-friend-options-overlay-field='ownerName']")!.textContent =
                                    world.ownerName;
                                friendWorldOptionsOverlayElement
                                    .querySelector("#friendWorldOptionsOverlayElement_joinFriendWorldButton")!
                                    .addEventListener("click", (async () => {
                                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                        const networkWorldJoiner =
                                            getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"] ?? (await forceLoadFacet("vanilla.networkWorldJoiner"));
                                        if (networkWorldJoiner) {
                                            if ("friendOfFriendWorld" in world) networkWorldJoiner.joinFriendServer(friendWorldID);
                                            else networkWorldJoiner.joinLanServer(friendWorldID);
                                        }
                                    }) as () => void);
                                document.body.appendChild(friendWorldOptionsOverlayElement);
                            });
                            const friendWorldOptionsButton_icon = document.createElement("img");
                            friendWorldOptionsButton_icon.src = "/hbui/assets/Options-Horizontal-426f7783c8eede73d0a9.png";
                            friendWorldOptionsButton_icon.style = "width: 2vw; height: 2vw;";
                            friendWorldOptionsButton.appendChild(friendWorldOptionsButton_icon);
                            const friendWorldOptionsButton_label = document.createElement("span");
                            friendWorldOptionsButton_label.style = "position: absolute; bottom: 1rem";
                            friendWorldOptionsButton_label.textContent = "More";
                            friendWorldOptionsButton.appendChild(friendWorldOptionsButton_label);
                            friendWorldButtonContainer.appendChild(friendWorldOptionsButton);
                            friendWorldListContainer.appendChild(friendWorldButtonContainer);
                        }
                    }
                    //@ts-ignore
                    tabContent.appendChild(friendWorldListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_friendsTabButtonBar_leftButtons");
                    if (!leftButtons) throw new ReferenceError("Could not find left buttons.");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1]!.classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0]!.classList.add("disabled");
                    }
                    leftButtons.children[0]!.addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1]!.addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    break;
                }
                case "recents":
                case "recommended":
                // TODO
                // no default
            }
        }) as () => void);
    }
    silentClick = true;
    tabListButtons[Math.max(0, tabIDs.indexOf(currentTab))]!.dispatchEvent(new Event("click"));
}

/**
 * Sets whether the lite play screen is enabled.
 *
 * @param {boolean} value Whether to set the lite play screen to enabled or disabled.
 * @param {boolean} [noReload=false] Whether to not reload the page every time it is opened to unload the old contents.
 *
 * @throws {ReferenceError} If the external server world list is not available.
 */
function setLitePlayScreenEnabled(value: boolean, noReload = false): void {
    if (value) {
        localStorage.setItem("enableLitePlayScreen", "true");
        if (noReload) {
            localStorage.setItem("enableLitePlayScreenNoReload", "true");
        } else {
            localStorage.removeItem("enableLitePlayScreenNoReload");
        }
    } else {
        localStorage.removeItem("enableLitePlayScreen");
    }
    const externalServerWorldList = getAccessibleFacetSpyFacets()["vanilla.externalServerWorldList"];
    if (!externalServerWorldList) {
        throw new ReferenceError("External server world list is not available.");
    }
    const existingExternalServerStorage = externalServerWorldList.externalServerWorlds.filter(
        (world) => world.name === "LitePlayScreenEnabled" || world.name === "LitePlayScreenEnabledNoReload"
    );
    if (existingExternalServerStorage.length > 0) {
        if (!value) {
            existingExternalServerStorage.forEach((server) => externalServerWorldList.removeExternalServerWorld(Number(server.id)));
        }
    }
    if (value) {
        if (noReload) {
            externalServerWorldList.addExternalServerWorld("LitePlayScreenEnabledNoReload", "0.0.0.1", 1);
        } else {
            externalServerWorldList.addExternalServerWorld("LitePlayScreenEnabled", "0.0.0.1", 1);
        }
    }
}

// Enables the lite play screen.
queueMicrotask(
    setTimeout.bind(
        void 0,
        async function startEnablingLitePlayScreen(): Promise<void> {
            for (let i = 0; i < 1000; i++) {
                try {
                    /**
                     * The router facet.
                     *
                     * @type {FacetTypeMap["core.router"] | undefined}
                     */
                    const router: FacetTypeMap["core.router"] | undefined =
                        /* globalThis.facetSpyData && */ globalThis.getAccessibleFacetSpyFacets?.()["core.router"];
                    if (!router) {
                        // If the router facet is not available, wait for a short time and try again.
                        await new Promise((resolve): void => void setTimeout(resolve, 10));
                        continue;
                    }
                    /**
                     * Loads a custom screen from 8Crafter's Ore UI Customizer.
                     *
                     * @param {string} pathname The path to load.
                     * @returns {Promise<void>} A promise that resolves when the screen is loaded.
                     */
                    const loadOUICScreen = async function loadOUICScreen(pathname: string): Promise<void> {
                        pathname = pathname?.replace(/^\/ouic\//, "");
                        switch (true as never) {
                            case pathname.startsWith("play"):
                                await enableLitePlayScreen();
                                break;
                            case pathname.startsWith("friends"):
                                await litePlayScreen_friendsMenu();
                                break;
                            // no default
                        }
                    };
                    if (router.history.location.pathname.startsWith("/ouic/")) {
                        await loadOUICScreen(router.history.location.pathname);
                    }
                    const loadedRouterPositions = router.history.list
                        .slice(0)
                        .map(
                            /** @returns {RouteHistoryItem | undefined} */ (v, i): RouteHistoryItem | undefined =>
                                !v.pathname.startsWith("/ouic/") || i === router.history.list.length - 1 ? { ...v } : undefined
                        );
                    const routerObserveCallback = (async (router: FacetTypeMap["core.router"]) => {
                        if (router.history.list.length < loadedRouterPositions.length) {
                            loadedRouterPositions.splice(router.history.list.length, loadedRouterPositions.length - router.history.list.length);
                        } else if (router.history.list.length > loadedRouterPositions.length) {
                            loadedRouterPositions.push(
                                ...router.history.list
                                    .slice(loadedRouterPositions.length)
                                    .map(
                                        /** @returns {RouteHistoryItem | undefined} */ (v, i): RouteHistoryItem | undefined =>
                                            !v.pathname.startsWith("/ouic/") || i === router.history.list.length - 1 ? { ...v } : undefined
                                    )
                            );
                        } else if (
                            router.history.list.length &&
                            router.history.list[router.history.list.length - 1]!.pathname !==
                                loadedRouterPositions[loadedRouterPositions.length - 1]?.pathname &&
                            router.history.list[router.history.list.length - 1]!.pathname.startsWith("/ouic/") &&
                            /^\/ouic\/[^/]+/.exec(router.history.list[router.history.list.length - 1]!.pathname)?.[0] !==
                                loadedRouterPositions[loadedRouterPositions.length - 1]?.pathname.match(/^\/ouic\/[^/]+/)?.[0]
                        ) {
                            loadedRouterPositions[loadedRouterPositions.length - 1] = undefined;
                        }
                        if (router.history.location.pathname.startsWith("/ouic/") && loadedRouterPositions[loadedRouterPositions.length - 1] === undefined) {
                            await loadOUICScreen(router.history.location.pathname);
                        } else if (router.history.location.pathname.startsWith("/play/")) {
                            try {
                                const localForceLoadedFacets: FacetList[number][] = [];
                                try {
                                    let forceLoadedExternalServerWorldListFacet = false;
                                    var externalServerWorldList =
                                        getAccessibleFacetSpyFacets()["vanilla.externalServerWorldList"] ??
                                        ((forceLoadedExternalServerWorldListFacet = true), await forceLoadFacet("vanilla.externalServerWorldList"));
                                    if (forceLoadedExternalServerWorldListFacet) localForceLoadedFacets.push("vanilla.externalServerWorldList");
                                } catch (e) {
                                    if (e === "activate-facet-not-found") {
                                        try {
                                            let forceLoadedInGameFacet = false;
                                            const inGameFacet =
                                                getAccessibleFacetSpyFacets()["vanilla.inGame"] ??
                                                ((forceLoadedInGameFacet = true), await forceLoadFacet("vanilla.inGame"));
                                            if (forceLoadedInGameFacet) localForceLoadedFacets.push("vanilla.inGame");
                                            if (inGameFacet.isInGame) {
                                                // localForceLoadedFacets.forEach((f) => unloadForceLoadedFacet(f));
                                                return;
                                            }
                                            console.error(new ReferenceError('Unable to get "vanilla.externalServerWorldList" facet.'));
                                            // localForceLoadedFacets.forEach((f) => unloadForceLoadedFacet(f));
                                            return;
                                        } catch (e) {
                                            if (e === "activate-facet-not-found") {
                                                console.warn(new ReferenceError('Unable to get "vanilla.inGame" facet.'));
                                                // localForceLoadedFacets.forEach((f) => unloadForceLoadedFacet(f));
                                                return;
                                            }
                                            try {
                                                FacetManager.unobserveFacetData("core.router", routerObserveCallback);
                                            } catch {}
                                            throw e;
                                        }
                                    }
                                    try {
                                        FacetManager.unobserveFacetData("core.router", routerObserveCallback);
                                    } catch {}
                                    throw e;
                                }
                                const externalServerWorlds = externalServerWorldList.externalServerWorlds;
                                if (
                                    localStorage.getItem("enableLitePlayScreen") !== null ||
                                    externalServerWorldList.externalServerWorlds.some(
                                        (server) => server.name === "LitePlayScreenEnabled" || server.name === "LitePlayScreenEnabledNoReload"
                                    )
                                ) {
                                    try {
                                        //@ts-expect-error
                                        document.getElementById("8CrafterUtilitiesMenu_button_toggleLitePlayScreen").textContent = "Disable Lite Play Screen";
                                    } catch (e) {
                                        console.error(e);
                                    }
                                    if (
                                        router.history.location.pathname.startsWith("/play/") /*  || /^\/ouic\/play/.test(router.history.location.pathname) */
                                    ) {
                                        // const originalRouterLocation = { ...router.history.location };
                                        // router.history.replace(`/play/all` + router.history.location.search + router.history.location.hash);
                                        // If the router facet is available, enable the lite play screen.
                                        try {
                                            externalServerWorlds.some((world) => world.name === "LitePlayScreenEnabledNoReload");
                                        } catch (e) {
                                            console.error(e);
                                        }
                                        await enableLitePlayScreen(externalServerWorlds.some((world) => world.name === "LitePlayScreenEnabledNoReload"));
                                    }
                                }
                                return;
                            } catch (e) {
                                console.error(e instanceof Error ? e : new Error(String(e), .../* For browsers only. */ ([{ cause: e }] as unknown as [])));
                                // await new Promise((resolve): void => void setTimeout(resolve, 10));
                                // continue;
                            }
                        }
                    }) as (router: FacetTypeMap["core.router"]) => void;
                    FacetManager.observeFacetData("core.router", routerObserveCallback);
                    const localForceLoadedFacets: FacetList[number][] = [];
                    try {
                        let forceLoadedExternalServerWorldListFacet = false;
                        var externalServerWorldList =
                            getAccessibleFacetSpyFacets()["vanilla.externalServerWorldList"] ??
                            ((forceLoadedExternalServerWorldListFacet = true), await forceLoadFacet("vanilla.externalServerWorldList"));
                        if (forceLoadedExternalServerWorldListFacet) localForceLoadedFacets.push("vanilla.externalServerWorldList");
                    } catch (e) {
                        if (e === "activate-facet-not-found") {
                            try {
                                let forceLoadedInGameFacet = false;
                                const inGameFacet =
                                    getAccessibleFacetSpyFacets()["vanilla.inGame"] ??
                                    ((forceLoadedInGameFacet = true), await forceLoadFacet("vanilla.inGame"));
                                if (forceLoadedInGameFacet) localForceLoadedFacets.push("vanilla.inGame");
                                if (inGameFacet.isInGame) {
                                    // localForceLoadedFacets.forEach((f) => unloadForceLoadedFacet(f));
                                    return;
                                }
                                console.error(new ReferenceError('Unable to get "vanilla.externalServerWorldList" facet.'));
                                // localForceLoadedFacets.forEach((f) => unloadForceLoadedFacet(f));
                                return;
                            } catch (e) {
                                if (e === "activate-facet-not-found") {
                                    console.warn(new ReferenceError('Unable to get "vanilla.inGame" facet.'));
                                    // localForceLoadedFacets.forEach((f) => unloadForceLoadedFacet(f));
                                    return;
                                }
                                try {
                                    FacetManager.unobserveFacetData("core.router", routerObserveCallback);
                                } catch {}
                                throw e;
                            }
                        }
                        try {
                            FacetManager.unobserveFacetData("core.router", routerObserveCallback);
                        } catch {}
                        throw e;
                    }
                    const externalServerWorlds = externalServerWorldList.externalServerWorlds;
                    if (
                        localStorage.getItem("enableLitePlayScreen") !== null ||
                        externalServerWorldList.externalServerWorlds.some(
                            (server) => server.name === "LitePlayScreenEnabled" || server.name === "LitePlayScreenEnabledNoReload"
                        )
                    ) {
                        try {
                            //@ts-expect-error
                            document.getElementById("8CrafterUtilitiesMenu_button_toggleLitePlayScreen").textContent = "Disable Lite Play Screen";
                        } catch (e) {
                            console.error(e);
                        }
                        if (router.history.location.pathname.startsWith("/play/") /*  || /^\/ouic\/play/.test(router.history.location.pathname) */) {
                            // const originalRouterLocation = { ...router.history.location };
                            // router.history.replace(`/play/all` + router.history.location.search + router.history.location.hash);
                            // If the router facet is available, enable the lite play screen.
                            try {
                                externalServerWorlds.some((world) => world.name === "LitePlayScreenEnabledNoReload");
                            } catch (e) {
                                console.error(e);
                            }
                            await enableLitePlayScreen(externalServerWorlds.some((world) => world.name === "LitePlayScreenEnabledNoReload"));
                        }
                    }
                    return;
                } catch (e) {
                    console.error(e instanceof Error ? e : new Error(String(e), .../* For browsers only. */ ([{ cause: e }] as unknown as [])));
                    await new Promise((resolve): void => void setTimeout(resolve, 10));
                    continue;
                }
            }
            console.error("Failed to enable lite play screen, timed out.");
        },
        1
    )
);

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
async function copyTextToClipboard_old(text: string): Promise<boolean> {
    try {
        const clipboardFacet = getAccessibleFacetSpyFacets()["vanilla.clipboard"];
        // If the current route has direct access to the clipboard facet, we can copy the text to the clipboard directly.
        if (clipboardFacet?.copyToClipboard) {
            // Copy the text to the clipboard.
            clipboardFacet.copyToClipboard(text);
            return true;
        }
    } catch {}
    const routerFacet = getAccessibleFacetSpyFacets()["core.router"];
    if (!routerFacet) throw new ReferenceError("Router facet not available.");
    // If the current route is in the index file, we can open the add friend page in the current context, otherwise it will open in a different context.
    routerFacet.history.push("/add-friend");
    // Store the text to copy in localStorage so it can be accessed if the copy function is run from a file other than the index JS file.
    localStorage.setItem("textToCopy", text);
    for (let i = 0; i < 1000; i++) {
        // If the text was copied to the clipboard by another context because the copy function was run from a file other than the index JS file, return the status of the copy operation.
        if (localStorage.getItem("clipboardCopyStatus") !== null) {
            /**
             * The status of the copy operation.
             *
             * @type {"success" | "failed"}
             */
            // @ts-ignore
            const status: "success" | "failed" = localStorage.getItem("clipboardCopyStatus");
            // This removes the status from the localStorage so it doesn't interfere with future copy operations.
            localStorage.removeItem("clipboardCopyStatus");
            // Check if there was an error during the copy operation.
            if (localStorage.getItem("clipboardCopyError") !== null) {
                // Log the error to the console.
                console.error("Failed to copy text to clipboard:", localStorage.getItem("clipboardCopyError"));
                // This removes the error from the localStorage so it doesn't interfere with future copy operations.
                localStorage.removeItem("clipboardCopyError");
            }
            // Return whether or not the copy operation was successful.
            return status === "success";
        }
        /**
         * The clipboard facet.
         *
         * @type {{copyToClipboard(text: string): void, [k: PropertyKey]: unknown} | undefined}
         */
        const clipboardFacet: { copyToClipboard(text: string): void; [k: PropertyKey]: unknown } | undefined =
            globalThis.getAccessibleFacetSpyFacets?.()["vanilla.clipboard"];
        if (!clipboardFacet) {
            // If the clipboard facet is not available, wait for a short time and try again.
            await new Promise((resolve): void => void setTimeout(resolve, 10));
            continue;
        }
        // If the clipboard facet is available, copy the text to the clipboard.
        clipboardFacet.copyToClipboard(text);

        // Remove the text to copy from the localStorage so it doesn't interfere with future copy operations.
        localStorage.removeItem("textToCopy");
        // Close the add friend page and return to the previous page.
        routerFacet.history.goBack();
        return true;
    }
    return false;
}

/**
 * Copies text to the clipboard.
 *
 * This will fail if the clipboard facet is no loaded. If you want to force load the clipboard facet, use the {@link copyTextToClipboardAsync} function.
 *
 * @param {string} text The text to copy to the clipboard.
 * @returns {boolean} `true` if the text was copied to the clipboard, `false` otherwise.
 */
function copyTextToClipboard(text: string): boolean {
    const clipboardFacet = getAccessibleFacetSpyFacets()["vanilla.clipboard"];
    if (clipboardFacet?.copyToClipboard) {
        clipboardFacet.copyToClipboard(text);
        return true;
    }
    return false;
}

/**
 * Copies text to the clipboard, and if necessary tries to force load the clipboard facet if it is not loaded.
 *
 * @param {string} text The text to copy to the clipboard.
 * @param {number} [timeout=100] The timeout in milliseconds to wait for the facet to load. If set to `0` or `Infinity`, it will never time out. Defaults to `100ms`.
 * @param {boolean} [allowErrorLogging=true] Whether to log errors that occur while force loading the facet to the console. Defaults to `true`.
 * @returns {Promise<[success: true, successType: "alreadyLoaded" | "forceLoaded"] | [sucess: false, error: Error, originalError?: unknown]>} A promise that resolves with a tuple with the first]\item being whether the text was copied to the clipboard, and the second item being whether it was force loaded or already loaded if it was successful or the error that occured if it wasn't, and a third item being the original error if the failure happened while force loading the facet.
 */
async function copyTextToClipboardAsync(
    text: string,
    timeout = 100,
    allowErrorLogging = true
): Promise<[success: true, successType: "alreadyLoaded" | "forceLoaded"] | [sucess: false, error: Error, originalError?: unknown]> {
    if (copyTextToClipboard(text)) return [true, "alreadyLoaded"];
    try {
        var clipboardFacet = await forceLoadFacet("vanilla.clipboard", timeout);
    } catch (e) {
        const error = new Error("Failed to force load the clipboard facet.");
        if (allowErrorLogging) console.error(error);
        return [false, error, e];
    }
    if (!clipboardFacet.isClipboardCopySupported) return [false, new Error("Clipboard copy is not supported.")];
    if (!clipboardFacet.copyToClipboard) return [false, new Error("Clipboard facet is not loaded.")];
    clipboardFacet.copyToClipboard(text);
    return [true, "forceLoaded"];
}

// For if the copy function is run from a file other than the index JS file.
{
    const textToCopy = localStorage.getItem("textToCopy");
    if (textToCopy !== null) {
        // Set a flag to indicate that the copy function is running.
        window.copying = true;
        queueMicrotask(() => {
            void (async function copyTextToClipboard(): Promise<boolean> {
                try {
                    for (let i = 0; i < 1000; i++) {
                        /**
                         * The router facet.
                         */
                        var routerFacet = getAccessibleFacetSpyFacets()["core.router"];
                        if (!routerFacet) {
                            // If the router facet is not available, wait for a short time and try again.
                            await new Promise((resolve): void => void setTimeout(resolve, 10));
                            continue;
                        }
                        /**
                         * The clipboard facet.
                         */
                        const clipboardFacet = globalThis.getAccessibleFacetSpyFacets?.()["vanilla.clipboard"];
                        if (!clipboardFacet) {
                            // If the clipboard facet is not available, wait for a short time and try again.
                            await new Promise((resolve): void => void setTimeout(resolve, 10));
                            continue;
                        }
                        // If the clipboard facet is available, copy the text to the clipboard.
                        clipboardFacet.copyToClipboard(textToCopy);

                        // Remove the text to copy from the localStorage so it doesn't interfere with future copy operations.
                        localStorage.removeItem("textToCopy");
                        // Set the status of the copy operation to success.
                        localStorage.setItem("clipboardCopyStatus", "success");
                        // Close the add friend page and return to the previous page and context.
                        routerFacet.history.goBack();
                        return true;
                    }
                } catch (e) {
                    // If the copy operation failed, store the error in the localStorage so it can be accessed in the context and route that triggered the copy operation.
                    localStorage.setItem("clipboardCopyError", e instanceof Error ? (e.stack ?? String(e)) : String(e));
                    // If the copy operation failed, store the error in a global variable for debugging purposes.
                    window.__DEBUG_copyTextToClipboard_old_GLOBALS_copyError__ = e;
                    // Log the error to the console.
                    console.error("Failed to copy text to clipboard:", e);
                }
                // If the copy operation failed, remove the text to copy from the localStorage so it doesn't interfere with future copy operations.
                localStorage.removeItem("textToCopy");
                // Set the status of the copy operation to failed.
                localStorage.setItem("clipboardCopyStatus", "failed");

                // Close the add friend page and return to the previous page and context.
                //@ts-ignore
                getAccessibleFacetSpyFacets()["core.router"].history.goBack();
                return false;
            })();
        });
    }
}

var framesSinceLastSecond = 0;
var currentFrameTimeHistory: number[] = [];
var currentFPS = 0;

queueMicrotask((): void => {
    setInterval(function updateFPS(): void {
        // currentFPS = framesSinceLastSecond;
        const currentTime: number = performance.now();
        const lastValidFrameIndex: number = currentFrameTimeHistory.findIndex((frameTime: number): boolean => frameTime >= currentTime - 1000);
        currentFrameTimeHistory.splice(0, lastValidFrameIndex !== -1 ? lastValidFrameIndex : currentFrameTimeHistory.length);
        currentFPS = currentFrameTimeHistory.length;
        framesSinceLastSecond = 0;
    }, 1000);

    requestAnimationFrame(function trackFrameForFPSCount(timestamp: number): void {
        framesSinceLastSecond++;
        currentFrameTimeHistory.push(timestamp);
        requestAnimationFrame(trackFrameForFPSCount);
    });
});

((): void => {
    //#region Event Listeners
    window.onkeyup = function __OUIC_keyboardShortcutHandler_keyUp__(/** @type {KeyboardEvent} */ e: KeyboardEvent): void {
        if (e.keyCode === types_KeyboardKey.KEY_P && e.ctrlKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            // cssEditorInSelectMode = false;
            // if (cssEditorDisplayElement.style.display === "block") {
            //     cssEditorDisplayElement.style.display = "none";
            // } else {
            //     cssEditorDisplayElement.style.display = "block";
            // }
        } else if (e.keyCode === types_KeyboardKey.KEY_O && e.ctrlKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            // screenDisplayElement.style.display = "block";
            // if (currentDebugMode === "none") {
            //     currentDebugMode = "hoveredElementDetails";
            // } else {
            //     screenDisplayElement.style.display = "none";
            //     currentDebugMode = "none";
            // }
        } else if (e.keyCode === types_KeyboardKey.KEY_I && e.ctrlKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
        } else if (e.keyCode === types_KeyboardKey.KEY_I && e.ctrlKey && e.altKey && !e.shiftKey) {
            e.preventDefault();
        } else if (e.keyCode === types_KeyboardKey.KEY_M && e.ctrlKey && e.altKey /* && !e.shiftKey */) {
            e.preventDefault();
        } else if (e.keyCode === types_KeyboardKey.KEY_C && e.ctrlKey && e.altKey && !e.shiftKey) {
            e.preventDefault();
        } else if (e.keyCode === types_KeyboardKey.KEY_U && e.ctrlKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            // screenDisplayElement.style.display = "block";
            // if (currentDebugMode === "none") {
            //     currentDebugMode = "hoveredElementDetails";
            // } else {
            //     screenDisplayElement.style.display = "none";
            //     currentDebugMode = "none";
            // }
        } else if (e.keyCode === types_KeyboardKey.KEY_S && cssEditorInSelectMode && e.target !== cssEditorSelectTargetButton) {
            e.preventDefault();
            // cssEditorInSelectMode = false;
            // /**
            //  * @type {HTMLElement & EventTarget}
            //  */
            // const srcElement = currentMouseHoverTarget;
            // cssEditorSelectedType = "element";
            // cssEditorSelectedElement = srcElement;
            // cssEditorTextBox.value = JSON.stringify(srcElement.attributes.style, undefined, 4);
            // cssEditorDisplayElement.style.display = "block";
        } else if (e.keyCode === types_KeyboardKey.F3 && !e.ctrlKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
        } else if (e.keyCode === types_KeyboardKey.F8 && e.ctrlKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
        }
    };
    window.onkeydown = function __OUIC_keyboardShortcutHandler_keyDown__(/** @type {KeyboardEvent} */ e: KeyboardEvent): void {
        if (e.keyCode === types_KeyboardKey.KEY_P && e.ctrlKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            cssEditorInSelectMode = false;
            if (cssEditorDisplayElement.style.display === "block") {
                cssEditorDisplayElement.style.display = "none";
            } else {
                cssEditorDisplayElement.style.display = "block";
            }
        } else if (e.keyCode === types_KeyboardKey.KEY_O && e.ctrlKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            if (currentDebugMode === "none") {
                screenDisplayElement.style.display = "block";
                currentDebugMode = "hoveredElementDetails";
            } else {
                screenDisplayElement.style.display = "none";
                currentDebugMode = "none";
            }
        } else if (e.keyCode === types_KeyboardKey.KEY_I && e.ctrlKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            toggleSmallCornerDebugOverlay();
        } else if (e.keyCode === types_KeyboardKey.KEY_I && e.ctrlKey && !e.altKey && e.shiftKey) {
            e.preventDefault();
            toggleStatsCornerDebugOverlay();
        } else if (e.keyCode === types_KeyboardKey.KEY_I && e.ctrlKey && e.altKey && !e.shiftKey) {
            e.preventDefault();
            toggleGeneralDebugOverlayElement();
        } else if (e.keyCode === types_KeyboardKey.KEY_M && e.ctrlKey && e.altKey /* && !e.shiftKey */) {
            e.preventDefault();
            if (mainMenu8CrafterUtilities.style.display === "none") {
                mainMenu8CrafterUtilities.style.display = "block";
            } else {
                mainMenu8CrafterUtilities.style.display = "none";
            }
        } else if (e.keyCode === types_KeyboardKey.KEY_C && e.ctrlKey && e.altKey && !e.shiftKey) {
            e.preventDefault();
            toggleConsoleOverlay();
        } else if (e.keyCode === types_KeyboardKey.KEY_S && e.ctrlKey && !e.altKey && !e.shiftKey) {
            e.preventDefault();
            toggleHTMLSourceCodePreviewElement();
        } else if (e.keyCode === types_KeyboardKey.KEY_S && cssEditorInSelectMode && currentMouseHoverTarget !== cssEditorSelectTargetButton) {
            e.preventDefault();
            cssEditorInSelectMode = false;
            /**
             * @type {HTMLElement & EventTarget}
             */
            const srcElement: HTMLElement & EventTarget = currentMouseHoverTarget;
            cssEditorSelectedType = "element";
            cssEditorSelectedElement = srcElement;
            elementInspectSelectionHistory.unshift(srcElement);
            elementInspectSelectionHistory.pop();
            cssEditorTextBox.value = srcElement.getAttribute("style") ?? "";
            setCSSEditorMode("element");
            cssEditorDisplayElement.style.display = "block";
        } else if (e.keyCode === types_KeyboardKey.KEY_2 && !e.ctrlKey && !e.altKey && !e.shiftKey && heldKeyCodes.includes(types_KeyboardKey.F3)) {
            togglePerfGraphDebugOverlay("FPS");
        } else if (e.keyCode === types_KeyboardKey.KEY_3 && !e.ctrlKey && !e.altKey && !e.shiftKey && heldKeyCodes.includes(types_KeyboardKey.F3)) {
            togglePerfGraphDebugOverlay("ELL");
        } else if (e.keyCode === types_KeyboardKey.KEY_4 && !e.ctrlKey && !e.altKey && !e.shiftKey && heldKeyCodes.includes(types_KeyboardKey.F3)) {
            togglePerfGraphDebugOverlay("FCD");
        } else if (e.keyCode === types_KeyboardKey.F8 && e.ctrlKey && !e.altKey && !e.shiftKey) {
            location.reload();
        }
    };
    window.onmousedown = function __OUIC_globalHandler_mouseDown__(/** @type {MouseEvent} */ e: MouseEvent): void {
        if (cssEditorInSelectMode && e.target !== cssEditorSelectTargetButton) {
            e.preventDefault();
            // cssEditorInSelectMode = false;
            /**
             * @type {HTMLElement & EventTarget}
             */
            const srcElement: HTMLElement & EventTarget = currentMouseHoverTarget;
            cssEditorSelectedType = "element";
            cssEditorSelectedElement = srcElement;
            elementInspectSelectionHistory.unshift(srcElement);
            elementInspectSelectionHistory.pop();
            cssEditorTextBox.value = srcElement.getAttribute("style") ?? "";
            setCSSEditorMode("element");
            cssEditorDisplayElement.style.display = "block";
            screenInputBlocker.style.display = "block";

            // document.getElementById("root").style.pointerEvents = "none";
            // document.getElementById("root").style.filter = "brightness(5)";
        }
    };
    window.onmouseup = function __OUIC_globalHandler_mouseUp__(/** @type {MouseEvent} */ e: MouseEvent): void {
        if (cssEditorInSelectMode && e.target !== cssEditorSelectTargetButton) {
            e.preventDefault();
            cssEditorInSelectMode = false;
            screenInputBlocker.style.display = "none";
            // /**
            //  * @type {HTMLElement & EventTarget}
            //  */
            // const srcElement = currentMouseHoverTarget;
            // cssEditorSelectedType = "element";
            // cssEditorSelectedElement = srcElement;
            // cssEditorTextBox.value = JSON.stringify(srcElement.attributes.style, undefined, 4);
            // cssEditorDisplayElement.style.display = "block";
            // e.target = undefined;
        }
    };
    window.onmousemove = function __OUIC_globalHandler_mouseMove__(/** @type {MouseEvent} */ e: MouseEvent): void {
        /**
         * @type {HTMLElement & EventTarget}
         */
        //@ts-ignore
        const srcElement: HTMLElement & EventTarget = e.target;
        currentMouseHoverTarget = srcElement;
        // screenDisplayElement.textContent = "aaaa";
        if (currentDebugMode === "hoveredElementDetails") {
            screenDisplayElement.textContent = srcElement.outerHTML.slice(0, 9000);
        }
        if (elementGeneralDebugOverlayElement.style.display === "block") {
            const boundingBox = srcElement.getBoundingClientRect();
            elementGeneralDebugOverlayElement.textContent = `Element: ${UTILS.cssPath(srcElement)}
Bounding Box: ${JSON.stringify({
                x: boundingBox.x,
                y: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height,
                top: boundingBox.top,
                right: boundingBox.right,
                bottom: boundingBox.bottom,
                left: boundingBox.left,
            })}
Children: ${srcElement.children.length}
Attributes:
${
    currentMouseHoverTarget.getAttributeNames().length > 0 ?
        currentMouseHoverTarget
            .getAttributeNames()
            .map((name: string): string => `${name}: ${currentMouseHoverTarget.getAttribute(name)}`)
            .join("\n")
    :   "None"
}`;
        }
    };

    /**
     *
     * @param {MouseEvent | KeyboardEvent} event
     */
    function updateSmallCornerDebugOverlayElement(event: MouseEvent | KeyboardEvent): void {
        if (event instanceof MouseEvent) {
            mousePos.clientX = event.clientX;
            mousePos.clientY = event.clientY;
            mousePos.screenX = event.screenX;
            mousePos.screenY = event.screenY;
            mousePos.movementX = event.movementX;
            mousePos.movementY = event.movementY;
            mousePos.mTarget = event.target;
            if (event.type === "mousedown") {
                heldMouseButtons = [...heldKeys.filter((key) => key !== MOUSE_BUTTON_NAMES[event.button]), MOUSE_BUTTON_NAMES[event.button]!];
            } else if (event.type === "mouseup") {
                heldMouseButtons = heldKeys.filter((key) => key !== MOUSE_BUTTON_NAMES[event.button]);
            }
        } else if (event instanceof KeyboardEvent) {
            if (event.type === "keydown") {
                heldKeys = [...heldKeys.filter((key) => key !== event.code), event.code];
                heldKeyCodes = [...heldKeyCodes.filter((key) => key !== event.keyCode), event.keyCode];
            } else if (event.type === "keyup") {
                heldKeys = heldKeys.filter((key) => key !== event.code);
                heldKeyCodes = heldKeyCodes.filter((key) => key !== event.keyCode);
            }
            mousePos.kTarget = event.target;
        }
        smallCornerDebugOverlayElement.textContent = `Client: x: ${mousePos.clientX} y: ${mousePos.clientY}
Screen: x: ${mousePos.screenX} y: ${mousePos.screenY}
Movement: x: ${mousePos.movementX} y: ${mousePos.movementY}
M Target Offset: ${
            mousePos.mTarget instanceof Element ?
                `x: ${Math.round((mousePos.clientX - mousePos.mTarget.getBoundingClientRect().x) * 100) / 100} y: ${
                    Math.round((mousePos.clientY - mousePos.mTarget.getBoundingClientRect().y) * 100) / 100
                }`
            :   "null"
        }
K Target Offset: ${
            mousePos.kTarget instanceof Element ?
                `x: ${Math.round((mousePos.clientX - mousePos.kTarget.getBoundingClientRect().x) * 100) / 100} y: ${
                    Math.round((mousePos.clientY - mousePos.kTarget.getBoundingClientRect().y) * 100) / 100
                }`
            :   "null"
        }
Held Keys: ${heldKeys.join(",")}
Held Key Codes: ${heldKeyCodes.join(",")}
Mouse Buttons: ${heldMouseButtons.join(",")}
Modifiers: ${[
            [event.ctrlKey, "CTRL"],
            [event.altKey, "ALT"],
            [event.shiftKey, "SHIFT"],
            [event.metaKey, "META"],
        ]
            .filter((key) => key[0])
            .map((key) => key[1])
            .join(",")}`;
    }
    addEventListener("mousemove", updateSmallCornerDebugOverlayElement);
    addEventListener("mousedown", updateSmallCornerDebugOverlayElement);
    addEventListener("mouseup", updateSmallCornerDebugOverlayElement);
    addEventListener("keydown", updateSmallCornerDebugOverlayElement);
    addEventListener("keyup", updateSmallCornerDebugOverlayElement);

    function updateStatsCornerDebugOverlayElement(): void {
        if (statsCornerDebugOverlayElement.style.display === "none") return;
        function formatDuration(duration: number): string {
            return `${Math.floor(Math.floor(duration) / (60 ** 2 * 1000)).toFixed(0)}:${Math.floor((Math.floor(duration) / (60 * 1000)) % 60).toFixed(0)}:${(
                Math.floor(Math.floor(duration) / 1000) % 60
            )
                .toFixed(0)
                .padStart(2, "0")}.${(duration % 1000).toFixed(4).replace(".", "").padStart(7, "0")}`;
        }
        try {
            var deviceInformationFacet: FacetTypeMap["core.deviceInformation"] | undefined =
                globalThis.getAccessibleFacetSpyFacets?.()?.["core.deviceInformation"];
        } catch {}
        let pixelsPerMillimeter: number | undefined = deviceInformationFacet?.pixelsPerMillimeter;
        if (pixelsPerMillimeter === undefined) {
            const localStorageValue: string | null = localStorage.getItem('facetValuePropertyCache:["core.deviceInformation","pixelsPerMillimeter"]');
            if (localStorageValue !== null) pixelsPerMillimeter = Number(localStorageValue);
        }
        statsCornerDebugOverlayElement.querySelector("div")!.textContent = `FPS: ${currentFPS}
Avg. Frame Time: ${currentFPS > 0 ? (1000 / currentFPS).toFixed(3) : 0} ms
Frames Since Last Second: ${framesSinceLastSecond}
Uptime: ${formatDuration(performance.now())}
Screen Size: ${screen.width}x${screen.height}
Available Screen Size: ${screen.availWidth}x${window.screen.availHeight}
Screen Color Depth: ${screen.colorDepth}
Screen Pixel Depth: ${screen.pixelDepth}
Device Pixel Ratio: ${devicePixelRatio}
Pixels Per Millimeter: ${pixelsPerMillimeter ?? "Loading..."}`;
    }
    queueMicrotask(setInterval.bind(void 0, updateStatsCornerDebugOverlayElement, 10));
    //#endregion

    //#region HTML Injection
    document.getElementsByTagName("html")[0]!.classList.add("dark_theme");

    // Hovered element HTML content overlay, accessed with CTRL+O.
    /**
     * @type {HTMLElement}
     */
    screenDisplayElement = document.createElement("div");
    screenDisplayElement.id = "screenDisplayElement";
    screenDisplayElement.style.cssText =
        "pointer-events: none; background-color: #00000080; color: #FFFFFFFF; width: 100vw; height: 50vh; position: fixed; top: 0; left: 0; z-index: 10000000; display: none; white-space: pre-wrap; overflow-wrap: anywhere";
    screenDisplayElement.textContent = "Nothing selected!";
    document.body.appendChild(screenDisplayElement);

    // General element debug info overlay, accessed with CTRL+ALT+I.
    elementGeneralDebugOverlayElement = document.createElement("div");
    elementGeneralDebugOverlayElement.id = "elementGeneralDebugOverlayElement";
    elementGeneralDebugOverlayElement.setAttribute(
        "style",
        "pointer-events: none; background-color: #00000080; color: #FFFFFFFF; width: 100vw; height: 25vh; position: fixed; top: 0; left: 0; z-index: 10000000; display: none; white-space: pre-wrap; overflow-wrap: anywhere;"
    );
    document.body.appendChild(elementGeneralDebugOverlayElement);

    // Small corner debug info overlay, accessed with CTRL+I.
    smallCornerDebugOverlayElement = document.createElement("div");
    smallCornerDebugOverlayElement.id = "smallCornerDebugOverlayElement";
    smallCornerDebugOverlayElement.setAttribute(
        "style",
        "pointer-events: none; background-color: #00000080; color: #FFFFFFFF; width: auto; height: auto; position: fixed; top: 0; right: 0; z-index: 10000000; display: none; white-space: pre-wrap; overflow-wrap: anywhere;"
    );
    smallCornerDebugOverlayElement.textContent = "Nothing selected!";
    document.body.appendChild(smallCornerDebugOverlayElement);

    // Stats corner debug info overlay, accessed with CTRL+SHIFT+I.
    statsCornerDebugOverlayElement = document.createElement("div");
    statsCornerDebugOverlayElement.id = "statsCornerDebugOverlayElement";
    statsCornerDebugOverlayElement.setAttribute(
        "style",
        `pointer-events: none; background-color: #00000080; color: #FFFFFFFF; width: auto; height: auto; position: fixed; top: 0; left: 0; z-index: 10000000;${
            localStorage.getItem("statsCornerDebugOverlayVisible") === "true" ? "" : " display: none;"
        } white-space: pre-wrap; overflow-wrap: anywhere;`
    );
    let changingPerfGraphScale = false;
    let changingPerfGraphScaleB = false;
    let changingPerfGraphScaleLastId = -1;
    let perfGraphScale: number;
    {
        try {
            var deviceInformationFacet: FacetTypeMap["core.deviceInformation"] | undefined =
                globalThis.getAccessibleFacetSpyFacets?.()?.["core.deviceInformation"];
        } catch {}
        const guiScaleBase: number =
            deviceInformationFacet?.guiScaleBase ??
            (Number(localStorage.getItem('facetValuePropertyCache:["core.deviceInformation","guiScaleBase"]') ?? 1) || 1);
        const guiScaleModifier: number =
            deviceInformationFacet?.guiScaleModifier ??
            (Number(localStorage.getItem('facetValuePropertyCache:["core.deviceInformation","guiScaleModifier"]') ?? 0) || 0);
        if (typeof deviceInformationFacet?.guiScaleBase === "number") {
            localStorage.setItem('facetValuePropertyCache:["core.deviceInformation","guiScaleBase"]', `${deviceInformationFacet.guiScaleBase}`);
        }
        if (typeof deviceInformationFacet?.guiScaleModifier === "number") {
            localStorage.setItem('facetValuePropertyCache:["core.deviceInformation","guiScaleModifier"]', `${deviceInformationFacet.guiScaleModifier}`);
        }
        if (typeof deviceInformationFacet?.pixelsPerMillimeter === "number") {
            localStorage.setItem('facetValuePropertyCache:["core.deviceInformation","pixelsPerMillimeter"]', `${deviceInformationFacet.pixelsPerMillimeter}`);
        }
        perfGraphScale = Math.ceil(Math.max(1, guiScaleBase + guiScaleModifier) / 1.5);
    }
    async function changePerfGraphScale(scale: number): Promise<void> {
        if (!Number.isFinite(scale) || scale <= 0) throw new TypeError(`Invalid scale: ${scale}`);
        while (changingPerfGraphScaleB) await new Promise((resolve: (value: void) => void): void => void setTimeout(resolve, 1));
        const id: number = ++changingPerfGraphScaleLastId;
        let endedSuccessfully = false;
        try {
            changingPerfGraphScale = true;
            changingPerfGraphScaleB = true;
            await new Promise((resolve: (value: void) => void): void => void setTimeout(resolve, 10));
            perfGraphScale = scale;
            document.querySelectorAll(".perfGraphContainer").forEach((container: Element): void => {
                if (!(container instanceof HTMLDivElement)) return;
                container.style.width = `${Number(container.getAttribute("data-base-width")) * scale}px`;
                container.style.height = `${Number(container.getAttribute("data-base-height")) * scale}px`;
                container.style.setProperty("--current-width", `${Number(container.getAttribute("data-base-width")) * scale}px`);
                container.style.setProperty("--current-height", `${Number(container.getAttribute("data-base-width")) * scale}px`);
            });
            await Promise.all(
                Array.from(document.querySelectorAll(".perfGraph")).map(async (canvas: Element): Promise<void> => {
                    if (!(canvas instanceof HTMLCanvasElement)) return;
                    canvas.getContext("2d").setTransform(1, 0, 0, 1, 0, 0);
                    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
                    if (canvas.width !== Number(canvas.getAttribute("data-base-width")) * scale) {
                        canvas.width = Number(canvas.getAttribute("data-base-width")) * scale;
                    }
                    if (canvas.height !== Number(canvas.getAttribute("data-base-height")) * scale) {
                        canvas.height = Number(canvas.getAttribute("data-base-height")) * scale;
                    }
                    await new Promise((resolve: (value: void) => void): void => void setTimeout(resolve, 1));
                    canvas.dispatchEvent(new Event("rerenderCanvas"));
                    await new Promise((resolve: (value: void) => void): void => void setTimeout(resolve, 1));
                })
            );
            if (id === changingPerfGraphScaleLastId) changingPerfGraphScale = false;
            endedSuccessfully = true;
        } finally {
            if (!endedSuccessfully) changingPerfGraphScale &&= false;
            changingPerfGraphScaleB &&= false;
        }
    }
    // globalThis.changePerfGraphScale = changePerfGraphScale;
    (EngineInterceptor.originalEngineMethods.on?.bind(engine) ?? engine.on.bind(engine))(
        "facet:updated:core.deviceInformation",
        function handleGUIScaleChangeForPerfGraph(this: void, deviceInformation: FacetTypeMap["core.deviceInformation"]): void {
            if (!deviceInformation || typeof deviceInformation.guiScaleBase !== "number" || typeof deviceInformation.guiScaleModifier !== "number") return;
            if (Number.isNaN(deviceInformation.guiScaleBase) || Number.isNaN(deviceInformation.guiScaleModifier)) return;
            localStorage.setItem('facetValuePropertyCache:["core.deviceInformation","guiScaleBase"]', deviceInformation.guiScaleBase.toString());
            localStorage.setItem('facetValuePropertyCache:["core.deviceInformation","guiScaleModifier"]', deviceInformation.guiScaleModifier.toString());
            if (typeof deviceInformation?.pixelsPerMillimeter === "number") {
                localStorage.setItem('facetValuePropertyCache:["core.deviceInformation","pixelsPerMillimeter"]', `${deviceInformation.pixelsPerMillimeter}`);
            }
            const GUIScale: number = Math.ceil(Math.max(1, deviceInformation.guiScaleBase + deviceInformation.guiScaleModifier) / 1.5);
            if (GUIScale !== perfGraphScale) {
                void changePerfGraphScale(GUIScale);
            }
        }
    );
    QueryManager.subscribeToQuery("core.device.display", function handleGUIScaleChangeForPerfGraph(this: void, displayInformation): void {
        if (!displayInformation || typeof displayInformation.guiScaleBase !== "number" || typeof displayInformation.guiScaleModifier !== "number") return;
        if (Number.isNaN(displayInformation.guiScaleBase) || Number.isNaN(displayInformation.guiScaleModifier)) return;
        localStorage.setItem('facetValuePropertyCache:["core.deviceInformation","guiScaleBase"]', displayInformation.guiScaleBase.toString());
        localStorage.setItem('facetValuePropertyCache:["core.deviceInformation","guiScaleModifier"]', displayInformation.guiScaleModifier.toString());
        if (typeof displayInformation?.pixelsPerMillimeter === "number") {
            localStorage.setItem('facetValuePropertyCache:["core.deviceInformation","pixelsPerMillimeter"]', `${displayInformation.pixelsPerMillimeter}`);
        }
        const GUIScale: number = Math.ceil(Math.max(1, displayInformation.guiScaleBase + displayInformation.guiScaleModifier) / 1.5);
        if (GUIScale !== perfGraphScale) {
            void changePerfGraphScale(GUIScale);
        }
    });
    statsCornerDebugOverlayElement.innerHTML = `<div style="display: contents;">Stats loading...</div>`;
    document.body.appendChild(statsCornerDebugOverlayElement);

    {
        // Lagometer, accessed with F3+2.
        const perfGraphOverlay_FPS = document.createElement("div");
        perfGraphOverlay_FPS.id = "perfGraph_FPS_container";
        perfGraphOverlay_FPS.classList.add("perfGraphContainer");
        perfGraphOverlay_FPS.setAttribute(
            "style",
            `pointer-events: none; background-color: #00000000; color: #FFFFFFFF; width: auto; height: auto; position: fixed; bottom: 0; left: 0; z-index: 90000000; white-space: pre-wrap; overflow-wrap: anywhere;`
        );
        // TODO: Make the height of this based on the screen so that the bar can extend to the top of the screen.
        const baseSize: [width: number, height: number] = [242, 201];
        perfGraphOverlay_FPS.style.width = `${baseSize[0] * perfGraphScale}px`;
        perfGraphOverlay_FPS.style.height = `${baseSize[1] * perfGraphScale}px`;
        perfGraphOverlay_FPS.setAttribute("data-base-width", String(baseSize[0]));
        perfGraphOverlay_FPS.setAttribute("data-base-height", String(baseSize[1]));
        perfGraphOverlay_FPS.style.setProperty("--current-width", `${baseSize[0] * perfGraphScale}px`);
        perfGraphOverlay_FPS.style.setProperty("--current-height", `${baseSize[1] * perfGraphScale}px`);
        perfGraphOverlay_FPS.innerHTML = `<canvas id="perfGraph_FPS" class="perfGraph" style="position: absolute; top: 0; left: 0; z-index: 1;" data-base-width="${baseSize[0]}" data-base-height="${baseSize[1] - 1}" width="${baseSize[0] * perfGraphScale}" height="${(baseSize[1] - 1) * perfGraphScale}"></canvas>
<!-- To make this identical to Java Edition, make the overlay the same height as the graph (the one pixel difference is so the bottom pixel of the bars isn't covered up by the border). -->
<canvas id="perfGraph_FPS_overlay" class="perfGraph" style="position: absolute; top: 0; left: 0; z-index: 2;" data-base-width="${baseSize[0]}" data-base-height="${baseSize[1]}" width="${baseSize[0] * perfGraphScale}" height="${baseSize[1] * perfGraphScale}"></canvas>`;
        if (localStorage.getItem("perfGraph_FPS_visible") !== "true") perfGraphOverlay_FPS.style.display = "none";
        document.body.appendChild(perfGraphOverlay_FPS);
    }

    {
        // Event Loop Lagometer, accessed with F3+3.
        const perfGraphOverlay_ELL = document.createElement("div");
        perfGraphOverlay_ELL.id = "perfGraph_ELL_container";
        perfGraphOverlay_ELL.classList.add("perfGraphContainer");
        perfGraphOverlay_ELL.setAttribute(
            "style",
            `pointer-events: none; background-color: #00000000; color: #FFFFFFFF; width: auto; height: auto; position: fixed; bottom: 0; right: 0; z-index: 90000000; white-space: pre-wrap; overflow-wrap: anywhere;`
        );
        // TODO: Make the height of this based on the screen so that the bar can extend to the top of the screen.
        const baseSize: [width: number, height: number] = [242, 201];
        perfGraphOverlay_ELL.style.width = `${baseSize[0] * perfGraphScale}px`;
        perfGraphOverlay_ELL.style.height = `${baseSize[1] * perfGraphScale}px`;
        perfGraphOverlay_ELL.setAttribute("data-base-width", String(baseSize[0]));
        perfGraphOverlay_ELL.setAttribute("data-base-height", String(baseSize[1]));
        perfGraphOverlay_ELL.style.setProperty("--current-width", `${baseSize[0] * perfGraphScale}px`);
        perfGraphOverlay_ELL.style.setProperty("--current-height", `${baseSize[1] * perfGraphScale}px`);
        perfGraphOverlay_ELL.innerHTML = `<canvas id="perfGraph_ELL" class="perfGraph" style="position: absolute; top: 0; left: 0; z-index: 1;" data-base-width="${baseSize[0]}" data-base-height="${baseSize[1] - 1}" width="${baseSize[0] * perfGraphScale}" height="${(baseSize[1] - 1) * perfGraphScale}"></canvas>
<canvas id="perfGraph_ELL_overlay" class="perfGraph" style="position: absolute; top: 0; left: 0; z-index: 2;" data-base-width="${baseSize[0]}" data-base-height="${baseSize[1]}" width="${baseSize[0] * perfGraphScale}" height="${baseSize[1] * perfGraphScale}"></canvas>`;
        if (localStorage.getItem("perfGraph_ELL_visible") !== "true") perfGraphOverlay_ELL.style.display = "none";
        document.body.appendChild(perfGraphOverlay_ELL);
    }

    {
        // Frame Callback Delay Graph, accessed with F3+3.
        const perfGraphOverlay_FCD = document.createElement("div");
        perfGraphOverlay_FCD.id = "perfGraph_FCD_container";
        perfGraphOverlay_FCD.classList.add("perfGraphContainer");
        perfGraphOverlay_FCD.setAttribute(
            "style",
            `pointer-events: none; background-color: #00000000; color: #FFFFFFFF; width: auto; height: auto; position: fixed; bottom: 0; left: calc(50vw - (var(--current-width) / 2)); z-index: 90000000; white-space: pre-wrap; overflow-wrap: anywhere;`
        );
        // TODO: Make the height of this based on the screen so that the bar can extend to the top of the screen.
        const baseSize: [width: number, height: number] = [242, 201];
        perfGraphOverlay_FCD.style.width = `${baseSize[0] * perfGraphScale}px`;
        perfGraphOverlay_FCD.style.height = `${baseSize[1] * perfGraphScale}px`;
        perfGraphOverlay_FCD.setAttribute("data-base-width", String(baseSize[0]));
        perfGraphOverlay_FCD.setAttribute("data-base-height", String(baseSize[1]));
        perfGraphOverlay_FCD.style.setProperty("--current-width", `${baseSize[0] * perfGraphScale}px`);
        perfGraphOverlay_FCD.style.setProperty("--current-height", `${baseSize[1] * perfGraphScale}px`);
        perfGraphOverlay_FCD.innerHTML = `<canvas id="perfGraph_FCD" class="perfGraph" style="position: absolute; top: 0; left: 0; z-index: 1;" data-base-width="${baseSize[0]}" data-base-height="${baseSize[1] - 1}" width="${baseSize[0] * perfGraphScale}" height="${(baseSize[1] - 1) * perfGraphScale}"></canvas>
<canvas id="perfGraph_FCD_overlay" class="perfGraph" style="position: absolute; top: 0; left: 0; z-index: 2;" data-base-width="${baseSize[0]}" data-base-height="${baseSize[1]}" width="${baseSize[0] * perfGraphScale}" height="${baseSize[1] * perfGraphScale}"></canvas>`;
        if (localStorage.getItem("perfGraph_FCD_visible") !== "true") perfGraphOverlay_FCD.style.display = "none";
        document.body.appendChild(perfGraphOverlay_FCD);
    }

    // CSS Editor, accessed with CTRL+P.
    cssEditorDisplayElement = document.createElement("div");
    cssEditorDisplayElement.id = "cssEditorBoxRootA";
    cssEditorDisplayElement.style.cssText =
        "background-color: #00000080; color: #FFFFFFFF; width: 500px; height: 500px; max-width: 100%; max-height: 100%; position: fixed; top: 0; left: 0; z-index: 10000000; display: none;";
    cssEditorDisplayElement.setAttribute("draggable", "true");
    cssEditorDisplayElement.innerHTML = `<div id="cssEditor_mainDiv" style="display: block;">
    <h3 id="cssEditor_title" style="margin: 0; text-align: center;">CSS Editor</h3>
    <h6 id="cssEditor_subtitle" style="margin: 0;">Nothing selected!</h6>
    <textarea style="pointer-events: auto; user-select: text; width: auto; height: 300px; background-color: #808080FF; pointer-events: none;" id="cssEditorTextBoxA"></textarea>
    <button type="button" id="cssEditorSelectTargetButton" onclick="cssEditorDisplayElement.style.display = 'none'; cssEditorInSelectMode = true; event.preventDefault();">Select Target</button>
    <!-- <button type="button" id="cssEditorSelectStyleSheetTargetButton" onclick="cssEditor_selectDocumentStyleSheet_activate(); event.preventDefault();">Select Style Sheet Target</button> -->
    <button type="button" id="cssEditorEditRootCSSButton" onclick="cssEditor_rootElementStylesMode(); event.preventDefault();">Edit Root CSS</button>
    <button type="button" id="cssEditorEditGlobalStyleSheetButton" onclick="cssEditor_globalStyleElementStylesMode(); event.preventDefault();">Edit Global Style Sheet</button>
    <button type="button" id="cssEditorSaveChangesButton" onclick="cssEditor_saveChanges(); event.preventDefault();" disabled>Save Changes</button>
    <p id="cssEditorErrorText" style="color: red"></p>
</div>
<!-- <div id="cssEditor_documentStyleSelectorDiv" style="display: none;">
</div> -->`;
    window.document.body.appendChild(cssEditorDisplayElement);
    //@ts-ignore
    cssEditorTextBox = cssEditorDisplayElement.querySelector("#cssEditorTextBoxA");
    //@ts-ignore
    cssEditorErrorText = cssEditorDisplayElement.querySelector("#cssEditorErrorText");
    //@ts-ignore
    cssEditorSelectTargetButton = cssEditorDisplayElement.querySelector("#cssEditorSelectTargetButton");
    // cssEditorTextBox.onkeypress = function (/** @type {KeyboardEvent} */ e) {
    //     e.stopPropagation();
    // };

    // Console overlay, accessed with CTRL+ALT+C.
    consoleOverlayElement = document.createElement("div");
    consoleOverlayElement.id = "consoleOverlayElement";
    consoleOverlayElement.setAttribute(
        "style",
        "background-color: #00000080; color: #FFFFFFFF; width: 95vw; height: 95vh; position: fixed; top: 2.5vh; left: 2.5vw; z-index: 10000000; display: none; white-space: pre-wrap; overflow-wrap: anywhere;/*  font-family: unset; */"
    );
    consoleOverlayElement.innerHTML = `<button type="button" style="position: absolute; top: 0; right: 0; font-family: Minecraft Seven v2; font-size: 50px; aspect-ratio: 1/1; color: #000000; width: 50px; height: 50px; z-index: 1;" onclick="consoleOverlayElement.style.display = 'none';"><span style="margin-top: -5px; font-family: Minecraft Seven v2;">x</span></button>
<div style="display: flex; flex-direction: row; height: 100%; width: 100%;"><div style="width: 100%; height: 75%; overflow-y: scroll; overflow-x: hidden; position: absolute; top: 0; left: 0;">
    <div style="width: 100%; height: 100%; overflow-y: scroll; overflow-x: hidden; position: absolute; top: 0; left: 0;" class="addScrollbar">
        <div id="consoleOverlayTextElement" style="user-select: text; /* white-space: pre-wrap; overflow-wrap: anywhere;  */width: 100%; height: 100%;"></div>
    </div>
    </div>
    <div style="width: 100%; height: 25%; position: absolute; bottom: 0; left: 0;">
        <textarea id="consoleOverlayInputFieldElement" style="user-select: text; width: 100%; height: 100%; pointer-events: auto;"></textarea>
        <div style="
            position: absolute;
            top: 5px;
            flex-direction: column;
            display: flex;
            justify-content: space-between;
            bottom: 5px;
            right: 5px;
        ">
            <button type="button" class="btn" style="font-size: 0.5in; line-height: 0.7142857143in; font-family: Minecraft Seven v2; display: table-cell" onclick="setConsoleInputFieldContentsToHistoryItem(currentlySelctedConsoleExecutionHistoryItemIndex + 1);">Previous</button>
            <button type="button" class="btn" style="font-size: 0.5in; line-height: 0.7142857143in; font-family: Minecraft Seven v2; display: table-cell" onclick="setConsoleInputFieldContentsToHistoryItem(currentlySelctedConsoleExecutionHistoryItemIndex - 1);">Next</button>
            <button type="button" class="btn" style="font-size: 0.5in; line-height: 0.7142857143in; font-family: Minecraft Seven v2; display: table-cell" onclick="consoleOverlayExecute();">Execute</button>
        </div>
    </div>
</div>`;
    document.body.appendChild(consoleOverlayElement);
    //@ts-ignore
    consoleOverlayTextElement = document.getElementById("consoleOverlayTextElement");
    //@ts-ignore
    consoleOverlayInputFieldElement = document.getElementById("consoleOverlayInputFieldElement");

    {
        /**
         * @type {Omit<ContextMenuCreationOptions, "x" | "y">}
         */
        const contextMenu: Omit<ContextMenuCreationOptions, "x" | "y"> = {
            width: 400,
            height: 600,
            items: [
                {
                    label: "Clear console",
                    action(): void {
                        consoleOverlayTextElement.innerHTML = "";
                    },
                },
                {
                    label: "Clear console history",
                    action(): void {
                        ConsoleExecutionHistory.clearHistory();
                    },
                },
                {
                    type: "separator",
                },
                {
                    label: "Copy console",
                    action(): void {
                        if (consoleOverlayTextElement.textContent) {
                            copyTextToClipboardAsync(
                                Array.from(consoleOverlayTextElement.children)
                                    .map((child) => child.textContent)
                                    .filter((v) => v !== null)
                                    .join("\n")
                            ).catch((reason: unknown): void => {
                                console.error(new Error(`[8CrafterConsole::Copy console] An error occured while copying to the clipboard.`), reason);
                            });
                        } else console.warn("Could not copy console to clipboard because the console is empty.");
                    },
                    get disabled(): boolean {
                        return !consoleOverlayTextElement.textContent;
                    },
                },
            ],
        };
        /**
         * @type {number | null}
         */
        let clickStartTime: number | null = null;
        consoleOverlayTextElement.addEventListener("mousedown", (event): void => {
            if (event.button !== 0) return;
            clickStartTime = Date.now();
        });
        consoleOverlayTextElement.addEventListener("mouseleave", (): void => {
            clickStartTime = null;
        });
        consoleOverlayTextElement.addEventListener("click", (event): void => {
            if (event.button !== 0) return;
            if (clickStartTime !== null && Date.now() - clickStartTime >= 500) {
                event.preventDefault();
                event.stopImmediatePropagation();
                setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
            }
            clickStartTime = null;
        });
        consoleOverlayTextElement.addEventListener("mouseup", (event): void => {
            if (event.button !== 2) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            setTimeout((): void => void showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY }), 1);
            // showContextMenu({ ...contextMenu, x: event.clientX, y: event.clientY });
        });
    }

    // setInterval(()=>console.log(consoleOverlayInputFieldElement.value), 1000)

    forceLoadFacet("core.router").catch((e: unknown): void => void console.error(new Error("Error while force loading core.router facet."), e));

    // 8Crafter Utilities Main Menu, accessed with CTRL+M.
    const mainMenu8CrafterUtilitiesTempContainer = document.createElement("div");
    mainMenu8CrafterUtilitiesTempContainer.innerHTML = `<div id="mainMenu8CrafterUtilities" style="background-color: #00000080; color: #FFFFFFFF; width: 75vw; height: 75vh; position: fixed; top: 12.5vh; left: 12.5vw; z-index: 20000000; display: none; border: 5px solid #87CEEb;" draggable="true">
    <div id="8CrafterUtilitiesMenu_leftSidebar_outer" style="display: block; height: 100%; width: 30%; border-right: 5px solid #87CEEb; position: absolute; top: 0; left: 0;">
        <div id="8CrafterUtilitiesMenu_leftSidebar" style="display: block; overflow-y: scroll; height: 100%; width: 100%; position: absolute; top: 0; left: 0;" class="addScrollbar">
            <button type="button" class="btn nsel selected" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_general" onclick="setMainMenu8CrafterUtilitiesTab('general'); event.preventDefault();">General</button>
            <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_UIs" onclick="setMainMenu8CrafterUtilitiesTab('UIs'); event.preventDefault();">UIs</button>
            <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_about" onclick="setMainMenu8CrafterUtilitiesTab('about'); event.preventDefault();">About</button>
            <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_autoJoin" onclick="setMainMenu8CrafterUtilitiesTab('autoJoin'); event.preventDefault();">Auto Rejoin</button>
            <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_router" onclick="setMainMenu8CrafterUtilitiesTab('router'); event.preventDefault();">Router</button>
            <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_performance" onclick="setMainMenu8CrafterUtilitiesTab('performance'); event.preventDefault();">Performance</button>
            <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_dev" onclick="setMainMenu8CrafterUtilitiesTab('dev'); event.preventDefault();">Dev</button>
            <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_debug" onclick="setMainMenu8CrafterUtilitiesTab('debug'); event.preventDefault();">Debug</button>
            <!-- <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_facets" onclick="setMainMenu8CrafterUtilitiesTab('facets'); event.preventDefault();">Facets</button> -->
        </div>
    </div>
    <div id="8CrafterUtilitiesMenu_rightSide_outer" style="display: block; height: 100%; width: 70%; border-right: 5px solid #87CEEb; position: absolute; top: 0; right: 0;">
        <div id="8CrafterUtilitiesMenu_rightSide" style="display: block; overflow-y: scroll; height: 100%; width: 100%; position: absolute; top: 0; left: 0; padding: 1rem;" class="addScrollbar">
            <div id="8CrafterUtilitiesMenu_general" style="display: block;">
                <center>
                    <h1>8Crafter Utilities</h1>
                </center>
                <p>
                    <span style="white-space: pre-wrap;"><b>Version:</b> ${
                        typeof oreUICustomizerVersion !== "undefined" ?
                            `v${oreUICustomizerVersion}`
                        :   '<em style="color: red;"><strong>&lt;MISSING VERSION!&gt;</strong></em>'
                    }</span>
                </p>
                <p style="margin-top: 0;">
                    <div style="white-space: pre-wrap;"><b>Config:</b></div>
                    <span style="white-space: pre-wrap; font-family: Consolas;">${
                        typeof oreUICustomizerConfig !== "undefined" ?
                            JSON.stringify(oreUICustomizerConfig, undefined, 4)
                        :   '<em style="color: red;"><strong>&lt;MISSING CONFIG!&gt;</strong></em>'
                    }</span>
                </p>
            </div>
            <div id="8CrafterUtilitiesMenu_UIs" style="display: none;">
                <center>
                    <h1>UIs</h1>
                </center>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_viewHTMLSource" onclick="toggleHTMLSourceCodePreviewElement(); event.preventDefault();">View HTML Source</button>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_CSSEditor" onclick="cssEditorDisplayElement.style.display = cssEditorDisplayElement.style.display === 'none' ? 'block' : 'none'; event.preventDefault();">CSS Editor</button>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_smallCornerDebugOverlayElement" onclick="toggleSmallCornerDebugOverlay(); event.preventDefault();">Small Corner Debug Overlay</button>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_statsCornerDebugOverlayElement" onclick="toggleStatsCornerDebugOverlay(); event.preventDefault();">Stats Corner Debug Overlay</button>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_elementGeneralDebugOverlayElement" onclick="toggleGeneralDebugOverlayElement(); event.preventDefault();">Element General Debug Overlay</button>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_consoleOverlay" onclick="toggleConsoleOverlay(); event.preventDefault();">Console</button>
                <h2>F3 Graphs</h2>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_perfGraph_FPS_overlay" onclick="togglePerfGraphDebugOverlay('FPS'); event.preventDefault();">Lagometer</button>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_perfGraph_FPS_overlay" onclick="togglePerfGraphDebugOverlay('ELL'); event.preventDefault();">Event Loop Lag Graph</button>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_perfGraph_FPS_overlay" onclick="togglePerfGraphDebugOverlay('FCD'); event.preventDefault();">Frame Callback Delay Graph</button>
            </div>
            <div id="8CrafterUtilitiesMenu_about" style="display: none;">
                <center>
                    <h1>About</h1>
                </center>
                <p>
                    8Crafter's Ore UI Customizer ${
                        typeof oreUICustomizerVersion !== "undefined" ?
                            `v${oreUICustomizerVersion}`
                        :   '<em style="color: red;"><strong>&lt;MISSING VERSION!&gt;</strong></em>'
                    }
                </p>
                <p>
                    <span style="display: inline;">Source: <span style="color: #87ceeb; cursor: pointer; text-decoration: underline 1px solid #87ceeb;" onclick="(async () => {(getAccessibleFacetSpyFacets()['vanilla.editor'] ?? await forceLoadFacet('vanilla.editor')).navigateUri('https://www.8crafter.com/utilities/ore-ui-customizer');})()">https://www.8crafter.com/utilities/ore-ui-customizer</span></span>
                </p>
                <h3>Support</h3>
                <p>
                    <span style="display: inline;">Discord: <span style="color: #87ceeb; cursor: pointer; text-decoration: underline 1px solid #87ceeb;" onclick="(async () => {(getAccessibleFacetSpyFacets()['vanilla.editor'] ?? await forceLoadFacet('vanilla.editor')).navigateUri('https://discord.8crafter.com');})()">https://discord.8crafter.com</span></span>
                </p>
                <p>
                    <span style="display: inline;">GitHub: <span style="color: #87ceeb; cursor: pointer; text-decoration: underline 1px solid #87ceeb;" onclick="(async () => {(getAccessibleFacetSpyFacets()['vanilla.editor'] ?? await forceLoadFacet('vanilla.editor')).navigateUri('https://github.com/8Crafter-Studios/Ore-UI-Customizer-App');})()">https://github.com/8Crafter-Studios/Ore-UI-Customizer-App</span></span>
                </p>
                <p>
                    <span style="display: inline;">Email: <span style="color: #87ceeb; cursor: pointer; text-decoration: underline 1px solid #87ceeb;" onclick="(async () => {(getAccessibleFacetSpyFacets()['vanilla.editor'] ?? await forceLoadFacet('vanilla.editor')).navigateUri('mailto:8crafteryt@gmail.com');})()">8crafteryt@gmail.com</span></span>
                </p>
                <h3>Keyboard Shortcuts</h3>
                <ul>
                    <li>
                        <code>CTRL + P</code> - Toggle CSS Editor visibility.
                    </li>
                    <li>
                        <code>CTRL + O</code> - Toggle Target Element HTML Source Code Preview visibility.
                    </li>
                    <li>
                        <code>CTRL + I</code> - Toggle Small Corner Debug Overlay visibility.
                    </li>
                    <li>
                        <code>CTRL + ALT + I</code> - Toggle Element General Debug Overlay visibility.
                    </li>
                    <li>
                        <code>CTRL + SHIFT + I</code> - Toggle Stats Corner Debug Overlay visibility.
                    </li>
                    <li>
                        <code>CTRL + ALT + M</code> - Toggle 8Crafter Utilities Menu visibility.
                    </li>
                    <li>
                        <code>CTRL + ALT + C</code> - Toggle Console visibility.
                    </li>
                    <li>
                        <code>CTRL + S</code> - Toggle HTML Source Code Preview visibility.
                    </li>
                    <li>
                        <code>CTRL + F8</code> - Reload Ore UI.
                    </li>
                    <li>
                        <code>F3 + 2</code> - Toggle Lagometer.
                    </li>
                    <li>
                        <code>F3 + 3</code> - Toggle Event Loop Lag Graph.
                    </li>
                    <li>
                        <code>F3 + 4</code> - Toggle Frame Callback Delay Graph.
                    </li>
                </ul>
            </div>
            <div id="8CrafterUtilitiesMenu_autoJoin" style="display: none;">
                <center>
                    <h1>Auto Rejoin</h1>
                </center>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_enableAutoRejoin" onclick="enableAutoJoinForOpenServer(); event.preventDefault();">Enable Auto Rejoin</button>
                <button type="button" class="btn nsel disabled" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_disableAutoRejoin" disabled onclick="window.localStorage.removeItem('autoJoinName'); window.localStorage.removeItem('autoJoinType'); document.getElementById('8CrafterUtilitiesMenu_span_autoJoinName').textContent = 'None'; document.getElementById('8CrafterUtilitiesMenu_span_autoJoinType').textContent = 'None'; this.setAttribute('disabled', true); this.classList.add('disabled'); event.preventDefault();">Disable Auto Rejoin</button>
                <h4 style="margin-bottom: 0;">Auto Rejoin Details</h4>
                <p style="margin-top: 0; margin-bottom: 0;">
    Name: <span id="8CrafterUtilitiesMenu_span_autoJoinName">None</span>
                </p>
                <p style="margin-top: 0;">
    Type: <span id="8CrafterUtilitiesMenu_span_autoJoinType">None</span>
                </p>
            </div>
            <div id="8CrafterUtilitiesMenu_router" style="display: none;">
                <center>
                    <h1>Router</h1>
                </center>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_router_goBack" onclick="getAccessibleFacetSpyFacets()['core.router'].history.goBack(); event.preventDefault();">Go Back</button>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_router_goForward" onclick="getAccessibleFacetSpyFacets()['core.router'].history.goForward(); event.preventDefault();">Go Forward</button>
                <hr />
                <label for="8CrafterUtilitiesMenu_input_router_path">Route</label>
                <input type="text" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in; width: 100%;" id="8CrafterUtilitiesMenu_input_router_path" placeholder="/example/route?p1=v1&amp;p2=v2#anchor" />
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_replaceRoute" onclick="getAccessibleFacetSpyFacets()['core.router'].history.replace(document.getElementById('8CrafterUtilitiesMenu_input_router_path').value); event.preventDefault();">Replace</button>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_pushRoute" onclick="getAccessibleFacetSpyFacets()['core.router'].history.push(document.getElementById('8CrafterUtilitiesMenu_input_router_path').value); event.preventDefault();">Push</button>
                <hr />
                <center>
                    <h2>Current Router Stack</h2>
                </center>
                <div id="8CrafterUtilitiesMenu_div_router_stack" style="width: 100%; display: flex; flex-direction: column;"></div>
            </div>
            <div id="8CrafterUtilitiesMenu_performance" style="display: none;">
                <center>
                    <h1>Performance</h1>
                </center>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_toggleLitePlayScreen" onclick="if (localStorage.getItem('enableLitePlayScreen') === 'true') {this.textContent = 'Enable Lite Play Screen'; document.getElementById('8CrafterUtilitiesMenu_button_toggleLitePlayScreenNoReload').disabled = false; setLitePlayScreenEnabled(false); disableLitePlayScreen();} else {this.textContent = 'Disable Lite Play Screen'; setLitePlayScreenEnabled(true); enableLitePlayScreen();}; event.preventDefault();">${
                    localStorage.getItem("enableLitePlayScreen") === "true" ? "Disable" : "Enable"
                } Lite Play Screen</button>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_toggleLitePlayScreenNoReload" onclick="if (!this.disabled) {this.disabled = true; setLitePlayScreenEnabled(true, true); enableLitePlayScreen(true); document.getElementById('8CrafterUtilitiesMenu_button_toggleLitePlayScreen').textContent = 'Disable Lite Play Screen';}; event.preventDefault();"${
                    localStorage.getItem("enableLitePlayScreenNoReload") === "true" ? "" : " disabled"
                }>Enable Lite Play Screen (No Reload)</button>
            </div>
            <div id="8CrafterUtilitiesMenu_dev" style="display: none;">
                <center>
                    <h1>Dev</h1>
                </center>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_copyNewFacetListToClipboard" onclick="copyNewFacetListToClipboard(); event.preventDefault();">Copy New Facet List</button>
            </div>
            <div id="8CrafterUtilitiesMenu_debug" style="display: none;">
                <center>
                    <h1>Debug</h1>
                </center>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_clearLocalStorage" onclick="localStorage.clear(); event.preventDefault();">Clear localStorage</button>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_copyLocalStorageToClipboard" onclick="copyTextToClipboardAsync(JSON.stringify(Object.fromEntries(readLocalStorageKeys().map(v=>[v, localStorage.getItem(v)])), null, 4)); event.preventDefault();">Copy localStorage</button>
                <button type="button" class="btn nsel" style="overflow-wrap: anywhere; white-space: pre-wrap; font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_reload" onclick="location.reload(); event.preventDefault();">Reload</button>
            </div>
            <!-- <div id="8CrafterUtilitiesMenu_facets" style="display: none;">
                <center>
                    <h1>Facets</h1>
                </center>
                <div id="8CrafterUtilitiesMenu_div_facets_stack" style="width: 100%; display: flex; flex-direction: column;"></div>
            </div> -->
        </div>
    </div>
</div>`; // IDEA: Add a facets list, with backround colors indicating the status of each facet (ex. green for loaded, yellow for unloaded, red for non-existent).
    //@ts-ignore
    mainMenu8CrafterUtilities = document.body.appendChild(mainMenu8CrafterUtilitiesTempContainer.children[0]);
    /**
     * @param {FacetTypeMap["core.router"]} router
     */
    function routerObserveCallback(router: FacetTypeMap["core.router"]): void {
        try {
            const routerStack: HTMLElement | null = document.getElementById("8CrafterUtilitiesMenu_div_router_stack");
            if (routerStack) {
                while (routerStack.children.length > 0) {
                    routerStack.children[0]!.remove();
                }
                for (let i = 0; i < router.history.list.length; i++) {
                    const route = router.history.list[i]!;
                    const div = document.createElement("div");
                    div.onclick = (event: MouseEvent): void => {
                        const router = getAccessibleFacetSpyFacets()["core.router"];
                        router?.history.go(i - (router.history.list.length - 1));
                        event.preventDefault();
                    };
                    div.textContent = route.pathname + (route.search ? `?${route.search}` : "") + (route.hash ? `#${route.hash}` : "");
                    div.style.cursor = "pointer";
                    routerStack.appendChild(div);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
    FacetManager.observeFacetData("core.router", routerObserveCallback);
    // FacetManager.observeFacetData("core.router", routerObserveCallback);
    // FacetManager.observeFacetData("vanilla.connectionErrorInfoFacet", console.log);
    // forceLoadFacet("vanilla.connectionErrorInfoFacet");
    // forceUnloadFacet("vanilla.connectionErrorInfoFacet");
    screenInputBlocker = document.createElement("div");
    screenInputBlocker.innerHTML = `<div id="screenInputBlocker" style="background-color: #00000080; color: #FFFFFFFF; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; z-index: 9999999; display: none;"></div>`;
    document.body.appendChild(screenInputBlocker);
    htmlSourceCodePreviewElement = document.createElement("div");
    htmlSourceCodePreviewElement.id = "htmlSourceCodePreviewElement";
    htmlSourceCodePreviewElement.setAttribute(
        "style",
        `background-color: #000000C0; color: #FFFFFFFF; width: 95vw; height: 95vh; position: fixed; top: 2.5vh; left: 2.5vw; z-index: 10000001; display: none; overflow: scroll; scrollbar-width: thin;`
    );
    htmlSourceCodePreviewElement.classList.add("addScrollbar");
    htmlSourceCodePreviewElement.innerHTML = `<button type="button" style="position: absolute; top: 0; right: 0; font-family: Minecraft Seven v2; font-size: 50px; aspect-ratio: 1/1; color: #000000; width: 50px; height: 50px;" onclick="htmlSourceCodePreviewElement.style.display = 'none';"><span style="margin-top: -5px">x</span></button><p style="width: 100%;"></p>`;
    document.body.appendChild(htmlSourceCodePreviewElement);
    //@ts-ignore
    htmlSourceCodePreviewElementP = htmlSourceCodePreviewElement.querySelector("p");

    customGlobalCSSStyleElement = document.createElement("style");
    customGlobalCSSStyleElement.id = "customGlobalCSSStyle";
    document.head.appendChild(customGlobalCSSStyleElement);
    cssEditorTextBox.addEventListener("mouseup", (): void => {
        const caretPosition: number = cssEditorTextBox.selectionStart;
        screenDisplayElement.textContent = `Caret position: ${caretPosition}`;
    });
    // cssEditorTextBox.addEventListener("focusin", () => {
    //     document.getElementById("root").style.display = "none";
    //     for (const styleSheet of document.styleSheets) {
    //         if (styleSheet.ownerNode === customGlobalCSSStyleElement) {
    //             styleSheet.insertRule(`#root * { pointer-events: none !important; }`, 0);
    //             break;
    //         }
    //     }
    //     // document.getElementById("root").style.pointerEvents = "none";
    //     // document.getElementById("root").inert = true;
    //     // document.getElementById("root").setAttribute("disabled", "");
    // });
    // cssEditorTextBox.addEventListener("focusout", (e) => {
    //     document.getElementById("root").style.display = "";
    //     for (const styleSheet of document.styleSheets) {
    //         if (styleSheet.ownerNode === customGlobalCSSStyleElement) {
    //             styleSheet.deleteRule(0);
    //             break;
    //         }
    //     }
    //     e.preventDefault();
    //     e.stopImmediatePropagation();
    //     // document.getElementById("root").style.pointerEvents = "";
    //     // document.getElementById("root").inert = false;
    //     // document.getElementById("root").removeAttribute("disabled");
    // });

    // window.onkeyup = function(/** @type {KeyboardEvent} */ e) {
    //     if(e.key.toLowerCase() === "o" && screenDisplayElement.style.display === "block"){
    //         screenDisplayElement.style.display = "none";
    //         if(currentDebugMode === "hoveredElementDetails"){
    //             currentDebugMode = "none";
    //         }
    //     }
    // }
    canvasInit: {
        const canvas_FPS_container: HTMLElement | null = document.getElementById("perfGraph_FPS_container");
        const canvas_FPS: HTMLElement | null = document.getElementById("perfGraph_FPS");
        const canvas_FPS_overlay: HTMLElement | null = document.getElementById("perfGraph_FPS_overlay");
        const canvas_ELL_container: HTMLElement | null = document.getElementById("perfGraph_ELL_container");
        const canvas_ELL: HTMLElement | null = document.getElementById("perfGraph_ELL");
        const canvas_ELL_overlay: HTMLElement | null = document.getElementById("perfGraph_ELL_overlay");
        const canvas_FCD_container: HTMLElement | null = document.getElementById("perfGraph_FCD_container");
        const canvas_FCD: HTMLElement | null = document.getElementById("perfGraph_FCD");
        const canvas_FCD_overlay: HTMLElement | null = document.getElementById("perfGraph_FCD_overlay");
        if (!(canvas_FPS instanceof HTMLCanvasElement)) {
            console.error('Canvas with id "perfGraph_FPS" was not found.');
            break canvasInit;
        }
        if (!(canvas_FPS_overlay instanceof HTMLCanvasElement)) {
            console.error('Canvas with id "perfGraph_FPS_overlay" was not found.');
            break canvasInit;
        }
        if (!(canvas_ELL instanceof HTMLCanvasElement)) {
            console.error('Canvas with id "perfGraph_ELL" was not found.');
            break canvasInit;
        }
        if (!(canvas_ELL_overlay instanceof HTMLCanvasElement)) {
            console.error('Canvas with id "perfGraph_ELL_overlay" was not found.');
            break canvasInit;
        }
        if (!(canvas_FCD instanceof HTMLCanvasElement)) {
            console.error('Canvas with id "perfGraph_FCD" was not found.');
            break canvasInit;
        }
        if (!(canvas_FCD_overlay instanceof HTMLCanvasElement)) {
            console.error('Canvas with id "perfGraph_FCD_overlay" was not found.');
            break canvasInit;
        }
        const ctx_FPS: CanvasRenderingContext2D = canvas_FPS.getContext("2d");
        const ctx_FPS_overlay: CanvasRenderingContext2D = canvas_FPS_overlay.getContext("2d");
        const ctx_ELL: CanvasRenderingContext2D = canvas_ELL.getContext("2d");
        const ctx_ELL_overlay: CanvasRenderingContext2D = canvas_ELL_overlay.getContext("2d");
        const ctx_FCD: CanvasRenderingContext2D = canvas_FCD.getContext("2d");
        const ctx_FCD_overlay: CanvasRenderingContext2D = canvas_FCD_overlay.getContext("2d");

        // const width = canvas_FPS.width;
        // const height = canvas_FPS.height;

        // type ELLStatus = "Excellent" | "Good" | "Stressed" | "Critical" | "Loading..." | "N/A";

        // let ell = 0;
        // let ellStatus: ELLStatus = "Loading..."; // Thread Responsiveness (TR);

        // FPS monitor.
        const startFPSMonitor = function startFPSMonitor(onSample?: (frameTime: number) => void): () => number {
            let lastFrame: DOMHighResTimeStamp = performance.now();
            let frameTime = 0;
            function tick(time: DOMHighResTimeStamp): void {
                frameTime = time - lastFrame;
                lastFrame = time;
                onSample?.(frameTime);
                requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            return (): number => frameTime;
        };

        // Event Loop Lag monitor.
        const startJsLagMonitor = function startJsLagMonitor(interval: number | (() => number) = 5, onSample?: (ell: number) => void): () => number {
            let last: number = performance.now();
            let lag = 0;
            let lastInterval: number = typeof interval === "number" ? interval : interval();

            function tick(): void {
                const now: number = performance.now();
                const delta: number = now - Math.max(lastAnimationFrameTime /* lastAnimationFrameCallbackTime */, last);
                lag = Math.max(0, delta /* - lastInterval */);

                onSample?.(lag); // draw a bar for THIS sample

                last = now;
                setTimeout(tick, (lastInterval = typeof interval === "number" ? interval : interval()));
            }

            setTimeout(tick, lastInterval);
            return (): number => lag;
        };

        let lastAnimationFrameTime: DOMHighResTimeStamp = performance.now();
        let lastAnimationFrameCallbackTime: DOMHighResTimeStamp = performance.now();
        void lastAnimationFrameTime;
        void lastAnimationFrameCallbackTime;

        // Frame Callback Delay monitor.
        const startFCDMonitor = function startFCDMonitor(onSample?: (delay: number) => void): () => number {
            let delay = 0;

            function tick(time: DOMHighResTimeStamp): void {
                const now: DOMHighResTimeStamp = performance.now();
                delay = now - time;
                lastAnimationFrameTime = time;
                lastAnimationFrameCallbackTime = now;
                onSample?.(delay);
                requestAnimationFrame(tick);
            }

            requestAnimationFrame(tick);
            return (): number => delay;
        };

        let bufferCanvas_FPS: HTMLCanvasElement = document.createElement("canvas");
        bufferCanvas_FPS.width = canvas_FPS.width;
        bufferCanvas_FPS.height = canvas_FPS.height;
        let bufferCtx_FPS: CanvasRenderingContext2D = bufferCanvas_FPS.getContext("2d");

        let bufferCanvas_ELL: HTMLCanvasElement = document.createElement("canvas");
        bufferCanvas_ELL.width = canvas_ELL.width;
        bufferCanvas_ELL.height = canvas_ELL.height;
        let bufferCtx_ELL: CanvasRenderingContext2D = bufferCanvas_ELL.getContext("2d");

        let bufferCanvas_FCD: HTMLCanvasElement = document.createElement("canvas");
        bufferCanvas_FCD.width = canvas_FCD.width;
        bufferCanvas_FCD.height = canvas_FCD.height;
        let bufferCtx_FCD: CanvasRenderingContext2D = bufferCanvas_FCD.getContext("2d");

        const graphFrameTimeValues: number[] = [];

        const getFpsColor = function getFpsColor(ms: number): string {
            const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));
            const t = clamp(ms / 100, 0, 1);

            let r: number, g: number;

            if (t < 0.3) {
                // Green to Yellow
                r = (t / 0.3) * 255;
                g = 255;
            } else {
                // Yellow to Red
                r = 255;
                g = 255 - ((t - 0.3) / 0.7) * 255;
            }

            return `rgb(${Math.round(r)},${Math.round(g)},0)`;
        };

        let maxFrameRate = NaN;
        const startMaxFrameRateMonitor = function startMaxFrameRateMonitor(this: void, delay: number): void {
            async function queryMaxFrameRate(): Promise<void> {
                while (canvas_FPS_container?.style.display === "none") await new Promise((resolve): void => void setTimeout(resolve, delay));
                const queryId: bigint = QueryManager.nextQueryId++;
                const queryCallbackInitial = (value: unknown): void => {
                    (EngineInterceptor.originalEngineMethods.off?.bind(engine) ?? engine.off.bind(engine))(`query:subscribed/${queryId}`, queryCallbackInitial);
                    (EngineInterceptor.originalEngineMethods.off?.bind(engine) ?? engine.off.bind(engine))(`query:updated/${queryId}`, queryCallbackInitial);
                    (EngineInterceptor.originalEngineMethods.on?.bind(engine) ?? engine.on.bind(engine))(`query:updated/${queryId}`, queryCallback);

                    queryCallback(value);

                    // setTimeout(queryMaxFrameRate, delay);
                };
                const queryCallback = (value: unknown): void => {
                    const data = value as Extract<EngineQueryNonFacetResultMap["vanilla.menus.settingsNumberQuery"], { id: "video.mode.fancy.framerate" }>;
                    maxFrameRate = parseInt(data.valueText, 10) || Infinity;
                };
                (EngineInterceptor.originalEngineMethods.on?.bind(engine) ?? engine.on.bind(engine))(`query:subscribed/${queryId}`, queryCallbackInitial);
                (EngineInterceptor.originalEngineMethods.on?.bind(engine) ?? engine.on.bind(engine))(`query:updated/${queryId}`, queryCallbackInitial);
                (EngineInterceptor.originalEngineMethods.trigger?.bind(engine) ?? engine.trigger.bind(engine))(
                    "query:subscribe/vanilla.menus.settingsNumberQuery",
                    queryId,
                    "video.mode.fancy.framerate"
                );
            }
            {
                const queryId: bigint = QueryManager.nextQueryId++;
                const settingsGroupQueryCallback = function settingsGroupQueryCallback(): void {
                    (EngineInterceptor.originalEngineMethods.off?.bind(engine) ?? engine.off.bind(engine))(
                        `query:subscribed/${queryId}`,
                        settingsGroupQueryCallback
                    );
                    (EngineInterceptor.originalEngineMethods.trigger?.bind(engine) ?? engine.trigger.bind(engine))("query:unsubscribe", queryId);
                    void queryMaxFrameRate();
                };
                (EngineInterceptor.originalEngineMethods.on?.bind(engine) ?? engine.on.bind(engine))(`query:subscribed/${queryId}`, settingsGroupQueryCallback);
                (EngineInterceptor.originalEngineMethods.trigger?.bind(engine) ?? engine.trigger.bind(engine))(
                    "query:subscribe/vanilla.menus.settingsGroupQuery",
                    queryId,
                    "video.mode.fancy"
                );
            }
        };
        setTimeout(startMaxFrameRateMonitor.bind(void 0, 100), 1);

        const fpsGraphDrawQueue: number[] = [];

        /**
         * 1 ms on the FPS graph is this many pixels.
         */
        const FPS_GRAPH_SCALE = 1.8;

        const drawFpsGraph = function drawFpsGraph(frameTime: number | readonly number[], bypassChangeScaleWait = false): void {
            if (frameTime instanceof Array && frameTime.length === 0) return;
            if (!bypassChangeScaleWait && changingPerfGraphScale) {
                return void fpsGraphDrawQueue.push(...(typeof frameTime === "number" ? [frameTime] : frameTime));
            }
            const RENDERED_SCALE: number = perfGraphScale;
            const w: number = canvas_FPS.width / RENDERED_SCALE;
            const h: number = canvas_FPS.height / RENDERED_SCALE;
            // const wO: number = canvas_FPS_overlay.width / RENDERED_SCALE;
            const hO: number = canvas_FPS_overlay.height / RENDERED_SCALE;
            if (!bypassChangeScaleWait) {
                if (fpsGraphDrawQueue.length > 0) {
                    frameTime = [...fpsGraphDrawQueue, ...(typeof frameTime === "number" ? [frameTime] : frameTime)];
                    fpsGraphDrawQueue.length = 0;
                    graphFrameTimeValues.push(...frameTime);
                    graphFrameTimeValues.splice(0, Math.max(0, graphFrameTimeValues.length - (w - 2)));
                } else {
                    graphFrameTimeValues.push(...(typeof frameTime === "number" ? [frameTime] : frameTime));
                    graphFrameTimeValues.splice(0, Math.max(0, graphFrameTimeValues.length - (w - 2)));
                }
            }
            if (frameTime instanceof Array && frameTime.length > w - 2) frameTime = frameTime.slice(-w + 2);
            if (bufferCanvas_FPS.width !== canvas_FPS.width || bufferCanvas_FPS.height !== canvas_FPS.height) {
                bufferCtx_FPS.clearRect(0, 0, bufferCanvas_FPS.width, bufferCanvas_FPS.height);
                bufferCanvas_FPS = document.createElement("canvas");
                bufferCanvas_FPS.width = canvas_FPS.width;
                bufferCanvas_FPS.height = canvas_FPS.height;
                bufferCtx_FPS = bufferCanvas_FPS.getContext("2d");
            }
            ctx_FPS.setTransform(1, 0, 0, 1, 0, 0);
            ctx_FPS_overlay.setTransform(1, 0, 0, 1, 0, 0);
            ctx_FPS_overlay.scale(RENDERED_SCALE, RENDERED_SCALE);

            const currentFrameTime: number = typeof frameTime === "number" ? frameTime : frameTime.at(-1)!;

            const fps: number = 1000 / currentFrameTime;

            const newBarCount: number = typeof frameTime === "number" ? 1 : frameTime.length;

            bufferCtx_FPS.clearRect(0, 0, w * RENDERED_SCALE, h * RENDERED_SCALE);

            // Adds the translucent background to the graph when it is first rendered.
            if (graphFrameTimeValues.length === 1 && w > 3) {
                // bufferCtx_FPS.setTransform(1, 0, 0, 1, 0, 0);
                ctx_FPS.clearRect(0, 0, w * RENDERED_SCALE, h * RENDERED_SCALE); // Clear canvas to remove the data from the last time the page was loaded.
                bufferCtx_FPS.fillStyle = "#ffffff24";
                bufferCtx_FPS.fillRect(1 * RENDERED_SCALE, (h - 60) * RENDERED_SCALE, (w - 2) * RENDERED_SCALE, 60 * RENDERED_SCALE);
                // bufferCtx_FPS.scale(RENDERED_SCALE, RENDERED_SCALE);
            } else {
                bufferCtx_FPS.drawImage(canvas_FPS, 0, 0, w * RENDERED_SCALE, h * RENDERED_SCALE, 0, 0, w * RENDERED_SCALE, h * RENDERED_SCALE);
            }

            ctx_FPS.clearRect(1 * RENDERED_SCALE, 0, (w - 2 - newBarCount) * RENDERED_SCALE, h * RENDERED_SCALE);
            ctx_FPS.drawImage(
                bufferCanvas_FPS,
                (1 + newBarCount) * RENDERED_SCALE,
                0,
                (w - 2 - newBarCount) * RENDERED_SCALE,
                h * RENDERED_SCALE,
                1 * RENDERED_SCALE,
                0,
                (w - 2 - newBarCount) * RENDERED_SCALE,
                h * RENDERED_SCALE
            );
            ctx_FPS.scale(RENDERED_SCALE, RENDERED_SCALE);
            ctx_FPS.clearRect(w - 1 - newBarCount, 0, newBarCount, h);

            ctx_FPS.fillStyle = "#ffffff24";
            ctx_FPS.fillRect(w - 1 - newBarCount, h - 60, newBarCount, 60);

            frameTime = typeof frameTime === "number" ? [frameTime] : frameTime;
            for (let i = 0; i < frameTime.length; i++) {
                const frameTimeValue: number | undefined = frameTime[i];
                if (typeof frameTimeValue !== "number") continue;
                // const barHeight = Math.floor(frametime * graphScale); // Floored version that is identical to Java Edition.
                const barHeight: number = frameTimeValue * FPS_GRAPH_SCALE;
                ctx_FPS.fillStyle = getFpsColor(frameTimeValue);
                ctx_FPS.fillRect(w - 1 - frameTime.length + i, h - barHeight, 1, barHeight);
            }

            ctx_FPS_overlay.clearRect(0, 0, w, h);

            // ctx_FPS_overlay.strokeStyle = "#888";
            ctx_FPS_overlay.strokeStyle = "#fff";
            ctx_FPS_overlay.beginPath();
            ctx_FPS_overlay.moveTo(0, hO - 0.5);
            ctx_FPS_overlay.lineTo(w, hO - 0.5);
            ctx_FPS_overlay.moveTo(0, h - 29.5 /* (1000 / 60 / maxMs) * h */);
            ctx_FPS_overlay.lineTo(w, h - 29.5 /* (1000 / 60 / maxMs) * h */);
            ctx_FPS_overlay.moveTo(0, h - 59.5 /* (1000 / 30 / maxMs) * h */);
            ctx_FPS_overlay.lineTo(w, h - 59.5 /* (1000 / 30 / maxMs) * h */);
            ctx_FPS_overlay.moveTo(0.5, h - 60);
            ctx_FPS_overlay.lineTo(0.5, hO);
            ctx_FPS_overlay.moveTo(w - 0.5, h - 60);
            ctx_FPS_overlay.lineTo(w - 0.5, hO);
            ctx_FPS_overlay.stroke();

            if (Number.isFinite(maxFrameRate)) {
                ctx_FPS_overlay.strokeStyle = "#0ff";
                const barPosition: number = (1000 / maxFrameRate) * FPS_GRAPH_SCALE;
                ctx_FPS_overlay.beginPath();
                ctx_FPS_overlay.moveTo(0, h - barPosition + 0.5);
                ctx_FPS_overlay.lineTo(w, h - barPosition + 0.5);
                ctx_FPS_overlay.stroke();
            }

            const minFrameTimeValue: number = Math.min(...graphFrameTimeValues);
            const avgFrameTimeValue: number = graphFrameTimeValues.reduce((a: number, b: number): number => a + b, 0) / graphFrameTimeValues.length;
            const maxFrameTimeValue: number = Math.max(...graphFrameTimeValues);

            // ---- Text Drawing ----

            // Clear scaling.
            ctx_FPS.setTransform(1, 0, 0, 1, 0, 0);
            ctx_FPS_overlay.setTransform(1, 0, 0, 1, 0, 0);

            ctx_FPS_overlay.font = `${8 * RENDERED_SCALE}px "Minecraft Seven v4"`;
            ctx_FPS_overlay.textBaseline = "top";
            const statText_FPS = `FPS: ${fps.toFixed(1).padStart(6, " ")}`;
            const statText_FT = `FT: ${currentFrameTime.toFixed(1)} ms`;
            // Draw text shadow.
            ctx_FPS_overlay.fillStyle = "#373737";
            ctx_FPS_overlay.fillText(statText_FPS, 3 * RENDERED_SCALE, (h - 96) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText(statText_FT, 3 * RENDERED_SCALE, (h - 86) * RENDERED_SCALE);
            // Draw text.
            ctx_FPS_overlay.fillStyle = "#fff";
            ctx_FPS_overlay.fillText(statText_FPS, 2 * RENDERED_SCALE, (h - 97) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText(statText_FT, 2 * RENDERED_SCALE, (h - 87) * RENDERED_SCALE);

            ctx_FPS_overlay.fillStyle = "#ffffff13";
            ctx_FPS_overlay.fillRect(
                1 * RENDERED_SCALE,
                (h - 29) * RENDERED_SCALE,
                ctx_FPS_overlay.measureText("60 FPS").width + 2 * RENDERED_SCALE,
                9 * RENDERED_SCALE
            );
            ctx_FPS_overlay.fillRect(
                1 * RENDERED_SCALE,
                (h - 59) * RENDERED_SCALE,
                ctx_FPS_overlay.measureText("30 FPS").width + 2 * RENDERED_SCALE,
                9 * RENDERED_SCALE
            );
            ctx_FPS_overlay.fillStyle = "#fff";
            ctx_FPS_overlay.fillText("60 FPS", 2 * RENDERED_SCALE, (h - 26) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText("30 FPS", 2 * RENDERED_SCALE, (h - 56) * RENDERED_SCALE);

            const minMSText = `${minFrameTimeValue.toFixed(1)} ms min`;
            const avgMSText = `${avgFrameTimeValue.toFixed(1)} ms avg`;
            const maxMSText = `${maxFrameTimeValue.toFixed(1)} ms max`;
            const avgMSSize: number = ctx_FPS_overlay.measureText(avgMSText).width / RENDERED_SCALE + 1;
            const maxMSSize: number = ctx_FPS_overlay.measureText(maxMSText).width / RENDERED_SCALE + 1;
            const minFPSText = `${(1000 / maxFrameTimeValue).toFixed(1)} FPS min`;
            const avgFPSText = `${(1000 / avgFrameTimeValue).toFixed(1)} FPS avg`;
            const maxFPSText = `${(1000 / minFrameTimeValue).toFixed(1)} FPS max`;
            const avgFPSSize: number = ctx_FPS_overlay.measureText(avgFPSText).width / RENDERED_SCALE + 1;
            const maxFPSSize: number = ctx_FPS_overlay.measureText(maxFPSText).width / RENDERED_SCALE + 1;
            // Draw text shadow.
            ctx_FPS_overlay.fillStyle = "#373737";
            ctx_FPS_overlay.fillText(minMSText, 3 * RENDERED_SCALE, (h - 66) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText(avgMSText, (Math.floor((w - avgMSSize) / 2) + 1) * RENDERED_SCALE, (h - 66) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText(maxMSText, (w - maxMSSize) * RENDERED_SCALE, (h - 66) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText(minFPSText, 3 * RENDERED_SCALE, (h - 76) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText(avgFPSText, (Math.floor((w - avgFPSSize) / 2) + 1) * RENDERED_SCALE, (h - 76) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText(maxFPSText, (w - maxFPSSize) * RENDERED_SCALE, (h - 76) * RENDERED_SCALE);
            // Draw text.
            ctx_FPS_overlay.fillStyle = "#fff";
            ctx_FPS_overlay.fillText(minMSText, 2 * RENDERED_SCALE, (h - 67) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText(avgMSText, Math.floor((w - avgMSSize) / 2) * RENDERED_SCALE, (h - 67) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText(maxMSText, (w - 1 - maxMSSize) * RENDERED_SCALE, (h - 67) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText(minFPSText, 2 * RENDERED_SCALE, (h - 77) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText(avgFPSText, Math.floor((w - avgFPSSize) / 2) * RENDERED_SCALE, (h - 77) * RENDERED_SCALE);
            ctx_FPS_overlay.fillText(maxFPSText, (w - 1 - maxFPSSize) * RENDERED_SCALE, (h - 77) * RENDERED_SCALE);
        };

        const graphEllValues: number[] = [];

        const getEllColor = function getEllColor(ms: number): string {
            const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));
            const t = clamp(ms / 50, 0, 1);

            let r: number, g: number;

            if (t < 0.3) {
                // Green to Yellow
                r = (t / 0.3) * 255;
                g = 255;
            } else {
                // Yellow to Red
                r = 255;
                g = 255 - ((t - 0.3) / 0.7) * 255;
            }

            return `rgb(${Math.round(r)},${Math.round(g)},0)`;
        };

        const ellGraphDrawQueue: number[] = [];

        /**
         * 1 ms on the ELL graph is this many pixels.
         */
        const ELL_GRAPH_SCALE = 1;

        /**
         * The list of times to use to determine the positions to put the bars at in the ELL graph.
         *
         * Should be in descending order for optimal performance.
         */
        const ELL_GRAPH_HORIZONTAL_BAR_TIMES: readonly number[] = Object.freeze([15, 6, 2].map((v: number): number => Math.round(v * ELL_GRAPH_SCALE)));

        const drawEllGraph = function drawEllGraph(ell: number | readonly number[], bypassChangeScaleWait = false): void {
            if (ell instanceof Array && ell.length === 0) return;
            if (!bypassChangeScaleWait && changingPerfGraphScale) {
                return void ellGraphDrawQueue.push(...(typeof ell === "number" ? [ell] : ell));
            }
            const RENDERED_SCALE: number = perfGraphScale;
            const w: number = canvas_ELL.width / RENDERED_SCALE;
            const h: number = canvas_ELL.height / RENDERED_SCALE;
            // const wO = canvas_ELL_overlay.width / RENDERED_SCALE;
            const hO: number = canvas_ELL_overlay.height / RENDERED_SCALE;
            if (!bypassChangeScaleWait) {
                if (ellGraphDrawQueue.length > 0) {
                    ell = [...ellGraphDrawQueue, ...(typeof ell === "number" ? [ell] : ell)];
                    ellGraphDrawQueue.length = 0;
                    graphEllValues.push(...ell);
                    graphEllValues.splice(0, Math.max(0, graphEllValues.length - (w - 2)));
                } else {
                    graphEllValues.push(...(typeof ell === "number" ? [ell] : ell));
                    graphEllValues.splice(0, Math.max(0, graphEllValues.length - (w - 2)));
                }
            }
            if (ell instanceof Array && ell.length > w - 2) ell = ell.slice(-w + 2);
            if (bufferCanvas_ELL.width !== canvas_ELL.width || bufferCanvas_ELL.height !== canvas_ELL.height) {
                bufferCtx_ELL.clearRect(0, 0, bufferCanvas_ELL.width, bufferCanvas_ELL.height);
                bufferCanvas_ELL = document.createElement("canvas");
                bufferCanvas_ELL.width = canvas_ELL.width;
                bufferCanvas_ELL.height = canvas_ELL.height;
                bufferCtx_ELL = bufferCanvas_ELL.getContext("2d");
            }
            ctx_ELL.setTransform(1, 0, 0, 1, 0, 0);
            ctx_ELL_overlay.setTransform(1, 0, 0, 1, 0, 0);
            ctx_ELL_overlay.scale(RENDERED_SCALE, RENDERED_SCALE);

            const newBarCount: number = typeof ell === "number" ? 1 : ell.length;

            bufferCtx_ELL.clearRect(0, 0, w * RENDERED_SCALE, h * RENDERED_SCALE);

            // Adds the translucent background to the graph when it is first rendered.
            if (graphEllValues.length === 1 && w > 3) {
                ctx_ELL.clearRect(0, 0, w * RENDERED_SCALE, h * RENDERED_SCALE); // Clear canvas to remove the data from the last time the page was loaded.
                bufferCtx_ELL.fillStyle = "#ffffff24";
                bufferCtx_ELL.fillRect(1 * RENDERED_SCALE, (h - 60) * RENDERED_SCALE, (w - 2) * RENDERED_SCALE, 60 * RENDERED_SCALE);

                // Draw the horizontal background bars.
                bufferCtx_ELL.scale(RENDERED_SCALE, RENDERED_SCALE);
                bufferCtx_ELL.strokeStyle = "#444";
                bufferCtx_ELL.beginPath();
                for (const barPosition of ELL_GRAPH_HORIZONTAL_BAR_TIMES) {
                    bufferCtx_ELL.moveTo(0, h - barPosition + 0.5);
                    bufferCtx_ELL.lineTo(w, h - barPosition + 0.5);
                }
                bufferCtx_ELL.stroke();
                bufferCtx_ELL.setTransform(1, 0, 0, 1, 0, 0);
            } else {
                bufferCtx_ELL.drawImage(canvas_ELL, 0, 0, w * RENDERED_SCALE, h * RENDERED_SCALE, 0, 0, w * RENDERED_SCALE, h * RENDERED_SCALE);
            }

            ctx_ELL.clearRect(1 * RENDERED_SCALE, 0, (w - 2 - newBarCount) * RENDERED_SCALE, h * RENDERED_SCALE);
            ctx_ELL.drawImage(
                bufferCanvas_ELL,
                (1 + newBarCount) * RENDERED_SCALE,
                0,
                (w - 2 - newBarCount) * RENDERED_SCALE,
                h * RENDERED_SCALE,
                1 * RENDERED_SCALE,
                0,
                (w - 2 - newBarCount) * RENDERED_SCALE,
                h * RENDERED_SCALE
            );
            ctx_ELL.scale(RENDERED_SCALE, RENDERED_SCALE);
            ctx_ELL.clearRect(w - 1 - newBarCount, 0, newBarCount, h);

            // Adds the translucent background to the graph.
            ctx_ELL.fillStyle = "#ffffff24";
            ctx_ELL.fillRect(w - 1 - newBarCount, h - 60, newBarCount, 60);

            ell = typeof ell === "number" ? [ell] : ell;
            for (let i = 0; i < ell.length; i++) {
                const ellValue: number | undefined = ell[i];
                if (typeof ellValue !== "number") continue;
                // const barHeight = Math.floor(ell * graphScale); // Floored version that is identical to Java Edition.
                const barHeight: number = ellValue * ELL_GRAPH_SCALE;

                // Draw the horizontal background bars.
                ctx_ELL.fillStyle = "#444";
                for (const barPosition of ELL_GRAPH_HORIZONTAL_BAR_TIMES) {
                    // Breaks the loop when the bar is not going to be drawn, only works when barPositions is in descending order.
                    if (barHeight >= barPosition) break;

                    ctx_ELL.fillRect(w - 1 - ell.length + i, h - barPosition, 1, 1);
                }

                // Draw the ELL bar.
                ctx_ELL.fillStyle = getEllColor(ellValue);
                ctx_ELL.fillRect(w - 1 - ell.length + i, h - barHeight, 1, barHeight);
            }

            ctx_ELL_overlay.clearRect(0, 0, w, h);

            ctx_ELL_overlay.strokeStyle = "#fff";
            ctx_ELL_overlay.beginPath();
            ctx_ELL_overlay.moveTo(0, hO - 0.5);
            ctx_ELL_overlay.lineTo(w, hO - 0.5);
            // ctx_ELL_overlay.moveTo(0, h - 29.5 /* (1000 / 60 / maxMs) * h */);
            // ctx_ELL_overlay.lineTo(w, h - 29.5 /* (1000 / 60 / maxMs) * h */);
            ctx_ELL_overlay.moveTo(0, h - 59.5 /* (1000 / 30 / maxMs) * h */);
            ctx_ELL_overlay.lineTo(w, h - 59.5 /* (1000 / 30 / maxMs) * h */);
            ctx_ELL_overlay.moveTo(0.5, h - 60);
            ctx_ELL_overlay.lineTo(0.5, hO);
            ctx_ELL_overlay.moveTo(w - 0.5, h - 60);
            ctx_ELL_overlay.lineTo(w - 0.5, hO);
            ctx_ELL_overlay.stroke();

            // ---- Text Drawing ----

            // Clear scaling.
            ctx_ELL.setTransform(1, 0, 0, 1, 0, 0);
            ctx_ELL_overlay.setTransform(1, 0, 0, 1, 0, 0);

            ctx_ELL_overlay.font = `${8 * RENDERED_SCALE}px "Minecraft Seven v4"`;
            ctx_ELL_overlay.textBaseline = "top";

            const ellClassificaitonCounts: Record<"excellent" | "good" | "stressed" | "critical", number> = {
                excellent: 0,
                good: 0,
                stressed: 0,
                critical: 0,
            };
            for (const ellValue of graphEllValues) {
                if (ellValue < 2) ellClassificaitonCounts.excellent++;
                else if (ellValue < 6) ellClassificaitonCounts.good++;
                else if (ellValue < 15) ellClassificaitonCounts.stressed++;
                else ellClassificaitonCounts.critical++;
            }

            const statText_ELL = `ELL: ${ell.at(-1)!.toFixed(1)} ms`;
            const statText_excellent = `Excellent: ${ellClassificaitonCounts.excellent}`;
            const statText_good = `Good: ${ellClassificaitonCounts.good}`;
            const statText_stressed = `Stressed: ${ellClassificaitonCounts.stressed}`;
            const statText_critical = `Critical: ${ellClassificaitonCounts.critical}`;
            // Draw text shadow.
            ctx_ELL_overlay.fillStyle = "#373737";
            ctx_ELL_overlay.fillText(statText_ELL, 3 * RENDERED_SCALE, (h - 116) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(statText_excellent, 3 * RENDERED_SCALE, (h - 106) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(statText_good, 3 * RENDERED_SCALE, (h - 96) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(statText_stressed, 3 * RENDERED_SCALE, (h - 86) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(statText_critical, 3 * RENDERED_SCALE, (h - 76) * RENDERED_SCALE);
            // Draw text.
            ctx_ELL_overlay.fillStyle = "#fff";
            ctx_ELL_overlay.fillText(statText_ELL, 2 * RENDERED_SCALE, (h - 117) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(statText_excellent, 2 * RENDERED_SCALE, (h - 107) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(statText_good, 2 * RENDERED_SCALE, (h - 97) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(statText_stressed, 2 * RENDERED_SCALE, (h - 87) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(statText_critical, 2 * RENDERED_SCALE, (h - 77) * RENDERED_SCALE);
            // ctx_ELL_overlay.fillText(`< 2: Excellent`, 4, 11);
            // ctx_ELL_overlay.fillText(`< 6:  Good`, 4, 20);
            // ctx_ELL_overlay.fillText(`< 15: Stressed`, 4, 29);
            // ctx_ELL_overlay.fillText(`>= 15: Critical`, 4, 38);

            ctx_ELL_overlay.fillStyle = "#ffffff13";
            ctx_ELL_overlay.fillRect(
                1 * RENDERED_SCALE,
                (h - 59) * RENDERED_SCALE,
                ctx_ELL_overlay.measureText("60 ms").width + 2 * RENDERED_SCALE,
                9 * RENDERED_SCALE
            );
            ctx_ELL_overlay.fillStyle = "#fff";
            ctx_ELL_overlay.fillText("60 ms", 2 * RENDERED_SCALE, (h - 56) * RENDERED_SCALE);

            const minMSText = `${Math.min(...graphEllValues).toFixed(1)} ms min`;
            const avgMSText = `${(graphEllValues.reduce((a: number, b: number): number => a + b, 0) / graphEllValues.length).toFixed(1)} ms avg`;
            const avgMSSize: number = ctx_ELL_overlay.measureText(avgMSText).width / RENDERED_SCALE + 1;
            const maxMSText = `${Math.max(...graphEllValues).toFixed(1)} ms max`;
            const maxMSSize: number = ctx_ELL_overlay.measureText(maxMSText).width / RENDERED_SCALE + 1;
            // Draw text shadow.
            ctx_ELL_overlay.fillStyle = "#373737";
            ctx_ELL_overlay.fillText(minMSText, 3 * RENDERED_SCALE, (h - 66) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(avgMSText, (Math.floor((w - avgMSSize) / 2) + 1) * RENDERED_SCALE, (h - 66) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(maxMSText, (w - maxMSSize) * RENDERED_SCALE, (h - 66) * RENDERED_SCALE);
            // Draw text.
            ctx_ELL_overlay.fillStyle = "#fff";
            ctx_ELL_overlay.fillText(minMSText, 2 * RENDERED_SCALE, (h - 67) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(avgMSText, Math.floor((w - avgMSSize) / 2) * RENDERED_SCALE, (h - 67) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(maxMSText, (w - 1 - maxMSSize) * RENDERED_SCALE, (h - 67) * RENDERED_SCALE);
        };

        const graphFcdValues: number[] = [];

        const getFcdColor = function getFcdColor(ms: number): string {
            const clamp = (v: number, min: number, max: number): number => Math.max(min, Math.min(max, v));
            const t = clamp(ms / 10, 0, 1);

            let r: number, g: number;

            if (t < 0.5) {
                // Green to Yellow
                r = (t / 0.5) * 255;
                g = 255;
            } else {
                // Yellow to Red
                r = 255;
                g = 255 - ((t - 0.5) / 0.7) * 255;
            }

            return `rgb(${Math.round(r)},${Math.round(g)},0)`;
        };

        const fcdGraphDrawQueue: number[] = [];

        /**
         * 1 ms on the FCD graph is this many pixels.
         */
        const FCD_GRAPH_SCALE = 6;

        /**
         * The list of times to use to determine the positions to put the bars at in the FCD graph.
         *
         * Should be in descending order for optimal performance.
         */
        const FCD_GRAPH_HORIZONTAL_BAR_TIMES: readonly number[] = Object.freeze([10, 5, 1.5].map((v: number): number => Math.round(v * FCD_GRAPH_SCALE)));

        const drawFcdGraph = function drawFcdGraph(fcd: number | readonly number[], bypassChangeScaleWait = false): void {
            if (fcd instanceof Array && fcd.length === 0) return;
            if (!bypassChangeScaleWait && changingPerfGraphScale) {
                return void fpsGraphDrawQueue.push(...(typeof fcd === "number" ? [fcd] : fcd));
            }
            const RENDERED_SCALE: number = perfGraphScale;
            const w: number = canvas_FCD.width / RENDERED_SCALE;
            const h: number = canvas_FCD.height / RENDERED_SCALE;
            // const wO: number = canvas_FCD_overlay.width / RENDERED_SCALE;
            const hO: number = canvas_FCD_overlay.height / RENDERED_SCALE;
            if (!bypassChangeScaleWait) {
                if (fcdGraphDrawQueue.length > 0) {
                    fcd = [...fcdGraphDrawQueue, ...(typeof fcd === "number" ? [fcd] : fcd)];
                    fcdGraphDrawQueue.length = 0;
                    graphFcdValues.push(...fcd);
                    graphFcdValues.splice(0, Math.max(0, graphFcdValues.length - (w - 2)));
                } else {
                    graphFcdValues.push(...(typeof fcd === "number" ? [fcd] : fcd));
                    graphFcdValues.splice(0, Math.max(0, graphFcdValues.length - (w - 2)));
                }
            }
            if (fcd instanceof Array && fcd.length > w - 2) fcd = fcd.slice(-w + 2);
            if (bufferCanvas_FCD.width !== canvas_FCD.width || bufferCanvas_FCD.height !== canvas_FCD.height) {
                bufferCtx_FCD.clearRect(0, 0, bufferCanvas_FCD.width, bufferCanvas_FCD.height);
                bufferCanvas_FCD = document.createElement("canvas");
                bufferCanvas_FCD.width = canvas_FCD.width;
                bufferCanvas_FCD.height = canvas_FCD.height;
                bufferCtx_FCD = bufferCanvas_FCD.getContext("2d");
            }
            ctx_FCD.setTransform(1, 0, 0, 1, 0, 0);
            ctx_FCD_overlay.setTransform(1, 0, 0, 1, 0, 0);
            ctx_FCD_overlay.scale(RENDERED_SCALE, RENDERED_SCALE);

            const newBarCount: number = typeof fcd === "number" ? 1 : fcd.length;

            bufferCtx_FCD.clearRect(0, 0, w * RENDERED_SCALE, h * RENDERED_SCALE);

            // Adds the translucent background to the graph when it is first rendered.
            if (graphFcdValues.length === 1 && w > 3) {
                ctx_FCD.clearRect(0, 0, w * RENDERED_SCALE, h * RENDERED_SCALE); // Clear canvas to remove the data from the last time the page was loaded.
                bufferCtx_FCD.fillStyle = "#ffffff24";
                bufferCtx_FCD.fillRect(1 * RENDERED_SCALE, (h - 60) * RENDERED_SCALE, (w - 2) * RENDERED_SCALE, 60 * RENDERED_SCALE);

                // Draw the horizontal background bars.
                bufferCtx_FCD.scale(RENDERED_SCALE, RENDERED_SCALE);
                bufferCtx_FCD.strokeStyle = "#444";
                bufferCtx_FCD.beginPath();
                for (const barPosition of FCD_GRAPH_HORIZONTAL_BAR_TIMES) {
                    bufferCtx_FCD.moveTo(0, h - barPosition + 0.5);
                    bufferCtx_FCD.lineTo(w, h - barPosition + 0.5);
                }
                bufferCtx_FCD.stroke();
                bufferCtx_FCD.setTransform(1, 0, 0, 1, 0, 0);
            } else {
                bufferCtx_FCD.drawImage(canvas_FCD, 0, 0, w * RENDERED_SCALE, h * RENDERED_SCALE, 0, 0, w * RENDERED_SCALE, h * RENDERED_SCALE);
            }

            ctx_FCD.clearRect(1 * RENDERED_SCALE, 0, (w - 2 - newBarCount) * RENDERED_SCALE, h * RENDERED_SCALE);
            ctx_FCD.drawImage(
                bufferCanvas_FCD,
                (1 + newBarCount) * RENDERED_SCALE,
                0,
                (w - 2 - newBarCount) * RENDERED_SCALE,
                h * RENDERED_SCALE,
                1 * RENDERED_SCALE,
                0,
                (w - 2 - newBarCount) * RENDERED_SCALE,
                h * RENDERED_SCALE
            );
            ctx_FCD.scale(RENDERED_SCALE, RENDERED_SCALE);
            ctx_FCD.clearRect(w - 1 - newBarCount, 0, newBarCount, h);

            // Adds the translucent background to the graph.
            ctx_FCD.fillStyle = "#ffffff24";
            ctx_FCD.fillRect(w - 1 - newBarCount, h - 60, newBarCount, 60);

            fcd = typeof fcd === "number" ? [fcd] : fcd;
            for (let i = 0; i < fcd.length; i++) {
                const fcdValue: number | undefined = fcd[i];
                if (typeof fcdValue !== "number") continue;
                // const barHeight = Math.floor(fcd * graphScale); // Floored version that is identical to Java Edition.
                const barHeight: number = fcdValue * FCD_GRAPH_SCALE;

                // Draw the horizontal background bars.
                ctx_FCD.fillStyle = "#444";
                for (const barPosition of FCD_GRAPH_HORIZONTAL_BAR_TIMES) {
                    // Breaks the loop when the bar is not going to be drawn, only works when barPositions is in descending order.
                    if (barHeight >= barPosition) break;

                    ctx_FCD.fillRect(w - 1 - fcd.length + i, h - barPosition, 1, 1);
                }

                // Draw the FCD bar.
                ctx_FCD.fillStyle = getFcdColor(fcdValue);
                ctx_FCD.fillRect(w - 1 - fcd.length + i, h - barHeight, 1, barHeight);
            }

            ctx_FCD_overlay.clearRect(0, 0, w, h);

            // ctx_FCD_overlay.strokeStyle = "#fff";
            // ctx_FCD_overlay.beginPath();
            // ctx_FCD_overlay.moveTo(0, h - (1000 / 60 / maxMs) * h);
            // ctx_FCD_overlay.lineTo(w, h - (1000 / 60 / maxMs) * h);
            // ctx_FCD_overlay.moveTo(0, h - (1000 / 30 / maxMs) * h);
            // ctx_FCD_overlay.lineTo(w, h - (1000 / 30 / maxMs) * h);
            // ctx_FCD_overlay.stroke();

            ctx_FCD_overlay.strokeStyle = "#fff";
            ctx_FCD_overlay.beginPath();
            ctx_FCD_overlay.moveTo(0, hO - 0.5);
            ctx_FCD_overlay.lineTo(w, hO - 0.5);
            // ctx_FCD_overlay.moveTo(0, h - 29.5 /* (1000 / 60 / maxMs) * h */);
            // ctx_FCD_overlay.lineTo(w, h - 29.5 /* (1000 / 60 / maxMs) * h */);
            ctx_FCD_overlay.moveTo(0, h - 59.5 /* (1000 / 30 / maxMs) * h */);
            ctx_FCD_overlay.lineTo(w, h - 59.5 /* (1000 / 30 / maxMs) * h */);
            ctx_FCD_overlay.moveTo(0.5, h - 60);
            ctx_FCD_overlay.lineTo(0.5, hO);
            ctx_FCD_overlay.moveTo(w - 0.5, h - 60);
            ctx_FCD_overlay.lineTo(w - 0.5, hO);
            ctx_FCD_overlay.stroke();

            // ---- Text Drawing ----

            // Clear scaling.
            ctx_FCD.setTransform(1, 0, 0, 1, 0, 0);
            ctx_FCD_overlay.setTransform(1, 0, 0, 1, 0, 0);

            ctx_FCD_overlay.font = `${8 * RENDERED_SCALE}px "Minecraft Seven v4"`;
            ctx_FCD_overlay.textBaseline = "top";

            const fcdClassificaitonCounts: Record<"excellent" | "good" | "stressed" | "critical", number> = {
                excellent: 0,
                good: 0,
                stressed: 0,
                critical: 0,
            };
            for (const fcdValue of graphFcdValues) {
                if (fcdValue <= 0.3) fcdClassificaitonCounts.excellent++;
                else if (fcdValue <= 1) fcdClassificaitonCounts.good++;
                else if (fcdValue <= 3) fcdClassificaitonCounts.stressed++;
                else fcdClassificaitonCounts.critical++;
            }

            const statText_FCD = `FCD: ${fcd.at(-1)!.toFixed(1)} ms`;
            const statText_excellent = `Excellent: ${fcdClassificaitonCounts.excellent}`;
            const statText_good = `Good: ${fcdClassificaitonCounts.good}`;
            const statText_stressed = `Stressed: ${fcdClassificaitonCounts.stressed}`;
            const statText_critical = `Critical: ${fcdClassificaitonCounts.critical}`;
            // Draw text shadow.
            ctx_FCD_overlay.fillStyle = "#373737";
            ctx_FCD_overlay.fillText(statText_FCD, 3 * RENDERED_SCALE, (h - 116) * RENDERED_SCALE);
            ctx_FCD_overlay.fillText(statText_excellent, 3 * RENDERED_SCALE, (h - 106) * RENDERED_SCALE);
            ctx_FCD_overlay.fillText(statText_good, 3 * RENDERED_SCALE, (h - 96) * RENDERED_SCALE);
            ctx_FCD_overlay.fillText(statText_stressed, 3 * RENDERED_SCALE, (h - 86) * RENDERED_SCALE);
            ctx_FCD_overlay.fillText(statText_critical, 3 * RENDERED_SCALE, (h - 76) * RENDERED_SCALE);
            // Draw text.
            ctx_FCD_overlay.fillStyle = "#fff";
            ctx_FCD_overlay.fillText(statText_FCD, 2 * RENDERED_SCALE, (h - 117) * RENDERED_SCALE);
            ctx_FCD_overlay.fillText(statText_excellent, 2 * RENDERED_SCALE, (h - 107) * RENDERED_SCALE);
            ctx_FCD_overlay.fillText(statText_good, 2 * RENDERED_SCALE, (h - 97) * RENDERED_SCALE);
            ctx_FCD_overlay.fillText(statText_stressed, 2 * RENDERED_SCALE, (h - 87) * RENDERED_SCALE);
            ctx_FCD_overlay.fillText(statText_critical, 2 * RENDERED_SCALE, (h - 77) * RENDERED_SCALE);

            // Draw graph bar labels.
            ctx_FCD_overlay.fillStyle = "#ffffff13";
            ctx_FCD_overlay.fillRect(
                1 * RENDERED_SCALE,
                (h - 59) * RENDERED_SCALE,
                ctx_FCD_overlay.measureText("10 ms").width + 2 * RENDERED_SCALE,
                9 * RENDERED_SCALE
            );
            ctx_FCD_overlay.fillStyle = "#fff";
            ctx_FCD_overlay.fillText("10 ms", 2 * RENDERED_SCALE, (h - 56) * RENDERED_SCALE);

            const minMSText = `${Math.min(...graphFcdValues).toFixed(1)} ms min`;
            const avgMSText = `${(graphFcdValues.reduce((a: number, b: number): number => a + b, 0) / graphFcdValues.length).toFixed(1)} ms avg`;
            const avgMSSize: number = ctx_FCD_overlay.measureText(avgMSText).width / RENDERED_SCALE + 1;
            const maxMSText = `${Math.max(...graphFcdValues).toFixed(1)} ms max`;
            const maxMSSize: number = ctx_FCD_overlay.measureText(maxMSText).width / RENDERED_SCALE + 1;
            // Draw text shadow.
            ctx_ELL_overlay.fillStyle = "#373737";
            ctx_ELL_overlay.fillText(minMSText, 3 * RENDERED_SCALE, (h - 66) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(avgMSText, (Math.floor((w - avgMSSize) / 2) + 1) * RENDERED_SCALE, (h - 66) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(maxMSText, (w - maxMSSize) * RENDERED_SCALE, (h - 66) * RENDERED_SCALE);
            // Draw text.
            ctx_ELL_overlay.fillStyle = "#fff";
            ctx_ELL_overlay.fillText(minMSText, 2 * RENDERED_SCALE, (h - 67) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(avgMSText, Math.floor((w - avgMSSize) / 2) * RENDERED_SCALE, (h - 67) * RENDERED_SCALE);
            ctx_ELL_overlay.fillText(maxMSText, (w - 1 - maxMSSize) * RENDERED_SCALE, (h - 67) * RENDERED_SCALE);
        };

        const lagSimulator = function lagSimulator(delay: number, interval: number | "frame"): void {
            function loop(): void {
                const t: number = performance.now();
                while (t + delay > performance.now());
                if (interval === "frame") requestAnimationFrame(loop);
                else setTimeout(loop, interval);
            }
            if (interval === "frame") requestAnimationFrame(loop);
            else setTimeout(loop, interval);
        };
        void lagSimulator;
        const handleFpsGraphTick = function handleFpsGraphTick(frameTime: number): void {
            if (canvas_FPS_container?.style.display !== "none") return void drawFpsGraph(frameTime);

            const w: number = +(canvas_FPS.getAttribute("data-base-width") ?? canvas_FPS.width / perfGraphScale);

            fpsGraphDrawQueue.push(frameTime);
            fpsGraphDrawQueue.splice(0, Math.max(0, fpsGraphDrawQueue.length - (w - 2)));
        };
        const handleEllGraphTick = function handleFpsGraphTick(ell: number): void {
            if (canvas_ELL_container?.style.display !== "none") return void drawEllGraph(ell);

            const w: number = +(canvas_ELL.getAttribute("data-base-width") ?? canvas_ELL.width / perfGraphScale);

            ellGraphDrawQueue.push(ell);
            ellGraphDrawQueue.splice(0, Math.max(0, ellGraphDrawQueue.length - (w - 2)));
        };
        const handleFcdGraphTick = function handleFcdGraphTick(fcd: number): void {
            if (canvas_FCD_container?.style.display !== "none") return void drawFcdGraph(fcd);

            const w: number = +(canvas_FCD.getAttribute("data-base-width") ?? canvas_FCD.width / perfGraphScale);

            fcdGraphDrawQueue.push(fcd);
            fcdGraphDrawQueue.splice(0, Math.max(0, fcdGraphDrawQueue.length - (w - 2)));
        };
        startFCDMonitor(handleFcdGraphTick);
        startFPSMonitor(handleFpsGraphTick);
        // queueMicrotask(() =>
        //     startJsLagMonitor(
        //         1 /* (): number => (Number.isFinite(maxFrameRate) ? Math.ceil(1000 / maxFrameRate) : Math.ceil(1000 / 60)) */,
        //         (ell: number): void => void ellGraphDrawQueue.push(ell)
        //     )
        // );
        // requestAnimationFrame(() =>
        startJsLagMonitor(1 /* (): number => (Number.isFinite(maxFrameRate) ? Math.ceil(1000 / maxFrameRate) : Math.ceil(1000 / 60)) */, handleEllGraphTick);
        // );
        // lagSimulator(10, "frame");

        canvas_FPS.addEventListener("rerenderCanvas", (): void => void drawFpsGraph([...graphFrameTimeValues], true));
        canvas_ELL.addEventListener("rerenderCanvas", (): void => void drawEllGraph([...graphEllValues], true));
        canvas_FCD.addEventListener("rerenderCanvas", (): void => void drawFcdGraph([...graphFcdValues], true));
    }
    //#endregion
    document.querySelectorAll(".addScrollbar").forEach(addScrollbarToHTMLElement);
})();

const __OUIC_customOverlays_initSyncEndPerf__: number = performance.now();
const __OUIC_customOverlays_initSyncEndMs__: number = Date.now();
