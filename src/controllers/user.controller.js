import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"


const registerUser=asyncHandler(async (req,res)=>{
    const {fullName,email,userName,password}=req.body
    if(!fullName?.trim()||!email?.trim()||!userName?.trim()||!password?.trim()){
        throw new ApiError(400 ,"all field are required")
    }

    const existedUser=await User.findOne({
        $or:[{userName},{email}]
    });

    if(existedUser){
        throw new ApiError(400, "user is already exist")
    }

    const avatarlocalPath=req.files?.avatar[0]?.path
    
    let coverImagelocalPath;
    if(
        req.files&&
        req.files.coverImage&&
        Array.isArray(req.files.coverImage)&&
        req.files.coverImage.length>0
    )
    coverImagelocalPath=req.files?.coverImage[0]?.path

    if(!avatarlocalPath){
        throw new ApiError(400, "avatar is required ")
    }

    
const avatar = await uploadOnCloudinary(avatarlocalPath);

let coverImage=null;
if (coverImagelocalPath) {
  coverImage = await uploadOnCloudinary(coverImagelocalPath);
}


    if(!avatar){
        throw new ApiError (400 , "avatar is required")
          
    }
    const user=await User.create({
        fullName,
        userName:userName.toLowerCase(),
        email,
        avatar:avatar?.url,
        coverImage:coverImage?.url||"",
        password,
        

    })

    const createdUser=await User.findById(user._id)
    .select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500 , "something went wrong user is not created");
    }

    return res.status(200).json(
        new ApiResponse(200 , createdUser ,"success: True,  user is created successfully")
    )
})


const generateAccessTokenAndRefreshToken=async (userId)=>{
    const user=await User.findById(userId)

    if(!user){
        throw new ApiError(400, "user not found");
    }

    const accessToken=user.generateAccessToken()
    const refreshToken=user.generateRefreshToken();

    user.refreshToken=refreshToken;
    await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken};
}

const loginUser =asyncHandler(async(req, res)=>{
    const {email,userName,password}=req.body;

    if(!email?.trim()||!userName?.trim()||!password?.trim()){
        throw new ApiError(400, "all field are require");
    }

    const user=await User.findOne({
        $or:[{userName},{email}]
    })

    if(!user){
        throw new ApiError(400, "user not found");
    }

    const passwordCorrect=await user.isPasswordCorrect(password);
    if(!passwordCorrect){
        throw new ApiError(400, "password is inCorrect")
    }

    const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id)

    const loggedinUser=await User.findById(user._id).select("-password -refreshToken")

     const cookieOptions={
        httpOnly:true,
        secure:true

    }

    res.status(200)
    .cookie("accessToken",accessToken,cookieOptions)
    .cookie("refreshToken",refreshToken,cookieOptions)
    .json(new ApiResponse(200,loggedinUser,"user is loggedIn successfully"))

    
})

const logOut =asyncHandler(async(req,res)=>{
    const user =await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{refreshToken:undefined}
        },
        {
            new:true
        }
    )

    const cookieOptions={
        httpOnly:true,
        secure:true

    }

    res.clearCookie("accessToken",cookieOptions)
    .clearCookie("refreshToken",cookieOptions)
    .json(new ApiResponse(200,{},"user loggedOut successfully"))
    
})

const refreshAccessToken=asyncHandler(async(req, res)=>{
    const incomingToken=req.cookies?.refreshToken||req.body.refreshToken;

    if(!incomingToken){
        throw new ApiError(401,"invalid refresh token")
    }

    try {
        const decoded= jwt.verify(incomingToken,process.env.REFRESH_TOKEN_SECRET);
    
        const user=await User.findById(decoded?._id)
    
        if(!user){
            throw new ApiError(401,"user not found")
        };
    
        if(user.refreshToken!==incomingToken){
            throw new ApiError(401,"invalid refresh token")
        }
    
        const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id)
    
        const cookieOptions={
            httpOnly:true,
            secure:true
        }
    
        res.status(200)
        .cookie("accessToken",accessToken,cookieOptions)
        .cookie("refreshToken",refreshToken, cookieOptions)
        .json(new ApiResponse(200,
            {accessToken,refreshToken},
            "new access token generated successfully"
        ))
    } catch (error) {
        throw new ApiError(401, error?.message||"invalid refresh token")
        
    }
})

    

   

    


export {registerUser, loginUser,logOut,refreshAccessToken}