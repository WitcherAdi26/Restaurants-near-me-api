import mongoose from "mongoose";

const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        require:[true,'Please Provide Username.'],
        unique:[true,'Username already exists.']
    },
    email:{
        type:String,
        require:[true,'Please provide Email'],
        unique:true
    },
    password:{
        type:String,
        require:[true,"Please provide a password"],
        unique:true
    },
});

export default mongoose.model.users || mongoose.model("users",UserSchema);