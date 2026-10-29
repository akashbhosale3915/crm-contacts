import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { connectToDatabase } from "./config/database";

const port = Number(process.env.PORT) || 3000;

async function startServer(): Promise<void> {
  await connectToDatabase();
  const server = app.listen(port);
  await new Promise<void>((resolve, reject) => {
    const handleError = (error: Error) => reject(error);
    server.once("error", handleError);
    server.once("listening", () => {
      server.off("error", handleError);
      resolve();
    });
  });
  console.log(`Backend running on port ${port}`);

  let shuttingDown = false;
  const shutdown = (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received; closing server`);
    server.close((serverError) => {
      if (serverError) {
        console.error("Failed to close HTTP server cleanly", serverError);
        process.exitCode = 1;
      }
      void mongoose
        .disconnect()
        .then(() => {
          if (!serverError) process.exitCode = 0;
        })
        .catch((error: unknown) => {
          console.error("Failed to disconnect from MongoDB", error);
          process.exitCode = 1;
        });
    });
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

startServer().catch((error: unknown) => {
  console.error("Failed to start backend", error);
  void mongoose
    .disconnect()
    .catch((disconnectError: unknown) => {
      console.error("Failed to disconnect from MongoDB", disconnectError);
    })
    .finally(() => {
      process.exitCode = 1;
    });
});
