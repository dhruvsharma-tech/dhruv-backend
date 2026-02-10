import mongoose from "mongoose";

const connestDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`mongodb connected successfully.... HOST: ${connectionInstance.connection.host}`)
        
    } catch (error) {
        console.log("mongoDB connection error..!!", error)
        process.exit(1)
    }
}

export default connestDB