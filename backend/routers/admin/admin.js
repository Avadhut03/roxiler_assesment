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

router.get("/stores",authMiddleware,isAdmin,async(req,res)=>{
    try {
        const {name,email,address,sortBy="id",order="asc"}= req.query;
        const stores = await prisma.store.findMany({
      where: {
        name: name ? { contains: name, mode: "insensitive" } : undefined,
        email: email ? { contains: email, mode: "insensitive" } : undefined,
        address: address ? { contains: address, mode: "insensitive" } : undefined,
      },
      orderBy: { [sortBy]: order },
      include: {
        ratings: true,
      },
    });
    const storesWithRating = stores.map((s) => {
      const avgRating =
        s.ratings.length > 0
          ? s.ratings.reduce((a, b) => a + b.rating, 0) / s.ratings.length
          : 0;
      return { ...s, averageRating: avgRating.toFixed(1) };
    });

    res.json(storesWithRating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});
module.exports= router;

