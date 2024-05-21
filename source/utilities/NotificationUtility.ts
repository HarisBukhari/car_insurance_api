require('dotenv').config()
const T_ID = process.env.Twilio_ID
const T_Token = process.env.Twilio_Token

//OTP and OTP_Expiry
export const generateOtop = () => {
    const otp = Math.floor(100000 + Math.random() * 900000)
    let otp_expiry = new Date()
    otp_expiry.setTime(new Date().getTime() + (30 * 60 * 1000))
    return { otp, otp_expiry }
}

export const requestOtp = async (otp: number, to: String) => {
    try {
        const client = require('twilio')(T_ID, T_Token)
        const response = await client.messages.create({
            body: `Your OTP is ${otp}`,
            from: '+12394490950',
            to: `+92${to}`
        })
        return response
    } catch (err) {
        console.log(err)
    }
}