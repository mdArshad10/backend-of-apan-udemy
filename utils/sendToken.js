
export const sendToken = (res,user,message,statusCode=200) =>{
    // this is the method in User
    const token = user.getJWTToken();

    const option = {
        expires: new Date(Date.now() + 1000*60*60*24*15),
        httpOnly: true,
        // because of this to propertites the cookies is empty
        // secure: true,
        // sameSite: "none"
    }

    res.status(statusCode).cookie("token",token,option).json({
        successful: true,
        message, 
        user
    })
}