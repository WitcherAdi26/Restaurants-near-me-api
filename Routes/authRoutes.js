import express from "express"
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authenticateJWT from "../middlewares/AuthenticateJWT.js";


const authRouter=express.Router();

// auth home
authRouter.get("/",(req,res)=>{
    res.send("<h1>Auth</h1>")
});

// register
authRouter.post("/register",async (req,res)=>{
    // console.log(req.body);
    const {username,email,password}=req.body;

    if(!username || !email || !password){
        return res.status(400).json({"msg":"Please fill out the fields"});
    }

    try {
        const userExists=await userModel.findOne({email}||{username});
        if(userExists){
            return res.status(400).json({"msg":"User with this email or usernme already exists"});
        }
    
        const saltRounds=parseInt(process.env.SALT_ROUNDS);
        const hashedPassword=await bcrypt.hash(password,saltRounds);
    
        const newUser=new userModel({username,email,password:hashedPassword});
        await newUser.save();
    
        return res.status(202).json({"msg":"User Registered Successfully"});
    } catch (error) {
        console.log(error);
        return res.status(500).json({"msg":"Server Error"});
    }
});

// login
authRouter.post("/login",async (req,res)=>{
    const {email,password}=req.body;

    if(!email || !password){
        return res.status(400).json({"msg":"Please fill out the fields"});
    }

    try {
        const userExists=await userModel.findOne({email});
        if(!userExists){
            return res.status(404).json({"msg":"Invalid Credentials"});
        }

        const isMatch=await bcrypt.compare(password,userExists.password);
        if(!isMatch){
            return res.status(400).json({"msg":"Invalid Credentials"});
        }

        const token = jwt.sign({ username: userExists.username,email }, process.env.SECRET_KEY, { expiresIn: '1h' });
        return res.status(200).json({"msg":"User Logged In Successfully","token":token});
    } catch (error) {
        console.log(error);
        return res.status(500).json({"msg":"Server Error"});
    }
});

authRouter.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

export default authRouter;

