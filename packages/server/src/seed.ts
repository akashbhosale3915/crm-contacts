import "dotenv/config";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import { connectToDatabase } from "./config/database";
import Contact from "./models/contact";

async function seed() {
  await connectToDatabase();
  const existingCount = await Contact.estimatedDocumentCount();
  //   if (existingCount > 0) {
  //     console.log(`Seed skipped; ${existingCount} contacts already exist.`);
  //     return;
  //   }

  const contacts = Array.from({ length: 200 }, (_, index) => {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    return {
      firstName,
      lastName,
      email: `${faker.internet.username({ firstName, lastName }).toLowerCase()}-${index}@example.test`,
      phone: faker.phone.number(),
      company: faker.company.name(),
      tags: faker.helpers.arrayElements(
        ["Lead", "Customer", "VIP", "Prospect"],
        2,
      ),
    };
  });

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
