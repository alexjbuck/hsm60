import { createRemoteJWKSet, jwtVerify } from "jose";

// Defense in depth: Cloudflare Access should already gate /admin* and /api/admin*,
// but leads are PII, so verify the Access JWT here too and fail closed.
let jwks;
export async function onRequest({ request, env, next }) {
  if (env.DEV_BYPASS_ACCESS === "1") return next(); // set only in local .dev.vars
  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD) return new Response("Forbidden", { status: 403 });
  jwks ??= createRemoteJWKSet(new URL(`https://${env.ACCESS_TEAM_DOMAIN}/cdn-cgi/access/certs`));
  try {
    await jwtVerify(token, jwks, { issuer: `https://${env.ACCESS_TEAM_DOMAIN}`, audience: env.ACCESS_AUD });
  } catch {
    return new Response("Forbidden", { status: 403 });
  }
  return next();
}
