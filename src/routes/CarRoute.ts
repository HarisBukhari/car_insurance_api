import express from "express"
import { HelloFromCar_C } from "../controllers"
import { Authenticate } from "../middlewares"

const router = express.Router()

/* ------------------- Login/SignUp Section --------------------- */
router.get('/', HelloFromCar_C)
// router.post('/login', UserLogin)
// router.post('/forgot-password', ForgotPassword)
// router.post('/reset-password', ResetPassword)

/* ------------------- Authentication Section --------------------- */
// router.use(Authenticate)

// /* ------------------- Profile Section --------------------- */
// router.patch('/verify', UserVerify)
// router.get('/otp', OTP)
// router.get('/profile', UserProfile)
// router.patch('/profile', UpdateUserProfile)


export { router as CarRoute }