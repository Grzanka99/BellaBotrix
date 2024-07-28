import { afterEach, expect, it } from "bun:test";
import { unlinkSync } from "node:fs";
import { SqliteStorage } from "../index";

const TEST_DB_NAME = "test.db";

function removeTestDB() {
  try {
    unlinkSync(TEST_DB_NAME);
  } catch {}
}

afterEach(removeTestDB);

it("should create database and fill private field db with value", () => {
  const storage = new SqliteStorage(":memory:");

  expect(storage).toBeDefined();
  // @ts-ignore-next-line
  expect(storage.db).toBeDefined();
});

it("should create key test with value tested", () => {
  const storage = new SqliteStorage(TEST_DB_NAME);

  const res1 = storage.set("test", "tested");
  expect(res1).toBe(true);
  const res2 = storage.has("test");
  expect(res2).toBe(true);
  const res3 = storage.get("test");
  expect(res3).toEqual({ value: "tested", key: "test" });
});

it("should update key test with value changed", () => {
  const storage = new SqliteStorage(TEST_DB_NAME);

  const res1 = storage.set("test", "tested");
  expect(res1).toBe(true);
  const res2 = storage.set("test", "changed");
  expect(res2).toBe(true);
  const res3 = storage.get("test");
  expect(res3).toEqual({ value: "changed", key: "test" });
});

it("should delete key test", () => {
  const storage = new SqliteStorage(TEST_DB_NAME);

  const res1 = storage.set("test", "tested");
  expect(res1).toBe(true);
  const res2 = storage.delete("test");
  expect(res2).toBe(true);
  const res3 = storage.has("test");
  expect(res3).toBe(false);
});
