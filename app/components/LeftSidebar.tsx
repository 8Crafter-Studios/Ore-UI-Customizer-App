import type { JSX } from "preact";
import _React, { useEffect } from "preact/compat";
import type { CustomizerAppPage } from "../../src/utils/pageList.ts";
import { updateSelectedLeftSidebarButton } from "../app.tsx";

export interface LeftSidebarProps {
    tutorialMode?: boolean;
    tutorialButtonClickCallback?(buttonDataPathID: `${CustomizerAppPage}`): void;
}

export default function LeftSidebar(props: LeftSidebarProps): JSX.SpecificElement<"ul"> {
    useEffect((): void => {
        const route = router.getRouteForLocation();
        if (!route || !("data" in route) || !route.data.sidebarButtonID) return;
        updateSelectedLeftSidebarButton(route.data.sidebarButtonID);
    }, []);
    return (
        <div style="display: flex; flex-direction: column; height: 100vh; width: 48px; position: fixed; left: 0; top: 0;" id="left_sidebar">
            <div
                title="Home"
                class="sidebar_button nsel"
                data-path-id="home"
                onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                    if (event.currentTarget.hasAttribute("disabled")) return;
                    SoundEffects.popB();
                }}
                onClick={(): void => (props.tutorialMode ? props.tutorialButtonClickCallback?.("home") : router.history.push("/home"))}
            >
                <img
                    alt="Home"
                    src="resource://images/ui/glyphs/home.png"
                    class="nsel ndrg"
                    style="display: inline-block; vertical-align: middle; width: 30px; height: 27px;"
                />
            </div>
            <div
                title="Installations"
                class="sidebar_button nsel"
                data-path-id="installations"
                onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                    if (event.currentTarget.hasAttribute("disabled")) return;
                    SoundEffects.popB();
                }}
                onClick={(): void => (props.tutorialMode ? props.tutorialButtonClickCallback?.("installations") : router.history.push("/installations"))}
            >
                <img
                    alt="Installations"
                    src="resource://images/ui/glyphs/addServer.png"
                    class="nsel ndrg"
                    style="display: inline-block; vertical-align: middle; width: 34px; height: 26px;"
                />
            </div>
            <div
                title="Configs"
                class="sidebar_button nsel"
                data-path-id="configs"
                onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                    if (event.currentTarget.hasAttribute("disabled")) return;
                    SoundEffects.popB();
                }}
                onClick={(): void => (props.tutorialMode ? props.tutorialButtonClickCallback?.("configs") : router.history.push("/configs"))}
            >
                <img
                    alt="Configs"
                    src="resource://images/ui/glyphs/icon-settings.png"
                    class="nsel ndrg"
                    style="display: inline-block; vertical-align: middle; width: 36px; height: 36px;"
                />
            </div>
            <div
                title="Plugins"
                class="sidebar_button nsel"
                data-path-id="plugins"
                onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                    if (event.currentTarget.hasAttribute("disabled")) return;
                    SoundEffects.popB();
                }}
                onClick={(): void => (props.tutorialMode ? props.tutorialButtonClickCallback?.("plugins") : router.history.push("/plugins"))}
            >
                <img
                    alt="Plugins"
                    src="resource://images/ui/glyphs/add-ons_30x.png"
                    class="nsel ndrg"
                    style="display: inline-block; vertical-align: middle; width: 30px; height: 30px;"
                />
            </div>
            <div
                title="Themes"
                class="sidebar_button nsel"
                data-path-id="themes"
                onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                    if (event.currentTarget.hasAttribute("disabled")) return;
                    SoundEffects.popB();
                }}
                onClick={(): void => (props.tutorialMode ? props.tutorialButtonClickCallback?.("themes") : router.history.push("/themes"))}
            >
                <img
                    alt="Themes"
                    src="resource://images/ui/glyphs/brush.png"
                    class="nsel ndrg"
                    style="display: inline-block; vertical-align: middle; width: 36px; height: 36px;"
                />
            </div>
            <div
                title="Marketplace"
                class="sidebar_button nsel"
                data-path-id="marketplace"
                onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                    if (event.currentTarget.hasAttribute("disabled")) return;
                    SoundEffects.popB();
                }}
                onClick={(): void => (props.tutorialMode ? props.tutorialButtonClickCallback?.("marketplace") : router.history.push("/marketplace"))}
            >
                <img
                    alt="Marketplace"
                    src="resource://images/ui/glyphs/store_home_icon.png"
                    class="nsel ndrg"
                    style="display: inline-block; vertical-align: middle; width: 29px; height: 24.5384615385px;"
                />
            </div>
            <div
                title="Preferences"
                class="sidebar_button nsel"
                style="margin-top: auto;"
                data-path-id="preferences"
                onMouseDown={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                    if (event.currentTarget.hasAttribute("disabled")) return;
                    SoundEffects.popB();
                }}
                onClick={(): void => (props.tutorialMode ? props.tutorialButtonClickCallback?.("preferences") : router.history.push("/preferences"))}
            >
                <img alt="Preferences" src="resource://images/ui/glyphs/settings_glyph_2x.png" class="nsel ndrg" style="width: 30px; height: 30px;" />
            </div>
        </div>
    );
}
