import { NextResponse } from "next/server";
import { getConcerns } from "@/services/api/concern.services";

export const dynamic = "force-dynamic";

const ratingOptions = Array.from({ length: 5 }, (_, index) => {
  const value = index + 1;
  return {
    id: value,
    value: `${value} Star${value > 1 ? "s" : ""}`,
    star: `${value} Star${value > 1 ? "s" : ""}`,
  };
});

export async function GET() {
  let concerns = [];

  try {
    const res = await getConcerns();
    concerns = Array.isArray(res?.serve)
      ? res.serve
      : Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res)
      ? res
      : [];
  } catch (error) {
    console.error("Failed to load concerns for filters:", error);
  }

  return NextResponse.json({ concerns, ratings: ratingOptions });
}
