import {NextFunction , Response} from "express";
import jwt from "jsonwebtoken";
import AuthRequest from "../interfaces";
import {secretKey} from "../app";
const checkToken =(req:AuthRequest ,res:Response ,next:NextFunction)=>{
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    if (!token) return res.status(401).json({message : "access denied"})

    try {
        jwt.verify(token, secretKey as string, (err: any, user: any) => {

            if (err) return res.status(403).send('unauthorized!')

            req.user = user

            next()
        })
    }
    catch (err) {
        return res.status(500).send(`something went wrong : ${err}`)
    }
}

export default checkToken

