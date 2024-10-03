const db=require("../utils/db")
const { handleGetUserDonations } = require("../services/donations")

const getUserDonations=async(req,res,next)=>{
    const transaction=await db.transaction()
    try {
        const userId=req.user.id
        const {page,items}=req.body
        const skip=(page-1)*items
        const result=await handleGetUserDonations(userId,page,items,skip)
        res.status(202).json(result)
        await transaction.commit()
    } catch (error) {
        console.log("Error: ",error)
      
        res.status(404).json("An error occured try again")
        await transaction.rollback()
    }
}



module.exports={getUserDonations}