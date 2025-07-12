import type { NextRequest } from "next/server";
import { after, NextResponse } from "next/server";
import { Effect } from "effect";

import { parseRequestJson } from "@harbor/shared";
import { shopeeWebhookHandler } from "@harbor/shopee-integration/webhooks";

import { RuntimeServer } from "~/lib/runtime-server";

export async function POST(request: NextRequest) {
  // Parse Json before sending the main task to the background as the context we be cleaned up.
  const json = await RuntimeServer.runPromise(
    parseRequestJson(request).pipe(Effect.catchAll(Effect.logError)),
  );

  const program = shopeeWebhookHandler(json).pipe(
    Effect.catchAll(Effect.logError),
  );

  after(async () => {
    await RuntimeServer.runPromise(program);
  });

  return NextResponse.json({ status: 200 });
}
