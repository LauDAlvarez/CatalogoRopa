import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DATABASE_URL || "mysql://root:password@localhost:3306/catalogo_ropa";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  datasource: {
    url: databaseUrl
  }
});
