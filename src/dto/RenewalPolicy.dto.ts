import { Transform } from 'class-transformer'
import { IsString, IsDate, IsNumber } from 'class-validator'

export class CreateRenewalPolicyInputs {
    @IsString()
    name: string

    @IsString()
    number: string

    @Transform(({ value }) => new Date(value))
    @IsDate()
    date: Date

    @IsNumber()
    amount: number
}
