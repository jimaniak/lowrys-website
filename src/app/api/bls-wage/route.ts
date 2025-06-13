import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const API_KEY = process.env.NEXT_PUBLIC_BLS_API_KEY;
  const { seriesId } = await req.json();

  if (!API_KEY) {
    return NextResponse.json({ error: "Missing BLS API key" }, { status: 500 });
  }

  const url = `https://api.bls.gov/publicAPI/v2/timeseries/data/${seriesId}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ registrationKey: API_KEY }),
    });
    const data = await res.json();
    // Log the data for debugging
    console.log("BLS API response:", JSON.stringify(data, null, 2));
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
