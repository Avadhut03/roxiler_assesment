const express= require("express");
const {PrismaClient}= require("@prisma/client");
const authMiddleware= require("../../middleware/authMiddleware")

const prisma= new PrismaClient();
const router= express.Router();

const isAdmin=(req,res,next)=>{
    if(req.user.role!=="ADMIN"){
        return res.status(403).json({message:"Access denied"});
    }
    next();
};

router.get("/dashboard",authMiddleware,isAdmin,async(req,res)=>{
    try {
        const totalUsers = await prisma.user.count();
        const totalStores= await prisma.store.count();
        const totalRatings= await prisma.rating.count();
        res.json({totalUsers,totalStores,totalRatings});
    } catch (error) {
        console.log(error);
    }
})

router.post("/stores",authMiddleware,isAdmin,async (req,res)=>{
    try {
        const {name,email,address,ownerId}=req.body;
        const store= await prisma.store.create({
            data:{name,email,address,ownerId},
        });
        res.status(201).json(store);
    } catch (error) {
        console.log(error)
    }
})

router.post("/users",authMiddleware,isAdmin,async(req,res)=>{
    try {
        const {name,email,password,address,role}=req.body;
        const existing= await prisma.user.findUnique({where:{email}});
        if(existing) res.json({message:"User already exists"});
        const user= await prisma.user.create({
            data:{name,email,password,address,role}
        })
        res.status(201).json(user);
    } catch (error) {
        console.log(error)

    }
})
module.exports= router;

