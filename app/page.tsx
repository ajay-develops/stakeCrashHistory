"use client";
import React from "react";

import { title, subtitle } from "@/components/primitives";
import CopyButton from "@/components/copyButton";
import { stakeConfig } from "@/config/stake";
import { StakeCrashHistoryAnalytics } from "@/components/stakeCrashHistoryAnalytics";
import { MultiplayerCrash } from "@/types";

export default function Home() {
  const [fileName, setFileName] = React.useState<string>("");
  const [fileContents, setFileContents] = React.useState<MultiplayerCrash[]>(
    []
  );
  // Default highlight value for crashes >= 2x
  const [highlightCrashesFrom, setHighlightCrashesFrom] = React.useState<
    number | null
  >(2);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setFileName(file.name);
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedContent: MultiplayerCrash[] = JSON.parse(content);
          setFileContents(parsedContent);
        } catch (error) {
          console.error("Invalid JSON file", error);
          alert(
            "Error: Could not parse JSON file. Please ensure it's a valid JSON."
          );
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <section className="flex max-w-full flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="w-full max-w-xl text-center">
        <h1 className={title()}>Stake Crash Analytics:&nbsp;</h1>
        <br />
        <h1 className={title()}>Uncover&nbsp;</h1>
        <h1 className={title({ color: "violet" })}>Winning&nbsp;</h1>
        <h1 className={title()}>Patterns&nbsp;</h1>

        <div className={subtitle({ class: "mt-4" })}>
          <h3>How to Get the Crash History File:</h3>
          <ol className="list-decimal pl-5 text-left space-y-2 text-default-600">
            <li>
              <strong>Copy Code:</strong>
              To copy the necessary script{" "}
              <CopyButton textToCopy={stakeConfig.codeSnippet}>
                Click here
              </CopyButton>
            </li>
            <li>
              <strong>Go to Stake Crash:</strong> Open the game page in your
              browser.
            </li>
            <li>
              <strong>Open Console:</strong> Press{" "}
              <code className="bg-default-100 text-default-800 px-1 py-0.5 rounded text-sm">
                Ctrl + Shift + J
              </code>{" "}
              (Windows/Linux) or{" "}
              <code className="bg-default-100 text-default-800 px-1 py-0.5 rounded text-sm">
                Cmd + Option + J
              </code>{" "}
              (Mac).
            </li>
            <li>
              <strong>Paste &amp; Download:</strong> Paste the copied code into
              the console and press <kbd>Enter</kbd>. A JSON file will download
              automatically.
            </li>
            <li>
              <strong>Upload Here:</strong> Drag and drop that JSON file onto
              this page to see the insights!
            </li>
          </ol>
        </div>
      </div>

      <StakeCrashHistoryAnalytics
        fileName={fileName}
        handleFileChange={handleFileChange}
        fileContents={fileContents}
        highlightCrashesFrom={highlightCrashesFrom}
        setHighlightCrashesFrom={setHighlightCrashesFrom}
      />
    </section>
  );
}
