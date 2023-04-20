import mongoose from "mongoose";

export const connectDB = async() =>{
    try {
       const {connection} = await mongoose.connect(process.env.MONGO_URL)
        console.log(`MongoDB connected with host ${connection.host}`,{
            useNewUrlParser: true,
            useFindAndModify: false,
            useUnifiedTopology: true
          });
    } catch (error) {
       console.log(`the Error is => ${error}`);
    }
}