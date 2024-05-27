import { Transform } from "class-transformer"
import { IsDate, IsEmail, Length } from "class-validator"

export class CreateUserInputs {

    @IsEmail()
    email: string

    @Length(7, 12)
    phone: string

    @Length(7, 12)
    password: string

    @Length(3, 20)
    fullName: string

    @Length(4, 30)
    emiratesId: string

    @Transform(({ value }) => new Date(value))
    @IsDate()
    dateOfBirth: Date

}

export class EditUserInputs {

    @Length(3, 16)
    fullName: string

    @IsEmail()
    email: string

    @Length(6, 30)
    address: string

    @Length(4, 30)
    emiratesId: string

    @Length(7, 12)
    phone: string

    @Transform(({ value }) => new Date(value))
    @IsDate()
    dateOfBirth: Date
    
}

export interface UserPayload {
    _id: string
    email: string
    verified: Boolean
}

export class UsersLogin {
    @IsEmail()
    email: string

    @Length(7, 12)
    password: string
}