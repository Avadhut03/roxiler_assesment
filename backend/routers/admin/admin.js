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

module.exports= router;

