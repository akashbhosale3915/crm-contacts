import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseContactIds,
  parseContactInput,
  parseContactListQuery,
  parseTag,
  isValidPhoneNumber,
  RequestValidationError,
} from "./validation";
import { hasContactChanges } from "./services/contactChanges";
import Contact from "./models/contact";
import { generateSeedContacts } from "./seedData";

describe("contact input validation", () => {
  it("normalizes valid contact fields and deduplicates tags", () => {
    assert.deepEqual(
      parseContactInput({
        firstName: "  Ada ",
        lastName: "Lovelace",
        email: " ada@example.com ",
        tags: [" VIP ", "VIP"],
      }),
      {
        firstName: "Ada",
        lastName: "Lovelace",
        email: "ada@example.com",
        tags: ["VIP"],
      },
    );
  });

  it("rejects missing names, invalid email, and malformed tags", () => {
    assert.throws(
      () => parseContactInput({ firstName: "Ada" }),
      RequestValidationError,
    );
    assert.throws(
      () =>
        parseContactInput({
          firstName: "Ada",
          lastName: "Lovelace",
          email: "not-an-email",
        }),
      /valid email/,
    );
    assert.throws(
      () =>
        parseContactInput({
          firstName: "Ada",
          lastName: "Lovelace",
          tags: [" "],
        }),
      /tags must be/,
    );
  });

  it("rejects unrecognized contact fields instead of silently ignoring them", () => {
    assert.throws(
      () =>
        parseContactInput({
          firstName: "Ada",
          lastName: "Lovelace",
          isAdmin: true,
        }),
      /is not an allowed field/,
    );
  });

  it("allows partial updates but requires a non-empty provided name", () => {
    assert.deepEqual(
      parseContactInput({ company: "Analytical Engines" }, true),
      { company: "Analytical Engines" },
    );
    assert.throws(
      () => parseContactInput({ firstName: " " }, true),
      /firstName must be/,
    );
    assert.throws(() => parseContactInput({}, true), /At least one/);
  });

  it("accepts exactly 10 digits and rejects formatted or different-length numbers", () => {
    assert.equal(isValidPhoneNumber("3055948588"), true);
    assert.equal(isValidPhoneNumber("0123456789"), true);
    assert.equal(isValidPhoneNumber("305.594.8588"), false);
    assert.equal(isValidPhoneNumber("+13055948588"), false);
    assert.equal(isValidPhoneNumber("305594858"), false);
    assert.equal(isValidPhoneNumber("30559485880"), false);
    assert.throws(
      () =>
        parseContactInput({
          firstName: "Ada",
          lastName: "Lovelace",
          phone: "305.594.8588",
        }),
      /exactly 10 digits/,
    );
    assert.throws(
      () =>
        parseContactInput({
          firstName: "Ada",
          lastName: "Lovelace",
          phone: " 3055948588 ",
        }),
      /exactly 10 digits/,
    );
  });

  it("enforces valid phone numbers in the MongoDB contact schema", async () => {
    for (const phone of ["305594858", "305.594.8588", " 3055948588 "]) {
      const contact = new Contact({
        firstName: "Ada",
        lastName: "Lovelace",
        phone,
      });
      await assert.rejects(contact.validate(), /exactly 10 digits/);
    }
  });

  it("generates name-based emails on supported domains and 10-digit demo numbers", () => {
    const contacts = generateSeedContacts(10);
    assert.equal(contacts.length, 10);
    const emails = new Set<string>();
    for (const contact of contacts) {
      assert.match(contact.phone, /^\d{10}$/);
      assert.match(
        contact.email,
        /^[a-z0-9]+\.[a-z0-9]+@(fake\.com|test\.com|new\.com|droidtech\.in)$/,
      );
      assert.equal(emails.has(contact.email), false);
      emails.add(contact.email);
      assert.ok(contact.company.length > 0);
    }
  });
});

describe("list and tag validation", () => {
  it("parses supported list filters and sort options", () => {
    assert.deepEqual(
      parseContactListQuery({
        page: "2",
        limit: "25",
        search: "ada",
        tag: "VIP",
        company: "Analytical",
        sortBy: "name",
        sortOrder: "asc",
      }),
      {
        page: 2,
        limit: 25,
        search: "ada",
        tag: "VIP",
        company: "Analytical",
        sortBy: "name",
        sortOrder: "asc",
      },
    );
  });

  describe("contact change detection", () => {
    const contact = {
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phone: "555-0100",
      company: "Analytical Engines",
      tags: ["Lead", "VIP"],
    };

    it("treats identical submitted values as a no-op", () => {
      assert.equal(
        hasContactChanges(contact, {
          firstName: "Ada",
          lastName: "Lovelace",
          email: " ADA@example.com ",
          phone: "555-0100",
          company: "Analytical Engines",
          tags: ["VIP", "Lead"],
        }),
        false,
      );
    });

    it("detects contact field and tag changes", () => {
      assert.equal(hasContactChanges(contact, { company: "New Company" }), true);
      assert.equal(hasContactChanges(contact, { tags: ["Lead"] }), true);
    });

    it("treats an empty email as unchanged when email is absent", () => {
      assert.equal(
        hasContactChanges({ ...contact, email: undefined }, { email: "" }),
        false,
      );
    });
  });

  it("rejects unsupported sort fields and oversized pages", () => {
    assert.throws(
      () => parseContactListQuery({ sortBy: "email" }),
      /sortBy must be/,
    );
    assert.throws(
      () => parseContactListQuery({ limit: "101" }),
      /limit must be between/,
    );
    assert.throws(
      () => parseContactListQuery({ internalField: "unexpected" }),
      /is not an allowed field/,
    );
  });

  it("validates tags and contact IDs", () => {
    assert.equal(parseTag(" VIP "), "VIP");
    assert.deepEqual(
      parseContactIds(["507f1f77bcf86cd799439011"]),
      ["507f1f77bcf86cd799439011"],
    );
    assert.throws(() => parseTag(" "), RequestValidationError);
    assert.throws(() => parseContactIds(["bad-id"]), RequestValidationError);
  });
});
