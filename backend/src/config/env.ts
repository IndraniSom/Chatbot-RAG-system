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
  },
};

export default env;