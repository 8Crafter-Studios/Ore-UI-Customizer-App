import type { JSX } from "preact";
import ItemListItem, { ItemListItemColumn } from "./ItemListItem";
import ItemList, { type ItemListOptions } from "./ItemList";
import type { InstallationStatus, VersionFolder } from "../../src/utils/InstallationManager";

export interface VersionFolderSelectorOptions extends Omit<ItemListOptions, "tableHeaders"> {
    versionFolders: VersionFolder[];
    selectButtonClick(event: JSX.TargetedMouseEvent<HTMLButtonElement>, versionFolder: VersionFolder): void;
}

export default function VersionFolderSelector(
    options: VersionFolderSelectorOptions
): JSX.SpecificElement<JSX.HTMLAttributes<HTMLDivElement> & VersionFolderSelectorOptions> {
    return (
        <ItemList
            headerInfoLabels={
                options.headerInfoLabels ?? {
                    left: {
                        defaultText: `${options.versionFolders.length} Version${options.versionFolders.length === 1 ? "" : "s"}`,
                    },
                }
            }
            headerTitle={options.headerTitle ?? "Versions"}
            tableHeaders={[
                { label: "Version", width: "40%", paddingOverride: "0" },
                { label: "Installation Status", width: "60%" },
            ]}
            listStyle={options.listStyle}
            listViewportStyle={options.listViewportStyle}
            wrapperId={options.wrapperId}
        >
            {options.versionFolders.length === 0 && (
                <>
                    No Minecraft versions detected.
                    <br />
                    Please verify you are using a custom launcher such as <a href="https://bedrocklauncher.github.io/">bedrock launcher</a>. If you have another
                    launcher, please go to <code>{"Preferences > Installing"}</code> and add the folder containing all of your Minecraft version folders to the{" "}
                    <code>Version Folder Search Locations</code> list.
                </>
            )}
            {...options.versionFolders.map(
                (versionFolder: VersionFolder): JSX.Element => (
                    <VersionFolderSelectorItem
                        displayVersionColoredHTML={versionFolder.getDisplayVersionColoredHTML()}
                        versionFolderPath={versionFolder.path}
                        installationStatus={
                            versionFolder.installationStatus +
                            ((
                                (
                                    [
                                        "Installed",
                                        "Partially Failed Installation",
                                        "Corrupted (By Minecraft Update)",
                                        "Corrupted (By Minecraft Update) (Backup Available)",
                                    ] as InstallationStatus[]
                                ).includes(versionFolder.installationStatus)
                            ) ?
                                ` (v${versionFolder.installedVersion})` + (versionFolder.getIsUpdateAvailable() ? " (Update Available)" : "")
                            :   "")
                        }
                        onSelectButtonMouseDown={(): void => {
                            SoundEffects.popB();
                        }}
                        onSelectButtonClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                            event.preventDefault();
                            event.currentTarget.blur();
                            options.selectButtonClick(event, versionFolder);
                        }}
                    />
                )
            )}
        </ItemList>
    );
}

interface VersionFolderSelectorItemOptions {
    displayVersion?: string;
    displayVersionColoredHTML?: string;
    versionFolderPath: string;
    installationStatus: string;
    onSelectButtonMouseDown?: JSX.MouseEventHandler<HTMLButtonElement>;
    onSelectButtonClick: JSX.MouseEventHandler<HTMLButtonElement>;
}

export function VersionFolderSelectorItem(
    options: VersionFolderSelectorItemOptions
): JSX.SpecificElement<JSX.HTMLAttributes<HTMLDivElement> & VersionFolderSelectorItemOptions> {
    return (
        <ItemListItem headerSizes={["40%", "60%"]}>
            <ItemListItemColumn containerType="Span" contentType={options.displayVersionColoredHTML ? "RawHTML" : "Text"} title={options.versionFolderPath}>
                {options.displayVersionColoredHTML ? options.displayVersionColoredHTML : options.displayVersion}
            </ItemListItemColumn>
            <ItemListItemColumn containerType="None" contentType="Other">
                {/* <textarea
                name="structurename"
                autocapitalize="off"
                autocomplete="off"
                spellcheck={false}
                inputmode="text"
                required
                rows={1}
                {...{ pattern: "/[^:/]+:[^:]+/" }}
                class="form-control"
                style="margin-left: 10px; width: calc(100% - 47px); max-width: calc(100% - 47px); height: -webkit-fill-available;"
                data-value="structurename"
            ></textarea> */}
                <span style="padding: 8.5px 0px; display: inline-block; margin-left: 10px;">{options.installationStatus}</span>
                <button
                    type="button"
                    class="btn nsel"
                    name="options"
                    title="Options"
                    style="float: right; margin: 3px 0px; display: flex/* ; transform: translate(0, 50%) */; padding: calc(2.5px * var(--gui-scale));"
                    onMouseDown={options.onSelectButtonMouseDown}
                    onClick={options.onSelectButtonClick}
                >
                    Select
                </button>
            </ItemListItemColumn>
        </ItemListItem>
    );
}
