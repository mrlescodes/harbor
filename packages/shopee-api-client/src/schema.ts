import { Schema } from "effect";

export const ErrorResponse = Schema.Struct({
  request_id: Schema.String,
  error: Schema.NonEmptyString,
  message: Schema.NonEmptyString,
});

export const isErrorResponse = Schema.is(ErrorResponse);
