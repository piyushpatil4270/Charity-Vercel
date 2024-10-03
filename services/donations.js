const donations=require("../models/donations")
const campaigns = require("../models/campaigns")
const {Sequelize}=require("sequelize")
const db=require("../utils/db")


exports.handleGetUserDonations=async(userId,page,items,skip)=>{
    const {rows,count}=await donations.findAndCountAll({where:{userId:userId},include:{model:campaigns},offset:skip,limit:items})
    return {donations:rows,total:count}
}