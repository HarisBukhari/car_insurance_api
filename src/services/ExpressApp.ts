import express, { Application } from "express"
import path from 'path'
import helmet from "helmet"
import cors from "cors"
import xss from "xss-clean"
import rateLimiter from "express-rate-limit"
import { errorHandlerMiddleware } from "../middlewares"
import { UserRoute, CarRoute, MotorPolicyRoute, MotorThirdpartyRoute, IntimateClaimRoute, RenewalPolicyRoute } from "../routes"
import passport from "../middlewares/passport"
import { ThirdPartyAuth } from "../controllers"

export default async (app: Application) => {
    app.use(express.static(path.join(__dirname, '../public')))
    app.use(express.urlencoded({ extended: true }))
    app.use(express.json())
    app.use(helmet())
    app.use(cors())
    app.use(xss())
    app.use(passport.initialize())
    app.use('/images', express.static(path.join(__dirname, '/images')))
    app.set('trust proxy', 1)
    app.use(
        rateLimiter({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
        })
    )

    /* ------------------- API Routes --------------------- */
    app.use("/user", UserRoute)
    app.use("/car", CarRoute)
    app.use("/motorpolicy", MotorPolicyRoute)
    app.use("/motorthirdparty", MotorThirdpartyRoute)
    app.use("/intimateClaim", IntimateClaimRoute)
    app.use("/renewalpolicy", RenewalPolicyRoute)

    //Error Middleware
    app.use(errorHandlerMiddleware)
    // app.use(ErrorHandler)

    /* ------------------- Login/SignUp 3rd Party Section --------------------- */
    //Google
    app.get('/auth/google', passport.authenticate('google'))
    app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/', session: false }), ThirdPartyAuth)
    // app.get('/auth/google/callback', passport.authenticate('google', { successRedirect: '/welcome', failureRedirect: '/', session: false }), ThirdPartyAuth)
    //Facebook
    app.get('/auth/facebook', passport.authenticate('facebook'))
    app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/', session: false }), ThirdPartyAuth)


    //Login Testing Page
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../public', 'Login.html'))
    })
    app.get('/welcome', (req, res) => {
        res.sendFile(path.join(__dirname, '../public', 'Welcome.html'))
    })
    //Document
    // app.get('*', (req: Request, res: Response, next: NextFunction) => {
    //     const postmanDocURL = 'https://documenter.getpostman.com/view/22277285/2s9YeN2U1H'
    //     res.send(html)
    // })

    return app
}