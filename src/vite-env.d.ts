/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_PLATFORM_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace process {
  const env: {
    [key: string]: string | undefined;
    GEMINI_API_KEY?: string;
    GOOGLE_MAPS_PLATFORM_KEY?: string;
  };
}
