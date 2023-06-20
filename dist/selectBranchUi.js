import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from "react";
import { render, Box, Text, useApp } from "ink";
import SelectInput from "ink-select-input";
import Spinner from "ink-spinner";
export function renderLoadingIndicator() {
    const r = render(_jsx(Text, { color: "yellow", children: _jsx(Spinner, { type: "dots3" }) }));
    return () => {
        r.clear();
        r.unmount();
    };
}
export function renderSelect(props) {
    return render(_jsx(SelectFromBranches, { ...props }));
}
const exitAppItem = {
    label: _jsx(Text, { color: "red", children: "Exit" }),
    value: "exit",
};
function SelectFromBranches({ currentBranch, otherBranches, onBranchSelected, }) {
    const { exit } = useApp();
    const items = useMemo(() => [...otherBranches.map((b) => ({ label: b, value: b })), exitAppItem], [otherBranches]);
    const [status, setStatus] = useState("READY");
    if (status === "LOADING") {
        return (_jsx(Text, { color: "green", children: _jsx(Spinner, { type: "dots" }) }));
    }
    else if (status === "EXIT") {
        return null;
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Show, { when: Boolean(currentBranch), children: _jsx(Box, { children: _jsxs(Text, { children: [_jsx(Text, { color: "white", children: "currently on " }), _jsx(Text, { color: "cyan", children: currentBranch })] }) }) }), _jsx(Box, { marginX: 1, children: _jsx(SelectInput, { items: items, onSelect: ({ value }) => {
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
