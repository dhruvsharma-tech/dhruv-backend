import dotenv from "dotenv"
dotenv.config();
import connestDB from "./db/db.js";
import { app } from "./app.js";


connestDB()
.then(app.listen(process.env.PORT||8000,()=>{
    console.log(`server is running on port: ${process.env.PORT}`)
}))
.catch((error)=>{
    console.log("mongoDB connection failed",error)
});