import express, {Express, Request, Response} from "express";
import mongoose from "mongoose"
import Redis from 'ioredis'
import {login, panel, register, verify} from "./apis/functions";
import checkToken from "./middleware/checkToken";
import crypto from "crypto";


const app: Express = express()
mongoose.connect('mongodb://localhost:27017/2stepAuth')
    .then(() => console.log('connected to MongoDB'))
    .catch(err => console.error(err))

export const redisClient = new Redis({
    host:"localhost",
    port: 6379
})
    .on('error', err => console.log('Redis Client Error', err))
    .on('connect', ()=> {console.log('Connected!');})

export const secretKey = Object.freeze(crypto.randomBytes(64).toString("base64"))

app.post('/register' ,  register)
app.post('/verify' ,  verify)
app.post('/login' ,  login)
app.post('/panel' ,  checkToken ,panel)




app.listen(5000)