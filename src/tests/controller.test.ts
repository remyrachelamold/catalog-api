import {
  getCatalogs,
  updateCatalogItem,
  patchCatalogItem,
  deleteCatalogItem,
} from "../controllers/itemController";
import Item from "../model/items";
import { seedCatalog } from "../seed";

jest.mock("../model/items", () => ({
  __esModule: true,
  default: {
    find: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    deleteMany: jest.fn(),
    insertMany: jest.fn(),
  },
}));

const mockedItem = Item as jest.Mocked<typeof Item>;

describe("MCP pure logic functions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getCatalogs returns all items", async () => {
    const items = [{ name: "Book", price: 10, category: "Books" }];
    mockedItem.find.mockResolvedValue(items as never);

    const result = await getCatalogs();

    expect(mockedItem.find).toHaveBeenCalledWith({});
    expect(result).toEqual(items);
  });

  it("updateCatalogItem updates an existing item", async () => {
    const updated = { name: "Smartphone", price: 25000, category: "Electronics" };
    mockedItem.findByIdAndUpdate.mockResolvedValue(updated as never);

    const result = await updateCatalogItem({
      id: "68b930e4e3744bf8d629c7fe",
      data: { price: 25000 },
    });

    expect(mockedItem.findByIdAndUpdate).toHaveBeenCalledWith(
      "68b930e4e3744bf8d629c7fe",
      { price: 25000 },
      { new: true }
    );
    expect(result).toEqual(updated);
  });

  it("updateCatalogItem throws when item is missing", async () => {
    mockedItem.findByIdAndUpdate.mockResolvedValue(null as never);

    await expect(
      updateCatalogItem({ id: "missing", data: { price: 1 } })
    ).rejects.toThrow("Item not found");
  });

  it("patchCatalogItem partially updates an item", async () => {
    const patched = { name: "Headphones", price: 1500, category: "Electronics" };
    mockedItem.findByIdAndUpdate.mockResolvedValue(patched as never);

    const result = await patchCatalogItem({
      id: "68b9311ae3744bf8d629c800",
      data: { price: 1500 },
    });

    expect(result).toEqual(patched);
  });

  it("deleteCatalogItem removes an item", async () => {
    const deleted = { name: "Jeans", price: 1200, category: "Clothing" };
    mockedItem.findByIdAndDelete.mockResolvedValue(deleted as never);

    const result = await deleteCatalogItem({ id: "abc123" });

    expect(mockedItem.findByIdAndDelete).toHaveBeenCalledWith("abc123");
    expect(result).toEqual(deleted);
  });

  it("deleteCatalogItem throws when item is missing", async () => {
    mockedItem.findByIdAndDelete.mockResolvedValue(null as never);

    await expect(deleteCatalogItem({ id: "missing" })).rejects.toThrow("Item not found");
  });
});

describe("seedCatalog", () => {
  it("clears and inserts seed items", async () => {
    mockedItem.deleteMany.mockResolvedValue({} as never);
    mockedItem.insertMany.mockResolvedValue([] as never);

    await seedCatalog();

    expect(mockedItem.deleteMany).toHaveBeenCalledWith({});
    expect(mockedItem.insertMany).toHaveBeenCalled();
  });
});
