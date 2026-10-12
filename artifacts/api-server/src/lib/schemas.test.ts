import { describe, expect, it } from "vitest";
import {
  CreateCollectionBody,
  GetCollectionParams,
  SendBroadcastEmailBody,
  SendBroadcastEmailParams,
} from "@workspace/api-zod";

describe("CreateCollectionBody", () => {
  it("accepts a valid payload", () => {
    const result = CreateCollectionBody.safeParse({
      name: "Genesis",
      slug: "genesis",
      launchDatetime: "2026-12-01T12:00:00Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing slug", () => {
    const result = CreateCollectionBody.safeParse({
      name: "Genesis",
      launchDatetime: "2026-12-01T12:00:00Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string name", () => {
    const result = CreateCollectionBody.safeParse({
      name: 123,
      slug: "genesis",
      launchDatetime: "2026-12-01T12:00:00Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("GetCollectionParams", () => {
  it("accepts a slug", () => {
    expect(GetCollectionParams.safeParse({ slug: "genesis" }).success).toBe(true);
  });

  it("coerces non-string input to string", () => {
    const result = GetCollectionParams.safeParse({ slug: 42 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.slug).toBe("42");
  });
});

describe("SendBroadcastEmailBody", () => {
  it("requires both subject and body", () => {
    expect(
      SendBroadcastEmailBody.safeParse({ subject: "Hi", body: "Hello" }).success,
    ).toBe(true);
    expect(SendBroadcastEmailBody.safeParse({ subject: "Hi" }).success).toBe(false);
    expect(SendBroadcastEmailBody.safeParse({ body: "Hello" }).success).toBe(false);
  });
});

describe("SendBroadcastEmailBody edge cases", () => {
  it("rejects empty subject or body", () => {
    expect(SendBroadcastEmailBody.safeParse({ subject: "", body: "x" }).success).toBe(false);
    expect(SendBroadcastEmailBody.safeParse({ subject: "x", body: "" }).success).toBe(false);
  });
});

describe("SendBroadcastEmailParams", () => {
  it("accepts a slug", () => {
    expect(SendBroadcastEmailParams.safeParse({ slug: "genesis" }).success).toBe(true);
  });
});
