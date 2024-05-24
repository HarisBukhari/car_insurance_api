import { Request, Response, NextFunction } from "express"
import { Car } from "../models"
import { plainToClass } from "class-transformer"
import { validate } from "class-validator"
import { generateOtop, generateSalt, generateSign, hashPassword, requestOtp, verifyPassword } from "../utilities"
import { CreateUserInputs, UsersLogin, EditUserInputs } from "../dto"
import { BadRequestError, CustomError, NotFoundError } from "../error"
import sendEmail from "../services/EmailService"
import crypto from 'crypto'
import { CreateCarInputs, EditCarInputs } from "../dto/Car.dto"

// Function to create a new car
export const createCar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const CarInputs = plainToClass(CreateCarInputs, req.body)
        const inputErrors = await validate(CarInputs, { validationError: { target: true } })
        if (inputErrors.length > 0) {
            throw new BadRequestError('Input validation error', 'User/SignUp')
        }
        const { bank, bodyType, carModel, chassisNumber, color, cylinderCapacity, engineSize, insuredAsTPLastYear, make, modelYear, placeOfRegistration, region, seatingCapacity, tcfNumber, transmission, trim, valueOfVehicle, vehicleRegistrationDate } = CarInputs
        const car = await Car.create({
            make,
            carModel,
            bodyType,
            modelYear,
            trim,
            engineSize,
            transmission,
            region,
            valueOfVehicle,
            cylinderCapacity,
            vehicleRegistrationDate,
            insuredAsTPLastYear,
            chassisNumber,
            color,
            placeOfRegistration,
            tcfNumber,
            bank,
            seatingCapacity
        })
        if (car) {
            return res.status(201).json(car)
        } else {
            throw new CustomError('Database Error', 'Car/createCar')
        }
    } catch (error) {
        console.error(error)
        res.status(400).send('Error creating car')
    }
}

// Function to get all cars
export const getAllCars = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cars = await Car.find()
        if (cars) {
            return res.status(200).json(cars)  // Return after successful response
        }
        throw new NotFoundError('Cars not Found', 'Car/getAllCars')
    } catch (err) {
        next(err)
    }
}

// Function to get a car by ID
export const getCarById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    try {
        const car = await Car.findById(id)
        if (car) {
            return res.status(200).json(car)  // Return after successful response
        }
        throw new NotFoundError('Cars not Found', 'Car/getCarById')
    } catch (err) {
        next(err)
    }
}


// Function to update a car by ID
export const updateCar = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const CarInputs = plainToClass(EditCarInputs, req.body)
        const inputErrors = await validate(CarInputs, { validationError: { target: true } })
        if (inputErrors.length > 0) {
            throw new BadRequestError('Invalid inputs', 'Car/updateCar')
        }
        const updatedCar = await Car.findByIdAndUpdate(id, CarInputs, { new: true })
        if (updatedCar) {
            return res.status(200).json(updatedCar)  // Return after successful response
        }
        throw new NotFoundError('Cars not Found', 'Car/updateCar')
    } catch (err) {
        next(err)
    }
}

// Function to delete a car by ID
export const deleteCar = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    try {
        const deletedCar = await Car.findByIdAndDelete(id)
        if (deletedCar) {
            return res.status(204).json(deletedCar)  // Return after successful response
        }
        throw new NotFoundError('Cars not Found', 'Car/updateCar')
    } catch (err) {
        next(err)
    }
}
