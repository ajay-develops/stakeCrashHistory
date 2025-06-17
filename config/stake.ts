export const stakeConfig = {
  codeSnippet: `
  /**
 * JavaScript script to fetch previous 1000 crash game bets
 * from Stake.ac API and download them as a JSON file.
 * This script is designed to be run directly in a browser's developer console.
 * NOTE: If you are using stake.com instead of stake.ac, you may need to change the API URL to 'https://stake.com/_api/graphql'.
 */

// Define the GraphQL query for fetching crash game history
const query = \`
    query CrashGameListHistory($limit: Int, $offset: Int) {
        crashGameList(limit: $limit, offset: $offset) {
            id
            startTime
            crashpoint
            hash {
                id
                hash
                __typename
            }
            __typename
        }
    }
\`;

// Configuration for fetching data
const LIMIT_PER_REQUEST = 50; // Maximum number of items per API request
const API_URL = 'https://stake.ac/_api/graphql'; // The API endpoint

/**
 * Fetches a single batch of crash game data from the API.
 * @param {number} limit The maximum number of items to return in this request.
 * @param {number} offset The offset for pagination.
 * @returns {Promise<Array>} A promise that resolves with an array of crash game objects.
 */
async function fetchCrashDataBatch(limit, offset) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query,
                variables: {
                    limit: limit,
                    offset: offset
                },
                operationName: 'CrashGameListHistory'
            })
        });

        if (!response.ok) {
            throw new Error(\`HTTP error! status: \${response.status}\`);
        }

        const data = await response.json();

        // Check if the expected data structure exists
        if (data.data && data.data.crashGameList) {
            return data.data.crashGameList;
        } else {
            console.warn('Unexpected API response structure:', data);
            return [];
        }
    } catch (error) {
        console.error(\`Error fetching data for offset \${offset}:\`, error);
        return [];
    }
}

/**
 * Main function to fetch all required data and initiate download.
 */
async function downloadAllCrashData(TARGET_COUNT=1000) {
    console.log(\`Starting to fetch \${TARGET_COUNT} crash game bets...\`);
    console.log(\`Fetching in batches of \${LIMIT_PER_REQUEST} items.\`);

    let allData = [];
    let offset = 0;
    let fetchedCount = 0;
    let hasMoreData = true;

    while (fetchedCount < TARGET_COUNT && hasMoreData) {
        console.log(\`Fetching batch: offset = \${offset}, limit = \${LIMIT_PER_REQUEST}\`);
        const currentBatch = await fetchCrashDataBatch(LIMIT_PER_REQUEST, offset);

        if (currentBatch.length === 0) {
            // No more data or an error occurred, stop fetching
            hasMoreData = false;
            console.log('No more data received or an error occurred during fetching, stopping.');
        } else {
            allData = allData.concat(currentBatch);
            fetchedCount += currentBatch.length;
            offset += currentBatch.length; // Increment offset by the actual number of items received

            console.log(\`Fetched \${currentBatch.length} items. Total fetched: \${fetchedCount}/\${TARGET_COUNT}\`);

            // Optional: Add a small delay between requests to avoid hitting rate limits
            // await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Break if we've reached or exceeded the target count
        if (fetchedCount >= TARGET_COUNT) {
            console.log(\`Target count (\${TARGET_COUNT}) reached or exceeded.\`);
            break;
        }
    }

    console.log(\`Finished fetching. Total unique bets collected: \${allData.length}\`);

    // Create a Blob from the JSON data
    const jsonData = JSON.stringify(allData, null, 2); // null, 2 for pretty-printing
    const blob = new Blob([jsonData], { type: 'application/json' });

    // Create a link element to trigger the download
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`stake_crash_bets_\${new Date().toISOString().slice(0, 10)}.json\`; // Dynamic filename
    document.body.appendChild(a); // Append to body is necessary for Firefox
    a.click(); // Programmatically click the link to trigger download
    document.body.removeChild(a); // Clean up
    URL.revokeObjectURL(url); // Release the object URL

    console.log('JSON file download initiated.');
}
    downloadAllCrashData(); 
  `,
};
