import { Request, Response, NextFunction } from "express"
import { Car, MotorThirdparty, MotorPolicy } from "../models"
import { plainToClass } from "class-transformer"
import { validate } from "class-validator"
import { CreateCarInputs, CreateMotorPolicyInputs, CreateMotorThirdpartyInputs } from "../dto"
import { BadRequestError, CustomError, NotFoundError } from "../error"
import mongoose from "mongoose"
import { promisify } from 'util'

// AH_F
const fs = require('fs').promises
const MAX_RETRIES = 3


// Function to create a new MotorPolicy
export const createMotorPolicy = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await mongoose.startSession()
        let FObj: any
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
                const car = new Car(CarInputs)
                await car.save({ session })
                const motorThirdparty = new MotorThirdparty(MotorThirdpartyInputs)
                await motorThirdparty.save({ session })
                const convertedUserId = new mongoose.Types.ObjectId(req.User._id)

                const docmotorPolicy = {
                    user: convertedUserId,
                    car: car._id,
                    motorThirdparty: motorThirdparty._id,
                    ...MotorPolicyInputs
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
// Function for images
export const imageHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const files = req.files as { [key: string]: Express.Multer.File[] }
        const fileArray = []
        const oldFileArray = []
        for (const key in files) {
            fileArray.push(files[key]?.[0]?.path)
        }
        const motorPolicyId = req.params.id
        const motorPolicy = await MotorPolicy.findOne({ _id: motorPolicyId, user: req.User._id })
        if (motorPolicy) {
            // Delete car and motorThirdparty references (existing code)
            if (!files) {
                return res.status(400).send('No files uploaded!')
            }
            // Add new files
            for (const key in files) {
                if (motorPolicy[key]) oldFileArray.push(motorPolicy[key])
                motorPolicy[key] = files[key]?.[0]?.path
            }
            const result = await motorPolicy.save()
            if (result) {
                if(oldFileArray.length > 0){
                    await deleteImages(oldFileArray)
                }
                return res.status(200).json(result)
            }
            throw new CustomError('Something Went Wrong', 'MotorPolicy/imageHandler')
        }
        await deleteImages(fileArray)
        throw new NotFoundError('MotorPolicy not found or does not belong to the user', 'MotorPolicy/deleteMotorPolicy')
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
                    const filePaths = []
                    // Loop through desired properties of motorPolicy
                    const properties = [
                        "mulkiya_Hayaza",
                        "drivingLicense",
                        "emiratesID",
                        "mulkiya",
                        "lpo",
                        "drivingLicense_1",
                        "hayaza_1",
                        "passing_1",
                        "others_1",
                        "lpo_1",
                    ]
                    properties.forEach((prop) => {
                        if (motorPolicy[prop]) {
                            filePaths.push(motorPolicy[prop])
                        }
                    })
                    // Delete images (existing code)
                    await deleteImages(filePaths)
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


const deleteImages = async (filePaths: string[]) => {
    try {
        const validPaths = filePaths.filter(Boolean);

        if (!validPaths.length) {
            console.log('No valid file paths provided for deletion.');
            return;
        }

        const deletionPromises = validPaths.map(async (filePath, index) => {
            let retryCount = 0;
            while (retryCount < MAX_RETRIES) {
                try {
                    await fs.unlink(filePath);
                    console.log(`Deleted file: ${filePath}`);
                    break; // Exit loop on successful deletion
                } catch (error) {
                    retryCount++;
                    console.error(`Error deleting file: ${filePath} (attempt ${retryCount}/${MAX_RETRIES})`, error);
                    // Consider additional actions based on error type (e.g., exponential backoff)
                }
            }

            if (retryCount === MAX_RETRIES) {
                console.error(`Failed to delete file after ${MAX_RETRIES} retries: ${filePath}`);
                // Consider throwing an error or taking alternative actions
            }
        });

        await Promise.all(deletionPromises);

    } catch (error) {
        console.error('Unexpected error during deletion:', error);
        // Handle unexpected errors outside the retry logic
    }
}