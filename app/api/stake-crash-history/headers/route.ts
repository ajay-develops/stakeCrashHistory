// app/api/stake-crash-history/headers/route.ts

import { NextResponse } from "next/server";
import { encrypt, decrypt } from "@utils/encrpyt";
import { supabase } from "@utils/supabase";

// POST: Encrypt and store headers
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("app-api-key");
    const validKey = process.env.APP_API_KEY;

    if (!authHeader || authHeader !== validKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (!body.headers || typeof body.headers !== "object") {
      return NextResponse.json(
        { error: "Invalid or missing headers payload" },
        { status: 400 }
      );
    }

    const stringifiedHeaders = JSON.stringify(body.headers);

    const { error } = await supabase.from("stake_headers").insert([
      {
        headers: stringifiedHeaders,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to store headers in Supabase" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Headers encrypted and stored." });
  } catch (err) {
    console.error("Unexpected error storing headers:", err);
    return NextResponse.json(
      { error: "Internal server error while storing headers." },
      { status: 500 }
    );
  }
}

// GET: Decrypt and return latest headers with caching
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("stake_headers")
      .select("headers")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data?.headers) {
      return NextResponse.json(
        { error: "Failed to fetch headers from Supabase", details: error },
        { status: 500 }
      );
    }

    const parsedHeaders = JSON.parse(data.headers);

    const response = NextResponse.json({ headers: parsedHeaders });

    return response;
  } catch (err) {
    console.error("Failed to retrieve headers:", err);

    return NextResponse.json(
      { error: "Internal server error while retrieving headers." },
      { status: 500 }
    );
  }
}
