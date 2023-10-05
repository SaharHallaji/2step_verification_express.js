import nodemailer from 'nodemailer'

export const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth :{
        user: "express.2step.auth@gmail.com",
        pass: "onkt dhzg qvtv pver"
    }
})