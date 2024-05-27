import { Request, Response, NextFunction } from "express"
import { User } from "../models"
import { plainToClass } from "class-transformer"
import { validate } from "class-validator"
import { generateOtop, generateSalt, generateSign, hashPassword, requestOtp, verifyPassword } from "../utilities"
import { CreateUserInputs, UsersLogin, EditUserInputs } from "../dto"
import { BadRequestError, CustomError, NotFoundError } from "../error"
import sendEmail from "../services/EmailService"
import crypto from 'crypto'

/* ------------------- Temp User Profile Section --------------------- */
export const all = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const UserProfiles = await User.find()
        if (UserProfiles) {
            return res.status(200).json(UserProfiles)  // Return after successful response
        }
        throw new NotFoundError('User not Found', 'User/all')
    } catch (err) {
        next(err)
    }
}


/* ------------------- User Profile Section --------------------- */

export const findUser = async (id: string | undefined, email?: string) => {
    try {
        if (email) {
            return await User.findOne({ email: email })
        }
        if (id) {
            return await User.findOne({ _id: id })
        }
        throw new BadRequestError('Invalid inputs', 'User/findUser')
    } catch (err) {
        if (err instanceof BadRequestError) {
            throw err
        }
        throw new CustomError('An unexpected error occurred', 'User/findUser')
    }
}

export const verifyToken = async (token: string) => {
    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Check for expiry
        })
        if (!user) {
            throw new BadRequestError('Invalid token', 'User/verifyToken')
        }
        return user
    } catch (err) {
        if (err instanceof BadRequestError) {
            throw err
        }
        throw new CustomError('An unexpected error occurred', 'User/findUser')
    }
}


export const UserSignUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const UserInputs = plainToClass(CreateUserInputs, req.body)
        const inputErrors = await validate(UserInputs, { validationError: { target: true } })
        if (inputErrors.length > 0) {
            throw new BadRequestError('Input validation error', 'User/SignUp')
        }
        const { email, password, phone, emiratesId } = UserInputs
        const salt = await generateSalt()
        const userPassword = await hashPassword(password, salt)
        const ExistingUser = await findUser('', email)
        if (ExistingUser !== null) {
            throw new BadRequestError('A User exist with the provided email ID', 'User/SignUp')
        }
        const { otp, otp_expiry } = generateOtop()
        const user = await User.create({
            email,
            password,
            salt,
            phone,
            otp,
            otp_expiry,
            emiratesId,
            verified: false,
            provider: 'App',
            lat: 0,
            lng: 0
        })
        if (user) {
            // await requestOtp(otp, phone)
            const signature = generateSign({
                _id: user._id.toString(),
                email: user.email,
                verified: false,
            })
            return res.status(201).json(({
                signature: signature,
                verified: user.verified,
                email: user.email
            }))
        } else {
            throw new CustomError('Database Error', 'User/Signup')
        }
    } catch (err) {
        next(err)
    }
}

export const UserLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const UserInputs = plainToClass(UsersLogin, req.body)
        const inputErrors = await validate(UserInputs, { validationError: { target: true } })
        if (inputErrors.length > 0) {
            throw new BadRequestError('Input validation error', 'User/UserLogin')
        }
        const { email, password } = UserInputs
        if (email && password) {
            const user = await findUser('', email)
            if (user) {
                let validPassword = await verifyPassword(password, user.password)
                if (validPassword) {
                    const sign = generateSign({
                        _id: user._id.toString(),
                        email: user.email,
                        verified: false,
                    })
                    return res.status(200).send({ token: sign })
                }
                throw new BadRequestError('Input validation error', 'User/UserLogin')
            }
            throw new NotFoundError('Input validation error', 'User/UserLogin')
        }
        throw new BadRequestError('Input validation error', 'User/UserLogin')
    } catch (err) {
        next(err)
    }
}

export const UserVerify = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const User = req.User
        const { otp } = req.body
        if (User) {
            const UserProfile = await (findUser(User._id, ""))
            if (UserProfile) {
                if (UserProfile.otp == otp) {
                    UserProfile.verified = true
                    await UserProfile.save()
                    return res.status(200).json(UserProfile)
                }
                throw new BadRequestError('Otp Failed', 'User/UserVerify')
            }
            throw new NotFoundError('User not Found', 'User/UserVerify')
        }
        throw new BadRequestError('Invalid User', 'User/UserVerify')
    } catch (err) {
        next(err)
    }
}

export const OTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const User = req.User
        if (User) {
            const UserProfile = await (findUser(User._id, ""))
            if (UserProfile) {
                const { otp, otp_expiry } = generateOtop()
                const result = await requestOtp(otp, UserProfile.phone)
                UserProfile.otp = otp
                UserProfile.otp_expiry = otp_expiry
                await UserProfile.save()
                return res.status(200).json(UserProfile.otp)
            }
            throw new NotFoundError('User not Found', 'User/Otp')
        }
        throw new BadRequestError('Invalid User', 'User/Otp')
    } catch (err) {
        next(err)
    }
}

export const UserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const User = req.User
        if (User) {
            const UserProfile = await findUser(User._id, "")
            if (UserProfile) {
                return res.status(200).json(UserProfile)  // Return after successful response
            }
            throw new NotFoundError('User not Found', 'User/UserProfile')
        }
        throw new BadRequestError('Invalid User', 'User/UserProfile')
    } catch (err) {
        next(err)
    }
}

export const UpdateUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const UserInputs = plainToClass(EditUserInputs, req.body)
        const inputErrors = await validate(UserInputs, { validationError: { target: true } })
        if (inputErrors.length > 0) {
            throw new BadRequestError('Invalid inputs', 'User/UpdateUserProfile')
        }
        const User = req.User
        const { fullName, email, address, emiratesId, phone, dateOfBirth } = UserInputs
        if (User) {
            const UserProfile = await (findUser(User._id, ""))
            if (UserProfile) {
                if (fullName !== undefined) UserProfile.fullName = fullName
                if (email !== undefined) UserProfile.email = email
                if (address !== undefined) UserProfile.address = address
                if (emiratesId !== undefined) UserProfile.emiratesId = emiratesId
                if (phone !== undefined) UserProfile.phone = phone
                if (dateOfBirth !== undefined) UserProfile.dateOfBirth = dateOfBirth
                await UserProfile.save()
                return res.status(200).json(UserProfile)
            }
            throw new NotFoundError('User not found', 'User/UpdateUserProfile')
        }
        throw new BadRequestError('Invalid User', 'User/UpdateUserProfile')
    } catch (err) {
        next(err)
    }
}

export const DeleteUserProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { DUser } = req.params
        if (DUser) {
            const UserProfile = await User.findOneAndDelete({ _id: DUser })
            if (UserProfile) {
                return res.status(200).json(UserProfile)  // Return after successful response
            }
            throw new NotFoundError('User not Found', 'User/UserProfile')
        }
        throw new BadRequestError('Invalid User', 'User/UserProfile')
    } catch (err) {
        next(err)
    }
}

export const ForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body
        if (email) {
            const UserProfile = await findUser("", email)
            if (UserProfile) {
                const to = UserProfile.email
                const resetToken = crypto.randomBytes(20).toString('hex')
                UserProfile.resetPasswordToken = resetToken
                UserProfile.resetPasswordExpires = Date.now() + 3600000 // 1 hour expiry
                await UserProfile.save()
                // console.log(resetToken)
                const subject = 'Password Reset Request'
                const text = `Click on the following link to reset your password: https://your-domain.com/reset-password/${resetToken}`
                const html =
                    `
                    <p>Click on the following button to reset your password:</p>
                    <button style="background-color: #007bff color: white border: none padding: 15px 30px font-size: 18px border-radius: 5px cursor: pointer">
                    <a href="http://localhost:3000/reset-password/${resetToken}>" style="color: white text-decoration: none">Reset Password</a>
                    </button>      
                    `
                await sendEmail(to, subject, text, html) // Wait for email to be sent before continuing
                return res.status(200).json({ message: 'Password reset link sent to your email' })
            } else {
                throw new NotFoundError('User not Found', 'User/ResetCutomerPassword')
            }
        } else {
            throw new BadRequestError('Invalid User', 'User/ResetCutomerPassword')
        }
    } catch (err) {
        next(err)
    }
}

export const ResetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body
    if (!token || !password) {
        return res.status(400).json({ message: 'Missing required fields: token and password' })
    }
    try {
        const user = await verifyToken(token)
        const salt = await generateSalt()
        const userPassword = await hashPassword(password, salt)
        user.password = userPassword
        user.salt = salt
        user.resetPasswordToken = undefined // Clear token after reset
        user.resetPasswordExpires = undefined
        await user.save()
        return res.status(200).json({ message: 'Password reset successfully' })
    } catch (err) {
        next(err)
    }
}

export const ThirdPartyAuth = async (req: Request, res: Response, next: NextFunction) => {
    // Successful authentication, generate JWT
    try {
        const user = req.user as { _id: string, email: string, verified: boolean } // Type casting for user ID
        const signature = generateSign({
            _id: user._id,
            email: user.email,
            verified: user.verified,
        })
        res.json({
            signature: signature,
            email: user.email,
            verified: user.verified,
        })
    } catch (err) {
        next(err)
    }
}