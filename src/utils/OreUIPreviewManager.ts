import { net, session } from "@electron/remote";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export class OreUIPreviewManager {
    public static activePreviews: OreUIPreview[] = [];
    public static createPreview(...args: ConstructorParameters<typeof OreUIPreview>): OreUIPreview {
        const preview: OreUIPreview = new OreUIPreview(...args);
        this.activePreviews.push(preview);
        return preview;
    }
}

// OreUIPreviewManager.createPreview(8927, {
//     guiDistPath: String.raw`C:\XboxGames\Minecraft Preview for Windows\Content\data\gui\dist`,
//     vanillaResourcePacksContainerFolderPath: String.raw`C:\XboxGames\Minecraft Preview for Windows\Content\data\resource_packs`,
//     textsPath: String.raw`C:\XboxGames\Minecraft Preview for Windows\Content\data\resource_packs`,
// });

declare global {
    interface Window {
        logOreUIPreviewLoadedResourceLocations?: boolean | undefined;
    }
}

export class OreUIPreview {
    public readonly previewOptions: {
        /**
         * @default `/play`
         */
        readonly pathname?: string;
        /**
         * @default `/hbui/index.html`
         */
        readonly file?: string;
        /**
         * @default `chase-the-skies`
         */
        readonly panorama?: string;
        /**
         * @default `true`
         */
        readonly use_translation?: boolean;
        /**
         * @default `en_US`
         */
        readonly locale?: string;
        /**
         * Other options.
         */
        readonly [option: string]: any;
    };
    #status: "loading" | "running" | "closed" | "error" = "loading";
    public get status(): "loading" | "running" | "closed" | "error" {
        return this.#status;
    }
    private httpServer?: import("node:http").Server;
    private window?: Electron.BrowserWindow;
    public constructor(
        /**
         * @example 8927
         */
        public readonly port: number,
        public readonly paths: {
            readonly guiDistPath: string;
            readonly textsPath?: string | undefined;
            readonly vanillaResourcePacksContainerFolderPath?: string | undefined;
        },
        previewOptions: OreUIPreview["previewOptions"] = {}
    ) {
        this.previewOptions = {
            ...previewOptions,
            pathname: previewOptions.pathname ?? "/play",
            file: previewOptions.file ?? "/hbui/index.html",
            panorama: previewOptions.panorama ?? "chase-the-skies",
            use_translation: !!paths.textsPath && (previewOptions.use_translation ?? true),
            locale: previewOptions.locale ?? "en_US",
        };
        const { app, BrowserWindow, globalShortcut, Menu } = require("@electron/remote") as typeof import("@electron/remote");
        const express = require("express") as typeof import("express");
        const server = express();
        server.get("/hbui/@ore-ui-types/enums", (req, res) => {
            const moduleFilePath = path.join(paths.guiDistPath, "hbui", "@ore-ui-types", "enums");

            if (existsSync(moduleFilePath)) {
                res.setHeader("Content-Type", "application/javascript");
                return res.sendFile(moduleFilePath);
            }

            res.sendStatus(404);
        });
        server.use("/__vgmstream__", express.static(path.join(process.env.resourcesPath ?? process.resourcesPath, "ore-ui-viewer/libs/vgmstream")));
        server.use(express.static(paths.guiDistPath));
        server.use(express.static(path.join(process.env.resourcesPath ?? process.resourcesPath, "ore-ui-viewer")));
        if (paths.vanillaResourcePacksContainerFolderPath) {
            server.get(/rp\/.+/, (req, res) => {
                const folders = readdirSync(paths.vanillaResourcePacksContainerFolderPath!, { withFileTypes: true })
                    .filter((dirent) => dirent.isDirectory())
                    .toSorted((a, b) =>
                        a.name.startsWith("vanilla") && !b.name.startsWith("vanilla") ? 1
                        : b.name.startsWith("vanilla") && !a.name.startsWith("vanilla") ? -1
                        : a.name.startsWith("vanilla") && b.name.startsWith("vanilla") ?
                            a.name === "vanilla" ? 1
                            : b.name === "vanilla" ? -1
                            : -a.name.localeCompare(b.name)
                        :   a.name.localeCompare(b.name)
                    );
                for (const folder of folders) {
                    if (!existsSync(path.join(paths.vanillaResourcePacksContainerFolderPath!, folder.name, req.path.replace("/rp/", "")))) continue;
                    res.sendFile(path.join(paths.vanillaResourcePacksContainerFolderPath!, folder.name, req.path.replace("/rp/", "")));
                    if (window.logOreUIPreviewLoadedResourceLocations)
                        console.debug(folder.name, path.join(paths.vanillaResourcePacksContainerFolderPath!, folder.name, req.path.replace("/rp/", "")));
                    return;
                }
                for (const folder of folders) {
                    for (const extension of [
                        ".tga",
                        ".svg",
                        ".gif",
                        ".apng",
                        ".png",
                        ".jpg",
                        ".jpeg",
                        ".jfif",
                        ".pjpeg",
                        ".pjp",
                        ".webp",
                        ".avif",
                        ".bmp",
                        ".ico",
                        ".cur",
                        ".tif",
                        ".tiff",
                    ]) {
                        if (!existsSync(path.join(paths.vanillaResourcePacksContainerFolderPath!, folder.name, req.path.replace("/rp/", "") + extension)))
                            continue;
                        res.sendFile(path.join(paths.vanillaResourcePacksContainerFolderPath!, folder.name, req.path.replace("/rp/", "") + extension));
                        if (window.logOreUIPreviewLoadedResourceLocations)
                            console.debug(folder.name, path.join(paths.vanillaResourcePacksContainerFolderPath!, folder.name, req.path.replace("/rp/", "")));
                        return;
                    }
                }
                res.sendStatus(404);
            });
        }

        const debug = true;
        // console.log("\x1B[0m" + new Date().toLocaleTimeString() + " \x1B[33m\x1B[1m[INFO] \x1B[0m- Starting.");

        if (!debug) registerShortcuts();
        this.httpServer = server.listen(port, (error?: Error): void => {
            // console.log(
            //     "\x1B[0m" +
            //         new Date().toLocaleTimeString() +
            //         " \x1B[33m\x1B[1m[INFO] \x1B[0m- The server is now running on port \x1B[33m" +
            //         port +
            //         "\x1B[0m!"
            // );

            if (error) {
                console.error(error);
                this.#status = "error";
                return;
            }

            this.#status = "running";

            Object.assign(this, { port });

            createWindow();
        });

        function registerShortcuts() {
            globalShortcut.register("Control+R", () => false);
            globalShortcut.register("Control+Shift+R", () => false);
        }

        const createWindow = () => {
            // console.log("\x1B[0m" + new Date().toLocaleTimeString() + " \x1B[33m\x1B[1m[INFO] \x1B[0m- Creating the window");

            const windowId = port; /* Math.random().toString(36).substring(2, 9) */
            const uniquePartition = `ui-preview-${windowId}`;

            // const isolatedSession = session.fromPartition(uniquePartition);

            this.window = new BrowserWindow({
                minWidth: 1010,
                minHeight: 640,
                width: 1070,
                height: 648,
                title: "Preview - Ore UI Customizer",
                icon: require("path").join(process.env.resourcesPath ?? process.resourcesPath, "ore-ui-viewer/src/assets/mcpreview.png"), // IDEA: Make a custom icon, maybe like a version of the Ore UI Customizer icon but with an eye icon on it.
                autoHideMenuBar: true,
                resizable: true,
                titleBarStyle: "default",
                webPreferences: {
                    preload: require("path").join(process.env.resourcesPath ?? process.resourcesPath, "ore-ui-viewer/engine.js"),
                    devTools: debug,
                    webgl: true,
                    webSecurity: false /* true */, // TEMP // DEBUG
                    nodeIntegration: true,
                    nodeIntegrationInWorker: true,
                    contextIsolation: false,
                    additionalArguments: [
                        `--config-data=${JSON.stringify(JSON.stringify(this.previewOptions))}`,
                        `--cubemap-images-path=${JSON.stringify("resource://images/cubemap/")}`,
                        ...(paths.textsPath ? [`--texts-path=${JSON.stringify(paths.textsPath)}`] : []),
                        ...(paths.vanillaResourcePacksContainerFolderPath ?
                            [`--ddui-path=${JSON.stringify(paths.vanillaResourcePacksContainerFolderPath)}`]
                        :   []),
                        ...(paths.vanillaResourcePacksContainerFolderPath ?
                            [`--vanilla-resource-packs-path=${JSON.stringify(paths.vanillaResourcePacksContainerFolderPath)}`]
                        :   []),
                    ],
                    partition: uniquePartition,
                },
            });

            ipcRenderer.sendSync<1>("register-ore-ui-preview-protocol-handlers", uniquePartition, `${windowId}`, port);

            const baseMenu = Menu.getApplicationMenu();

            const newMenu = Menu.buildFromTemplate([
                {
                    role: "fileMenu",
                    submenu: [
                        {
                            role: "toggleDevTools",
                            visible: false,
                            accelerator: "F12",
                        },
                        ...(baseMenu?.items[0]?.submenu?.items ?? []),
                    ],
                },
                ...(baseMenu?.items.slice(1) ?? []),
            ] as Electron.MenuItemConstructorOptions[]);

            this.window.setMenu(newMenu);

            // (require("@electron/remote/main") as typeof import("@electron/remote/main")).enable(this.window.webContents);

            this.window.show();
            this.window.loadURL(`http://localhost:${port}/hbui`);
            //             this.window.webContents.executeJavaScript(`document.head.insertAdjacentHTML("afterbegin", \`<script type="importmap">
            // {
            //   "imports": {
            //     "@ore-ui-types/enums": "/hbui/@ore-ui-types/enums"
            //   }
            // }
            // </script>\`);`);
            this.window.on("closed", (): void => {
                this.httpServer?.close((error?: Error): void => {
                    if (error) {
                        console.error(error);
                        this.#status = "error";
                        return;
                    }
                    this.#status = "closed";
                });
            });
        };
    }
    public close(): void {
        this.window?.close();
    }
    public forceClose(): void {
        this.window?.destroy();
    }
}

window.addEventListener("beforeunload", (): void => {
    OreUIPreviewManager.activePreviews.forEach((preview: OreUIPreview): void => void (preview.status === "running" && preview.forceClose()));
});

getCurrentWindow().on("closed", (): void => {
    OreUIPreviewManager.activePreviews.forEach((preview: OreUIPreview): void => void (preview.status === "running" && preview.forceClose()));
});
