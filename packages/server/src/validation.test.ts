import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseContactIds,
  parseContactInput,
  parseContactListQuery,
  parseTag,
  RequestValidationError,
} from "./validation";
import { hasContactChanges } from "./services/contactChanges";

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
