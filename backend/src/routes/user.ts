import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt';
import { signinInput } from "@ankitpandit/medium-common";
import { z } from "zod";

const signupInput = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional()
});
import bcrypt from "bcryptjs";

export const userRouter=new Hono<{
    Bindings:{
        DATABASE_URL:string
        JWT_SECRET:string
    }
}>();

userRouter.post('/signup', async(c) => {
    try {
        console.log("STEP 1: Starting signup route");
        let body;
        try {
            body = await c.req.json();
        } catch (err) {
            console.log("ERROR: Invalid JSON body", err);
            c.status(400);
            return c.json({ message: "Invalid JSON body" });
        }
        
        console.log("BODY:", body);

        if (!body.email || !body.password) {
            console.log("ERROR: Missing email or password");
            c.status(400);
            return c.json({ message: "Email and password are required" });
        }

        console.log("STEP 2: Validating input with Zod");
        const {success, error: zodError}=signupInput.safeParse(body);
        if(!success){ 
            console.log("ERROR: Zod validation failed", zodError);
            c.status(411);
            return c.json({
                message:"Inputs not correct",
                details: zodError
            })
        }
        
        console.log("STEP 3: Initializing Prisma");
        const prisma=new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());
        
        console.log("STEP 4: Checking unique constraints");
        const existingUser = await prisma.user.findUnique({
            where: { email: body.email }
        });
        if (existingUser) {
            console.log("ERROR: User with this email already exists");
            c.status(403);
            return c.json({ message: "User with this email already exists" });
        }

        console.log("STEP 5: Hashing password");
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(body.password, salt);

        console.log("STEP 6: Creating user in database");
        const user=await prisma.user.create({
            data: {
                email:body.email,
                password: hashedPassword,
                name:body.name || "Anonymous"
            }
        })

        console.log("STEP 7: Signing JWT");
        const jwt =await sign({
            id:user.id
        },c.env.JWT_SECRET)

        console.log("STEP 8: Returning successful response");
        return c.json({ jwt })
    } catch (error: any) {
        console.log("ERROR:", error);
        c.status(500);
        return c.json({ message: "Internal server error during signup", error: String(error) });
    }
})

userRouter.post('/signin', async(c) => {
    try {
        let body;
        try {
            body = await c.req.json();
        } catch (err) {
            c.status(400);
            return c.json({ message: "Invalid JSON body" });
        }

        const {success}=signinInput.safeParse(body);
        if(!success){
            c.status(411);
            return c.json({
                message:"Inputs not correct"
            })
        }
        const prisma=new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL,
        }).$extends(withAccelerate());

        const user=await prisma.user.findFirst({
            where: {
                email:body.email,
            }
        })
        if(!user){
            c.status(403);
            return c.json({
                message:"Incorrect creds"
            })
        }

        // Use Sync version of bcryptjs to prevent Cloudflare Worker hanging/crashing
        const isValidPassword = bcrypt.compareSync(body.password, user.password);
        if(!isValidPassword){
            c.status(403);
            return c.json({
                message:"Incorrect creds"
            })
        }

        const jwt =await sign({
            id:user.id
        },c.env.JWT_SECRET)

        return c.json({ jwt })
    } catch (e: any) {
        console.error("Signin Error:", e);
        c.status(500);
        return c.json({ message: "Internal server error during signin", error: String(e) });
    }
})
