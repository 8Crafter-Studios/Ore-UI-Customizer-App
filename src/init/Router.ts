import type { BrowserWindow } from "electron";
import { EventEmitter } from "node:events";
import { routes } from "../routes.json";
import type { RoutesJSON } from "../routes.json.d.ts";
import { Menu } from "@electron/remote";

namespace exports {
    type DefaultEventMap = [never];
    type Listener<K, T, F> = T extends DefaultEventMap ? F : K extends keyof T ? (T[K] extends unknown[] ? (...args: T[K]) => void : never) : never;
    type Listener1<K extends keyof T, T> = Listener<K, T, (...args: any[]) => void>;
    type EventMap<T> = Record<keyof T, any[]> | DefaultEventMap;
    type Key<K, T> = T extends DefaultEventMap ? string | symbol : K | keyof T;
    export interface RouterEventMap<Context extends any = null> {
        /**
         * Emitted when the router URL changes.
         */
        navigate: [RouterNavigateEvent<Context>];
        /**
         * Emitted when the router path changes.
         */
        pathChange: [RouterPathChangeEvent<Context>];
        /**
         * Emitted when the router query changes.
         */
        queryChange: [RouterQueryChangeEvent<Context>];
        /**
         * Emitted when the router hash changes.
         */
        hashChange: [RouterHashChangeEvent<Context>];
    }
    export interface RouterNavigateEvent<Context extends any = null> {
        readonly previousURL: string;
        readonly newURL: string;
        readonly router: Router<Context>;
        readonly history: RouterHistory<Context>;
        readonly location: RouterHistoryLocation<Context>;
    }
    export interface RouterPathChangeEvent<Context extends any = null> {
        readonly previousPath: string;
        readonly newPath: string;
        readonly router: Router<Context>;
        readonly history: RouterHistory<Context>;
        readonly location: RouterHistoryLocation<Context>;
    }
    export interface RouterQueryChangeEvent<Context extends any = null> {
        readonly previousQuery: string;
        readonly newQuery: string;
        readonly router: Router<Context>;
        readonly history: RouterHistory<Context>;
        readonly location: RouterHistoryLocation<Context>;
    }
    export interface RouterHashChangeEvent<Context extends any = null> {
        readonly previousHash: string;
        readonly newHash: string;
        readonly router: Router<Context>;
        readonly history: RouterHistory<Context>;
        readonly location: RouterHistoryLocation<Context>;
    }
    interface RouterSessionStorageData {
        history: ReturnType<RouterHistoryLocation["toJSON"]>[];
        location: ReturnType<RouterHistoryLocation["toJSON"]>;
        position: number;
    }
    export type RouteModes = RoutesJSON["routes"][number]["supportedRoutes"][number]["modes"][number][];
    export class Router<Context extends any = null> extends EventEmitter<RouterEventMap<Context>> {
        public readonly context: Context;
        public readonly history: RouterHistory<Context>;
        public readonly id: string;
        public readonly routes: RoutesJSON["routes"] = routes as RoutesJSON["routes"];
        public readonly defaultRoutePath: Router["routes"][0]["defaultRoute"] = this.routes[0].defaultRoute;
        public readonly defaultRoute: Router["routes"][number]["supportedRoutes"][number] = this.getRouteForLocation(this.defaultRoutePath);
        public constructor(id: string, options?: ConstructorParameters<typeof EventEmitter>[0], context: Context = null as Context) {
            super(options);
            this.id = id;
            this.context = context;
            this.history = new RouterHistory(this);
            // Do this manually instead of in the constructor to allow the other files to subscribe to the events first.
            // this.loadDataFromSessionStorage();
        }
        public getRouteForLocation<L extends RouterHistoryLocation<Context> | string = RouterHistoryLocation<Context>>(
            location?: L
        ): L extends Router["routes"][number]["defaultRoute"]
            ? Router["routes"][number]["supportedRoutes"][number]
            : Router["routes"][number]["supportedRoutes"][number] | undefined {
            location ??= this.history.location as L;
            for (const file of this.routes) {
                for (const supportedRoute of file.supportedRoutes) {
                    if (new RegExp(supportedRoute.regexp).test(typeof location === "string" ? location : location.pathname)) {
                        return supportedRoute as any;
                    }
                }
            }
            return undefined as L extends Router["routes"][number]["defaultRoute"]
                ? Router["routes"][number]["supportedRoutes"][number]
                : Router["routes"][number]["supportedRoutes"][number] | undefined;
        }
        public getParamsFromLocationAndRoute<
            L extends RouterHistoryLocation<Context> = typeof this.history.location,
            R extends Router["routes"][number]["supportedRoutes"][number] = Router["routes"][number]["supportedRoutes"][number]
        >(location?: L, route?: R): { [key in R["params"][number] as key["name"]]: key["optional"] extends true ? string | undefined : string } | undefined {
            location ??= this.history.location as L;
            route ??= this.getRouteForLocation(location) as R;
            if (route === undefined) return undefined;
            const params: string[] = location.pathname.match(new RegExp(route.regexp))?.slice(1) ?? [];
            if (route.params.some((v: (typeof route.params)[number], i: number): boolean => !v.optional && params[i] === undefined)) return undefined;
            return Object.fromEntries(
                route.params.map((v: (typeof route.params)[number], i: number): [typeof v.name, string | undefined] => [v.name, params[i]])
            ) as any;
        }
        public updateSessionStorage(): void {
            sessionStorage.setItem(
                `router-${this.id}`,
                JSON.stringify({
                    history: this.history.list.map(
                        (location: RouterHistoryLocation<Context>): ReturnType<RouterHistoryLocation["toJSON"]> => location.toJSON()
                    ),
                    location: this.history.location.toJSON(),
                    position: this.history.list.indexOf(this.history.location),
                } as RouterSessionStorageData)
            );
        }
        public loadDataFromSessionStorage(): void {
            const rawData: string | null = sessionStorage.getItem(`router-${this.id}`);
            if (rawData === null) return;
            const data: RouterSessionStorageData | null = JSON.parse(rawData);
            if (data === null) return;
            if (data.history.length === 0) return;
            this.history.list.splice(
                0,
                this.history.list.length,
                ...data.history.map(
                    (location: ReturnType<RouterHistoryLocation["toJSON"]>): RouterHistoryLocation<Context> =>
                        new RouterHistoryLocation(new URL(location.url), this.history)
                )
            );
            const newLocation: RouterHistoryLocation<Context> = this.history.list[data.position] ?? this.history.list.at(-1)!;
            const newURLInstance: URL = new URL(newLocation.url.href);
            const newURL: string = newURLInstance.href;
            if ((this.history.router.getRouteForLocation(newLocation)?.modes as RouteModes | undefined)?.includes("overlay")) {
                const newNonOverlayLocation: RouterHistoryLocation<Context> | undefined = this.history.list
                    .slice(0, data.position in this.history.list ? data.position : -1)
                    .findLast(
                        (location: RouterHistoryLocation<Context>): boolean =>
                            !(this.history.router.getRouteForLocation(location)?.modes as RouteModes | undefined)?.includes("overlay")
                    );
                if (newNonOverlayLocation) {
                    const previousURLInstance: URL = new URL(this.history.location.url.href);
                    const previousURL: string = previousURLInstance.href;
                    const newNonOverlayURLInstance: URL = new URL(newNonOverlayLocation.url.href);
                    this.history.location = newNonOverlayLocation;
                    this.emit("navigate", {
                        previousURL,
                        newURL: newNonOverlayLocation.url.href,
                        router: this,
                        history: this.history,
                        location: newNonOverlayLocation,
                    });
                    if (previousURLInstance.hash !== newNonOverlayURLInstance.hash) {
                        this.emit("hashChange", {
                            previousHash: previousURLInstance.hash,
                            newHash: newNonOverlayURLInstance.hash,
                            router: this,
                            history: this.history,
                            location: newNonOverlayLocation,
                        });
                    }
                    if (previousURLInstance.search !== newNonOverlayURLInstance.search) {
                        this.emit("queryChange", {
                            previousQuery: previousURLInstance.search,
                            newQuery: newNonOverlayURLInstance.search,
                            router: this,
                            history: this.history,
                            location: newNonOverlayLocation,
                        });
                    }
                    if (previousURLInstance.pathname !== newNonOverlayURLInstance.pathname) {
                        this.emit("pathChange", {
                            previousPath: previousURLInstance.pathname,
                            newPath: newNonOverlayURLInstance.pathname,
                            router: this,
                            history: this.history,
                            location: newNonOverlayLocation,
                        });
                    }
                }
            }
            const previousURLInstance: URL = new URL(this.history.location.url.href);
            const previousURL: string = previousURLInstance.href;
            this.history.location = newLocation;
            this.emit("navigate", {
                previousURL,
                newURL: newLocation.url.href,
                router: this,
                history: this.history,
                location: newLocation,
            });
            if (previousURLInstance.hash !== newURLInstance.hash) {
                this.emit("hashChange", {
                    previousHash: previousURLInstance.hash,
                    newHash: newURLInstance.hash,
                    router: this,
                    history: this.history,
                    location: newLocation,
                });
            }
            if (previousURLInstance.search !== newURLInstance.search) {
                this.emit("queryChange", {
                    previousQuery: previousURLInstance.search,
                    newQuery: newURLInstance.search,
                    router: this,
                    history: this.history,
                    location: newLocation,
                });
            }
            if (previousURLInstance.pathname !== newURLInstance.pathname) {
                this.emit("pathChange", {
                    previousPath: previousURLInstance.pathname,
                    newPath: newURLInstance.pathname,
                    router: this,
                    history: this.history,
                    location: newLocation,
                });
            }
        }
    }
    export class RouterHistory<Context extends any = null> {
        public static readonly ROUTER_BASE_URL: "app://router/" = "app://router/" as const;
        public readonly router: Router<Context>;
        public readonly list: RouterHistoryLocation<Context>[] = [];
        public location: RouterHistoryLocation<Context>;
        public constructor(router: Router<Context>) {
            this.router = router;
            this.list = [];
            this.location = new RouterHistoryLocation(new URL(router.routes[0].defaultRoute, RouterHistory.ROUTER_BASE_URL), this);
            this.list.push(this.location);
        }
        public replace(url: string): void {
            const previousURLInstance = new URL(this.location.url.href);
            const newURLInstance = new URL(url, RouterHistory.ROUTER_BASE_URL);
            if (this.location.url.href === url) return;
            const previousURL: string = this.location.url.href;
            const location = new RouterHistoryLocation(newURLInstance, this);
            this.list.splice(this.list.indexOf(this.location), this.list.length, location);
            this.location = location;
            this.router.emit("navigate", {
                previousURL,
                newURL: this.location.url.href,
                router: this.router,
                history: this.router.history,
                location: this.location,
            });
            if (previousURLInstance.hash !== newURLInstance.hash) {
                this.router.emit("hashChange", {
                    previousHash: previousURLInstance.hash,
                    newHash: newURLInstance.hash,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            }
            if (previousURLInstance.search !== newURLInstance.search) {
                this.router.emit("queryChange", {
                    previousQuery: previousURLInstance.search,
                    newQuery: newURLInstance.search,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            }
            if (previousURLInstance.pathname !== newURLInstance.pathname) {
                this.router.emit("pathChange", {
                    previousPath: previousURLInstance.pathname,
                    newPath: newURLInstance.pathname,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            }
            this.router.updateSessionStorage();
        }
        public push(url: string): void {
            const previousURLInstance = new URL(this.location.url.href);
            const newURLInstance = new URL(url, RouterHistory.ROUTER_BASE_URL);
            if (this.location.url.href === url) return;
            const previousURL: string = this.location.url.href;
            const location = new RouterHistoryLocation(newURLInstance, this);
            if (this.list.indexOf(this.location) !== -1) {
                this.list.splice(this.list.indexOf(this.location) + 1, this.list.length);
            }
            this.list.push(location);
            this.location = location;
            this.router.emit("navigate", {
                previousURL,
                newURL: this.location.url.href,
                router: this.router,
                history: this.router.history,
                location: this.location,
            });
            if (previousURLInstance.hash !== newURLInstance.hash) {
                this.router.emit("hashChange", {
                    previousHash: previousURLInstance.hash,
                    newHash: newURLInstance.hash,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            }
            if (previousURLInstance.search !== newURLInstance.search) {
                this.router.emit("queryChange", {
                    previousQuery: previousURLInstance.search,
                    newQuery: newURLInstance.search,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            }
            if (previousURLInstance.pathname !== newURLInstance.pathname) {
                this.router.emit("pathChange", {
                    previousPath: previousURLInstance.pathname,
                    newPath: newURLInstance.pathname,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            }
            this.router.updateSessionStorage();
        }
        public goBack(): void {
            if (this.list.length === 0) return;
            if (this.list.indexOf(this.location) < 1) return;
            const previousURL: string = this.location.url.href;
            const previousURLInstance: URL = new URL(previousURL);
            this.location = this.list[this.list.indexOf(this.location) - 1]!;
            const newURLInstance: URL = new URL(this.location.url.href);
            this.router.emit("navigate", {
                previousURL,
                newURL: this.location.url.href,
                router: this.router,
                history: this.router.history,
                location: this.location,
            });
            if (previousURLInstance.hash !== newURLInstance.hash) {
                this.router.emit("hashChange", {
                    previousHash: previousURLInstance.hash,
                    newHash: newURLInstance.hash,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            }
            if (previousURLInstance.search !== newURLInstance.search) {
                this.router.emit("queryChange", {
                    previousQuery: previousURLInstance.search,
                    newQuery: newURLInstance.search,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            }
            if (previousURLInstance.pathname !== newURLInstance.pathname) {
                this.router.emit("pathChange", {
                    previousPath: previousURLInstance.pathname,
                    newPath: newURLInstance.pathname,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            }
            this.router.updateSessionStorage();
        }
        public goForward(): void {
            if (this.list.length === 0) return;
            if (this.list.indexOf(this.location) < 0) return;
            if (this.list.indexOf(this.location) >= this.list.length - 1) return;
            const previousURL: string = this.location.url.href;
            const previousURLInstance: URL = new URL(previousURL);
            this.location = this.list[this.list.indexOf(this.location) + 1]!;
            const newURLInstance: URL = new URL(this.location.url.href);
            this.router.emit("navigate", {
                previousURL,
                newURL: this.location.url.href,
                router: this.router,
                history: this.router.history,
                location: this.location,
            });
            if (previousURLInstance.hash !== newURLInstance.hash) {
                this.router.emit("hashChange", {
                    previousHash: previousURLInstance.hash,
                    newHash: newURLInstance.hash,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            }
            if (previousURLInstance.search !== newURLInstance.search) {
                this.router.emit("queryChange", {
                    previousQuery: previousURLInstance.search,
                    newQuery: newURLInstance.search,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            }
            if (previousURLInstance.pathname !== newURLInstance.pathname) {
                this.router.emit("pathChange", {
                    previousPath: previousURLInstance.pathname,
                    newPath: newURLInstance.pathname,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            }
            this.router.updateSessionStorage();
        }
        public go(distance: number): void {
            const newPosition: number = this.list.indexOf(this.location) + distance;
            this.goToPosition(newPosition);
        }
        public goToPosition(position: number): void {
            if (this.list.length === 0) return;
            const previousURL: string = this.location.url.href;
            const newPosition: number = Math.max(Math.min(this.list.length - 1, position), 0);
            this.location = this.list[newPosition]!;
            const newURLInstance: URL = new URL(this.location.url.href);
            if (previousURL !== this.location.url.href) {
                this.router.emit("navigate", {
                    previousURL,
                    newURL: this.location.url.href,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
            } else {
                if (this.location.url.hash !== newURLInstance.hash) {
                    this.router.emit("hashChange", {
                        previousHash: this.location.url.hash,
                        newHash: newURLInstance.hash,
                        router: this.router,
                        history: this.router.history,
                        location: this.location,
                    });
                }
                if (this.location.url.search !== newURLInstance.search) {
                    this.router.emit("queryChange", {
                        previousQuery: this.location.url.search,
                        newQuery: newURLInstance.search,
                        router: this.router,
                        history: this.router.history,
                        location: this.location,
                    });
                }
                if (this.location.url.pathname !== newURLInstance.pathname) {
                    this.router.emit("pathChange", {
                        previousPath: this.location.url.pathname,
                        newPath: newURLInstance.pathname,
                        router: this.router,
                        history: this.router.history,
                        location: this.location,
                    });
                }
            }
            this.router.updateSessionStorage();
        }
    }
    export class RouterHistoryLocation<Context extends any = null> {
        public readonly url: URL;
        public readonly history: RouterHistory<Context>;
        public readonly router: Router<Context>;
        public constructor(url: URL, history: RouterHistory<Context>) {
            this.url = url;
            this.router = history.router;
            this.history = history;
        }
        public get hash(): string {
            return this.url.hash;
        }
        public set hash(hash: string) {
            const previousURLInstance: URL = new URL(this.url.href);
            this.url.hash = hash;
            if (this.history.location === this) {
                this.router.emit("navigate", {
                    previousURL: previousURLInstance.href,
                    newURL: this.url.href,
                    router: this.router,
                    history: this.router.history,
                    location: this,
                });
                this.router.emit("hashChange", {
                    previousHash: previousURLInstance.hash,
                    newHash: hash,
                    router: this.router,
                    history: this.router.history,
                    location: this,
                });
                this.router.updateSessionStorage();
            }
        }
        public get search(): string {
            return this.url.search;
        }
        public set search(search: string) {
            const previousURLInstance: URL = new URL(this.url.href);
            this.url.search = search;
            if (this.history.location === this) {
                this.router.emit("navigate", {
                    previousURL: previousURLInstance.href,
                    newURL: this.url.href,
                    router: this.router,
                    history: this.router.history,
                    location: this,
                });
                this.router.emit("queryChange", {
                    previousQuery: previousURLInstance.search,
                    newQuery: search,
                    router: this.router,
                    history: this.router.history,
                    location: this,
                });
                this.router.updateSessionStorage();
            }
        }
        public get pathname(): string {
            return this.url.pathname;
        }
        public set pathname(pathname: string) {
            const previousURLInstance: URL = new URL(this.url.href);
            this.url.pathname = pathname;
            if (this.history.location === this) {
                this.router.emit("navigate", {
                    previousURL: previousURLInstance.href,
                    newURL: this.url.href,
                    router: this.router,
                    history: this.router.history,
                    location: this,
                });
                this.router.emit("pathChange", {
                    previousPath: previousURLInstance.pathname,
                    newPath: pathname,
                    router: this.router,
                    history: this.router.history,
                    location: this,
                });
                this.router.updateSessionStorage();
            }
        }
        public get searchParams(): RouterHistoryLocationSearchParams<Context> {
            return new RouterHistoryLocationSearchParams(this);
        }
        public toJSON(): Pick<RouterHistoryLocation<Context>, "hash" | "search" | "pathname"> & {
            [key in keyof Pick<RouterHistoryLocation<Context>, "url">]: string;
        } {
            return {
                hash: this.hash,
                search: this.search,
                pathname: this.pathname,
                url: this.url.href,
            };
        }
    }
    export class RouterHistoryLocationSearchParams<Context extends any = null> implements URLSearchParams {
        [Symbol.iterator](): URLSearchParamsIterator<[string, string]> {
            return this.url.searchParams[Symbol.iterator]();
        }
        public readonly url: URL;
        public readonly location: RouterHistoryLocation<Context>;
        public readonly history: RouterHistory<Context>;
        public readonly router: Router<Context>;
        public constructor(location: RouterHistoryLocation<Context>) {
            this.url = location.url;
            this.location = location;
            this.history = location.history;
            this.router = location.router;
        }
        public get size(): number {
            return this.url.searchParams.size;
        }
        public append(name: string, value: string): void {
            const previousURLInstance: URL = new URL(this.location.url.href);
            const result: void = this.url.searchParams.append(name, value);
            this.location.url.search = this.toString();
            const newURLInstance: URL = new URL(this.location.url.href);
            if (previousURLInstance.search !== newURLInstance.search && this.history.location === this.location) {
                this.router.emit("navigate", {
                    previousURL: previousURLInstance.href,
                    newURL: newURLInstance.href,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
                this.router.emit("queryChange", {
                    previousQuery: previousURLInstance.search,
                    newQuery: newURLInstance.search,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
                this.router.updateSessionStorage();
            }
            return result;
        }
        public delete(name: string, value?: string): void {
            const previousURLInstance: URL = new URL(this.location.url.href);
            const result: void = this.url.searchParams.delete(name, value);
            this.location.url.search = this.toString();
            const newURLInstance: URL = new URL(this.location.url.href);
            if (previousURLInstance.search !== newURLInstance.search && this.history.location === this.location) {
                this.router.emit("navigate", {
                    previousURL: previousURLInstance.href,
                    newURL: newURLInstance.href,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
                this.router.emit("queryChange", {
                    previousQuery: previousURLInstance.search,
                    newQuery: newURLInstance.search,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
                this.router.updateSessionStorage();
            }
            return result;
        }
        public entries(): URLSearchParamsIterator<[string, string]> {
            return this.url.searchParams.entries();
        }
        public forEach(callbackfn: (value: string, key: string, parent: URLSearchParams) => void, thisArg?: any): void {
            return this.url.searchParams.forEach(callbackfn, thisArg);
        }
        public get(name: string): string | null {
            return this.url.searchParams.get(name);
        }
        public has(name: string): boolean {
            return this.url.searchParams.has(name);
        }
        public keys(): URLSearchParamsIterator<string> {
            return this.url.searchParams.keys();
        }
        public values(): URLSearchParamsIterator<string> {
            return this.url.searchParams.values();
        }
        public getAll(name: string): string[] {
            return this.url.searchParams.getAll(name);
        }
        public set(name: string, value: string): void {
            const previousURLInstance: URL = new URL(this.location.url.href);
            const result: void = this.url.searchParams.set(name, value);
            this.location.url.search = this.toString();
            const newURLInstance: URL = new URL(this.location.url.href);
            if (previousURLInstance.search !== newURLInstance.search && this.history.location === this.location) {
                this.router.emit("navigate", {
                    previousURL: previousURLInstance.href,
                    newURL: newURLInstance.href,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
                this.router.emit("queryChange", {
                    previousQuery: previousURLInstance.search,
                    newQuery: newURLInstance.search,
                    router: this.router,
                    history: this.router.history,
                    location: this.location,
                });
                this.router.updateSessionStorage();
            }
            return result;
        }
        public sort(): void {
            return this.url.searchParams.sort();
        }
        public toString(): string {
            return this.url.searchParams.toString();
        }
    }
    Router.setMaxListeners(1000000);
    const currentWindow: BrowserWindow = getCurrentWindow();
    export const router = new Router(`window-${currentWindow.id}`, undefined, currentWindow);
    // router.
    export function updateBackAndForwardMenuBarButtons(): void {
        if (router.history.location !== router.history.list.at(-1)) {
            try {
                currentMenu!.items[3]!.submenu!.items[1]!.enabled = true;
            } catch {}
        } else {
            try {
                currentMenu!.items[3]!.submenu!.items[1]!.enabled = false;
            } catch {}
        }
        if (router.history.location !== router.history.list.at(0)) {
            try {
                currentMenu!.items[3]!.submenu!.items[0]!.enabled = true;
            } catch {}
        } else {
            try {
                currentMenu!.items[3]!.submenu!.items[0]!.enabled = false;
            } catch {}
        }
    }
}

Object.defineProperties(globalThis, {
    Router: {
        value: exports.Router,
        configurable: true,
        enumerable: true,
        writable: false,
    },
    RouterHistory: {
        value: exports.RouterHistory,
        configurable: true,
        enumerable: true,
        writable: false,
    },
    RouterHistoryLocation: {
        value: exports.RouterHistoryLocation,
        configurable: true,
        enumerable: true,
        writable: false,
    },
    RouterHistoryLocationSearchParams: {
        value: exports.RouterHistoryLocationSearchParams,
        configurable: true,
        enumerable: true,
        writable: false,
    },
    router: {
        value: exports.router,
        configurable: true,
        enumerable: true,
        writable: false,
    },
    updateBackAndForwardMenuBarButtons: {
        value: exports.updateBackAndForwardMenuBarButtons,
        configurable: true,
        enumerable: true,
        writable: false,
    },
});

declare global {
    export import RouteModes = exports.RouteModes;
    export import RouterEventMap = exports.RouterEventMap;
    export import RouterNavigateEvent = exports.RouterNavigateEvent;
    export import RouterPathChangeEvent = exports.RouterPathChangeEvent;
    export import RouterQueryChangeEvent = exports.RouterQueryChangeEvent;
    export import RouterHashChangeEvent = exports.RouterHashChangeEvent;
    export import Router = exports.Router;
    export import RouterHistory = exports.RouterHistory;
    export import RouterHistoryLocation = exports.RouterHistoryLocation;
    export import RouterHistoryLocationSearchParams = exports.RouterHistoryLocationSearchParams;
    export import router = exports.router;
    export import updateBackAndForwardMenuBarButtons = exports.updateBackAndForwardMenuBarButtons;
}

/*
class Router extends EventEmitter<RouterEventMap> {
    #eventListeners: { [key in keyof RouterEventMap]?: { once: boolean; listener: Listener1<key, RouterEventMap> }[] } = {};
    public constructor() {
        super();
    }
    public addListener<K extends keyof RouterEventMap>(eventName: Key<K, RouterEventMap>, listener: Listener1<K, RouterEventMap>): this {
        return this.on(eventName, listener);
    }
    public on<K extends keyof RouterEventMap>(eventName: Key<K, RouterEventMap>, listener: Listener1<K, RouterEventMap>): this {
        this.#eventListeners[eventName] ??= [];
        this.#eventListeners[eventName].push({ once: false, listener });
        return undefined!;
    }
    public once<K extends keyof RouterEventMap>(eventName: Key<K, RouterEventMap>, listener: Listener1<K, RouterEventMap>): this {
        this.#eventListeners[eventName] ??= [];
        this.#eventListeners[eventName].push({ once: true, listener });
        return undefined!;
    }
    public emit<K extends keyof RouterEventMap>(eventName: K, ...args: RouterEventMap[K]): boolean {
        if (!this.#eventListeners[eventName] || this.#eventListeners[eventName].length === 0) {
            return false;
        }
        for (const listener of this.#eventListeners[eventName]!) {
            (listener.listener as (...args: RouterEventMap[K]) => void)(...args);
            if (listener.once) {
                this.#eventListeners[eventName]!.splice(this.#eventListeners[eventName]!.indexOf(listener), 1);
            }
        }
        return true;
    }
    public eventNames(): (keyof RouterEventMap)[] {
        return Object.keys(this.#eventListeners) as (keyof RouterEventMap)[];
    }
}
*/

router.on("navigate", updateBackAndForwardMenuBarButtons);

updateBackAndForwardMenuBarButtons();

// getCurrentWindow().webContents.on("dom-ready", updateBackAndForwardMenuBarButtons);
