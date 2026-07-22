import express from "express";
import cors from "cors";
import catalog from "./routes/catalog";
import auth from "./routes/auth";
import orders from "./routes/orders";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/catalogs", catalog);
app.use("/auth", auth);
app.use("/orders", orders);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.options("/catalogs", (_req, res) => {
  res.set("Allow", "GET,POST,PUT,PATCH,DELETE,OPTIONS").send();
});

export default app;
