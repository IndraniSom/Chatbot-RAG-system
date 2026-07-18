import "dotenv/config";

import app from "./app";

import env from "./config/env";
import { connectDatabase } from "./config/database";
import { connectRedis, disconnectRedis } from "./config/redis";

const PORT = env.app.port;

let server: ReturnType<typeof app.listen>;

async function bootstrap() {
    try {
        console.log("🚀 Starting Scrappy Backend...");

        await connectDatabase();

        await connectRedis();

        server = app.listen(PORT, () => {
            console.log("=================================");
            console.log("🚀 Scrappy AI Backend Started");
            console.log(`🌐 Server running on http://localhost:${PORT}`);
            console.log("=================================");
        });

    } catch (error) {
        console.error("❌ Failed to start server");
        console.error(error);

        process.exit(1);
    }
}

async function shutdown(signal: string) {
    console.log(`${signal} received`);

    if (server) {
        server.close();
    }

    await disconnectRedis();

    process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

bootstrap();