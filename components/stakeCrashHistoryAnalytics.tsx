"use client";

import React from "react";
import { Button, Input, NumberInput } from "@heroui/react";
import { Chip } from "@heroui/chip";
import { FileJson } from "lucide-react"; // Assuming lucide-react for icons
import { MultiplayerCrash } from "@/types";

// --- StakeCrashHistoryAnalytics Component (Consolidated Logic) ---
// This component now acts as a container for file upload and table display,
// receiving all necessary states and handlers as props.
export const StakeCrashHistoryAnalytics = ({
  fileName,
  handleFileChange,
  fileContents,
  highlightCrashesFrom,
  setHighlightCrashesFrom,
}: {
  fileName: string;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileContents: MultiplayerCrash[];
  highlightCrashesFrom: number | null;
  setHighlightCrashesFrom: (value: number | null) => void;
}) => {
  return (
    <>
      <UploadCrashHistoryFile
        {...{
          fileName,
          handleFileChange,
          setHighlightCrashesFrom,
          highlightCrashesFrom,
        }}
      />
      <CrashHistoryTable
        fileContents={fileContents}
        highlightCrashesFrom={highlightCrashesFrom}
        // setHighlightCrashesFrom is passed down but not directly used in table's rendering
        setHighlightCrashesFrom={setHighlightCrashesFrom}
      />
    </>
  );
};

// --- UploadCrashHistoryFile Component ---
function UploadCrashHistoryFile({
  fileName,
  handleFileChange,
  highlightCrashesFrom,
  setHighlightCrashesFrom,
}: {
  fileName?: string;
  handleFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  highlightCrashesFrom?: number | null;
  setHighlightCrashesFrom: (value: number | null) => void;
}) {
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-content1 rounded-large shadow-md space-y-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          Upload the Crash History JSON File here
        </h2>
        <Input
          type="file"
          accept=".json"
          size="lg"
          onChange={handleFileChange}
          startContent={<FileJson className="text-2xl text-default-400" />}
          placeholder="Choose a JSON file"
          classNames={{
            input: "file:hidden",
            innerWrapper: "flex-row-reverse",
          }}
        />
      </div>
      {fileName && ( // Only show this section if a file is selected
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">
            Highlight Crashes from or equal to
          </h2>
          <div>
            <NumberInput
              className=""
              color="default"
              size="sm"
              variant="flat"
              value={highlightCrashesFrom || 0}
              hideStepper
              defaultValue={2}
              onChange={(value) => {
                const numValue = Number(value);
                if (!isNaN(numValue)) {
                  setHighlightCrashesFrom(numValue);
                } else if (value === 0) {
                  setHighlightCrashesFrom(0);
                }
              }}
            />
          </div>
        </div>
      )}
      {/* The update button might not be strictly necessary if changes in NumberInput automatically re-render the table */}
      {fileName && (
        <Button color="success" className="w-full">
          Update Insights
        </Button>
      )}
    </div>
  );
}

// --- CrashHistoryTable Component ---
// Helper function to get ordinal suffix (e.g., "st", "nd", "rd", "th")
const getOrdinalSuffix = (n: number) => {
  if (n === 0) return "";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

function CrashHistoryTable({
  fileContents = [],
  highlightCrashesFrom = 0, // Default to 0 for internal calculations if null
  setHighlightCrashesFrom, // Passed down but not used for rendering in this component
}: {
  fileContents: MultiplayerCrash[];
  highlightCrashesFrom?: number | null;
  setHighlightCrashesFrom: (value: number | null) => void;
}) {
  const {
    processedCrashes,
    maxGap,
    totalGreens,
    totalBets,
    greensAfterPreviousGreen,
    greensAfterPreviousNonGreen,
  } = React.useMemo(() => {
    let currentGap = 0; // Counts non-green chips *between* green chips
    let maxGapFound = 0;
    let lastGreenIndex = -1; // Tracks the index of the previously found green chip
    let greenCount = 0; // Counts total green chips
    let greensAfterGreenCount = 0; // Count for greens immediately following a green
    let greensAfterNonGreenCount = 0; // Count for greens immediately following a non-green

    const crashesWithGaps = fileContents.map((crashGame, index) => {
      const isGreen = crashGame.crashpoint >= (highlightCrashesFrom || 0);
      let gapText = "";
      let calculatedGap = 0;

      // Determine the type of the *previous* crash for accurate counting
      const previousCrashWasGreen =
        index > 0
          ? fileContents[index - 1].crashpoint >= (highlightCrashesFrom || 0)
          : false;

      if (isGreen) {
        greenCount++; // Increment green chip count

        if (index > 0) {
          // Check only if it's not the first element
          if (previousCrashWasGreen) {
            greensAfterGreenCount++;
          } else {
            greensAfterNonGreenCount++;
          }
        } else {
          // If the first crash is green, it's considered a green after a "non-green" (as there's no previous crash)
          greensAfterNonGreenCount++;
        }

        // If this is the very first green chip encountered
        if (lastGreenIndex === -1) {
          calculatedGap = index + 1; // Its position is (index + 1) from the start
        } else {
          // For subsequent green chips, calculate gap from the last green chip
          calculatedGap = index - lastGreenIndex;
        }

        gapText = `${calculatedGap}${getOrdinalSuffix(calculatedGap)}`;
        maxGapFound = Math.max(maxGapFound, calculatedGap); // Update max gap found

        currentGap = 0; // Reset current gap count after a green chip
        lastGreenIndex = index; // Update the index of the last found green chip
      } else {
        currentGap++; // Increment gap for non-green chips
      }

      return {
        ...crashGame,
        _isGreen: isGreen, // Internal flag for easier rendering
        _gapText: isGreen ? gapText : "", // Store gap text only for green chips
      };
    });

    return {
      processedCrashes: crashesWithGaps,
      maxGap: maxGapFound,
      totalGreens: greenCount,
      totalBets: fileContents.length,
      greensAfterPreviousGreen: greensAfterGreenCount,
      greensAfterPreviousNonGreen: greensAfterNonGreenCount,
    };
  }, [fileContents, highlightCrashesFrom]);

  return (
    <div className="mt-6 w-full flex flex-col gap-8 items-center justify-center">
      {/* Total Bets and Greens Display */}
      {Boolean(fileContents.length) && (
        <div className="text-center text-base font-medium text-default-600">
          <p>
            Total Bets: <span className="text-primary-500">{totalBets}</span>
          </p>
          <p>
            Total Greens:{" "}
            <span className="text-success-500">{totalGreens}</span>
          </p>
          <p>
            Greens After Previous Green:{" "}
            <span className="text-success-500">{greensAfterPreviousGreen}</span>
          </p>
          <p>
            Greens After Previous Non-Green:{" "}
            <span className="text-success-500">
              {greensAfterPreviousNonGreen}
            </span>
          </p>
        </div>
      )}
      {/* Max Gap Display */}
      {Boolean(fileContents.length) && maxGap > 0 && (
        <div className="text-center text-lg font-medium text-default-600">
          Most extreme crash streak{" "}
          <span className="text-success-500">
            {maxGap}
            {/* {getOrdinalSuffix(maxGap)} */}
          </span>
        </div>
      )}

      {/* Table of Chips */}
      {Boolean(fileContents.length) ? (
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-2 gap-y-4 max-w-7xl w-full h-full px-2 py-4 border border-default-200 rounded-lg">
          {processedCrashes.map((crashGame, index) => (
            <div key={index} className="flex flex-col items-center">
              <Chip
                className="max-w-20 w-fit text-center"
                variant={crashGame._isGreen ? "shadow" : "solid"}
                color={crashGame._isGreen ? "success" : "default"}
                // Removed endContent={<X size={14} />} as X usually implies close/remove, not just display
                radius="full"
              >
                {crashGame.crashpoint.toFixed(2)}
              </Chip>
              {/* Display gap text below the chip if it's a green chip and gapText exists */}
              {crashGame._isGreen && crashGame._gapText && (
                <p className="text-xs text-default-400 mt-1">
                  {crashGame._gapText}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-default-500 mt-8">
          Upload a JSON file to see the crash history analytics.
        </div>
      )}
    </div>
  );
}
