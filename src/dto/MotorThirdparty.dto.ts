import { IsString, IsBoolean } from 'class-validator'

export class CreateMotorThirdpartyInputs {
    @IsString()
    price: string

    @IsBoolean()
    personalAccidentCoverDriver: boolean

    @IsBoolean()
    thirdpartyBadlyInjuryDeathCover: boolean

    @IsBoolean()
    personalAccidentCoverPassenger: boolean

    @IsBoolean()
    roadSideAssistance: boolean

    @IsBoolean()
    thirdpartyPropertyDamageCover: boolean

    @IsBoolean()
    geographicalAreaUAE: boolean
}
