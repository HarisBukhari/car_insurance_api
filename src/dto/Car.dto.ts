import { Transform } from "class-transformer"
import { IsString, IsNumber, IsEnum, IsBoolean, IsDate, Length, IsOptional } from "class-validator"

export class CreateCarInputs {

    @IsString()
    make: string

    @IsString()
    carModel: string

    @IsString()
    bodyType: string

    @IsNumber()
    modelYear: number

    @IsString()
    trim: string

    @IsString()
    engineSize: string

    @IsString()
    transmission: string

    @IsEnum(['GCC', 'NON-GCC'])
    region: string

    @IsNumber()
    valueOfVehicle: number

    @IsNumber()
    cylinderCapacity: number

    @Transform(({ value }) => new Date(value))
    @IsDate()
    vehicleRegistrationDate: Date

    @IsBoolean()
    insuredAsTPLastYear: boolean

    @IsString()
    chassisNumber: string

    @IsString()
    color: string

    @IsString()
    placeOfRegistration: string

    @IsString()
    tcfNumber: string

    @IsString()
    bank: string

    @IsNumber()
    seatingCapacity: number
}


export class EditCarInputs {

    @IsString()
    color?: string

    @IsString()
    transmission?: string

    @IsString()
    placeOfRegistration?: string

    @IsString()
    bank?: string
}