"use client";
import React from "react";
import { Card, CardBody, NumberInput } from "@heroui/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { MinusCircle, PlusCircle } from "lucide-react";

// Define the structure for a single row in our calculation table
interface BetRowData {
  betNumber: number;
  currentBetAmount: number;
  profitIfWon: number;
  totalCost: number;
  totalProfitLoss: number;
}

const StakeCostProfitCalculator: React.FC = () => {
  // State variables for user inputs
  const [betStartAmount, setBetStartAmount] = React.useState<number>(1);
  const [increasePercentage, setIncreasePercentage] =
    React.useState<number>(90);
  const [profitMultiplier, setProfitMultiplier] = React.useState<number>(2.0);
  const [runway, setRunway] = React.useState<number>(20);
  const [investmentAmount, setInvestmentAmount] = React.useState<number>(1000);

  // Calculate the table data and derived metrics whenever inputs change
  const { tableData, effectiveRunwayLength, investmentNeededForFullRunway } =
    React.useMemo(() => {
      const data: BetRowData[] = [];
      let currentBet = betStartAmount;
      let accumulatedCost = 0;
      let currentInvestmentAmount = investmentAmount;
      let effectiveLength = 0;

      if (betStartAmount <= 0 || profitMultiplier <= 0 || runway <= 0) {
        return {
          tableData: [],
          effectiveRunwayLength: 0,
          investmentNeededForFullRunway: 0,
        };
      }

      for (let i = 1; i <= runway; i++) {
        const profitIfWon = currentBet * profitMultiplier;
        const costForThisBet = currentBet;
        accumulatedCost += costForThisBet;

        // Check if current accumulated cost exceeds investment (if investment is positive)
        if (
          currentInvestmentAmount > 0 &&
          accumulatedCost > currentInvestmentAmount
        ) {
          effectiveLength = i - 1; // Effective length is the number of bets *before* this one that exceeded investment
          break; // Stop adding rows if investment is exceeded
        }

        const totalProfitLoss = profitIfWon - accumulatedCost;

        data.push({
          betNumber: i,
          currentBetAmount: parseFloat(currentBet.toFixed(2)),
          profitIfWon: parseFloat(profitIfWon.toFixed(2)),
          totalCost: parseFloat(accumulatedCost.toFixed(2)),
          totalProfitLoss: parseFloat(totalProfitLoss.toFixed(2)),
        });

        currentBet = currentBet + currentBet * (increasePercentage / 100);
        effectiveLength = i; // Update effective length as we successfully add a row
      }

      // Calculate the full runway cost, independent of the user's current investment
      let fullRunwayCost = 0;
      let tempCurrentBet = betStartAmount;
      for (let i = 1; i <= runway; i++) {
        fullRunwayCost += tempCurrentBet;
        tempCurrentBet =
          tempCurrentBet + tempCurrentBet * (increasePercentage / 100);
      }

      return {
        tableData: data,
        effectiveRunwayLength: effectiveLength,
        investmentNeededForFullRunway: parseFloat(fullRunwayCost.toFixed(2)),
      };
    }, [
      betStartAmount,
      increasePercentage,
      profitMultiplier,
      runway,
      investmentAmount,
    ]);

  return (
    <div className="flex flex-col items-center p-6 min-h-screen font-inter space-y-8">
      <h1 className="text-3xl font-bold rounded-lg px-8 py-2">
        Crash Game Profit/Cost Calculator
      </h1>

      {/* Input Section */}
      <Card className="w-full max-w-4xl">
        <CardBody className="p-8">
          {/* <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center dark:text-gray-200">
            Settings
          </h2> */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Bet Start Amount Input */}
            <div className="flex flex-col">
              <label
                htmlFor="betStartAmount"
                className="text-gray-600 text-sm font-medium mb-1 dark:text-gray-300"
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
                // precision={2}
                startContent={
                  <span className="text-gray-400 dark:text-gray-500">₹</span>
                }
                endContent={
                  <div className="flex items-center">
                    <PlusCircle
                      className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-400"
                      size={18}
                      onClick={() =>
                        setBetStartAmount((prev) =>
                          parseFloat((prev + 0.01).toFixed(2))
                        )
                      }
                    />
                    <MinusCircle
                      className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors ml-1 dark:text-gray-500 dark:hover:text-gray-400"
                      size={18}
                      onClick={() =>
                        setBetStartAmount((prev) =>
                          parseFloat(Math.max(0.01, prev - 0.01).toFixed(2))
                        )
                      }
                    />
                  </div>
                }
              />
            </div>

            {/* Increase Percentage Input */}
            <div className="flex flex-col">
              <label
                htmlFor="increasePercentage"
                className="text-gray-600 text-sm font-medium mb-1 dark:text-gray-300"
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
                // precision={2}
                endContent={
                  <div className="flex items-center">
                    <PlusCircle
                      className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-400"
                      size={18}
                      onClick={() =>
                        setIncreasePercentage((prev) =>
                          Math.min(1000, parseFloat((prev + 1).toFixed(2)))
                        )
                      }
                    />
                    <MinusCircle
                      className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors ml-1 dark:text-gray-500 dark:hover:text-gray-400"
                      size={18}
                      onClick={() =>
                        setIncreasePercentage((prev) =>
                          Math.max(0.01, parseFloat((prev - 1).toFixed(2)))
                        )
                      }
                    />
                  </div>
                }
              />
            </div>

            {/* Profit Multiplier Input */}
            <div className="flex flex-col">
              <label
                htmlFor="profitMultiplier"
                className="text-gray-600 text-sm font-medium mb-1 dark:text-gray-300"
              >
                Profit Multiplier (X)
              </label>
              <NumberInput
                id="profitMultiplier"
                value={profitMultiplier}
                onChange={(value) => {
                  const numValue = parseFloat(value.toString());
                  if (!isNaN(numValue) && numValue > 0)
                    setProfitMultiplier(numValue);
                }}
                min={0.01}
                step={0.1}
                // precision={2}
                endContent={
                  <div className="flex items-center">
                    <PlusCircle
                      className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-400"
                      size={18}
                      onClick={() =>
                        setProfitMultiplier((prev) =>
                          parseFloat((prev + 0.1).toFixed(2))
                        )
                      }
                    />
                    <MinusCircle
                      className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors ml-1 dark:text-gray-500 dark:hover:text-gray-400"
                      size={18}
                      onClick={() =>
                        setProfitMultiplier((prev) =>
                          parseFloat(Math.max(0.01, prev - 0.1).toFixed(2))
                        )
                      }
                    />
                  </div>
                }
              />
            </div>

            {/* Runway Input */}
            <div className="flex flex-col">
              <label
                htmlFor="runway"
                className="text-gray-600 text-sm font-medium mb-1 dark:text-gray-300"
              >
                Runway (Bets)
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
                endContent={
                  <div className="flex items-center">
                    <PlusCircle
                      className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-400"
                      size={18}
                      onClick={() => setRunway((prev) => prev + 1)}
                    />
                    <MinusCircle
                      className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors ml-1 dark:text-gray-500 dark:hover:text-gray-400"
                      size={18}
                      onClick={() => setRunway((prev) => Math.max(1, prev - 1))}
                    />
                  </div>
                }
              />
            </div>

            {/* Investment Input */}
            <div className="flex flex-col md:col-span-2 lg:col-span-4">
              <label
                htmlFor="investmentAmount"
                className="text-gray-600 text-sm font-medium mb-1 dark:text-gray-300"
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
                // precision={2}
                startContent={
                  <span className="text-gray-400 dark:text-gray-500">₹</span>
                }
                endContent={
                  <div className="flex items-center">
                    <PlusCircle
                      className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors dark:text-gray-500 dark:hover:text-gray-400"
                      size={18}
                      onClick={() =>
                        setInvestmentAmount((prev) =>
                          parseFloat((prev + 100).toFixed(2))
                        )
                      }
                    />
                    <MinusCircle
                      className="cursor-pointer text-gray-400 hover:text-gray-600 transition-colors ml-1 dark:text-gray-500 dark:hover:text-gray-400"
                      size={18}
                      onClick={() =>
                        setInvestmentAmount((prev) =>
                          parseFloat(Math.max(0, prev - 100).toFixed(2))
                        )
                      }
                    />
                  </div>
                }
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Summary Section */}
      {Boolean(tableData.length) && (
        <div className="w-full">
          <h2 className="text-2xl text-center font-semibold text-gray-700 mb-4 dark:text-gray-200">
            Summary
          </h2>

          <Card className="w-full p-6 text-center">
            <p className="text-lg text-gray-700 mb-2 dark:text-gray-200">
              With your investment of{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                ₹{investmentAmount.toFixed(2)}
              </span>
              , your effective runway is{" "}
              <span className="font-bold text-green-600 dark:text-green-400">
                {effectiveRunwayLength}
              </span>{" "}
              bets.
            </p>
            <p className="text-lg text-gray-700 dark:text-gray-200">
              To cover your desired{" "}
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {runway}
              </span>{" "}
              bets, you would need an investment of{" "}
              <span className="font-bold text-cyan-600 dark:text-cyan-400">
                ₹{investmentNeededForFullRunway.toFixed(2)}
              </span>
              .
            </p>
            {effectiveRunwayLength < runway && investmentAmount > 0 && (
              <p className="text-sm text-red-500 mt-4 dark:text-red-400">
                Your investment limits the simulation to {effectiveRunwayLength}{" "}
                bets.
              </p>
            )}
          </Card>
        </div>
      )}

      {/* Output Table */}
      {/* <Card className="w-full max-w-4xl p-6  overflow-x-auto"> */}
      <div className="w-full">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4 text-center dark:text-gray-200">
          Simulation Results
        </h2>
        {tableData.length === 0 ? (
          <p className="text-center text-gray-500 py-8 dark:text-gray-400">
            Please enter valid input values (Bet Start Amount, Profit
            Multiplier, and Runway must be positive, Investment must be
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
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
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

      {/* </Card> */}
    </div>
  );
};

export default StakeCostProfitCalculator;
