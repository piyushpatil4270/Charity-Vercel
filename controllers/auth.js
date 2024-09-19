const express=require("express")
const router=express.Router()
const bcrypt=require("bcrypt")
const users=require("../models/user")
const jwt=require("jsonwebtoken")
const sequelize=require("sequelize")
const db=require("../utils/db")



const secretKey="jskfjaiopksfjlk"

const changePassword=async(req,res,next)=>{
  const transaction=await db.transaction()
    try {
      const {userId,oldPassword,newPassword}=req.body
      const user=await users.findByPk(userId)
      if(!user) return res.status(200).json("User not found")
       
        const match=await bcrypt.compare(oldPassword,user.password)
      if(!match){
        
          return res.status(201).json("Incorrect password")
      }
  
      const hasdhedPass = await bcrypt.hash(newPassword, 10);
      const [updatedPass]=await users.update({password:hasdhedPass},{where:{id:userId}})
     
      if(updatedPass) res.status(202).json("Password updated succesfully")
       await transaction.commit()
    } catch (error) {
      console.log("Error: ",error)
      
      res.status(404).json("An error occured try again")
      await transaction.rollback()
    }
  }



const getUser=async(req,res,next)=>{
  const transaction=await db.transaction()
    try {
      const {userId}=req.body
      const user=await users.findByPk(userId)
      
      res.status(202).json(user)
      await transaction.commit()
    } catch (error) {
    
      console.log(error)
      res.status(404).json("An error occured try again")
      await transaction.rollback()
    }
}



const signUp=async(req,res,next)=>{
  const transaction=await db.transaction()
    try {
      const {name,email,password}=req.body
      const existingUser=await users.findOne({where:{email:email}})
      if(existingUser)return res.status(200).json("User with email already exists")
      const hasdhedPass = await bcrypt.hash(password, 10);
      const user=await users.create({
       name:name,
       email:email,
       password:hasdhedPass
  })
 
  res.status(202).json("User registered succesfully")
  await transaction.commit()
    } catch (error) {
      
      console.log("error: ",error)
      res.status(404).json("An error occured try again")
      await transaction.rollback()
    }
  }


  const signIn=async(req,res,next)=>{
    const transaction=await db.transaction()
    try {
        const {email,password}=req.body
        const user=await users.findOne({where:{email:email}})
        if(!user){
            return res.status(200).json("Enter valid email")
        }
        const match=await bcrypt.compare(password,user.password)
        if(!match){
            return res.status(201).json("Incorrect password")
        }
        const token=jwt.sign({userId:user.id},secretKey)
        console.log("Login token is ",token)
  
       res.status(202).json({msg:"Login successfull",token:token,userId:user.id,isAdmin:user.isAdmin})
       await transaction.commit()
    } catch (error) {
        console.log("error: ",error)
     
        res.status(404).json("An error occured try again")
        await transaction.rollback()
    }
  }



  module.exports={changePassword,getUser,signUp,signIn}