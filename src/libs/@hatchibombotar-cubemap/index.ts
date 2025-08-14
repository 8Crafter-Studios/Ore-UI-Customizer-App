// Modified by 8Crafter.
// Converted to TypeScript by 8Crafter.

const defaultCubemapOptions = {
    width: 500,
    height: 500,
    perspective: 300,
    background_color: "black",
    min_pitch: -90,
    max_pitch: 90,
    rotate_type: "drag",
    drag_speed: 0.25,
    rotate_speed: 3,
    direction: "counterclockwise",
} as const satisfies StrictCubemapOptions;

const Directions = {
    FRONT: 0,
    RIGHT: 1,
    BACK: 2,
    LEFT: 3,
    TOP: 4,
    BOTTOM: 5,
};

type StrictCubemapOptions = {
    width: number | string;
    height: number | string;
    background_color: string;
    perspective: number | string;
    min_pitch: number | false;
    max_pitch: number | false;

    rotate_type: "drag" | "auto";
    drag_speed: number;
    rotate_speed: number;
    direction: "clockwise" | "counterclockwise";
};

export class Cubemap {
    public options: StrictCubemapOptions;
    public pitch: number;
    public yaw: number;
    public perspective: string | number;
    public box_size: number;
    public border_margin: number;
    public images: string[];
    public root: HTMLDivElement;
    public center: HTMLDivElement;
    /**
     * @param { HTMLElement } container
     * @param { string[] } images
     * @param { Partial<StrictCubemapOptions> } providedOptions
     */
    public constructor(container: HTMLElement, images: string[], providedOptions: Partial<StrictCubemapOptions>) {
        const options: StrictCubemapOptions = {
            ...defaultCubemapOptions,
            ...(Object.fromEntries(
                Object.entries(providedOptions).filter(
                    ([key, value]: [key: string, value: (typeof providedOptions)[keyof typeof providedOptions]]): boolean => value !== undefined
                )
            ) as typeof providedOptions),
        };

        this.options = options;

        this.pitch = 0;
        this.yaw = 0;
        this.perspective = options.perspective;
        this.box_size = 1024;
        this.border_margin = 1;
        this.images = images;

        const parent: HTMLElement = container;

        const root: HTMLDivElement = document.createElement("div");
        this.root = root;
        root.className = "cubemap";
        parent.appendChild(root);

        if (typeof options.width == "number") {
            root.style.width = options.width + "px";
        } else root.style.width = options.width;

        if (typeof options.height == "number") {
            root.style.height = options.height + "px";
        } else root.style.height = options.height;

        root.style.backgroundColor = options.background_color;
        root.style.position = "relative";
        root.style.overflow = "hidden";

        let last_pos: [x: number, y: number] = [0, 0];

        /** @param { MouseEvent | TouchEvent } e */
        const ondown = (e: MouseEvent | TouchEvent) => {
            if (e.type == "touchstart") {
                document.addEventListener("touchmove", onmove);
                document.addEventListener("touchend", onup);
            } else {
                document.body.addEventListener("mousemove", onmove);
                document.body.addEventListener("mouseup", onup);
            }

            const rect: DOMRect = root.getClientRects()[0]!;
            // @ts-ignore
            last_pos = [e.pageX - rect.left, e.pageY - rect.top];

            e.stopPropagation();
            e.preventDefault();
            return false;
        };

        /** @param { MouseEvent | TouchEvent } e */
        const onmove = (e: MouseEvent | TouchEvent) => {
            console.log(e);
            const rect: DOMRect | undefined = this.root.getClientRects()[0];
            // @ts-ignore
            // const x: number = e.pageX - rect.left;
            // @ts-ignore
            // const y: number = e.pageY - rect.top;
            // const deltax: number = x - last_pos[0];
            // const deltay: number = y - last_pos[1];
            // @ts-ignore
            const deltax: number = e.movementX;
            // @ts-ignore
            const deltay: number = e.movementY;

            this.yaw -= deltax * options.drag_speed;
            this.pitch += deltay * options.drag_speed;
            if (options.min_pitch && this.pitch < options.min_pitch) this.pitch = options.min_pitch;
            if (options.max_pitch && this.pitch > options.max_pitch) this.pitch = options.max_pitch;
            this.update();

            // last_pos = [x, y];
            e.stopPropagation();
            e.preventDefault();
            return false;
        };

        /** @param { MouseEvent | TouchEvent } e */
        const onup = (e: MouseEvent | TouchEvent) => {
            document.body.removeEventListener("mousemove", onmove);
            document.body.removeEventListener("mouseup", onup);
            document.body.removeEventListener("touchmove", onmove);
            document.body.removeEventListener("touchend", onup);

            e.stopPropagation();
            e.preventDefault();
            return false;
        };

        if (options.rotate_type == "drag") {
            root.addEventListener("mousedown", ondown);
            root.addEventListener("touchstart", ondown);
        }

        const center: HTMLDivElement = document.createElement("div");
        center.className = "cubemapcenter";
        root.appendChild(center);
        center.style.transformStyle = "preserve-3d";
        center.style.width = "100%";
        center.style.height = "100%";
        this.center = center;

        if (options.rotate_type == "drag") {
            root.style.cursor = "grab";
        } else if (options.rotate_type == "auto") {
            center.classList.add("spin-3d-y" + (options.direction == "clockwise" ? "-reversed" : ""));
            this.center.style.setProperty("--spin-time", 360 / options.rotate_speed + "s");
        }

        this.load();
        this.update();
    }

    public load(): void {
        const halfsize: string = (this.box_size * 0.5 - this.border_margin).toFixed(1);
        const transformations = {
            [Directions.FRONT]: `translateZ(-${halfsize}px) rotateY(0deg)`,
            [Directions.LEFT]: `translateX(-${halfsize}px) rotateY(90deg)`,
            [Directions.RIGHT]: `translateX(${halfsize}px) rotateY(-90deg)`,
            [Directions.TOP]: `translateY(-${halfsize}px) rotateX(-90deg)`,
            [Directions.BOTTOM]: `translateY(${halfsize}px) rotateX(90deg)`,
            [Directions.BACK]: `translateZ(${halfsize}px) rotateY(-180deg)`,
        };

        for (const face of [Directions.FRONT, Directions.LEFT, Directions.RIGHT, Directions.TOP, Directions.BOTTOM, Directions.BACK]) {
            const url: string = this.images[face]!;
            const element: HTMLDivElement = document.createElement("div");
            element.className = "cubemapface " + face + "face";
            this.center.appendChild(element);

            const transform: string = transformations[face]!;

            element.style.position = "absolute";
            element.style.left = "0";
            element.style.top = "0";
            element.style.width = this.box_size + "px";
            element.style.height = this.box_size + "px";
            element.style.transform = transform;

            // create image
            const img = new Image();
            img.src = url;
            img.onload = (): void => {
                img.width = this.box_size;
                img.height = this.box_size;
            };

            element.appendChild(img);
        }
    }

    public update(): void {
        const perspective: string | number = this.perspective;
        const distance: string | number = perspective;

        if (typeof perspective == "number") {
            this.root.style.perspective = perspective.toFixed(0) + "px";
        } else this.root.style.perspective = perspective;

        const rect: DOMRect = this.root.getClientRects()[0]!;
        const offsetX: number = (rect.width - this.box_size) * 0.5;
        const offsetY: number = (rect.height - this.box_size) * 0.5;

        if (this.options.rotate_type == "drag") {
            this.center.style.transform =
                "translateZ(" +
                distance +
                "px) rotateX(" +
                this.pitch.toFixed(1) +
                "deg) rotateY(" +
                this.yaw.toFixed(1) +
                "deg) translateX(" +
                offsetX +
                "px) translateY(" +
                offsetY +
                "px)";
        } else if (this.options.rotate_type == "auto") {
            if (this.options.direction === "clockwise" && !this.center.classList.contains("spin-3d-y-reversed")) {
                this.center.classList.remove("spin-3d-y");
                this.center.classList.add("spin-3d-y-reversed");
            } else if (this.options.direction === "counterclockwise" && !this.center.classList.contains("spin-3d-y")) {
                this.center.classList.remove("spin-3d-y-reversed");
                this.center.classList.add("spin-3d-y");
            }
            this.center.style.setProperty("--offset-z", distance + "px");
            this.center.style.setProperty("--offset-x", offsetX + "px");
            this.center.style.setProperty("--offset-y", offsetY.toFixed(1) + "px");
            // this.center.style.transform = "translateZ(" + distance + "px) translateX(" + offsetX + "px) translateY(" + offsetY + "px)"
        }
    }
}

