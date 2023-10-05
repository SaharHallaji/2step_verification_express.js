import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: {type: String , options: {unique: true}},
    password : String ,
    isVerified : Boolean
})

export const User = mongoose.model('User' , userSchema)