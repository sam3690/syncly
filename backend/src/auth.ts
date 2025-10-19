import { expressjwt } from "express-jwt";
import jwksRsa from "jwks-rsa";

const domain = process.env.AUTH0_DOMAIN!;
const audience = process.env.AUTH0_AUDIENCE!;

export const requireAuth = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    jwksUri: `https://${domain}/.well-known/jwks.json`,
    cache: true,
    cacheMaxEntries: 5,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
  }) as any,
  audience,
  issuer: `https://${domain}/`,
  algorithms: ["RS256"],
});
