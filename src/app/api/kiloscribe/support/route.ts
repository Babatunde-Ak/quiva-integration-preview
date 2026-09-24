import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_INSCRIPTION_SIZE = 5 * 1024 * 1024;

function isValidSize(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export async function POST(request: NextRequest) {
  let payload: { coverSize?: unknown; pageSizes?: unknown };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ supported: false, reason: "Invalid support request." }, { status: 400 });
  }

  const coverSize = payload.coverSize ?? 0;
  const pageSizes = payload.pageSizes;

  if (!isValidSize(coverSize) || !Array.isArray(pageSizes) || !pageSizes.every(isValidSize)) {
    return NextResponse.json({ supported: false, reason: "Invalid file size data." }, { status: 400 });
  }

  if (pageSizes.length === 0) {
    return NextResponse.json({ supported: false, reason: "No comic pages found for inscription." });
  }

  const totalSize = coverSize + pageSizes.reduce((total, size) => total + size, 0);

  if (totalSize > MAX_INSCRIPTION_SIZE) {
    return NextResponse.json({
      supported: false,
      reason: `Comic data is too large. Maximum size is ${MAX_INSCRIPTION_SIZE / 1024 / 1024}MB.`,
    });
  }

  if (!process.env.HEDERA_ACCOUNT_ID || !process.env.HEDERA_PRIVATE_KEY) {
    return NextResponse.json({
      supported: false,
      reason: "Hashinal inscription is not configured for this deployment.",
    });
  }

  return NextResponse.json({ supported: true });
}
