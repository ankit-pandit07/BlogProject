import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";

export const searchRouter = new Hono<{
    Bindings: { DATABASE_URL: string; JWT_SECRET: string },
    Variables: { prisma: any; }
}>()

searchRouter.use('/*', async (c, next) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    c.set("prisma", prisma);
    await next();
});

searchRouter.get('/', async (c) => {
    const q = c.req.query("q") || "";
    const prisma = c.get("prisma");
    
    if (!q.trim()) {
        return c.json({ posts: [], users: [] });
    }

    try {
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { content: { contains: q, mode: 'insensitive' } }
                ]
            },
            select: {
                id: true,
                title: true,
                content: true,
                author: { select: { name: true } }
            },
            take: 5
        });

        const users = await prisma.user.findMany({
            where: { name: { contains: q, mode: 'insensitive' } },
            select: { id: true, name: true },
            take: 5
        });

        return c.json({ posts, users });
    } catch (e: any) {
        c.status(500);
        return c.json({ message: "Search failed", error: String(e) });
    }
});
