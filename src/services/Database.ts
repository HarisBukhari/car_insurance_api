import mongoose from "mongoose"

export default async () => {
    try {
        await mongoose.connect(process.env.mongoDB_URI)
        console.log('Connected to MongoDB')
    } catch (err) {
        console.error('Error connecting to MongoDB:', err)

    }
}


