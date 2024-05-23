import mongoose, { Schema, Document } from "mongoose"

interface RenewalPolicyDoc extends Document {
    name: string
    number: string
    date: Date
    amount: number
}

const renewalPolicySchema: Schema = new Schema({
    name: { type: String, required: true },
    number: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
})

const RenewalPolicy = mongoose.model<RenewalPolicyDoc>('RenewalPolicy', renewalPolicySchema)

export { RenewalPolicy }
