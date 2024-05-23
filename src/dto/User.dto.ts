import { IsEmail, Length } from "class-validator"

export class CreateUserInputs {

    @IsEmail()
    email: string

    @Length(7, 12)
    phone: string

    @Length(7, 12)
    password: string

    @Length(3, 16)
    firstName: string

    @Length(3, 16)
    lastName: string

    @Length(6, 30)
    address: string

    @Length(6, 30)
    emiratesId: string

}

export class EditUserInputs {

    @Length(3, 16)
    firstName: string

    @Length(3, 16)
    lastName: string

    @Length(6, 30)
    address: string

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


export class CartItem {
    _id: string
    unit: number
}


export class OrderInputs {
    txnId: string
    amount: string
    items: [CartItem]
}

export class CreateDeliveryUserInput {
    @IsEmail()
    email: string

    @Length(7,12)
    phone: string

    @Length(6,12)
    password: string

    @Length(3,12)
    firstName: string

    @Length(3,12)
    lastName: string

    @Length(6,24)
    address: string

    @Length(4,12)
    pincode: string
}