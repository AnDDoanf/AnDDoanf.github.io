(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/ui/TypingText.jsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TypingText
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function TypingText({ text, speed = 40 }) {
    _s();
    const [displayed, setDisplayed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [index, setIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "TypingText.useLayoutEffect": ()=>{
            if (index >= text.length) return;
            const timeout = setTimeout({
                "TypingText.useLayoutEffect.timeout": ()=>{
                    setDisplayed({
                        "TypingText.useLayoutEffect.timeout": (prev)=>prev + text.charAt(index)
                    }["TypingText.useLayoutEffect.timeout"]);
                    setIndex({
                        "TypingText.useLayoutEffect.timeout": (prev)=>prev + 1
                    }["TypingText.useLayoutEffect.timeout"]);
                }
            }["TypingText.useLayoutEffect.timeout"], speed);
            return ({
                "TypingText.useLayoutEffect": ()=>clearTimeout(timeout)
            })["TypingText.useLayoutEffect"];
        }
    }["TypingText.useLayoutEffect"], [
        index,
        text,
        speed
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "home-description",
        children: displayed
    }, void 0, false, {
        fileName: "[project]/components/ui/TypingText.jsx",
        lineNumber: 20,
        columnNumber: 10
    }, this);
}
_s(TypingText, "9FF3Fvv55gcIYYKWiYukQwMnPTc=");
_c = TypingText;
var _c;
__turbopack_context__.k.register(_c, "TypingText");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=components_ui_TypingText_jsx_6d219e89._.js.map