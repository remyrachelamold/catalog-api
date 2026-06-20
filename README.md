# Catalog API

REST API for managing a product catalog, built with Express, TypeScript, and MongoDB.

## Features

- CRUD operations on catalog items (name, price, category)
- Filter items by category, name, or price
- Pure logic functions exported for MCP/tooling integration
- Jest integration tests with in-memory MongoDB

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the example env file and adjust as needed:

```bash
cp .env.example .env
```

For local development, use a local MongoDB instance:

```env
MONGO_URI=mongodb://127.0.0.1:27017/catalog
PORT=3000
```

3. (Optional) Seed sample data:

```bash
npm run seed
```

4. Run in development:

```bash
npm run dev
```

5. Build and run production:

```bash
npm run build
npm start
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/catalogs` | List items (optional query: `category`, `name`, `price`) |
| POST | `/catalogs` | Create a new item |
| PUT | `/catalogs/:id` | Replace/update an item |
| PATCH | `/catalogs/:id` | Partially update an item |
| DELETE | `/catalogs/:id` | Delete an item |

### Example

```bash
curl http://localhost:3000/catalogs?category=Books
```

## Testing

Tests use an in-memory MongoDB instance and do not require a live database:

```bash
npm test
```

## Seeding the database

Populate your MongoDB instance with sample catalog items:

```bash
npm run seed
```

## MCP Exports

The following pure functions are exported from `src/index.ts` for programmatic use:

- `getCatalogs()`
- `addCatalogItem(input)`
- `updateCatalogItem(input)`
- `patchCatalogItem(input)`
- `deleteCatalogItem(input)`
