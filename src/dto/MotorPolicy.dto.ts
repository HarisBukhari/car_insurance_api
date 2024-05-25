import { Transform } from 'class-transformer'
import { IsString, IsDate, IsOptional, IsEnum } from 'class-validator'

export class CreateMotorPolicyInputs {
    // @IsString()
    // readonly user: string // Here you should use the actual type 'mongoose.Schema.Types.ObjectId' but for DTO it  works better as string

    // @IsString()
    // readonly car: string // Here you should use the actual type 'mongoose.Schema.Types.ObjectId' but for DTO it  works better as string

    // // Optional Motor Thirdparty Information (if applicable)
    // @IsOptional()
    // @IsString()
    // motorThirdparty?: string // Here you should use the actual type 'mongoose.Schema.Types.ObjectId' but for DTO it  works better as string

    // Step 3 Driver Information
    @IsString()
    fullName: string

    @IsOptional()
    @IsString()
    lastName?: string

    @IsString()
    insuredMobile: string

    @IsString()
    email: string

    @IsString()
    driverName: string

    @IsEnum(['MALE', 'FEMALE'])
    gender: string

    @IsString()
    nationality: string

    @Transform(({ value }) => new Date(value))
    @IsDate()
    dateOfBirth: Date

    @Transform(({ value }) => new Date(value))
    @IsDate()
    policyFromDate: Date

    @Transform(({ value }) => new Date(value))
    @IsDate()
    policyToDate: Date

    @Transform(({ value }) => new Date(value))
    @IsDate()
    licenseIssueDate: Date

    @Transform(({ value }) => new Date(value))
    @IsDate()
    licenseExpiryDate: Date

    // Step 4 Policy Information (Car model information likely handled elsewhere)

    // Step 5 Document Uploads (handled separately)

    @IsOptional()
    @IsString()
    policyNumber?: string

    @IsEnum(['Pending', 'Processing', 'Approved', 'Rejected'])
    status: string
}
