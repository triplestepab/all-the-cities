import js from "@eslint/js";
import globals from "globals";
import tsEslint from "typescript-eslint";

export default tsEslint.config(
    js.configs.recommended,
    ...tsEslint.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.browser
            },
            parserOptions: {
                parser: tsEslint.parser,
            },
        },
    },
    {
        ignores: [
            "**/.next",
            "**/.vercel",
            "**/build",
            "**/node_modules",
            "**/package",
            "eslint.config.js",      // Disable this rule while meddling with the eslint.config.js file
        ],
    },
    {
        rules: {
            // ***************************************************
            // * Qoutes / Strings / Concaternations
            // ***************************************************
            "quotes": [
                "warn",
                "double",
                {
                    avoidEscape: true,
                    allowTemplateLiterals: true
                },
            ],
            "@typescript-eslint/quotes": "off",
            "prefer-template": "error", // Use template strings instead of string concatenation
            "quote-props": [ // Will change let a= { "foo": bar } into { foo: bar }
                "off",
            ],
            "no-useless-escape": "warn", // Will warn of for example this "\'"
            "no-useless-concat": "warn", // Will warn for example for var a = '1' + '0';
            // ******************************************
            // * Semis & commas
            // ******************************************
            "semi": ["warn", "always"],
            "comma-dangle": [
                "warn",
                {
                    "arrays": "always-multiline",
                    "objects": "always-multiline",
                    "imports": "always-multiline",
                    "exports": "always-multiline",
                    "functions": "never"
                }
            ],
            // ******************************************
            // * Indent and line length
            // ******************************************
            "no-tabs": "off",
            "max-len": [
                "error",
                180,
                {
                    "ignoreComments": true,
                    "ignoreTrailingComments": true,
                    "ignoreUrls": true,
                    "ignoreStrings": true,
                    "ignoreTemplateLiterals": true
                }
            ],
            "no-trailing-spaces": "warn", // disallow trailing whitespace at the end of lines
            // ******************************************
            // * "empty lines"
            // ******************************************
            "eol-last": "off",
            "no-multiple-empty-lines": [
                "warn",
                {
                    "max": 10,
                    "maxEOF": 1
                }
            ],
            // ******************************************
            // * Variables 
            // ******************************************
            "prefer-destructuring": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    "vars": "all",
                    "args": "after-used",
                    "ignoreRestSiblings": false,
                    "argsIgnorePattern": "^_", // Function args starting with _ is ignored
                    "varsIgnorePattern": "^_" // Any variable starting with _ is ignored
                }
            ],
            "no-param-reassign": "error", // Disallow function input parameters to be modified
            "prefer-const": "error",
            "camelcase": [ //  "const myVariable = 1;"
                "warn"
            ],
            "new-cap": [ //  "new Foo()"
                "warn"
            ],
            "no-shadow": "off", // Note: you must disable the base rule as it can report incorrect errors
            "@typescript-eslint/no-shadow": [
                "error",
                {
                    "hoist": "functions"
                }
            ],
            "one-var": ["warn", "never"], // Require variable declarations to be on separate lines
            "no-use-before-define": "off",
            "@typescript-eslint/no-use-before-define": [
                "error",
                {
                    "functions": false,
                    "classes": false,
                    "variables": true,
                    "allowNamedExports": false
                }
            ],
            "no-underscore-dangle": [
                "warn",
                {
                    "allow": [
                        "_id",
                        "_mutex"
                    ]
                }
            ],
            "arrow-parens": [
                "warn",
                "as-needed"
            ],
            "no-undef-init": "off", // Allow "let a = undefined"
            "vars-on-top": "off",
            // ******************************************
            // * Comparisations 
            // ******************************************
            "eqeqeq": "error",
            "valid-typeof": "error",
            // ***************************************************
            // * Switch
            // ***************************************************
            "no-case-declarations": "off", // Allow inline code,
            "default-case": "off", // Allow "switch" statement without default
            // ***************************************************
            // * Formatting - Linefeeds and spaces
            // ***************************************************
            "padded-blocks": "off",
            "space-before-function-paren": [
                "warn",
                {
                    "anonymous": "always", // function () {};
                    "named": "never", // function foo() {};
                    "asyncArrow": "always" // async () => {};
                }
            ],
            "lines-between-class-members": "off",
            "no-multi-spaces": [
                "warn",
                {
                    "ignoreEOLComments": true
                }
            ],
            // ******************************************
            // * Functions 
            // ******************************************
            "@typescript-eslint/explicit-module-boundary-types": [
                "warn",
                {
                    "allowArgumentsExplicitlyTypedAsAny": true // Allow any as return type
                }
            ],
            "no-useless-return": "warn",
            "no-empty-function": "error", // Need to write code :)
            "prefer-arrow-callback": "off",
            "func-names": "off", // turns of async _function_ (req: Express.Request, res: Express.Response) check
            "consistent-return": "off",
            "no-restricted-syntax": "off",
            // ***************************************************
            // * Classes
            // ***************************************************
            "max-classes-per-file": "off",
            // ***************************************************
            // * Formatting { }
            // ***************************************************
            "curly": "off",
            "brace-style": [
                "error",
                "stroustrup",
                {
                    "allowSingleLine": true
                }
            ],
            "object-curly-spacing": [
                "warn",
                "always"
            ],
            "nonblock-statement-body-position": [
                "error",
                "below"
            ],
            // ***************************************************
            // * Indenting
            // ***************************************************
            "indent": "off", // Indent rules should align with "vscode.typescript-language-features"
            "@typescript-eslint/indent": "off",
            // ******************************************
            // * Async/Await/Promise/yield
            // ******************************************
            "no-return-await": "off", // Allow "Redundant use of `await` on a return value."
            "require-await": "warn", // Async function 'foo' has no 'await' expression.
            "require-yield": "warn",
            "prefer-promise-reject-errors": "error",
            "handle-callback-err": "error",
            /* Cannot find a solution for this one, /T 2024-08 */
            // "@typescript-eslint/await-thenable": "warn", // Disallow awaiting a value that is not a Thenable
            "no-promise-executor-return": "off", // https://eslint.org/docs/latest/rules/no-promise-executor-return
            // ******************************************
            // * Loops
            // ******************************************
            "no-await-in-loop": "off", // allow for (const foo of bar) { let y = await }
            "no-continue": "off",
            "guard-for-in": "off",
            // ******************************************
            // * If & ternaries ? yes : no
            // ******************************************
            "no-lonely-if": "off",
            "no-unneeded-ternary": "warn",
            "no-nested-ternary": "off",
            "no-else-return": "off",
            // ***************************************************
            // * This... and this...
            // ***************************************************
            "@typescript-eslint/no-this-alias": "warn",
            "class-methods-use-this": "off", // Allow class methods to exist without being suggested to turn them into a static method
            // ******************************************
            // * Typescript
            // ******************************************
            "@typescript-eslint/ban-ts-comment": [
                "warn",
                {
                    "ts-expect-error": "allow-with-description",
                    "ts-ignore": "allow-with-description",
                    "ts-nocheck": "allow-with-description",
                    "ts-check": "allow-with-description"
                }
            ],
            // ******************************************
            // * Types
            // ******************************************
            "@typescript-eslint/no-restricted-types": [
                "warn",
                {
                    "types": {
                        "String": {
                            "message": "Use string instead of String",
                            "fixWith": "string"
                        },
                        "Object": {
                            "message": "Use object instead of Object",
                            "fixWith": "object"
                        },
                        "{}": {
                            "message": "Don't use {}, probably replace with 'undefined'",
                            "fixWith": "undefined"
                        }
                    }
                }
            ],
            "@typescript-eslint/no-empty-object-type": "error", // Disallow using {}
            "@typescript-eslint/no-explicit-any": [
                "warn",
                {
                    "fixToUnknown": false,
                    "ignoreRestArgs": true
                }
            ],
            "@typescript-eslint/explicit-function-return-type": [
                "warn",
                {
                    "allowExpressions": false,
                    "allowTypedFunctionExpressions": true,
                    "allowHigherOrderFunctions": false,
                    "allowDirectConstAssertionInArrowFunctions": false,
                    "allowConciseArrowFunctionExpressionsStartingWithVoid": false
                }
            ],
            // ******************************************
            // * Mathematical
            // ******************************************
            "radix": "off",
            "no-plusplus": "off",
            "no-bitwise": "off",
            "no-mixed-operators": "off",
            // ***************************************************
            // * Debugging
            // ***************************************************
            "no-console": "off",
            "no-debugger": "warn",
            // ******************************************
            // * Misc
            // ******************************************
            "no-unreachable": "warn" // Unreachable code
        }
    }
);