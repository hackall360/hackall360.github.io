/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_PLAUSIBLE_DOMAIN?: string;
  readonly PUBLIC_PLAUSIBLE_API_HOST?: string;
  readonly PUBLIC_PLAUSIBLE_SRC?: string;
  readonly PUBLIC_FORMSPREE_ENDPOINT?: string;
  readonly PUBLIC_ASSISTANT_API_URL?: string;
  readonly PUBLIC_ASSISTANT_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module 'virtual:client-script-url' {
  const url: string;
  export default url;
}
