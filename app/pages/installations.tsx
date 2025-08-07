import type { JSX } from "preact";
import _React from "preact/compat";
import VersionFolderList, { type VersionFolderOptionsMenuItemConstructorOptions } from "../components/VersionFolderList";
import { InstallationManager, type VersionFolder } from "../../src/utils/InstallationManager";
import { reloadMainPageContents } from "../app";
const { dialog, shell } = require("@electron/remote") as typeof import("@electron/remote");

/* const c = await import("/app/pages/installations.tsx");
require("preact").render(c.default(), document.getElementById("main")); */

export default function InstallationsPage(): JSX.SpecificElement<"center"> {
    const versionFolders: VersionFolder[] = InstallationManager.getVersionFolders("VersionDescending");
    return (
        <center style={{ padding: "0 12px 12px 12px", minHeight: 0 }}>
            <h1>Installations</h1>
            <VersionFolderList
                versionFolders={versionFolders}
                optionsList={(versionFolder: VersionFolder): VersionFolderOptionsMenuItemConstructorOptions[] => {
                    const optionsList: VersionFolderOptionsMenuItemConstructorOptions[] = [
                        {
                            label: "Open Folder Location",
                            click(): void {
                                shell.openPath(versionFolder.path);
                            },
                        },
                        {
                            label: "Open GUI Folder Location",
                            click(): void {
                                shell.openPath(versionFolder.guiFolderPath);
                            },
                        },
                        {
                            type: "separator",
                        },
                    ];
                    switch (versionFolder.installationStatus) {
                        case "Installed":
                            if (versionFolder.getIsUpdateAvailable()) {
                                optionsList.push({
                                    label: "Update",
                                    async click(): Promise<void> {
                                        await versionFolder.update();
                                        reloadMainPageContents();
                                    },
                                });
                            }
                            optionsList.push({
                                label: "Uninstall",
                                async click(): Promise<void> {
                                    versionFolder.uninstall(true);
                                    reloadMainPageContents();
                                },
                            });
                            break;
                        case "Installing":
                            optionsList.push({
                                label: "Uninstall",
                                enabled: false,
                                async click(): Promise<void> {
                                    dialog.showMessageBox({
                                        type: "error",
                                        title: "Installation In Progress",
                                        message:
                                            "The Ore UI Customizer cannot be uninstalled from this version while it is currently being installed, please try again later.",
                                        buttons: ["Okay"],
                                        noLink: true,
                                    });
                                },
                            });
                            break;
                        case "Uninstalling":
                            optionsList.push({
                                label: "Install",
                                enabled: false,
                                async click(): Promise<void> {
                                    dialog.showMessageBox({
                                        type: "error",
                                        title: "Installation In Progress",
                                        message:
                                            "The Ore UI Customizer cannot be uninstalled from this version while it is currently being uninstalled, please try again later.",
                                        buttons: ["Okay"],
                                        noLink: true,
                                    });
                                },
                            });
                            break;
                        case "Partially Failed Installation":
                            if (versionFolder.getIsUpdateAvailable()) {
                                optionsList.push({
                                    label: "Update",
                                    async click(): Promise<void> {
                                        await versionFolder.update();
                                        reloadMainPageContents();
                                    },
                                });
                            }
                            optionsList.push(
                                {
                                    label: "Retry Installation",
                                    async click(): Promise<void> {
                                        await versionFolder.repairInstallation();
                                        reloadMainPageContents();
                                    },
                                },
                                {
                                    label: "Uninstall",
                                    async click(): Promise<void> {
                                        versionFolder.uninstall(true);
                                        reloadMainPageContents();
                                    },
                                }
                            );
                            break;
                        case "Not Installed":
                            optionsList.push({
                                label: "Install",
                                async click(): Promise<void> {
                                    await versionFolder.install();
                                    reloadMainPageContents();
                                },
                            });
                            break;
                        case "Unknown":
                            optionsList.push({
                                label: "Install",
                                enabled: false,
                                async click(): Promise<void> {},
                            });
                            break;
                        default:
                            throw new Error(`Unknown installation status: ${versionFolder.installationStatus}`);
                    }
                    return optionsList;
                }}
            />
        </center>
    );
}
