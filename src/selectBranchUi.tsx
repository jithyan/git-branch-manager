import React, { useMemo, useState } from "react";
import { render, Box, Text, useApp } from "ink";
import SelectInput from "ink-select-input";
import Spinner from "ink-spinner";

interface SelectFromBranchesProps {
  currentBranch?: string;
  otherBranches: string[];
  onBranchSelected: (branch: string) => Promise<any>;
}

export function renderLoadingIndicator() {
  const r = render(
    <Text color="yellow">
      <Spinner type="dots3" />
    </Text>
  );

  return () => {
    r.clear();
    r.unmount();
  };
}

export function renderSelect(props: SelectFromBranchesProps) {
  return render(<SelectFromBranches {...props} />);
}

const exitAppItem = {
  label: <Text color="red">Exit</Text>,
  value: "exit",
} as unknown as { label: string; value: string };

function SelectFromBranches({
  currentBranch,
  otherBranches,
  onBranchSelected,
}: SelectFromBranchesProps) {
  const { exit } = useApp();
  const items = useMemo(
    () => [...otherBranches.map((b) => ({ label: b, value: b })), exitAppItem],
    [otherBranches]
  );

  const [status, setStatus] = useState<"READY" | "LOADING" | "EXIT">("READY");

  if (status === "LOADING") {
    return (
      <Text color="green">
        <Spinner type="dots" />
      </Text>
    );
  } else if (status === "EXIT") {
    return null;
  }

  return (
    <Box flexDirection="column">
      <Show when={Boolean(currentBranch)}>
        <Box>
          <Text>
            <Text color="white">currently on </Text>
            <Text color="cyan">{currentBranch}</Text>
          </Text>
        </Box>
      </Show>
      <Box marginX={1}>
        <SelectInput
          items={items}
          onSelect={({ value }) => {
            if (value === "exit") {
              exit();
            } else {
              setStatus(() => "LOADING");
              onBranchSelected(value).then(() => {
                setStatus(() => "EXIT");
                exit();
              });
            }
          }}
        />
      </Box>
    </Box>
  );
}

function Show({
  when,
  children,
}: {
  when: boolean;
  children: JSX.Element;
}): JSX.Element | null {
  return when ? children : null;
}
