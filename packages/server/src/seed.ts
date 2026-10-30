import "dotenv/config";
import mongoose from "mongoose";
import { connectToDatabase } from "./config/database";
import Contact from "./models/contact";
import { generateSeedContacts } from "./seedData";

async function seed() {
  await connectToDatabase();
  const contacts = generateSeedContacts();
  await Contact.insertMany(contacts);
  console.log(`Seeded ${contacts.length} demonstration contacts.`);
}

async function runSeed(): Promise<void> {
  try {
    await seed();
  } catch (error: unknown) {
    console.error("Failed to seed database", error);
    process.exitCode = 1;
  } finally {
    try {
      await mongoose.disconnect();
    } catch (error: unknown) {
      console.error("Failed to disconnect from MongoDB after seeding", error);
      process.exitCode = 1;
    }
  }
}

void runSeed();
