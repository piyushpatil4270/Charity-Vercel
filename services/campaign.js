const campaigns = require("../models/campaigns");
const products = require("../models/products");
const users = require("../models/user");
const express = require("express");
const nodemailer = require("nodemailer");
const donations = require("../models/donations");
const updates = require("../models/records");
const { Sequelize, where, literal, fn, col } = require("sequelize");

const db=require("../utils/db");
const { uploadS3Object } = require("../aws");
require("dotenv").config()


const transporter = nodemailer.createTransport({

  service:"gmail",
  auth: {
    user: process.env.User_Email,
    pass: process.env.User_Pass,
  },
});


exports.handleCreateCampaign=async(body,userId,urlPath)=>{
    const { title, description, category, prods }=body
    const campaign = await campaigns.create({
        title: title,
        description: description,
        tag: category,
        userId: userId,
        document: urlPath[0],
      });
      let amount = 0;
      await Promise.all(
        prods.map(async (prod) => {
          amount += prod.amount * prod.quantity;
          return products.create({
            campaignId: campaign.id,
            name: prod.name,
            amount: prod.amount,
            requiredQty: prod.quantity,
          });
        })
      );
      const [updatedRowsCount] = await campaigns.update(
        {
          targetAmount: amount,
        },
        {
          where: { id: campaign.id },
        }
      );
      return updatedRowsCount
}




exports.handleGetAllCampaigns=async(body)=>{
    const {items,page}=body
    const skip=(page-1)*items
   const count=await campaigns.count({ where:{isActive:true},
    include:{model:users,attributes: ['id', 'email', 'name']},
    })
    const {rows}=await campaigns.findAndCountAll({
        where:{isActive:true},
        include:{model:users,attributes: ['id', 'email', 'name']},
        offset:skip,
        limit:items
      })
      return {rows,count}
}


exports.handleGetUserCampaigns=async(userId,body)=>{
const {page,items}=body
const skip=(page-1)*items
const { rows, count } = await campaigns.findAndCountAll({
    where: { userId: userId },
    limit: items,
    offset: skip,
  });
  return {rows,count}
}

exports.handleGetCampaignsByCategory=async(category)=>{
    const camps = await campaigns.findAll({
        where: { tag: category, isActive: true },
        include: { model: users, attributes: ["id", "email", "name"] },
      });
      return camps
}


exports.handleGetInactiveCampaigns=async()=>{
    const camps = await campaigns.findAll({
        where: { isActive: false },
        include: { model: users, attributes: ["id", "email", "name"] },
      });
      return camps
}


exports.handleApproveCampaigns=async(campaignId)=>{
    const [updateCnt] = await campaigns.update(
        { isActive: true },
        { where: { id: campaignId } }
      );
      return updateCnt
}


exports.handleDonateToCampaign=async(userId,body)=>{
    const { campaignId, amount } = body;
    const [affectedRows] = await campaigns.increment("currentAmount", {
        by: amount,
        where: {
          id: campaignId,
        },
      });
      const campaign = await campaigns.findByPk(campaignId);
      const donation = await donations.create({
        campaignId: campaignId,
        userId: userId,
        amount: amount,
      });
      const user = await users.findByPk(userId);
      let mailOptions = {
        from: "piyushpatil4270@gmail.com",
        to: user.email,
        subject: "Charity Donation",
        text: `Donation of $ ${amount} made to ${campaign.title} `,
      };

      let info = await transporter.sendMail(mailOptions);
      console.log("Mail info ", info);
      if (affectedRows === 0) {
        return 1;
      }
      return 2

}


exports.handleAddUpdate=async(body)=>{
const {campaignId, title}=body
const exCampaign=await campaigns.findOne({ where: { id: campaignId } })
const newUpdate=await updates.create({
    title:title,
    campaignId:campaignId
})
const donors=await donations.findAll({
    where:{campaignId:campaignId},
    include:{
        model:users,
        attributes:["email"],
        as:"user"
    },
    attributes:[],
    distinct:true,
    col:"user.email",

})
await Promise.all(donors.map(async (donor) => {
    let mailOptions = {
      from: "piyushpatil4270@gmail.com",
      to: donor.user.email,
      subject: `Update received from ${exCampaign.title}`,
      text: title,
    };

    let info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${donor.user.email}: ${info.response}`);
  }))
  return 1
}


exports.handleGetCampaignById=async(id,userId)=>{
const campaignId=parseInt(id)
const campaign = await campaigns.findByPk(campaignId);
if(!campaign) return 1
if (campaign.userId !== userId)
    return res
      .status(404)
      .json("You are not authorised to access this campaign");
      const prods=await products.findAll({where:{campaignId:campaignId}})
      return { campaign: campaign, products: prods }
}


exports.handleGetCampaignData=async(userId)=>{
    const result = await donations.findAll({
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("amount")), "totalDonations"],
          "campaign.tag",
        ],
        include: [
          {
            model: campaigns,
            attributes: [],
          },
        ],
        where: {
          userId: userId,
        },
        group: ["campaign.tag"],
        raw: true,
      });
}


exports.handleGetUserData=async(userId)=>{
    const totalDonations = await donations.sum("amount", {
        where: { userId },
      });
      const totalCampaigns = await campaigns.count({
        where: { userId },
      });
      const result = await donations.findAll({
        attributes: [
          [Sequelize.fn("SUM", Sequelize.col("amount")), "totalDonations"],
          "campaign.tag",
        ],
        include: [
          {
            model: campaigns,
            attributes: [],
          },
        ],
        where: {
          userId: userId,
        },
        group: ["campaign.tag"],
        raw: true,
      });
      const allMonths = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalAmount: "0",
      }));
      const donationsByMonth = await donations.findAll({
        attributes: [
          [fn("MONTH", col("date")), "month"],
          [fn("SUM", col("amount")), "totalAmount"],
        ],
        where: { userId: userId },
        group: [literal("MONTH(date)")],
        order: [[fn("MONTH", col("date")), "ASC"]],
        raw: true,
      });
      donationsByMonth.forEach((entry) => {
        const monthIndex = allMonths.findIndex(
          (item) => item.month === entry.month
        );
        if (monthIndex !== -1) {
          allMonths[monthIndex].totalAmount = entry.totalAmount;
        }
      });
      return {
        totalCamps: totalCampaigns,
        totalDons: totalDonations,
        data: result,
        monthly: allMonths,
      }

}


exports.handleGetCampaign=async(userId,id)=>{
    const campaignId=parseInt(id)
    const userDonations = await donations.findAll({
        where: { campaignId: campaignId, userId: userId },
      });
      const campaign = await campaigns.findByPk(campaignId);
      if(!campaign) return 1
      const prods = await products.findAll({ where: { campaignId: campaignId } });
      if(userDonations.length===0) return { campaign: campaign, products: prods }
      const campaignUpdates = await updates.findAll({
        where: { campaignId: campaignId },
      });
      return { campaign: campaign, products: prods, updates: campaignUpdates }

}