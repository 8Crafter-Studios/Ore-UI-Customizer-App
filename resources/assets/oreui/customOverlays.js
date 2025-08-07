/**
 * @import {JSONB, JSONBConsole} from "./JSONB.d.ts"
 */

// Hooks onto console data.
if (console.everything === undefined) {
    console.everything = [];
    function TS() {
        return new Date().toLocaleString("sv", { timeZone: "UTC" }) + "Z";
    }
    window.onerror = function (error, url, line) {
        console.everything.push({
            type: "exception",
            timeStamp: TS(),
            value: { error, url, line },
        });
        return false;
    };
    window.onunhandledrejection = function (e) {
        console.everything.push({
            type: "promiseRejection",
            timeStamp: TS(),
            value: e.reason,
        });
    };

    function hookLogType(logType) {
        const original = console[logType].bind(console);
        return function () {
            const data = {
                type: logType,
                timeStamp: TS(),
                value: Array.from(arguments),
            };
            console.everything.push(data);
            original.apply(console, arguments);
            (globalThis.onConsoleLogCallbacks ?? []).forEach((f) => {
                f(data);
            });
        };
    }

    ["log", "error", "warn", "debug"].forEach((logType) => {
        console[logType] = hookLogType(logType);
    });
}

/**
 * @type {HTMLDivElement}
 */
let mainMenu8CrafterUtilities;

/**
 * @type {HTMLDivElement}
 */
let consoleOverlayElement;

/**
 * @type {HTMLDivElement}
 */
let consoleOverlayTextElement;

/**
 * @type {HTMLTextAreaElement}
 */
let consoleOverlayInputFieldElement;

/**
 * @type {HTMLDivElement}
 */
let screenDisplayElement;

/**
 * @type {HTMLDivElement}
 */
let elementGeneralDebugOverlayElement;

/**
 * @type {HTMLDivElement}
 */
let smallCornerDebugOverlayElement;

/**
 * @type {HTMLDivElement}
 */
let cssEditorDisplayElement;

/**
 * @type {HTMLDivElement}
 */
let screenInputBlocker;

/**
 * @type {HTMLDivElement}
 */
let htmlSourceCodePreviewElement;

/**
 * @type {HTMLParagraphElement}
 */
let htmlSourceCodePreviewElementP;

/**
 * @type {HTMLDivElement}
 */
let cssEditorSubtitleElement;

/**
 * @type {HTMLStyleElement}
 */
let customGlobalCSSStyleElement;

/**
 * @type {HTMLTextAreaElement}
 */
let cssEditorTextBox;

/**
 * @type {HTMLParagraphElement}
 */
let cssEditorErrorText;

/**
 * @type {HTMLButtonElement}
 */
let cssEditorSelectTargetButton;

/**
 * @type {"none" | "hoveredElementDetails"}
 */
let currentDebugMode = "none";

/**
 * @type {CSSStyleSheet[]}
 */
let cssEditor_selectableStyleSheets = [];

/**
 * @type {HTMLElement}
 */
let cssEditorSelectedElement;

/**
 * @type {CSSStyleSheet}
 */
let cssEditorSelectedStyleSheet;

/**
 * @type {CSSRule[]}
 */
let cssEditorSelectedStyleSheet_rules = [];
/**
 * @type {"none" | "element" | "styleSheet" | "root" | "globalStyleElement"}
 */
let cssEditorSelectedType = "none";

/**
 * @type {boolean}
 */
let cssEditorInSelectMode = false;

/**
 * @type {HTMLElement & EventTarget}
 */
let currentMouseHoverTarget;

var mousePos = { clientX: 0, clientY: 0, screenX: 0, screenY: 0, offsetX: 0, offsetY: 0, pageX: 0, pageY: 0, layerX: 0, layerY: 0, movementX: 0, movementY: 0 };

/**
 * @type {string[]}
 */
var heldKeys = [];

/**
 * @type {number[]}
 */
var heldKeyCodes = [];

/**
 * @type {((data: { type: "log" | "error" | "warn" | "debug", timeStamp: string, value: any[], }) => void)[]}
 */
globalThis.onConsoleLogCallbacks = globalThis.onConsoleLogCallbacks ?? [];

/**
 * Joins a realm by name.
 *
 * @param {string} realmName The name of the realm to join.
 * @returns {{success: boolean, message: string, stack?: string, error?: Error}} The result.
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
async function autoJoinRealm(realmName) {
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
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
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
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        for (let i = 0; i < 100; i++) {
            for (const div of document.querySelectorAll("div[data-testid='realm-list-item-joined-realm'] > div > div > div > div > div")) {
                if (div.textContent === realmName) {
                    const button = div.parentElement.parentElement.parentElement.parentElement.parentElement;
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
                        await new Promise((resolve) => setTimeout(resolve, 100));
                    }
                    const playRealmButton = document.querySelector("div[data-testid='play-realm-button']");
                    const playRealmButtonSection = playRealmButton.parentElement.parentElement.parentElement;
                    const playRealmButtonSectionRealmNameSpan = playRealmButtonSection.querySelector("> div > span.vanilla-neutral80-text");
                    for (let i = 0; i < 100; i++) {
                        if (playRealmButtonSectionRealmNameSpan.textContent === realmName) {
                            await new Promise((resolve) => setTimeout(resolve, 100));
                            playRealmButton.dispatchEvent(new Event("click"));
                            console.log(`Joined realm: ${realmName}`);
                            return {
                                success: true,
                                message: `Joined realm: ${realmName}`,
                            };
                        }
                        if (i >= 99) {
                            console.error(`Failed to join realm: ${realmName}; Failed to load realm details. Timed out.`);
                            return {
                                success: false,
                                message: `Failed to join realm: ${realmName}; Failed to load realm details. Timed out.`,
                            };
                        }
                        await new Promise((resolve) => setTimeout(resolve, 100));
                    }
                }
            }
            if (i >= 99) {
                console.error(`Failed to join realm: ${realmName}; Failed to find realm in realm list. Timed out.`);
                return {
                    success: false,
                    message: `Failed to join realm: ${realmName}; Failed to find realm in realm list. Timed out.`,
                };
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    } catch (e) {
        console.error(e.message, e.stack);
        return {
            success: false,
            message: e.message,
            stack: e.stack,
            error: e,
        };
    }
}

/**
 * Joins a server by name.
 *
 * @param {string} serverName The name of the server to join.
 * @returns {{success: boolean, message: string, stack?: string, error?: Error}} The result.
 *
 * @description
 * 1. Switches to the servers tab, it it is not already open.
 * 2. Waits for the servers list to load.
 * 3. Finds the realm in the servers list and clicks on it.
 * 4. Waits for the server details to load.
 * 5. Clicks the server play button.
 */
async function autoJoinServer(serverName) {
    try {
        for (let i = 0; i < 100; i++) {
            if (document.querySelector("div[data-testid='play-screen-tab-bar-servers']") !== null) {
                break;
            }
            if (i >= 99) {
                console.error(`Failed to join server: ${serverName}; Failed to find servers tab button. Timed out.`);
                return {
                    success: false,
                    message: `Failed to join server: ${serverName}; Failed to find servers tab button. Timed out.`,
                };
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        document.querySelector("div[data-testid='play-screen-tab-bar-servers']").dispatchEvent(new Event("click"));
        for (let i = 0; i < 100; i++) {
            const addServerButtonClass = document.body.innerHTML.match(/<div class="([a-zA-Z0-9]+)">Add server<\/div>/)?.[1];
            if (addServerButtonClass !== null) {
                const addServerButton = Array.from(document.querySelectorAll(`div.${addServerButtonClass}`).values()).find(
                    (div) => div.textContent === "Add server"
                )?.parentElement.parentElement.parentElement.parentElement.parentElement;
                const addServerButtonContainer = addServerButton?.parentElement;
                const serversList = addServerButtonContainer?.parentElement;
                if (serversList !== undefined) {
                    if (
                        (serversList.querySelector(`> div.${addServerButton.classList.item(0)} div.vanilla-neutralAlpha60-text > div`) ??
                            Array.from(
                                serversList
                                    .querySelectorAll(`> div.${addServerButton.classList.item(0)} div.vanilla-neutralAlpha60-text`)
                                    .find((div) => !div.querySelector("div"))
                            )) !== null
                    ) {
                        break;
                    }
                }
            }
            if (i >= 99) {
                console.error(`Failed to join server: ${serverName}; Failed to load servers. Timed out.`);
                return {
                    success: false,
                    message: `Failed to join server: ${serverName}; Failed to load servers. Timed out.`,
                };
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        const addServerButtonClass = document.body.innerHTML.match(/<div class="([a-zA-Z0-9]+)">Add server<\/div>/)?.[1];
        const addServerButton = Array.from(document.querySelectorAll(`div.${addServerButtonClass}`).values()).find((div) => div.textContent === "Add server")
            ?.parentElement.parentElement.parentElement.parentElement.parentElement;
        const addServerButtonContainer = addServerButton?.parentElement;
        const serversList = addServerButtonContainer?.parentElement;
        for (let i = 0; i < 100; i++) {
            for (const div of [
                ...Array.from(serversList.querySelectorAll(`> div.${addServerButton.classList.item(0)} * div.vanilla-neutralAlpha60-text > div`)),
                ...Array.from(serversList.querySelectorAll(`> div.${addServerButton.classList.item(0)} * div.vanilla-neutralAlpha60-text`)).filter(
                    (div) => !div.querySelector("div")
                ),
            ]) {
                if (div.textContent === serverName) {
                    const button = div.parentElement.parentElement.parentElement.parentElement.classList.contains(addServerButton.classList.item(0))
                        ? div.parentElement.parentElement.parentElement.parentElement
                        : div.parentElement.parentElement.parentElement.parentElement.parentElement;
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
                        await new Promise((resolve) => setTimeout(resolve, 100));
                    }
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    const playServerButton = document.querySelector("div[data-testid='server-play-button']");
                    const playServerButtonSection = playServerButton.parentElement.parentElement.parentElement;
                    const playServerButtonSectionServerNameSpan = playServerButtonSection.querySelector("> div > span.vanilla-neutral80-text");
                    for (let i = 0; i < 100; i++) {
                        if (playServerButtonSectionServerNameSpan.textContent === serverName) {
                            playServerButton.dispatchEvent(new Event("click"));
                            console.log(`Joined server: ${serverName}`);
                            return {
                                success: true,
                                message: `Joined server: ${serverName}`,
                            };
                        }
                        if (i >= 99) {
                            console.error(`Failed to join server: ${serverName}; Failed to load server details. Timed out.`);
                            return {
                                success: false,
                                message: `Failed to join server: ${serverName}; Failed to load server details. Timed out.`,
                            };
                        }
                        await new Promise((resolve) => setTimeout(resolve, 100));
                    }
                }
            }
            if (i >= 99) {
                console.error(`Failed to join server: ${serverName}; Failed to find server in server list. Timed out.`);
                return {
                    success: false,
                    message: `Failed to join server: ${serverName}; Failed to find server in server list. Timed out.`,
                };
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    } catch (e) {
        console.error(e.message, e.stack);
        return {
            success: false,
            message: e.message,
            stack: e.stack,
            error: e,
        };
    }
}

/**
 * Joins a world by name.
 *
 * @param {string} worldName The name of the world to join.
 * @returns {{success: boolean, message: string, stack?: string, error?: Error}} The result.
 *
 * @description
 * 1. Switches to the worlds tab, it it is not already open.
 * 2. Waits for the worlds list to load.
 * 3. Finds the realm in the worlds list and clicks on it.
 * 4. Waits for the world details to load.
 * 5. Clicks the world play button.
 */
async function autoJoinWorld(worldName) {
    try {
        for (let i = 0; i < 100; i++) {
            if (document.querySelector("div[data-testid='play-screen-tab-bar-all']") !== null) {
                break;
            }
            if (i >= 99) {
                console.error(`Failed to join world: ${worldName}; Failed to find worlds tab button. Timed out.`);
                return {
                    success: false,
                    message: `Failed to join world: ${worldName}; Failed to find worlds tab button. Timed out.`,
                };
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        document.querySelector("div[data-testid='play-screen-tab-bar-all']").dispatchEvent(new Event("click"));
        for (let i = 0; i < 100; i++) {
            if (document.querySelector("div[data-testid='multiplayer-world-list-item-primary-action-0']") !== null) {
                break;
            }
            if (i >= 99) {
                console.error(`Failed to join world: ${worldName}; Failed to load worlds. Timed out.`);
                return {
                    success: false,
                    message: `Failed to join world: ${worldName}; Failed to load worlds. Timed out.`,
                };
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        const worldsList = document.querySelector("div[data-testid='multiplayer-world-list-item-primary-action-0']").parentElement.parentElement;
        for (let i = 0; i < 100; i++) {
            for (const div of Array.from(worldsList.querySelectorAll(`> div > div`)).filter((div) =>
                /^multiplayer-world-list-item-primary-action-[0-9]+$/.test(div.getAttribute("data-testid"))
            )) {
                if (div.querySelector("div.vanilla-neutral-text")?.textContent === worldName) {
                    // await new Promise((resolve) => setTimeout(resolve, 100));
                    div.dispatchEvent(new Event("click"));
                    console.log(`Joined world: ${worldName}`);
                    return {
                        success: true,
                        message: `Joined world: ${worldName}`,
                    };
                }
            }
            if (i >= 99) {
                console.error(`Failed to join world: ${worldName}; Failed to find world in world list. Timed out.`);
                return {
                    success: false,
                    message: `Failed to join world: ${worldName}; Failed to find world in world list. Timed out.`,
                };
            }
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    } catch (e) {
        console.error(e.message, e.stack);
        return {
            success: false,
            message: e.message,
            stack: e.stack,
            error: e,
        };
    }
}

async function enableAutoJoinForOpenServer() {
    if (
        document.querySelector("div[data-testid='play-screen-tab-bar-realms']")?.querySelector("div.vanilla-neutral-icon") !== null &&
        document.querySelector("div[data-testid='play-realm-button']") !== null
    ) {
        const playRealmButton = document.querySelector("div[data-testid='play-realm-button']");
        const playRealmButtonSection = playRealmButton.parentElement.parentElement.parentElement;
        const playRealmButtonSectionRealmNameSpan = playRealmButtonSection.querySelector("> div > span.vanilla-neutral80-text");
        window.localStorage.setItem("autoJoinName", playRealmButtonSectionRealmNameSpan.textContent);
        window.localStorage.setItem("autoJoinType", "realm");
        try {
            document.getElementById("8CrafterUtilitiesMenu_button_disableAutoRejoin").removeAttribute("disabled");
            document.getElementById("8CrafterUtilitiesMenu_button_disableAutoRejoin").classList.remove("disabled");
            document.getElementById("8CrafterUtilitiesMenu_span_autoJoinName").textContent = playRealmButtonSectionRealmNameSpan.textContent;
            document.getElementById("8CrafterUtilitiesMenu_span_autoJoinType").textContent = "Realm";
        } catch {}
        promptForConfirmation(`Successfully enabled auto rejoin for the following realm: ${playRealmButtonSectionRealmNameSpan.textContent}`, "OK", "");
    } else if (
        document.querySelector("div[data-testid='play-screen-tab-bar-servers']")?.querySelector("div.vanilla-neutral-icon") !== null &&
        document.querySelector("div[data-testid='server-play-button']") !== null
    ) {
        const playServerButton = document.querySelector("div[data-testid='server-play-button']");
        const playServerButtonSection = playServerButton.parentElement.parentElement.parentElement;
        const playServerButtonSectionServerNameSpan = playServerButtonSection.querySelector("> div > span.vanilla-neutral80-text");
        window.localStorage.setItem("autoJoinName", playServerButtonSectionServerNameSpan.textContent);
        window.localStorage.setItem("autoJoinType", "server");
        try {
            document.getElementById("8CrafterUtilitiesMenu_button_disableAutoRejoin").removeAttribute("disabled");
            document.getElementById("8CrafterUtilitiesMenu_button_disableAutoRejoin").classList.remove("disabled");
            document.getElementById("8CrafterUtilitiesMenu_span_autoJoinName").textContent = playServerButtonSectionServerNameSpan.textContent;
            document.getElementById("8CrafterUtilitiesMenu_span_autoJoinType").textContent = "Server";
        } catch {}
        promptForConfirmation(`Successfully enabled auto rejoin for the following server: ${playServerButtonSectionServerNameSpan.textContent}`, "OK", "");
    } else if (
        document.querySelector("div[data-testid='play-screen-tab-bar-all']")?.querySelector("div.vanilla-neutral-icon") !== null &&
        document.querySelector("div[data-testid='multiplayer-world-list-item-primary-action-0']") !== null
    ) {
        const worldsList = document.querySelector("div[data-testid='multiplayer-world-list-item-primary-action-0']").parentElement.parentElement;
        const worlds = Array.from(worldsList.querySelectorAll(`> div > div`)).filter((div) =>
            /^multiplayer-world-list-item-primary-action-[0-9]+$/.test(div.getAttribute("data-testid"))
        );
        const r = await buttonSelectionMenu({
            body: "Select a world to enable auto rejoin for.",
            buttons: worlds.map((world) => [world.querySelector("div.vanilla-neutral-text").textContent]),
            style: "1column",
        });
        if (r.canceled) return;
        const world = worlds[r.selection];
        const worldName = world.querySelector("div.vanilla-neutral-text").textContent;
        window.localStorage.setItem("autoJoinName", worldName);
        window.localStorage.setItem("autoJoinType", "world");
        try {
            document.getElementById("8CrafterUtilitiesMenu_button_disableAutoRejoin").removeAttribute("disabled");
            document.getElementById("8CrafterUtilitiesMenu_button_disableAutoRejoin").classList.remove("disabled");
            document.getElementById("8CrafterUtilitiesMenu_span_autoJoinName").textContent = worldName;
            document.getElementById("8CrafterUtilitiesMenu_span_autoJoinType").textContent = "World";
        } catch {}
        promptForConfirmation(`Successfully enabled auto rejoin for the following world: ${worldName}`, "OK", "");
    } else {
        promptForConfirmation(
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
async function promptForConfirmation(message, button1 = "Confirm", button2 = "Cancel", button3, additionalModificationsCallback = async () => {}) {
    return new Promise(async (resolve, reject) => {
        const container = document.createElement("div");
        ("background-color: #00000080; color: #FFFFFFFF; width: 75vw; height: 75vh; position: fixed; top: 12.5vh; left: 12.5vw; z-index: 20000000; display: none; backdrop-filter: blur(5px); border: 5px solid #87CEEb;");
        container.style.position = "fixed";
        container.style.top = "12.5vh";
        container.style.left = "12.5vw";
        container.style.width = "75vw";
        container.style.height = "75vh";
        container.style.zIndex = "20000000";
        container.style.backgroundColor = "#00000080";
        container.style.color = "#FFFFFFFF";
        container.style.backdropFilter = "blur(5px)";
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
async function buttonSelectionMenu(options) {
    return new Promise(async (resolve, reject) => {
        const outerContainer = document.createElement("div");
        outerContainer.style.position = "fixed";
        outerContainer.style.top = "12.5vh";
        outerContainer.style.left = "12.5vw";
        outerContainer.style.width = "75vw";
        outerContainer.style.height = "75vh";
        outerContainer.style.zIndex = "20000000";
        outerContainer.style.backgroundColor = "#00000080";
        outerContainer.style.color = "#FFFFFFFF";
        outerContainer.style.backdropFilter = "blur(5px)";
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
        closeButtonElement.type = "button";
        closeButtonElement.style.position = "absolute";
        closeButtonElement.style.top = "0";
        closeButtonElement.style.right = "0";
        closeButtonElement.style.fontFamily = "Minecraft Seven v2";
        closeButtonElement.style.fontSize = "50px";
        closeButtonElement.style.aspectRatio = "1/1";
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
                buttonsContainer.style.height = options.buttons.length * window.outerHeight * 0.1875 + "px";
                break;
            case "2columns":
                buttonsContainer.style.height = Math.ceil(options.buttons.length / 2) * window.outerHeight * 0.1875 + "px";
                break;
        }
        options.buttons.forEach((button, index) => {
            const buttonElement = document.createElement("button");
            buttonElement.textContent = button[0];
            buttonElement.style.position = "absolute";
            switch (options.style ?? "2columns") {
                case "1column":
                    buttonElement.style.top = index * window.outerHeight * 0.1875 + "px";
                    buttonElement.style.left = "0";
                    buttonElement.style.width = "100%";
                    break;
                case "2columns":
                    buttonElement.style.top = Math.floor(index / 2) * window.outerHeight * 0.1875 + "px";
                    buttonElement.style.left = index % 2 === 0 ? "0" : "50%";
                    buttonElement.style.width = "50%";
                    break;
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
            document.getElementById("8CrafterUtilitiesMenu_button_disableAutoRejoin").removeAttribute("disabled");
            document.getElementById("8CrafterUtilitiesMenu_button_disableAutoRejoin").classList.remove("disabled");
            document.getElementById("8CrafterUtilitiesMenu_span_autoJoinName").textContent = localStorage.getItem("autoJoinName");
            document.getElementById("8CrafterUtilitiesMenu_span_autoJoinType").textContent = localStorage.getItem("autoJoinType");
        } catch {}
    }, 1);
    switch (localStorage.getItem("autoJoinType")) {
        case "realm":
            promptForConfirmation(
                `Join realm: ${localStorage.getItem("autoJoinName")}?\nJoining in 10 seconds.`,
                "Join",
                "Cancel",
                "Turn Off Auto Rejoin",
                async function addCountdown(container, resolve, reject) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    for (let i = 10; i > 0; i--) {
                        if (container.getAttribute("data-closed") === "true") return;
                        container.querySelector("pre").textContent = container
                            .querySelector("pre")
                            .textContent.replace(/Joining in [0-9]+ seconds\./, `Joining in ${i} seconds.`);
                        console.log(container.querySelector("pre").textContent);
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                    }
                    container.setAttribute("data-closed", "true");
                    container.remove();
                    resolve(1);
                }
            ).then(async (result) => {
                switch (result) {
                    case 0:
                        break;
                    case 1:
                        autoJoinRealm(localStorage.getItem("autoJoinName"));
                        break;
                    case 2:
                        localStorage.removeItem("autoJoinName");
                        localStorage.removeItem("autoJoinType");
                        break;
                }
            });
            break;
        case "server":
            promptForConfirmation(
                `Join server: ${localStorage.getItem("autoJoinName")}?\nJoining in 10 seconds.`,
                "Join",
                "Cancel",
                "Turn Off Auto Rejoin",
                async function addCountdown(container, resolve, reject) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    for (let i = 10; i > 0; i--) {
                        if (container.getAttribute("data-closed") === "true") return;
                        container.querySelector("pre").textContent = container
                            .querySelector("pre")
                            .textContent.replace(/Joining in [0-9]+ seconds\./, `Joining in ${i} seconds.`);
                        console.log(container.querySelector("pre").textContent);
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                    }
                    container.setAttribute("data-closed", "true");
                    container.remove();
                    resolve(1);
                }
            ).then(async (result) => {
                switch (result) {
                    case 0:
                        break;
                    case 1:
                        autoJoinServer(localStorage.getItem("autoJoinName"));
                        break;
                    case 2:
                        localStorage.removeItem("autoJoinName");
                        localStorage.removeItem("autoJoinType");
                        break;
                }
            });
            break;
        case "world":
            promptForConfirmation(
                `Join world: ${localStorage.getItem("autoJoinName")}?\nJoining in 10 seconds.`,
                "Join",
                "Cancel",
                "Turn Off Auto Rejoin",
                async function addCountdown(container, resolve, reject) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    for (let i = 10; i > 0; i--) {
                        if (container.getAttribute("data-closed") === "true") return;
                        container.querySelector("pre").textContent = container
                            .querySelector("pre")
                            .textContent.replace(/Joining in [0-9]+ seconds\./, `Joining in ${i} seconds.`);
                        console.log(container.querySelector("pre").textContent);
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                    }
                    container.setAttribute("data-closed", "true");
                    container.remove();
                    resolve(1);
                }
            ).then(async (result) => {
                switch (result) {
                    case 0:
                        break;
                    case 1:
                        autoJoinWorld(localStorage.getItem("autoJoinName"));
                        break;
                    case 2:
                        localStorage.removeItem("autoJoinName");
                        localStorage.removeItem("autoJoinType");
                        break;
                }
            });
            break;
        case null:
            promptForConfirmation(`The server type for auto rejoin is missing, as a result auto join will not work.`, "OK", "");
            break;
        default:
            promptForConfirmation(
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
function validateCssEditorTextBoxValue() {
    if (cssEditorSelectedType === "element") {
        try {
            const newCSS = JSON.parse(cssEditorTextBox.value);
            cssEditorErrorText.textContent = "";
            cssEditorSelectedElement.style = newCSS;
            return true;
        } catch (e) {
            cssEditorErrorText.textContent = e + " " + e?.stack;
            return false;
        }
    } else if (cssEditorSelectedType === "root") {
        try {
            const newCSS = JSON.parse(cssEditorTextBox.value);
            cssEditorErrorText.textContent = "";
            document.getElementById("root").style = newCSS;
            return true;
        } catch (e) {
            cssEditorErrorText.textContent = e + " " + e?.stack;
            return false;
        }
    } else if (cssEditorSelectedType === "globalStyleElement") {
        try {
            const newCSS = JSON.parse(cssEditorTextBox.value);
            cssEditorErrorText.textContent = "";
            customGlobalCSSStyleElement.style = newCSS;
            return true;
        } catch (e) {
            cssEditorErrorText.textContent = e + " " + e?.stack;
            return false;
        }
    } else if (cssEditorSelectedType === "styleSheet") {
        // throw new Error("validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === 'styleSheet'");
        cssEditorErrorText.textContent = "validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === 'styleSheet'";
        return false;
    } else {
        // throw new Error("validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === '" + cssEditorSelectedType + "'");
        cssEditorErrorText.textContent = "validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === '" + cssEditorSelectedType + "'";
        return false;
    }
}

/**
 * Puts the CSS Editor in style sheet selection mode.
 *
 * @deprecated The style sheet rules are undefined for some reason.
 */
function cssEditor_selectDocumentStyleSheet_activate() {
    document.getElementById("cssEditor_mainDiv").style.display = "none";
    cssEditor_selectableStyleSheets = [];
    let styleSheetList = document.styleSheets;
    for (let i = 0; i < styleSheetList.length; i++) {
        cssEditor_selectableStyleSheets.push(styleSheetList[i]);
    }
    document.getElementById("cssEditor_documentStyleSelectorDiv").innerHTML = cssEditor_selectableStyleSheets
        .map((s, i) => `<button type="button" onclick="cssEditor_selectDocumentStyleSheet_selected(${i})">${i}</button>`)
        .join("");
    document.getElementById("cssEditor_documentStyleSelectorDiv").style.display = "block";
}

/**
 * Used when a style sheet is selected.
 *
 * @param {number} index
 *
 * @deprecated The style sheet rules are undefined for some reason.
 */
async function cssEditor_selectDocumentStyleSheet_selected(index) {
    document.getElementById("cssEditor_documentStyleSelectorDiv").style.display = "none";
    cssEditorSelectedType = "styleSheet";
    cssEditorSelectedStyleSheet = cssEditor_selectableStyleSheets[index];
    cssEditorSelectedStyleSheet_rules = [];
    try {
        const ownerNode = cssEditorSelectedStyleSheet.ownerNode;
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
            cssEditorSelectedStyleSheet.ownerNode?.shadowRoot,
            cssEditorSelectedStyleSheet.ownerNode?.slot,
            cssEditorSelectedStyleSheet.ownerNode?.tagName,
            cssEditorSelectedStyleSheet.ownerNode?.href,
            Object.getOwnPropertyNames(cssEditorSelectedStyleSheet) /* , ownerNode.href ? (f(ownerNode.href)) : "NO HREF!" */
        );
        cssEditorTextBox.value = cssEditorSelectedStyleSheet_rules.map((v) => v ?? "MISSING!").join("\n");
    } catch (e) {
        cssEditorTextBox.value = e + e.stack;
    }
    setCSSEditorMode("styleSheet");
    document.getElementById("cssEditor_mainDiv").style.display = "block";
}

/**
 * Saves the CSS Editor changes.
 */
async function cssEditor_saveChanges() {
    if (cssEditorSelectedType === "element") {
        try {
            const newCSS = cssEditorTextBox.value;
            cssEditorErrorText.textContent = "";
            cssEditorSelectedElement.setAttribute("style", newCSS);
        } catch (e) {
            cssEditorErrorText.textContent = e + " " + e?.stack;
        }
    } else if (cssEditorSelectedType === "root") {
        try {
            const newCSS = cssEditorTextBox.value;
            cssEditorErrorText.textContent = "";
            document.getElementById("root").setAttribute("style", newCSS);
        } catch (e) {
            cssEditorErrorText.textContent = e + " " + e?.stack;
        }
    } else if (cssEditorSelectedType === "globalStyleElement") {
        try {
            const newCSS = cssEditorTextBox.value;
            cssEditorErrorText.textContent = "";
            // const elem = document.getElementById("customGlobalCSSStyle");
            // document.getElementById("customGlobalCSSStyle").remove();
            customGlobalCSSStyleElement;
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
            cssEditorErrorText.textContent = e + " " + e?.stack;
        }
    } else if (cssEditorSelectedType === "styleSheet") {
        // throw new Error("validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === 'styleSheet'");
        cssEditorErrorText.textContent = "validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === 'styleSheet'";
    } else {
        // throw new Error("validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === '" + cssEditorSelectedType + "'");
        cssEditorErrorText.textContent = "validateCssEditorTextBoxValue is not implemented for cssEditorSelectedType === '" + cssEditorSelectedType + "'";
    }
}

/**
 * Sets the CSS Editor mode.
 *
 * @param {typeof cssEditorSelectedType} mode The mode to set the CSS Editor to.
 *
 * @throws {Error} Throws an error if the mode is not valid.
 */
function setCSSEditorMode(mode) {
    cssEditorSelectedType = mode;
    cssEditorErrorText.textContent = "";
    switch (mode) {
        case "none":
            document.getElementById("cssEditor_subtitle").textContent = "Nothing selected!";
            cssEditorTextBox.style.backgroundColor = "#808080FF";
            cssEditorTextBox.style.pointerEvents = "none";
            document.getElementById("cssEditorSaveChangesButton").disabled = true;
            break;
        case "element":
            document.getElementById("cssEditor_subtitle").textContent = "Element Style (CSS): " + UTILS.cssPath(cssEditorSelectedElement).split(" > ").pop();
            cssEditorTextBox.style.backgroundColor = "";
            cssEditorTextBox.style.pointerEvents = "";
            document.getElementById("cssEditorSaveChangesButton").disabled = false;
            break;
        case "root":
            document.getElementById("cssEditor_subtitle").textContent = "Root Element Style (CSS): " + cssEditorSelectedElement.accessKey;
            cssEditorTextBox.style.backgroundColor = "";
            cssEditorTextBox.style.pointerEvents = "";
            document.getElementById("cssEditorSaveChangesButton").disabled = false;
            break;
        case "globalStyleElement":
            document.getElementById("cssEditor_subtitle").textContent = "Global CSS (CSS)";
            cssEditorTextBox.style.backgroundColor = "";
            cssEditorTextBox.style.pointerEvents = "";
            document.getElementById("cssEditorSaveChangesButton").disabled = false;
            break;
        case "styleSheet":
            document.getElementById("cssEditor_subtitle").textContent = "Style Sheet Rules (JSON): " + cssEditorSelectedStyleSheet.title;
            cssEditorTextBox.style.backgroundColor = "";
            cssEditorTextBox.style.pointerEvents = "";
            document.getElementById("cssEditorSaveChangesButton").disabled = true;
            break;
        default:
            throw new Error("setCSSEditorMode is not implemented for mode === '" + mode + "'");
    }
}

function cssEditor_rootElementStylesMode() {
    setCSSEditorMode("root");
    cssEditorTextBox.value = document.getElementById("root").getAttribute("style") ?? "";
}

function cssEditor_globalStyleElementStylesMode() {
    setCSSEditorMode("globalStyleElement");
    cssEditorTextBox.value = customGlobalCSSStyleElement.textContent;
}

/**
 * Sets the tab of the 8Crafter Utilities Main Menu.
 * @param {string} tab
 */
function setMainMenu8CrafterUtilitiesTab(tab) {
    for (const child of document.getElementById("8CrafterUtilitiesMenu_rightSide").children) {
        if (child.classList.contains("customScrollbarParent")) continue;
        if (child.id === "8CrafterUtilitiesMenu_leftSidebar") continue;
        child.style.display = child.id === "8CrafterUtilitiesMenu_" + tab ? "block" : "none";
    }
    for (const child of document.getElementById("8CrafterUtilitiesMenu_leftSidebar").children) {
        if (child.classList.contains("customScrollbarParent")) continue;
        if (child.id === "8CrafterUtilitiesMenu_tabButton_" + tab) {
            child.classList.add("selected");
        } else {
            child.classList.remove("selected");
        }
    }
}

function toggleSmallCornerDebugOverlay() {
    if (smallCornerDebugOverlayElement.style.display === "none") {
        smallCornerDebugOverlayElement.style.display = "block";
        smallCornerDebugOverlayElement.textContent = `Client: x: ${mousePos.clientX} y: ${mousePos.clientY}
Offset x: ${mousePos.offsetX} y: ${mousePos.offsetY}
Page: x: ${mousePos.pageX} y: ${mousePos.pageY}
Screen: x: ${mousePos.screenX} y: ${mousePos.screenY}
Layer: x: ${e.layerX} y: ${e.layerY}
Movement: x: ${e.movementX} y: ${e.movementY}`;
    } else {
        smallCornerDebugOverlayElement.style.display = "none";
    }
}

function toggleGeneralDebugOverlayElement() {
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
    currentMouseHoverTarget.getAttributeNames().length > 0
        ? currentMouseHoverTarget
              .getAttributeNames()
              .map((name) => `${name}: ${currentMouseHoverTarget.getAttribute(name)}`)
              .join("\n")
        : "None"
}`;
    } else {
        elementGeneralDebugOverlayElement.style.display = "none";
    }
}

function toggleHTMLSourceCodePreviewElement() {
    if (htmlSourceCodePreviewElement.style.display === "block") {
        htmlSourceCodePreviewElement.style.display = "none";
    } else {
        htmlSourceCodePreviewElementP.textContent = "";
        htmlSourceCodePreviewElementP.textContent = document.documentElement.outerHTML;
        htmlSourceCodePreviewElement.style.display = "block";
    }
}

function toggleConsoleOverlay() {
    if (consoleOverlayElement.style.display === "block") {
        consoleOverlayElement.style.display = "none";
    } else {
        consoleOverlayElement.style.display = "block";
    }
}

/**
 * Represents an entry in the console execution history.
 */
class ConsoleExecutionHistoryEntry {
    /**
     * The code that was executed.
     *
     * @public
     *
     * @type {string}
     */
    code;
    /**
     * The time when the code was executed.
     *
     * @public
     *
     * @type {number}
     */
    time;
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
    constructor(code, time = Date.now()) {
        this.code = code;
        this.time = time;
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
     * @type {number}
     *
     * @default 10
     */
    static maxEntries = 10;
    /**
     * The maximum length of an entry in the history.
     *
     * @public
     * @static
     *
     * @type {number}
     *
     * @default 1000
     */
    static maxEntryLength = 1000;
    /**
     * The entries in the history, oldest first.
     *
     * @readonly
     *
     * @public
     * @static
     *
     * @type {ConsoleExecutionHistoryEntry[]}
     */
    static entries = [];
    /**
     * @constructor
     *
     * @throws {TypeError} Throws an error if the constructor is called.
     *
     * @private
     */
    constructor() {
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
    static getNthNewestEntry(n) {
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
    static addHistoryItem(code, time = Date.now()) {
        const entry = new ConsoleExecutionHistoryEntry(code, time);
        ConsoleExecutionHistory.entries.push(entry);
        if (ConsoleExecutionHistory.entries.length > ConsoleExecutionHistory.maxEntries) {
            ConsoleExecutionHistory.entries.shift();
        }
        return entry;
    }
    /**
     * Clears the history.
     *
     * @public
     * @static
     */
    static clearHistory() {
        ConsoleExecutionHistory.entries.length = 0;
    }
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
 * Executes the console input field contents.
 */
function consoleOverlayExecute() {
    // Reset the currently selected console execution history item index
    currentlySelctedConsoleExecutionHistoryItemIndex = -1;
    /**
     * The input to be executed.
     *
     * @type {string}
     */
    const input = consoleOverlayInputFieldElement.value;
    if (input.length <= ConsoleExecutionHistory.maxEntryLength) {
        ConsoleExecutionHistory.addHistoryItem(input, Date.now());
    }
    /**
     * The command element.
     *
     * @type {HTMLDivElement}
     */
    const commandElem = document.createElement("div");
    commandElem.style.whiteSpace = "pre-wrap";
    commandElem.style.overflowWrap = "anywhere";
    if (consoleOverlayTextElement.children.length > 0 && !consoleOverlayTextElement.lastChild?.style?.backgroundColor?.length > 0) {
        commandElem.style.borderTop = "1px solid #888888";
    }
    commandElem.textContent = `> ${input}`;
    consoleOverlayTextElement.appendChild(commandElem);

    /**
     * The result element that will display the result of the executed command.
     *
     * @type {HTMLDivElement}
     */
    const resultElem = document.createElement("div");
    resultElem.style.whiteSpace = "pre-wrap";
    resultElem.style.overflowWrap = "anywhere";
    try {
        /**
         * The result of the executed command.
         *
         * @type {any}
         */
        const result = eval(input);
        if (!consoleOverlayTextElement.lastChild?.style?.backgroundColor?.length > 0) {
            resultElem.style.borderTop = "1px solid #888888";
        }
        if ((typeof result === "object" && result !== null) || typeof result === "function") {
            resultElem.appendChild(createExpandableObjectView(result, true));
        } else {
            resultElem.textContent = JSONB.stringify(result);
        }
        consoleOverlayTextElement.appendChild(resultElem);
        consoleOverlayInputFieldElement.value = "";
    } catch (e) {
        resultElem.style.backgroundColor = "#FF000055";
        resultElem.textContent = `${e + " " + e?.stack}`;
        consoleOverlayTextElement.appendChild(resultElem);
    }
}

/**
 * The contents of the console input field before it was replaced with a history item.
 *
 * @type {string}
 *
 * @default ""
 */
var savedConsoleInputFieldContents = "";

/**
 * Sets the contents of the console input field to the contents of the nth most recent history item.
 *
 * @param {number} index The index of the history item to set the input field to. It will be bound to be withing the range of the history items, or `-1`. If `-1`, the input field will be restored to what it was before replacing the input field with a history item.
 */
function setConsoleInputFieldContentsToHistoryItem(index) {
    index = Math.max(-1, index);
    if (index === -1) {
        if (currentlySelctedConsoleExecutionHistoryItemIndex === -1) {
            // If the index is -1 and no history item is currently selected, do nothing.
            return;
        }
        // If the index is -1, restore the input field to what it was before replacing it with a history item.
        consoleOverlayInputFieldElement.value = savedConsoleInputFieldContents;
        // Erase the saved contents to reduce memory usage.
        savedConsoleInputFieldContents = "";
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
 * The last used ID for a console expansion arrow.
 *
 * @type {bigint}
 *
 * @default 0n
 */
var consoleExpansionArrowID = 0n;

/**
 * @param {Object} obj
 * @param {boolean} isRoot
 * @param {boolean} forceObjectMode
 * @param {{summaryValueOverride?: string, summaryValueOverride_toStringTag?: string, displayKey?: string}} options
 */
function createExpandableObjectView(obj, isRoot = false, forceObjectMode = false, options) {
    const arrowID = (consoleExpansionArrowID++).toString(36);
    const container = document.createElement("div"); /* 
    const arrow = document.createElement("img");
    arrow.style = "float: left; display: inline;";
    arrow.src = "assets/arrowForwardWhite-9acff.png";
    container.appendChild(arrow); */
    const summary = document.createElement("div");
    summary.textContent = JSONBConsole.stringify(
        obj,
        undefined,
        4,
        { bigint: true, undefined: true, Infinity: true, NegativeInfinity: true, NaN: true, get: true, set: true, function: true, class: false },
        5,
        2
    );
    if (options?.summaryValueOverride) {
        summary.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: ${
            isRoot ? 0 : -22
        }px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${arrowID}"><span style="display: inline; white-space: pre-wrap;">${
            options.displayKey ? `${options.displayKey}: ` : ""
        }${
            options.summaryValueOverride_toStringTag
                ? `<i style="display: inline; font-style: italic;">${options.summaryValueOverride_toStringTag
                      .replaceAll("<", "&lt;")
                      .replaceAll(">", "&gt;")}</i> `
                : ""
        }${options.summaryValueOverride
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\n", `</span><span style="display: inline; white-space: pre-wrap;">`)}</span>`;
    } else if (obj[Symbol.toStringTag]) {
        summary.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: ${
            isRoot ? 0 : -22
        }px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${arrowID}"><span style="display: inline; white-space: pre-wrap;">${
            options?.displayKey ? `${options.displayKey}: ` : ""
        }<i style="display: inline; font-style: italic;">${obj[Symbol.toStringTag].replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</i> ${summary.textContent
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\n", `</span><span style="display: inline; white-space: pre-wrap;">`)}</span>`;
    } else {
        summary.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: ${
            isRoot ? 0 : -22
        }px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${arrowID}"><span style="display: inline; white-space: pre-wrap;">${
            options?.displayKey ? `${options.displayKey}: ` : ""
        }${summary.textContent
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\n", `</span><span style="display: inline; white-space: pre-wrap;">`)}</span>`;
    }
    const evaluatedUponFirstExpandingInfo = document.createElement("div");
    evaluatedUponFirstExpandingInfo.style = "display: none; white-space: pre-wrap; position: relative; left: 0px; top: 0px; height: 100%;";
    evaluatedUponFirstExpandingInfo.classList.add("evaluatedUponFirstExpandingInfo");
    const evaluatedUponFirstExpandingInfoIcon = document.createElement("img");
    evaluatedUponFirstExpandingInfoIcon.style =
        "display: inline; width: 24px; height: 24px; position: relative; left: 0px; top: 50%; margin-top: -12px; margin-bottom: -12px; image-rendering: pixelated;";
    evaluatedUponFirstExpandingInfoIcon.src = "assets/Information-44f83.png";
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
    summary.lastChild.appendChild(evaluatedUponFirstExpandingInfo);
    summary.style.cursor = "pointer";
    summary.style.display = "block";
    if (isRoot) {
        summary.style.paddingLeft = "22px";
    }
    container.appendChild(summary);

    summary.addEventListener("click", () => {
        if (container.childNodes.length === 1) {
            try {
                document.getElementById(`consoleExpansionArrow-${arrowID}`).style.transform = "rotateZ(90deg)";
            } catch (e) {
                console.error(e.toString(), e.stack);
            }
            summary.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0].style.display = "inline";
            const details = document.createElement("div");
            /**
             * @type {(string | number | symbol | {displayName: string, key: string})[]}
             */
            const keys = [
                ...new Set([
                    ...Object.keys(obj),
                    ...(() => {
                        try {
                            return Object.getOwnPropertyNames(obj.__proto__).filter((key) => {
                                try {
                                    // Make sure the property won't throw an error when accessed.
                                    obj[key];
                                    return key in obj;
                                } catch (e) {
                                    return false;
                                }
                            });
                        } catch (e) {
                            return [];
                        }
                    })(),
                    ...Object.getOwnPropertyNames(obj),
                    ...Object.getOwnPropertySymbols(obj),
                ]),
            ];
            if (obj.__proto__) keys.push({ displayName: "[[Prototype]]", key: "__proto__" });
            for (const keyRaw of keys) {
                const key = ["number", "string", "symbol"].includes(typeof keyRaw) ? keyRaw : keyRaw.key;
                const displayName = ["number", "string", "symbol"].includes(typeof keyRaw) ? keyRaw.toString() : keyRaw.displayName;
                const item = document.createElement("div");
                item.style.marginLeft = "44px";
                try {
                    if (forceObjectMode || (typeof obj[key] === "object" && obj[key] !== null) /*  || typeof obj[key] === "function" */) {
                        const expandableObjectView = createExpandableObjectView(obj[key]);
                        expandableObjectView.children[0].children[1].insertAdjacentText("afterbegin", `${displayName}: `);
                        item.appendChild(expandableObjectView);
                    } else if (typeof obj[key] === "function") {
                        const arrowID = (consoleExpansionArrowID++).toString(36);
                        const funcSummary = document.createElement("span");
                        funcSummary.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: -22px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${arrowID}"><span style="display: inline; white-space: pre-wrap;">${displayName}: ${JSONBConsole.stringify(
                            obj[key],
                            undefined,
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
                            },
                            5,
                            1
                        )
                            .replaceAll("<", "&lt;")
                            .replaceAll(">", "&gt;")
                            .replaceAll("\n", `</span><span style="display: inline; white-space: pre-wrap;">`)}</span>`;
                        funcSummary.style.cursor = "pointer";
                        const evaluatedUponFirstExpandingInfo = document.createElement("div");
                        evaluatedUponFirstExpandingInfo.style = "display: none; white-space: pre-wrap; position: relative; left: 0px; top: 0px; height: 100%;";
                        evaluatedUponFirstExpandingInfo.classList.add("evaluatedUponFirstExpandingInfo");
                        const evaluatedUponFirstExpandingInfoIcon = document.createElement("img");
                        evaluatedUponFirstExpandingInfoIcon.style =
                            "display: inline; width: 24px; height: 24px; position: relative; left: 0px; top: 50%; margin-top: -12px; margin-bottom: -12px; image-rendering: pixelated;";
                        evaluatedUponFirstExpandingInfoIcon.src = "assets/Information-44f83.png";
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
                        funcSummary.lastChild.appendChild(evaluatedUponFirstExpandingInfo);
                        item.appendChild(funcSummary);

                        funcSummary.addEventListener("click", () => {
                            if (funcSummary.nextSibling) {
                                document.getElementById(`consoleExpansionArrow-${arrowID}`).style.transform = "rotateZ(0deg)";
                                funcSummary.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0].style.display = "none";
                                funcSummary.nextSibling.remove();
                            } else {
                                document.getElementById(`consoleExpansionArrow-${arrowID}`).style.transform = "rotateZ(90deg)";
                                funcSummary.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0].style.display = "inline";
                                const funcDetails = document.createElement("div");
                                const funcName = document.createElement("div");
                                funcName.textContent = `name: ${obj[key].name}`;
                                funcName.style.marginLeft = "44px";
                                funcDetails.appendChild(funcName);
                                const funcLength = document.createElement("div");
                                funcLength.textContent = `length: ${obj[key].length}`;
                                funcLength.style.marginLeft = "44px";
                                funcDetails.appendChild(funcLength);
                                const arrowIDB = (consoleExpansionArrowID++).toString(36);
                                const funcToStringContainer = document.createElement("div");
                                const funcToString = document.createElement("span");
                                funcToString.innerHTML = `<img src="assets/chevron_new_white_right.png" style="width: 22px; height: 22px; vertical-align: bottom; position: absolute; left: 22px; top: 50%; margin-top: -11px; margin-bottom: 11px; image-rendering: pixelated; float: left; display: inline;" id="consoleExpansionArrow-${arrowIDB}"><span style="display: inline; white-space: pre-wrap;">toString: ƒ toString()</span>`;
                                funcToString.style.cursor = "pointer";
                                funcToString.style.marginLeft = "44px";
                                const evaluatedUponFirstExpandingInfo = document.createElement("div");
                                evaluatedUponFirstExpandingInfo.style =
                                    "display: none; white-space: pre-wrap; position: relative; left: 0px; top: 0px; height: 100%;";
                                evaluatedUponFirstExpandingInfo.classList.add("evaluatedUponFirstExpandingInfo");
                                const evaluatedUponFirstExpandingInfoIcon = document.createElement("img");
                                evaluatedUponFirstExpandingInfoIcon.style =
                                    "display: inline; width: 24px; height: 24px; position: relative; left: 0px; top: 50%; margin-top: -12px; margin-bottom: -12px; image-rendering: pixelated;";
                                evaluatedUponFirstExpandingInfoIcon.src = "assets/Information-44f83.png";
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
                                evaluatedUponFirstExpandingInfoText.textContent =
                                    "This value was evaluated upon first expanding. It may have changed since then.";
                                evaluatedUponFirstExpandingInfo.appendChild(evaluatedUponFirstExpandingInfoText);
                                funcToString.appendChild(evaluatedUponFirstExpandingInfo);
                                funcToStringContainer.appendChild(funcToString);
                                funcDetails.appendChild(funcToStringContainer);
                                Object.getOwnPropertySymbols(obj[key]).forEach((symbol) => {
                                    try {
                                        const symbolDetails = document.createElement("div");
                                        symbolDetails.textContent = `${symbol.toString()}: ${JSONB.stringify(obj[key][symbol], undefined, undefined, {
                                            bigint: true,
                                            undefined: true,
                                            Infinity: true,
                                            NegativeInfinity: true,
                                            NaN: true,
                                            get: true,
                                            set: true,
                                            function: true,
                                            class: false,
                                        })}`;
                                        symbolDetails.style.marginLeft = "44px";
                                        funcDetails.appendChild(symbolDetails);
                                    } catch (e) {
                                        console.error(e, e.stack);
                                    }
                                });

                                if (obj[key].__proto__) {
                                    try {
                                        const prototypeExpandableObjectView = createExpandableObjectView(obj[key].__proto__, false, true);
                                        prototypeExpandableObjectView.children[0].children[1].insertAdjacentText("afterbegin", `[[Prototype]]: `);
                                        prototypeExpandableObjectView.style.marginLeft = "44px";
                                        funcDetails.appendChild(prototypeExpandableObjectView);
                                    } catch (e) {
                                        console.error(e, e.stack);
                                    }
                                } else {
                                    console.warn(`No prototype found for ${displayName}`);
                                }

                                funcToString.addEventListener("click", () => {
                                    if (funcToString.nextSibling) {
                                        document.getElementById(`consoleExpansionArrow-${arrowIDB}`).style.transform = "rotateZ(0deg)";
                                        funcToString.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0].style.display = "none";
                                        funcToString.nextSibling.remove();
                                    } else {
                                        document.getElementById(`consoleExpansionArrow-${arrowIDB}`).style.transform = "rotateZ(90deg)";
                                        funcToString.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0].style.display = "inline";
                                        const funcSource = document.createElement("pre");
                                        funcSource.classList.add("funcSource");
                                        funcSource.textContent = obj[key].toString();
                                        funcSource.style.marginLeft = "88px";
                                        funcToStringContainer.appendChild(funcSource);
                                    }
                                });

                                item.appendChild(funcDetails);
                            }
                        });
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
                        })}`;
                    }
                    details.appendChild(item);
                } catch (e) {
                    const exceptionExpandableObjectView = createExpandableObjectView(e, false, false, {
                        summaryValueOverride: `(Exception)`,
                        summaryValueOverride_toStringTag: e?.name ?? e?.[Symbol.toStringTag],
                        displayKey: displayName,
                    });
                    item.appendChild(exceptionExpandableObjectView);
                    details.appendChild(item);
                }
            }
            container.appendChild(details);
        } else {
            try {
                document.getElementById(`consoleExpansionArrow-${arrowID}`).style.transform = "rotateZ(0deg)";
            } catch (e) {
                console.error(e, e.stack);
            }
            summary.getElementsByClassName("evaluatedUponFirstExpandingInfo")[0].style.display = "none";
            container.removeChild(container.childNodes[1]);
        }
    });

    return container;
}

// This is not good enough yet.
/* copyTextToClipboard(
    JSONB.stringify(getAccessibleFacetSpyFacets(), (k, v) => {
        if (typeof v === "object") {
            return v === null
                ? null
                : "slice" in v && !(v instanceof Array)
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
        return typeof v;
    })
); */

/**
 * @param {Parameters<typeof onConsoleLogCallbacks[0]>[0]} data
 */
function consoleOverlayConsoleLogCallback(data) {
    if (data.value.length === 1 && data.value[0]?.startsWith?.('Error "activate-facet-not-found" while using facet ')) {
        return;
    }
    const elem = document.createElement("pre");
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
            if (consoleOverlayTextElement.children.length > 0 && !consoleOverlayTextElement.lastChild?.style?.backgroundColor?.length > 0) {
                elem.style.borderTop = "1px solid #888888";
            }
    }
    elem.textContent = `[${data.timeStamp}] [${data.type}]`;
    for (const v of data.value) {
        if ((typeof v === "object" && v !== null) || typeof v === "function") {
            elem.appendChild(createExpandableObjectView(v, true));
        } else {
            switch (typeof v) {
                case "bigint":
                case "object":
                    elem.textContent += " " + JSONB.stringify(v);
                case "function":
                    elem.textContent += " " + v.toString();
                default:
                    elem.textContent += " " + v;
            }
        }
    }
    consoleOverlayTextElement.appendChild(elem);
}

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

onConsoleLogCallbacks.push(consoleOverlayConsoleLogCallback);

let nonTextKeyCodes = [
    8, 9, 13, 16, 17, 18, 20, 27, 32, 33, 34, 35, 37, 38, 39, 40, 45, 46, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 112, 113, 114, 115, 116, 117, 118, 119,
    120, 121, 122, 123, 195, 196, 197, 198, 199, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210,
];

let types_KeyboardKey = {
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
    CAPS_LOCK: 20,
    ESCAPE: 27,
    SPACE: 32,
    PG_UP: 33,
    PG_DOWN: 34,
    END: 35,
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
    SEMICOLON: 59,
    EQUALS: 61,
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
    MINUS: 109,
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
    COMMA: 188,
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
};

// const container = consoleOverlayTextElement;
// const textBox = createCustomTextBox(container);
// consoleOverlayInputFieldElement.style.display = "contents";
// consoleOverlayElement.appendChild(textBox);

/**
 * Creates a custom text box element.
 *
 * @param {HTMLElement} container - The container element to create the custom text box in.
 * @returns {HTMLDivElement} The created custom text box element.
 *
 * @todo This is a work in progress.
 */
function createCustomTextBox(container) {
    try {
        const textBoxSelection = {
            selectionStart: 0,
            selectionEnd: 0,
        };
        const textBox = document.createElement("div");
        textBox.contentEditable = "true";
        textBox.style.width = "100%";
        textBox.style.height = "200px";
        textBox.style.overflowY = "auto";
        textBox.style.wordWrap = "break-word";
        textBox.style.padding = "10px";
        textBox.style.border = "1px solid #ccc";
        textBox.style.cursor = "text"; // Add cursor
        textBox.tabIndex = 0; // Make focusable
        textBox.classList.add("customTextBox");
        const textBoxValueDisplay = document.createElement("div");
        textBoxValueDisplay.style.width = "100%";
        textBoxValueDisplay.style.height = "100%";
        textBoxValueDisplay.classList.add("customTextBox_valueDisplay");
        textBox.appendChild(textBoxValueDisplay);
        const textBoxTextarea = document.createElement("textarea");
        textBoxTextarea.style.opacity = 0;
        textBoxTextarea.classList.add("customTextBox_textareaElement");

        // Add event listeners for copy, cut, and paste
        textBox.addEventListener("copy", (e) => {
            const selectedText = window.getSelection().toString();
            e.clipboardData.setData("text", selectedText);
            e.preventDefault();
        });

        textBox.addEventListener("cut", (e) => {
            const selectedText = window.getSelection().toString();
            e.clipboardData.setData("text", selectedText);
            textBoxValueDisplay.textContent = textBoxValueDisplay.textContent.replace(selectedText, "");
            e.preventDefault();
        });

        textBox.addEventListener("paste", (e) => {
            const pastedText = e.clipboardData.getData("text");
            const selection = window.getSelection();
            selection.deleteFromDocument();
            textBoxValueDisplay.textContent += pastedText;
            e.preventDefault();
        });

        textBoxValueDisplay.addEventListener("mouseup", () => {
            const selection = window.getSelection();
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
                        newText = text.substring(0, textBoxSelection.selectionStart) + "\n" + text.substring(textBoxSelection.selectionEnd);
                        break;
                    case types_KeyboardKey.ARROW_LEFT:
                        if (textBoxSelection.selectionStart === textBoxSelection.selectionEnd) {
                            if (e.shiftKey) {
                                textBoxSelection.selectionStart -= 1;
                            } else {
                                textBoxSelection.selectionStart -= 1;
                                textBoxSelection.selectionEnd -= 1;
                            }
                        } else if (e.shiftKey) {
                            textBoxSelection.selectionEnd -= 1;
                        } else {
                            textBoxSelection.selectionEnd = textBoxSelection.selectionStart;
                        }
                        break;
                    case types_KeyboardKey.ARROW_RIGHT:
                        if (textBoxSelection.selectionStart === textBoxSelection.selectionEnd) {
                            textBoxSelection.selectionStart += 1;
                            textBoxSelection.selectionEnd += 1;
                        } else if (e.shiftKey) {
                            textBoxSelection.selectionEnd += 1;
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
        console.error(e, e?.stack);
    }
}

/**
 * Add a scrollbar to an HTML element.
 *
 * @param {HTMLElement} element The HTML element to add a scrollbar to.
 */
function addScrollbarToHTMLElement(element) {
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
    scrollbarParent.addEventListener("mousedown", function (event) {
        event.preventDefault();
        var scrollbarParentClientRect = scrollbarParent.getBoundingClientRect();
        mouseDownOnScrollbar = true;
        mousePosOffset = event.clientY - scrollbarParentClientRect.top - scrollbarTop;
        var mouseY = Math.min(
            scrollbarParentClientRect.top + scrollbarParentClientRect.height,
            Math.max(scrollbarParentClientRect.top, event.clientY - mousePosOffset)
        );
        totalHeight = element.scrollHeight;
        visibleHeight = element.parentElement.getBoundingClientRect().height;
        scrollPosition = Math.min(
            Math.max(0, ((mouseY - scrollbarParentClientRect.top) / (scrollbarParentClientRect.height - scrollbarHeight)) * (totalHeight - visibleHeight)),
            totalHeight - visibleHeight
        );
        element.scrollTop = scrollPosition;
        scrollbarHeight = Math.max(60, (visibleHeight / totalHeight) * visibleHeight);
        scrollbarTop = Math.min((scrollPosition / (totalHeight - visibleHeight)) * (visibleHeight - scrollbarHeight), visibleHeight - scrollbarHeight);
        scrollbar.style.height = scrollbarHeight + "px";
        scrollbar.style.top = scrollbarTop + "px";
        scrollbarParent.style.top = element.scrollTop + "px";
    });

    document.addEventListener("mouseup", function (event) {
        if (mouseDownOnScrollbar) {
            event.preventDefault();
            mouseDownOnScrollbar = false;
        }
    });

    document.addEventListener("mousemove", function (event) {
        if (mouseDownOnScrollbar) {
            event.preventDefault();
            var scrollbarParentClientRect = scrollbarParent.getBoundingClientRect();
            var mouseY = Math.min(
                scrollbarParentClientRect.top + scrollbarParentClientRect.height,
                Math.max(scrollbarParentClientRect.top, event.clientY - mousePosOffset)
            );
            totalHeight = element.scrollHeight;
            visibleHeight = element.parentElement.getBoundingClientRect().height;
            scrollPosition = Math.min(
                Math.max(0, ((mouseY - scrollbarParentClientRect.top) / (scrollbarParentClientRect.height - scrollbarHeight)) * (totalHeight - visibleHeight)),
                totalHeight - visibleHeight
            );
            element.scrollTop = scrollPosition;
            scrollbarHeight = Math.max(60, (visibleHeight / totalHeight) * visibleHeight);
            scrollbarTop = Math.min((scrollPosition / (totalHeight - visibleHeight)) * (visibleHeight - scrollbarHeight), visibleHeight - scrollbarHeight);
            scrollbar.style.height = scrollbarHeight + "px";
            scrollbar.style.top = scrollbarTop + "px";
            scrollbarParent.style.top = element.scrollTop + "px";
        }
    });

    // Update the scrollbar position when the div is scrolled
    element.addEventListener("scroll", function () {
        var scrollPosition = element.scrollTop;
        totalHeight = element.scrollHeight;
        visibleHeight = element.parentElement.getBoundingClientRect().height;
        scrollbarHeight = Math.max(60, (visibleHeight / totalHeight) * visibleHeight);
        scrollbarTop = Math.min((scrollPosition / (totalHeight - visibleHeight)) * (visibleHeight - scrollbarHeight), visibleHeight - scrollbarHeight);
        scrollbar.style.height = scrollbarHeight + "px";
        scrollbar.style.top = scrollbarTop + "px";
        scrollbarParent.style.top = Math.min(element.scrollTop, element.scrollHeight - visibleHeight) + "px";
        scrollbarParent.style.height = visibleHeight + "px";
    });
    const mutationObserver = new MutationObserver(() => {
        setTimeout(() => {
            totalHeight = element.scrollHeight;
            visibleHeight = element.parentElement.getBoundingClientRect().height;
            scrollbarHeight = Math.max(60, (visibleHeight / totalHeight) * visibleHeight);
            scrollbarTop = Math.min((element.scrollTop / (totalHeight - visibleHeight)) * (visibleHeight - scrollbarHeight), visibleHeight - scrollbarHeight);
            scrollbar.style.height = scrollbarHeight + "px";
            scrollbar.style.top = scrollbarTop + "px";
            scrollbarParent.style.top = Math.min(element.scrollTop, element.scrollHeight - visibleHeight) + "px";
            scrollbarParent.style.height = visibleHeight + "px";
        }, 10);
    });
    mutationObserver.observe(element, {
        childList: true,
        attributes: true,
        subtree: true,
    });
}

globalThis.litePlayScreenActive = false;

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

/**
 * Enables the lite play screen.
 */
async function enableLitePlayScreen() {
    if (litePlayScreenActive) {
        return;
    }
    litePlayScreenActive = true;
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
        await new Promise((resolve) => setTimeout(resolve, 10));
        i++;
    }
    /**
     * The router facet.
     *
     * @type {FacetTypeMap["core.router"]; | undefined}
     */
    const router = globalThis.getAccessibleFacetSpyFacets?.()["core.router"];
    if (!router) {
        throw new ReferenceError("core.router facet not found");
    }
    /**
     * The original router location.
     */
    const originalRouterLocation = { ...router.history.location };
    if (
        !originalRouterLocation.pathname.startsWith("/ouic/play") ||
        !originalRouterLocation.search
            .replace("?", "")
            .split("&")
            .some((param) => param.split("=")[0] === "isLitePlayScreen" && param.split("=")[1] === "true")
    ) {
        // Array.from(document.getElementById("root").children).forEach((element) => (element.innerHTML = ""));
        router.history.replace(
            `/ouic/play?isLitePlayScreen=true${
                originalRouterLocation.pathname.startsWith("/play/")
                    ? "&tab=" +
                      ({ all: "worlds", realms: "realms", servers: "servers" }[originalRouterLocation.pathname.slice(6)] ??
                          originalRouterLocation.pathname.slice(6))
                    : ""
            }`
        );
        location.reload();
    }
    for (let i = 0; i < 1000; i++) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        if (document.querySelector("div#root > div > div > div > div.vanilla-neutral20-background")) {
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
    const titleBarElement = elements.find((element) => element.classList.contains("vanilla-neutral20-background") && !element.hasAttribute("data-landmark-id"));
    titleBarElement.setAttribute("data-in-use", "true");
    titleBarElement.querySelector("div.vanilla-neutral20-text").textContent = "Play";
    /**
     * The content container element.
     *
     * @type {HTMLDivElement | null}
     */
    const contentContainerElement = elements.find(
        (element) =>
            !element.classList.contains("vanilla-neutral20-background") && element.hasAttribute("data-landmark-id") && !element.hasAttribute("data-in-use")
    );
    contentContainerElement.setAttribute("data-in-use", "true");
    contentContainerElement.innerHTML = `<div style="height: 100%; display: flex; flex-direction: column; justify-content: flex-start; overflow-y: scroll"><div id="litePlayScreen_tabList" style="display: flex; flex-direction: row; width: 90%; margin: 0 5%">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_worldsTabButton" data-tab-id="worlds">Worlds (${
        getAccessibleFacetSpyFacets()["vanilla.localWorldList"]?.localWorlds?.length ?? "..."
    })</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_realmsTabButton" data-tab-id="realms">Realms (${
        getAccessibleFacetSpyFacets()["vanilla.realmsListFacet"]?.realms?.length ?? "..."
    })</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_friendsTabButton" data-tab-id="friends">Friends (${(function getFriendsTabWorldsCount(
        friends,
        lan
    ) {
        return friends !== undefined || lan !== undefined ? (friends ?? 0) + (lan ?? 0) : "...";
    })(
        getAccessibleFacetSpyFacets()["vanilla.friendworldlist"]?.friendWorlds?.length,
        getAccessibleFacetSpyFacets()["vanilla.lanWorldList"]?.lanWorlds.length
    )})</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_serversTabButton" data-tab-id="servers">Servers (${
        getAccessibleFacetSpyFacets()["vanilla.externalServerWorldList"]?.externalServerWorlds?.length ?? "..."
    })</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_featuredTabButton" data-tab-id="featured">Featured (${
        getAccessibleFacetSpyFacets()["vanilla.thirdPartyWorldList"]?.thirdPartyWorlds?.length ?? "..."
    })</button>
</div><div id="litePlayScreen_tabContent" style="display: flex; flex-direction: column; width: 90%; margin: 0 5%; overflow-y: scroll; justify-content: flex-start; flex-grow: 1"></div></div>`;
    const tabContent = document.getElementById("litePlayScreen_tabContent");
    const tabList = document.getElementById("litePlayScreen_tabList");
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
    let currentTab =
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
    const tabIDs = ["worlds", "realms", "friends", "servers", "featured"];
    /**
     * Changes the page and tab.
     *
     * @param {number} page The page to change to.
     * @param {typeof tabIDs[number]} tab The tab to change to.
     * @param {boolean} [clickTab=true] Whether to click the tab button.
     */
    function changePage(page, tab, clickTab = true) {
        currentPage = page;
        currentTab = tab;
        getAccessibleFacetSpyFacets()["core.router"]?.history.replace(
            `/ouic/play/${tab}?${[
                ...router.history.location.search
                    .replace("?", "")
                    .split("&")
                    .filter((param) => !["page", "tab"].includes(param.split("=")[0])),
                `page=${page}`,
                `tab=${tab}`,
            ].join("&")}`
        );
        silentClick = true;
        if (clickTab) {
            tabListButtons[Math.max(0, tabIDs.indexOf(currentTab))].dispatchEvent(new Event("click"));
        }
    }
    for (let i = 0; i < tabListButtons.length; i++) {
        tabListButtons[i].addEventListener("click", () => {
            if (tabListButtons[i].getAttribute("data-tab-id") !== currentTab) {
                if (!silentClick) {
                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                }
                currentPage = 0;
                for (let j = 0; j < tabListButtons.length; j++) {
                    tabListButtons[j].classList.remove("selected");
                }
                tabListButtons[i].classList.add("selected");
                changePage(0, tabIDs[i], false);
            } else if (!tabListButtons[i].classList.contains("selected")) {
                tabListButtons[i].classList.add("selected");
            }
            silentClick = false;
            Array.from(tabContent.children).forEach((element) => element.remove());
            /**
             * The ID of the tab button.
             *
             * @type {typeof tabIDs[number]}
             */
            const tabButtonID = tabListButtons[i].getAttribute("data-tab-id") ?? "worlds";
            switch (tabButtonID) {
                case "worlds": {
                    currentTab = "worlds";
                    const worldListIterable = getAccessibleFacetSpyFacets()["vanilla.localWorldList"]?.localWorlds;
                    /**
                     * The worlds tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    const worldsTabButton = document.getElementById("litePlayScreen_worldsTabButton");
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
                        friendWorldListContainer.appendChild(emptyListInfo);
                    } else {
                        if (currentPage < 0 || currentPage >= pageCount) {
                            changePage(Math.max(0, Math.min(pageCount - 1, 0)), currentTab);
                            return;
                        }
                        const worldList = Array.from(worldListIterable).sort((worldA, worldB) => worldB.lastSaved - worldA.lastSaved);
                        for (let i = currentPage * 5; i < Math.min(worldList.length, (currentPage + 1) * 5); i++) {
                            const world = worldList[i];
                            const worldButtonContainer = document.createElement("div");
                            worldButtonContainer.id = `litePlayScreen_worldsTabWorldList_worldListContainer_worldButtonContainer_${world.id}`;
                            worldButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const worldButton = document.createElement("button");
                            worldButton.type = "button";
                            worldButton.classList.add("btn", "nsel");
                            worldButton.style = "font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2; text-align: left;";
                            worldButton.id = `litePlayScreen_worldsTabWorldList_worldListContainer_worldButton_${world.id}`;
                            const worldButton_worldName = document.createElement("span");
                            worldButton_worldName.style = "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 90%; display: block;";
                            worldButton_worldName.textContent = world.name;
                            worldButton.appendChild(worldButton_worldName);
                            const worldButton_worldDetails = document.createElement("span");
                            worldButton_worldDetails.style =
                                "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 90%; display: block; position: absolute; bottom: 0; left: 0.4rem; font-size: 1vw; line-height: 1.4285714288vw;";
                            worldButton_worldDetails.textContent = `Size: ${world.fileSize} | Version: ${world.gameVersion.major}.${world.gameVersion.minor}.${
                                world.gameVersion.patch
                            }.${world.gameVersion.revision}${world.isBeta ? "-beta" : ""}${
                                world.isMultiplayerEnabled ? " | Multiplayer" : " | Singleplayer"
                            } | ${GameModeIDMap[world.gameMode]}${world.isHardcore ? " | Hardcore" : ""}${world.isExperimental ? " | Experimental" : ""}${
                                world.playerHasDied ? " | Player Has Died" : ""
                            }`;
                            worldButton.appendChild(worldButton_worldDetails);
                            worldButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const worldStartup = getAccessibleFacetSpyFacets()["vanilla.worldStartup"];
                                if (worldStartup) {
                                    worldStartup.startLocalWorld(world.id);
                                }
                            });
                            const editWorldButton = document.createElement("button");
                            editWorldButton.type = "button";
                            editWorldButton.classList.add("btn", "nsel");
                            editWorldButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            editWorldButton.id = `litePlayScreen_worldsTabWorldList_worldListContainer_worldButton_editWorldButton_${world.id}`;
                            const worldID = world.id;
                            editWorldButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const router = getAccessibleFacetSpyFacets()["core.router"];
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
                    tabContent.appendChild(worldListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_worldsTabButtonBar_leftButtons");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1].classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0].classList.add("disabled");
                    }
                    leftButtons.children[0].addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1].addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    const rightButtons = document.getElementById("litePlayScreen_worldsTabButtonBar_rightButtons");
                    rightButtons.children[0].addEventListener("click", () => {
                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        const router = getAccessibleFacetSpyFacets()["core.router"];
                        if (router) {
                            router.history.push(`/start-from-template`);
                        }
                    });
                    rightButtons.children[1].addEventListener("click", () => {
                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        const worldTransfer = getAccessibleFacetSpyFacets()["vanilla.worldTransfer"];
                        if (worldTransfer) {
                            worldTransfer.importWorld.run();
                        }
                    });
                    break;
                }
                case "realms": {
                    currentTab = "realms";
                    const realmListIterable = getAccessibleFacetSpyFacets()["vanilla.realmsListFacet"]?.realms;
                    /**
                     * The realms tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    const realmsTabButton = document.getElementById("litePlayScreen_realmsTabButton");
                    if (realmsTabButton) {
                        realmsTabButton.textContent = `Realms (${realmListIterable?.length ?? 0})`;
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
                    if (!realmListIterable || pageCount === 0) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "No realms found.";
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
                        const realmListA = Array.from(realmListIterable).sort((realmA, realmB) => realmB.lastSaved - realmA.lastSaved);
                        const realmListB = [
                            ...realmListA.filter((realm) => !realm.world.closed && !realm.world.expired),
                            ...realmListA.filter((realm) => realm.world.closed || realm.world.expired),
                        ];
                        const realmList = [...realmListB.filter((realm) => realm.isOwner), ...realmListB.filter((realm) => !realm.isOwner)];
                        for (let i = currentPage * 5; i < Math.min(realmList.length, (currentPage + 1) * 5); i++) {
                            const realm = realmList[i];
                            const realmButtonContainer = document.createElement("div");
                            realmButtonContainer.id = `litePlayScreen_realmsTabRealmList_realmListContainer_realmButtonContainer_${realm.world.id}`;
                            realmButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const realmButton = document.createElement("button");
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
                                realm.world.expired
                                    ? " | Expired"
                                    : realm.world.closed
                                    ? " | Closed"
                                    : realm.isOwner
                                    ? ` | Days Left: ${realm.world.daysLeft}`
                                    : ""
                            } | ${GameModeIDMap[realm.world.gameMode]}${realm.world.isHardcore ? " | Hardcore" : ""}${
                                !realm.world.isInitialized ? " | Not Initialized" : ""
                            }${realm.world.slotName ? ` | Slot: ${realm.world.slotName}` : ""} | Description: ${realm.world.description}`;
                            realmButton.appendChild(realmButton_realmDetails);
                            const realmID = realm.world.id;
                            realmButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                if (networkWorldJoiner) {
                                    networkWorldJoiner.joinRealmWorld(String(realmID), 0);
                                }
                            });
                            realmButtonContainer.appendChild(realmButton);
                            const realmOptionsButton = document.createElement("button");
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
        <p>Status: ${realm.world.expired ? "Expired" : realm.world.closed ? "Closed" : "Open"}</p>
        <p>Players: ${realm.world.onlinePlayers.length}/${realm.world.maxPlayers}${realm.world.full ? " (Full)" : ""}</p>
        <p>Unread Story Count: ${realm.unreadStoryCount}</p>
        <p data-realm-options-overlay-field="description" style="display: ${realm.world.description ? "block" : "none"}"></p>
        <p style="display: ${realm.world.isHardcore ? "block" : "none"}">Hardcore mode is enabled.</p>
        <p style="display: ${!realm.world.isInitialized ? "block" : "none"}">Realm is not initialized.</p>
        <p data-realm-options-overlay-field="lastSaved"></p>
        <p>Realm ID: ${realm.world.id}</p>
        <p>Owner XUID: ${realm.world.ownerXuid}</p>
        <p>Game Mode: ${GameModeIDMap[realm.world.gameMode]}</p>
    </div>
    <div id="realmOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="realmOptionsOverlayElement_joinRealmButton">Join Realm</button>
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="realmOptionsOverlayElement_realmsStoriesButton">Realm Stories</button>
    </div>
</div>`;
                                realmOptionsOverlayElement.querySelector("[data-realm-options-overlay-field='realmName']").textContent = realm.world.realmName;
                                realmOptionsOverlayElement.querySelector(
                                    "[data-realm-options-overlay-field='slotName']"
                                ).textContent = `Slot Name: ${realm.world.slotName}`;
                                realmOptionsOverlayElement.querySelector(
                                    "[data-realm-options-overlay-field='description']"
                                ).textContent = `Description: ${realm.world.description}`;
                                if (realm.world.lastSaved !== null) {
                                    realmOptionsOverlayElement.querySelector(
                                        "[data-realm-options-overlay-field='lastSaved']"
                                    ).textContent = `Last Saved: ${new Date(realm.world.lastSaved * 1000).toLocaleString()}`;
                                } else {
                                    realmOptionsOverlayElement.querySelector("[data-realm-options-overlay-field='lastSaved']").remove();
                                }
                                realmOptionsOverlayElement.querySelector("#realmOptionsOverlayElement_joinRealmButton").addEventListener("click", () => {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                    if (networkWorldJoiner) {
                                        networkWorldJoiner.joinRealmWorld(realmID.toString(), 0);
                                    }
                                });
                                realmOptionsOverlayElement.querySelector("#realmOptionsOverlayElement_realmsStoriesButton").addEventListener("click", () => {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const router = getAccessibleFacetSpyFacets()["core.router"];
                                    if (router) {
                                        router.history.push(`/realms-story-entry-route/feed/${realmID}`);
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
                            if (realm.isOwner) {
                                const editRealmButton = document.createElement("button");
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
                    tabContent.appendChild(realmListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_realmsTabButtonBar_leftButtons");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1].classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0].classList.add("disabled");
                    }
                    leftButtons.children[0].addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1].addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    const rightButtons = document.getElementById("litePlayScreen_realmsTabButtonBar_rightButtons");
                    rightButtons.children[0].addEventListener("click", () => {
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
                     * @type {[...ReturnType<NonNullable<ReturnType<typeof getAccessibleFacetSpyFacets>["vanilla.friendworldlist"]>["friendWorlds"]["slice"]>, ...ReturnType<NonNullable<ReturnType<typeof getAccessibleFacetSpyFacets>["vanilla.lanWorldList"]>["lanWorlds"]["slice"]>]}
                     */
                    const friendWorldList = [
                        ...getAccessibleFacetSpyFacets()["vanilla.friendworldlist"]?.friendWorlds?.slice(0),
                        ...getAccessibleFacetSpyFacets()["vanilla.lanWorldList"]?.lanWorlds?.slice(0),
                    ];
                    /**
                     * The friends tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    const friendsTabButton = document.getElementById("litePlayScreen_friendsTabButton");
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
                            const world = friendWorldList[i];
                            const friendWorldButtonContainer = document.createElement("div");
                            friendWorldButtonContainer.id = `litePlayScreen_friendsTabFriendWorldList_friendWorldListContainer_friendWorldButtonContainer_${world.id}`;
                            friendWorldButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const friendWorldButton = document.createElement("button");
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
                                "friendOfFriendWorld" in world ? (world.friendOfFriendWorld ? " | Friend of Friend" : " | Friend") : " | LAN"
                            } | ${GameModeIDMap[world.gameMode]}${world.isHardcore ? " | Hardcore" : ""}${
                                "ping" in world && world.ping ? ` | Ping: ${world.ping}` : ""
                            }${
                                "address" in world && world.address !== "UNASSIGNED_SYSTEM_ADDRESS" && world.address
                                    ? ` | Address: ${world.address}:${world.port}`
                                    : ""
                            }`;
                            friendWorldButton.appendChild(friendWorldButton_friendWorldDetails);
                            const friendWorldID = world.id;
                            friendWorldButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                if (networkWorldJoiner) {
                                    "friendOfFriendWorld" in world
                                        ? networkWorldJoiner.joinFriendServer(friendWorldID)
                                        : networkWorldJoiner.joinLanServer(friendWorldID);
                                }
                            });
                            friendWorldButtonContainer.appendChild(friendWorldButton);
                            const friendWorldOptionsButton = document.createElement("button");
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
        <p style="display: ${"ownerId" in world ? "block" : "none"}">Owner XUID: ${world.ownerId || "N/A"}</p>
        <p>${"friendOfFriendWorld" in world ? (world.friendOfFriendWorld ? "Friend of Friend" : "Friend") : "LAN"}</p>
        <p>Players: ${world.playerCount}/${world.capacity}</p>
        <p data-friend-world-options-overlay-field="ping" style="display: ${"ping" in world && world.ping ? "block" : "none"}">Ping: ${world.ping || "N/A"}</p>
        <p style="display: ${world.isHardcore ? "block" : "none"}">Hardcore mode is enabled.</p>
        <p data-friend-world-options-overlay-field="address" style="display: ${
            "address" in world && world.address !== "UNASSIGNED_SYSTEM_ADDRESS" && world.address ? "block" : "none"
        }"></p>
        <p>World ID: ${world.id}</p>
        <p>Game Mode: ${GameModeIDMap[world.gameMode]}</p>
    </div>
    <div id="friendWorldOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="friendWorldOptionsOverlayElement_joinFriendWorldButton">Join World</button>
    </div>
</div>`;
                                    friendWorldOptionsOverlayElement.querySelector("[data-friend-world-options-overlay-field='friendWorldName']").textContent =
                                        world.name;
                                    friendWorldOptionsOverlayElement.querySelector("[data-friend-world-options-overlay-field='ownerName']").textContent =
                                        world.ownerName;
                                    friendWorldOptionsOverlayElement
                                        .querySelector("#friendWorldOptionsOverlayElement_joinFriendWorldButton")
                                        .addEventListener("click", () => {
                                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                            const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                            if (networkWorldJoiner) {
                                                "friendOfFriendWorld" in world
                                                    ? networkWorldJoiner.joinFriendServer(friendWorldID)
                                                    : networkWorldJoiner.joinLanServer(friendWorldID);
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
                    tabContent.appendChild(friendWorldListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_friendsTabButtonBar_leftButtons");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1].classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0].classList.add("disabled");
                    }
                    leftButtons.children[0].addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1].addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    const rightButtons = document.getElementById("litePlayScreen_friendsTabButtonBar_rightButtons");
                    rightButtons.children[0].addEventListener("click", () => {
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
                    const serverListIterable = getAccessibleFacetSpyFacets()["vanilla.externalServerWorldList"]?.externalServerWorlds.filter(
                        (server) => server.name !== "LitePlayScreenEnabled" && !server.name.startsWith("INTERNALSETTINGS:")
                    );
                    /**
                     * The servers tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    const serversTabButton = document.getElementById("litePlayScreen_serversTabButton");
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
                        friendWorldListContainer.appendChild(emptyListInfo);
                    } else {
                        if (currentPage < 0 || currentPage >= pageCount) {
                            changePage(Math.max(0, Math.min(pageCount - 1, 0)), currentTab);
                            return;
                        }
                        const serverList = Array.from(serverListIterable).sort((serverA, serverB) => serverA.id - serverB.id);
                        for (let i = currentPage * 5; i < Math.min(serverList.length, (currentPage + 1) * 5); i++) {
                            const server = serverList[i];
                            const serverButtonContainer = document.createElement("div");
                            serverButtonContainer.id = `litePlayScreen_serversTabServerList_serverListContainer_serverButtonContainer_${server.id}`;
                            serverButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const serverButton = document.createElement("button");
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
                            serverButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                if (networkWorldJoiner) {
                                    networkWorldJoiner.joinExternalServer(String(serverID), 0);
                                }
                            });
                            serverButtonContainer.appendChild(serverButton);
                            const serverOptionsButton = document.createElement("button");
                            serverOptionsButton.type = "button";
                            serverOptionsButton.classList.add("btn", "nsel");
                            serverOptionsButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            serverOptionsButton.id = `litePlayScreen_serversTabServerList_serverListContainer_serverButton_editServerButton_${server.id}`;
                            serverOptionsButton.addEventListener("click", () => {
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
        <p>MOTD: ${server.msgOfTheDay}</p>
        <p>Ping: <span>${server.ping}</span></p>
        <p>Players: ${server.playerCount}/${server.capacity}</p>
        <p data-server-options-overlay-field="description" style="display: ${server.description ? "block" : "none"}"></p>
        <p>Server ID: ${server.id}</p>
        <img src="${server.image}" />
        <img data-server-options-overlay-field="image" />
    </div>
    <div id="serverOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="serverOptionsOverlayElement_joinServerButton">Join Server</button>
    </div>
</div>`;
                                    serverOptionsOverlayElement.querySelector("[data-server-options-overlay-field='serverName']").textContent = server.name;
                                    serverOptionsOverlayElement.querySelector(
                                        "[data-server-options-overlay-field='description']"
                                    ).textContent = `Description: ${server.description}`;
                                    serverOptionsOverlayElement.querySelector("#serverOptionsOverlayElement_joinServerButton").addEventListener("click", () => {
                                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                        const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                        if (networkWorldJoiner) {
                                            networkWorldJoiner.joinExternalServer(serverID.toString());
                                        }
                                    });
                                    document.body.appendChild(serverOptionsOverlayElement);
                                    getAccessibleFacetSpyFacets()["vanilla.networkWorldDetails"]?.loadNetworkWorldDetails(serverID, 1);
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
                            editServerButton.type = "button";
                            editServerButton.classList.add("btn", "nsel");
                            editServerButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            editServerButton.id = `litePlayScreen_serversTabServerList_serverListContainer_serverButton_editServerButton_${server.id}`;
                            editServerButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const router = getAccessibleFacetSpyFacets()["core.router"];
                                if (router) {
                                    router.history.push(`/play/servers/${serverID}/external/edit`);
                                }
                            });
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
                    tabContent.appendChild(serverListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_serversTabButtonBar_leftButtons");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1].classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0].classList.add("disabled");
                    }
                    leftButtons.children[0].addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1].addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    const rightButtons = document.getElementById("litePlayScreen_serversTabButtonBar_rightButtons");
                    rightButtons.children[0].addEventListener("click", () => {
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
                    const serverListIterable = getAccessibleFacetSpyFacets()["vanilla.thirdPartyWorldList"]?.thirdPartyWorlds;
                    /**
                     * The featured tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    const featuredTabButton = document.getElementById("litePlayScreen_featuredTabButton");
                    if (featuredTabButton) {
                        featuredTabButton.textContent = `Featured (${serverListIterable?.length ?? 0})`;
                    }
                    const pageCount = Math.ceil((serverListIterable?.length ?? 0) / 5);
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
                    if (!serverListIterable || pageCount === 0) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "No featured servers found.";
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
                        const serverList = Array.from(serverListIterable).sort((serverA, serverB) => serverA.id - serverB.id);
                        for (let i = currentPage * 5; i < Math.min(serverList.length, (currentPage + 1) * 5); i++) {
                            const server = serverList[i];
                            const serverButtonContainer = document.createElement("div");
                            serverButtonContainer.id = `litePlayScreen_featuredTabServerList_serverListContainer_serverButtonContainer_${server.id}`;
                            serverButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const serverButton = document.createElement("button");
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
                            serverButton_serverDetails.textContent = `Players: ${server.playerCount}/${server.capacity}${
                                server.msgOfTheDay ? ` | MOTD: ${server.msgOfTheDay}` : ""
                            } | Ping: ${server.ping} | ${server.description ? `Description: ${server.description}` : ""}`;
                            serverButton.appendChild(serverButton_serverDetails);
                            const serverID = server.id;
                            serverButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                if (networkWorldJoiner) {
                                    networkWorldJoiner.joinExternalServer(String(serverID), 0);
                                }
                            });
                            serverButtonContainer.appendChild(serverButton);
                            const serverOptionsButton = document.createElement("button");
                            serverOptionsButton.type = "button";
                            serverOptionsButton.classList.add("btn", "nsel");
                            serverOptionsButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            serverOptionsButton.id = `litePlayScreen_featuredTabServerList_serverListContainer_serverButton_editServerButton_${server.id}`;
                            serverOptionsButton.addEventListener("click", () => {
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
        <p>MOTD: ${server.msgOfTheDay}</p>
        <p>Ping: <span>${server.ping} (${server.pingStatus})</span></p>
        <p>Players: ${server.playerCount}/${server.capacity}</p>
        <p data-server-options-overlay-field="description"></p>
        <p>Server ID: ${server.id}</p>
        <img data-server-options-overlay-field="image" />
    </div>
    <div id="serverOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="serverOptionsOverlayElement_joinServerButton">Join Server</button>
    </div>
</div>`;
                                    serverOptionsOverlayElement.querySelector("[data-server-options-overlay-field='serverName']").textContent = server.name;
                                    serverOptionsOverlayElement.querySelector(
                                        "[data-server-options-overlay-field='description']"
                                    ).textContent = `Description: ${server.description}`;
                                    serverOptionsOverlayElement.querySelector("#serverOptionsOverlayElement_joinServerButton").addEventListener("click", () => {
                                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                        const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                        if (networkWorldJoiner) {
                                            networkWorldJoiner.joinExternalServer(serverID.toString());
                                        }
                                    });
                                    document.body.appendChild(serverOptionsOverlayElement);
                                    getAccessibleFacetSpyFacets()["vanilla.networkWorldDetails"]?.loadNetworkWorldDetails(serverID, 0);
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
                            editServerButton.type = "button";
                            editServerButton.classList.add("btn", "nsel");
                            editServerButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            editServerButton.id = `litePlayScreen_featuredTabServerList_serverListContainer_serverButton_editServerButton_${server.id}`;
                            editServerButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const router = getAccessibleFacetSpyFacets()["core.router"];
                                if (router) {
                                    router.history.push(`/play/servers/${serverID}/external/edit`);
                                }
                            });
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
                    tabContent.appendChild(serverListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_featuredTabButtonBar_leftButtons");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1].classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0].classList.add("disabled");
                    }
                    leftButtons.children[0].addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1].addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    break;
                }
            }
        });
    }
    silentClick = true;
    tabListButtons[Math.max(0, tabIDs.indexOf(currentTab))].dispatchEvent(new Event("click"));
    if (globalThis.observingExternalServerWorldListForLitePlayScreenServersTab !== true) {
        globalThis.observingExternalServerWorldListForLitePlayScreenServersTab = true;
        facetSpyData.sharedFacets["vanilla.externalServerWorldList"].observe((externalServerWorldList) => {
            /**
             * The servers tab button.
             *
             * @type {HTMLButtonElement | null}
             */
            const serversTabButton = document.getElementById("litePlayScreen_serversTabButton");
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
                const serverButtonContainer = document.getElementById(
                    `litePlayScreen_serversTabServerList_serverListContainer_serverButtonContainer_${server.id}`
                );
                if (serverButtonContainer) {
                    serverButtonContainer.querySelector(
                        `#litePlayScreen_serversTabServerList_serverListContainer_serverButton_${server.id}`
                    ).children[1].textContent = `Players: ${server.playerCount}/${server.capacity}${
                        server.msgOfTheDay ? ` | MOTD: ${server.msgOfTheDay}` : ""
                    } | Ping: ${server.ping} | ID: ${server.id} | ${server.description ? `Description: ${server.description}` : ""}`;
                }
            }
        });
    }
    if (globalThis.observingThirdPartyWorldListForLitePlayScreenServersTab !== true) {
        globalThis.observingThirdPartyWorldListForLitePlayScreenServersTab = true;
        facetSpyData.sharedFacets["vanilla.thirdPartyWorldList"].observe((thirdPartyWorldList) => {
            /**
             * The featured tab button.
             *
             * @type {HTMLButtonElement | null}
             */
            const featuredTabButton = document.getElementById("litePlayScreen_featuredTabButton");
            if (featuredTabButton) {
                featuredTabButton.textContent = `Featured (${thirdPartyWorldList.thirdPartyWorlds.length})`;
            }
            if (currentTab !== "featured") {
                return;
            } /* 
            if (document.getElementById("serverOptionsOverlayElement")) {
            } */
            for (const server of Array.from(thirdPartyWorldList.thirdPartyWorlds)) {
                /**
                 * The server button container.
                 *
                 * @type {HTMLDivElement | null}
                 */
                const serverButtonContainer = document.getElementById(
                    `litePlayScreen_featuredTabServerList_serverListContainer_serverButtonContainer_${server.id}`
                );
                if (serverButtonContainer) {
                    serverButtonContainer.querySelector(
                        `#litePlayScreen_featuredTabServerList_serverListContainer_serverButton_${server.id}`
                    ).children[1].textContent = `Players: ${server.playerCount}/${server.capacity}${
                        server.msgOfTheDay ? ` | MOTD: ${server.msgOfTheDay}` : ""
                    } | Ping: ${server.ping} | ${server.description ? `Description: ${server.description}` : ""}`;
                }
            }
        });
    }
    if (globalThis.observingFriendWorldListForLitePlayScreenFriendsTab !== true) {
        globalThis.observingFriendWorldListForLitePlayScreenFriendsTab = true;
        facetSpyData.sharedFacets["vanilla.friendworldlist"].observe((friendworldList) => {
            if (currentTab !== "friends") {
                return;
            }
            /**
             * The friends tab button.
             *
             * @type {HTMLButtonElement | null}
             */
            const friendsTabButton = document.getElementById("litePlayScreen_friendsTabButton");
            silentClick = true;
            friendsTabButton.dispatchEvent(new Event("click"));
        });
    }
    if (globalThis.observingLANWorldListForLitePlayScreenLanTab !== true) {
        globalThis.observingLANWorldListForLitePlayScreenLanTab = true;
        facetSpyData.sharedFacets["vanilla.lanWorldList"].observe((lanWorldList) => {
            if (currentTab !== "friends") {
                return;
            }
            /**
             * The friends tab button.
             *
             * @type {HTMLButtonElement | null}
             */
            const friendsTabButton = document.getElementById("litePlayScreen_friendsTabButton");
            silentClick = true;
            friendsTabButton.dispatchEvent(new Event("click"));
        });
    }
    if (globalThis.observingNetworkWorldDetailsForLitePlayScreenServersTab !== true) {
        
        globalThis.observingNetworkWorldDetailsForLitePlayScreenServersTab = true;
        facetSpyData.sharedFacets["vanilla.networkWorldDetails"].observe((networkWorldDetails) => {
            if (currentTab !== "servers" && currentTab !== "featured") {
                return;
            }
            /**
             * The server options overlay element.
             *
             * @type {HTMLDivElement | null}
             */
            const serverOptionsOverlayElement = document.getElementById("serverOptionsOverlayElement");
            if (serverOptionsOverlayElement) {
                const imageElement = serverOptionsOverlayElement.querySelector('[data-server-options-overlay-field="image"]');
                if (imageElement) {
                    imageElement.src = networkWorldDetails.networkDetails.imagePath;
                }
            }
        });
    }
} /* 
const a = facetSpyData.sharedFacets["vanilla.screenSpecificOptions"].get();
a.playScreenWorldLayoutMode = 0;
facetSpyData.sharedFacets["vanilla.screenSpecificOptions"].set(a); */

async function disableLitePlayScreen() {
    litePlayScreenActive = false;
}

async function litePlayScreen_friendsMenu() {
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
        await new Promise((resolve) => setTimeout(resolve, 10));
        i++;
    }
    const elements = Array.from(document.querySelectorAll("div#root > div > div > div > div"));
    /**
     * The title bar element.
     *
     * @type {HTMLDivElement | null}
     */
    const titleBarElement = elements.find((element) => element.classList.contains("vanilla-neutral20-background") && !element.hasAttribute("data-in-use"));
    titleBarElement.setAttribute("data-in-use", "true");
    titleBarElement.querySelector("div.vanilla-neutral20-text").textContent = "Friends";
    /**
     * The content container element.
     *
     * @type {HTMLDivElement | null}
     */
    const contentContainerElement = elements.find(
        (element) =>
            !element.classList.contains("vanilla-neutral20-background") && element.hasAttribute("data-landmark-id") && !element.hasAttribute("data-in-use")
    );
    contentContainerElement.setAttribute("data-in-use", "true");
    contentContainerElement.innerHTML = `<div style="height: 100%; display: flex; flex-direction: column; justify-content: flex-start; overflow-y: scroll"><div id="litePlayScreen_tabList" style="display: flex; flex-direction: row; width: 90%; margin: 0 5%">
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_friendsMenu_friendsTabButton" data-tab-id="friends">Friends (${
        getAccessibleFacetSpyFacets()["vanilla.friendsListFacet"]?.xblFriends?.length ?? "..."
    })</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_friendsMenu_recentsTabButton" data-tab-id="recents">Recent (${
        getAccessibleFacetSpyFacets()["vanilla.recentlyPlayedWithList"]?.playerList?.length ?? "..."
    })</button>
    <button type="button" class="btn nsel" style="font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2" id="litePlayScreen_friendsMenu_recommendedTabButton" data-tab-id="recommended">Recommended (${
        getAccessibleFacetSpyFacets()["vanilla.recommendedFriendsList"]?.playerList?.length ?? "..."
    })</button>
</div><div id="litePlayScreen_tabContent" style="display: flex; flex-direction: column; width: 90%; margin: 0 5%; overflow-y: scroll; justify-content: flex-start; flex-grow: 1"></div></div>`;
    const tabContent = document.getElementById("litePlayScreen_tabContent");
    const tabList = document.getElementById("litePlayScreen_tabList");
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
    let currentTab =
        originalRouterLocation.search
            .replace("?", "")
            .split("&")
            .find((param) => param.split("=")[0] === "tab")
            ?.split("=")[1] ?? "worlds";
    let silentClick = false;
    /**
     * The tab IDs.
     *
     * @type {["friends", "recents", "recommended"]}
     */
    const tabIDs = ["friends" /* , "platformFriends" */, "recents", "recommended"];
    /**
     * Changes the page and tab.
     *
     * @param {number} page The page to change to.
     * @param {typeof tabIDs[number]} tab The tab to change to.
     * @param {boolean} [clickTab=true] Whether to click the tab button.
     */
    function changePage(page, tab, clickTab = true) {
        currentPage = page;
        currentTab = tab;
        getAccessibleFacetSpyFacets()["core.router"]?.history.replace(
            `/ouic/friends/${tab}?${[
                ...router.history.location.search
                    .replace("?", "")
                    .split("&")
                    .filter((param) => !["page", "tab"].includes(param.split("=")[0])),
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
            tabListButtons[Math.max(0, tabIDs.indexOf(currentTab))].dispatchEvent(new Event("click"));
        }
    }
    for (let i = 0; i < tabListButtons.length; i++) {
        tabListButtons[i].addEventListener("click", () => {
            if (tabListButtons[i].getAttribute("data-tab-id") !== currentTab) {
                if (!silentClick) {
                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                }
                currentPage = 0;
                for (let j = 0; j < tabListButtons.length; j++) {
                    tabListButtons[j].classList.remove("selected");
                }
                tabListButtons[i].classList.add("selected");
                changePage(0, tabIDs[i], false);
            } else if (!tabListButtons[i].classList.contains("selected")) {
                tabListButtons[i].classList.add("selected");
            }
            silentClick = false;
            Array.from(tabContent.children).forEach((element) => element.remove());
            /**
             * The ID of the tab button.
             *
             * @type {typeof tabIDs[number]}
             */
            const tabButtonID = tabListButtons[i].getAttribute("data-tab-id") ?? "worlds";
            switch (tabButtonID) {
                case "worlds": {
                    currentTab = "worlds";
                    const worldListIterable = getAccessibleFacetSpyFacets()["vanilla.localWorldList"]?.localWorlds;
                    /**
                     * The worlds tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    const worldsTabButton = document.getElementById("litePlayScreen_worldsTabButton");
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
                        friendWorldListContainer.appendChild(emptyListInfo);
                    } else {
                        if (currentPage < 0 || currentPage >= pageCount) {
                            changePage(Math.max(0, Math.min(pageCount - 1, 0)), currentTab);
                            return;
                        }
                        const worldList = Array.from(worldListIterable).sort((worldA, worldB) => worldB.lastSaved - worldA.lastSaved);
                        for (let i = currentPage * 5; i < Math.min(worldList.length, (currentPage + 1) * 5); i++) {
                            const world = worldList[i];
                            const worldButtonContainer = document.createElement("div");
                            worldButtonContainer.id = `litePlayScreen_worldsTabWorldList_worldListContainer_worldButtonContainer_${world.id}`;
                            worldButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const worldButton = document.createElement("button");
                            worldButton.type = "button";
                            worldButton.classList.add("btn", "nsel");
                            worldButton.style = "font-size: 2vw; line-height: 2.8571428572vw; flex-grow: 1; font-family: Minecraft Seven v2; text-align: left;";
                            worldButton.id = `litePlayScreen_worldsTabWorldList_worldListContainer_worldButton_${world.id}`;
                            const worldButton_worldName = document.createElement("span");
                            worldButton_worldName.style = "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 90%; display: block;";
                            worldButton_worldName.textContent = world.name;
                            worldButton.appendChild(worldButton_worldName);
                            const worldButton_worldDetails = document.createElement("span");
                            worldButton_worldDetails.style =
                                "text-overflow: ellipsis; white-space: nowrap; overflow: hidden; width: 90%; display: block; position: absolute; bottom: 0; left: 0.4rem; font-size: 1vw; line-height: 1.4285714288vw;";
                            worldButton_worldDetails.textContent = `Size: ${world.fileSize} | Version: ${world.gameVersion.major}.${world.gameVersion.minor}.${
                                world.gameVersion.patch
                            }.${world.gameVersion.revision}${world.isBeta ? "-beta" : ""}${
                                world.isMultiplayerEnabled ? " | Multiplayer" : " | Singleplayer"
                            } | ${GameModeIDMap[world.gameMode]}${world.isHardcore ? " | Hardcore" : ""}${world.isExperimental ? " | Experimental" : ""}${
                                world.playerHasDied ? " | Player Has Died" : ""
                            }`;
                            worldButton.appendChild(worldButton_worldDetails);
                            worldButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const worldStartup = getAccessibleFacetSpyFacets()["vanilla.worldStartup"];
                                if (worldStartup) {
                                    worldStartup.startLocalWorld(world.id);
                                }
                            });
                            const editWorldButton = document.createElement("button");
                            editWorldButton.type = "button";
                            editWorldButton.classList.add("btn", "nsel");
                            editWorldButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            editWorldButton.id = `litePlayScreen_worldsTabWorldList_worldListContainer_worldButton_editWorldButton_${world.id}`;
                            const worldID = world.id;
                            editWorldButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const router = getAccessibleFacetSpyFacets()["core.router"];
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
                    tabContent.appendChild(worldListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_worldsTabButtonBar_leftButtons");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1].classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0].classList.add("disabled");
                    }
                    leftButtons.children[0].addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1].addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    const rightButtons = document.getElementById("litePlayScreen_worldsTabButtonBar_rightButtons");
                    rightButtons.children[0].addEventListener("click", () => {
                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        const router = getAccessibleFacetSpyFacets()["core.router"];
                        if (router) {
                            router.history.push(`/start-from-template`);
                        }
                    });
                    rightButtons.children[1].addEventListener("click", () => {
                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        const worldTransfer = getAccessibleFacetSpyFacets()["vanilla.worldTransfer"];
                        if (worldTransfer) {
                            worldTransfer.importWorld.run();
                        }
                    });
                    break;
                }
                case "realms": {
                    currentTab = "realms";
                    const realmListIterable = getAccessibleFacetSpyFacets()["vanilla.realmsListFacet"]?.realms;
                    /**
                     * The realms tab button.
                     *
                     * @type {HTMLButtonElement | null}
                     */
                    const realmsTabButton = document.getElementById("litePlayScreen_realmsTabButton");
                    if (realmsTabButton) {
                        realmsTabButton.textContent = `Realms (${realmListIterable?.length ?? 0})`;
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
                    if (!realmListIterable || pageCount === 0) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "No realms found.";
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
                        const realmListA = Array.from(realmListIterable).sort((realmA, realmB) => realmB.lastSaved - realmA.lastSaved);
                        const realmListB = [
                            ...realmListA.filter((realm) => !realm.world.closed && !realm.world.expired),
                            ...realmListA.filter((realm) => realm.world.closed || realm.world.expired),
                        ];
                        const realmList = [...realmListB.filter((realm) => realm.isOwner), ...realmListB.filter((realm) => !realm.isOwner)];
                        for (let i = currentPage * 5; i < Math.min(realmList.length, (currentPage + 1) * 5); i++) {
                            const realm = realmList[i];
                            const realmButtonContainer = document.createElement("div");
                            realmButtonContainer.id = `litePlayScreen_realmsTabRealmList_realmListContainer_realmButtonContainer_${realm.world.id}`;
                            realmButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const realmButton = document.createElement("button");
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
                                realm.world.expired
                                    ? " | Expired"
                                    : realm.world.closed
                                    ? " | Closed"
                                    : realm.isOwner
                                    ? ` | Days Left: ${realm.world.daysLeft}`
                                    : ""
                            } | ${GameModeIDMap[realm.world.gameMode]}${realm.world.isHardcore ? " | Hardcore" : ""}${
                                !realm.world.isInitialized ? " | Not Initialized" : ""
                            }${realm.world.slotName ? ` | Slot: ${realm.world.slotName}` : ""}`;
                            realmButton.appendChild(realmButton_realmDetails);
                            const realmID = realm.world.id;
                            realmButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                if (networkWorldJoiner) {
                                    networkWorldJoiner.joinRealmWorld(String(realmID), 0);
                                }
                            });
                            realmButtonContainer.appendChild(realmButton);
                            const realmOptionsButton = document.createElement("button");
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
        <p>Status: ${realm.world.expired ? "Expired" : realm.world.closed ? "Closed" : "Open"}</p>
        <p>Players: ${realm.world.onlinePlayers.length}/${realm.world.maxPlayers}${realm.world.full ? " (Full)" : ""}</p>
        <p>Unread Story Count: ${realm.unreadStoryCount}</p>
        <p data-realm-options-overlay-field="description" style="display: ${realm.world.description ? "block" : "none"}"></p>
        <p style="display: ${realm.world.isHardcore ? "block" : "none"}">Hardcore mode is enabled.</p>
        <p style="display: ${!realm.world.isInitialized ? "block" : "none"}">Realm is not initialized.</p>
        <p data-realm-options-overlay-field="lastSaved"></p>
        <p>Realm ID: ${realm.world.id}</p>
        <p>Game Mode: ${GameModeIDMap[realm.world.gameMode]}</p>
    </div>
    <div id="realmOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="realmOptionsOverlayElement_joinRealmButton">Join Realm</button>
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="realmOptionsOverlayElement_realmsStoriesButton">Realm Stories</button>
    </div>
</div>`;
                                realmOptionsOverlayElement.querySelector("[data-realm-options-overlay-field='realmName']").textContent = realm.world.realmName;
                                realmOptionsOverlayElement.querySelector(
                                    "[data-realm-options-overlay-field='slotName']"
                                ).textContent = `Slot Name: ${realm.world.slotName}`;
                                realmOptionsOverlayElement.querySelector(
                                    "[data-realm-options-overlay-field='description']"
                                ).textContent = `Description: ${realm.world.description}`;
                                if (realm.world.lastSaved !== null) {
                                    realmOptionsOverlayElement.querySelector(
                                        "[data-realm-options-overlay-field='lastSaved']"
                                    ).textContent = `Last Saved: ${new Date(realm.world.lastSaved * 1000).toLocaleString()}`;
                                } else {
                                    realmOptionsOverlayElement.querySelector("[data-realm-options-overlay-field='lastSaved']").remove();
                                }
                                realmOptionsOverlayElement.querySelector("#realmOptionsOverlayElement_joinRealmButton").addEventListener("click", () => {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                    if (networkWorldJoiner) {
                                        networkWorldJoiner.joinRealmWorld(realmID.toString(), 0);
                                    }
                                });
                                realmOptionsOverlayElement.querySelector("#realmOptionsOverlayElement_realmsStoriesButton").addEventListener("click", () => {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const router = getAccessibleFacetSpyFacets()["core.router"];
                                    if (router) {
                                        router.history.push(`/realms-story-entry-route/feed/${realmID}`);
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
                            if (realm.isOwner) {
                                const editRealmButton = document.createElement("button");
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
                    tabContent.appendChild(realmListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_realmsTabButtonBar_leftButtons");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1].classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0].classList.add("disabled");
                    }
                    leftButtons.children[0].addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1].addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    const rightButtons = document.getElementById("litePlayScreen_realmsTabButtonBar_rightButtons");
                    rightButtons.children[0].addEventListener("click", () => {
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
                     * @type {[...ReturnType<NonNullable<ReturnType<typeof getAccessibleFacetSpyFacets>["vanilla.friendworldlist"]>["friendWorlds"]["slice"]>, ...ReturnType<NonNullable<ReturnType<typeof getAccessibleFacetSpyFacets>["vanilla.lanWorldList"]>["lanWorlds"]["slice"]>]}
                     */
                    const friendWorldList = [
                        ...getAccessibleFacetSpyFacets()["vanilla.friendworldlist"]?.friendWorlds?.slice(0),
                        ...getAccessibleFacetSpyFacets()["vanilla.lanWorldList"]?.lanWorlds?.slice(0),
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
                            const world = friendWorldList[i];
                            const friendWorldButtonContainer = document.createElement("div");
                            friendWorldButtonContainer.id = `litePlayScreen_friendsTabFriendWorldList_friendWorldListContainer_friendWorldButtonContainer_${world.id}`;
                            friendWorldButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const friendWorldButton = document.createElement("button");
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
                                "friendOfFriendWorld" in world ? (world.friendOfFriendWorld ? " | Friend of Friend" : " | Friend") : ""
                            } | ${GameModeIDMap[world.gameMode]}${world.isHardcore ? " | Hardcore" : ""}${
                                "ping" in world && world.ping ? ` | Ping: ${world.ping}` : ""
                            }${
                                "address" in world && world.address !== "UNASSIGNED_SYSTEM_ADDRESS" && world.address
                                    ? ` | Address: ${world.address}:${world.port}`
                                    : ""
                            }`;
                            friendWorldButton.appendChild(friendWorldButton_friendWorldDetails);
                            const friendWorldID = world.id;
                            friendWorldButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                if (networkWorldJoiner) {
                                    "friendOfFriendWorld" in world
                                        ? networkWorldJoiner.joinFriendServer(friendWorldID)
                                        : networkWorldJoiner.joinLanServer(friendWorldID);
                                }
                            });
                            friendWorldButtonContainer.appendChild(friendWorldButton);
                            const friendWorldOptionsButton = document.createElement("button");
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
        <p style="display: ${"ownerId" in world ? "block" : "none"}">Owner XUID: ${world.ownerId}</p>
        <p style="display: ${"friendOfFriendWorld" in world ? "block" : "none"}">${world.friendOfFriendWorld ? "Friend of Friend" : "Friend"}</p>
        <p>Players: ${world.onlinePlayers.length}/${world.maxPlayers}</p>
        <p data-friend-world-options-overlay-field="ping" style="display: ${"ping" in world && world.ping ? "block" : "none"}">Ping: ${world.ping}</p>
        <p style="display: ${world.isHardcore ? "block" : "none"}">Hardcore mode is enabled.</p>
        <p data-friend-world-options-overlay-field="address" style="display: ${
            "address" in world && world.address !== "UNASSIGNED_SYSTEM_ADDRESS" && world.address ? "block" : "none"
        }"></p>
        <p>World ID: ${world.id}</p>
        <p>Game Mode: ${GameModeIDMap[world.gameMode]}</p>
    </div>
    <div id="friendWorldOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="friendWorldOptionsOverlayElement_joinFriendWorldButton">Join World</button>
    </div>
</div>`;
                                friendWorldOptionsOverlayElement.querySelector("[data-friend-options-overlay-field='friendWorldName']").textContent =
                                    world.name;
                                friendWorldOptionsOverlayElement.querySelector("[data-friend-options-overlay-field='ownerName']").textContent = world.ownerName;
                                friendWorldOptionsOverlayElement
                                    .querySelector("#friendWorldOptionsOverlayElement_joinFriendWorldButton")
                                    .addEventListener("click", () => {
                                        getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                        const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                        if (networkWorldJoiner) {
                                            "friendOfFriendWorld" in world
                                                ? networkWorldJoiner.joinFriendServer(friendWorldID)
                                                : networkWorldJoiner.joinLanServer(friendWorldID);
                                        }
                                    });
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
                    tabContent.appendChild(friendWorldListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_friendsTabButtonBar_leftButtons");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1].classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0].classList.add("disabled");
                    }
                    leftButtons.children[0].addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1].addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    break;
                }
                case "servers": {
                    currentTab = "servers";
                    const serverListIterable = getAccessibleFacetSpyFacets()["vanilla.externalServerWorldList"]?.externalServerWorlds.filter(
                        (server) => server.name !== "LitePlayScreenEnabled" && !server.name.startsWith("INTERNALSETTINGS:")
                    );
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
                        friendWorldListContainer.appendChild(emptyListInfo);
                    } else {
                        if (currentPage < 0 || currentPage >= pageCount) {
                            changePage(Math.max(0, Math.min(pageCount - 1, 0)), currentTab);
                            return;
                        }
                        const serverList = Array.from(serverListIterable).sort((serverA, serverB) => serverA.id - serverB.id);
                        for (let i = currentPage * 5; i < Math.min(serverList.length, (currentPage + 1) * 5); i++) {
                            const server = serverList[i];
                            const serverButtonContainer = document.createElement("div");
                            serverButtonContainer.id = `litePlayScreen_serversTabServerList_serverListContainer_serverButtonContainer_${server.id}`;
                            serverButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const serverButton = document.createElement("button");
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
                            serverButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                if (networkWorldJoiner) {
                                    networkWorldJoiner.joinExternalServer(String(serverID), 0);
                                }
                            });
                            serverButtonContainer.appendChild(serverButton);
                            const serverOptionsButton = document.createElement("button");
                            serverOptionsButton.type = "button";
                            serverOptionsButton.classList.add("btn", "nsel");
                            serverOptionsButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            serverOptionsButton.id = `litePlayScreen_serversTabServerList_serverListContainer_serverButton_editServerButton_${server.id}`;
                            serverOptionsButton.addEventListener("click", () => {
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
        <p>MOTD: ${server.msgOfTheDay}</p>
        <p>Ping: <span>${server.ping}</span></p>
        <p>Players: ${server.playerCount}/${server.capacity}</p>
        <p data-server-options-overlay-field="description" style="display: ${server.description ? "block" : "none"}"></p>
        <p style="display: ${server.world.isHardcore ? "block" : "none"}">Hardcore mode is enabled.</p>
        <p style="display: ${!server.world.isInitialized ? "block" : "none"}">Server is not initialized.</p>
        <p data-server-options-overlay-field="lastSaved"></p>
        <p>Server ID: ${server.id}</p>
        <p>Game Mode: ${GameModeIDMap[server.world.gameMode]}</p>
    </div>
    <div id="serverOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="serverOptionsOverlayElement_joinServerButton">Join Server</button>
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="serverOptionsOverlayElement_serversStoriesButton">Server Stories</button>
    </div>
</div>`;
                                serverOptionsOverlayElement.querySelector("[data-server-options-overlay-field='serverName']").textContent = server.name;
                                serverOptionsOverlayElement.querySelector(
                                    "[data-server-options-overlay-field='description']"
                                ).textContent = `Slot Name: ${server.description}`;
                                serverOptionsOverlayElement.querySelector(
                                    "[data-server-options-overlay-field='description']"
                                ).textContent = `Description: ${server.world.description}`;
                                if (server.world.lastSaved !== null) {
                                    serverOptionsOverlayElement.querySelector(
                                        "[data-server-options-overlay-field='lastSaved']"
                                    ).textContent = `Last Saved: ${new Date(server.world.lastSaved * 1000).toLocaleString()}`;
                                } else {
                                    serverOptionsOverlayElement.querySelector("[data-server-options-overlay-field='lastSaved']").remove();
                                }
                                serverOptionsOverlayElement.querySelector("#serverOptionsOverlayElement_joinServerButton").addEventListener("click", () => {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                    if (networkWorldJoiner) {
                                        networkWorldJoiner.joinExternalServer(serverID.toString());
                                    }
                                });
                                serverOptionsOverlayElement.querySelector("#serverOptionsOverlayElement_serversStoriesButton").addEventListener("click", () => {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const router = getAccessibleFacetSpyFacets()["core.router"];
                                    if (router) {
                                        router.history.push(`/servers-story-entry-route/feed/${serverID}`);
                                    }
                                });
                                document.body.appendChild(serverOptionsOverlayElement);
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
                            editServerButton.type = "button";
                            editServerButton.classList.add("btn", "nsel");
                            editServerButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            editServerButton.id = `litePlayScreen_serversTabServerList_serverListContainer_serverButton_editServerButton_${server.id}`;
                            editServerButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const router = getAccessibleFacetSpyFacets()["core.router"];
                                if (router) {
                                    router.history.push(`/play/servers/${serverID}/external/edit`);
                                }
                            });
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
                    tabContent.appendChild(serverListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_serversTabButtonBar_leftButtons");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1].classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0].classList.add("disabled");
                    }
                    leftButtons.children[0].addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1].addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    const rightButtons = document.getElementById("litePlayScreen_serversTabButtonBar_rightButtons");
                    rightButtons.children[0].addEventListener("click", () => {
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
                    const serverListIterable = getAccessibleFacetSpyFacets()["vanilla.thirdPartyWorldList"]?.thirdPartyWorlds;
                    const pageCount = Math.ceil((serverListIterable?.length ?? 0) / 5);
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
                    if (!serverListIterable || pageCount === 0) {
                        const emptyListInfo = document.createElement("p");
                        emptyListInfo.textContent = "No featured servers found.";
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
                        const serverList = Array.from(serverListIterable).sort((serverA, serverB) => serverA.id - serverB.id);
                        for (let i = currentPage * 5; i < Math.min(serverList.length, (currentPage + 1) * 5); i++) {
                            const server = serverList[i];
                            const serverButtonContainer = document.createElement("div");
                            serverButtonContainer.id = `litePlayScreen_featuredTabServerList_serverListContainer_serverButtonContainer_${server.id}`;
                            serverButtonContainer.style = "display: flex; flex-direction: row; width: 100%; height: 6vw; justify-content: space-between;";
                            const serverButton = document.createElement("button");
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
                            serverButton_serverDetails.textContent = `Players: ${server.playerCount}/${server.capacity}${
                                server.msgOfTheDay ? ` | MOTD: ${server.msgOfTheDay}` : ""
                            } | Ping: ${server.ping} | ${server.description ? `Description: ${server.description}` : ""}`;
                            serverButton.appendChild(serverButton_serverDetails);
                            const serverID = server.id;
                            serverButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                if (networkWorldJoiner) {
                                    networkWorldJoiner.joinExternalServer(String(serverID), 0);
                                }
                            });
                            serverButtonContainer.appendChild(serverButton);
                            const serverOptionsButton = document.createElement("button");
                            serverOptionsButton.type = "button";
                            serverOptionsButton.classList.add("btn", "nsel");
                            serverOptionsButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            serverOptionsButton.id = `litePlayScreen_featuredTabServerList_serverListContainer_serverButton_editServerButton_${server.id}`;
                            serverOptionsButton.addEventListener("click", () => {
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
        <p>MOTD: ${server.msgOfTheDay}</p>
        <p>Ping: <span>${server.ping} (${server.pingStatus})</span></p>
        <p>Players: ${server.playerCount}/${server.capacity}</p>
        <p data-server-options-overlay-field="description"></p>
        <p style="display: ${server.world.isHardcore ? "block" : "none"}">Hardcore mode is enabled.</p>
        <p style="display: ${!server.world.isInitialized ? "block" : "none"}">Server is not initialized.</p>
        <p data-server-options-overlay-field="lastSaved"></p>
        <p>Server ID: ${server.id}</p>
        <img src="${server.image}" />
    </div>
    <div id="serverOptionsOverlayElement_buttonsElement" style="display: flex; flex-direction: row; justify-content: space-between; position: absolute; bottom: 0; left: 0; width: 100%; padding: 0.5vh 0.5vh">
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="serverOptionsOverlayElement_joinServerButton">Join Server</button>
        <button type="button" class="btn" style="font-size: 2vw; line-height: 2.8571428572vw; font-family: Minecraft Seven v2; display: table-cell" id="serverOptionsOverlayElement_serversStoriesButton">Server Stories</button>
    </div>
</div>`;
                                serverOptionsOverlayElement.querySelector("[data-server-options-overlay-field='serverName']").textContent = server.name;
                                serverOptionsOverlayElement.querySelector(
                                    "[data-server-options-overlay-field='description']"
                                ).textContent = `Description: ${server.world.description}`;
                                serverOptionsOverlayElement.querySelector("#serverOptionsOverlayElement_joinServerButton").addEventListener("click", () => {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const networkWorldJoiner = getAccessibleFacetSpyFacets()["vanilla.networkWorldJoiner"];
                                    if (networkWorldJoiner) {
                                        networkWorldJoiner.joinExternalServer(serverID.toString());
                                    }
                                });
                                serverOptionsOverlayElement.querySelector("#serverOptionsOverlayElement_serversStoriesButton").addEventListener("click", () => {
                                    getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                    const router = getAccessibleFacetSpyFacets()["core.router"];
                                    if (router) {
                                        router.history.push(`/servers-story-entry-route/feed/${serverID}`);
                                    }
                                });
                                document.body.appendChild(serverOptionsOverlayElement);
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
                            editServerButton.type = "button";
                            editServerButton.classList.add("btn", "nsel");
                            editServerButton.style = "font-size: 2vw; line-height: 2.8571428572vw; width: 6vw; font-family: Minecraft Seven v2;";
                            editServerButton.id = `litePlayScreen_featuredTabServerList_serverListContainer_serverButton_editServerButton_${server.id}`;
                            editServerButton.addEventListener("click", () => {
                                getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                                const router = getAccessibleFacetSpyFacets()["core.router"];
                                if (router) {
                                    router.history.push(`/play/servers/${serverID}/external/edit`);
                                }
                            });
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
                    tabContent.appendChild(serverListContainer);
                    const leftButtons = document.getElementById("litePlayScreen_featuredTabButtonBar_leftButtons");
                    if (currentPage >= pageCount - 1) {
                        leftButtons.children[1].classList.add("disabled");
                    }
                    if (currentPage <= 0) {
                        leftButtons.children[0].classList.add("disabled");
                    }
                    leftButtons.children[0].addEventListener("click", () => {
                        if (currentPage > 0) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.max(currentPage - 1, 0), currentTab);
                    });
                    leftButtons.children[1].addEventListener("click", () => {
                        if (currentPage < pageCount - 1) {
                            getAccessibleFacetSpyFacets()["core.sound"]?.play("random.click", 1, 1);
                        }
                        changePage(Math.min(currentPage + 1, pageCount - 1), currentTab);
                    });
                    break;
                }
            }
        });
    }
    silentClick = true;
    tabListButtons[Math.max(0, tabIDs.indexOf(currentTab))].dispatchEvent(new Event("click"));
}

/**
 * Sets whether the lite play screen is enabled.
 *
 * @param {boolean} value Whether to set the lite play screen to enabled or disabled.
 */
function setLitePlayScreenEnabled(value) {
    if (value) {
        localStorage.setItem("enableLitePlayScreen", "true");
    } else {
        localStorage.removeItem("enableLitePlayScreen");
    }
    const externalServerWorldList = getAccessibleFacetSpyFacets()["vanilla.externalServerWorldList"];
    const existingExternalServerStorage = externalServerWorldList.externalServerWorlds.find((world) => world.name === "LitePlayScreenEnabled");
    if (existingExternalServerStorage) {
        if (!value) {
            externalServerWorldList.removeExternalServerWorld(Number(existingExternalServerStorage.id));
        }
    } else {
        if (value) {
            externalServerWorldList.addExternalServerWorld("LitePlayScreenEnabled", "0.0.0.1", 1);
        }
    }
}

// Enables the lite play screen.
(async function startEnablingLitePlayScreen() {
    for (let i = 0; i < 1000; i++) {
        /**
         * The router facet.
         *
         * @type {FacetTypeMap["core.router"]; | undefined}
         */
        const router = globalThis.getAccessibleFacetSpyFacets?.()["core.router"];
        if (!router) {
            // If the clipboard facet is not available, wait for a short time and try again.
            await new Promise((resolve) => setTimeout(resolve, 10));
            continue;
        }
        /**
         * Loads a custom screen from 8Crafter's Ore UI Customizer.
         *
         * @param {string} pathname The path to load.
         * @returns {Promise<void>} A promise that resolves when the screen is loaded.
         */
        async function loadOUICScreen(pathname) {
            pathname = pathname?.replace(/^\/ouic\//, "");
            switch (true) {
                case pathname.startsWith("play"):
                    await enableLitePlayScreen();
                    break;
                case pathname.startsWith("friends"):
                    await litePlayScreen_friendsMenu();
                    break;
            }
        }
        if (/^\/ouic\//.test(router.history.location.pathname)) {
            await loadOUICScreen(router.history.location.pathname);
        }
        let loadedRouterPositions = router.history.list
            .slice(0)
            .map(
                /** @returns {RouteHistoryItem | undefined} */ (v, i) =>
                    !v.pathname.startsWith("/ouic/") || i === router.history.list.length - 1 ? { ...v } : undefined
            );
        const routerObserveCallback = async (router) => {
            if (router.history.list.length < loadedRouterPositions.length) {
                loadedRouterPositions.splice(router.history.list.length - 1, loadedRouterPositions.length - router.history.list.length);
            } else if (router.history.list.length > loadedRouterPositions.length) {
                loadedRouterPositions.push(
                    ...router.history.list
                        .slice(loadedRouterPositions.length)
                        .map(
                            /** @returns {RouteHistoryItem | undefined} */ (v, i) =>
                                !v.pathname.startsWith("/ouic/") || i === router.history.list.length - 1 ? { ...v } : undefined
                        )
                );
            } else if (
                router.history.list[router.history.list.length - 1].pathname !== loadedRouterPositions[loadedRouterPositions.length - 1].pathname &&
                router.history.list[router.history.list.length - 1].pathname.startsWith("/ouic/") &&
                router.history.list[router.history.list.length - 1].pathname.match(/^\/ouic\/[^\/]+/)?.[0] !==
                    loadedRouterPositions[loadedRouterPositions.length - 1].match(/^\/ouic\/[^\/]+/)?.[0]
            ) {
                loadedRouterPositions[loadedRouterPositions.length - 1] = undefined;
            }
            if (/^\/ouic\//.test(router.history.location.pathname) && loadedRouterPositions[loadedRouterPositions.length - 1] === undefined) {
                await loadOUICScreen(router.history.location.pathname);
            }
        };
        facetSpyData.sharedFacets["core.router"].observe(routerObserveCallback);
        if (
            localStorage.getItem("enableLitePlayScreen") !== null ||
            getAccessibleFacetSpyFacets()["vanilla.externalServerWorldList"].externalServerWorlds.some((world) => world.name === "LitePlayScreenEnabled")
        ) {
            try {
                document.getElementById("8CrafterUtilitiesMenu_button_toggleLitePlayScreen").textContent = "Disable Lite Play Screen";
            } catch (e) {
                console.error(e);
            }
            if (router.history.location.pathname.startsWith("/play/") /*  || /^\/ouic\/play/.test(router.history.location.pathname) */) {
                const originalRouterLocation = { ...router.history.location };
                // router.history.replace(`/play/all` + router.history.location.search + router.history.location.hash);
                // If the router facet is available, enable the lite play screen.
                await enableLitePlayScreen();
            }
        }
        return;
    }
    console.error("Failed to enable lite play screen, timed out.");
})();

/**
 * Copies text to the clipboard.
 *
 * @param {string} text The text to copy to the clipboard.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the text was copied to the clipboard, `false` otherwise.
 */
async function copyTextToClipboard_old(text) {
    try {
        // If the current route has direct access to the clipboard facet, we can copy the text to the clipboard directly.
        if (getAccessibleFacetSpyFacets()["vanilla.clipboard"]?.copyToClipboard) {
            // Copy the text to the clipboard.
            getAccessibleFacetSpyFacets()["vanilla.clipboard"].copyToClipboard(text);
            return true;
        }
    } catch {}
    // If the current route is in the index file, we can open the add friend page in the current context, otherwise it will open in a different context.
    getAccessibleFacetSpyFacets()["core.router"].history.push("/add-friend");
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
            const status = localStorage.getItem("clipboardCopyStatus");
            // Remove the status from the localStorage so it doesn't interfere with future copy operations.
            localStorage.removeItem("clipboardCopyStatus");
            // Check if there was an error during the copy operation.
            if (localStorage.getItem("clipboardCopyError") !== null) {
                // Log the error to the console.
                console.error("Failed to copy text to clipboard:", localStorage.getItem("clipboardCopyError"));
                // Remove the error from the localStorage so it doesn't interfere with future copy operations.
                localStorage.removeItem("clipboardCopyError");
            }
            // Return whether or not the copy operation was successful.
            return status === "success";
        }
        /**
         * The clipboard facet.
         *
         * @type {{copyToClipboard(text: string): void, [k: PropertyKey]: any} | undefined}
         */
        const clipboardFacet = globalThis.getAccessibleFacetSpyFacets?.()["vanilla.clipboard"];
        if (!clipboardFacet) {
            // If the clipboard facet is not available, wait for a short time and try again.
            await new Promise((resolve) => setTimeout(resolve, 10));
            continue;
        }
        // If the clipboard facet is available, copy the text to the clipboard.
        clipboardFacet.copyToClipboard(text);

        // Remove the text to copy from the localStorage so it doesn't interfere with future copy operations.
        localStorage.removeItem("textToCopy");
        // Close the add friend page and return to the previous page.
        getAccessibleFacetSpyFacets()["core.router"].history.goBack();
        return true;
    }
    return false;
}

/**
 * Copies text to the clipboard.
 *
 * @param {string} text The text to copy to the clipboard.
 * @returns {boolean} `true` if the text was copied to the clipboard, `false` otherwise.
 */
function copyTextToClipboard(text) {
    if (getAccessibleFacetSpyFacets()["vanilla.clipboard"]?.copyToClipboard) {
        getAccessibleFacetSpyFacets()["vanilla.clipboard"].copyToClipboard(text);
        return true;
    }
    return false;
}

// For if the copy function is run from a file other than the index JS file.
if (localStorage.getItem("textToCopy") !== null) {
    // Set a flag to indicate that the copy function is running.
    globalThis.copying = true;
    (async function copyTextToClipboard() {
        try {
            for (let i = 0; i < 1000; i++) {
                /**
                 * The clipboard facet.
                 *
                 * @type {{copyToClipboard(text: string): void, [k: PropertyKey]: any} | undefined}
                 */
                const clipboardFacet = globalThis.getAccessibleFacetSpyFacets?.()["vanilla.clipboard"];
                if (!clipboardFacet) {
                    // If the clipboard facet is not available, wait for a short time and try again.
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    continue;
                }
                // If the clipboard facet is available, copy the text to the clipboard.
                clipboardFacet.copyToClipboard(localStorage.getItem("textToCopy"));

                // Remove the text to copy from the localStorage so it doesn't interfere with future copy operations.
                localStorage.removeItem("textToCopy");
                // Set the status of the copy operation to success.
                localStorage.setItem("clipboardCopyStatus", "success");
                // Close the add friend page and return to the previous page and context.
                getAccessibleFacetSpyFacets()["core.router"].history.goBack();
                return true;
            }
        } catch (e) {
            // If the copy operation failed, store the error in the localStorage so it can be accessed in the context and route that triggered the copy operation.
            localStorage.setItem("clipboardCopyError", e + e.stack);
            // If the copy operation failed, store the error in a global variable for debugging purposes.
            globalThis.copyError = e;
            // Log the error to the console.
            console.error("Failed to copy text to clipboard:", e, e.stack);
        }
        // If the copy operation failed, remove the text to copy from the localStorage so it doesn't interfere with future copy operations.
        localStorage.removeItem("textToCopy");
        // Set the status of the copy operation to failed.
        localStorage.setItem("clipboardCopyStatus", "failed");

        // Close the add friend page and return to the previous page and context.
        getAccessibleFacetSpyFacets()["core.router"].history.goBack();
        return false;
    })();
}

(() => {
    document.getElementsByTagName("html")[0].classList.add("dark_theme");

    // Hovered element HTML content overlay, accessed with CTRL+O.
    let element = document.createElement("div");
    element.innerHTML = `<div id="textDisplayBoxRootA" style="pointer-events: none; background-color: #00000080; color: #FFFFFFFF; width: 100vw; height: 50vh; position: fixed; top: 0; left: 0; z-index: 10000000; display: none; white-space: pre-wrap; overflow-wrap: anywhere">Nothing selected!</div>`;
    window.document.body.appendChild(element);
    screenDisplayElement = document.getElementById("textDisplayBoxRootA");

    // General element debug info overlay, accessed with CTRL+ALT+I.
    element = document.createElement("div");
    element.id = "elementGeneralDebugOverlayElement";
    element.setAttribute(
        "style",
        "pointer-events: none; background-color: #00000080; color: #FFFFFFFF; width: 100vw; height: 25vh; position: fixed; top: 0; left: 0; z-index: 10000000; display: none; white-space: pre-wrap; overflow-wrap: anywhere;"
    );
    window.document.body.appendChild(element);
    elementGeneralDebugOverlayElement = document.getElementById("elementGeneralDebugOverlayElement");

    // Small corner debug info overlay, accessed with CTRL+I.
    element = document.createElement("div");
    element.id = "smallCornerDebugOverlayElement";
    element.setAttribute(
        "style",
        "pointer-events: none; background-color: #00000080; color: #FFFFFFFF; width: auto; height: auto; position: fixed; top: 0; right: 0; z-index: 10000000; display: none; white-space: pre-wrap; overflow-wrap: anywhere;"
    );
    element.textContent = "Nothing selected!";
    window.document.body.appendChild(element);
    smallCornerDebugOverlayElement = document.getElementById("smallCornerDebugOverlayElement");

    // CSS Editor, accessed with CTRL+P.
    element = document.createElement("div");
    element.innerHTML = `<div id="cssEditorBoxRootA" style="background-color: #00000080; color: #FFFFFFFF; width: 500px; height: 500px; max-width: 100%; max-height: 100%; position: fixed; top: 0; left: 0; z-index: 10000000; display: none;" draggable="true">
    <div id="cssEditor_mainDiv" style="display: block;">
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
    </div> -->
</div>`;
    window.document.body.appendChild(element);
    cssEditorDisplayElement = document.getElementById("cssEditorBoxRootA");
    cssEditorTextBox = document.getElementById("cssEditorTextBoxA");
    cssEditorErrorText = document.getElementById("cssEditorErrorText");
    cssEditorSelectTargetButton = document.getElementById("cssEditorSelectTargetButton");
    // cssEditorTextBox.onkeypress = function (/** @type {KeyboardEvent} */ e) {
    //     e.stopPropagation();
    // };

    // Console overlay, accessed with CTRL+ALT+C.
    element = document.createElement("div");
    element.id = "consoleOverlayElement";
    element.setAttribute(
        "style",
        "background-color: #00000080; color: #FFFFFFFF; width: 95vw; height: 95vh; position: fixed; top: 2.5vh; left: 2.5vw; z-index: 10000000; display: none; white-space: pre-wrap; overflow-wrap: anywhere;/*  font-family: unset; */"
    );
    element.innerHTML = `<button type="button" style="position: absolute; top: 0; right: 0; font-family: Minecraft Seven v2; font-size: 50px; aspect-ratio: 1/1; color: #000000; width: 50px; height: 50px; z-index: 1;" onclick="consoleOverlayElement.style.display = 'none';"><span style="margin-top: -5px; font-family: Minecraft Seven v2;">x</span></button>
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
    window.document.body.appendChild(element);
    consoleOverlayElement = document.getElementById("consoleOverlayElement");
    consoleOverlayTextElement = document.getElementById("consoleOverlayTextElement");
    consoleOverlayInputFieldElement = document.getElementById("consoleOverlayInputFieldElement");

    // setInterval(()=>console.log(consoleOverlayInputFieldElement.value), 1000)

    // 8Crafter Utilities Main Menu, accessed with CTRL+M.
    element = document.createElement("div");
    element.innerHTML = `<div id="mainMenu8CrafterUtilities" style="background-color: #00000080; color: #FFFFFFFF; width: 75vw; height: 75vh; position: fixed; top: 12.5vh; left: 12.5vw; z-index: 20000000; display: none; backdrop-filter: blur(5px); border: 5px solid #87CEEb;" draggable="true">
    <div id="8CrafterUtilitiesMenu_leftSidebar" style="display: block; height: 100%; width: 30%; border-right: 5px solid #87CEEb; position: absolute; top: 0; left: 0;">
        <button type="button" class="btn nsel selected" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_general" onclick="setMainMenu8CrafterUtilitiesTab('general'); event.preventDefault();">General</button>
        <button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_UIs" onclick="setMainMenu8CrafterUtilitiesTab('UIs'); event.preventDefault();">UIs</button>
        <button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_about" onclick="setMainMenu8CrafterUtilitiesTab('about'); event.preventDefault();">About</button>
        <button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_autoJoin" onclick="setMainMenu8CrafterUtilitiesTab('autoJoin'); event.preventDefault();">Auto Rejoin</button>
        <!--<button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_router" onclick="setMainMenu8CrafterUtilitiesTab('router'); event.preventDefault();">Router</button>-->
        <button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_tabButton_performance" onclick="setMainMenu8CrafterUtilitiesTab('performance'); event.preventDefault();">Performance</button>
    </div>
    <div id="8CrafterUtilitiesMenu_rightSide" style="display: block; height: 100%; width: 70%; border-right: 5px solid #87CEEb; position: absolute; top: 0; right: 0; padding: 1rem; padding-right: 10px; overflow-y: scroll;" class="addScrollbar">
        <div id="8CrafterUtilitiesMenu_general" style="display: block;">
            <center>
                <h1>8Crafter Utilities</h1>
            </center>
            <p>
                <span style="white-space: pre-wrap;"><b>Version:</b> v${
                    typeof oreUICustomizerVersion !== "undefined" ? oreUICustomizerVersion : window.oreUICustomizerVersion
                }</span>
            </p>
            <p>
                <span style="white-space: pre-wrap;"><b>Config:</b> ${JSON.stringify(
                    typeof oreUICustomizerConfig !== "undefined" ? oreUICustomizerConfig : window.oreUICustomizerConfig,
                    undefined,
                    4
                )}</span>
            </p>
        </div>
        <div id="8CrafterUtilitiesMenu_UIs" style="display: none;">
            <center>
                <h1>UIs</h1>
            </center>
            <button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_viewHTMLSource" onclick="toggleHTMLSourceCodePreviewElement(); event.preventDefault();">View HTML Source</button>
            <button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_CSSEditor" onclick="cssEditorDisplayElement.style.display = cssEditorDisplayElement.style.display === 'none' ? 'block' : 'none'; event.preventDefault();">CSS Editor</button>
            <button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_smallCornerDebugOverlayElement" onclick="toggleSmallCornerDebugOverlay(); event.preventDefault();">Small Corner Debug Overlay</button>
            <button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_elementGeneralDebugOverlayElement" onclick="toggleGeneralDebugOverlayElement(); event.preventDefault();">Element General Debug Overlay</button>
            <button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_consoleOverlay" onclick="toggleConsoleOverlay(); event.preventDefault();">Console</button>
        </div>
        <div id="8CrafterUtilitiesMenu_about" style="display: none;">
            <center>
                <h1>About</h1>
            </center>
            <p>
                8Crafter's Ore UI Customizer v${typeof oreUICustomizerVersion !== "undefined" ? oreUICustomizerVersion : window.oreUICustomizerVersion}
            </p>
            <p>
                Source: https://www.dev.8crafter.com/utilities/ore-ui-customizer
            </p>
            <h3>Support</h3>
            <p>
                Discord: https://discord.gg/jrCTeHGuhx
            </p>
            <p>
                GitHub: https://github.com/8Crafter-Studios/8Crafter.github.io
            </p>
            <p>
                Email: 8crafteryt@gmail.com
            </p>
        </div>
        <div id="8CrafterUtilitiesMenu_autoJoin" style="display: none;">
            <center>
                <h1>Auto Rejoin</h1>
            </center>
            <button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_enableAutoRejoin" onclick="enableAutoJoinForOpenServer(); event.preventDefault();">Enable Auto Rejoin</button>
            <button type="button" class="btn nsel disabled" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_disableAutoRejoin" disabled onclick="window.localStorage.removeItem('autoJoinName'); window.localStorage.removeItem('autoJoinType'); document.getElementById("8CrafterUtilitiesMenu_span_autoJoinName").textContent = 'None'; document.getElementById("8CrafterUtilitiesMenu_span_autoJoinType").textContent = 'None'; this.setAttribute('disabled', true); this.classList.add('disabled'); event.preventDefault();">Disable Auto Rejoin</button>
            <h4 style="margin-bottom: 0;">Auto Rejoin Details</h4>
            <p style="margin-top: 0; margin-bottom: 0;">
Name: <span id="8CrafterUtilitiesMenu_span_autoJoinName">None</span>
            </p>
            <p style="margin-top: 0;">
Type: <span id="8CrafterUtilitiesMenu_span_autoJoinType">None</span>
            </p>
        </div><!--
        <div id="8CrafterUtilitiesMenu_router" style="display: none;">
            <center>
                <h1>Router</h1>
            </center>
            <button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_enableAutoRejoin" onclick="enableAutoJoinForOpenServer(); event.preventDefault();">Enable Auto Rejoin</button>
            <button type="button" class="btn nsel disabled" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_disableAutoRejoin" disabled onclick="window.localStorage.removeItem('autoJoinName'); window.localStorage.removeItem('autoJoinType'); document.getElementById("8CrafterUtilitiesMenu_span_autoJoinName").textContent = 'None'; document.getElementById("8CrafterUtilitiesMenu_span_autoJoinType").textContent = 'None'; this.setAttribute('disabled', true); this.classList.add('disabled'); event.preventDefault();">Disable Auto Rejoin</button>
            <h4 style="margin-bottom: 0;">Auto Rejoin Details</h4>
            <p style="margin-top: 0; margin-bottom: 0;">
Name: <span id="8CrafterUtilitiesMenu_span_autoJoinName">None</span>
            </p>
            <p style="margin-top: 0;">
Type: <span id="8CrafterUtilitiesMenu_span_autoJoinType">None</span>
            </p>
        </div>-->
        <div id="8CrafterUtilitiesMenu_performance" style="display: none;">
            <center>
                <h1>Performance</h1>
            </center>
            <button type="button" class="btn nsel" style="font-size: 0.5in; line-height: 0.7142857143in;" id="8CrafterUtilitiesMenu_button_toggleLitePlayScreen" onclick="if (localStorage.getItem('enableLitePlayScreen') === 'true') {this.textContent = 'Enable Lite Play Screen'; setLitePlayScreenEnabled(false); disableLitePlayScreen();} else {this.textContent = 'Disable Lite Play Screen'; setLitePlayScreenEnabled(true); enableLitePlayScreen();}; event.preventDefault();">${
                localStorage.getItem("enableLitePlayScreen") === "true" ? "Disable" : "Enable"
            } Lite Play Screen</button>
        </div>
    </div>
</div>`;
    window.document.body.appendChild(element);
    mainMenu8CrafterUtilities = document.getElementById("mainMenu8CrafterUtilities");
    element = document.createElement("div");
    element.innerHTML = `<div id="screenInputBlocker" style="background-color: #00000080; color: #FFFFFFFF; width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; z-index: 9999999; display: none;"></div>`;
    window.document.body.appendChild(element);
    screenInputBlocker = document.getElementById("screenInputBlocker");
    element = document.createElement("div");
    element.id = "htmlSourceCodePreviewElement";
    element.setAttribute(
        "style",
        `background-color: #000000C0; color: #FFFFFFFF; width: 95vw; height: 95vh; position: fixed; top: 2.5vh; left: 2.5vw; z-index: 10000001; display: none; overflow: scroll; scrollbar-width: thin;`
    );
    element.classList.add("addScrollbar");
    element.innerHTML = `<button type="button" style="position: absolute; top: 0; right: 0; font-family: Minecraft Seven v2; font-size: 50px; aspect-ratio: 1/1; color: #000000; width: 50px; height: 50px;" onclick="htmlSourceCodePreviewElement.style.display = 'none';"><span style="margin-top: -5px">x</span></button><p style="width: 100%;"></p>`;
    window.document.body.appendChild(element);
    htmlSourceCodePreviewElement = document.getElementById("htmlSourceCodePreviewElement");
    htmlSourceCodePreviewElementP = document.getElementById("htmlSourceCodePreviewElement").querySelector("p");
    element = document.createElement("style");
    element.id = "customGlobalCSSStyle";
    window.document.head.appendChild(element);
    customGlobalCSSStyleElement = document.getElementById("customGlobalCSSStyle");

    cssEditorTextBox.addEventListener("mouseup", () => {
        const caretPosition = cssEditorTextBox.selectionStart;
        screenDisplayElement.textContent = "Caret position: " + caretPosition;
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
    window.onkeyup = function (/** @type {KeyboardEvent} */ e) {
        heldKeys = heldKeys.filter((key) => key !== e.key.toLowerCase());
        heldKeyCodes = heldKeyCodes.filter((key) => key !== e.keyCode);
        if (e.key.toLowerCase() === "p" && e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            // cssEditorInSelectMode = false;
            // if (cssEditorDisplayElement.style.display === "block") {
            //     cssEditorDisplayElement.style.display = "none";
            // } else {
            //     cssEditorDisplayElement.style.display = "block";
            // }
        } else if (e.key.toLowerCase() === "o" && e.ctrlKey) {
            e.preventDefault();
            // screenDisplayElement.style.display = "block";
            // if (currentDebugMode === "none") {
            //     currentDebugMode = "hoveredElementDetails";
            // } else {
            //     screenDisplayElement.style.display = "none";
            //     currentDebugMode = "none";
            // }
        } else if (e.key.toLowerCase() === "i" && e.ctrlKey && !e.altKey) {
            e.preventDefault();
        } else if (e.key.toLowerCase() === "i" && e.ctrlKey && e.altKey) {
            e.preventDefault();
        } else if (e.key.toLowerCase() === "m" && e.ctrlKey && e.altKey) {
            e.preventDefault();
        } else if (e.key.toLowerCase() === "c" && e.ctrlKey && e.altKey) {
            e.preventDefault();
        } else if (e.key.toLowerCase() === "u" && e.ctrlKey) {
            e.preventDefault();
            // screenDisplayElement.style.display = "block";
            // if (currentDebugMode === "none") {
            //     currentDebugMode = "hoveredElementDetails";
            // } else {
            //     screenDisplayElement.style.display = "none";
            //     currentDebugMode = "none";
            // }
        } else if (e.key.toLowerCase() === "s" && cssEditorInSelectMode && e.target !== cssEditorSelectTargetButton) {
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
        }
    };
    window.onkeydown = function (/** @type {KeyboardEvent} */ e) {
        heldKeys = [...heldKeys.filter((key) => key !== e.key.toLowerCase()), e.key.toLowerCase()];
        heldKeyCodes = [...heldKeyCodes.filter((key) => key !== e.keyCode), e.keyCode];
        if (e.key.toLowerCase() === "p" && e.ctrlKey && !e.shiftKey) {
            e.preventDefault();
            cssEditorInSelectMode = false;
            if (cssEditorDisplayElement.style.display === "block") {
                cssEditorDisplayElement.style.display = "none";
            } else {
                cssEditorDisplayElement.style.display = "block";
            }
        } else if (e.key.toLowerCase() === "o" && e.ctrlKey) {
            e.preventDefault();
            screenDisplayElement.style.display = "block";
            if (currentDebugMode === "none") {
                currentDebugMode = "hoveredElementDetails";
            } else {
                screenDisplayElement.style.display = "none";
                currentDebugMode = "none";
            }
        } else if (e.key.toLowerCase() === "i" && e.ctrlKey && !e.altKey) {
            e.preventDefault();
            toggleSmallCornerDebugOverlay();
        } else if (e.key.toLowerCase() === "i" && e.ctrlKey && e.altKey) {
            e.preventDefault();
            toggleGeneralDebugOverlayElement();
        } else if (e.key.toLowerCase() === "m" && e.ctrlKey && e.altKey) {
            e.preventDefault();
            if (mainMenu8CrafterUtilities.style.display === "none") {
                mainMenu8CrafterUtilities.style.display = "block";
            } else {
                mainMenu8CrafterUtilities.style.display = "none";
            }
        } else if (e.key.toLowerCase() === "c" && e.ctrlKey && e.altKey) {
            e.preventDefault();
            toggleConsoleOverlay();
        } else if (e.key.toLowerCase() === "u" && e.ctrlKey) {
            e.preventDefault();
            toggleHTMLSourceCodePreviewElement();
        } else if (e.key.toLowerCase() === "s" && cssEditorInSelectMode && currentMouseHoverTarget !== cssEditorSelectTargetButton) {
            e.preventDefault();
            cssEditorInSelectMode = false;
            /**
             * @type {HTMLElement & EventTarget}
             */
            const srcElement = currentMouseHoverTarget;
            cssEditorSelectedType = "element";
            cssEditorSelectedElement = srcElement;
            cssEditorTextBox.value = srcElement.getAttribute("style") ?? "";
            setCSSEditorMode("element");
            cssEditorDisplayElement.style.display = "block";
        }
    };
    window.onmousedown = function (/** @type {KeyboardEvent} */ e) {
        if (cssEditorInSelectMode && e.target !== cssEditorSelectTargetButton) {
            e.preventDefault();
            // cssEditorInSelectMode = false;
            /**
             * @type {HTMLElement & EventTarget}
             */
            const srcElement = currentMouseHoverTarget;
            cssEditorSelectedType = "element";
            cssEditorSelectedElement = srcElement;
            cssEditorTextBox.value = srcElement.getAttribute("style") ?? "";
            setCSSEditorMode("element");
            cssEditorDisplayElement.style.display = "block";
            screenInputBlocker.style.display = "block";

            // document.getElementById("root").style.pointerEvents = "none";
            // document.getElementById("root").style.filter = "brightness(5)";
        }
    };
    window.onmouseup = function (/** @type {KeyboardEvent} */ e) {
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
    window.onmousemove = function (/** @type {MouseEvent} */ e) {
        /**
         * @type {HTMLElement & EventTarget}
         */
        const srcElement = e.target;
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
    currentMouseHoverTarget.getAttributeNames().length > 0
        ? currentMouseHoverTarget
              .getAttributeNames()
              .map((name) => `${name}: ${currentMouseHoverTarget.getAttribute(name)}`)
              .join("\n")
        : "None"
}`;
        }
        if (smallCornerDebugOverlayElement.style.display === "block") {
            smallCornerDebugOverlayElement.textContent = `Client: x: ${e.clientX} y: ${e.clientY}
Offset x: ${e.offsetX} y: ${e.offsetY}
Page: x: ${e.pageX} y: ${e.pageY}
Screen: x: ${e.screenX} y: ${e.screenY}
Layer: x: ${e.layerX} y: ${e.layerY}
Movement: x: ${e.movementX} y: ${e.movementY}
Held Keys: ${heldKeys}
Held Key Codes: ${heldKeyCodes}`;
        }
    };

    /**
     *
     * @param {MouseEvent} event
     */
    function updateCursorPosition(event) {
        mousePos.clientX = event.clientX;
        mousePos.clientY = event.clientY;
        mousePos.offsetX = event.offsetX;
        mousePos.offsetY = event.offsetY;
        mousePos.pageX = event.pageX;
        mousePos.pageY = event.pageY;
        mousePos.screenX = event.screenX;
        mousePos.screenY = event.screenY;
        mousePos.layerX = event.layerX;
        mousePos.layerY = event.layerY;
        mousePos.movementX = event.movementX;
        mousePos.movementY = event.movementY;
    }
    document.addEventListener("mousemove", updateCursorPosition);
    document.querySelectorAll(".addScrollbar").forEach(addScrollbarToHTMLElement);
})();
