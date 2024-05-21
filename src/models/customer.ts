import mongoose, { Schema, Document, Model } from "mongoose"

interface CustomerDoc extends Document {
    firstName: string
    lastName: string
    email: string
    password: string
    address: string
    phone: string
    salt: string
    verified: boolean
    otp: number
    otp_expiry: Date
    lat: number
    lng: number
    provider: string
    resetPasswordToken: string
    resetPasswordExpires: number
}

const CustomerSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    password: { type: String},
    address: { type: String },
    phone: { type: String },
    salt: { type: String },
    verified: { type: Boolean },
    otp: { type: String },
    otp_expiry: { type: Date }, 
    lat: { type: Number },
    lng: { type: Number },
    provider: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Number }

}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password
            delete ret.salt
            delete ret.__v
            delete ret.createdAt
            delete ret.updatedAt
        }
    },
    timestamps: true
})

const Customer = mongoose.model<CustomerDoc>('Customer', CustomerSchema)

export { Customer }