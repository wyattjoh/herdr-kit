import { expect, test } from "bun:test";
import { RecordScrolls } from "./record-scrolls";

test("queues a missing record, allocates it outside render, and resets", () => {
  const scrolls = new RecordScrolls<number>();
  expect(scrolls.get("a")).toBeUndefined();
  expect(scrolls.waiting).toBe(true);
  let next = 0;
  expect(scrolls.flush(() => ++next)).toBe(true);
  expect(scrolls.get("a")).toBe(1);
  expect(scrolls.flush(() => ++next)).toBe(false);
  scrolls.reset();
  expect(scrolls.get("a")).toBeUndefined();
});
