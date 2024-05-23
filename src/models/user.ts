import mongoose, { Schema, Document } from "mongoose"

interface UserDoc extends Document {
    firstName: string
    lastName: string
    fullName: string
    email: string
    emiratesId: string
    dateOfBirth: Date
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
    providerId: string
}

const UserSchema = new Schema({
    firstName: { type: String },
    lastName: { type: String },
    fullName: { type: String },
    emiratesId: { type: String, unique: true },
    dateOfBirth: { type: Date },
    email: { type: String },
    password: { type: String },
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
    resetPasswordExpires: { type: Number },
    providerId: { type: String }
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

const User = mongoose.model<UserDoc>('User', UserSchema)

export { User }