import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import app from "./app";

let server: Server;
let baseUrl: string;

before(async () => {
  server = app.listen(0);
  await new Promise<void>((resolve, reject) => {
    server.once("listening", resolve);
    server.once("error", reject);
  });
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

describe("Express API error handling", () => {
  it("returns a JSON 404 for an unknown endpoint", async () => {
    const response = await fetch(`${baseUrl}/api/unknown`);
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { error: "Endpoint not found" });
  });

  it("returns a JSON 400 for an invalid contact ID", async () => {
    const response = await fetch(`${baseUrl}/api/contacts/not-an-id`);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "Invalid contact ID" });
  });

  it("returns a JSON 400 for malformed JSON", async () => {
    const response = await fetch(`${baseUrl}/api/contacts`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{invalid",
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), {
      error: "Invalid JSON request body",
    });
  });
});
