import mongoose, { Schema, Document } from "mongoose"

interface MotorThirdpartyDoc extends Document {
  price: string
  personalAccidentCoverDriver: boolean
  thirdpartyBadlyInjuryDeathCover: boolean
  personalAccidentCoverPassenger: boolean
  roadSideAssistance: boolean
  thirdpartyPropertyDamageCover: boolean
  geographicalAreaUAE: boolean
}

const motorThirdpartySchema: Schema = new Schema({
  price: { type: String, required: true },
  personalAccidentCoverDriver: { type: Boolean, required: true },
  thirdpartyBadlyInjuryDeathCover: { type: Boolean, required: true },
  personalAccidentCoverPassenger: { type: Boolean, required: true },
  roadSideAssistance: { type: Boolean, required: true },
  thirdpartyPropertyDamageCover: { type: Boolean, required: true },
  geographicalAreaUAE: { type: Boolean, required: true },
})


const MotorThirdparty = mongoose.model<MotorThirdpartyDoc>('MotorThirdparty', motorThirdpartySchema)

export { MotorThirdparty }
