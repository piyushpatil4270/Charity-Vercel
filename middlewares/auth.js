const secretKey="jskfjaiopksfjlk"
const users=require("../models/user")
const jwt=require("jsonwebtoken")
const authenticate=async(req,res,next)=>{
const userToken=req.header("Authorization")
if(!userToken) return res.status(400).json("You are not authorized to access the resources")
try {

    try {
        const decryptedToken=jwt.verify(userToken,secretKey)
        console.log("The decrypted token is ",userToken)
        const  userId=decryptedToken.userId
        console.log("USERID is ",userId)
        const existingUser=await users.findOne({where:{id:userId}})
        if(!existingUser) return res.status(403).json("User not found")
        req.user=existingUser
        console.log("middleware set ")
        next()
      
    } catch (error) {
        res.status(402).json("You are not authorized to access the resources")
    }
    
} catch (error) {
    res.status(401).json("User not authorized")
}
}



module.exports=authenticate