import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Effect } from "effect";

import { shopeeWebhookHandler } from "@harbor/shopee-integration/webhooks";

import { RuntimeServer } from "~/lib/runtime-server";

export async function POST(request: NextRequest) {
  // TODO: Effect
  try {
    // Parse the raw JSON body from the webhook
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const rawData = await request.json();

    const main = shopeeWebhookHandler(rawData).pipe(
      Effect.catchTags({
        ParseError: (error) => {
          console.error("Webhook ParseError:", error);
          return Effect.succeed({
            message: "ParseError",
            error: error.message,
          });
        },
      }),
      Effect.catchAll((error) => {
        console.error("Webhook Generic Error:", error);
        return Effect.succeed({ message: "Generic Error" });
      }),
    );

    const response = await RuntimeServer.runPromise(main);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Failed to parse webhook body:", error);
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }
}
