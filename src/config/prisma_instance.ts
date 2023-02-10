import { PrismaClient } from "@prisma/client";

const prismaInstance = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
})

export default prismaInstance;