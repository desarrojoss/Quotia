import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  // firebase-admin/auth depende de `jose` (ESM-only en algunas versiones vía
  // jwks-rsa); si Next lo empaqueta con el resto del bundle del servidor,
  // termina intentando require() un módulo ESM y truena en runtime
  // (ERR_REQUIRE_ESM). Excluirlo del bundle hace que se cargue nativo desde
  // node_modules en la función serverless, donde sí funciona.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
