import { Request, Response, NextFunction } from "express"
import { Car, MotorThirdparty, MotorPolicy } from "../models"
import { plainToClass } from "class-transformer"
import { validate } from "class-validator"
import { CreateCarInputs, CreateMotorPolicyInputs, CreateMotorThirdpartyInputs } from "../dto"
import { BadRequestError, CustomError, NotFoundError } from "../error"
import mongoose from "mongoose"
import { ReadPreference, WriteConcern } from "mongodb"

// Function to create a new MotorPolicy
export const createMotorPolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await mongoose.startSession()
        let docmotorPolicy
        try {
            // const transactionOptions = {
            //     readPreference: ReadPreference.primary,
            //     writeConcern: { w: 'majority' },
            // }
            await session.withTransaction(async () => {
                const CarInputs = plainToClass(CreateCarInputs, req.body.car)
                const MotorThirdpartyInputs = plainToClass(CreateMotorThirdpartyInputs, req.body.MotorThirdparty)
                const MotorPolicyInputs = plainToClass(CreateMotorPolicyInputs, req.body.MotorPolicy)
                const CarInputErrors = await validate(CarInputs, { validationError: { target: true } })
                const MotorThirdpartyInputsErrors = await validate(MotorThirdpartyInputs, { validationError: { target: true } })
                const MotorPolicyInputsErrors = await validate(MotorPolicyInputs, { validationError: { target: true } })
                if (CarInputErrors.length > 0) {
                    throw new BadRequestError('Car Input validation error', 'MotorPolicy/createMotorPolicy')
                }
                if (MotorThirdpartyInputsErrors.length > 0) {
                    throw new BadRequestError('MotorThirdparty Input validation error', 'MotorPolicy/createMotorPolicy')
                }
                if (MotorPolicyInputsErrors.length > 0) {
                    throw new BadRequestError('MotorPolicy Input validation error', 'MotorPolicy/createMotorPolicy')
                }
                const carCollection = mongoose.connection.db.collection('cars')
                const motorThirdpartyCollection = mongoose.connection.db.collection('motorThirdparty')
                const motorPolicyCollection = mongoose.connection.db.collection('motorPolicy')

                const car = await carCollection.insertOne(CarInputs, { session })
                const motorThirdparty = await motorThirdpartyCollection.insertOne(MotorThirdpartyInputs, { session })
                const convertedUserId = new mongoose.Types.ObjectId(req.User._id)

                docmotorPolicy = {
                    user: convertedUserId,
                    car: car.insertedId,
                    motorThirdparty: motorThirdparty.insertedId,
                    ...MotorPolicyInputs
                }

                await motorPolicyCollection.insertOne(docmotorPolicy, { session })
            })
            return res.status(201).json(docmotorPolicy)
        } catch (error) {
            console.error(error)
            throw error // Re-throw to trigger catch block outside transaction
        } finally {
            await session.endSession()
        }
    } catch (error) {
        console.error(error)
        res.status(400).send('Error creating MotorPolicy')
    }
}



// Function to get all MotorPolicys
export const getAllMotorPolicys = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const motorPolicys = await MotorPolicy.find()
        if (motorPolicys) {
            return res.status(200).json(motorPolicys)  // Return after successful response
        }
        throw new NotFoundError('MotorPolicys not Found', 'MotorPolicy/getAllMotorPolicys')
    } catch (err) {
        next(err)
    }
}

// Function to get a MotorPolicy by ID
export const getMotorPolicyById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    try {
        const motorPolicys = await MotorPolicy.findById(id)
        if (motorPolicys) {
            return res.status(200).json(motorPolicys)  // Return after successful response
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
    const { id } = req.params
    try {
        const deletedMotorPolicy = await MotorPolicy.findByIdAndDelete(id)
        if (deletedMotorPolicy) {
            return res.status(204).json(deletedMotorPolicy)  // Return after successful response
        }
        throw new NotFoundError('MotorPolicys not Found', 'MotorPolicy/deleteMotorPolicy')
    } catch (err) {
        next(err)
    }
}