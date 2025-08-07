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
        type Split<S extends string> = S extends "" ? [] : S extends `${infer C}${infer R}` ? [C, ...Split<R>] : never;

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
        type TakeFirstNElements<T extends any[], N extends number, Result extends any[] = []> = Result["length"] extends N
            ? Result
            : T extends [infer First, ...infer Rest]
            ? TakeFirstNElements<Rest, N, [...Result, First]>
            : Result;

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
        type Join<T extends string[]> = T extends []
            ? ""
            : T extends [infer Head, ...infer Tail]
            ? Head extends string
                ? `${Head}${Join<Tail extends string[] ? Tail : []>}`
                : never
            : never;

        /**
         * Cuts the first N characters from a string.
         *
         * @template S The string to cut.
         * @template N The number of characters to cut.
         *
         * @example
         * ```ts
         * type Original = CutFirstChars<"abcdef", 2>; // "cdef"
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
        export type DeepPartial<T> = T extends object
            ? {
                  [P in keyof T]?: DeepPartial<T[P]>;
              }
            : T;
        type KeysOfUnion<T> = T extends T ? keyof T : never;
        type ValueTypes<T> = T extends { [key: string]: infer U } ? U : never;
        type AllValues<T> = T extends { [key: string]: infer V } ? V : never;
        type KeyValuePairs<T> = {
            [K in KeysOfUnion<T>]: AllValues<Extract<T, Record<K, any>>>;
        };
        /**
         * @see https://stackoverflow.com/a/58986589
         * @author jcalz <https://stackoverflow.com/users/2887218/jcalz>
         */
        type ExcludeFromTuple<T extends readonly any[], E> = T extends [infer F, ...infer R]
            ? [F] extends [E]
                ? ExcludeFromTuple<R, E>
                : [F, ...ExcludeFromTuple<R, E>]
            : [];
        type IncludeFromTuple<T extends readonly any[], E> = T extends [infer F, ...infer R]
            ? [F] extends [E]
                ? [F, ...IncludeFromTuple<R, E>]
                : IncludeFromTuple<R, E>
            : [];
        type NullableArray<T extends any[] | readonly any[]> = T | [null, ...T] | [...T, null];
        /**
         * A function to be put into the react renderer to collect facet accessors.
         *
         * @param {{}} [param0] Ignore this.
         * @returns {null} Returns `null`.
         */
        function facetSpy({}: {}): null;
        /**
         * A list of all the facets.
         */
        type FacetList = [
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
            "vanilla.editorLogging",
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
            "vanilla.realmsStories.actions",
            "vanilla.realmsStories.realmData",
            "vanilla.realmsStories.persistentData",
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
            // "vanilla.editorBlockPalette", // Crashes the game.
            // "vanilla.editorInputBinding",
            // "vanilla.editorInputState",
            // "vanilla.editorProjectConstants",
            // "vanilla.editorStructure",
            // "vanilla.editorTutorial",
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
            "vanilla.realmsPurchaseQueries"
        ];
        /**
         * An interface that represents a route history item.
         */
        interface RouteHistoryItem {
            /**
             * The hash component of the route.
             */
            hash: string;
            /**
             * The path component of the route.
             */
            pathname: string;
            /**
             * The search component of the route.
             */
            search: string;
        }
        /**
         * An interface that maps facets to their types.
         */
        interface FacetTypeMap {
            "core.animation": { screenAnimationEnabled: boolean };
            "core.customScaling": {
                guiAccessibilityScaling: boolean;
                MAX_FIXED_GUI_SCALE_MODIFIER: number;
                MIN_FIXED_GUI_SCALE_MODIFIER: number;
                fixedGuiScaleModifier: number;
                scalingModeOverride: string;
            };
            "core.deviceInformation": {
                activeMultiplayerServiceIds: ArrayLike<number>;
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
                inputMethods: ArrayLike<number>;
                arvrPlatform: number;
                platform: number;
            };
            "core.featureFlags": {
                flags: PartialArrayType<string>;
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
            "core.performanceFacet": unknown; // May not exist.
            "core.router": {
                /**
                 * The history object.
                 */
                history: {
                    /**
                     * Replaces the current route.
                     *
                     * @param {string} route The new route.
                     */
                    replace(route: string): void;
                    /**
                     * Pushes a new route onto the history stack.
                     *
                     * @param {string} route The new route.
                     */
                    push(route: string): void;
                    /**
                     * Goes to the previous route on the history stack.
                     */
                    goBack(): void;
                    /**
                     * Goes to the next route on the history stack.
                     */
                    goForward(): void;
                    /**
                     * Moves a specific distance on the history stack.
                     *
                     * @param {number} distance The distance to move. Negative numbers go back, positive numbers go forward.
                     */
                    go(distance?: number): void;
                    /**
                     * The current route.
                     */
                    location: RouteHistoryItem;
                    /**
                     * The history stack.
                     */
                    list: PartialArrayType<RouteHistoryItem>;
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
            "core.social": unknown; // Exists but not yet accessed.
            "core.sound": {
                /**
                 * Plays a sound.
                 *
                 * @param {string} sound The sound to play. Should be a key from `sound_definitions.json`.
                 * @param {number} volume The volume to play the sound at.
                 * @param {number} pitch The pitch to play the sound at.
                 * @returns {number} The ID used to fade out the sound or check if the sound is playing.
                 */
                play(sound: string, volume: number, pitch: number): number;
                /**
                 * Fades out a sound.
                 *
                 * @param {number} id The ID of the sound to fade out.
                 * @returns {null} Returns `null`.
                 */
                fadeOut(id: number): null;
                /**
                 * Checks if a sound is currently playing.
                 *
                 * @param {number} id The ID of the sound to check.
                 * @returns {boolean | undefined} Returns `true` if the sound is currently playing, `false` if it is not, or `undefined` if the id parameter is invalid.
                 */
                isPlaying(id: number): boolean | undefined;
            };
            "core.user": unknown; // May not exist.
            "core.vrMode": unknown; // Found in dev build file.
            "vanilla.achievements": unknown;
            "vanilla.achievementsReward": unknown; // May not exist.
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
            "vanilla.createNewWorld": unknown;
            "vanilla.createPreviewRealmFacet": unknown;
            "vanilla.debugSettings": unknown;
            "vanilla.editor": unknown;
            "vanilla.editorInput": unknown; // May not exist.
            "vanilla.editorLogging": unknown;
            "vanilla.editorScripting": unknown;
            "vanilla.editorSelectionFacet": unknown; // May not exist.
            "vanilla.editorSettings": unknown;
            "vanilla.externalServerWorldList": {
                addedServerId: number;
                externalServerWorlds: PartialArrayType<{
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
            "vanilla.followersList": unknown;
            "vanilla.friendsListFacet": {
                platformFriends: PartialArrayType<unknown>;
                xblFriends: PartialArrayType<{
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
            "vanilla.friendsManagerFacet": unknown; // Exists but not yet accessed.
            "vanilla.gameplay.activeLevelHardcoreMode": unknown;
            "vanilla.gameplay.bedtime": unknown;
            "vanilla.gameplay.closeContainerCommand": unknown; // May not exist.
            "vanilla.gameplay.containerBlockActorType": unknown;
            "vanilla.gameplay.containerItemQuery": unknown; // May not exist.
            "vanilla.gameplay.containerSizeQuery": unknown; // May not exist.
            "vanilla.gameplay.furnace": unknown;
            "vanilla.gameplay.immediateRespawn": unknown;
            "vanilla.gameplay.leaveGame": unknown;
            "vanilla.gameplay.playerDeathInfo": unknown;
            "vanilla.gameplay.playerPositionHudElement": unknown; // May not exist.
            "vanilla.gameplay.playerRespawn": unknown;
            "vanilla.gamertagSearch": unknown;
            "vanilla.inbox": unknown;
            "vanilla.lanWorldList": {
                lanWorlds: PartialArrayType<{
                    ping: string;
                    capacity: number;
                    playerCount: number;
                    isHardcore: boolean;
                    gameMode: number;
                    port: number;
                    address: LooseAutocomplete<"UNASSIGNED_SYSTEM_ADDRESS" | `${number}.${number}.${number}.${number}`>;
                    ownerName: string;
                    name: string;
                    /**
                     * The world ID.
                     *
                     * In the format `${ownName}${name}v`.
                     */
                    id: `${string}${string}v`;
                }>;
            };
            "vanilla.localWorldList": {
                /**
                 * Whether or not the other storage type has any worlds.
                 */
                otherStorageTypeHasWorlds: boolean;
                /**
                 * The local worlds.
                 */
                localWorlds: ArrayLike<LocalWorldDataType>;
            };
            "vanilla.marketplaceSuggestions": unknown;
            "vanilla.marketplacePassWorldTemplateList": unknown;
            "vanilla.networkWorldDetails": {
                hasLoadedDetails: boolean;
                networkDetails: {
                    activities: PartialArrayType<unknown>;
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
                /**
                 * Loads the details of a network world.
                 *
                 * @param {`${number}`} id The ID of the server.
                 * @param {0 | 1 | 2 | 3} type `0` = Featured Server, `1` = External Server, `2` = Realm, `3` = LAN Server
                 * @returns {undefined | null} `undefined` if the parameters are invalid, `null` otherwise.
                 */
                loadNetworkWorldDetails(id: `${number}`, type: 0 | 1 | 2 | 3): undefined | null;
            };
            "vanilla.networkWorldJoiner": {
                joinLANServerTaskState: number;
                joinLANServerResult: null | number;
                joinFriendServerTaskState: number;
                joinFriendServerResult: null | number;
                joinRealmTaskState: number;
                joinRealmResult: null | number;
                joinExternalServerTaskState: number;
                joinExternalServerResult: null | number;
                joinThirdPartyServerTaskState: number;
                joinThirdPartyServerResult: null | number;
                joinThirdPartyServer(...args: unknown[]): unknown;
                clearJoinThirdPartServerTaskState(...args: unknown[]): unknown;
                joinExternalServer(serverID: string): unknown;
                clearJoinExternalServerTaskState(...args: unknown[]): unknown;
                joinFriendServer(...args: unknown[]): unknown;
                clearJoinFriendServerTaskState(...args: unknown[]): unknown;
                joinLanServer(...args: unknown[]): unknown;
                clearJoinLANServerTaskState(...args: unknown[]): unknown;
                joinRealmWorld(realmID: string, joinRealmTaskState: number): unknown;
                clearJoinRealmTaskState(...args: unknown[]): unknown;
            };
            "vanilla.notificationOptions": unknown;
            "vanilla.notifications": unknown;
            "vanilla.options": unknown;
            "vanilla.party": unknown; // Found in dev build file.
            "vanilla.playerAchievements": unknown;
            "vanilla.playerBanned": unknown;
            "vanilla.playerFollowingList": unknown;
            "vanilla.playerLinkedPlatformProfile": unknown; // Found in dev build file.
            "vanilla.playermessagingservice": {
                data: { messages: PartialArrayType<unknown>; messageCount: number };
                status: number;
                reportClick(...args: unknown[]): unknown;
                reportDismiss(...args: unknown[]): unknown;
            };
            "vanilla.playerPermissions": unknown; // Exists but not yet accessed.
            "vanilla.playerProfile": unknown;
            "vanilla.playerReport": unknown;
            "vanilla.playerSocialManager": unknown;
            "vanilla.playerStatistics": unknown;
            "vanilla.privacyAndOnlineSafetyFacet": unknown;
            "vanilla.profanityFilter": unknown;
            "vanilla.realmsListFacet": {
                realms: ArrayLike<RealmDataType>;
                error: number;
                state: number;
                compatibility: number;
            };
            "vanilla.realmSlots": unknown;
            "vanilla.realmsMembership": unknown;
            "vanilla.realmsStories.actions": unknown;
            "vanilla.realmsStories.localScreenshots": unknown; // May not exist.
            "vanilla.realmsStories.persistentData": unknown;
            "vanilla.realmsStories.players": unknown;
            "vanilla.realmsStories.realmData": unknown;
            "vanilla.realmsStories.settings": unknown;
            "vanilla.realmsStories.stories": unknown;
            "vanilla.RealmsPDPFacet": unknown;
            "vanilla.RealmWorldUploaderFacet": unknown;
            "vanilla.recentlyPlayedWithList": {
                xboxAPICallResult: number;
                playerList: PartialArrayType<{
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
                playerList: PartialArrayType<{
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
            "vanilla.resourcePackOverrides": unknown;
            "vanilla.resourcePacks": unknown;
            "vanilla.screenshotGalleryList": unknown; // May not exist.
            "vanilla.screenSpecificOptions": unknown;
            "vanilla.screenTechStack": unknown;
            "vanilla.seedTemplates": {
                failedToFetch: boolean;
                templates: PartialArrayType<{ image: string; seedValue: string; title: string }>;
                refresh(...args: unknown[]): unknown;
            };
            "vanilla.share": {
                isShareSupported: boolean;
                share(...args: unknown[]): unknown;
                shareFile(...args: unknown[]): unknown;
            };
            "vanilla.simulationDistanceOptions": {
                simulationDistanceOptions: PartialArrayType<number>;
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
                thirdPartyWorlds: PartialArrayType<{
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
                realms: PartialArrayType<unknown>;
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
                    viewProfiles: { allowed: boolean; denyReasons: PartialArrayType<unknown> };
                    addFriends: { allowed: boolean; denyReasons: PartialArrayType<unknown> };
                    multiplayer: { allowed: boolean; denyReasons: PartialArrayType<unknown> };
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
                    betaFeatures: PartialArrayType<{
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
            "vanilla.worldOperations": unknown;
            "vanilla.worldPackages": unknown;
            "vanilla.worldPlayersList": unknown; // Exists but not yet accessed.
            "vanilla.worldStartup": unknown;
            "vanilla.worldTemplateList": unknown;
            "vanilla.worldTransfer": {
                backupWorldProgress: number;
                backupWorldResult: null | number;
                importWorldProgress: number;
                importWorldProgressPercentage: number;
                importWorldResult: null | number;
                importWorld: {
                    progress: null | number;
                    state: number;
                    result: null | number;
                    run(): void;
                    cancel(): void;
                    clear(): void;
                };
                importWorld_v2(): null;
                resetImportWorld(): void;
                backupWorld(): unknown;
                resetBackupWorld(): void;
            };
            "vanilla.friendworldlist": {
                friendWorlds: PartialArrayType<{
                    friendOfFriendWorld: boolean;
                    capacity: number;
                    playerCount: number;
                    isHardcore: boolean;
                    gameMode: number;
                    ownerId: `${number}`;
                    ownerName: string;
                    name: string;
                    id: `${number}`;
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
            "vanilla.realmsStories.actions": unknown;
            "vanilla.realmsStories.realmData": unknown;
            "vanilla.realmsStories.persistentData": unknown;
            "vanilla.realmsSettingsFacet": {
                openRealm(...args: unknown[]): unknown;
                closeRealm(...args: unknown[]): unknown;
            };
            "vanilla.achievementCategories": unknown;
            "vanilla.blockInformation": unknown;
            "debug.worldTransfer": unknown;
            "vanilla.flatWorldPresets": unknown;
            "vanilla.inGame": unknown;
            "vanilla.playerPrivacy": unknown;
            "vanilla.realmsPurchase": unknown;
            "vanilla.realmsSubscriptionsData": unknown;
            "vanilla.realmsSubscriptionsMethods": unknown;
            "vanilla.realmsWorldContextCommands": unknown;
            "vanilla.realmsWorldContextQueries": unknown;
            "vanilla.realmsStories.sessions": unknown;
            "vanilla.realmsListActionsFacet": unknown;
            "vanilla.developerOptionsFacet": unknown;
            "vanilla.realmsStories.comments": unknown;
            "vanilla.screenshotGallery": unknown;
            "vanilla.playerShowcasedGallery": unknown;
            "vanilla.trialMode": unknown;
            "vanilla.featuredWorldTemplateList": unknown;
            "vanilla.ownedWorldTemplateList": unknown;
            "vanilla.worldTemplateOperations": unknown;
            "test.vector": unknown;
            "vanilla.editorBlockPalette": unknown;
            "vanilla.editorInputBinding": unknown;
            "vanilla.editorInputState": unknown;
            "vanilla.editorProjectConstants": unknown;
            "vanilla.editorStructure": unknown;
            "vanilla.editorTutorial": unknown;
            "vanilla.gameplay.localPlayerWeatherLightningFacet": unknown;
            "vanilla.levelInfo": unknown;
            "vanilla.currentParty": unknown;
            "vanilla.partyCommands": unknown;
            "vanilla.worldRealmEditor": unknown; // Found in dev build file.
            "vanilla.worldRealmEditorCommands": unknown;
            "vanilla.worldRealmEditorQueries": unknown;
            "vanilla.realmBackupsCommands": unknown;
            "vanilla.realmBackupsQueries": unknown;
            "vanilla.realmsPurchaseCommands": unknown;
            "vanilla.realmsPurchaseReconcilerQueries": unknown;
            "vanilla.character-selector": unknown;
            "vanilla.progressTracker": unknown;
        }
        /**
         * The context holder.
         */
        var contextHolder: unknown;
        /**
         * The facet access holder.
         */
        var facetAccessHolder: unknown;
        /**
         * The list of accessed facets.
         */
        var accessedFacets: Partial<Record<FacetList[number], SharedFacet>>;
        /**
         * The facet spy data.
         */
        var facetSpyData: { sharedFacets: { [FacetType in FacetList[number]]: SharedFacet<FacetType> } };
        /**
         * A shared facet.
         */
        interface SharedFacet<FacetType> {
            get(): FacetTypeMap[FacetType] | symbol;
            observe(callback: (value: FacetTypeMap[FacetType]) => void): void;
            set(value: FacetTypeMap[FacetType]): void;
            [k: PropertyKey]: unknown;
        }
        /**
         * Returns a list of all accessible facets from the facetSpy data.
         *
         * @returns {Partial<globalThis["facetSpyData"]["sharedFacets"]>} The accessible facets.
         */
        function getAccessibleFacetSpyFacets(): Partial<{ [FacetType in FacetList[number]]: FacetTypeMap[FacetType] }>;
        /**
         * The local world data type.
         */
        interface LocalWorldDataType {
            /**
             * If multiplayer is enabled in the world.
             */
            isMultiplayerEnabled: boolean;
            /**
             * Whether the world requires cloud syncing.
             */
            requiresCloudSync: boolean;
            /**
             * If all content on the world is owned by the player.
             */
            allContentOwned: boolean;
            /**
             * If the world template is compatible with any version.
             */
            isTemplateCompatibleWithAnyVersion: boolean;
            /**
             * The version override of the world.
             */
            templateVersion: { isBeta: boolean; revision: number; patch: number; minor: number; major: number };
            /**
             * The game version that the world was last saved in.
             */
            gameVersion: { isBeta: boolean; revision: number; patch: number; minor: number; major: number };
            /**
             * Whether any player has died in the world before.
             */
            playerHasDied: boolean;
            /**
             * Whether the world has hardcore mode enabled.
             */
            isHardcore: boolean;
            /**
             * Whether the world has any experimental toggles enabled.
             */
            isExperimental: boolean;
            /**
             * The URI of the world preview image.
             */
            previewImgPath: `id://${bigint}`;
            /**
             * The size of the world in MiB.
             */
            fileSize: `${number}MB`;
            /**
             * The game mode of the world.
             */
            gameMode: number;
            /**
             * The last time the world was saved.
             */
            lastSaved: number;
            /**
             * The display name of the world.
             */
            name: string;
            /**
             * The world folder name.
             *
             * @example
             * "7w4ZHhMl-GA="
             */
            id: string;
        }
        interface RealmDataType {
            world: {
                onlinePlayers: ArrayLike<PlayerData>;
                players: ArrayLike<PlayerData>;
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
                ownerXuid: `${bigint}`;
                slotName: string;
                realmName: string;
                id: number;
            };
            unreadStoryCount: number;
            areStoriesNotificationsEnabled: boolean;
            isOwner: boolean;
        }

        type PartialArrayType<T> = ArrayLike<T> & {
            length: number;
            filter: Array<T>["filter"];
            map: Array<T>["map"];
            reduce: Array<T>["reduce"];
            some: Array<T>["some"];
            reduceRight: Array<T>["reduceRight"];
            every: Array<T>["every"];
            indexOf: Array<T>["indexOf"];
            forEach: Array<T>["forEach"];
            slice: Array<T>["slice"];
            find: Array<T>["find"];
            findIndex: Array<T>["findIndex"];
            includes: Array<T>["includes"];
            lastIndexOf: Array<T>["lastIndexOf"];
            entries(): ArrayIterator<[number, T]>;
            join(separator?: string): string;
            keys(): ArrayIterator<number>;
            values(): ArrayIterator<T>;
            toString(): string;
        };
    }
}

export {};

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
        activeMultiplayerServiceIds: PartialArrayType<number>;
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
        inputMethods: PartialArrayType<number>;
        arvrPlatform: number;
        platform: number;
        changeStorage(...args: unknown[]): unknown;
    };
    "core.featureFlags": {
        flags: PartialArrayType<string>;
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
            list: PartialArrayType<{ hash: string; search: string; pathname: string }>;
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
            achievements: PartialArrayType<{
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
            betaFeatures: PartialArrayType<{
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
        allBiomes: PartialArrayType<{ dimension: number; id: number; label: string }>;
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
        tagList: PartialArrayType<unknown>;
        messageList: PartialArrayType<unknown>;
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
        themesMap: {};
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
        externalServerWorlds: PartialArrayType<{
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
        playerList: PartialArrayType<{
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
        platformFriends: PartialArrayType<unknown>;
        xblFriends: PartialArrayType<{
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
        searchResults: PartialArrayType<unknown>;
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
        categoryData: PartialArrayType<{
            imageUrl: string;
            unreadMessages: number;
            localizedName: string;
            categoryName: string;
        }>;
        realmsSubscriber: boolean;
        inboxMessages: PartialArrayType<{
            style: number;
            gamedrop: null;
            items: PartialArrayType<{
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
            buttons: PartialArrayType<{
                action: number;
                link: string;
                description: string;
                text: string;
                id: string;
                openExternalLink(...args: unknown[]): unknown;
            }>;
            images: PartialArrayType<{
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
        localWorlds: PartialArrayType<{
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
        marketplacePassWorldTemplates: PartialArrayType<{
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
            activities: PartialArrayType<unknown>;
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
            achievements: PartialArrayType<unknown>;
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
        playerList: PartialArrayType<unknown>;
        isLoading: boolean;
        load(...args: unknown[]): unknown;
    };
    "vanilla.playermessagingservice": {
        data: { messages: PartialArrayType<unknown>; messageCount: number };
        status: number;
        reportClick(...args: unknown[]): unknown;
        reportDismiss(...args: unknown[]): unknown;
    };
    "vanilla.playerProfile": {
        playerProfiles: PartialArrayType<{
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
        reportReasonOptions: PartialArrayType<unknown>;
        reportAreaOptions: PartialArrayType<unknown>;
        reportableChatMessages: PartialArrayType<unknown>;
        selectedChatMessages: PartialArrayType<unknown>;
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
        data: PartialArrayType<unknown>;
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
        realms: PartialArrayType<{
            world: {
                onlinePlayers: PartialArrayType<unknown>;
                players: PartialArrayType<unknown>;
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
        realmSlots: PartialArrayType<unknown>;
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
        fetchRealmError: nul | numberl;
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
        players: PartialArrayType<unknown>;
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
        stories: PartialArrayType<unknown>;
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
        playerList: PartialArrayType<{
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
        playerList: PartialArrayType<{
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
        definitions: PartialArrayType<unknown>;
    };
    "vanilla.resourcePacks": {
        lastActivatedPackId: string;
        prompt: {
            actions: PartialArrayType<unknown>;
            body: string;
            title: string;
            active: boolean;
            id: string;
            handleAction(...args: unknown[]): unknown;
        };
        availableBehaviorPacks: PartialArrayType<{
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
        activeBehaviorPacks: PartialArrayType<unknown>;
        unownedTexturePacks: PartialArrayType<unknown>;
        realmsTexturePacks: PartialArrayType<{
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
        globalTexturePacks: PartialArrayType<unknown>;
        availableTexturePacks: PartialArrayType<{
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
        activeTexturePacks: PartialArrayType<unknown>;
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
        templates: PartialArrayType<{ image: string; seedValue: string; title: string }>;
        refresh(...args: unknown[]): unknown;
    };
    "vanilla.share": {
        isShareSupported: boolean;
        share(...args: unknown[]): unknown;
        shareFile(...args: unknown[]): unknown;
    };
    "vanilla.simulationDistanceOptions": {
        simulationDistanceOptions: PartialArrayType<number>;
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
        thirdPartyWorlds: PartialArrayType<{
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
        realms: PartialArrayType<unknown>;
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
            viewProfiles: { allowed: boolean; denyReasons: PartialArrayType<unknown> };
            addFriends: { allowed: boolean; denyReasons: PartialArrayType<unknown> };
            multiplayer: { allowed: boolean; denyReasons: PartialArrayType<unknown> };
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
            betaFeatures: PartialArrayType<{
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
            packTitles: PartialArrayType<unknown>;
            storageSpaceNeeded: string;
        };
        packDownloadStatus: number;
        packDownloadTaskState: number;
        packDownloadProgress: number;
        packDownloadName: string;
        packDownloadError: null;
        worldPacksData: {
            availableBehaviorPacks: PartialArrayType<unknown>;
            activeBehaviorPacks: PartialArrayType<unknown>;
            unownedTexturePacks: PartialArrayType<unknown>;
            realmsTexturePacks: PartialArrayType<unknown>;
            globalTexturePacks: PartialArrayType<unknown>;
            availableTexturePacks: PartialArrayType<unknown>;
            activeTexturePacks: PartialArrayType<unknown>;
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
        brokenPacksToStart: PartialArrayType<unknown>;
        missingPacksSize: string;
        missingPacksToStart: PartialArrayType<unknown>;
        missingTemplateToStart: string;
        hasMissingResources: boolean;
        startLocalWorldTaskState: number;
        startLocalWorldResult: null;
        startLocalWorld(...args: unknown[]): unknown;
        clearStartLocalWorldResult(...args: unknown[]): unknown;
    };
    "vanilla.worldTemplateList": {
        templates: PartialArrayType<unknown>;
        customTemplates: PartialArrayType<unknown>;
        premiumTemplates: PartialArrayType<unknown>;
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
        friendWorlds: PartialArrayType<{
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
