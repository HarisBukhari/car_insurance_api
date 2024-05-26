import { Request, Response, NextFunction } from "express"
import { ClaimModel } from "../models"
import { plainToClass } from "class-transformer"
import { validate } from "class-validator"
import { generateOtop, generateSalt, generateSign, hashPassword, requestOtp, verifyPassword } from "../utilities"
import { CreateClaimInputs } from "../dto"
import { BadRequestError, CustomError, NotFoundError } from "../error"
import sendEmail from "../services/EmailService"


// Function to create a ClaimModel
export const createClaimModel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const CreateClaim = plainToClass(CreateClaimInputs, req.body)
        const inputErrors = await validate(CreateClaim, { validationError: { target: true } })
        if (inputErrors.length > 0) {
            throw new BadRequestError('Input validation error', 'User/SignUp')
        }
        const data = {
            user: req.User._id,
            ...CreateClaim
        }
        const newClaimModel = await ClaimModel.create(data)
        return res.status(201).json(newClaimModel) // Return created ClaimModel
    } catch (err) {
        next(err)
    }
}

// Function to get all ClaimModels for a specific user
export const getUserClaimModels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.params.userId // Replace with your user ID retrieval logic
        const ClaimModels = await ClaimModel.find({ user: userId })
        return res.status(200).json(ClaimModels) // Return user's ClaimModels
    } catch (err) {
        next(err)
    }
}

// Function to get a ClaimModel by ID
export const getClaimModelById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    try {
        const claimModel = await ClaimModel.findById(id)
        if (!claimModel) {
            throw new NotFoundError('ClaimModel not found', 'ClaimModel/getClaimModelById')
        }
        return res.status(200).json(claimModel) // Return ClaimModel
    } catch (err) {
        next(err)
    }
}

// Function to update a ClaimModel
// export const updateClaimModel = async (req: Request, res: Response, next: NextFunction) => {
//     const { id } = req.params
//     try {
//         const updatedClaimModel: ClaimDoc = await ClaimModel.findByIdAndUpdate(id, req.body, { new: true })
//         if (!updatedClaimModel) {
//             throw new NotFoundError('ClaimModel not found', 'ClaimModel/updateClaimModel')
//         }
//         return res.status(200).json(updatedClaimModel) // Return updated ClaimModel
//     } catch (err) {
//         next(err)
//     }
// }

// Function to delete a ClaimModel
export const deleteClaimModel = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    try {
        const deletedClaimModel = await ClaimModel.findByIdAndDelete({ _id: id, user: req.User._id })
        if (!deletedClaimModel) {
            throw new NotFoundError('ClaimModel not found', 'ClaimModel/deleteClaimModel')
        }
        return res.status(200).json({ message: 'ClaimModel deleted successfully' })
    } catch (err) {
        next(err)
    }
}