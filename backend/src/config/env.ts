import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, required = true): string {
  const value = process.env[key];

  if (required && (!value || value.trim() === "")) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value ?? "";
}

const env = {
  app: {
    port: Number(getEnv("PORT", false) || 5000),
    nodeEnv: getEnv("NODE_ENV", false) || "development",
    isDevelopment:
      (getEnv("NODE_ENV", false) || "development") === "development",
    isProduction:
      getEnv("NODE_ENV", false) === "production",
  },

  mongodb: {
    uri: getEnv("MONGODB_URI"),
  },

  jwt: {
    secret: getEnv("JWT_SECRET"),
    expiresIn: getEnv("JWT_EXPIRES_IN", false) || "7d",
  },

  redis: {
    url: getEnv("REDIS_URL"),
  },

  qdrant: {
    url: getEnv("QDRANT_URL"),
    apiKey: getEnv("QDRANT_API_KEY"),
    collection: getEnv("QDRANT_COLLECTION"),
  },

  nvidia: {
    apiKey: getEnv("NVIDIA_API_KEY"),

    embedding: {
      model: getEnv("NVIDIA_EMBEDDING_MODEL"),
      url: getEnv("NVIDIA_EMBEDDING_URL"),
    },

    llm: {
      model: getEnv("NVIDIA_LLM_MODEL"),
      url: getEnv("NVIDIA_LLM_URL"),
    },
  },

  widget: {
    scriptUrl: getEnv("WIDGET_SCRIPT_URL"),
    /** Origin the widget should POST chat messages to. */
    publicApiUrl: getEnv("PUBLIC_API_URL", false),
  },

  /**
   * Cloudinary — used by the brand-customization flow for direct
   * browser uploads of customer logos.
   *
   * Cloudinary configuration is *optional* at startup. When all three
   * vars are present, color-customization customers can also upload a
   * logo; otherwise only color customization is available and the
   * upload endpoints respond with 503.
   *
   * We pull live values via `process.env.*` at first use (see
   * `config/cloudinary.ts`) so we don't freeze a single env snapshot
   * here — but exposing them through the typed `env` object lets the
   * OpenAPI / Scalar docs reference the same keys.
   */
  cloudinary: {
    cloudName: getEnv("CLOUDINARY_CLOUD_NAME", false),
    apiKey: getEnv("CLOUDINARY_API_KEY", false),
    /**
     * The API secret is configured server-side and is never exposed
     * to clients. We surface its *presence* (so diagnostic code can
     * tell at a glance whether uploads are enabled) but never its
     * value.
     */
    hasApiSecret:
      !!(
        process.env.CLOUDINARY_API_SECRET?.trim() ?? ""
      ),
    folder:
      getEnv("CLOUDINARY_FOLDER", false) || "scrappy-widget-logos",
  },
};

export default env;