import { Request, Response, NextFunction } from "express"
import { User } from "../models"
import { plainToClass } from "class-transformer"
import { validate } from "class-validator"
import { generateOtop, generateSalt, generateSign, hashPassword, requestOtp, verifyPassword } from "../utilities"
import { CreateUserInputs, UsersLogin, EditUserInputs } from "../dto"
import { BadRequestError, CustomError, NotFoundError } from "../error"
import sendEmail from "../services/EmailService"
import crypto from 'crypto'


export const HelloFromMotorPol = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.status(200).json({ message: 'Hello from MotorPolicy'  })
    } catch (err) {
        next(err);
    }
}