import type {} from "ore-ui-types";
import type {} from "@ore-ui-types/enums";

declare global {
    namespace globalThis {
        /**
         * Mutates the type by removing the `readonly` modifier from all properties.
         *
         * @template T The type to mutate.
         *
         * @example
         * ```ts
         * type Original = { readonly name: string; readonly age: number };
         * type Mutated = Mutable<Original>; // { name: string; age: number }
         * ```
         */
        type Mutable<T> = {
            -readonly [P in keyof T]: T[P];
        };
        /**
         * Mutates the type by removing the `readonly` modifier and the optional modifier (`?`) from all properties.
         *
         * @template T The type to mutate.
         *
         * @example
         * ```ts
         * type Original = { readonly name?: string; readonly age?: number };
         * type Mutated = MutableRequired<Original>; // { name: string; age: number }
         * ```
         */
        type MutableRequired<T> = {
            -readonly [P in keyof T]-?: T[P];
        };
        /**
         * Mutates the type by adding the `readonly` modifier and the optional modifier (`?`) to all properties.
         *
         * @template T The type to mutate.
         *
         * @example
         * ```ts
         * type Original = { name?: string; age?: number };
         * type Mutated = ReadonlyPartial<Original>; // { readonly name?: string; readonly age?: number }
         * ```
         */
        type ReadonlyPartial<T> = {
            +readonly [P in keyof T]+?: T[P];
        };
        /**
         * Converts a union type to an intersection type.
         *
         * @template U The union type to convert.
         *
         * @example
         * ```ts
         * type Original = string | number;
         * type Mutated = UnionToIntersection<Original>; // string & number
         * ```
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never;
        // type test1a = [name: number, id: `ID:${number}`, hi: "text"];
        /**
         * Pushes a value to the front of a tuple type.
         *
         * @template TailT The tail of the tuple.
         * @template HeadT The head to push to the front.
         *
         * @example
         * ```ts
         * type Original = [number, string];
         * type Mutated = PushFront<Original, boolean>; // [boolean, number, string]
         * ```
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type PushFront<TailT extends any[], HeadT> = ((head: HeadT, ...tail: TailT) => void) extends (...arr: infer ArrT) => void ? ArrT : never;
        /* type NoRepetition<U extends string, ResultT extends any[] = []> = {
        [k in U]: PushFront<ResultT, k> | NoRepetition<Exclude<U, k>, PushFront<ResultT, k>>;
    }[U]; */
        /**
         * Creates a type that represents a string with no repeated characters.
         *
         * @template U The string to process.
         * @template ResultT The result type, defaulting to an empty array.
         *
         * @example
         * ```ts
         * type Original = NoRepetition<"abc">; // ["a", "b", "c"]
         * ```
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type NoRepetition<U extends string, ResultT extends any[] = []> =
            | ResultT
            | {
                  [k in U]: NoRepetition<Exclude<U, k>, [k, ...ResultT]>;
              }[U];
        // Source: https://www.totaltypescript.com/tips/create-autocomplete-helper-which-allows-for-arbitrary-values
        /**
         * Creates a type that allows for autocomplete suggestions on a string type, while not giving errors for other values.
         *
         * @template T A union type of string literals to add to the autocomplete.
         *
         * @example
         * ```ts
         * // Will allow autocomplete for "abc", "b", and "def", and will not throw errors for other string values.
         * type Original = LooseAutocomplete<"abc" | "b" | "def">; // "abc" | "b" | "def" | (Omit<string, "abc" | "b" | "def"> & string)
         * ```
         */
        type LooseAutocomplete<T extends string> = T | (Omit<string, T> & string);
        /**
         * Creates a type that allows for autocomplete suggestions on a custom type (can only be string, number, or symbol), while not giving errors for other values.
         *
         * @template U A union type that can contain string, number, and symbol, this will be the base type, anything not assignable to this WILL throw an error.
         * @template T A union type of string literals and number literals to add to the autocomplete, string literals are only allowed if {@link U} contains string, and number literals are only allowed if {@link U} contains number.
         *
         * @example
         * ```ts
         * // Will allow autocomplete for "abc", "b", and "def", and will not throw errors for other string values.
         * type Original = LooseAutocompleteB<string, "abc" | "b" | "def">; // "abc" | "b" | "def" | (Omit<string, "abc" | "b" | "def"> & string)
         *
         * // Will allow autocomplete for 1, 2, and 3, and will not throw errors for other number values.
         * type Original = LooseAutocompleteB<number, 1 | 2 | 3>; // 1 | 2 | 3 | (Omit<number, 1 | 2 | 3> & number)
         *
         * // Will allow autocomplete for 1, 2, and 3, and will not throw errors for other number or string values.
         * type Original = LooseAutocompleteB<number | string, 1 | 2 | 3>; // 1 | 2 | 3 | (Omit<number | string, 1 | 2 | 3> & (number | string))
         *
         * // Will allow autocomplete for "a", 45, and "fhsd", and will not throw errors for other number, symbol, or string values.
         * type Original = LooseAutocompleteB<string | number | symbol, "a" | 45 | "fhsd">; // "a" | 45 | "fhsd" | (Omit<string | number | symbol, "a" | 45 | "fhsd"> & (string | number | symbol))
         * ```
         */
        type LooseAutocompleteB<U extends string | number | symbol, T extends U> = T | (Omit<U, T> & U);
        /**
         * Splits a string into an array of characters.
         *
         * @template S The string to split.
         *
         * @example
         * ```ts
         * type Original = Split<"abc">; // ["a", "b", "c"]
         * ```
         */
        type Split<S extends string> =
            S extends "" ? []
            : S extends `${infer C}${infer R}` ? [C, ...Split<R>]
            : never;

        /**
         * Takes the first N elements from a tuple type.
         *
         * @template T The tuple type to take elements from.
         * @template N The number of elements to take.
         * @template Result The result type, defaulting to an empty array.
         *
         * @example
         * ```ts
         * type Original = TakeFirstNElements<[1, 2, 3, 4], 2>; // [1, 2]
         * ```
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type TakeFirstNElements<T extends any[], N extends number, Result extends any[] = []> =
            Result["length"] extends N ? Result
            : T extends [infer First, ...infer Rest] ? TakeFirstNElements<Rest, N, [...Result, First]>
            : Result;

        /**
         * @author 8Crafter
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type TakeLastNElements<T extends any[], N extends number, Result extends any[] = []> =
            Result["length"] extends N ? Result
            : T extends [...infer Rest, infer Last] ? TakeLastNElements<Rest, N, [Last, ...Result]>
            : Result;

        /**
         * @author 8Crafter
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type RemoveFirstNElements<T extends any[], N extends number, Removed extends any[] = [], Result extends any[] = []> =
            Removed["length"] extends N ? Result
            : T extends [infer First, ...infer Rest] ? RemoveFirstNElements<Rest, N, [...Removed, First], Rest>
            : Result;

        /**
         * @author 8Crafter
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type RemoveLastNElements<T extends any[], N extends number, Removed extends any[] = [], Result extends any[] = []> =
            Removed["length"] extends N ? Result
            : T extends [...infer Rest, infer Last] ? RemoveFirstNElements<Rest, N, [...Removed, Last], Rest>
            : Result;

        /**
         * @author 8Crafter
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type CreateTupleOfLength<T extends any, N extends number, Result extends any[] = []> =
            Result["length"] extends N ? Result : CreateTupleOfLength<T, N, [T, ...Result]>;

        /**
         * @author 8Crafter
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type SliceTuple<T extends any[], start extends number, end extends number> =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            RemoveFirstNElements<T, start> extends infer R extends any[] ?
                TakeFirstNElements<R, RemoveFirstNElements<TakeFirstNElements<T, end>, start>["length"]>
            :   never;

        /**
         * Joins an array of strings into a single string.
         *
         * @template T The array of strings to join.
         *
         * @example
         * ```ts
         * type Original = Join<["a", "bcc", "de"]>; // "abccde"
         * ```
         */
        type Join<T extends string[]> =
            T extends [] ? ""
            : T extends [infer Head, ...infer Tail] ?
                Head extends string ?
                    `${Head}${Join<Tail extends string[] ? Tail : []>}`
                :   never
            :   never;

        /**
         * Cuts the first N characters from a string.
         *
         * @template S The string to cut.
         * @template N The number of characters to cut.
         *
         * @example
         * ```ts
         * type Original = CutFirstChars<"abcdef", 2>; // "ab"
         * ```
         */
        type CutFirstChars<S extends string, N extends number, SArray = TakeFirstNElements<Split<S>, N>> = Join<SArray extends string[] ? SArray : never>;

        /**
         * Mutates the type by removing the optional modifier (`?`) from all properties.
         *
         * @template T The type to mutate.
         *
         * @example
         * ```ts
         * type Original = { readonly name?: string; age?: number };
         * type Mutated = MutableRequired<Original>; // { readonly name: string; age: number }
         * ```
         */
        type Full<T> = {
            [P in keyof T]-?: T[P];
        };

        /**
         * Mutates the type by making all properties `readonly`, recursively.
         *
         * @template T The type to mutate.
         *
         * @example
         * ```ts
         * type Original = { name: string; age: number }
         * type Mutated = ReadonlyDeep<Original>; // { readonly name: string; readonly age: number }
         * ```
         */
        type ReadonlyDeep<T> = {
            readonly [P in keyof T]: ReadonlyDeep<T[P]>;
        };

        /**
         * Mutates the type by removing the `readonly` modifier from all properties, recursively.
         *
         * @template T The type to mutate.
         *
         * @example
         * ```ts
         * type Original = { readonly name: string; readonly age: number };
         * type Mutated = MutableDeep<Original>; // { name: string; age: number }
         * ```
         */
        type MutableDeep<T> = {
            -readonly [P in keyof T]: MutableDeep<T[P]>;
        };

        /**
         * Mutates the type by making all properties optional and allowing for deep partials.
         *
         * @template T The type to mutate.
         *
         * @example
         * ```ts
         * type Original = { name: string; age: number }
         * type Mutated = DeepPartial<Original>; // { name?: string; age?: number }
         * ```
         */
        export type DeepPartial<T> =
            T extends object ?
                {
                    [P in keyof T]?: DeepPartial<T[P]>;
                }
            :   T;
        type KeysOfUnion<T> = T extends T ? keyof T : never;
        type ValueTypes<T> = T extends { [key: string]: infer U } ? U : never;
        type AllValues<T> = T extends { [key: string]: infer V } ? V : never;
        type KeyValuePairs<T> = {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [K in KeysOfUnion<T>]: AllValues<Extract<T, Record<K, any>>>;
        };
        /**
         * @see https://stackoverflow.com/a/58986589
         * @author jcalz <https://stackoverflow.com/users/2887218/jcalz>
         */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type ExcludeFromTuple<T extends readonly any[], E> =
            T extends [infer F, ...infer R] ?
                [F] extends [E] ?
                    ExcludeFromTuple<R, E>
                :   [F, ...ExcludeFromTuple<R, E>]
            :   [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type IncludeFromTuple<T extends readonly any[], E> =
            T extends [infer F, ...infer R] ?
                [F] extends [E] ?
                    [F, ...IncludeFromTuple<R, E>]
                :   IncludeFromTuple<R, E>
            :   [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type NullableArray<T extends any[] | readonly any[]> = T | [null, ...T] | [...T, null];
        /**
         * A type representing any function with a call signature.
         *
         * @template UseNeverArgs Whether to use `never` for the type of the rest and this arguments, necessary when using `MyFunctionType extends AnyCallableFunction`, to use it just pass `1` (ex. `MyFunctionType extends AnyCallableFunction<1>`).
         */
        type AnyCallableFunction<UseNeverArgs extends 0 | 1 = 0> = (
            this: UseNeverArgs extends 1 ? never : unknown,
            ...args: UseNeverArgs extends 1 ? never : unknown[]
        ) => unknown;
        /**
         * A type representing any function with a construct signature.
         *
         * @template UseNeverArgs Whether to use `never` for the type of the rest arguments, necessary when using `MyFunctionType extends AnyNewableFunction`, to use it just pass `1` (ex. `MyFunctionType extends AnyNewableFunction<1>`).
         */
        type AnyNewableFunction<UseNeverArgs extends 0 | 1 = 0> = new (...args: UseNeverArgs extends 1 ? never : unknown[]) => unknown;
        /**
         * A type representing any function with a construct signature and a call signature.
         *
         * @template UseNeverArgs Whether to use `never` for the type of the rest and this arguments, necessary when using `MyFunctionType extends AnyCallableNewableFunction`, to use it just pass `1` (ex. `MyFunctionType extends AnyCallableNewableFunction<1>`).
         */
        type AnyCallableNewableFunction<UseNeverArgs extends 0 | 1 = 0> = AnyCallableFunction<UseNeverArgs> & AnyNewableFunction<UseNeverArgs>;
        /**
         * A type representing any function with a call, a construct signature, or both.
         *
         * @template UseNeverArgs Whether to use `never` for the type of the rest and this arguments, necessary when using `MyFunctionType extends AnyFunction`, to use it just pass `1` (ex. `MyFunctionType extends AnyFunction<1>`).
         */
        type AnyFunction<UseNeverArgs extends 0 | 1 = 0> =
            | AnyCallableFunction<UseNeverArgs>
            | AnyNewableFunction<UseNeverArgs>
            | AnyCallableNewableFunction<UseNeverArgs>;

        /**
         * A function to be put into the react renderer to collect facet accessors.
         *
         * @param {{}} [param0] Ignore this.
         * @returns {null} Returns `null`.
         */
        /* eslint-disable-next-line */ // Stops eslint from throwing an error for the removed `@typescript-eslint/ban-types` rule, which is there for backwards compatibility.
        // eslint-disable-next-line no-empty-pattern, @typescript-eslint/ban-types, @typescript-eslint/no-empty-object-type
        function facetSpy({}: {}): null;
        /**
         * The context holder.
         *
         * @todo Get the type for this variable.
         */
        var contextHolder: unknown;
        /**
         * The facet access holder.
         *
         * @todo Get the type for this variable.
         */
        var facetAccessHolder: unknown;
        /**
         * The facet spy data.
         */
        var facetSpyData: {
            /**
             * The shared facets.
             *
             * This only includes facets that are in the {@link FacetList}.
             */
            sharedFacets: { [FacetType in FacetList[number]]: SharedFacet<FacetType> };
        };
        /**
         * The current list of facets that have been forcefully loaded.
         */
        var forceLoadedFacets: { [FacetType in FacetList[number]]?: true };
        /**
         * The list of accessed facets.
         *
         * This includes any new facets that are not in the {@link FacetList}.
         *
         * This only includes facets that have been accessed at least once.
         */
        var accessedFacets: Partial<
            { [FacetType in FacetList[number]]: (a?: unknown) => SharedFacet<FacetType> } & { [key in string]: (a?: unknown) => SharedFacetBase<key> }
        >;
        /**
         * A list of new facets that have been detected that are not in the {@link FacetList}.
         */
        var notedNewFacets: string[];
        /**
         * Forcefully loads a facet that is not loaded (meaning it is not accessible through the {@link getAccessibleFacetSpyFacets} function).
         *
         * @param facetName The name of the facet to load.
         * @param timeout The timeout in milliseconds to wait for the facet to load. If set to `0` or `Infinity`, it will never time out. Defaults to `5000ms`.
         * @returns A promise that resolves with the loaded facet's value, if the facet it already loaded it will resolve with its current value.
         *
         * @throws {ReferenceError} If the request times out (can happen if the facet doesn't exist).
         * @throws {any} If the facet request throws an error.
         */
        function forceLoadFacet<FacetType extends LooseAutocomplete<FacetList[number]>>(
            facetName: FacetType,
            timeout?: number
        ): Promise<FacetType extends FacetList[number] ? FacetTypeMap[FacetType] : unknown>;
        /**
         * Forcefully discards a facet.
         *
         * This will attempt to discard the facet even if it appears to not be loaded.
         *
         * @param facetName The name of the facet to unload.
         */
        function forceUnloadFacet(facetName: LooseAutocomplete<FacetList[number]>): void;
        /**
         * Unloads a facet that was forcefully loaded.
         *
         * This will attampt to unload the facet even if it appears to not be loaded, as long as it was originally loaded forcefully.
         *
         * @param facetName The name of the facet to unload.
         * @returns `true` if is was unloaded or `false` if the facet was not a forcefully loaded facet.
         */
        function unloadForceLoadedFacet(facetName: LooseAutocomplete<FacetList[number]>): boolean;
        /**
         * The list of currently loading facets.
         *
         * Only exists when the {@link forceLoadUnloadedFacets} function is run with the `enableLoadingFacetsTracking` option set to `true`.
         */
        var loadingFacets: { [FacetType in `${FacetList[number]}${bigint}`]?: true } | undefined;
        /**
         * Forcefully loads all facets that are not loaded (meaning they are not accessible through the {@link getAccessibleFacetSpyFacets} function).
         *
         * @param options Debugging options.
         * @returns An array of tuples containing the facet name and its data if it was successfully loaded or was already loaded, or the error that occured if it failed.
         */
        function forceLoadUnloadedFacets(
            options?:
                | {
                      /**
                       * Whether to log errors to the console.
                       *
                       * @default false
                       */
                      enableErrorLogging?: boolean | undefined;
                      /**
                       * Whether to log success to the console.
                       *
                       * @default false
                       */
                      enableSuccessLogging?: boolean | undefined;
                      /**
                       * Whether to log already loaded facets to the console.
                       *
                       * @default false
                       */
                      enableAlreadyLoadedLogging?: boolean | undefined;
                      /**
                       * Whether to track the loading of facets in a global {@link loadingFacets} variable.
                       *
                       * @default false
                       */
                      enableLoadingFacetsTracking?: boolean | undefined;
                  }
                // eslint-disable-next-line @typescript-eslint/no-duplicate-type-constituents -- This is for asthetic purposes.
                | undefined
        ): Promise<
            (
                | {
                      [key in FacetList[number]]: [facetName: key, facetData: FacetTypeMap[key], status: "success" | "alreadyLoaded", newFacetType: false];
                  }[FacetList[number]]
                | [facetName: LooseAutocomplete<FacetList[number]>, facetData: unknown, status: "success" | "alreadyLoaded", newFacetType: true]
                | [facetName: LooseAutocomplete<FacetList[number]>, error: unknown, status: "error"]
            )[]
        >;
        /**
         * Unloads all forcefully loaded facets.
         *
         * @returns A list of the unloaded facets and whether they were successfully unloaded.
         */
        function unloadForceLoadedFacets(): [facetName: LooseAutocomplete<FacetList[number]>, successfullyUnloaded: boolean][];
        /**
         * Returns a list of all accessible facets from the facetSpy data.
         *
         * It sources from both {@link facetSpyData.sharedFacets} and {@link accessedFacets}.
         *
         * If the facetSpy is not injected, this will not exist.
         *
         * @returns The accessible facets.
         *
         * @todo Maybe add a parameter for context for getting facets from accessedFacets.
         */
        function getAccessibleFacetSpyFacets_internal(): Partial<{ [FacetType in FacetList[number]]: FacetTypeMap[FacetType] }> & Record<string, unknown>;
        /**
         * Returns a list of all accessible facets from the facetSpy data (if available) and the FacetManager data.
         *
         * It sources from {@link facetSpyData.sharedFacets}, {@link accessedFacets}, and {@link FacetManager}.
         *
         * If the facetSpy data is not available, it sources from only {@link FacetManager}.
         *
         * If {@link FacetManager} is not available, this gets set to the getAccessibleFacetSpyFacets_internal function, and as a result it sources from only
         * {@link facetSpyData.sharedFacets} and {@link accessedFacets}.
         *
         * If neither are available, it throws an error.
         *
         * @returns The accessible facets.
         *
         * @throws {ReferenceError} If neither the facetSpy data nor the {@link FacetManager} are available.
         *
         * @todo Maybe add a parameter for context for getting facets from accessedFacets.
         */
        function getAccessibleFacetSpyFacets(): Partial<{ [FacetType in FacetList[number]]: FacetTypeMap[FacetType] }> & Record<string, unknown>;

        /**
         * @author 8Crafter
         */
        type MergeObjectTypes<T> = { [key in keyof T]: T[key] };
    }
}

export {};

//#vignore Debug Stuff
interface b {
    "core.animation": {
        screenAnimationEnabled: boolean;
    };
    "core.customScaling": {
        guiAccessibilityScaling: boolean;
        MAX_FIXED_GUI_SCALE_MODIFIER: number;
        MIN_FIXED_GUI_SCALE_MODIFIER: number;
        fixedGuiScaleModifier: number;
        scalingModeOverride: string;
    };
    "core.deviceInformation": {
        activeMultiplayerServiceIds: CoherentArrayProxy<number>;
        changeStorageTask: number;
        storageType: number;
        supportsSizeQuery: boolean;
        isStorageLow: boolean;
        isStorageFull: boolean;
        storageUsed: number;
        storageSize: number;
        storageAvailableSize: string;
        supportsManualAddedServers: boolean;
        onlyCellularAvailable: boolean;
        showCellularDataFee: boolean;
        isLANAllowed: boolean;
        isOnline: boolean;
        guiScaleBase: number;
        guiScaleModifier: number;
        displayHeight: number;
        displayWidth: number;
        pixelsPerMillimeter: number;
        isLowMemoryDevice: boolean;
        inputMethods: CoherentArrayProxy<number>;
        arvrPlatform: number;
        platform: number;
        changeStorage(...args: unknown[]): unknown;
    };
    "core.featureFlags": {
        flags: CoherentArrayProxy<string>;
    };
    "core.input": {
        keyboardType: number;
        enableControllerHints: boolean;
        currentInputType: number;
        swapXYButtons: boolean;
        swapABButtons: boolean;
    };
    "core.locale": {
        locale: string;
        formatDate(...args: unknown[]): unknown;
        getHowLongAgoAsString(...args: unknown[]): unknown;
        translate(...args: unknown[]): unknown;
        translateWithParameters(...args: unknown[]): unknown;
    };
    "core.router": {
        history: {
            list: CoherentArrayProxy<{ hash: string; search: string; pathname: string }>;
            location: { hash: string; search: string; pathname: string };
            action: string;
            length: number;
            push(...args: unknown[]): unknown;
            replace(...args: unknown[]): unknown;
            go(...args: unknown[]): unknown;
            goBack(...args: unknown[]): unknown;
            goForward(...args: unknown[]): unknown;
        };
    };
    "core.safeZone": {
        screenPositionY: number;
        screenPositionX: number;
        safeAreaY: number;
        safeAreaX: number;
    };
    "core.screenReader": {
        isIdle: boolean;
        isUITextToSpeechEnabled: boolean;
        isChatTextToSpeechEnabled: boolean;
        read(...args: unknown[]): unknown;
        clear(...args: unknown[]): unknown;
    };
    "core.splitScreen": {
        splitScreenDirection: number;
        numActivePlayers: number;
        splitScreenPosition: number;
        isPrimaryUser: boolean;
    };
    "core.sound": {
        play(...args: unknown[]): unknown;
        fadeOut(...args: unknown[]): unknown;
        isPlaying(...args: unknown[]): unknown;
    };
    "vanilla.achievements": {
        data: {
            achievements: CoherentArrayProxy<{
                suggestedOrder: number;
                rewardId: string;
                rewardRarity: number;
                rewardImage: string;
                rewardName: string;
                isRewardOwned: boolean;
                hasReward: boolean;
                image: string;
                progressTarget: number;
                progress: number;
                isSecret: boolean;
                isLocked: boolean;
                dateUnlocked: number;
                gamerScore: number;
                description: string;
                name: string;
                platformIndependentId: string;
                id: string;
            }>;
            maxGamerScore: number;
            currentGamerScore: number;
            maxAchievements: number;
            achievementsUnlocked: number;
        };
        status: number;
    };
    "vanilla.buildSettings": {
        currentGameVersion: {
            isBeta: boolean;
            revision: number;
            patch: number;
            minor: number;
            major: number;
        };
        isBetaBuild: boolean;
        isAnyBeta: boolean;
        isDevBuild: boolean;
    };
    "vanilla.clipboard": {
        isClipboardCopySupported: boolean;
        copyToClipboard(...args: unknown[]): unknown;
    };
    "vanilla.createNewWorld": {
        applyTemplateTaskState: number;
        consumeResetFlag: boolean;
        inWorldCreation: boolean;
        showedAchievementWarning: boolean;
        worldData: {
            achievementsPermanentlyDisabled: boolean;
            achievementsDisabled: boolean;
            isUsingTemplate: boolean;
            isLockedTemplate: boolean;
            betaFeatures: CoherentArrayProxy<{
                isEnabled: boolean;
                isTogglePermanentlyDisabled: boolean;
                category: number;
                description: string;
                title: string;
                id: string;
            }>;
            resourcePacks: { sharedPacksEnabled: boolean };
            cheats: {
                tickSpeed: string;
                educationEdition: boolean;
                commandBlocks: boolean;
                weather: boolean;
                entitiesDropLoot: boolean;
                mobGriefing: boolean;
                mobSpawning: boolean;
                keepInventory: boolean;
                daylightCycle: number;
                cheatsEnabled: boolean;
            };
            scriptingCoding: {
                consoleCommandsEnabled: boolean;
                codeBuilderEnabled: boolean;
            };
            multiplayer: {
                locatorBarEnabled: boolean;
                friendlyFire: boolean;
                visibleToLanPlayers: boolean;
                playerPermissions: number;
                playerAccess: number;
                generalWarningState: number;
                platformPlayerFriendsOfFriendsAccessSupported: boolean;
                platformPlayerInviteAccessSupported: boolean;
                platformPlayerAccessEnabled: boolean;
                platformPlayerAccessSupported: boolean;
                platformPlayerAccess: number;
                multiplayerGame: boolean;
                multiplayerSupported: boolean;
            };
            advanced: {
                flatWorldPreset: string;
                worldSeed: string;
                respawnRadius: string;
                immediateRespawn: boolean;
                sleepSkipNightPercent: number;
                sleepSkipNight: boolean;
                tileDrops: boolean;
                naturalRegeneration: boolean;
                mobLoot: boolean;
                respawnBlocksExplode: boolean;
                tntExplodes: boolean;
                recipesUnlock: boolean;
                firesSpreads: boolean;
                friendlyFire: boolean;
                showDaysPlayed: boolean;
                showCoordinates: boolean;
                bonusChest: boolean;
                startWithMap: boolean;
                simulationDistance: number;
                generatorType: number;
                useFlatWorld: boolean;
            };
            general: {
                difficulty: number;
                playerHasDied: boolean;
                isHardcore: boolean;
                gameMode: number;
                worldName: string;
            };
        };
        worldPreviewImagePath: string;
        createOnRealmsError: null;
        createWorldError: null;
        isCreatingWorld: boolean;
        isEditorWorld: boolean;
        isRandomSeedAllowed: boolean;
        checkDlcError: string;
        inputError: string;
        createWorld(...args: unknown[]): unknown;
        createOnRealms(...args: unknown[]): unknown;
        clearErrors(...args: unknown[]): unknown;
        applyTemplate(...args: unknown[]): unknown;
        selectRealmToCreateOn(...args: unknown[]): unknown;
        createWorldOnPreviewRealm(...args: unknown[]): unknown;
        unlockTemplateSettings(...args: unknown[]): unknown;
        checkIfUserHasChangedSettings(...args: unknown[]): unknown;
    };
    "vanilla.createPreviewRealmFacet": {
        createPreviewRealmFromSubscriptionResult: null;
        createPreviewRealmFromSubscriptionTaskState: number;
        createPreviewRealmFromSubscriptionId(...args: unknown[]): unknown;
        activateNewPreviewRealm(...args: unknown[]): unknown;
        reset(...args: unknown[]): unknown;
        getCreatedPreviewRealmId(...args: unknown[]): unknown;
    };
    "vanilla.debugSettings": {
        allBiomes: CoherentArrayProxy<{ dimension: number; id: number; label: string }>;
        isBiomeOverrideActive: boolean;
        biomeOverrideId: number;
        defaultSpawnBiome: boolean;
        spawnBiomeId: number;
        spawnDimensionId: number;
        gameVersionOverride: string;
        enableGameVersionOverride: boolean;
        flatNether: boolean;
    };
    "vanilla.editor": {
        canShowModeShortcutToast: boolean;
        editorMode: number;
        openPauseMenu(...args: unknown[]): unknown;
        shouldDisplayReloadModal(...args: unknown[]): unknown;
        resizeViewport(...args: unknown[]): unknown;
        onViewportFocusAreaResized(...args: unknown[]): unknown;
        openConsole(...args: unknown[]): unknown;
        navigateUri(...args: unknown[]): unknown;
        getCursorBlockName(...args: unknown[]): unknown;
    };
    "vanilla.editorLogging": {
        tagFilter: string;
        logLevelFilter: number;
        tagList: CoherentArrayProxy<unknown>;
        messageList: CoherentArrayProxy<unknown>;
        flush(...args: unknown[]): unknown;
    };
    "vanilla.editorScripting": {
        sendMessage(...args: unknown[]): unknown;
        dispatchDataStoreEvent(...args: unknown[]): unknown;
        reload(...args: unknown[]): unknown;
        attachDebugger(...args: unknown[]): unknown;
        addCleanupMessage(...args: unknown[]): unknown;
        getMouseRayCastActionPayload(...args: unknown[]): unknown;
    };
    "vanilla.editorSettings": {
        fontZoom: number;
        currentThemeId: string;
        themesMap: Record<string, never>;
        isEditorMode: boolean;
        selectedTool: string;
        selectedOperator: number;
        addNewTheme: "() => {}";
        updateThemeColor: "() => {}";
        deleteTheme: "() => {}";
        getKey: '() => ""';
        setKey: "() => {}";
        setKeys: "() => {}";
        hasKey: "() => !1";
    };
    "vanilla.externalServerWorldList": {
        addedServerId: number;
        externalServerWorlds: CoherentArrayProxy<{
            msgOfTheDay: string;
            image: string;
            capacity: number;
            playerCount: number;
            pingStatus: number;
            ping: string;
            description: string;
            name: string;
            id: string;
        }>;
        addExternalServerWorld(...args: unknown[]): unknown;
        editExternalServerWorld(...args: unknown[]): unknown;
        removeExternalServerWorld(...args: unknown[]): unknown;
    };
    "vanilla.followersList": {
        xboxAPICallResult: number;
        playerList: CoherentArrayProxy<{
            description: string;
            isFollowedByMe: boolean;
            isFollowingMe: boolean;
            isOnline: boolean;
            gamerIcon: string;
            gamertag: string;
            xuid: string;
        }>;
        isLoading: boolean;
    };
    "vanilla.friendsListFacet": {
        platformFriends: CoherentArrayProxy<unknown>;
        xblFriends: CoherentArrayProxy<{
            favoriteStatus: number;
            playingOnServerId: null;
            isCurrentlyPlaying: boolean;
            titleHistory: number;
            presenceMessage: string;
            isInSameGame: boolean;
            titleId: number;
            titleName: string;
            presence: number;
            gamerIcon: string;
            gamerTag: string;
            platformId: string;
            xuid: string;
        }>;
        platformLoadingState: number;
        xblLoadingState: number;
        userControlledUpdateGameList(...args: unknown[]): unknown;
    };
    "vanilla.gameplay.activeLevelHardcoreMode": {
        isHardcoreMode: null;
    };
    "vanilla.gameplay.bedtime": {
        canChangeSleepSettings: boolean;
        isAbleToSleep: boolean;
        remotePlayersCount: number;
        chatAvailability: number;
        isPlayerSleeping: boolean;
        requiredSleepingPlayerCount: number;
        sleepingPlayerCount: number;
        wakeUp(...args: unknown[]): unknown;
    };
    "vanilla.gameplay.containerBlockActorType": {
        blockActorType: number;
    };
    "vanilla.gameplay.furnace": {
        litProgress: number;
        burnProgress: number;
    };
    "vanilla.gameplay.immediateRespawn": {
        immediateRespawn: null;
    };
    "vanilla.gameplay.leaveGame": {
        leaveGame(...args: unknown[]): unknown;
        leaveGameThenJoinFriendsWorld(...args: unknown[]): unknown;
    };
    "vanilla.gameplay.playerDeathInfo": {
        deathInfo: string;
    };
    "vanilla.gameplay.playerRespawn": {
        isAlive: boolean;
        respawn(...args: unknown[]): unknown;
    };
    "vanilla.gamertagSearch": {
        xboxAPICallResult: number;
        searchResults: CoherentArrayProxy<unknown>;
        isLoading: boolean;
        search(...args: unknown[]): unknown;
    };
    "vanilla.inbox": {
        messagingServiceFailed: boolean;
        marketplacePassSubscriber: boolean;
        settings: {
            showOnlyFriendInvites: boolean;
            showMessageBadges: boolean;
            showInvitesBadges: boolean;
            toggleInvitesBadges(...args: unknown[]): unknown;
            toggleMessageBadges(...args: unknown[]): unknown;
            toggleOnlyFriendInvites(...args: unknown[]): unknown;
        };
        categoryData: CoherentArrayProxy<{
            imageUrl: string;
            unreadMessages: number;
            localizedName: string;
            categoryName: string;
        }>;
        realmsSubscriber: boolean;
        inboxMessages: CoherentArrayProxy<{
            style: number;
            gamedrop: null;
            items: CoherentArrayProxy<{
                button: {
                    action: number;
                    link: string;
                    description: string;
                    text: string;
                    id: string;
                    openExternalLink(...args: unknown[]): unknown;
                };
                image: {
                    isLoaded: boolean;
                    imageSize: { height: number; width: number };
                    nonAnimatedUrl: string;
                    animatedUrl: string;
                    id: string;
                };
                id: string;
            }>;
            buttons: CoherentArrayProxy<{
                action: number;
                link: string;
                description: string;
                text: string;
                id: string;
                openExternalLink(...args: unknown[]): unknown;
            }>;
            images: CoherentArrayProxy<{
                isLoaded: boolean;
                imageSize: null;
                nonAnimatedUrl: string;
                animatedUrl: string;
                id: string;
            }>;
            template: string;
            worldId: string;
            instanceId: string;
            invStatus: number;
            expiryDaysLeft: null;
            invType: number;
            imgSource: string;
            invitationId: string;
            read: boolean;
            inboxCategory: string;
            content: string;
            senderXuid: string;
            sender: string;
            subtitle: string;
            title: string;
            dateString: string;
            dateReceived: number;
            id: string;
        }>;
        setNotificationRead(...args: unknown[]): unknown;
        acceptInvitation(...args: unknown[]): unknown;
        rejectInvitation(...args: unknown[]): unknown;
        deleteNotification(...args: unknown[]): unknown;
        saveSettings(...args: unknown[]): unknown;
        reloadInvites(...args: unknown[]): unknown;
        markAllRead(...args: unknown[]): unknown;
        deleteAllRead(...args: unknown[]): unknown;
        reportClick(...args: unknown[]): unknown;
        requestMessages(...args: unknown[]): unknown;
    };
    "vanilla.localWorldList": {
        otherStorageTypeHasWorlds: boolean;
        localWorlds: CoherentArrayProxy<{
            isMultiplayerEnabled: boolean;
            requiresCloudSync: boolean;
            allContentOwned: boolean;
            isTemplateCompatibleWithAnyVersion: boolean;
            templateVersion: {
                isBeta: boolean;
                revision: number;
                patch: number;
                minor: number;
                major: number;
            };
            gameVersion: {
                isBeta: boolean;
                revision: number;
                patch: number;
                minor: number;
                major: number;
            };
            playerHasDied: boolean;
            isHardcore: boolean;
            isExperimental: boolean;
            previewImgPath: string;
            fileSize: string;
            gameMode: number;
            lastSaved: number;
            name: string;
            id: string;
        }>;
    };
    "vanilla.marketplaceSuggestions": {
        getMorePacks: { pageId: string; title: string };
    };
    "vanilla.marketplacePassWorldTemplateList": {
        refreshTaskState: number;
        seeMoreMarketplacePassRouteData: { pageId: string; title: string };
        marketplacePassWorldTemplates: CoherentArrayProxy<{
            storeCatalogCategory: number;
            isUpdateAvailable: boolean;
            isInstalled: boolean;
            packId: string;
            isExpired: boolean;
            ratingData: { totalRatingsCount: string; averageRating: number };
            thumbnailPath: string;
            creator: string;
            name: string;
            id: string;
        }>;
        refreshOffers(...args: unknown[]): unknown;
        clearRefreshTaskState(...args: unknown[]): unknown;
    };
    "vanilla.networkWorldDetails": {
        hasLoadedDetails: boolean;
        networkDetails: {
            activities: CoherentArrayProxy<unknown>;
            newsDescription: string;
            newsTitle: string;
            type: number;
            capacity: number;
            playerCount: number;
            pingStatus: number;
            imagePath: string;
            ping: string;
            port: number;
            address: string;
            description: string;
            name: string;
            id: string;
        };
        loadNetworkWorldDetails(...args: unknown[]): unknown;
    };
    "vanilla.networkWorldJoiner": {
        joinLANServerTaskState: number;
        joinLANServerResult: null;
        joinFriendServerState: number;
        joinFriendServerResult: null;
        joinRealmTaskState: number;
        joinRealmResult: null;
        joinExternalServerTaskState: number;
        joinExternalServerResult: null;
        joinThirdPartyServerTaskState: number;
        joinThirdPartyServerResult: null;
        joinThirdPartyServer(...args: unknown[]): unknown;
        clearJoinThirdPartyServerTaskState(...args: unknown[]): unknown;
        joinExternalServer(...args: unknown[]): unknown;
        clearJoinExternalServerTaskState(...args: unknown[]): unknown;
        joinRealmWorld(...args: unknown[]): unknown;
        clearJoinRealmTaskState(...args: unknown[]): unknown;
        joinFriendServer(...args: unknown[]): unknown;
        clearJoinFriendServerTaskState(...args: unknown[]): unknown;
        joinLanServer(...args: unknown[]): unknown;
        clearJoinLANServerTaskState(...args: unknown[]): unknown;
    };
    "vanilla.notificationOptions": {
        doNotShowAddonStackingWarning: boolean;
        doNotShowManageShowcaseReplaceWarning: boolean;
        doNotShowManageShowcaseClearWarning: boolean;
        doNotShowAlternativeStorageHasWorlds: boolean;
        doNotShowHiddenAlternativeStorageWorldsWarning: boolean;
        doNotShowHiddenLocalWorldsWarning: boolean;
        doNotShowUsingExternalStorageWarning: boolean;
        doNotShowMultiplayerOnlineSafetyWarning: boolean;
        doNotShowMultiplayerIpSafetyWarning: boolean;
        doNotShowHardcoreModeWarning: boolean;
        doNotShowOldWorldsWarning: boolean;
        doNotShowEntitlementsWarning: boolean;
        getDoNotShowExperimentalWorldWarning(...args: unknown[]): unknown;
        setDoNotShowExperimentalWorldWarning(...args: unknown[]): unknown;
    };
    "vanilla.notifications": {
        queueSnackbar(...args: unknown[]): unknown;
    };
    "vanilla.options": {
        playVideoInTouchControlSelectionScreen: boolean;
        useMobileDataOnce: boolean;
        showTouchControlSelectionScreen: boolean;
        touchControlScheme: number;
        showRenderDistanceWarningModal: boolean;
        maxRenderDistance: number;
        defaultRenderDistance: number;
        renderDistance: number;
    };
    "vanilla.playerAchievements": {
        data: {
            achievements: CoherentArrayProxy<unknown>;
            maxGamerScore: number;
            currentGamerScore: number;
            maxAchievements: number;
            achievementsUnlocked: number;
        };
        status: number;
        load(...args: unknown[]): unknown;
    };
    "vanilla.playerBanned": {
        openBannedInfoPage(...args: unknown[]): unknown;
        openXboxLiveBannedInfoPage(...args: unknown[]): unknown;
    };
    "vanilla.playerFollowingList": {
        playerList: CoherentArrayProxy<unknown>;
        isLoading: boolean;
        load(...args: unknown[]): unknown;
    };
    "vanilla.playermessagingservice": {
        data: { messages: CoherentArrayProxy<unknown>; messageCount: number };
        status: number;
        reportClick(...args: unknown[]): unknown;
        reportDismiss(...args: unknown[]): unknown;
    };
    "vanilla.playerProfile": {
        playerProfiles: CoherentArrayProxy<{
            state: {
                platformError: number;
                platformState: number;
                xblError: number;
                xblState: number;
            };
            data: {
                favoriteStatus: number;
                isInSameGame: boolean;
                playingOnServerId: string;
                url: string;
                qrCode: string;
                presenceMessage: string;
                titleId: undefined;
                titleName: string;
                presence: number;
                isMuted: boolean;
                isBlocked: boolean;
                relation: number;
                platformProfilePic: string;
                xblProfilePic: string;
                avatarState: number;
                avatar: string;
                realName: string;
                platformName: string;
                xblName: string;
                offlineName: string;
                platformId: string;
                xuid: string;
            };
        }>;
        subscribeToProfile(...args: unknown[]): unknown;
        refetchProfile(...args: unknown[]): unknown;
    };
    "vanilla.playerReport": {
        hasReachedReportLimit: boolean;
        screenshot: string;
        reportReasonOptions: CoherentArrayProxy<unknown>;
        reportAreaOptions: CoherentArrayProxy<unknown>;
        reportableChatMessages: CoherentArrayProxy<unknown>;
        selectedChatMessages: CoherentArrayProxy<unknown>;
        galleryScreenshotId: string;
        platformId: string;
        xuid: string;
        reportMessage: string;
        reportReason: number;
        reportArea: number;
        isChatAvailable(...args: unknown[]): unknown;
        decideReportReasonOptions(...args: unknown[]): unknown;
        finishReport(...args: unknown[]): unknown;
        startReport(...args: unknown[]): unknown;
    };
    "vanilla.playerSocialManager": {
        addFriend(...args: unknown[]): unknown;
        removeFriend(...args: unknown[]): unknown;
        block(...args: unknown[]): unknown;
        unblock(...args: unknown[]): unknown;
        mute(...args: unknown[]): unknown;
        unmute(...args: unknown[]): unknown;
        favorite(...args: unknown[]): unknown;
        unfavorite(...args: unknown[]): unknown;
    };
    "vanilla.playerStatistics": {
        data: CoherentArrayProxy<unknown>;
        loaded: boolean;
        load(...args: unknown[]): unknown;
    };
    "vanilla.privacyAndOnlineSafetyFacet": {
        isCheckingCompleted: boolean;
        getAllowCapturesResult: boolean;
        getClubCheckResult: boolean;
        getMultiplayerCheckResult: boolean;
        checkClubAndMultiplayerPermissions(...args: unknown[]): unknown;
    };
    "vanilla.profanityFilter": {
        isProfanityInString(...args: unknown[]): unknown;
    };
    "vanilla.realmsListFacet": {
        realms: CoherentArrayProxy<{
            world: {
                onlinePlayers: CoherentArrayProxy<unknown>;
                players: CoherentArrayProxy<unknown>;
                closed: boolean;
                lastSaved: null | number;
                description: string;
                isInitialized: boolean;
                isHardcore: boolean;
                gameMode: number;
                expired: boolean;
                daysLeft: number;
                full: boolean;
                maxPlayers: number;
                ownerXuid: string;
                slotName: string;
                realmName: string;
                id: number;
            };
            unreadStoryCount: number;
            areStoriesNotificationsEnabled: boolean;
            isOwner: boolean;
        }>;
        error: number;
        state: number;
        compatibility: number;
        forceFetchRealmsList(...args: unknown[]): unknown;
    };
    "vanilla.realmSlots": {
        didFailToActivateSlot: boolean;
        didFailToQuerySelectedRealmDetails: boolean;
        isShowingConfirmationModal: boolean;
        isSlotSelected: boolean;
        isLoading: boolean;
        selectedRealmName: string;
        realmSlots: CoherentArrayProxy<unknown>;
        status: number;
        selectSlot(...args: unknown[]): unknown;
        getSelectedRealmDetails(...args: unknown[]): unknown;
        reset(...args: unknown[]): unknown;
        confirm(...args: unknown[]): unknown;
    };
    "vanilla.realmsMembership": {
        leaveRealmResult: number;
        leaveRealmProgress: number;
        joinedRealmName: string;
        joinedRealmId: string;
        joinRealmError: null | number;
        joinRealmProgress: number;
        fetchRealmError: null | number;
        fetchRealmResult: null | number;
        fetchRealmProgress: number;
        fetchRealm(...args: unknown[]): unknown;
        clearFetchRealm(...args: unknown[]): unknown;
        joinRealm(...args: unknown[]): unknown;
        clearJoinRealm(...args: unknown[]): unknown;
        leaveRealm(...args: unknown[]): unknown;
        clearLeaveRealm(...args: unknown[]): unknown;
    };
    "vanilla.realmsStories.actions": {
        init(...args: unknown[]): unknown;
        reset(...args: unknown[]): unknown;
        joinRealmFromInvite(...args: unknown[]): unknown;
        postStory(...args: unknown[]): unknown;
        clearPostStoryStatus(...args: unknown[]): unknown;
        postComment(...args: unknown[]): unknown;
        clearPostCommentStatus(...args: unknown[]): unknown;
        fetchStories(...args: unknown[]): unknown;
        clearStoryFeedStatus(...args: unknown[]): unknown;
        fetchStoryImage(...args: unknown[]): unknown;
        fetchEvents(...args: unknown[]): unknown;
        clearEventsStatus(...args: unknown[]): unknown;
        fetchMembers(...args: unknown[]): unknown;
        fetchSessions(...args: unknown[]): unknown;
        clearFetchMembersStatus(...args: unknown[]): unknown;
        loadStoriesSlice(...args: unknown[]): unknown;
        fetchStoryComments(...args: unknown[]): unknown;
        setViewed(...args: unknown[]): unknown;
        clearSetViewedStatus(...args: unknown[]): unknown;
        toggleLike(...args: unknown[]): unknown;
        clearFetchSessionsStatus(...args: unknown[]): unknown;
        clearToggleLikeStatus(...args: unknown[]): unknown;
        delete(...args: unknown[]): unknown;
        clearDeleteStatus(...args: unknown[]): unknown;
        setPlayerOptInStatusAndPostWithOptInTelemetry(...args: unknown[]): unknown;
        setRealmEventsStatus(...args: unknown[]): unknown;
        setRealmCoordinatesStatus(...args: unknown[]): unknown;
        setRealmTimelineStatus(...args: unknown[]): unknown;
        setRealmTimelineRequirementStatus(...args: unknown[]): unknown;
        setRealmNotificationStatus(...args: unknown[]): unknown;
        postSettings(...args: unknown[]): unknown;
        postSettingsOnExit(...args: unknown[]): unknown;
        fetchSettings(...args: unknown[]): unknown;
        clearSettingsStatus(...args: unknown[]): unknown;
        reportToClubOwner(...args: unknown[]): unknown;
        clearReportToClubOwnerStatus(...args: unknown[]): unknown;
        reportFeedItemToXbox(...args: unknown[]): unknown;
        reportGamertagToXbox(...args: unknown[]): unknown;
        clearReportToXboxStatus(...args: unknown[]): unknown;
        openManageMembersScreen(...args: unknown[]): unknown;
    };
    "vanilla.realmsStories.persistentData": {
        newPostAvailable: boolean;
        currentMemberSortOption: number;
        currentMemberFilterOption: number;
        currentMemberSearchText: string;
        storyScreenshotSelectionFilePath: string;
        commentInProgressBody: string;
        postInProgressBody: string;
        currentStoryId: string;
    };
    "vanilla.realmsStories.players": {
        fetchOnlineMembersStatus: number;
        fetchMembersStatus: number;
        players: CoherentArrayProxy<unknown>;
    };
    "vanilla.realmsStories.realmData": {
        isHardcore: boolean;
        isFetchingRealmWorld: boolean;
        isRealmWorldValid: boolean;
        userXuid: string;
        ownerXuid: string;
        description: string;
        name: string;
    };
    "vanilla.realmsStories.settings": {
        timelineRequiredStatus: boolean;
        currentPostState: number;
        currentFetchState: number;
        realmTimelineStatus: boolean;
        realmCoordinatesStatus: boolean;
        realmEventsStatus: boolean;
        realmNotificationsStatus: boolean;
        playerOptIn: number;
        realmOptIn: number;
    };
    "vanilla.realmsStories.stories": {
        mostRecentStoriesViewed: boolean;
        pageLength: number;
        unreadStoryCount: number;
        totalStories: number;
        postStoryStatus: number;
        storiesFirstPageReady: boolean;
        storiesStatus: number;
        stories: CoherentArrayProxy<unknown>;
    };
    "vanilla.RealmsPDPFacet": {
        isRealmsTrialAvailable: boolean;
    };
    "vanilla.RealmWorldUploaderFacet": {
        choosePreviewRealm: boolean;
        uploadedRealmWorldId: number;
        uploadWorldToRealmError: null;
        uploadWorldToRealmTaskState: number;
        uploadWorldToRealm(...args: unknown[]): unknown;
        setPreviewRealmForUpload(...args: unknown[]): unknown;
        clearUploadWorldToRealmTaskState(...args: unknown[]): unknown;
    };
    "vanilla.recentlyPlayedWithList": {
        xboxAPICallResult: number;
        playerList: CoherentArrayProxy<{
            description: string;
            isFollowedByMe: boolean;
            isFollowingMe: boolean;
            isOnline: boolean;
            gamerIcon: string;
            gamertag: string;
            xuid: string;
        }>;
        isLoading: boolean;
    };
    "vanilla.recommendedFriendsList": {
        xboxAPICallResult: number;
        playerList: CoherentArrayProxy<{
            description: string;
            isFollowedByMe: boolean;
            isFollowingMe: boolean;
            isOnline: boolean;
            gamerIcon: string;
            gamertag: string;
            xuid: string;
        }>;
        isLoading: boolean;
    };
    "vanilla.resourcePackOverrides": {
        lastUpdated: number;
        definitions: CoherentArrayProxy<unknown>;
    };
    "vanilla.resourcePacks": {
        lastActivatedPackId: string;
        prompt: {
            actions: CoherentArrayProxy<unknown>;
            body: string;
            title: string;
            active: boolean;
            id: string;
            handleAction(...args: unknown[]): unknown;
        };
        availableBehaviorPacks: CoherentArrayProxy<{
            isAddon: boolean;
            hasSettings: boolean;
            isPlatformLocked: boolean;
            isMarketplaceItem: boolean;
            image: string;
            contentId: string;
            id: string;
            size: string;
            description: string;
            type: string;
            name: string;
        }>;
        activeBehaviorPacks: CoherentArrayProxy<unknown>;
        unownedTexturePacks: CoherentArrayProxy<unknown>;
        realmsTexturePacks: CoherentArrayProxy<{
            isAddon: boolean;
            hasSettings: boolean;
            isPlatformLocked: boolean;
            isMarketplaceItem: boolean;
            image: string;
            contentId: string;
            id: string;
            size: string;
            description: string;
            type: string;
            name: string;
        }>;
        globalTexturePacks: CoherentArrayProxy<unknown>;
        availableTexturePacks: CoherentArrayProxy<{
            isAddon: boolean;
            hasSettings: boolean;
            isPlatformLocked: boolean;
            isMarketplaceItem: boolean;
            image: string;
            contentId: string;
            id: string;
            size: string;
            description: string;
            type: string;
            name: string;
        }>;
        activeTexturePacks: CoherentArrayProxy<unknown>;
        importProgress: number;
        downloadProgress: number;
        marketplacePackId: string;
        resourcePackToDownload: { body: string; title: string };
        realmsSubscriber: boolean;
        realmsPlusSupported: boolean;
        status: number;
        activate(...args: unknown[]): unknown;
        deactivate(...args: unknown[]): unknown;
        showSettings(...args: unknown[]): unknown;
        cancelDownload(...args: unknown[]): unknown;
        changePackPriority(...args: unknown[]): unknown;
        clearLastActivatedPackId(...args: unknown[]): unknown;
    };
    "vanilla.screenSpecificOptions": {
        playScreenWorldLayoutMode: number;
    };
    "vanilla.screenTechStack": {
        selectTechStackForScreen(...args: unknown[]): unknown;
        getTechStackForScreen(...args: unknown[]): unknown;
        getPreferredTechStackForScreen(...args: unknown[]): unknown;
    };
    "vanilla.seedTemplates": {
        failedToFetch: boolean;
        templates: CoherentArrayProxy<{ image: string; seedValue: string; title: string }>;
        refresh(...args: unknown[]): unknown;
    };
    "vanilla.share": {
        isShareSupported: boolean;
        share(...args: unknown[]): unknown;
        shareFile(...args: unknown[]): unknown;
    };
    "vanilla.simulationDistanceOptions": {
        simulationDistanceOptions: CoherentArrayProxy<number>;
    };
    "vanilla.telemetry": {
        fireEvent(...args: unknown[]): unknown;
        fireEventButtonPressed(...args: unknown[]): unknown;
        fireEventModalShown(...args: unknown[]): unknown;
        trackOptionChanged(...args: unknown[]): unknown;
        fireEventOptionsChanged(...args: unknown[]): unknown;
        discardTrackedOptions(...args: unknown[]): unknown;
        fireEventRealmsStoriesOptIn(...args: unknown[]): unknown;
    };
    "vanilla.thirdPartyWorldList": {
        fetchThirdPartyWorldsTaskState: number;
        thirdPartyServersStatus: number;
        thirdPartyWorlds: CoherentArrayProxy<{
            msgOfTheDay: string;
            image: string;
            capacity: number;
            playerCount: number;
            pingStatus: number;
            ping: string;
            description: string;
            name: string;
            id: string;
        }>;
    };
    "vanilla.unpairedRealmsListFacet": {
        realms: CoherentArrayProxy<unknown>;
        state: number;
        compatibility: undefined;
        forceFetchUnpairedRealmsList(...args: unknown[]): unknown;
    };
    "vanilla.userAccount": {
        signInPlatformNetworkTaskResult: null;
        signInPlatformNetworkTaskState: number;
        isSignedInPlatformNetwork: boolean;
        accountUnlinkState: number;
        currentXuid: string;
        currentPlatformId: string;
        isMarketplacePassSubscriptionActive: boolean;
        isRealmsPlusSubscriptionActive: boolean;
        hasValidCrossPlatformSkin: boolean;
        isSignInInProgress: boolean;
        hasPremiumNetworkAccess: boolean;
        banExpiration: string;
        banReason: string;
        isBanned: boolean;
        userPermissions: {
            viewProfiles: { allowed: boolean; denyReasons: CoherentArrayProxy<unknown> };
            addFriends: { allowed: boolean; denyReasons: CoherentArrayProxy<unknown> };
            multiplayer: { allowed: boolean; denyReasons: CoherentArrayProxy<unknown> };
        };
        isLoggedInWithMicrosoftAccount: boolean;
        isTrialAccount: boolean;
        updateMultiplayerPrivilegeUsingSystemModal(...args: unknown[]): unknown;
        showPremiumNetworkUpsellModal(...args: unknown[]): unknown;
        signOutOfMicrosoftAccount(...args: unknown[]): unknown;
        manageMicrosoftAccount(...args: unknown[]): unknown;
        unlinkMicrosoftAccount(...args: unknown[]): unknown;
        clearAccountUnlinkState(...args: unknown[]): unknown;
        signInToPlatformNetwork(...args: unknown[]): unknown;
        resetSignInPlatformNetwork(...args: unknown[]): unknown;
    };
    "vanilla.webBrowserFacet": {
        openLink(...args: unknown[]): unknown;
        openLinkWithParams(...args: unknown[]): unknown;
    };
    "vanilla.worldCloudSyncFacet": {
        syncWorldTaskState: number;
        syncWorldResult: null;
        syncWorld(...args: unknown[]): unknown;
        clearSyncWorldTaskState(...args: unknown[]): unknown;
    };
    "vanilla.worldEditor": {
        loadWorldTaskState: number;
        loadWorldError: null;
        saveRealmsWorldTaskState: number;
        saveRealmsWorldError: null;
        saveLocalWorldTaskState: number;
        saveLocalWorldError: null;
        worldHasBeenModified: boolean;
        worldIsInitialized: boolean;
        currentWorldId: string;
        isEditorWorld: boolean;
        isAchievementsEditDisabled: boolean;
        worldSummary: { lastSaved: string; fileSize: string; worldIconPath: string };
        worldData: {
            achievementsPermanentlyDisabled: boolean;
            achievementsDisabled: boolean;
            isUsingTemplate: boolean;
            isLockedTemplate: boolean;
            betaFeatures: CoherentArrayProxy<{
                isEnabled: boolean;
                isTogglePermanentlyDisabled: boolean;
                category: number;
                description: string;
                title: string;
                id: string;
            }>;
            resourcePacks: { sharedPacksEnabled: boolean };
            cheats: {
                tickSpeed: string;
                educationEdition: boolean;
                commandBlocks: boolean;
                weather: boolean;
                entitiesDropLoot: boolean;
                mobGriefing: boolean;
                mobSpawning: boolean;
                keepInventory: boolean;
                daylightCycle: number;
                cheatsEnabled: boolean;
            };
            scriptingCoding: {
                consoleCommandsEnabled: boolean;
                codeBuilderEnabled: boolean;
            };
            multiplayer: {
                locatorBarEnabled: boolean;
                friendlyFire: boolean;
                visibleToLanPlayers: boolean;
                playerPermissions: number;
                playerAccess: number;
                generalWarningState: number;
                platformPlayerFriendsOfFriendsAccessSupported: boolean;
                platformPlayerInviteAccessSupported: boolean;
                platformPlayerAccessEnabled: boolean;
                platformPlayerAccessSupported: boolean;
                platformPlayerAccess: number;
                multiplayerGame: boolean;
                multiplayerSupported: boolean;
            };
            advanced: {
                flatWorldPreset: null;
                worldSeed: string;
                respawnRadius: string;
                immediateRespawn: boolean;
                sleepSkipNightPercent: number;
                sleepSkipNight: boolean;
                tileDrops: boolean;
                naturalRegeneration: boolean;
                mobLoot: boolean;
                respawnBlocksExplode: boolean;
                tntExplodes: boolean;
                recipesUnlock: boolean;
                firesSpreads: boolean;
                friendlyFire: boolean;
                showDaysPlayed: boolean;
                showCoordinates: boolean;
                bonusChest: boolean;
                startWithMap: boolean;
                simulationDistance: number;
                generatorType: number;
                useFlatWorld: boolean;
            };
            general: {
                difficulty: number;
                playerHasDied: boolean;
                isHardcore: boolean;
                gameMode: number;
                worldName: string;
            };
        };
        saveLocalWorld(...args: unknown[]): unknown;
        clearSaveLocalWorldTaskState(...args: unknown[]): unknown;
        saveRealmsWorld(...args: unknown[]): unknown;
        clearSaveRealmsWorld(...args: unknown[]): unknown;
        addWorld(...args: unknown[]): unknown;
        loadWorld(...args: unknown[]): unknown;
        closeWorld(...args: unknown[]): unknown;
        reloadWorld(...args: unknown[]): unknown;
    };
    "vanilla.worldOperations": {
        clearPlayerDataTaskState: number;
        startClearPlayerDataError: null;
        exportWorldStatus: number;
        exportWorldResult: null;
        makeWorldInfiniteProgress: number;
        makeWorldInfiniteState: number;
        makeWorldInfiniteError: null;
        duplicateWorldTaskState: number;
        duplicateWorldError: null;
        startDuplicateWorld(...args: unknown[]): unknown;
        clearDuplicateWorldTaskState(...args: unknown[]): unknown;
        makeWorldInfinite(...args: unknown[]): unknown;
        clearMakeWorldInfiniteState(...args: unknown[]): unknown;
        deleteWorld(...args: unknown[]): unknown;
        exportWorld(...args: unknown[]): unknown;
        exportWorldAsTemplate(...args: unknown[]): unknown;
        clearExportWorldResult(...args: unknown[]): unknown;
        clearPlayerData(...args: unknown[]): unknown;
        resetClearPlayerData(...args: unknown[]): unknown;
        saveScreenshotAsWorldIcon(...args: unknown[]): unknown;
        resetWorldIconToDefault(...args: unknown[]): unknown;
    };
    "vanilla.worldPackages": {
        lastConsultedPackSizes: string;
        lastConsultedPackSizesTaskState: number;
        lastConsultedPackSizesError: null;
        packDownloadErrorData: {
            packTitles: CoherentArrayProxy<unknown>;
            storageSpaceNeeded: string;
        };
        packDownloadStatus: number;
        packDownloadTaskState: number;
        packDownloadProgress: number;
        packDownloadName: string;
        packDownloadError: null;
        worldPacksData: {
            availableBehaviorPacks: CoherentArrayProxy<unknown>;
            activeBehaviorPacks: CoherentArrayProxy<unknown>;
            unownedTexturePacks: CoherentArrayProxy<unknown>;
            realmsTexturePacks: CoherentArrayProxy<unknown>;
            globalTexturePacks: CoherentArrayProxy<unknown>;
            availableTexturePacks: CoherentArrayProxy<unknown>;
            activeTexturePacks: CoherentArrayProxy<unknown>;
            realmsSubscriber: boolean;
            realmsPlusSupported: boolean;
        };
        isReadyForDownload: boolean;
        isInitialized: boolean;
        loadPacksData(...args: unknown[]): unknown;
        activatePack(...args: unknown[]): unknown;
        deactivatePack(...args: unknown[]): unknown;
        changePackPriority(...args: unknown[]): unknown;
        continuePackActivation(...args: unknown[]): unknown;
        continuePackDeactivation(...args: unknown[]): unknown;
        downloadPacks(...args: unknown[]): unknown;
        cancelPackDownload(...args: unknown[]): unknown;
        getPackSizes(...args: unknown[]): unknown;
        getPackSizesReset(...args: unknown[]): unknown;
    };
    "vanilla.worldStartup": {
        backupThenStartLocalWorld: {
            progress: null;
            state: number;
            result: null;
            run(...args: unknown[]): unknown;
            cancel(...args: unknown[]): unknown;
            clear(...args: unknown[]): unknown;
        };
        brokenPacksToStart: CoherentArrayProxy<unknown>;
        missingPacksSize: string;
        missingPacksToStart: CoherentArrayProxy<unknown>;
        missingTemplateToStart: string;
        hasMissingResources: boolean;
        startLocalWorldTaskState: number;
        startLocalWorldResult: null;
        startLocalWorld(...args: unknown[]): unknown;
        clearStartLocalWorldResult(...args: unknown[]): unknown;
    };
    "vanilla.worldTemplateList": {
        templates: CoherentArrayProxy<unknown>;
        customTemplates: CoherentArrayProxy<unknown>;
        premiumTemplates: CoherentArrayProxy<unknown>;
    };
    "vanilla.worldTransfer": {
        backupWorldProgress: number;
        backupWorldResult: null;
        importWorldProgress: number;
        importWorldProgressPercentage: number;
        importWorldResult: null;
        importWorld: {
            progress: null;
            state: number;
            result: null;
            run(): unknown;
            cancel(...args: unknown[]): unknown;
            clear(...args: unknown[]): unknown;
        };
        importWorld_v2(): unknown;
        resetImportWorld(...args: unknown[]): unknown;
        backupWorld(...args: unknown[]): unknown;
        resetBackupWorld(...args: unknown[]): unknown;
    };
    "vanilla.friendworldlist": {
        friendWorlds: CoherentArrayProxy<{
            friendOfFriendWorld: boolean;
            capacity: number;
            playerCount: number;
            isHardcore: boolean;
            gameMode: number;
            ownerId: string;
            ownerName: string;
            name: string;
            id: string;
        }>;
    };
    "vanilla.offerRepository": {
        plusSubscriptionPrice: string;
        coreSubscriptionPrice: string;
        plusSubscriptionTermsExtra: string;
        plusSubscriptionTerms: string;
        coreSubscriptionTermsExtra: string;
        coreSubscriptionTerms: string;
        isRealmsPlusOfferAvailable: boolean;
        isRealmsCoreOfferAvailable: boolean;
        isRealmsTrialOfferAvailable: boolean;
        isFinishedQueryingProductsAndPurchases: boolean;
    };
    "vanilla.realmsSettingsFacet": {
        openRealm(...args: unknown[]): unknown;
        closeRealm(...args: unknown[]): unknown;
    };
}
//#endvignore Debug Stuff
