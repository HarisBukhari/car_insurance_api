import express from "express"
import { CustomerLogin, CustomerProfile, CustomerSignUp, CustomerVerify, OTP, PasswordResetRequest, ResetPassword, UpdateCutomerProfile } from "../controllers"
import { Authenticate } from "../middlewares"

const router = express.Router()

/* ------------------- Login/SignUp Section --------------------- */
router.post('/signUp', CustomerSignUp)
router.post('/login', CustomerLogin)
router.post('/forgot-password', PasswordResetRequest)
router.post('/reset-password', ResetPassword)

/* ------------------- Authentication Section --------------------- */
router.use(Authenticate)

/* ------------------- Profile Section --------------------- */
router.patch('/verify', CustomerVerify)
router.get('/otp', OTP)
router.get('/profile', CustomerProfile)
router.patch('/profile', UpdateCutomerProfile)


export { router as CustomerRoute }