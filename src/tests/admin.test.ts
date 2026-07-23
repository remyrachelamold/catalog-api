import { buildDashboardSummary, buildInventorySummary } from "../controllers/adminController";

describe("admin dashboard helpers", () => {
  it("builds dashboard metrics from catalog and order data", () => {
    const summary = buildDashboardSummary({
      productsCount: 6,
      categoriesCount: 3,
      usersCount: 8,
      ordersCount: 12,
      revenue: 2480,
      pendingOrders: 4,
      deliveredOrders: 5,
    });

    expect(summary).toMatchObject({
      productsCount: 6,
      categoriesCount: 3,
      usersCount: 8,
      ordersCount: 12,
      revenue: 2480,
      pendingOrders: 4,
      deliveredOrders: 5,
    });
  });

  it("builds inventory metrics from products", () => {
    const inventory = buildInventorySummary([
      { name: "Keyboard", price: 80, category: "Electronics", stock: 2, createdAt: new Date("2024-01-01") },
      { name: "Desk", price: 150, category: "Furniture", stock: 10, createdAt: new Date("2024-01-02") },
      { name: "Notebook", price: 5, category: "Office", stock: 1, createdAt: new Date("2024-01-03") },
    ] as any);

    expect(inventory.totalProducts).toBe(3);
    expect(inventory.inventoryValue).toBe(160 + 1500 + 5);
    expect(inventory.lowStockProducts).toHaveLength(2);
    expect(inventory.productsByCategory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "Electronics", count: 1 }),
      ])
    );
  });
});
