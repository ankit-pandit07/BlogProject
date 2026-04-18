import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

export const blogRouter=new Hono<{
    Bindings:{
		DATABASE_URL:string;
		JWT_SECRET:string
	},
    Variables:{
        userId:any;
        prisma:any;
    }
}>()

blogRouter.use('/*',async(c,next)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL
    }).$extends(withAccelerate());
    c.set("prisma", prisma);

    const authHeader=c.req.header("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
    
    try{
        const user=await verify(token,c.env.JWT_SECRET);
        if(user){
            c.set("userId",user.id);
            await next();
        }else{
            c.status(403);
            return c.json({
                message:"You are not logged in"
            })
        }
    }catch(e){
        c.status(403);
        return c.json({
            message:"You are not logged in"
        })
    }
})


    blogRouter.post('/',async(c)=>{
        const body=await c.req.json();
        const authorId=c.get("userId");
        const prisma=c.get("prisma");

        try {
            const blog=await prisma.post.create({
                data:{
                    title:body.title,
                    content:body.content,
                    authorId:Number(authorId)
                }
            })
            return c.json({ id:blog.id })
        } catch(e: any) {
            console.error("Create Blog Error:", e);
            c.status(500);
            return c.json({ message: "Failed to create post", error: String(e) });
        }
    })
    
    blogRouter.put('/',async(c)=>{
        const body=await c.req.json();
        const authorId=c.get("userId");
        const prisma=c.get("prisma");

        try {
            const existingBlog = await prisma.post.findUnique({ where: { id: body.id } });
            if (!existingBlog || existingBlog.authorId !== Number(authorId)) {
                c.status(403);
                return c.json({ message: "You are not authorized to edit this post" });
            }

            const blog=await prisma.post.update({
                where:{
                    id:body.id
                },
                data:{
                    title:body.title,
                    content:body.content, 
                }
            })
            return c.json({ id:blog.id })
        } catch(e: any) {
            console.error("Update Blog Error:", e);
            c.status(500);
            return c.json({ message: "Failed to update post", error: String(e) });
        }
    })

    blogRouter.delete('/:id', async (c) => {
        const id = c.req.param("id");
        const authorId = c.get("userId");
        const prisma = c.get("prisma");

        try {
            const existingBlog = await prisma.post.findUnique({ where: { id: Number(id) } });
            if (!existingBlog || existingBlog.authorId !== Number(authorId)) {
                c.status(403);
                return c.json({ message: "You are not authorized to delete this post" });
            }

            await prisma.post.delete({ where: { id: Number(id) } });
            return c.json({ message: "Deleted successfully" });
        } catch (e: any) {
            console.error("Delete Blog Error:", e);
            c.status(500);
            return c.json({ message: "Failed to delete post", error: String(e) });
        }
    })

    // --- NEW ROUTES FOR LIKES AND COMMENTS ---

    blogRouter.post('/:id/like', async (c) => {
        const postId = Number(c.req.param("id"));
        const userId = Number(c.get("userId"));
        const prisma = c.get("prisma");

        try {
            // Check if like exists
            const existingLike = await prisma.like.findUnique({
                where: {
                    userId_postId: { userId, postId }
                }
            });

            if (existingLike) {
                // Unlike if it exists
                await prisma.like.delete({
                    where: { id: existingLike.id }
                });
                return c.json({ message: "Unliked successfully", liked: false });
            } else {
                // Like if it doesn't exist
                await prisma.like.create({
                    data: { userId, postId }
                });
                return c.json({ message: "Liked successfully", liked: true });
            }
        } catch (e: any) {
            console.error("Toggle Like Error:", e);
            c.status(500);
            return c.json({ message: "Failed to toggle like", error: String(e) });
        }
    });

    blogRouter.post('/:id/comment', async (c) => {
        const postId = Number(c.req.param("id"));
        const userId = Number(c.get("userId"));
        const body = await c.req.json();
        const prisma = c.get("prisma");

        if (!body.content) {
            c.status(400);
            return c.json({ message: "Comment content is required" });
        }

        try {
            const comment = await prisma.comment.create({
                data: {
                    content: body.content,
                    userId,
                    postId
                },
                include: {
                    user: { select: { name: true } }
                }
            });
            return c.json({ message: "Comment added successfully", comment });
        } catch (e: any) {
            console.error("Add Comment Error:", e);
            c.status(500);
            return c.json({ message: "Failed to add comment", error: String(e) });
        }
    });

    // --- END OF NEW ROUTES ---

      //Todo: pagination
      blogRouter.get('/bulk',async(c)=>{
        const prisma=c.get("prisma");
        try {
            const blogs=await prisma.post.findMany({
                select:{
                    content:true,
                    title:true,
                    id:true,
                    author:{
                        select:{
                            name:true
                        }
                    },
                    _count: {
                        select: {
                            likes: true,
                            comments: true
                        }
                    }
                }
            })
            return c.json({ blogs })
        } catch(e: any) {
            console.error("Fetch Blogs Error:", e);
            c.status(500);
            return c.json({ message: "Failed to fetch blogs", error: String(e) });
        }
    })

    blogRouter.get('/:id',async(c)=>{
        const id= c.req.param("id");
        console.log("ID:", id);
        
        const numericId = Number(id);
        if (isNaN(numericId)) {
            c.status(400);
            return c.json({ message: "Invalid blog ID format" });
        }

        const prisma=c.get("prisma");

       try {
        const blog=await prisma.post.findFirst({
            where:{
                id: numericId
            },
            select:{
                id:true,
                title:true,
                content:true,
                authorId:true,
                author:{
                    select:{
                        name:true
                    }
                },
                _count: {
                    select: {
                        likes: true,
                        comments: true
                    }
                },
                comments: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true,
                        user: { select: { name: true } }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                likes: {
                    select: { userId: true }
                }
            }
        })

        if (!blog) {
            c.status(404);
            return c.json({ message: "Blog not found" });
        }

        return c.json({ blog })
        
       } catch (e: any) {
        console.error("ERROR:", e);
        c.status(500);
        return c.json({ message:"Error while fetching blog post", error: String(e) })
       }
    })

  
