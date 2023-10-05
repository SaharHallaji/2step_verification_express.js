import {User} from "../models/users";
import {Request,Response} from "express";
import {redisClient} from "../app";
import crypto from "crypto";
import {transporter} from "../utils/transporter";
import {secretKey} from "../app";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import AuthRequest from "../interfaces";
export const register = async (req:Request , res:Response) => {
    const {email , password} = req.query
    try{
        const user = new User({
            email,
            password,
            isVerified: false
        })
        User.findOne({email: email})
            .then((user)=>{
                if (!user) return res.status(409).json({status: 409 , message: "user already exist!"})
            })
            .catch((err)=>{
                console.log(err)
                return res.status(500).json({status: 500 , message: "something went wrong!"})
            })
        await user.save()
            .then(()=>{
                console.log('user added successfully!')
            })
            .catch((error)=>{
                console.log(error)
                return res.status(500).json({status: 500 , message: "unable to register the user"})
            })

        const verificationToken = crypto.randomBytes(32).toString('hex')

        redisClient.setex(verificationToken , 3600 , email as string)
        const mailOption = {
            from: "express.2step.auth@gmail.com",
            to: email ,
            subject: "email verification",
            text: `click the following link to verify your email : http://localhost:5000/verify?token=${verificationToken}`
        }
        transporter.sendMail(mailOption as object, (err , info)=>{
            if (err){
                console.log(err)
                res.status(500).json({status: 500 , message : "unable to send email."})
            }else {
                console.log("email sent: " +info.response)
                res.status(200).json({status:200 , message: "user registered successfully , please check your email."})
            }
        })
    }catch (err){
        console.log(err)
        return res.status(500).json({status: 500 , message: "something went wrong...!"})
    }
}


export const verify = async (req:Request , res:Response)=>{
    const {token} = req.query
    try {
        redisClient.get(token as string , async (err , email)=>{
            if (err || !email) return res.status(400).json({status: 400 , message: "invalid or expired verification token!"})

            await User.findOneAndUpdate({email: email}, {isVerified: true})
                .catch((err)=>{
                    console.log(err)
                    return res.status(500).json({status: 500 , message: "unable to update user!"})
                })

            redisClient.del(token as string)
                .then(()=>{
                    return res.status(200).json({status: 200 , message: "user verified successfully , you can log in now!"})
                })
        })



    }catch (err){
        console.log(err)
        return res.status(500).json({status: 500 , message : "something went wrong!"})
    }
}


export const login = async (req: Request, res: Response)=>{
    const {email, password} = req.query
    if (!(email || password)) return res.status(400).json({message: 'enter the correct username and password'})
    try{
        const user = await User.findOne({email: email})
        console.log(email, password)
        if (!user || !(await bcrypt.compare(password as string, user.password as string))) return res.status(400).json({message: 'email or password is incorrect!'})
        const token = jwt.sign({email: user.email}, secretKey, {expiresIn: '1h'})
        return res.status(200).json({message: "login successful!", token})
    }catch(err){
        console.log(err)
        res.status(500).json({message: "something went wrong!"})
    }

}

export const panel = (req: AuthRequest, res: Response) => {
    User.findOne({email: req.user.email})
        .then((data) => {
            return res.status(200).send({
                email: data.email
            })
        })
        .catch((err) => {
            console.log(err)
            return res.status(500).send({message: `something went wrong!`})
        })

}

