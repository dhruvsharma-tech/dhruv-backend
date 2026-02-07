const asyncHandler=(fn)=>{
    return async(req,res,next)=>{
        try {
            await fn(res,res,next)    
        } catch (error) {
            res.status(error.code||500).json({
                seccess:false,
                message:error.message
            })
        }
    }
}

export{asyncHandler}