import express from "express"
import { createMotorPolicy } from "../controllers"
import { Authenticate } from "../middlewares"

const router = express.Router()

/* ------------------- Login/SignUp Section --------------------- */
// router.get('/', HelloFromMotorPol)
// router.post('/login', UserLogin)
// router.post('/forgot-password', ForgotPassword)
// router.post('/reset-password', ResetPassword)

/* ------------------- Authentication Section --------------------- */
router.use(Authenticate)

// /* ------------------- Profile Section --------------------- */
// router.patch('/verify', UserVerify)
router.post('/createMotorPolicy', createMotorPolicy)
// router.get('/otp', OTP)
// router.get('/profile', UserProfile)
// router.patch('/profile', UpdateUserProfile)


export { router as MotorPolicyRoute }