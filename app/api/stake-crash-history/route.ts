// app/api/stake-crash-history/route.ts

import { NextResponse } from "next/server";

// Stake GraphQL query
const GRAPHQL_QUERY = `
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
`;

export async function GET(request: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    if (isNaN(limit) || isNaN(offset) || limit < 0 || offset < 0) {
      return NextResponse.json(
        { error: "Invalid limit or offset." },
        { status: 400 }
      );
    }

    // Fetch decrypted headers from internal GET /api/crash-history/headers
    const headersRes = await fetch(
      `${process.env.NEXT_PUBLIC_SERVER_URL!}/api/stake-crash-history/headers`,
      {
        next: { revalidate: 60 * 30 },
      }
    );

    if (!headersRes.ok) {
      const errorText = await headersRes.text();

      return NextResponse.json(
        {
          error: "Failed to fetch headers from internal endpoint",
          details: errorText,
        },
        { status: 500 }
      );
    }

    const headersJson = await headersRes.json();
    const storedHeaders = headersJson.headers;

    // Send GraphQL request to Stake.ac
    const response = await fetch(
      `${process.env.STAKE_SERVER_URL!}/_api/graphql`,
      {
        method: "POST",
        headers: storedHeaders,
        body: JSON.stringify({
          query: GRAPHQL_QUERY,
          variables: { limit, offset },
          operationName: "CrashGameListHistory",
        }),
        next: { revalidate: 10 }, // Optional: Next.js revalidation
      }
    );

    if (!response.ok) {
      const text = await response.text();

      return NextResponse.json(
        {
          error: `request to ${process.env.STAKE_SERVER_URL} failed: ${response.statusText}`,
          details: text,
        },
        { status: response.status }
      );
    }

    const json = await response.json();

    if (json.errors) {
      return NextResponse.json(
        {
          error: `GraphQL errors for ${process.env.STAKE_SERVER_URL}`,
          details: json.errors,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(json.data?.crashGameList || []);
  } catch (err) {
    console.error("Stake API Error:", err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
