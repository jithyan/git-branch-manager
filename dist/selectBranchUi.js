"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSelect = exports.renderLoadingIndicator = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ink_1 = require("ink");
const ink_select_input_1 = __importDefault(require("ink-select-input"));
const ink_spinner_1 = __importDefault(require("ink-spinner"));
function renderLoadingIndicator() {
    const r = (0, ink_1.render)((0, jsx_runtime_1.jsx)(ink_1.Text, { color: "yellow", children: (0, jsx_runtime_1.jsx)(ink_spinner_1.default, { type: "dots3" }) }));
    return () => {
        r.clear();
        r.unmount();
    };
}
exports.renderLoadingIndicator = renderLoadingIndicator;
function renderSelect(props) {
    return (0, ink_1.render)((0, jsx_runtime_1.jsx)(SelectFromBranches, { ...props }));
}
exports.renderSelect = renderSelect;
const exitAppItem = {
    label: (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "red", children: "Exit" }),
    value: "exit",
};
function SelectFromBranches({ currentBranch, otherBranches, onBranchSelected, }) {
    const { exit } = (0, ink_1.useApp)();
    const items = (0, react_1.useMemo)(() => [...otherBranches.map((b) => ({ label: b, value: b })), exitAppItem], [otherBranches]);
    const [status, setStatus] = (0, react_1.useState)("READY");
    if (status === "LOADING") {
        return ((0, jsx_runtime_1.jsx)(ink_1.Text, { color: "green", children: (0, jsx_runtime_1.jsx)(ink_spinner_1.default, { type: "dots" }) }));
    }
    else if (status === "EXIT") {
        return null;
    }
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", children: [(0, jsx_runtime_1.jsx)(Show, { when: Boolean(currentBranch), children: (0, jsx_runtime_1.jsx)(ink_1.Box, { children: (0, jsx_runtime_1.jsxs)(ink_1.Text, { children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: "white", children: "currently on " }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "cyan", children: currentBranch })] }) }) }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginX: 1, children: (0, jsx_runtime_1.jsx)(ink_select_input_1.default, { items: items, onSelect: ({ value }) => {
                        if (value === "exit") {
                            exit();
                        }
                        else {
                            setStatus(() => "LOADING");
                            onBranchSelected(value).then(() => {
                                setStatus(() => "EXIT");
                                exit();
                            });
                        }
                    } }) })] }));
}
function Show({ when, children, }) {
    return when ? children : null;
}
