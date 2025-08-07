export declare const JSONB: globalThis.JSONB;
export declare const JSONBConsole: globalThis.JSONBConsole;
declare global {
    interface JSONB {
        /**
         * Converts a JavaScript Object Notation (JSON) string into an object.
         * @param text A valid JSON string.
         * @param reviver A function that transforms the results. This function is called for each member of the object.
         * If a member contains nested objects, the nested objects are transformed before the parent object is.
         */
        parse(text: string, reviver?: (this: any, key: string, value: any) => any, options?: {
            bigint?: boolean;
            undefined?: boolean;
            Infinity?: boolean;
            NegativeInfinity?: boolean;
            NaN?: boolean;
            get?: false;
            set?: false;
            function?: false;
            class?: false;
        }): any;
        /**
         * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
         * @param value A JavaScript value, usually an object or array, to be converted.
         * @param replacer A function that transforms the results.
         * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
         */
        stringify(value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number, options?: {
            bigint?: boolean;
            undefined?: boolean;
            Infinity?: boolean;
            NegativeInfinity?: boolean;
            NaN?: boolean;
            get?: boolean;
            set?: boolean;
            function?: boolean;
            class?: false;
        }): string;
        /**
         * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
         * @param value A JavaScript value, usually an object or array, to be converted.
         * @param replacer An array of strings and numbers that acts as an approved list for selecting the object properties that will be stringified.
         * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
         */
        stringify(value: any, replacer?: (number | string)[] | null, space?: string | number, options?: {
            bigint?: boolean;
            undefined?: boolean;
            Infinity?: boolean;
            NegativeInfinity?: boolean;
            NaN?: boolean;
            get?: boolean;
            set?: boolean;
            function?: boolean;
            class?: false;
        }): string;
    }
    /**
     * An intrinsic object that provides functions to convert JavaScript values to and from the JavaScript Object Notation (JSON) format.
     */
    var JSONB: JSONB;
    interface JSONBConsole {
        /**
         * Converts a JavaScript Object Notation (JSON) string into an object.
         * @param text A valid JSON string.
         * @param reviver A function that transforms the results. This function is called for each member of the object.
         * If a member contains nested objects, the nested objects are transformed before the parent object is.
         */
        parse(text: string, reviver?: (this: any, key: string, value: any) => any, options?: {
            bigint?: boolean;
            undefined?: boolean;
            Infinity?: boolean;
            NegativeInfinity?: boolean;
            NaN?: boolean;
            get?: false;
            set?: false;
            function?: false;
            class?: false;
        }): any;
        /**
         * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
         *
         * The same as JSONB except it is made for console output, with options for things like maximum depth and length.
         *
         * @param value A JavaScript value, usually an object or array, to be converted.
         * @param replacer A function that transforms the results.
         * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
         * @param {number} [maxLength=Infinity] The maximum length of the string to be generated. It does not actually limit the string to this length, it is buggy, but it will have some impact on the length of the string.
         * @param {number} [maxDepth=Infinity] The maximum depth to stringify objects.
         */
        stringify(value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number, options?: {
            bigint?: boolean;
            undefined?: boolean;
            Infinity?: boolean;
            NegativeInfinity?: boolean;
            NaN?: boolean;
            get?: boolean;
            set?: boolean;
            function?: boolean;
            class?: false;
        }, maxLength?: number, maxDepth?: number): string;
        /**
         * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
         *
         * The same as JSONB except it is made for console output, with options for things like maximum depth and length.
         *
         * @param value A JavaScript value, usually an object or array, to be converted.
         * @param replacer An array of strings and numbers that acts as an approved list for selecting the object properties that will be stringified.
         * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
         * @param {number} [maxLength=Infinity] The maximum length of the string to be generated. It does not actually limit the string to this length, it is buggy, but it will have some impact on the length of the string.
         * @param {number} [maxDepth=Infinity] The maximum depth to stringify objects.
         */
        stringify(value: any, replacer?: (number | string)[] | null, space?: string | number, options?: {
            bigint?: boolean;
            undefined?: boolean;
            Infinity?: boolean;
            NegativeInfinity?: boolean;
            NaN?: boolean;
            get?: boolean;
            set?: boolean;
            function?: boolean;
            class?: false;
        }, maxLength?: number, maxDepth?: number): string;
    }
    /**
     * An intrinsic object that provides functions to convert JavaScript values to and from the JavaScript Object Notation (JSON) format.
     * The same as JSONB except it is made for console output, with options for things like maximum depth and length.
     */
    var JSONBConsole: JSONBConsole
}
