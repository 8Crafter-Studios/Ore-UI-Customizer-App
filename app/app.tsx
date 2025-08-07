import type { JSX, RefObject } from "preact";
import React, { hydrate, render, useEffect } from "preact/compat";
import HomePage from "./pages/home";
import LeftSidebar from "./components/LeftSidebar";
import { CustomizerAppPage } from "../src/utils/pageList";
import MarketplacePage from "./pages/marketplace";
import InstallationsPage from "./pages/installations";
import PreferencesPage from "./pages/preferences";
import ConfigsPage from "./pages/configs";
import ThemesPage from "./pages/themes";
import PluginsPage from "./pages/plugins";
import PluginDetailsOverlayPage from "./overlay_pages/PluginDetailsOverlayPage";
import TutorialPage from "./pages/tutorial";
import ConfigEditorPage from "./pages/configEditor";
import ConfigDetailsOverlayPage from "./overlay_pages/ConfigDetailsOverlayPage";

let lastRoute: Router["routes"][number]["supportedRoutes"][number] | null = router.getRouteForLocation()!;

let lastNonOverlayRoute: Router["routes"][number]["supportedRoutes"][number] | null = lastRoute;

const overlayPagesLinkedRouterHistoryLocationMap: Map<RefObject<HTMLDivElement>, RouterHistoryLocation<Electron.CrossProcessExports.BrowserWindow>> = new Map();

export default function App(): JSX.Element {
    return (
        <>
            <div id="app-contents">
                <AppContents />
            </div>
            <div id="page-overlay-container" style="display: contents;" />
            {/* This svg is used to completely disable anti-aliasing on fonts. */}
            <svg class="offscreen" width="0" height="0" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="crispify">
                        <feComponentTransfer>
                            <feFuncA type="discrete" tableValues="0 1" />
                        </feComponentTransfer>
                    </filter>
                </defs>
            </svg>
        </>
    );
}

export function AppContents(): JSX.Element {
    const page: string = getAppContentPathID();
    switch (page) {
        case "main":
            return <App_LeftSidebarPage />;
        case "unknown":
            return <App_MiscPage />;
        default:
            return <></>;
    }
}

export function App_LeftSidebarPage(): JSX.Element {
    return (
        <>
            <LeftSidebar />
            <main style="width: calc(100vw - 48px); height: 100vh; position: fixed; top: 0; left: 48px; overflow: auto;" id="main">
                <MainPageContents />
            </main>
        </>
    );
}

export function App_MiscPage(): JSX.Element {
    return (
        <>
            <main style="width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; overflow: auto;" id="main">
                <MainPageContents />
            </main>
        </>
    );
}

export interface App_OverlayPageProps {
    children?: any;
    routerHistoryLocation: RouterHistoryLocation<Electron.CrossProcessExports.BrowserWindow>;
}

export function App_OverlayPage(props: App_OverlayPageProps): JSX.Element {
    const overlayPageRef: RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);
    overlayPagesLinkedRouterHistoryLocationMap.set(overlayPageRef, props.routerHistoryLocation);
    useEffect((): (() => void) => {
        return (): void => {
            if (router.history.list.includes(props.routerHistoryLocation)) return;
            overlayPagesLinkedRouterHistoryLocationMap.delete(overlayPageRef);
        };
    });
    return (
        <div
            class="page-overlay"
            style="width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; z-index: 1000001; align-contents: center; text-align: center;"
            ref={overlayPageRef}
        >
            {props.children ?? <OverlayPageContents routerHistoryLocation={props.routerHistoryLocation} />}
        </div>
    );
}

export interface OverlayPageContentsProps {
    routerHistoryLocation: RouterHistoryLocation<Electron.CrossProcessExports.BrowserWindow>;
}

export function OverlayPageContents(props: OverlayPageContentsProps): JSX.Element {
    const route = router.getRouteForLocation(props.routerHistoryLocation);
    switch (route?.route) {
        case "/config-details":
            return <ConfigDetailsOverlayPage filePath={props.routerHistoryLocation.searchParams.get("filePath")!} />;
        case "/plugin-details":
            return <PluginDetailsOverlayPage folderPath={props.routerHistoryLocation.searchParams.get("folderPath")!} />;
        case "/theme-details":
            return <>The theme details page is not implemented yet.</>;
        default:
            return <>Unknown Overlay Page: {props.routerHistoryLocation.pathname}</>;
    }
}

export function getAppContentPathID(route: Router["routes"][number]["supportedRoutes"][number] | null = lastRoute): "main" | "overlay" | "unknown" {
    /* 
    const searchParams: URLSearchParams = router.history.location.searchParams;
    const page: [LooseAutocomplete<`${CustomizerAppPage}`>?, ...LooseAutocomplete<`${CustomizerAppPage}`>[]] = Array.from(
        router.history.location.pathname.matchAll(/\/([^\/]+)/g)
    ).map((match: RegExpExecArray): string | undefined => match[1] ?? "") as [
        LooseAutocomplete<`${CustomizerAppPage}`>?,
        ...LooseAutocomplete<`${CustomizerAppPage}`>[]
    ]; */
    if (route?.modes && (route.modes as (typeof route.modes)[number][]).includes("overlay")) return "overlay";
    switch (route?.route) {
        case undefined:
        case "/home":
        case "/installations":
        case "/marketplace":
        case "/preferences":
        case "/config-editor":
        case "/theme-editor":
        case "/plugins":
        case "/themes":
        case "/configs":
            return "main";
        default:
            return "unknown";
    }
}

export function updateOverlayPages(): void {
    // console.log(overlayPagesLinkedRouterHistoryLocationMap);
    for (const [overlayPageRef, overlayPageRouterHistoryLocation] of overlayPagesLinkedRouterHistoryLocationMap) {
        // console.log(overlayPageRef, overlayPageRouterHistoryLocation);
        if (!router.history.list.includes(overlayPageRouterHistoryLocation)) {
            // console.log("removing overlay page");
            overlayPageRef.current!.remove();
        } else if (router.history.list.indexOf(overlayPageRouterHistoryLocation) > router.history.list.indexOf(router.history.location)) {
            // console.log("hiding overlay page");
            overlayPageRef.current!.style.display = "none";
        } else {
            // console.log("showing overlay page");
            overlayPageRef.current!.style.display = "block";
        }
    }
}

export function MainPageContents(): JSX.Element {
    updateSelectedLeftSidebarButton();
    /* const searchParams: URLSearchParams = router.history.location.searchParams;
    const page: [LooseAutocomplete<`${CustomizerAppPage}`>?, ...LooseAutocomplete<`${CustomizerAppPage}`>[]] = Array.from(
        router.history.location.pathname.matchAll(/\/([^\/]+)/g)
    ).map((match: RegExpExecArray): string | undefined => match[1] ?? "") as [
        LooseAutocomplete<`${CustomizerAppPage}`>?,
        ...LooseAutocomplete<`${CustomizerAppPage}`>[]
    ]; */
    switch (lastRoute?.route) {
        case undefined:
        case "/home":
            return <HomePage />;
        case "/installations":
            return <InstallationsPage />;
        case "/preferences":
            return <PreferencesPage />;
        case "/marketplace":
            return <MarketplacePage />;
        case "/plugins":
            return <PluginsPage />;
        case "/configs":
            return <ConfigsPage />;
        case "/themes":
            return <ThemesPage />;
        case "/config-editor":
            return <ConfigEditorPage />;
        case "/theme-editor":
            return (
                <center>
                    <h1>Coming Soon!</h1>
                    <p>The theme editor is under construction.</p>
                </center>
            );
        case "/tutorial":
            return <TutorialPage routerHistoryLocation={router.history.location} />;
        default:
            return <>Unknown Page: {router.history.location.pathname}</>;
    }
}

export function reloadMainPageContents(): void {
    const targetElement: HTMLElement | null = document.getElementById("main");
    if (!targetElement) {
        throw new Error("No target element found.");
    }
    targetElement.replaceChildren();
    hydrate(<MainPageContents />, targetElement);
}

export function reloadAppContents(): void {
    const targetElement: HTMLElement | null = document.getElementById("app-contents");
    if (!targetElement) {
        throw new Error("No target element found.");
    }
    targetElement.replaceChildren();
    hydrate(<AppContents />, targetElement);
}

/**
 * Get the ID of the main page content, this is used to test if the main page content should be reloaded, if the main page content ID changes then the main page content should be reloaded.
 *
 * @returns The ID of the main page content.
 */
export function getMainPageContentPathID(): string {
    const searchParams: URLSearchParams = router.history.location.searchParams;
    const page: [LooseAutocomplete<`${CustomizerAppPage}`>?, ...LooseAutocomplete<`${CustomizerAppPage}`>[]] = Array.from(
        router.history.location.pathname.matchAll(/\/([^\/]+)/g)
    ).map((match: RegExpExecArray): string | undefined => match[1] ?? "") as [
        LooseAutocomplete<`${CustomizerAppPage}`>?,
        ...LooseAutocomplete<`${CustomizerAppPage}`>[]
    ];
    switch (true) {
        case page[0] === undefined:
        case page[0] === CustomizerAppPage.Home:
            return "home";
        case page[0] === CustomizerAppPage.Installations:
            return "installations";
        case page[0] === CustomizerAppPage.Preferences:
            return "preferences";
        case page[0] === CustomizerAppPage.Marketplace:
            return "marketplace";
        case page[0] === CustomizerAppPage.Plugins:
            return "plugins";
        case page[0] === CustomizerAppPage.Configs:
            return "configs";
        case page[0] === CustomizerAppPage.Themes:
            return "themes";
        case page[0] === CustomizerAppPage.ConfigDetails:
            return "config-details";
        case page[0] === CustomizerAppPage.ThemeDetails:
            return "theme-details";
        case page[0] === CustomizerAppPage.PluginDetails:
            return "plugin-details";
        case page[0] === CustomizerAppPage.ConfigEditor:
            return "config-editor";
        case page[0] === CustomizerAppPage.ThemeEditor:
            return "theme-editor";
        default:
            return "unknown";
    }
}

export function updateSelectedLeftSidebarButton(mainPageContentID?: string): void {
    mainPageContentID ??= lastRoute ? ("data" in lastRoute ? lastRoute.data.sidebarButtonID : "unknown") : "unknown";
    document
        .getElementById("left_sidebar")
        ?.querySelectorAll(".sidebar_button")
        .forEach((button: Element): void => {
            if (!(button instanceof HTMLDivElement)) return;
            if (button.getAttribute("data-path-id") === mainPageContentID) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });
}

router.on("pathChange", function handleNavigateForMainPageContentChanges(event: RouterPathChangeEvent<Electron.CrossProcessExports.BrowserWindow>): void {
    const currentRoute: Router["routes"][number]["supportedRoutes"][number] | null = router.getRouteForLocation() ?? null;
    const startingLastRoute = lastRoute;
    if (currentRoute !== lastRoute) {
        updateOverlayPages();
        let appContentPathIDChanged: boolean = getAppContentPathID(lastRoute) !== getAppContentPathID(currentRoute);
        // const lastRouteAppContentsPathID: "main" | "overlay" | "unknown" = getAppContentPathID();
        // console.log(lastRoute, lastNonOverlayRoute, currentRoute, appContentPathIDChanged, lastRoute === lastNonOverlayRoute, lastRoute === currentRoute, lastNonOverlayRoute === currentRoute);
        lastRoute = currentRoute;
        // console.log(currentRoute, currentRoute?.modes);
        if (!(currentRoute?.modes as NonNullable<typeof currentRoute>["modes"][number][] | undefined)?.includes("overlay")) {
            if (
                !(startingLastRoute?.modes as NonNullable<typeof currentRoute>["modes"][number][] | undefined)?.includes("overlay") ||
                lastNonOverlayRoute !== currentRoute
            ) {
                lastNonOverlayRoute = currentRoute;
                if (appContentPathIDChanged) {
                    reloadAppContents();
                } else {
                    reloadMainPageContents();
                }
            }
        } else {
            let alreadyLoaded: boolean = false;
            for (const route of overlayPagesLinkedRouterHistoryLocationMap.values()) {
                if (route === event.location) {
                    alreadyLoaded = true;
                    break;
                }
            }
            // console.log(6, alreadyLoaded);
            if (!alreadyLoaded) {
                let element: HTMLDivElement = document.createElement("div");
                render(
                    [
                        // ...([] as undefined[]).fill(undefined, 0, document.getElementById("page-overlay-container")!.childElementCount),
                        <App_OverlayPage routerHistoryLocation={event.location} />,
                    ],
                    element
                );
                document.getElementById("page-overlay-container")!.appendChild(element);
            }
        }
    }
    if (currentRoute && "data" in currentRoute && currentRoute.data.sidebarButtonID) {
        updateSelectedLeftSidebarButton(currentRoute.data.sidebarButtonID);
    }
});

export function updateGUIScale(): void {
    const GUIScale: number = config.actualGUIScale;
    /**
     * The CSS style rule that contains the GUI scale variable.
     */
    const rule: CSSStyleRule = document.styleSheets[0]?.cssRules.item(
        Object.values(document.styleSheets[0].cssRules).findIndex(
            (r: CSSRule): boolean => (r as CSSStyleRule)?.selectorText === ":root" && r.cssText.includes("--gui-scale:")
        )
    ) as CSSStyleRule;
    rule.style.cssText = rule.style.cssText.replace(/(?<=--gui-scale: )\d+(?:\.\d+)?(?=;)/, GUIScale.toString());
    window.dispatchEvent(new CustomEvent("GUIScaleChange", { detail: { newGUIScale: GUIScale } }));
}

window.addEventListener("resize", updateGUIScale);

window.addEventListener("load", updateGUIScale);

config.on("settingChanged", (...[key]: ConfigEventMap["settingChanged"]): void => {
    if (key === "GUIScale") {
        updateGUIScale();
    }
});

declare global {
    interface WindowEventMap {
        GUIScaleChange: CustomEvent<{ newGUIScale: number }>;
    }
}
