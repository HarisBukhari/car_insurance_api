import { Transform } from 'class-transformer'
import { IsString, IsBoolean, IsDate, IsOptional, IsNumber, IsEnum } from 'class-validator'

export class CreateClaimInputs {

    @IsBoolean()
    isVehicleInsuredByUs: boolean

    @IsOptional()
    @IsString()
    policyNumber?: string

    @Transform(({ value }) => new Date(value))
    @IsDate()
    dateOfAccident: Date

    @IsOptional()
    @IsString()
    policeReportNumber?: string

    @IsString()
    insuredName: string

    @IsString()
    registrationNumber: string

    @IsString()
    make: string

    @IsString()
    carModel: string

    @IsNumber()
    modelYear: number

    @IsOptional()
    @IsString()
    chassisNumber?: string

    @IsOptional()
    @IsString()
    licenseNumber?: string

    @IsOptional()
    @IsString()
    driverNationality?: string

    @IsOptional()
    @IsString()
    driverEmail?: string

    @IsString()
    placeOfAccident: string

    @IsString()
    policyType: string

    @IsString()
    claimantName: string

    @IsOptional()
    @IsString()
    claimantEmiratesId?: string

    @IsOptional()
    @IsString()
    thirdPartyVehicleMake?: string

    @IsOptional()
    @IsString()
    thirdPartyVehicleModel?: string

    @IsOptional()
    @IsNumber()
    thirdPartyVehicleModelYear?: number

    @IsOptional()
    @IsString()
    thirdPartyVehicleChassisNumber?: string

    @IsOptional()
    @IsString()
    thirdPartyDriverName?: string

    @IsOptional()
    @IsString()
    thirdPartyDriverLicenseNumber?: string

    @IsOptional()
    @IsString()
    thirdPartyDriverNationality?: string

    @IsOptional()
    @IsString()
    thirdPartyDriverEmail?: string
}
