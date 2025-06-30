#!/usr/bin/env node

const { execSync } = require("child_process");
const axios = require("axios");

/**
 * Extracts headers from a curl command string.
 */
function extractHeadersFromCurl(curlCommand: string) {
  const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
  const headers = {};
  let match;

  while ((match = headerRegex.exec(curlCommand))) {
    const [key, ...valueParts] = match[1].split(":");
    const value = valueParts.join(":").trim();
    //@ts-ignore
    headers[key.trim()] = value;
  }

  return headers;
}

async function main() {
  const curlCommand = process.argv[2];

  if (!curlCommand) {
    console.error("Usage: node extract-and-send-headers.js '<curl command>'");
    process.exit(1);
  }

  // --- Step 1: Parse headers ---
  const headers = extractHeadersFromCurl(curlCommand);
  console.log("✅ Extracted Headers:\n", headers);

  // --- Step 2: Send POST to /api/stake-crash-history/headers ---
  const response = await axios.post(
    "http://localhost:3000/api/crash-history/headers", // change if needed
    { headers },
    {
      headers: {
        "Content-Type": "application/json",
        "app-api-key": process.env.APP_API_KEY || "your_app_api_key_here", // Replace or use dotenv
      },
    }
  );

  console.log("✅ Response from API:", response.data);
}

main().catch((err) => {
  console.error(
    "❌ Failed to extract or send headers:",
    err.response?.data || err.message
  );
  process.exit(1);
});
