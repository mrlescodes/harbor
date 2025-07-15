export const messageFromUnknown = (u: unknown) => {
  if (typeof u === "string") {
    return u;
  }

  if (u instanceof Error) {
    return u.message;
  }

  if (
    u &&
    typeof u === "object" &&
    "message" in u &&
    typeof u.message === "string"
  ) {
    return u.message;
  }

  return "An unknown error occurred";
};
