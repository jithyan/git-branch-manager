import React, { useMemo } from "react";
import { render, Box, Text, useApp } from "ink";
import SelectInput from "ink-select-input";

interface SelectFromBranchesProps {
  currentBranch: string;
  otherBranches: string[];
  onBranchSelected: (branch: string) => Promise<void>;
}

export function renderUi(props: SelectFromBranchesProps) {
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
}: {
  currentBranch: string;
  otherBranches: string[];
  onBranchSelected: (branch: string) => Promise<void>;
}) {
  const { exit } = useApp();
  const items = useMemo(
    () => [...otherBranches.map((b) => ({ label: b, value: b })), exitAppItem],
    [otherBranches]
  );

  return (
    <Box flexDirection="column">
      <Box>
        <Text>
          <Text color="white">currently on </Text>
          <Text color="cyan">{currentBranch}</Text>
        </Text>
      </Box>
      <Box marginX={1}>
        <SelectInput
          items={items}
          onSelect={({ value }) => {
            if (value === "exit") {
              exit();
            } else {
              onBranchSelected(value).then(() => exit());
            }
          }}
        />
      </Box>
    </Box>
  );
}
