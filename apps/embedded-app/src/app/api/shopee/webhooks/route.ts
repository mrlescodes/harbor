import type { NextRequest } from "next/server";
import { after, NextResponse } from "next/server";
import { Effect } from "effect";

import { parseRequestJson } from "@harbor/shared";
import { shopeeWebhookHandler } from "@harbor/shopee-integration/webhooks";

import { RuntimeServer } from "~/lib/runtime-server";

export function POST(request: NextRequest) {
  const program = Effect.gen(function* () {
    const json = yield* parseRequestJson(request);
    yield* shopeeWebhookHandler(json);
  }).pipe(Effect.catchAll(Effect.logError));

  after(async () => {
    await RuntimeServer.runPromise(program);
  });

  return NextResponse.json({ status: 200 });
}
