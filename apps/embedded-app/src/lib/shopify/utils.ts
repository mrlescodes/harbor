// TODO: Move to package

const GID_REGEXP = /gid:\/\/shopify\/\w*\/(\d+)/;

export function parseGid(gid: string): string | null {
  const matches = GID_REGEXP.exec(gid);
  return matches?.[1] ?? null;
}
