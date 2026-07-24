type RequestWithUrl = {
  headers: Headers;
  nextUrl: URL;
};

export function getPublicOrigin(request: RequestWithUrl): string {
  const configuredRedirectUri = process.env.ENTRA_REDIRECT_URI;
  if (configuredRedirectUri) {
    return new URL(configuredRedirectUri).origin;
  }

  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (forwardedHost) {
    const forwardedProto =
      request.headers.get("x-forwarded-proto") ??
      (request.nextUrl.protocol === "http:" ? "http" : "https");
    return `${forwardedProto}://${forwardedHost}`;
  }

  return request.nextUrl.origin;
}
