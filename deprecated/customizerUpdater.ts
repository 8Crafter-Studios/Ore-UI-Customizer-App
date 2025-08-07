// @ts-nocheck
import { API_DEPENDENCY_LIST_URL, API_FOLDER_PATH, API_SOURCE_WEBSITE_URL, API_VERSION_URL, APP_DATA_FOLDER_PATH } from "./URLs";
import fs, { mkdir, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import semver from "semver";
const { dialog: dialog_main } = require("electron") as typeof import("electron");
import { Octokit } from "@octokit/rest";
import { resolve as resolveURL } from "node:url";

let dialog = dialog_main;
dialog ??= (require("@electron/remote") as typeof import("@electron/remote")).dialog;

export interface APIVersionJSON {
    version: string;
    minimum_compatible_cli_version: string;
    minimum_compatible_app_version: string;
}

/**
 * Gets the latest version details of 8Crafter's Ore UI Customizer.
 *
 * @returns A promise that resolves with the latest version details of 8Crafter's Ore UI Customizer, or `undefined` if there is no internet connection or the API is unreachable.
 */
export async function getLatestOreUICustomizerVersion(): Promise<APIVersionJSON | undefined> {
    try {
        const data: APIVersionJSON = await (await fetch(API_VERSION_URL)).json();
        return data;
    } catch (e: any) {
        console.error(e, (e as any)?.stack);
        return undefined;
    }
}

/**
 * Checks if the current version of 8Crafter's Ore UI Customizer is the latest version.
 *
 * @returns A promise that resolves with `true` if the current version of 8Crafter's Ore UI Customizer is the latest version, `false` if it is not, or `undefined` if there is no internet connection or the API is unreachable.
 */
export async function checkIfCurrentOreUICustomizerVersionIsLatest(): Promise<boolean | undefined> {
    const latestOreUICustomizerVersion: APIVersionJSON | undefined = await getLatestOreUICustomizerVersion();
    if (latestOreUICustomizerVersion === undefined) {
        return undefined;
    } else {
        const currentOreUICustomizerVersion: string | undefined = getCurrentOreUICustomizerVersion()?.version;
        if (currentOreUICustomizerVersion === undefined) {
            return false;
        }
        return semver.compareBuild(latestOreUICustomizerVersion.version, currentOreUICustomizerVersion) !== 1;
    }
}

export function getCurrentOreUICustomizerVersion(): APIVersionJSON | undefined {
    if (fs.existsSync(path.join(APP_DATA_FOLDER_PATH, "./api/version.json"))) {
        return require(path.join(APP_DATA_FOLDER_PATH, "./api/version.json"));
    } else {
        return undefined;
    }
}

export function isLocalAPICopyDownloaded(): boolean {
    return fs.existsSync(path.join(APP_DATA_FOLDER_PATH, "./api/version.json"));
}

export async function downloadLocalAPICopy(parentWindow?: Electron.BrowserWindow | undefined): Promise<void> {
    const progressBar = new ProgressBar({
        detail: "Getting version information...",
        abortOnError: true,
        indeterminate: true,
        title: "Preparing to Download Latest Version",
        text: "Preparing to download the latest Ore UI Customizer version...",
        browserWindow: {
            closable: false,
            parent: parentWindow,
            icon: "./resources/icon.png",
        },
        completionEnabled: false,
    });
    const latestOreUICustomizerVersion: APIVersionJSON | undefined = await getLatestOreUICustomizerVersion();
    if (latestOreUICustomizerVersion === undefined) {
        progressBar.close();
        dialog.showMessageBox({
            type: "error",
            title: "Error",
            message:
                "There was an error getting the latest version of 8Crafter's Ore UI Customizer, check your internet connection and then go to Help > Check for Customizer Updates to try again.",
            buttons: ["Okay"],
            noLink: true,
        });
        return;
    }
    if (semver.compareBuild(latestOreUICustomizerVersion.minimum_compatible_app_version, VERSION) === 1) {
        progressBar.close();
        dialog.showMessageBox({
            type: "error",
            title: "App Update Required",
            message: `This version of the app does not support the latest version of 8Crafter's Ore UI Customizer. Please update the app to v${latestOreUICustomizerVersion.minimum_compatible_app_version} or higher.`,
            buttons: ["Okay"],
            noLink: true,
        });
        return;
    }
    if (!fs.existsSync(path.join(APP_DATA_FOLDER_PATH, "./api/"))) {
        fs.mkdirSync(path.join(APP_DATA_FOLDER_PATH, "./api/"), { recursive: true });
    }
    fs.writeFileSync(path.join(APP_DATA_FOLDER_PATH, "./api/version.json"), JSON.stringify(latestOreUICustomizerVersion));
    progressBar.detail = "Getting dependency information...";
    var dependencyListResponse: Response = await fetch(API_DEPENDENCY_LIST_URL);
    // console.log(API_DEPENDENCY_LIST_URL);
    // console.log(new URL(API_FOLDER_PATH, API_SOURCE_WEBSITE_URL).href);
    if (!dependencyListResponse.ok) {
        progressBar.close();
        dialog.showMessageBox({
            type: "error",
            title: "Error",
            message: `An error occurred while getting the dependency list.\n${dependencyListResponse.status} (${dependencyListResponse.statusText})`,
            buttons: ["Okay"],
            noLink: true,
        });
    }
    const dependencyList: DependenciesData = await dependencyListResponse.json();
    function getTotalDependenciesCountInDependency(dependency: DependenciesDataDependency | DependenciesData): number {
        if (dependency.dependencies === undefined) {
            return 1;
        } else {
            return dependency.dependencies.map(getTotalDependenciesCountInDependency).reduce((a: number, b: number): number => a + b, 0) + 1;
        }
    }
    const dependencyFileCount: number = getTotalDependenciesCountInDependency(dependencyList);
    let dependenciesDownloaded: number = 0;
    progressBar.title = "Downloading...";
    progressBar.text = "Downloading...";
    progressBar.detail = `Downloading dependencies (0/${dependencyFileCount})...`;
    progressBar.indeterminate = false;
    progressBar.maxValue = dependencyFileCount;
    progressBar.value = 0;
    try {
        mkdirSync(path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists", path.dirname(dependencyList.main_script.js)), {
            recursive: true,
        });
        const dependencyData: Response = await fetch(
            resolveURL(API_SOURCE_WEBSITE_URL, path.posix.join("api", "dependency_lists", dependencyList.main_script.js))
        );
        if (!dependencyData.ok) {
            progressBar.setProgressBarMode("error");
            progressBar._window?.setClosable(true);
            dialog.showMessageBox({
                type: "error",
                title: "Error",
                message: `An error occurred while downloading the dependencies (${dependenciesDownloaded + 1}).\n${dependencyData.status} (${
                    dependencyData.statusText
                })\n${resolveURL(API_SOURCE_WEBSITE_URL, path.posix.join("api", "dependency_lists", dependencyList.main_script.js))}`,
                buttons: ["Okay"],
                noLink: true,
            });
            return;
        }
        writeFileSync(path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists", dependencyList.main_script.js), await dependencyData.text());
        if (dependencyList.main_script.dts !== undefined) {
            try {
                mkdirSync(path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists", path.dirname(dependencyList.main_script.dts)), {
                    recursive: true,
                });
                const dependencyData: Response = await fetch(
                    resolveURL(API_SOURCE_WEBSITE_URL, path.posix.join("api", "dependency_lists", dependencyList.main_script.dts))
                );
                if (dependencyData.ok) {
                    writeFileSync(
                        path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists", dependencyList.main_script.dts),
                        await dependencyData.text()
                    );
                }
            } catch (e: any) {
                console.error(e, e?.stack);
            }
        }
        if (dependencyList.main_script.ts !== undefined) {
            try {
                mkdirSync(path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists", path.dirname(dependencyList.main_script.ts)), {
                    recursive: true,
                });
                const dependencyData: Response = await fetch(
                    resolveURL(API_SOURCE_WEBSITE_URL, path.posix.join("api", "dependency_lists", dependencyList.main_script.ts))
                );
                if (dependencyData.ok) {
                    writeFileSync(
                        path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists", dependencyList.main_script.ts),
                        await dependencyData.text()
                    );
                }
            } catch (e: any) {
                console.error(e, e?.stack);
            }
        }
        if (dependenciesDownloaded === dependencyFileCount - 1) {
            progressBar.detail = "Finalizing dependencies...";
            progressBar.value = ++dependenciesDownloaded;
        } else {
            progressBar.detail = `Downloading dependencies (${dependenciesDownloaded++ + 1}/${dependencyFileCount})...`;
            progressBar.value = dependenciesDownloaded;
        }
        let stop: boolean = false;
        async function downloadDependencies(dependencies: DependenciesDataDependency[], baseURL: string, destinationFolder: string): Promise<void> {
            for (const dependency of dependencies) {
                mkdirSync(path.join(destinationFolder, path.dirname(dependency.js)), { recursive: true });
                const dependencyData: Response = await fetch(resolveURL(baseURL, dependency.js));
                if (!dependencyData.ok) {
                    progressBar.setProgressBarMode("error");
                    progressBar._window?.setClosable(true);
                    dialog.showMessageBox({
                        type: "error",
                        title: "Error",
                        message: `An error occurred while downloading the dependencies (${dependenciesDownloaded + 1}).\n${dependencyData.status} (${
                            dependencyData.statusText
                        })\n${resolveURL(baseURL, dependency.js)}`,
                        buttons: ["Okay"],
                        noLink: true,
                    });
                    stop = true;
                    return;
                }
                writeFileSync(path.join(destinationFolder, dependency.js), await dependencyData.text());
                if (dependency.dts !== undefined) {
                    try {
                        mkdirSync(path.join(destinationFolder, path.dirname(dependency.dts)), { recursive: true });
                        const dependencyData: Response = await fetch(resolveURL(baseURL, dependency.dts));
                        if (dependencyData.ok) {
                            writeFileSync(path.join(destinationFolder, dependency.dts), await dependencyData.text());
                        }
                    } catch (e: any) {
                        console.error(e, e?.stack);
                    }
                }
                if (dependency.ts !== undefined) {
                    try {
                        mkdirSync(path.join(destinationFolder, path.dirname(dependency.ts)), { recursive: true });
                        const dependencyData: Response = await fetch(resolveURL(baseURL, dependency.ts));
                        if (dependencyData.ok) {
                            writeFileSync(path.join(destinationFolder, dependency.ts), await dependencyData.text());
                        }
                    } catch (e: any) {
                        console.error(e, e?.stack);
                    }
                }
                if (dependenciesDownloaded === dependencyFileCount - 1) {
                    progressBar.detail = "Finalizing dependencies...";
                    progressBar.value = ++dependenciesDownloaded;
                } else {
                    progressBar.detail = `Downloading dependencies (${dependenciesDownloaded++ + 1}/${dependencyFileCount})...`;
                    progressBar.value = dependenciesDownloaded;
                }
                dependency.dependencies && (await downloadDependencies(dependency.dependencies, baseURL, destinationFolder));
            }
        }
        await downloadDependencies(
            dependencyList.dependencies,
            API_DEPENDENCY_LIST_URL,
            path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists")
        );
        if (stop) return;
    } catch (e: any) {
        console.error(e, e?.stack);
        progressBar.setProgressBarMode("error");
        progressBar._window?.setClosable(true);
        dialog.showMessageBox({
            type: "error",
            title: "Error",
            message: `An error occurred while downloading the dependencies.\n${e.message}${e?.stack ?? ""}`,
            buttons: ["Okay"],
            noLink: true,
        });
        return;
    }
    progressBar.title = "Downloading...";
    progressBar.text = "Downloading...";
    progressBar.detail = `Fetching assets list...`;
    progressBar.indeterminate = true;
    const octokit = new Octokit();
    const assetsList: (
        | Exclude<Awaited<ReturnType<Octokit["repos"]["getContent"]>>["data"], any[]>
        | Exclude<
              Awaited<ReturnType<Octokit["repos"]["getContent"]>>["data"],
              Exclude<Awaited<ReturnType<Octokit["repos"]["getContent"]>>["data"], any[]>
          >[number]
    )[] = [];
    async function getAssetsList(owner: string, repo: string, path: string): Promise<void> {
        const response: Awaited<ReturnType<Octokit["repos"]["getContent"]>> = await octokit.repos.getContent({
            owner,
            repo,
            path,
        });
        if (response.status === 200) {
            const data:
                | [item: Exclude<Awaited<ReturnType<Octokit["repos"]["getContent"]>>["data"], any[]>]
                | Exclude<
                      Awaited<ReturnType<Octokit["repos"]["getContent"]>>["data"],
                      Exclude<Awaited<ReturnType<Octokit["repos"]["getContent"]>>["data"], any[]>
                  > = response.data instanceof Array ? response.data : [response.data];
            for (const item of data) {
                if (item.type === "dir") {
                    await getAssetsList(owner, repo, item.path);
                } else if (item.type === "file") {
                    assetsList.push(item);
                }
            }
        } else {
            progressBar.close();
            dialog.showMessageBox({
                type: "error",
                title: "Error",
                message: `An error occurred while getting the dependency list.\n${response.status}`,
                buttons: ["Okay"],
                noLink: true,
            });
        }
    }
    await getAssetsList("8Crafter-Studios", "8Crafter.github.io", "assets/oreui");
    let assetsDownloaded: number = 0;
    progressBar.detail = `Downloading assets (0/${assetsList.length})...`;
    progressBar.indeterminate = false;
    progressBar.maxValue = assetsList.length;
    progressBar.value = 0;
    try {
        for (const asset of assetsList) {
            mkdirSync(path.join(APP_DATA_FOLDER_PATH, "api/assets", path.dirname(asset.name)), { recursive: true });
            if (asset.download_url) {
                var response = await fetch(new URL(asset.download_url, "https://api.github.com"));
            } else {
                console.warn(asset.path, "is missing a download url.");
                continue;
            }
            writeFileSync(path.join(APP_DATA_FOLDER_PATH, "api/assets", asset.name), await response.bytes());
            if (assetsDownloaded === assetsList.length - 1) {
                progressBar.detail = "Finalizing assets...";
                progressBar.value = ++assetsDownloaded;
            } else {
                progressBar.detail = `Downloading assets (${assetsDownloaded++ + 1}/${assetsList.length})...`;
                progressBar.value = assetsDownloaded;
            }
        }
    } catch (e: any) {
        console.error(e, e?.stack);
        progressBar.setProgressBarMode("error");
        progressBar._window?.setClosable(true);
        dialog.showMessageBox({
            type: "error",
            title: "Error",
            message: `An error occurred while downloading the assets.\n${e.message}${e?.stack ?? ""}`,
            buttons: ["Okay"],
            noLink: true,
        });
        return;
    }
    progressBar.close();
}

export async function updateLocalAPICopy(parentWindow?: Electron.BrowserWindow | undefined): Promise<void> {
    const progressBar = new ProgressBar({
        detail: "Getting version information...",
        abortOnError: true,
        indeterminate: true,
        title: "Preparing to Update",
        text: "Preparing to update...",
        browserWindow: {
            closable: false,
            parent: parentWindow,
            icon: "./resources/icon.png",
        },
        completionEnabled: false,
    });
    const latestOreUICustomizerVersion: APIVersionJSON | undefined = await getLatestOreUICustomizerVersion();
    if (latestOreUICustomizerVersion === undefined) {
        progressBar.close();
        dialog.showMessageBox({
            type: "error",
            title: "Error",
            message: "There was an error checking for updates, check your internet connection and try again.",
            buttons: ["Okay"],
            noLink: true,
        });
        return;
    }
    if (semver.compareBuild(latestOreUICustomizerVersion.minimum_compatible_app_version, VERSION) === 1) {
        progressBar.close();
        dialog.showMessageBox({
            type: "error",
            title: "App Update Required",
            message: `This version of the app does not support the latest version of 8Crafter's Ore UI Customizer. Please update the app to v${latestOreUICustomizerVersion.minimum_compatible_app_version} or higher.`,
            buttons: ["Okay"],
            noLink: true,
        });
        return;
    }
    if (fs.existsSync(path.join(APP_DATA_FOLDER_PATH, "./api/"))) {
        readdirSync(path.join(APP_DATA_FOLDER_PATH, "./api/")).forEach((file) =>
            fs.rmSync(path.join(APP_DATA_FOLDER_PATH, "./api/", file), { recursive: true, force: true })
        );
    } else {
        fs.mkdirSync(path.join(APP_DATA_FOLDER_PATH, "./api/"), { recursive: true });
    }
    fs.writeFileSync(path.join(APP_DATA_FOLDER_PATH, "./api/version.json"), JSON.stringify(latestOreUICustomizerVersion));
    progressBar.detail = "Getting dependency information...";
    var dependencyListResponse: Response = await fetch(API_DEPENDENCY_LIST_URL);
    // console.log(API_DEPENDENCY_LIST_URL);
    // console.log(new URL(API_FOLDER_PATH, API_SOURCE_WEBSITE_URL).href);
    if (!dependencyListResponse.ok) {
        progressBar.close();
        dialog.showMessageBox({
            type: "error",
            title: "Error",
            message: `An error occurred while getting the dependency list.\n${dependencyListResponse.status} (${dependencyListResponse.statusText})`,
            buttons: ["Okay"],
            noLink: true,
        });
    }
    const dependencyList: DependenciesData = await dependencyListResponse.json();
    function getTotalDependenciesCountInDependency(dependency: DependenciesDataDependency | DependenciesData): number {
        if (dependency.dependencies === undefined) {
            return 1;
        } else {
            return dependency.dependencies.map(getTotalDependenciesCountInDependency).reduce((a: number, b: number): number => a + b, 0) + 1;
        }
    }
    const dependencyFileCount: number = getTotalDependenciesCountInDependency(dependencyList);
    let dependenciesDownloaded: number = 0;
    progressBar.title = "Updating...";
    progressBar.text = "Updating...";
    progressBar.detail = `Downloading dependencies (0/${dependencyFileCount})...`;
    progressBar.indeterminate = false;
    progressBar.maxValue = dependencyFileCount;
    progressBar.value = 0;
    try {
        mkdirSync(path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists", path.dirname(dependencyList.main_script.js)), {
            recursive: true,
        });
        const dependencyData: Response = await fetch(
            resolveURL(API_SOURCE_WEBSITE_URL, path.posix.join("api", "dependency_lists", dependencyList.main_script.js))
        );
        if (!dependencyData.ok) {
            progressBar.setProgressBarMode("error");
            progressBar._window?.setClosable(true);
            dialog.showMessageBox({
                type: "error",
                title: "Error",
                message: `An error occurred while downloading the dependencies (${dependenciesDownloaded + 1}).\n${dependencyData.status} (${
                    dependencyData.statusText
                })\n${resolveURL(API_SOURCE_WEBSITE_URL, path.posix.join("api", "dependency_lists", dependencyList.main_script.js))}`,
                buttons: ["Okay"],
                noLink: true,
            });
            return;
        }
        writeFileSync(path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists", dependencyList.main_script.js), await dependencyData.text());
        if (dependencyList.main_script.dts !== undefined) {
            try {
                mkdirSync(path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists", path.dirname(dependencyList.main_script.dts)), {
                    recursive: true,
                });
                const dependencyData: Response = await fetch(
                    resolveURL(API_SOURCE_WEBSITE_URL, path.posix.join("api", "dependency_lists", dependencyList.main_script.dts))
                );
                if (dependencyData.ok) {
                    writeFileSync(
                        path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists", dependencyList.main_script.dts),
                        await dependencyData.text()
                    );
                }
            } catch (e: any) {
                console.error(e, e?.stack);
            }
        }
        if (dependencyList.main_script.ts !== undefined) {
            try {
                mkdirSync(path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists", path.dirname(dependencyList.main_script.ts)), {
                    recursive: true,
                });
                const dependencyData: Response = await fetch(
                    resolveURL(API_SOURCE_WEBSITE_URL, path.posix.join("api", "dependency_lists", dependencyList.main_script.ts))
                );
                if (dependencyData.ok) {
                    writeFileSync(
                        path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists", dependencyList.main_script.ts),
                        await dependencyData.text()
                    );
                }
            } catch (e: any) {
                console.error(e, e?.stack);
            }
        }
        if (dependenciesDownloaded === dependencyFileCount - 1) {
            progressBar.detail = "Finalizing dependencies...";
            progressBar.value = ++dependenciesDownloaded;
        } else {
            progressBar.detail = `Downloading dependencies (${dependenciesDownloaded++ + 1}/${dependencyFileCount})...`;
            progressBar.value = dependenciesDownloaded;
        }
        let stop: boolean = false;
        async function downloadDependencies(dependencies: DependenciesDataDependency[], baseURL: string, destinationFolder: string): Promise<void> {
            for (const dependency of dependencies) {
                mkdirSync(path.join(destinationFolder, path.dirname(dependency.js)), { recursive: true });
                const dependencyData: Response = await fetch(resolveURL(baseURL, dependency.js));
                if (!dependencyData.ok) {
                    progressBar.setProgressBarMode("error");
                    progressBar._window?.setClosable(true);
                    dialog.showMessageBox({
                        type: "error",
                        title: "Error",
                        message: `An error occurred while downloading the dependencies (${dependenciesDownloaded + 1}).\n${dependencyData.status} (${
                            dependencyData.statusText
                        })\n${resolveURL(baseURL, dependency.js)}`,
                        buttons: ["Okay"],
                        noLink: true,
                    });
                    stop = true;
                    return;
                }
                writeFileSync(path.join(destinationFolder, dependency.js), await dependencyData.text());
                if (dependency.dts !== undefined) {
                    try {
                        mkdirSync(path.join(destinationFolder, path.dirname(dependency.dts)), { recursive: true });
                        const dependencyData: Response = await fetch(resolveURL(baseURL, dependency.dts));
                        if (dependencyData.ok) {
                            writeFileSync(path.join(destinationFolder, dependency.dts), await dependencyData.text());
                        }
                    } catch (e: any) {
                        console.error(e, e?.stack);
                    }
                }
                if (dependency.ts !== undefined) {
                    try {
                        mkdirSync(path.join(destinationFolder, path.dirname(dependency.ts)), { recursive: true });
                        const dependencyData: Response = await fetch(resolveURL(baseURL, dependency.ts));
                        if (dependencyData.ok) {
                            writeFileSync(path.join(destinationFolder, dependency.ts), await dependencyData.text());
                        }
                    } catch (e: any) {
                        console.error(e, e?.stack);
                    }
                }
                if (dependenciesDownloaded === dependencyFileCount - 1) {
                    progressBar.detail = "Finalizing dependencies...";
                    progressBar.value = ++dependenciesDownloaded;
                } else {
                    progressBar.detail = `Downloading dependencies (${dependenciesDownloaded++ + 1}/${dependencyFileCount})...`;
                    progressBar.value = dependenciesDownloaded;
                }
                dependency.dependencies && (await downloadDependencies(dependency.dependencies, baseURL, destinationFolder));
            }
        }
        await downloadDependencies(
            dependencyList.dependencies,
            API_DEPENDENCY_LIST_URL,
            path.join(APP_DATA_FOLDER_PATH, "api", API_FOLDER_PATH, "dependency_lists")
        );
        if (stop) return;
    } catch (e: any) {
        console.error(e, e?.stack);
        progressBar.setProgressBarMode("error");
        progressBar._window?.setClosable(true);
        dialog.showMessageBox({
            type: "error",
            title: "Error",
            message: `An error occurred while downloading the dependencies.\n${e.message}${e?.stack ?? ""}`,
            buttons: ["Okay"],
            noLink: true,
        });
        return;
    }
    progressBar.title = "Updating...";
    progressBar.text = "Updating...";
    progressBar.detail = `Fetching assets list...`;
    progressBar.indeterminate = true;
    const octokit = new Octokit();
    const assetsList: (
        | Exclude<Awaited<ReturnType<Octokit["repos"]["getContent"]>>["data"], any[]>
        | Exclude<
              Awaited<ReturnType<Octokit["repos"]["getContent"]>>["data"],
              Exclude<Awaited<ReturnType<Octokit["repos"]["getContent"]>>["data"], any[]>
          >[number]
    )[] = [];
    async function getAssetsList(owner: string, repo: string, path: string): Promise<void> {
        const response: Awaited<ReturnType<Octokit["repos"]["getContent"]>> = await octokit.repos.getContent({
            owner,
            repo,
            path,
        });
        if (response.status === 200) {
            const data:
                | [item: Exclude<Awaited<ReturnType<Octokit["repos"]["getContent"]>>["data"], any[]>]
                | Exclude<
                      Awaited<ReturnType<Octokit["repos"]["getContent"]>>["data"],
                      Exclude<Awaited<ReturnType<Octokit["repos"]["getContent"]>>["data"], any[]>
                  > = response.data instanceof Array ? response.data : [response.data];
            for (const item of data) {
                if (item.type === "dir") {
                    await getAssetsList(owner, repo, item.path);
                } else if (item.type === "file") {
                    assetsList.push(item);
                }
            }
        } else {
            progressBar.close();
            dialog.showMessageBox({
                type: "error",
                title: "Error",
                message: `An error occurred while getting the dependency list.\n${response.status}`,
                buttons: ["Okay"],
                noLink: true,
            });
        }
    }
    await getAssetsList("8Crafter-Studios", "8Crafter.github.io", "assets/oreui");
    let assetsDownloaded: number = 0;
    progressBar.detail = `Downloading assets (0/${assetsList.length})...`;
    progressBar.indeterminate = false;
    progressBar.maxValue = assetsList.length;
    progressBar.value = 0;
    try {
        for (const asset of assetsList) {
            mkdirSync(path.join(APP_DATA_FOLDER_PATH, "api/assets", path.dirname(asset.name)), { recursive: true });
            if (asset.download_url) {
                var response = await fetch(new URL(asset.download_url, "https://api.github.com"));
            } else {
                console.warn(asset.path, "is missing a download url.");
                continue;
            }
            writeFileSync(path.join(APP_DATA_FOLDER_PATH, "api/assets", asset.name), await response.bytes());
            if (assetsDownloaded === assetsList.length - 1) {
                progressBar.detail = "Finalizing assets...";
                progressBar.value = ++assetsDownloaded;
            } else {
                progressBar.detail = `Downloading assets (${assetsDownloaded++ + 1}/${assetsList.length})...`;
                progressBar.value = assetsDownloaded;
            }
        }
    } catch (e: any) {
        console.error(e, e?.stack);
        progressBar.setProgressBarMode("error");
        progressBar._window?.setClosable(true);
        dialog.showMessageBox({
            type: "error",
            title: "Error",
            message: `An error occurred while downloading the assets.\n${e.message}${e?.stack ?? ""}`,
            buttons: ["Okay"],
            noLink: true,
        });
        return;
    }
    progressBar.close();
    dialog.showMessageBox({
        type: "info",
        title: "Success",
        message: "The customizer has been updated successfully.",
        buttons: ["Okay"],
        noLink: true,
        icon: "./resources/icon.png",
    });
}

interface DependenciesData {
    main_script: {
        js: string;
        dts?: string;
        ts?: string;
    };
    dependencies: DependenciesDataDependency[];
}

interface DependenciesDataDependency {
    js: string;
    dts?: string;
    ts?: string;
    currentImportStatementText: string;
    dependencies?: DependenciesDataDependency[];
}
