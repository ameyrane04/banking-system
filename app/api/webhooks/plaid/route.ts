import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type PlaidWebhookPayload = {
  webhook_type?: string;
  webhook_code?: string;
  item_id?: string;
  error?: unknown;
};

export async function POST(request: NextRequest) {
  let payload: PlaidWebhookPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const { webhook_type, webhook_code, item_id } = payload;

  if (!webhook_type || !webhook_code) {
    return NextResponse.json(
      { error: "Missing Plaid webhook type or code" },
      { status: 400 }
    );
  }

  console.info("Plaid webhook received", {
    webhook_type,
    webhook_code,
    item_id,
  });

  return NextResponse.json({ received: true });
}
