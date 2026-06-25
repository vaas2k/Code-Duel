import 'dotenv/config';

export const keys = {
    port: process.env.PORT || 3000,
    databaseUrl: process.env.DATABASE_URL || "postgresql://admin:secret@localhost:5432/mydb",
};