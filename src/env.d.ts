/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_GSC_VERIFICATION?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
