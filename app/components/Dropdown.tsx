import mergeRefs from "merge-refs";
import type { JSX, RefObject } from "preact";
import _React, { useRef, useEffect, Component } from "preact/compat";

export interface DropdownProps {
    label: string;
    id: string;
    options: DropdownOption[];
    minWidth?: string;
    onChange?(value: typeof config.theme): void;
    selectedOptionTextDisplayRef?: RefObject<HTMLSpanElement>;
}

export default function Dropdown(props: DropdownProps): JSX.Element {
    const selectedOptionTextDisplayRef: RefObject<HTMLSpanElement> = useRef<HTMLSpanElement>(null);
    function onChange(value: typeof config.theme): void {
        selectedOptionTextDisplayRef.current!.textContent =
            props.options.find((option: DropdownOption): boolean | undefined => option.value === value)?.label ?? null;
        props.onChange?.(value);
    }
    return (
        <div class="mcdropdown nsel" id={props.id} style="display: inline-block">
            <label>{props.label}</label>
            <br />
            <button
                class="btn dropdownbutton even-button-padding"
                data-dropdown-component="dropdownbutton"
                type="button"
                onTouchStart={(): void => {}}
                style={`min-width: calc(${props.minWidth ?? "50px"} * var(--gui-scale)); text-align: left;`}
                onMouseDown={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                    if (event.currentTarget.disabled) return;
                    SoundEffects.popB();
                }}
                onClick={(event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
                    event.preventDefault();
                    if (event.currentTarget.disabled) return;
                    if (event.currentTarget.parentElement?.querySelector('[data-dropdown-component="dropdowncontents"]')?.hasAttribute("hidden")) {
                        event.currentTarget.querySelector("[data-dropdown-component='cv']")?.setAttribute("hidden", "");
                        event.currentTarget.querySelector("[data-dropdown-component='cvsel']")?.removeAttribute("hidden");
                        event.currentTarget.parentElement?.querySelector('[data-dropdown-component="dropdowncontents"]')?.removeAttribute("hidden");
                    } else {
                        event.currentTarget.querySelector("[data-dropdown-component='cv']")?.removeAttribute("hidden");
                        event.currentTarget.querySelector("[data-dropdown-component='cvsel']")?.setAttribute("hidden", "");
                        event.currentTarget.parentElement?.querySelector('[data-dropdown-component="dropdowncontents"]')?.setAttribute("hidden", "");
                    }
                }}
            >
                <span data-dropdown-component="selectedOptionTextDisplay" ref={mergeRefs(selectedOptionTextDisplayRef, props.selectedOptionTextDisplayRef)}>
                    {props.options.find((option: DropdownOption): boolean | undefined => option.default)?.label}
                </span>
                <div
                    style={`width: calc(11px * var(--gui-scale) + (9 * var(--gui-scale) * 1px) - (var(--gui-scale) * 1px - 1px)); /* height: calc(11px * var(--gui-scale));  */margin: 0px; padding: 0px; display: inline-block;`}
                ></div>
                <img
                    data-dropdown-component="cv"
                    src="resource://images/ui/dropdown/dropdown_chevron.png"
                    inert
                    class="nsel"
                    style="right: calc((9 * var(--gui-scale) * 1px) - (var(--gui-scale) * 1px - 1px)); top: round(down, calc((calc(calc((29 * var(--gui-scale)) - 2) * 1px) - (11px * var(--gui-scale))) / 2) - 2px, 1px); position: absolute; width: calc(11px * var(--gui-scale))"
                />
                <img
                    data-dropdown-component="cvsel"
                    src="resource://images/ui/dropdown/dropdown_chevron_up.png"
                    inert
                    class="nsel"
                    style="right: calc((9 * var(--gui-scale) * 1px) - (var(--gui-scale) * 1px - 1px)); top: round(down, calc((calc(calc((29 * var(--gui-scale)) - 2) * 1px) - (11px * var(--gui-scale))) / 2) - 2px, 1px); position: absolute; width: calc(11px * var(--gui-scale))"
                    hidden
                />
                <style>
                    {`.dark_theme [data-dropdown-component="cv"], .dark_theme [data-dropdown-component="cvsel"]{
    filter: invert();
}`}
                </style>
            </button>
            <div data-dropdown-component="dropdowncontents" class="dropdowncontents" hidden style="display: flex;">
                <div style="flex-grow: 1; width: 0;">
                    {...props.options.map((option: DropdownOption): JSX.SpecificElement<"div"> => {
                        return (
                            <div
                                ref={option.ref}
                                data-dropdown-component="dropdownoption"
                                class="mcdropdownoption"
                                onTouchStart={(): void => {}}
                                onMouseDown={(event: JSX.TargetedMouseEvent<HTMLInputElement>): void => {
                                    const radioInput: Element | null = event.currentTarget.querySelector("input[type='radio']");
                                    if (radioInput instanceof HTMLInputElement && !radioInput.disabled) {
                                        SoundEffects.popB();
                                    }
                                }}
                                onClick={(event: JSX.TargetedMouseEvent<HTMLDivElement>): void => {
                                    event.preventDefault();
                                    const radioInput: Element | null = event.currentTarget.querySelector("input[type='radio']");
                                    if (radioInput instanceof HTMLInputElement && !radioInput.disabled) {
                                        radioInput.checked = true;
                                        onChange(option.value);
                                    }
                                }}
                            >
                                <input
                                    type="radio"
                                    name={props.id}
                                    id={`dropdownOption_${props.id}_${option.value}`}
                                    value="blue"
                                    class="mcradio"
                                    checked={option.default}
                                />
                                <div class="mcradiocheckbox"></div>
                                <label for={`dropdownOption_${props.id}_${option.value}`}>{option.label}</label>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export interface DropdownOption {
    label: string;
    value: typeof config.theme;
    default?: boolean;
    ref?: RefObject<HTMLDivElement>;
}
