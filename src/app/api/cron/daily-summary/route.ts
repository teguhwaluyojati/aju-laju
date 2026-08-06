import { NextRequest, NextResponse } from "next/server";
import { sendDailySummaryEmails } from "../../../../lib/server/dailySummaryEmail";

export const runtime = "nodejs";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const authorization = request.headers.get("authorization") || "";
  return authorization === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const dryRunParam = request.nextUrl.searchParams.get("dryRun") || "";
    const maxUsersParam = request.nextUrl.searchParams.get("maxUsers") || "";
    const dryRun = dryRunParam === "1" || dryRunParam.toLowerCase() === "true";
    const parsedMaxUsers = Number(maxUsersParam);
    const maxUsers = Number.isFinite(parsedMaxUsers) && parsedMaxUsers > 0 ? parsedMaxUsers : undefined;

    const result = await sendDailySummaryEmails({ dryRun, maxUsers });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to send daily summary emails",
        hint: "Try dryRun=1 to validate Firebase data fetch first, then run without dryRun for real sending",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
