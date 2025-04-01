import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: "./utils/schema.js",
  dialect: 'postgresql',
 
  dbCredentials: {
    url: 'postgresql://neondb_owner:npg_Ty3Zn8uFdRSi@ep-empty-sky-a5zqqo5i-pooler.us-east-2.aws.neon.tech/ai%20interview%20assistant?sslmode=require',
  },
});
