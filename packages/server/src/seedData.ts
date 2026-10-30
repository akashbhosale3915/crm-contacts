import { faker } from "@faker-js/faker";

const DEMO_CONTACT_COUNT = 50;
const TAGS = ["Lead", "Customer", "VIP", "Prospect"];
const EMAIL_DOMAINS = ["fake.com", "test.com", "new.com", "droidtech.in"];

const createDemoPhoneNumber = (): string =>
  faker.number.int({ min: 1_000_000_000, max: 9_999_999_999 }).toString();

const createEmailName = (firstName: string, lastName: string): string =>
  [firstName, lastName]
    .map((name) => name.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter(Boolean)
    .join(".") || "contact";

export function generateSeedContacts(count = DEMO_CONTACT_COUNT) {
  const emails = new Set<string>();

  return Array.from({ length: count }, (_, index) => {
    let firstName = "";
    let lastName = "";
    let email = "";
    while (!email || emails.has(email)) {
      firstName = faker.person.firstName();
      lastName = faker.person.lastName();
      const emailName = createEmailName(firstName, lastName);
      const domain = EMAIL_DOMAINS[index % EMAIL_DOMAINS.length];
      email = `${emailName}@${domain}`;
    }
    emails.add(email);

    const company = faker.company.name();

    return {
      firstName,
      lastName,
      email,
      phone: createDemoPhoneNumber(),
      company,
      tags: faker.helpers.arrayElements(TAGS, 2),
    };
  });
}
