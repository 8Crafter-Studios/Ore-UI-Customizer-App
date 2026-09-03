import type { JSX, RefObject } from "preact";
import _React, { render, useEffect, useRef } from "preact/compat";
import { getConnectionStatus } from "../../src/utils/connectionUtils";
import { shell } from "@electron/remote";
import { lookup } from "node:dns/promises";
import type { LookupAddress } from "node:dns";

export default function MarketplacePage(): JSX.SpecificElement<"center"> {
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    let online: boolean = navigator.onLine;
    useEffect((): void => {
        if (online) {
            getConnectionStatus().then((isConnected: boolean): void => {
                if (!containerRef.current) return;
                if (isConnected) {
                    lookup("marketplace.ore-ui-customizer.8crafter.com").then(
                        (): void => {
                            if (!containerRef.current) return;
                            fetch("https://marketplace.ore-ui-customizer.8crafter.com/api/status").then(
                                async (response: Response): Promise<void> => {
                                    if (!containerRef.current) return;
                                    if (response.status !== 200 || (await response.text()) !== "operational") {
                                        if (!containerRef.current) return;
                                        containerRef.current.replaceChildren();
                                        render(<MarketplacePage_ServerOffline />, containerRef.current);
                                    } else {
                                        containerRef.current.replaceChildren();
                                        render(<MarketplacePage_Online />, containerRef.current);
                                    }
                                },
                                (reason: any): void => {
                                    if (!containerRef.current) return;
                                    containerRef.current.replaceChildren();
                                    if (reason instanceof TypeError && reason.message === "Failed to fetch") {
                                        render(<MarketplacePage_ServerOffline />, containerRef.current);
                                    } else {
                                        render(<MarketplacePage_ServerStatusCheckError error={reason} />, containerRef.current);
                                    }
                                }
                            );
                        },
                        (): void => {
                            if (!containerRef.current) return;
                            containerRef.current.replaceChildren();
                            render(<MarketplacePage_NoServerDNSRecord />, containerRef.current);
                        }
                    );
                } else {
                    containerRef.current.replaceChildren();
                    render(<MarketplacePage_Offline />, containerRef.current);
                }
            });
        }
    });
    return (
        <div style={{ display: "contents" }} ref={containerRef}>
            {online ?
                <MarketplacePage_Loading />
            :   <MarketplacePage_Offline />}
        </div>
    ); //<MarketplacePage_Loading />;
}

export function MarketplacePage_Loading(): JSX.SpecificElement<"center"> {
    return (
        <center>
            <h1>Loading...</h1>
            <img class="nsel ndrg" aria-hidden="true" src="resource://images/ui/misc/loading_bar.gif" />
        </center>
    );
}

export function MarketplacePage_NoServerDNSRecord(): JSX.SpecificElement<"center"> {
    return (
        <center>
            <h1>Coming soon!</h1>
            <p>The marketplace is currently under construction.</p>
        </center>
    );
}

export function MarketplacePage_Online(): JSX.SpecificElement<"center"> {
    return (
        // <center>
        //     <h1>Coming soon!</h1>
        //     <p>The marketplace is currently under construction.</p>
        // </center>
        <center
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255, 0, 0, 0.5)",
            }}
        >
            <h1>Not Implemented</h1>
            <p>Something went wrong</p>
            <img class="piximg ndrg nsel" aria-hidden="true" src="resource://images/ui/art/connection_error.png" style={{ zoom: "var(--gui-scale)" }} />
            <p>
                The marketplace UI is not implemented in this version of the app, even though the marketplace server is online, please try updating to a newer
                version.
            </p>
        </center>
    );
}

export function MarketplacePage_Offline(): JSX.SpecificElement<"center"> {
    return (
        <center
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255, 0, 0, 0.5)",
            }}
        >
            <h1>Offline</h1>
            <p>You're offline</p>
            <img class="piximg ndrg nsel" aria-hidden="true" src="resource://images/ui/art/connection_error.png" style={{ zoom: "var(--gui-scale)" }} />
            <p>Please check your internet connection to access the marketplace.</p>
        </center>
    );
}

export function MarketplacePage_ServerStatusCheckError(props: { error: any }): JSX.SpecificElement<"center"> {
    return (
        <center
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255, 0, 0, 0.5)",
            }}
        >
            <h1>Error</h1>
            <p>An error occurred while checking the status of the marketplace server</p>
            <img class="piximg ndrg nsel" aria-hidden="true" src="resource://images/ui/art/connection_error.png" style={{ zoom: "var(--gui-scale)" }} />
            <p>
                {props.error && typeof props.error === "object" && "message" in props.error && "name" in props.error ?
                    String("stack" in props.error ? props.error.stack : `${props.error.name}: ${props.error.message}`)
                        .split("\n")
                        .flatMap((v) => [v, <br />])
                        .slice(0, -1)
                :   JSONB.stringify(props.error)}
            </p>
        </center>
    );
}

export function MarketplacePage_ServerOffline(): JSX.SpecificElement<"center"> {
    return (
        <center
            style={{
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(255, 0, 0, 0.5)",
            }}
        >
            <h1>Server Ureachable</h1>
            <p>The marketplace server is unreachable</p>
            <img class="piximg ndrg nsel" aria-hidden="true" src="resource://images/ui/art/connection_error.png" style={{ zoom: "var(--gui-scale)" }} />
            <p>
                Please try again later. If the problem persists, contact{" "}
                <a
                    href="mailto:8crafteryt@gmail.com"
                    class="nsel ndrg"
                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLAnchorElement>): void => {
                        event.preventDefault();
                        SoundEffects.popB();
                    }}
                    onClick={(event: JSX.TargetedMouseEvent<HTMLAnchorElement>): void => {
                        event.preventDefault();
                        event.currentTarget.blur();
                        shell.openExternal("mailto:8crafteryt@gmail.com");
                    }}
                >
                    8Crafter
                </a>
                .
            </p>
        </center>
    );
}
