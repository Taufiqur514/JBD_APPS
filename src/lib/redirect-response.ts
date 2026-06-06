export function redirectResponse(path: string, request: Request) {
  const referer = request.headers.get("referer");
  const base = referer ? new URL(referer) : new URL(request.url);
  if (base.hostname === "0.0.0.0") base.hostname = "127.0.0.1";
  const target = new URL(path, base.origin);
  return new Response(null, { status: 303, headers: { Location: target.toString() } });
}
