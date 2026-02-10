import jwt from "jsonwebtoken";
import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { User } from "../models/user.model.js";


const JWT_verify=asyncHandler(async(req,res,next)=>{
    const token=req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","");
    if(!token){
        throw new ApiError(401,"token not found")
    }

    const decode=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)



    const user=await User.findById(decode?._id)

    if(!user){
        throw new ApiError(401,"user not found")
    }

    req.user=user;
    next()
})

export {JWT_verify}