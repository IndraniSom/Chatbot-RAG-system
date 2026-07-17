/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the backend, e.g. "http://localhost:5000/api". Falls back to "/api" if unset. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
