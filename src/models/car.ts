import mongoose, { Schema, Document } from "mongoose"

type Region = 'GCC' | 'NON-GCC'

interface CarDoc extends Document {
    make: string
    carModel: string
    bodyType: string
    modelYear: number
    trim: string
    engineSize: string
    transmission: string
    region: Region
    valueOfVehicle: number
    cylinderCapacity: number
    vehicleRegistrationDate: Date
    insuredAsTPLastYear: boolean
    chassisNumber: string
    color: string
    placeOfRegistration: string
    tcfNumber: string
    bank: string
    seatingCapacity: number
}

const carSchema = new Schema({
    make: { type: String },
    carModel: { type: String },
    bodyType: { type: String },
    modelYear: { type: Number },
    trim: { type: String },
    engineSize: { type: String },
    transmission: { type: String },
    region: {
        type: { type: String },
        enum: ['GCC', 'NON-GCC'],
    },
    valueOfVehicle: { type: Number },
    cylinderCapacity: { type: Number },
    vehicleRegistrationDate: { type: Date },
    insuredAsTPLastYear: { type: Boolean },
    chassisNumber: { type: String },
    color: { type: String },
    placeOfRegistration: { type: String },
    tcfNumber: { type: String },
    bank: { type: String },
    seatingCapacity: { type: Number },
})

const Car = mongoose.model<CarDoc>('Car', carSchema)

export { Car }