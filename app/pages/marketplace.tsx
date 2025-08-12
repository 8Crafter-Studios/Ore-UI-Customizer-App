import type { JSX, RefObject } from "preact";
import _React, { render, useEffect, useRef } from "preact/compat";
import { getConnectionStatus } from "../../src/utils/connectionUtils";

export default function MarketplacePage(): JSX.SpecificElement<"center"> {
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    let online: boolean = navigator.onLine;
    useEffect((): void => {
        if (online) {
            getConnectionStatus().then((isConnected: boolean): void => {
                if (!containerRef.current) return;
                if (isConnected) {
                    containerRef.current.replaceChildren();
                    render(<MarketplacePage_Online />, containerRef.current);
                } else {
                    containerRef.current.replaceChildren();
                    render(<MarketplacePage_Offline />, containerRef.current);
                }
            });
        }
    });
    return (
        <div style={{ display: "contents" }} ref={containerRef}>
            {online ? <MarketplacePage_Loading /> : <MarketplacePage_Offline />}
        </div>
    ); //<MarketplacePage_Loading />;
}

export function MarketplacePage_Loading(): JSX.SpecificElement<"center"> {
    return (
        <center>
            <h1>Loading...</h1>
            <img aria-hidden="true" src="resource://images/ui/misc/loading_bar.gif" />
        </center>
    );
}

export function MarketplacePage_Online(): JSX.SpecificElement<"center"> {
    return (
        <center>
            <h1>Coming soon!</h1>
            <p>The marketplace is currently under construction.</p>
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
