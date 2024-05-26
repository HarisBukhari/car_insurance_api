import { Request, Response, NextFunction } from "express"
import { Car, MotorThirdparty, MotorPolicy } from "../models"
import { plainToClass } from "class-transformer"
import { validate } from "class-validator"
import { CreateCarInputs, CreateMotorPolicyInputs, CreateMotorThirdpartyInputs } from "../dto"
import { BadRequestError, CustomError, NotFoundError } from "../error"
import mongoose from "mongoose"

// Function to create a new MotorPolicy
export const createMotorPolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await mongoose.startSession()
        let motorPolicy
        try {
            await session.withTransaction(async () => {
                //Validations
                const CarInputs = plainToClass(CreateCarInputs, req.body.Car)
                const MotorThirdpartyInputs = plainToClass(CreateMotorThirdpartyInputs, req.body.MotorThirdparty)
                const MotorPolicyInputs = plainToClass(CreateMotorPolicyInputs, req.body.MotorPolicy)
                const CarInputErrors = await validate(CarInputs, { validationError: { target: true } })
                const MotorThirdpartyInputsErrors = await validate(MotorThirdpartyInputs, { validationError: { target: true } })
                const MotorPolicyInputsErrors = await validate(MotorPolicyInputs, { validationError: { target: true } })

                if (CarInputErrors.length > 0 || MotorThirdpartyInputsErrors.length > 0 || MotorPolicyInputsErrors.length > 0) {
                    throw new BadRequestError('MotorPolicy Input validation error(s)', 'MotorPolicy/createMotorPolicy')
                }
                // const files = req.files as [Express.Multer.File]
                // const images = files.map((file: Express.Multer.File) => file.filename)

                const car = new Car(CarInputs)
                await car.save({ session })
                const motorThirdparty = new MotorThirdparty(MotorThirdpartyInputs)
                await motorThirdparty.save({ session })
                const convertedUserId = new mongoose.Types.ObjectId(req.User._id)

                const docmotorPolicy = {
                    user: convertedUserId,
                    car: car._id,
                    motorThirdparty: motorThirdparty._id,
                    ...MotorPolicyInputs,
                    // images
                }
                motorPolicy = new MotorPolicy(docmotorPolicy)
                await motorPolicy.save({ session })
            })
            return res.status(201).json(motorPolicy)
        } catch (err) {
            next(err)
        } finally {
            await session.endSession()
        }
    } catch (err) {
        next(err)
    }
}



// Function to get all MotorPolicies
export const getAllMotorPolicies = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const MotorPolicies = await MotorPolicy.find({ user: req.User._id })
        if (MotorPolicies) {
            return res.status(200).json(MotorPolicies)  // Return after successful response
        }
        throw new NotFoundError('MotorPolicys not Found', 'MotorPolicy/getAllMotorPolicies')
    } catch (err) {
        next(err)
    }
}

// Function to get a MotorPolicy by ID
export const getMotorPolicyById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    try {
        const motorPolicy = await MotorPolicy.findOne({ _id: id, user: req.User._id })
        if (motorPolicy) {
            return res.status(200).json(motorPolicy)  // Return after successful response
        }
        throw new NotFoundError('MotorPolicys not Found', 'MotorPolicy/getMotorPolicyById')
    } catch (err) {
        next(err)
    }
}

// Function to update a MotorPolicy by ID
export const updateMotorPolicy = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    try {
        const MotorPolicyInputs = plainToClass(CreateMotorPolicyInputs, req.body)
        const inputErrors = await validate(MotorPolicyInputs, { validationError: { target: true } })
        if (inputErrors.length > 0) {
            throw new BadRequestError('Invalid inputs', 'MotorPolicy/updateMotorPolicy')
        }
        const updatedMotorPolicy = await MotorPolicy.findByIdAndUpdate(id, MotorPolicyInputs, { new: true })
        if (updatedMotorPolicy) {
            return res.status(200).json(updatedMotorPolicy)  // Return after successful response
        }
        throw new NotFoundError('MotorPolicys not Found', 'MotorPolicy/updateMotorPolicy')
    } catch (err) {
        next(err)
    }
}

// Function to delete a MotorPolicy by ID
export const deleteMotorPolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await mongoose.startSession()
        try {
            await session.withTransaction(async () => {
                const motorPolicyId = req.params.id
                const motorPolicy = await MotorPolicy.findOne({ _id: motorPolicyId, user: req.User._id })

                if (motorPolicy) {
                    // Delete car and motorThirdparty references
                    const car = await Car.findOneAndDelete({ _id: motorPolicy.car }, { session })
                    const motorThirdparty = await MotorThirdparty.findOneAndDelete({ _id: motorPolicy.motorThirdparty }, { session })
                    const DmotorPolicy = await MotorPolicy.findOneAndDelete({ _id: motorPolicy._id }, { session })

                    if (car || motorThirdparty || DmotorPolicy) {
                        return res.status(200).json({ car, motorThirdparty, DmotorPolicy })  // Return after successful response
                    }
                }
                throw new NotFoundError('MotorPolicy not found or does not belong to the user', 'MotorPolicy/deleteMotorPolicy')
            })
        } catch (err) {
            next(err)
        } finally {
            await session.endSession()
        }
    } catch (err) {
        next(err)
    }
}


