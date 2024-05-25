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
                const CarInputs = plainToClass(CreateCarInputs, req.body.car)
                const MotorThirdpartyInputs = plainToClass(CreateMotorThirdpartyInputs, req.body.MotorThirdparty)
                const MotorPolicyInputs = plainToClass(CreateMotorPolicyInputs, req.body.MotorPolicy)
                const CarInputErrors = await validate(CarInputs, { validationError: { target: true } })
                const MotorThirdpartyInputsErrors = await validate(MotorThirdpartyInputs, { validationError: { target: true } })
                const MotorPolicyInputsErrors = await validate(MotorPolicyInputs, { validationError: { target: true } })

                if (CarInputErrors.length > 0 || MotorThirdpartyInputsErrors.length > 0 || MotorPolicyInputsErrors.length > 0) {
                    throw new BadRequestError('MotorPolicy Input validation error(s)', 'MotorPolicy/createMotorPolicy');
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
// export const deleteMotorPolicy = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const session = await mongoose.startSession();

//         await session.withTransaction(async () => {
//             const motorPolicyId = req.params._id;
//             const motorPolicyCollection = MotorPolicy;
//             const motorPolicy = await motorPolicyCollection.findOne({ _id: motorPolicyId, user: req.user._id });

//             if (!motorPolicy) {
//                 throw new NotFoundError('MotorPolicy not found or does not belong to the user', 'MotorPolicy/deleteMotorPolicy');
//             }

//             // Delete car and motorThirdparty references
//             const carId = motorPolicy.car;
//             const motorThirdpartyId = motorPolicy.motorThirdparty;

//             const carCollection = mongoose.connection.db.collection('cars');
//             const motorThirdpartyCollection = mongoose.connection.db.collection('motorThirdparty');

//             await carCollection.deleteOne({ _id: carId }, { session });
//             await motorThirdpartyCollection.deleteOne({ _id: motorThirdpartyId }, { session });

//             // Delete the motorPolicy
//             await motorPolicyCollection.deleteOne({ _id: convertedMotorPolicyId }, { session });
//         });

//         return res.status(200).json({ message: 'MotorPolicy deleted successfully' });
//     } catch (err) {
//         next(err);
//     } finally {
//         await session.endSession();
//     }
// };


// export const DcreateMotorPolicy = async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         const session = await mongoose.startSession()
//         let docmotorPolicy
//         try {
//             await session.withTransaction(async () => {

//                 const motorPolicyId = req.params._id;
//                 const motorPolicyCollection = mongoose.connection.db.collection('motorPolicy');
//                 const motorPolicy = await motorPolicyCollection.findOne({ _id: motorPolicyId, user: req.user._id });

//                 const CarInputs = plainToClass(CreateCarInputs, req.body.car)
//                 const MotorThirdpartyInputs = plainToClass(CreateMotorThirdpartyInputs, req.body.MotorThirdparty)
//                 const MotorPolicyInputs = plainToClass(CreateMotorPolicyInputs, req.body.MotorPolicy)
//                 const CarInputErrors = await validate(CarInputs, { validationError: { target: true } })
//                 const MotorThirdpartyInputsErrors = await validate(MotorThirdpartyInputs, { validationError: { target: true } })
//                 const MotorPolicyInputsErrors = await validate(MotorPolicyInputs, { validationError: { target: true } })

//                 if (CarInputErrors.length > 0 || MotorThirdpartyInputsErrors.length > 0 || MotorPolicyInputsErrors.length > 0) {
//                     throw new BadRequestError('MotorPolicy Input validation error(s)', 'MotorPolicy/createMotorPolicy');
//                 }

//                 const carCollection = mongoose.connection.db.collection('cars')
//                 const motorThirdpartyCollection = mongoose.connection.db.collection('motorThirdparty')
//                 // const motorPolicyCollection = mongoose.connection.db.collection('motorPolicy')

//                 const car = await carCollection.insertOne(CarInputs, { session })
//                 const motorThirdparty = await motorThirdpartyCollection.insertOne(MotorThirdpartyInputs, { session })
//                 const convertedUserId = new mongoose.Types.ObjectId(req.User._id)

//                 docmotorPolicy = {
//                     user: convertedUserId,
//                     car: car.insertedId,
//                     motorThirdparty: motorThirdparty.insertedId,
//                     ...MotorPolicyInputs
//                 }

//                 await motorPolicyCollection.insertOne(docmotorPolicy, { session })
//             })
//             return res.status(201).json(docmotorPolicy)
//         } catch (err) {
//             next(err)
//         } finally {
//             await session.endSession()
//         }
//     } catch (err) {
//         next(err)
//     }
// }