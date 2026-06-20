import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import Item from "../model/items";
import { seedCatalog } from "./seed";

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await seedCatalog();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe("GET /catalogs", () => {
  it("should return all items and include 'The Alchemist'", async () => {
    const res = await request(app).get("/catalogs");
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    const alchemist = res.body.find((i: { name: string }) => i.name === "The Alchemist");
    expect(alchemist).toBeDefined();
    expect(alchemist.price).toBe(500);
    expect(alchemist.category).toBe("Books");
  });
});

describe("GET /catalogs?category=Books", () => {
  it("should return only books (The Alchemist & Atomic Habits)", async () => {
    const res = await request(app).get("/catalogs?category=Books");
    expect(res.status).toBe(200);

    const names = res.body.map((i: { name: string }) => i.name);
    expect(names).toContain("The Alchemist");
    expect(names).toContain("Atomic Habits");

    res.body.forEach((item: { category: string }) => {
      expect(item.category).toBe("Books");
    });
  });
});

describe("POST /catalogs", () => {
  it("should create a new item 'Laptop'", async () => {
    const newItem = { name: "Laptop", price: 60000, category: "Electronics" };
    const res = await request(app).post("/catalogs").send(newItem);
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Laptop");
    expect(res.body.data.category).toBe("Electronics");
  });
});

describe("PUT /catalogs/:id", () => {
  it("should update the Smartphone price to 25000", async () => {
    const res = await request(app)
      .put("/catalogs/68b930e4e3744bf8d629c7fe")
      .send({ price: 25000 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(25000);
    expect(res.body.data.name).toBe("Smartphone");
  });
});

describe("PATCH /catalogs/:id", () => {
  it("should update Headphones price to 1500", async () => {
    const res = await request(app)
      .patch("/catalogs/68b9311ae3744bf8d629c800")
      .send({ price: 1500 });
    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(1500);
    expect(res.body.data.name).toBe("Headphones");
  });
});

describe("DELETE /catalogs/:id", () => {
  it("should delete the Jeans item", async () => {
    const jeans = await Item.create({
      name: "Jeans",
      price: 1200,
      category: "Clothing",
    });

    const res = await request(app).delete(`/catalogs/${jeans._id}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Item deleted successfully");
    expect(res.body.data.name).toBe("Jeans");
  });
});
