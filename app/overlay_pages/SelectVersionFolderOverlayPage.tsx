import type { JSX, RefObject } from "preact";
import { useEffect, useRef } from "preact/compat";
import { InstallationManager, type VersionFolder } from "../../src/utils/InstallationManager";
import VersionFolderSelector from "../components/VersionFolderSelector";
import type { CustomizerAppPage, SearchParamTypes } from "../../src/utils/pageList";

let lastVersionFolderOverlayPageDataId = 0n;

const versionFolderOverlayPageData: Map<string, ShowSelectVersionFolderOverlayPageOptions> = new Map<string, ShowSelectVersionFolderOverlayPageOptions>();

export interface ShowSelectVersionFolderOverlayPageOptions {
    title?: string;
    onSelected?(versionFolder: VersionFolder): void;
    onCancel?(): void;
    // IDEA: Maybe add an option to enable allowing selections of isolated version folders, and maybe also an option for showing options for selecting whether to use the current gui folder or the backup (if available).
}

export function showSelectVersionFolderOverlayPage(options: ShowSelectVersionFolderOverlayPageOptions): void {
    const id: string = String(++lastVersionFolderOverlayPageDataId);
    versionFolderOverlayPageData.set(id, options);

    router.history.push(
        `/select-version-folder?${new URLSearchParams({
            id,
        } as const satisfies Partial<SearchParamTypes[CustomizerAppPage.SelectVersionFolder]>).toString()}`
    );
}

export interface SelectVersionFolderOverlayPageProps {
    id: string;
}

export default function SelectVersionFolderOverlayPage(props: SelectVersionFolderOverlayPageProps): JSX.SpecificElement<"div"> {
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    const versionFolders: VersionFolder[] = InstallationManager.getVersionFolders("VersionDescending");
    if (!versionFolderOverlayPageData.has(props.id)) {
        queueMicrotask((): void => router.history.goBack());
        return <></>;
    }
    const options: ShowSelectVersionFolderOverlayPageOptions = versionFolderOverlayPageData.get(props.id)!;
    useEffect((): (() => void) => {
        return (): void => {
            versionFolderOverlayPageData.delete(props.id);
        };
    });
    function SelectVersionFolderOverlayPageContents(): JSX.Element {
        return (
            <>
                <button
                    type="button"
                    class="nsel ndrg dialog-close-button"
                    title="Close"
                    onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                        if (event.currentTarget.disabled) return;
                        SoundEffects.popB();
                    }}
                    onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                        event.preventDefault();
                        event.currentTarget.blur();
                        if (event.currentTarget.disabled) return;
                        router.history.goBack();
                        options.onCancel?.();
                    }}
                ></button>
                <div
                    class="nsel ndrg piximg crispy fix-crispy-text-sizing-issues"
                    style={{
                        color: "#4C4C4CFF",
                        padding: "calc(8.5px * var(--gui-scale))",
                        position: "absolute",
                        textAlign: "center",
                        width: "100%",
                    }}
                >
                    {options.title ?? "Select Version Folder"}
                </div>
                <div
                    style={{
                        margin: "calc(23px * var(--gui-scale)) calc(8px * var(--gui-scale)) calc(8px * var(--gui-scale))",
                        padding: "calc(7px * var(--gui-scale))",
                        backgroundColor: "#090909FF",
                        width: "calc(100% - (16px * var(--gui-scale)))",
                        height: "calc(100% - (31px * var(--gui-scale)))",
                        boxSizing: "border-box",
                    }}
                    class="dialog-inner-elem-default-styles"
                >
                    {/* <div
                        style={{
                            padding: "0 calc(3px * var(--gui-scale))",
                        }}
                    > */}
                    <VersionFolderSelector
                        versionFolders={versionFolders}
                        selectButtonClick={(_event: JSX.TargetedMouseEvent<HTMLButtonElement>, versionFolder: VersionFolder): void => {
                            router.history.goBack();
                            options.onSelected?.(versionFolder);
                        }}
                        listStyle={{
                            display: "flex",
                            flexDirection: "column",
                            height: "-webkit-fill-available",
                        }}
                        listViewportStyle={{
                            maxHeight: "unset",
                        }}
                    />
                    {/* </div> */}
                </div>
            </>
        );
    }
    return (
        <div
            class="dialog-hollow-3"
            style={{
                margin: "calc(25px * var(--gui-scale)) calc((100% - (370px * var(--gui-scale))) / 2)",
                width: "calc(370px * var(--gui-scale))",
                height: "calc(100% - calc(50px * var(--gui-scale)))",
                position: "fixed",
            }}
            ref={containerRef}
        >
            <SelectVersionFolderOverlayPageContents />
        </div>
    );
}
