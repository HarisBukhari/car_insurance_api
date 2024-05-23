import express from "express"
import { UserLogin, UserProfile, UserSignUp, UserVerify, OTP, ForgotPassword, ResetPassword, UpdateUserProfile, all, DeleteUserProfile } from "../controllers"
import { Authenticate } from "../middlewares"

const router = express.Router()

/* ------------------- Login/SignUp Section --------------------- */
router.post('/signUp', UserSignUp)
router.post('/login', UserLogin)
router.post('/forgot-password', ForgotPassword)
router.post('/reset-password', ResetPassword)
router.get('/all', all)
router.post('/delete/:DUser', DeleteUserProfile)

/* ------------------- Authentication Section --------------------- */
router.use(Authenticate)

/* ------------------- Profile Section --------------------- */
router.patch('/verify', UserVerify)
router.get('/otp', OTP)
router.get('/profile', UserProfile)
router.patch('/profile', UpdateUserProfile)


export { router as UserRoute }