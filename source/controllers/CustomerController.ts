import { Request, Response, NextFunction } from "express"
import { Customer } from "../models"
import { plainToClass } from "class-transformer"
import { validate } from "class-validator"
import { generateOtop, generateSalt, generateSign, hashPassword, requestOtp, verifyPassword } from "../utilities"
import { CreateCustomerInputs, CustomersLogin, EditCustomerInputs } from "../dto"
import { BadRequestError, CustomError, NotFoundError } from "../error"
import jwt from 'jsonwebtoken'
import sendEmail from "../services/EmailService"
import crypto from 'crypto'


/* ------------------- Customer Profile Section --------------------- */

export const findCustomer = async (id: string | undefined, email?: string) => {
    try {
        if (email) {
            return await Customer.findOne({ email: email })
        }
        if (id) {
            return await Customer.findOne({ _id: id })
        }
        throw new BadRequestError('Invalid inputs', 'Customer/findCustomer')
    } catch (err) {
        if (err instanceof BadRequestError) {
            throw err
        }
        throw new CustomError('An unexpected error occurred', 'Customer/findCustomer')
    }
}

export const verifyToken = async (token: string) => {
    try {
        const user = await Customer.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Check for expiry
        })
        if (!user) {
            throw new BadRequestError('Invalid token', 'Customer/verifyToken')
        }
        return user
    } catch (err) {
        if (err instanceof BadRequestError) {
            throw err
        }
        throw new CustomError('An unexpected error occurred', 'Customer/findCustomer')
    }
}


export const CustomerSignUp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerInputs = plainToClass(CreateCustomerInputs, req.body)
        const inputErrors = await validate(customerInputs, { validationError: { target: true } })
        if (inputErrors.length > 0) {
            throw new BadRequestError('Input validation error', 'Customer/SignUp')
        }
        const { email, password, phone, firstName, lastName, address } = customerInputs
        const salt = await generateSalt()
        const userPassword = await hashPassword(password, salt)
        const user = await findCustomer('', email)
        if (user !== null) {
            throw new BadRequestError('A Customer exist with the provided email ID', 'Customer/SignUp')
        }
        const { otp, otp_expiry } = generateOtop()
        const customer = await Customer.create({
            email: email,
            password: userPassword,
            salt: salt,
            phone: phone,
            otp: otp,
            otp_expiry: otp_expiry,
            firstName: firstName,
            lastName: lastName,
            address: address,
            verified: false,
            provider: 'app',
            lat: 0,
            lng: 0
        })
        if (customer) {
            // await requestOtp(otp, phone)
            const signature = generateSign({
                _id: customer._id,
                email: customer.email,
                verified: false,
            })
            return res.status(201).json(({
                signature: signature,
                verified: customer.verified,
                email: customer.email
            }))
        } else {
            throw new CustomError('Database Error', 'Customer/Signup')
        }
    } catch (err) {
        next(err)
    }
}

export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerInputs = plainToClass(CustomersLogin, req.body)
        const inputErrors = await validate(customerInputs, { validationError: { target: true } })
        if (inputErrors.length > 0) {
            throw new BadRequestError('Input validation error', 'Customer/CustomerLogin')
        }
        const { email, password } = customerInputs
        if (email && password) {
            const user = await findCustomer('', email)
            if (user) {
                let validPassword = await verifyPassword(password, user.password)
                if (validPassword) {
                    const sign = generateSign({
                        _id: user._id,
                        email: user.email,
                        verified: false,
                    })
                    return res.status(200).send({ token: sign })
                }
                throw new BadRequestError('Input validation error', 'Customer/CustomerLogin')
            }
            throw new NotFoundError('Input validation error', 'Customer/CustomerLogin')
        }
        throw new BadRequestError('Input validation error', 'Customer/CustomerLogin')
    } catch (err) {
        next(err)
    }
}

export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = req.User
        const { otp } = req.body
        if (customer) {
            const customerProfile = await (findCustomer(customer._id, ""))
            if (customerProfile) {
                if (customerProfile.otp == otp) {
                    customerProfile.verified = true
                    await customerProfile.save()
                    return res.status(200).json(customerProfile)
                }
                throw new BadRequestError('Otp Failed', 'Customer/CustomerVerify')
            }
            throw new NotFoundError('Customer not Found', 'Customer/CustomerVerify')
        }
        throw new BadRequestError('Invalid Customer', 'Customer/CustomerVerify')
    } catch (err) {
        next(err)
    }
}

export const OTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = req.User
        if (customer) {
            const customerProfile = await (findCustomer(customer._id, ""))
            if (customerProfile) {
                const { otp, otp_expiry } = generateOtop()
                const result = await requestOtp(otp, customerProfile.phone)
                customerProfile.otp = otp
                customerProfile.otp_expiry = otp_expiry
                await customerProfile.save()
                return res.status(200).json(customerProfile.otp)
            }
            throw new NotFoundError('Customer not Found', 'Customer/Otp')
        }
        throw new BadRequestError('Invalid Customer', 'Customer/Otp')
    } catch (err) {
        next(err)
    }
}

export const CustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customer = req.User;
        if (customer) {
            const customerProfile = await findCustomer(customer._id, "");
            if (customerProfile) {
                return res.status(200).json(customerProfile);  // Return after successful response
            }
            throw new NotFoundError('Customer not Found', 'Customer/CustomerProfile');
        }
        throw new BadRequestError('Invalid Customer', 'Customer/CustomerProfile');
    } catch (err) {
        next(err);
    }
}

export const UpdateCutomerProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const customerInputs = plainToClass(EditCustomerInputs, req.body)
        const inputErrors = await validate(customerInputs, { validationError: { target: true } })
        if (inputErrors.length > 0) {
            throw new BadRequestError('Invalid inputs', 'Customer/UpdateCutomerProfile')
        }
        const customer = req.User
        const { firstName, lastName, address } = customerInputs
        if (customer) {
            const customerProfile = await (findCustomer(customer._id, ""))
            if (customerProfile) {
                customerProfile.firstName = firstName
                customerProfile.lastName = lastName
                customerProfile.address = address
                await customerProfile.save()
                return res.status(200).json(customerProfile)
            }
            throw new NotFoundError('Customer not found', 'Customer/UpdateCutomerProfile')
        }
        throw new BadRequestError('Invalid Customer', 'Customer/UpdateCutomerProfile')
    } catch (err) {
        next(err)
    }
}

export const PasswordResetRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body
        if (email) {
            const customerProfile = await findCustomer("", email)
            if (customerProfile) {
                const to = customerProfile.email
                const resetToken = crypto.randomBytes(20).toString('hex')
                customerProfile.resetPasswordToken = resetToken
                customerProfile.resetPasswordExpires = Date.now() + 3600000 // 1 hour expiry
                await customerProfile.save()
                // console.log(resetToken)
                const subject = 'Password Reset Request'
                const text = `IDK, Let's see what will happend`
                const html =
                    `
                    <p>Click on the following button to reset your password:</p>
                    <button style="background-color: #007bff; color: white; border: none; padding: 15px 30px; font-size: 18px; border-radius: 5px; cursor: pointer;">
                    <a href="http://localhost:3000/reset-password/${resetToken}>" style="color: white; text-decoration: none;">Reset Password</a>
                    </button>      
                    `
                await sendEmail(to, subject, text, html) // Wait for email to be sent before continuing
                return res.status(200).json({ message: 'Password reset link sent to your email' })
            } else {
                throw new NotFoundError('Customer not Found', 'Customer/ResetCutomerPassword')
            }
        } else {
            throw new BadRequestError('Invalid Customer', 'Customer/ResetCutomerPassword')
        }
    } catch (err) {
        next(err)
    }
}

export const ResetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { token, password } = req.body
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