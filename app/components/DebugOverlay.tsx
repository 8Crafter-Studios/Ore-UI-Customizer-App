import type { JSX, RefObject } from "preact";
import { hydrate, render, useEffect, useRef } from "preact/compat";
import { app, screen } from "@electron/remote";
import os from "node:os";
import v8 from "node:v8";

/**
 * A debug overlay.
 *
 * This is like the F3 screen in Minecraft Java Edition and the dev versions of Bedrock Edition.
 *
 * This should be directly inside the app element.
 *
 * @returns The debug overlay element.
 */
export default function DebugOverlay(): JSX.SpecificElement<"div"> {
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    useEffect((): (() => void) => {
        function debugHUDChangeCallback(mode: typeof config.debugHUD): void {
            console.log(5);
            if (!containerRef.current) return;
            containerRef.current.replaceChildren();
            render(<DebugOverlayContents mode={mode} />, containerRef.current);
        }
        config.on("settingChanged:debugHUD", debugHUDChangeCallback);
        return (): void => {
            config.off("settingChanged:debugHUD", debugHUDChangeCallback);
        };
    }, []);
    return (
        <div style={{ display: "contents" }} ref={containerRef}>
            <DebugOverlayContents mode={config.debugHUD} />
        </div>
    );
}

interface DebugOverlayContentsProps {
    mode: (typeof config)["debugHUD"];
}

function DebugOverlayContents(props: DebugOverlayContentsProps): JSX.Element {
    switch (props.mode) {
        case "top":
            return <DebugOverlay_Top />;
        case "basic":
            return <DebugOverlay_Basic />;
        case "none":
        default:
            return <></>;
    }
}

/**
 * The top debug overlay mode.
 *
 * This is like the debug text at the top of the screen in the Bedrock Edition Preview.
 *
 * @returns The debug overlay element.
 */
function DebugOverlay_Top(): JSX.Element {
    const containerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    let GUIScale: number = config.actualGUIScale;
    function Contents(): JSX.Element {
        const process_memoryUsage: NodeJS.MemoryUsage = process.memoryUsage();
        const v8_heapStatistics: v8.HeapInfo = v8.getHeapStatistics();
        return (
            <>
                <span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    {"v" + VERSION} {os.type() === "Windows_NT" ? "Windows" : os.type() === "Darwin" ? "macOS" : os.type()} {os.arch()} Build, {os.version()}{" "}
                    {os.release()}
                </span>
                <span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    Mem:{Math.round(process_memoryUsage.rss / 1000 ** 2)}, Free Mem:
                    {Math.round((v8_heapStatistics.heap_size_limit - process_memoryUsage.rss) / 1000 ** 2)}, GUI Scale:{GUIScale.toFixed(1)}
                </span>
            </>
        );
    }
    useEffect((): (() => void) => {
        let lastForcedUpdate: number = Date.now();
        function handleGUIScaleChange(event: CustomEvent<{ newGUIScale: number }>): void {
            GUIScale = event.detail.newGUIScale;
            if (lastForcedUpdate + 100 < Date.now() && containerRef.current) {
                hydrate(<Contents />, containerRef.current);
                lastForcedUpdate = Date.now();
            }
        }
        window.addEventListener("GUIScaleChange", handleGUIScaleChange);
        if (containerRef.current) {
            hydrate(<Contents />, containerRef.current);
        }
        const intervalID: number = setInterval((): void => {
            if (!containerRef.current) {
                clearInterval(intervalID);
                return;
            }
            hydrate(<Contents />, containerRef.current);
        }, 1000) as unknown as number;
        return (): void => {
            window.removeEventListener("GUIScaleChange", handleGUIScaleChange);
            clearInterval(intervalID);
        };
    });
    return (
        <>
            <style>{`.debug-overlay-top span {
    width: fit-content;
    /* transform: translate(calc((0.5 * (100vw - round(down, 100vw, 2px))) - calc((((round(up, var(--gui-scale), 2) / 2) - round(down, (round(up, var(--gui-scale), 2) / 2), 2)) - (((round(up, var(--gui-scale), 2) / 2) - round(up, (round(down, var(--gui-scale), 2) / 2), 2) - var(--w))) - 1) * 0.5px)), 0); */
}

@property --_x {
  syntax: "<number>";
  inherits: true;
  initial-value: 0; 
}
@property --_y {
  syntax: "<number>";
  inherits: true;
  initial-value: 0; 
}
@property --w {
  syntax: "<integer>";
  inherits: true;
  initial-value: 0; 
}
@property --h {
  syntax: "<integer>";
  inherits: true;
  initial-value: 0; 
}

.debug-overlay-top span {
  overflow: auto;
  scrollbar-width: none;
  position: relative;
  --w:calc(1/(1 - var(--_x)));
  --h:calc(1/(1 - var(--_y)));
  timeline-scope: --cx,--cy;
  animation: x linear,y linear;
  animation-timeline: --cx,--cy;
  animation-range: entry 100% exit 100%; 
  counter-reset: w var(--w) h var(--h);
  margin-left: calc(round(down, calc((100vw - var(--w) * 1px) / 2), 2px) - 0.5px + (((1 - (round(up, var(--gui-scale), 2) / 2) - round(down, (round(up, var(--gui-scale), 2) / 2), 2)) * 0.5px)));
  max-height: calc(var(--w) * 1px);
}
.debug-overlay-top span:before {
  content:"";
  position: absolute;
  left: 0;
  top: 0;
  width: 1px;
  aspect-ratio: 1;
  view-timeline: --cx inline,--cy block;
}
@keyframes x {to{--_x:1}}
@keyframes y {to{--_y:1}}

/* .size:after {
  content: counter(w) "x" counter(h);
  counter-reset: w var(--w) h var(--h);
  position: absolute;
  left: 0;
  top: 0;
  background: #000;
  color: #fff;
  font-size: 23px;
  font-weight: bold;
  padding: .3em;
} */`}</style>
            <div
                class="nsel ndrg debug-overlay-top"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    pointerEvents: "none",
                    zIndex: 1000000000000,
                    filter: "drop-shadow(calc((round(up, var(--gui-scale), 2) / 2) * 1px) calc((round(up, var(--gui-scale), 2) / 2) * 1px) 0 #404040FF)",
                    color: "rgba(255, 255, 255, 1)",
                    textAlign: "center",
                    fontSize: "calc((round(up, var(--gui-scale), 2) / 2) * 10px)",
                    overflow: "hidden",
                    letterSpacing: "calc((round(up, var(--gui-scale) - 2, 2) / 2) * 1px)",
                }}
                ref={containerRef}
            >
                <Contents />
            </div>
        </>
    );
}

interface GPUInfo {
    auxAttributes?: {
        amdSwitchable?: string;
        canSupportThreadedTextureMailbox?: string;
        directMLFeatureLevel?: string;
        displayType?: string;
        dx12FeatureLevel?: string;
        glExtensions?: string;
        glImplementationParts?: string;
        glRenderer?: string;
        glResetNotificationStrategy?: number;
        glVendor?: string;
        glVersion?: string;
        glWsExtensions?: string;
        glWsVendor?: string;
        glWsVersion?: string;
        hardwareSupportsVulkan?: boolean;
        inProcessGpu?: boolean;
        initializationTime?: number;
        isAsan?: boolean;
        isClangCoverage?: boolean;
        jpegDecodeAcceleratorSupported?: boolean;
        maxMsaaSamples?: string;
        optimus?: boolean;
        overlayInfo?: {
            bgra8OverlaySupport?: string;
            directComposition?: true;
            nv12OverlaySupport?: string;
            p010OverlaySupport?: string;
            rgb10a2OverlaySupport?: string;
            supportsOverlays?: boolean;
            yuy2OverlaySupport?: string;
        };
        passthroughCmdDecoder?: boolean;
        pixelShaderVersion?: string;
        sandboxed?: boolean;
        skiaBackendType?: string;
        subpixelFontRendering?: boolean;
        supportsD3dSharedImages?: boolean;
        supportsDirectML?: boolean;
        supportsDx12?: boolean;
        supportsVulkan?: boolean;
        targetCpuBits?: number;
        vertexShaderVersion?: string;
        videoDecodeAcceleratorSupportedProfile?: {
            encrypted_only?: boolean;
            maxResolutionHeight?: number;
            maxResolutionWidth?: number;
            minResolutionHeight?: number;
            minResolutionWidth?: number;
            profile?: number;
        };
        videoEncodeAcceleratorSupportedProfile?: {
            maxFramerateDenominator?: number;
            maxFramerateNumerator?: number;
            maxResolutionHeight?: number;
            maxResolutionWidth?: number;
            minResolutionHeight?: number;
            minResolutionWidth?: number;
            profile?: number;
        };
        visibilityCallbackCallCount?: number;
        vulkanVersion?: string;
    };
    gpuDevice?: {
        active?: boolean;
        deviceId?: number;
        vendorId?: number;
        deviceString?: string;
        driverVendor?: string;
        driverVersion?: string;
        gpuPreference?: number;
        revision?: number;
        subSysId?: number;
    }[];
    machineModelName?: string;
    machineModelVersion?: string;
}

let GPUInfo: GPUInfo | undefined = undefined;
(app.getGPUInfo("complete") as Promise<GPUInfo>).then((gpuInfo: GPUInfo): void => {
    GPUInfo = gpuInfo;
});

/**
 * The top debug overlay mode.
 *
 * This is like the debug text at the top of the screen in the Bedrock Edition Preview.
 *
 * @returns The debug overlay element.
 */
function DebugOverlay_Basic(): JSX.Element {
    const rightContainerRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
    // await app.getGPUInfo("complete");
    const currentWindow: Electron.BrowserWindow = getCurrentWindow();
    function RightContents(): JSX.Element {
        const process_memoryUsage: NodeJS.MemoryUsage = process.memoryUsage();
        const v8_heapStatistics: v8.HeapInfo = v8.getHeapStatistics();
        return (
            <>
                <span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    OS: {os.version()} {os.release()}
                </span>
                {/* {<span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    {"v" + VERSION} {os.type() === "Windows_NT" ? "Windows" : os.type() === "Darwin" ? "macOS" : os.type()} {os.arch()} Build,
                </span>} */}
                <span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    Mem: {Math.round((process_memoryUsage.rss / v8_heapStatistics.heap_size_limit) * 100)}% {Math.round(process_memoryUsage.rss / 1024 ** 2)}/
                    {Math.round(v8_heapStatistics.heap_size_limit / 1024 ** 2)}MiB
                </span>
                <span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    CPU: {os.cpus()[0] ? `${os.cpus()[0]!.model} (${os.arch()})` : `Unknown (${os.arch()})`}
                </span>
                <span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    &nbsp;
                </span>
                <span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    Display: {innerWidth}x{innerHeight}
                </span>
                <span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    GPU:{" "}
                    {GPUInfo?.gpuDevice?.find(
                        (gpuDevice: NonNullable<GPUInfo["gpuDevice"]>[number]): string | false | undefined => gpuDevice.active && gpuDevice.deviceString
                    )?.deviceString ?? "Unknown"}
                </span>
                <span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    &nbsp;
                </span>
                <span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    &nbsp;
                </span>
                <span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    &nbsp;
                </span>
                <span
                    class="crispy"
                    style={{
                        display: "block",
                    }}
                >
                    {`Main Router History [${router.history.list.length}] (in use)`}
                </span>
                {router.history.list.map(
                    (location: RouterHistoryLocation<Electron.BrowserWindow>): JSX.Element => (
                        <span
                            class="crispy"
                            style={{
                                display: "block",
                            }}
                        >
                            {`${location === router.history.location ? "--> " : ""}[${location.pathname}]`}
                        </span>
                    )
                )}
            </>
        );
    }
    useEffect((): (() => void) => {
        if (rightContainerRef.current) {
            hydrate(<RightContents />, rightContainerRef.current);
        }
        const intervalID: number = setInterval((): void => {
            if (!rightContainerRef.current) {
                clearInterval(intervalID);
                return;
            }
            hydrate(<RightContents />, rightContainerRef.current);
        }, 1000) as unknown as number;
        return (): void => {
            clearInterval(intervalID);
        };
    });
    return (
        <>
            {/* Right panel */}
            <div
                class="nsel ndrg"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "absolute",
                    top: 0,
                    right: "calc((round(up, var(--gui-scale), 2) / 2) * 1px)",
                    width: "calc(100vw - calc((round(up, var(--gui-scale), 2) / 2) * 1px))",
                    height: "100vh",
                    pointerEvents: "none",
                    zIndex: 1000000000000,
                    filter: "drop-shadow(calc((round(up, var(--gui-scale), 2) / 2) * 1px) calc((round(up, var(--gui-scale), 2) / 2) * 1px) 0 #404040FF)",
                    color: "#FFFFFFFF",
                    textAlign: "right",
                    fontSize: "calc((round(up, var(--gui-scale), 2) / 2) * 10px)",
                    // transform: "translate(calc((max(var(--gui-scale), 2) - round(down, max(var(--gui-scale), 2), 2)) * 0.5px), 0)",
                }}
                ref={rightContainerRef}
            >
                <RightContents />
            </div>
        </>
    );
}
