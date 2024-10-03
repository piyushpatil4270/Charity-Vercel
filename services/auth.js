const express=require("express")
const bcrypt=require("bcrypt")
const users=require("../models/user")
const jwt=require("jsonwebtoken")
require("dotenv").config()




exports.handleSignup=async(body)=>{
    const {name,email,password}=body
    const existingUser=await users.findOne({where:{email:email}})
    if(existingUser) return 1
    const hasdhedPass=await bcrypt.hash(password,10)
    const user=await users.create({
        name:name,
        email:email,
        password:hasdhedPass
   })
   return 2
}



exports.handleSignIn=async(body)=>{
    const {email,password}=body
    const existingUser=await users.findOne({email:email})
    if(!existingUser) return 1
    const match= await bcrypt.compare(password,existingUser.password)
    if(!match) return 2
    const token=jwt.sign({userId:existingUser.id},process.env.JWT_SECRETKEY)
    return {msg:"Login successfull",token:token,userId:existingUser.id,isAdmin:existingUser.isAdmin}
}


exports.handleGetUser=async(userId)=>{
const user=await users.findByPk(userId)
return user
}


exports.handleChangePassword=async(body)=>{
    const {userId,oldPassword,newPassword}=body
    const user=await users.findByPk(userId)
    if(!user) return 1
    const match=await bcrypt.compare(oldPassword,user.password)
    if(!match) return 2
    const hasdhedPass=await bcrypt.hash(newPassword,10)
    const [updatedPass]=await users.update({password:hasdhedPass},{where:{id:userId}})
    return 3
}