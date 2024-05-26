import { Request, Response, NextFunction } from "express"
import { Car, MotorThirdparty, MotorPolicy } from "../models"
import { plainToClass } from "class-transformer"
import { validate } from "class-validator"
import { CreateCarInputs, CreateMotorPolicyInputs, CreateMotorThirdpartyInputs } from "../dto"
import { BadRequestError, CustomError, NotFoundError } from "../error"
import mongoose from "mongoose"
import { promisify } from 'util'

// Function to create a new MotorPolicy
export const createMotorPolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await mongoose.startSession()
        const files = req.files as { [key: string]: Express.Multer.File[] }
        let FObj
        try {
            await session.withTransaction(async () => {
                //Validations
                const CarInputs = plainToClass(CreateCarInputs, JSON.parse(req.body.Car))
                const MotorThirdpartyInputs = plainToClass(CreateMotorThirdpartyInputs, JSON.parse(req.body.MotorThirdparty))
                const MotorPolicyInputs = plainToClass(CreateMotorPolicyInputs, JSON.parse(req.body.MotorPolicy))
                const CarInputErrors = await validate(CarInputs, { validationError: { target: true } })
                const MotorThirdpartyInputsErrors = await validate(MotorThirdpartyInputs, { validationError: { target: true } })
                const MotorPolicyInputsErrors = await validate(MotorPolicyInputs, { validationError: { target: true } })

                if (CarInputErrors.length > 0 || MotorThirdpartyInputsErrors.length > 0 || MotorPolicyInputsErrors.length > 0) {
                    throw new BadRequestError('MotorPolicy Input validation error(s)', 'MotorPolicy/createMotorPolicy')
                }
                if (!files) {
                    return res.status(400).send('No files uploaded!')
                }
                const { mulkiya_Hayaza, drivingLicense, emiratesID, mulkiya, lpo, drivingLicense_1, hayaza_1, passing_1, others_1, lpo_1 } = files
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
                    mulkiya_Hayaza: mulkiya_Hayaza?.[0]?.path || '',
                    drivingLicense: drivingLicense?.[0]?.path || '',
                    emiratesID: emiratesID?.[0]?.path || '',
                    mulkiya: mulkiya?.[0]?.path || '',
                    lpo: lpo?.[0]?.path || '',
                    drivingLicense_1: drivingLicense_1?.[0]?.path || '',
                    hayaza_1: hayaza_1?.[0]?.path || '',
                    passing_1: passing_1?.[0]?.path || '',
                    others_1: others_1?.[0]?.path || '',
                    lpo_1: lpo_1?.[0]?.path || ''
                }
                const motorPolicy = new MotorPolicy(docmotorPolicy)
                FObj = { car, motorThirdparty, motorPolicy }
                await motorPolicy.save({ session })
            })
            return res.status(201).json(FObj)
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
                    // Delete car and motorThirdparty references (existing code)
                    const car = await Car.findOneAndDelete({ _id: motorPolicy.car }, { session })
                    const motorThirdparty = await MotorThirdparty.findOneAndDelete({ _id: motorPolicy.motorThirdparty }, { session })

                    // Extract file paths from MotorPolicy object
                    const filePaths = [
                        motorPolicy.mulkiya_Hayaza,
                        motorPolicy.drivingLicense,
                        motorPolicy.emiratesID,
                        motorPolicy.mulkiya,
                        motorPolicy.lpo,
                        motorPolicy.drivingLicense_1,
                        motorPolicy.hayaza_1,
                        motorPolicy.passing_1,
                        motorPolicy.others_1,
                        motorPolicy.lpo_1
                    ]

                    // Function to delete a file using promises (cleaner approach)
                    const unlinkAsync = promisify(require('fs').unlink)

                    // Delete files concurrently (optional for performance)
                    const deletePromises = filePaths.filter(Boolean).map(async (filePath) => { // filter out empty paths
                        if (filePath) {
                            try {
                                await unlinkAsync(filePath)
                                console.log(`Deleted file: ${filePath}`) // Optional logging
                            } catch (error) {
                                console.error(`Error deleting file: ${filePath}`, error)
                            }
                        }
                    })

                    await Promise.all(deletePromises) // Wait for all deletions to finish

                    const deletedMotorPolicy = await MotorPolicy.findOneAndDelete({ _id: motorPolicy._id }, { session })

                    if (car || motorThirdparty || deletedMotorPolicy) {
                        return res.status(200).json({ car, motorThirdparty, deletedMotorPolicy })
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


