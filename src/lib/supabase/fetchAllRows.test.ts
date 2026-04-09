import { describe, expect, it, vi } from "vitest";
import { fetchAllRows } from "./fetchAllRows";

describe("fetchAllRows", () => {
  it("fetches every page until the final partial page", async () => {
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce({ data: [{ id: "1" }, { id: "2" }], error: null })
      .mockResolvedValueOnce({ data: [{ id: "3" }, { id: "4" }], error: null })
      .mockResolvedValueOnce({ data: [{ id: "5" }], error: null });

    const result = await fetchAllRows(fetchPage, { pageSize: 2 });

    expect(result).toEqual([{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }]);
    expect(fetchPage).toHaveBeenCalledTimes(3);
    expect(fetchPage).toHaveBeenNthCalledWith(1, 0, 1);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 2, 3);
    expect(fetchPage).toHaveBeenNthCalledWith(3, 4, 5);
  });

  it("throws the page error immediately", async () => {
    const error = new Error("database blew up");
    const fetchPage = vi.fn().mockResolvedValueOnce({ data: null, error });

    await expect(fetchAllRows(fetchPage, { pageSize: 100 })).rejects.toThrow("database blew up");
    expect(fetchPage).toHaveBeenCalledWith(0, 99);
  });
});
