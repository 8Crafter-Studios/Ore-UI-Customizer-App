import type { JSX } from "preact";
import _React from "preact/compat";
// import path from "node:path";

// const a = path.join(import.meta.dirname, "../../index.html");

export default function Navbar(): JSX.HTMLAttributes<HTMLUListElement> {
    return (
        <ul class="horizontal-nav full-sized-nav">
            <li>
                <a href="./index.html">8Crafter's Ore UI Customizer</a>
            </li>
            <li style="float:right;cursor:pointer;">
                <a href="./settings" style="vertical-align: middle;">
                    <div
                        class="settings_button"
                        title="Settings Icon"
                        style="width: 30px; height: 30px; margin-right: 5px; position: relative; top: 4px;"
                    ></div>
                    Settings
                </a>
            </li>
        </ul>
    );
}
