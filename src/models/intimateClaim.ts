import mongoose, { Schema, Document, ObjectId } from "mongoose"

interface ClaimDoc extends Document {
    user: ObjectId
    isVehicleInsuredByUs: boolean
    policyNumber?: string
    dateOfAccident: Date
    policeReportNumber?: string
    insuredName?: string
    registrationNumber?: string
    make?: string
    carModel?: string
    modelYear?: number
    chassisNumber?: string
    licenseNumber?: string
    driverNationality?: string
    driverEmail?: string
    placeOfAccident?: string
    policyType?: string
    claimantName?: string
    claimantEmiratesId?: string
    thirdPartyVehicleMake?: string
    thirdPartyVehicleModel?: string
    thirdPartyVehicleModelYear?: number
    thirdPartyVehicleChassisNumber?: string
    thirdPartyDriverName?: string
    thirdPartyDriverLicenseNumber?: string
    thirdPartyDriverNationality?: string
    thirdPartyDriverEmail?: string
}

const claimSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isVehicleInsuredByUs: {
        type: Boolean,
        required: true,
    },
    policyNumber: { type: String },
    dateOfAccident: {
        type: Date,
        required: true,
    },
    policeReportNumber: { type: String },
    insuredName: { type: String },
    registrationNumber: { type: String },
    make: { type: String },
    carModel: { type: String },
    modelYear: { type: Number },
    chassisNumber: { type: String },
    licenseNumber: { type: String },
    driverNationality: { type: String },
    driverEmail: { type: String },
    placeOfAccident: { type: String },
    policyType: { type: String },
    claimantName: { type: String },
    claimantEmiratesId: { type: String },
    thirdPartyVehicleMake: { type: String },
    thirdPartyVehicleModel: { type: String },
    thirdPartyVehicleModelYear: { type: Number },
    thirdPartyVehicleChassisNumber: { type: String },
    thirdPartyDriverName: { type: String },
    thirdPartyDriverLicenseNumber: { type: String },
    thirdPartyDriverNationality: { type: String },
    thirdPartyDriverEmail: { type: String },
})

const ClaimModel = mongoose.model<ClaimDoc>('ClaimModel', claimSchema)

export { ClaimModel }