import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app";
import Item from "../model/items";

describe("wishlist and review flows", () => {
  let mongoServer: MongoMemoryServer;
  let authToken: string;
  let productId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const registerResponse = await request(app).post("/auth/register").send({
      fullName: "Test User",
      email: "wishlist@example.com",
      password: "password123",
      confirmPassword: "password123",
    });

    authToken = registerResponse.body.token;

    const product = await Item.create({
      name: "Notebook",
      price: 1200,
      category: "Office",
      description: "Helpful notebook",
    });

    productId = product._id.toString();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it("adds and removes products from the wishlist", async () => {
    const addResponse = await request(app)
      .post("/wishlist")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ productId });

    expect(addResponse.status).toBe(200);
    expect(addResponse.body.products).toHaveLength(1);
    expect(addResponse.body.products[0]._id).toBe(productId);

    const listResponse = await request(app)
      .get("/wishlist")
      .set("Authorization", `Bearer ${authToken}`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.products).toHaveLength(1);

    const removeResponse = await request(app)
      .delete(`/wishlist/${productId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(removeResponse.status).toBe(200);
    expect(removeResponse.body.products).toHaveLength(0);
  });

  it("creates and lists product reviews", async () => {
    const createResponse = await request(app)
      .post(`/catalogs/${productId}/reviews`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ rating: 5, comment: "Great product" });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.review.rating).toBe(5);

    const listResponse = await request(app).get(`/catalogs/${productId}/reviews`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.reviews).toHaveLength(1);
    expect(listResponse.body.averageRating).toBe(5);
  });
});
