const express = require('express');
const jwt= require('jsonwebtoken');
const {PrismaClient} = require("@prisma/client");
const dotenv = require('dotenv');
dotenv.config();
const prisma= new PrismaClient();
const router = express.Router();

const generateToken =(user)=>{
    return jwt.sign({id: user.id, role:user.role}, process.env.JWT_SECRET, {expiresIn: '1h'});
}

router.post("/signup", async (req,res)=>{
    try {
        const {name,email,address,password}=req.body;

        if(!name || name.length<20 || name.length>60){
            return res.status(400).json({error: "Name is required and must be between 20 to 60 characters"});
        }
        if(!password.match(/^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/)){
            return res.status(400).json({error: "Password must be between 8 to 16 characters and contain at least one uppercase letter and one special character"});
        }
        const exist = await prisma.user.findUnique({where:{email}});
        if(exist){
            return res.status(400).json({error:"Email Already Exists"})
        }
        const user = await prisma.user.create({
            data:{name,email,address,password,role:"USER"}
        });
        const token =generateToken(user);
        res.status(201).json({role:user.role,token});
    } catch (error) {
        console.error(error);
        res.status(500).json({error:"Internal Server error"});
    }
})


module.exports= router;