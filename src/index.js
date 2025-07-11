
import dotenv from "dotenv"; 
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.on("error", (err) => {
        console.log("ERROR: ", err);
        throw error
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at port: ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO DB connection failed !!!", error);
})



/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";

( async () => {
    try {
        await mongoose.connect(`${process.eventNames.MONGODB_URI}/${DB_NAME}`)
    } catch (error) {
        console.error("ERROR: ", error)
        throw err
    }
})()
*/