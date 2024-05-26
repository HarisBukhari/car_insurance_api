import mongoose, { Schema, Document, ObjectId } from "mongoose"

type Gender = 'MALE' | 'FEMALE'
type Status = 'Pending' | 'Processing' | 'Approved' | 'Rejected'

interface MotorPolicyDoc extends Document {
    user: ObjectId
    car: ObjectId
    motorThirdparty?: ObjectId
    fullName?: string
    lastName?: string
    insuredMobile?: string
    email?: string
    driverName?: string
    gender?: Gender
    nationality?: string
    dateOfBirth?: Date
    policyFromDate?: Date
    policyToDate?: Date
    licenseIssueDate?: Date
    licenseExpiryDate?: Date
    policyNumber?: string
    status?: Status
    image?: string
}


const motorPolicySchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    car: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true,
    },
    // Step 2 Details
    motorThirdparty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MotorThirdparty',
    },
    // Step 3 Driver Information
    fullName: { type: String },
    lastName: { type: String },
    insuredMobile: { type: String },
    email: { type: String },
    driverName: { type: String },
    gender: {
        type: { type: String },
        enum: ['MALE', 'FEMALE'],
    },
    nationality: { type: String },
    dateOfBirth: { type: Date },
    policyFromDate: { type: Date },
    policyToDate: { type: Date },
    licenseIssueDate: { type: Date },
    licenseExpiryDate: { type: Date },
    // Step 4 Policy Information
    // Car model already have the properties

    // Step 5 Document Uploads (handled separately)
    // Additional fields
    policyNumber: { type: String },
    status: {
        type: { type: String },
        enum: ['Pending', 'Processing', 'Approved', 'Rejected'],
    },
    image: { type: String }
})

const MotorPolicy = mongoose.model<MotorPolicyDoc>('MotorPolicy', motorPolicySchema)

export { MotorPolicy }
