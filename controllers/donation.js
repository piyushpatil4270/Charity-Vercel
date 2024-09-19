const donations=require("../models/donations")
const campaigns = require("../models/campaigns")
const {Sequelize}=require("sequelize")
const db=require("../utils/db")

const getUserDonations=async(req,res,next)=>{
    const transaction=await db.transaction()
    try {
        const userId=req.user.id
        const {page,items}=req.body
        const skip=(page-1)*items
        const {rows,count}=await donations.findAndCountAll({where:{userId:userId},include:{model:campaigns},offset:skip,limit:items})
       
        res.status(202).json({donations:rows,total:count})
        await transaction.commit()
    } catch (error) {
        console.log("Error: ",error)
      
        res.status(404).json("An error occured try again")
        await transaction.rollback()
    }
}



module.exports={getUserDonations}