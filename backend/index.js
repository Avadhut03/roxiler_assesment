const express = require("express");
const cors = require("cors");
const dotenv= require("dotenv");
const {PrismaClient} = require("@prisma/client");

const authRoute= require("./routers/auth/auth");
const adminRoute= require("./routers/admin/admin")
const userRoute= require("./routers/users/user");

dotenv.config();

const app =express();
app.use(cors());
app.use(express.json());

app.use("/auth",authRoute);
app.use("/admin",adminRoute);
app.use("/user",userRoute);
const PORT = process.env.PORT || 8000;

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
})
