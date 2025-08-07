import type { JSX, RefObject } from "preact";
import _React, { hydrate, useRef } from "preact/compat";
import LeftSidebar from "../components/LeftSidebar";
import type { CustomizerAppPage } from "../../src/utils/pageList";

export interface TutorialPageProps {
    routerHistoryLocation: RouterHistoryLocation<Electron.CrossProcessExports.BrowserWindow>;
}

export default function TutorialPage(props: TutorialPageProps): JSX.SpecificElement<"center"> {
    const tutorialContainerRef: RefObject<HTMLDivElement> = useRef(null);
    function handleTutorialProgress(): void {
        if (tutorialContainerRef.current) {
            tutorialContainerRef.current.replaceChildren();
            hydrate(<TutorialPageContents {...props} handleTutorialProgress={handleTutorialProgress} />, tutorialContainerRef.current);
        }
    }
    return (
        <div
            style={{ width: "100vw", height: "100vh" }}
            ref={tutorialContainerRef}
            onScroll={(_event: JSX.TargetedUIEvent<HTMLDivElement>): void => {
                // TO-DO (Low Priority)
            }}
        >
            <TutorialPageContents {...props} handleTutorialProgress={handleTutorialProgress} />
        </div>
    );
}

export interface TutorialPageContentsProps extends TutorialPageProps {
    handleTutorialProgress(): void;
}

export function TutorialPageContents(props: TutorialPageContentsProps): JSX.Element {
    switch (props.routerHistoryLocation.searchParams.get("page") ?? "main") {
        case "home":
        case "main":
            return <TutorialPage_Main {...props} />;
        default:
            return <TutorialPage_404 {...props} />;
    }
}

export function TutorialPage_404(props: TutorialPageContentsProps): JSX.Element {
    return (
        <center>
            <h1>404</h1>
            <p>Unknown tutorial page: {props.routerHistoryLocation.searchParams.get("page")}</p>
            <button
                type="button"
                class="btn"
                onMouseDown={(): void => {
                    SoundEffects.popB();
                }}
                onClick={(): void => {
                    props.routerHistoryLocation.searchParams.delete("page");
                    props.handleTutorialProgress();
                }}
            >
                Go back to main tutorial page
            </button>
        </center>
    );
}

export function TutorialPage_Main(props: TutorialPageContentsProps): JSX.Element {
    return (
        <>
            <LeftSidebar
                tutorialMode
                tutorialButtonClickCallback={(buttonDataPathID: `${CustomizerAppPage}`): void => {
                    props.routerHistoryLocation.searchParams.set("page", buttonDataPathID);
                    props.handleTutorialProgress();
                }}
            />
            <center>
                <h1>Tutorial</h1>
            </center>
        </>
    );
}
