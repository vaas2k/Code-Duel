import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: 'postgresql', // 'mysql' | 'sqlite' | 'turso'
  schema: './src/database/schema.ts',
  out: './src/database/migrations',
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://admin:secret@localhost:5432/mydb",
  }
})  
