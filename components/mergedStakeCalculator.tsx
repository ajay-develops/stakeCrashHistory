"use client";

import React from "react";
import {
  Card,
  CardBody,
  NumberInput,
  Input,
  Button,
  Chip,
} from "@heroui/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { FileJson } from "lucide-react";

// Define the structure for a single row in our calculation table
interface BetRowData {
  betNumber: number;
  currentBetAmount: number;
  profitIfWon: number;
  totalCost: number;
  totalProfitLoss: number;
}

// Define the structure for MultiplayerCrash (assuming it's from your types)
interface MultiplayerCrash {
  crashpoint: number;
  // Add other properties if they exist in your MultiplayerCrash type
}

// Helper function to get ordinal suffix (e.g., "st", "nd", "rd", "th")
const getOrdinalSuffix = (n: number) => {
  if (n === 0) return "";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const MergedStakeCalculator: React.FC = () => {
  // --- StakeCostProfitCalculator States ---
  const [betStartAmount, setBetStartAmount] = React.useState<number>(1);
  const [increasePercentage, setIncreasePercentage] =
    React.useState<number>(90);
  // Consolidated profitMultiplier and highlightCrashesFrom
  const [
    profitMultiplierAndHighlightThreshold,
    setProfitMultiplierAndHighlightThreshold,
  ] = React.useState<number>(2.0);
  const [runway, setRunway] = React.useState<number>(20); // Initial value
  const [investmentAmount, setInvestmentAmount] = React.useState<number>(1000);

  // --- StakeCrashHistoryAnalytics States ---
  const [fileName, setFileName] = React.useState<string>("");
  const [fileContents, setFileContents] = React.useState<MultiplayerCrash[]>(
    []
  );

  // --- StakeCostProfitCalculator Calculations ---
  const { tableData, effectiveRunwayLength, investmentNeededForFullRunway } =
    React.useMemo(() => {
      const data: BetRowData[] = [];
      let currentBet = betStartAmount;
      let accumulatedCost = 0;
      let effectiveLengthCalculated = 0; // This will go beyond 'runway' input if investment allows

      if (betStartAmount <= 0 || profitMultiplierAndHighlightThreshold <= 0) {
        return {
          tableData: [],
          effectiveRunwayLength: 0,
          investmentNeededForFullRunway: 0,
        };
      }

      // Calculate table data and effective runway based on investment, not limited by 'runway' input initially
      let tempBetForEffectiveRunway = betStartAmount;
      let tempAccumulatedCostForEffectiveRunway = 0;
      let i = 1;
      while (true) {
        // Loop indefinitely until investment is exhausted or a high enough number of bets reached
        const costForThisBet = tempBetForEffectiveRunway;
        tempAccumulatedCostForEffectiveRunway += costForThisBet;

        if (tempAccumulatedCostForEffectiveRunway > investmentAmount) {
          effectiveLengthCalculated = i - 1;
          break; // Investment exhausted
        }
        effectiveLengthCalculated = i;

        // Populate table data up to the *user-defined* runway, or effectiveLength if smaller.
        // We ensure `data` doesn't grow indefinitely if `runway` is very small compared to `effectiveLengthCalculated`.
        if (i <= runway) {
          const profitIfWon =
            tempBetForEffectiveRunway * profitMultiplierAndHighlightThreshold;
          const totalProfitLoss =
            profitIfWon - tempAccumulatedCostForEffectiveRunway;
          data.push({
            betNumber: i,
            currentBetAmount: parseFloat(tempBetForEffectiveRunway.toFixed(2)),
            profitIfWon: parseFloat(profitIfWon.toFixed(2)),
            totalCost: parseFloat(
              tempAccumulatedCostForEffectiveRunway.toFixed(2)
            ),
            totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
          });
        }

        tempBetForEffectiveRunway =
          tempBetForEffectiveRunway +
          tempBetForEffectiveRunway * (increasePercentage / 100);
        i++;
        if (i > 1000) break; // Safety break to prevent infinite loops if values lead to non-exhaustion
      }

      // Calculate investment needed for the *user-defined* runway
      let fullRunwayCost = 0;
      let tempCurrentBetForRunwayCost = betStartAmount;
      for (let j = 1; j <= runway; j++) {
        fullRunwayCost += tempCurrentBetForRunwayCost;
        tempCurrentBetForRunwayCost =
          tempCurrentBetForRunwayCost +
          tempCurrentBetForRunwayCost * (increasePercentage / 100);
      }

      return {
        tableData: data.slice(
          0,
          effectiveLengthCalculated > 0 ? effectiveLengthCalculated : 0
        ), // Display table data up to effective runway length
        effectiveRunwayLength: effectiveLengthCalculated,
        investmentNeededForFullRunway: parseFloat(fullRunwayCost.toFixed(2)),
      };
    }, [
      betStartAmount,
      increasePercentage,
      profitMultiplierAndHighlightThreshold,
      runway, // `runway` is still a dependency for `investmentNeededForFullRunway`
      investmentAmount,
    ]);

  // --- StakeCrashHistoryAnalytics Calculations & Handlers ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const contents = JSON.parse(e.target?.result as string);
          setFileContents(contents);
        } catch (error) {
          console.error("Error parsing JSON:", error);
          setFileContents([]);
          setFileName("");
          alert("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    } else {
      setFileContents([]);
      setFileName("");
    }
  };

  const {
    processedCrashes,
    maxGap,
    totalGreens,
    totalBets,
    greensAfterPreviousGreen,
    greensAfterPreviousNonGreen,
    nonGreenStreaks,
    greenStreaks,
    projectedTotalProfitLoss,
  } = React.useMemo(() => {
    let currentGap = 0;
    let maxGapFound = 0;
    let lastGreenIndex = -1;
    let greenCount = 0;
    let greensAfterGreenCount = 0;
    let greensAfterNonGreenCount = 0;

    const nonGreenStreaks: { [key: number]: number } = {};
    const greenStreaks: { [key: number]: number } = {};
    let currentNonGreenStreak = 0;
    let currentGreenStreak = 0;

    let calculatedProjectedTotalProfitLoss = 0;
    let currentBetAttemptIndex = 0;

    const crashesWithGaps = fileContents.map((crashGame, index) => {
      const isGreen =
        crashGame.crashpoint >= profitMultiplierAndHighlightThreshold;
      let gapText = "";
      let calculatedGap = 0;

      const previousCrashWasGreen =
        index > 0
          ? fileContents[index - 1].crashpoint >=
            profitMultiplierAndHighlightThreshold
          : false;

      // --- Simulation for Projected Profit/Loss ---
      // This simulation should consider the actual effective runway length
      // based on the investment.
      if (
        currentBetAttemptIndex < effectiveRunwayLength &&
        tableData[currentBetAttemptIndex]
      ) {
        const currentBetRow = tableData[currentBetAttemptIndex];
        const betAmountForThisRound = currentBetRow.currentBetAmount;

        if (isGreen) {
          calculatedProjectedTotalProfitLoss +=
            betAmountForThisRound * profitMultiplierAndHighlightThreshold -
            betAmountForThisRound;
          currentBetAttemptIndex = 0; // Reset to the first bet
        } else {
          calculatedProjectedTotalProfitLoss -= betAmountForThisRound;
          currentBetAttemptIndex++; // Move to the next bet in the sequence
        }
      } else if (currentBetAttemptIndex >= effectiveRunwayLength && !isGreen) {
        // If the strategy would have busted due to insufficient funds,
        // we should reflect a loss equivalent to the last bet that would have been placed
        // if funds ran out during this non-green streak.
        // For simplicity, we can assume further losses are capped at what would have been
        // the last bet in the effective runway, or just stop calculating.
        // For now, if we've passed the effective runway, we don't adjust profit/loss further
        // as the strategy would have failed.
        // A more sophisticated simulation might track the actual balance.
      }
      // --- End Simulation ---

      if (isGreen) {
        greenCount++;

        if (currentNonGreenStreak > 0) {
          nonGreenStreaks[currentNonGreenStreak] =
            (nonGreenStreaks[currentNonGreenStreak] || 0) + 1;
          currentNonGreenStreak = 0;
        }
        currentGreenStreak++;

        if (index > 0) {
          if (previousCrashWasGreen) {
            greensAfterGreenCount++;
          } else {
            greensAfterNonGreenCount++;
          }
        } else {
          greensAfterNonGreenCount++;
        }

        if (lastGreenIndex === -1) {
          calculatedGap = index + 1;
        } else {
          calculatedGap = index - lastGreenIndex;
        }

        gapText = `${calculatedGap}${getOrdinalSuffix(calculatedGap)}`;
        maxGapFound = Math.max(maxGapFound, calculatedGap);

        currentGap = 0;
        lastGreenIndex = index;
      } else {
        if (currentGreenStreak > 0) {
          greenStreaks[currentGreenStreak] =
            (greenStreaks[currentGreenStreak] || 0) + 1;
          currentGreenStreak = 0;
        }
        currentNonGreenStreak++;
        currentGap++;
      }

      return {
        ...crashGame,
        _isGreen: isGreen,
        _gapText: isGreen ? gapText : "",
      };
    });

    if (currentNonGreenStreak > 0) {
      nonGreenStreaks[currentNonGreenStreak] =
        (nonGreenStreaks[currentNonGreenStreak] || 0) + 1;
    }
    if (currentGreenStreak > 0) {
      greenStreaks[currentGreenStreak] =
        (greenStreaks[currentGreenStreak] || 0) + 1;
    }

    return {
      processedCrashes: crashesWithGaps,
      maxGap: maxGapFound,
      totalGreens: greenCount,
      totalBets: fileContents.length,
      greensAfterPreviousGreen: greensAfterGreenCount,
      greensAfterPreviousNonGreen: greensAfterNonGreenCount,
      nonGreenStreaks,
      greenStreaks,
      projectedTotalProfitLoss: parseFloat(
        calculatedProjectedTotalProfitLoss.toFixed(2)
      ),
    };
  }, [
    fileContents,
    profitMultiplierAndHighlightThreshold,
    tableData,
    effectiveRunwayLength,
  ]); // Added effectiveRunwayLength to dependencies

  // Effect to update runway when maxGap changes (after file upload)
  React.useEffect(() => {
    if (maxGap > 0) {
      setRunway(maxGap);
    }
  }, [maxGap]);

  return (
    <div className="flex flex-col items-center p-6 min-h-screen font-inter space-y-8">
      <h1 className="text-3xl font-bold rounded-lg px-8 py-2">
        Crash Game Analyzer
      </h1>
      ---
      {/* --- Combined Input Section --- */}
      <Card className="w-full max-w-4xl">
        <CardBody className="p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Settings & Data Input
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* File Upload Input */}
            <div className="flex flex-col md:col-span-2 lg:col-span-4">
              <label htmlFor="file-upload" className="text-sm font-medium mb-1">
                Upload Crash History JSON File
              </label>
              <Input
                id="file-upload"
                type="file"
                accept=".json"
                size="lg"
                onChange={handleFileChange}
                startContent={<FileJson className="text-2xl" />}
                placeholder="Choose a JSON file"
                classNames={{
                  input: "file:hidden",
                  innerWrapper: "flex-row-reverse",
                }}
              />
            </div>

            {/* Bet Start Amount Input */}
            <div className="flex flex-col">
              <label
                htmlFor="betStartAmount"
                className="text-sm font-medium mb-1"
              >
                Bet Start Amount (₹)
              </label>
              <NumberInput
                id="betStartAmount"
                value={betStartAmount}
                onChange={(value) => {
                  const numValue = parseFloat(value.toString());
                  if (!isNaN(numValue) && numValue >= 0.01)
                    setBetStartAmount(numValue);
                }}
                min={0.01}
                step={0.01}
                size="sm"
                startContent={<span>₹</span>}
                hideStepper
              />
            </div>

            {/* Increase Percentage Input */}
            <div className="flex flex-col">
              <label
                htmlFor="increasePercentage"
                className="text-sm font-medium mb-1"
              >
                Increase Next Bet by (%)
              </label>
              <NumberInput
                id="increasePercentage"
                value={increasePercentage}
                onChange={(value) => {
                  const numValue = parseFloat(value.toString());
                  if (!isNaN(numValue) && numValue >= 0.01 && numValue <= 1000)
                    setIncreasePercentage(numValue);
                }}
                min={0.01}
                max={1000}
                step={1}
                hideStepper
              />
            </div>

            {/* Consolidated Profit Multiplier / Highlight Threshold Input */}
            <div className="flex flex-col">
              <label
                htmlFor="profitMultiplierAndHighlightThreshold"
                className="text-sm font-medium mb-1"
              >
                Win Multiplier (X)
              </label>
              <NumberInput
                id="profitMultiplierAndHighlightThreshold"
                value={profitMultiplierAndHighlightThreshold}
                onChange={(value) => {
                  const numValue = parseFloat(value.toString());
                  if (!isNaN(numValue) && numValue > 0)
                    setProfitMultiplierAndHighlightThreshold(numValue);
                }}
                min={0.01}
                step={0.1}
                hideStepper
              />
            </div>

            {/* Runway Input */}
            <div className="flex flex-col">
              <label htmlFor="runway" className="text-sm font-medium mb-1">
                Bets
              </label>
              <NumberInput
                id="runway"
                value={runway}
                onChange={(value) => {
                  const numValue = parseInt(value.toString());
                  if (!isNaN(numValue) && numValue >= 1) setRunway(numValue);
                }}
                min={1}
                step={1}
                hideStepper
              />
            </div>

            {/* Investment Input */}
            <div className="flex flex-col md:col-span-2 lg:col-span-4">
              <label
                htmlFor="investmentAmount"
                className="text-sm font-medium mb-1"
              >
                Your Investment (₹)
              </label>
              <NumberInput
                id="investmentAmount"
                value={investmentAmount}
                onChange={(value) => {
                  const numValue = parseFloat(value.toString());
                  if (!isNaN(numValue) && numValue >= 0)
                    setInvestmentAmount(numValue);
                }}
                min={0}
                step={100}
                startContent={<span>₹</span>}
                hideStepper
              />
            </div>
          </div>
        </CardBody>
      </Card>
      ---
      {/* --- Summary Section (Consolidated) --- */}
      {(Boolean(effectiveRunwayLength) || Boolean(fileContents.length)) && (
        <div className="w-full">
          <h2 className="text-2xl text-center font-semibold mb-4">Summary</h2>
          <Card className="w-full p-6 text-center">
            {Boolean(effectiveRunwayLength) && (
              <>
                <p className="text-lg mb-2">
                  Your investment of{" "}
                  <span className="font-bold">
                    ₹{investmentAmount.toFixed(2)}
                  </span>{" "}
                  can sustain a maximum of{" "}
                  <span className="font-bold">{effectiveRunwayLength}</span>{" "}
                  bets.
                </p>
                {maxGap > 0 && ( // Only show historical runway if file contents are processed
                  <>
                    <p className="text-lg">
                      The longest historical non-green streak from the uploaded
                      data is <span className="font-bold">{maxGap}</span> bets.
                    </p>
                    <p className="text-lg">
                      To cover this full historical streak, an investment of{" "}
                      <span className="font-bold">
                        ₹{investmentNeededForFullRunway.toFixed(2)}
                      </span>{" "}
                      is needed.
                    </p>
                    {investmentAmount >= investmentNeededForFullRunway ? (
                      <p className="text-lg text-green-600 font-semibold mt-2">
                        Your current investment is sufficient to cover the
                        longest historical non-green streak.
                      </p>
                    ) : (
                      <p className="text-lg text-red-600 font-semibold mt-2">
                        You would need an additional ₹
                        {(
                          investmentNeededForFullRunway - investmentAmount
                        ).toFixed(2)}{" "}
                        to cover the longest historical non-green streak.
                      </p>
                    )}
                  </>
                )}
              </>
            )}

            {Boolean(fileContents.length) && (
              <p className="text-lg mt-4">
                Projected Profit/Loss based on history:{" "}
                <span
                  className={`font-bold ${
                    projectedTotalProfitLoss >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ₹{projectedTotalProfitLoss.toFixed(2)}
                </span>
              </p>
            )}
          </Card>
        </div>
      )}
      ---
      {/* --- StakeCostProfitCalculator Simulation Results Table --- */}
      <div className="w-full">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Simulation Results (Per Bet)
        </h2>
        {tableData.length === 0 ? (
          <p className="text-center py-8">
            Please enter valid input values (Bet Start Amount, Win Multiplier,
            and Historical Streak Runway must be positive, Investment must be
            non-negative).
          </p>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableColumn>Bet #</TableColumn>
              <TableColumn>Current Bet Amount</TableColumn>
              <TableColumn>Profit if Won</TableColumn>
              <TableColumn>Total Cost (if lost)</TableColumn>
              <TableColumn>Total Profit/Loss (if won)</TableColumn>
            </TableHeader>
            <TableBody>
              {tableData.map((row) => (
                <TableRow key={row.betNumber}>
                  <TableCell>{row.betNumber}</TableCell>
                  <TableCell>₹{row.currentBetAmount.toFixed(2)}</TableCell>
                  <TableCell>₹{row.profitIfWon.toFixed(2)}</TableCell>
                  <TableCell>₹{row.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <span
                      className={`font-semibold ${
                        row.totalProfitLoss >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ₹{row.totalProfitLoss.toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      ---
      {/* --- Crash History Analytics Display --- */}
      <div className="mt-6 w-full flex flex-col gap-8 items-center justify-center">
        {Boolean(fileContents.length) ? (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-center">
              Crash History Analytics
            </h2>
            <div className="text-center text-base font-medium">
              <p>
                Total Bets:{" "}
                <span className="text-primary-500">{totalBets}</span>
              </p>
              <p>
                Total Greens:{" "}
                <span className="text-success-500">{totalGreens}</span>
              </p>
              <p>
                Greens After Previous Green:{" "}
                <span className="text-success-500">
                  {greensAfterPreviousGreen}
                </span>
              </p>
              <p>
                Greens After Previous Non-Green:{" "}
                <span className="text-success-500">
                  {greensAfterPreviousNonGreen}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 text-center">
              <Card className="p-4">
                <CardBody>
                  <h3 className="text-md font-semibold mb-2">
                    Non-Green Streaks
                  </h3>
                  {Object.keys(nonGreenStreaks).length > 0 ? (
                    Object.entries(nonGreenStreaks)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([length, count]) => (
                        <p
                          key={`nongreen-streak-${length}`}
                          className="text-sm"
                        >
                          <span className="font-medium">{length}</span>
                          {Number(length) === 1 ? " " : " consecutive "}
                          non-green: <span className="">{count}</span> times
                        </p>
                      ))
                  ) : (
                    <p className="text-sm">No non-green streaks found.</p>
                  )}
                </CardBody>
              </Card>

              <Card className="p-4">
                <CardBody>
                  <h3 className="text-md font-semibold mb-2">Green Streaks</h3>
                  {Object.keys(greenStreaks).length > 0 ? (
                    Object.entries(greenStreaks)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([length, count]) => (
                        <p key={`green-streak-${length}`} className="text-sm">
                          <span className="font-medium">{length}</span>
                          {Number(length) === 1 ? " " : " consecutive "}
                          green:{" "}
                          <span className="text-success-500">{count}</span>{" "}
                          times
                        </p>
                      ))
                  ) : (
                    <p className="text-sm">No green streaks found.</p>
                  )}
                </CardBody>
              </Card>
            </div>

            {maxGap > 0 && (
              <div className="text-center text-lg font-medium">
                Most extreme crash streak from history:{" "}
                <span className="text-success-500">{maxGap}</span> bets
              </div>
            )}

            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-x-2 gap-y-4 max-w-7xl w-full h-full px-2 py-4 border rounded-lg">
              {processedCrashes.map((crashGame, index) => (
                <div key={index} className="flex flex-col items-center">
                  <Chip
                    className="max-w-20 w-fit text-center"
                    variant={crashGame._isGreen ? "shadow" : "solid"}
                    color={crashGame._isGreen ? "success" : "default"}
                    radius="full"
                  >
                    {crashGame.crashpoint.toFixed(2)}
                  </Chip>
                  {crashGame._isGreen && crashGame._gapText && (
                    <p className="text-xs mt-1">{crashGame._gapText}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center mt-8">
            Upload a JSON file to see the crash history analytics.
          </div>
        )}
      </div>
    </div>
  );
};

export default MergedStakeCalculator;
