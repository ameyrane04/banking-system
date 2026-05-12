import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const verifyDwollaSignature = ({
  body,
  signature,
  secret,
}: {
  body: string;
  signature: string;
  secret: string;
}) => {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

  const received = Buffer.from(signature, "hex");
  const expected = Buffer.from(expectedSignature, "hex");

  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
};

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.DWOLLA_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing DWOLLA_WEBHOOK_SECRET" },
      { status: 500 }
    );
  }

  const signature = request.headers.get("x-request-signature-sha-256");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const body = await request.text();
  const isValidSignature = verifyDwollaSignature({
    body,
    signature,
    secret: webhookSecret,
  });

  if (!isValidSignature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    id?: string;
    topic?: string;
    resourceId?: string;
    _links?: Record<string, { href: string }>;
  };

  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  console.info("Dwolla webhook received", {
    id: payload.id,
    topic: payload.topic,
    resourceId: payload.resourceId,
  });

  return NextResponse.json({ received: true });
}
