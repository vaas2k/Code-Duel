
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import { keys } from "../configs/configs";


const DATABASE_URL = keys.databaseUrl

console.log('Database URL:', DATABASE_URL || "Not Set");

const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle(pool, { schema });
