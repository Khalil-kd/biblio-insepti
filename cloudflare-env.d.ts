// Fusionne les bindings Cloudflare générés par `wrangler types` (interface Env) avec le type
// CloudflareEnv attendu par @opennextjs/cloudflare. Regénérer via `npm run cf:types` après
// toute modification de wrangler.toml.
declare global {
  interface CloudflareEnv extends Env {}
}

export {};
