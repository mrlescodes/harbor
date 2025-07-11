import { Data, Effect } from "effect";

export class JsonParseError extends Data.TaggedError("JsonParseError")<{
  message: string;
}> {}

export const parseRequestJson = (request: Request) =>
  Effect.tryPromise({
    try: () => request.json(),
    catch: () =>
      new JsonParseError({
        message: "Failed to parse request body as JSON",
      }),
  });
