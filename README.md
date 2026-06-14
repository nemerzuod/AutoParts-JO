# AutoParts-JO

Professional Platform for Auto Parts Management in Jordan
منصة احترافية لإدارة وتوزيع قطع غيار السيارات في الأردن.

## Features / الميزات

- **Dashboard** — inventory stats (parts count, total units, stock value in JOD) and low-stock alerts.
- **Parts catalog** — create, edit, delete parts with search and filtering by category / low stock.
- **Vehicle compatibility (fitments)** — map each part to vehicle make/model/year ranges.
- **JOD pricing** and multi-branch stock (Amman, Zarqa, Irbid, Aqaba).
- **Arabic-first UI** with full RTL support.

## Tech Stack

- [Next.js 14](https://nextjs.org/) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/) ORM + SQLite

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env

# 3. Create the database schema
npm run db:push

# 4. Seed sample data (optional)
npm run db:seed

# 5. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the development server         |
| `npm run build`    | Generate Prisma client and build     |
| `npm run start`    | Run the production build             |
| `npm run lint`     | Run ESLint                           |
| `npm run typecheck`| Run TypeScript type checking         |
| `npm run db:push`  | Apply the Prisma schema to the DB    |
| `npm run db:seed`  | Seed the database with sample data   |

## API

| Method | Endpoint           | Description                          |
| ------ | ------------------ | ------------------------------------ |
| GET    | `/api/parts`       | List parts (`search`, `categoryId`, `lowStock`) |
| POST   | `/api/parts`       | Create a part                        |
| GET    | `/api/parts/:id`   | Get a single part                    |
| PUT    | `/api/parts/:id`   | Update a part                        |
| DELETE | `/api/parts/:id`   | Delete a part                        |
| GET    | `/api/categories`  | List categories                      |
| POST   | `/api/categories`  | Create a category                    |

## Data Model

- **Category** — part category (with Arabic name).
- **Part** — name (ar/en), OEM part number, brand, price (JOD), quantity, min quantity, branch, category.
- **VehicleFitment** — make/model/yearFrom/yearTo linked to a part.
