const campaigns = require("../models/campaigns");
const products = require("../models/products");
const users = require("../models/user");
const express = require("express");
const nodemailer = require("nodemailer");
const donations = require("../models/donations");
const updates = require("../models/records");
const { Sequelize, where, literal, fn, col } = require("sequelize");
const {}=require("../")
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

const createCampaign = async (req, res, next) => {
  const transaction=await db.transaction()
  try {
    if (!req.file)
      return res.status(404).json("Please upload the application document");

    const { title, description, category, prods } = req.body;
    const userId=req.user.id
    const urlPath=await uploadS3Object(req.file)
    const campaign = await campaigns.create({
      title: title,
      description: description,
      tag: category,
      userId: userId,
      document: urlPath,
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

    if (updatedRowsCount > 0) {
      await transaction.commit()
      return res
        .status(202)
        .json("Campaign created and products added successfully");
    } else {
      
      return res
        .status(201)
        .json("No campaign found with the given ID or no changes made");
    }
    await transaction.rollback()
  } catch (error) {
    console.log("Error: ", error);
   
    res.status(404).json("An error occured try again");
    await transaction.rollback()
  }
};


const getAllCampaigns=async(req,res,next)=>{
  const transaction=await db.transaction()
    try {
      const {items,page}=req.body
      const skip=(page-1)*items
      const {rows,count}=await campaigns.findAndCountAll({
        where:{isActive:true},
        include:{model:users,attributes: ['id', 'email', 'name']},
        offset:skip,
        limit:items
      })
   
      res.status(202).json({campaigns:rows,total:count})
      await transaction.commit()
    } catch (error) {
      console.log("Error: ",error)
      
      res.status(404).json("An error occured try again")
      await transaction.rollback()
    }


  }


  const getUserCampaigns=async(req,res,next)=>{
    const transaction=await db.transaction()
    try {
      const {id}=req.params
      const userId=req.user.id
      const {page,items}=req.body
      const skip=(page-1)*items
      const {rows,count}=await campaigns.findAndCountAll({where:{userId:userId},limit:items,offset:skip})
    
      res.status(202).json({campaigns:rows,total:count}) 
      await transaction.commit()   
    } catch (error) {
      console.log("Error: ",error)
     
      res.status(404).json("An error occured try again")
      await transaction.rollback()
    }
  }


  const getCampaignsByCategory=async(req,res,next)=>{
    const transaction=await db.transaction()
    try {
      const {category}=req.params
      const camps=await campaigns.findAll({
        where:{tag:category,isActive:true},
        include:{model:users,attributes: ['id', 'email', 'name']}
      })
      
      res.status(202).json({campaigns:camps})
      await transaction.commit()
    } catch (error) {
      console.log("Error: ",error)
      
      res.status(404).json("An error occured try again")
      await transaction.rollback()
    }
  }


  const getInActiveCampaigns=async(req,res,next)=>{
    const transaction=await db.transaction()
    try {
      
      const camps=await campaigns.findAll({
        where:{isActive:false},
        include:{model:users,attributes: ['id', 'email', 'name']}
      })
      
      res.status(202).json(camps)
      await transaction.commit()
    } catch (error) {
      console.log("Error: ",error)
     
      res.status(404).json("An error occured try again")
      await transaction.rollback()
    }
  }

  const approveCampaigns=async(req,res,next)=>{
    const transaction=await db.transaction()
    try {
      const {campaignId}=req.body
      const [updateCnt]=await campaigns.update({isActive:true},{where:{id:campaignId}})
      if(updateCnt===0) return res.status(404).json("Campaign not activated")
    
        res.status(202).json("Campaign activated successfully")
        await transaction.commit()
    } catch (error) {
      console.log(error)
     
      res.status(404)
      await transaction.rollback()
    }
  }


  const donateToCampaign=async(req,res,next)=>{
    const transaction=await db.transaction()
    try {
      const {campaignId,amount}=req.body
      const userId=req.user.id
      console.log("Body is ",req.body)
      const [affectedRows] = await campaigns.increment('currentAmount', {
        by: amount,
        where: {
          id: campaignId
        }
      });
      const campaign=await campaigns.findByPk(campaignId)
      const donation=await donations.create({
        campaignId:campaignId,
        userId:userId,
        amount:amount
      })
      const user=await users.findByPk(userId)
  
      let mailOptions = {
        from: 'piyushpatil4270@gmail.com',
        to: user.email, 
        subject: "Charity Donation", 
        text: `Donation of $ ${amount} made to ${campaign.title} `, 
      };
  
      
      let info = await transporter.sendMail(mailOptions);
      console.log("Mail info ",info)
      if (affectedRows === 0) {
        return res.status(202).json('Campaign not found' );
      }
     
      res.status(201).json( 'Amount updated successfully');
      await transaction.commit()
      
    } catch (error) {
      console.log("Error: ",error)
     
      res.status(404).json("An error occured try again")
      await transaction.rollback()
    }
  }



  const addUpdate=async(req,res,next)=>{
   
    try {
      const {campaignId,title}=req.body
      console.log(req.body)
      const exCampaign=await campaigns.findOne({where:{id:campaignId}})
      const newUpdate=await updates.create({
         title:title,
         campaignId:campaignId
      })
      const donors=await donations.findAll({where:{campaignId:campaignId},include:{model:users}})
      console.log("Donors are ",donors)
      await Promise.all(
        donors.map(async (donor) => {
          let mailOptions = {
            from: 'piyushpatil4270@gmail.com',
            to: donor.user.email, 
            subject: `Update received from ${exCampaign.title}`, 
            text: title, 
          };
  
          
          let info = await transporter.sendMail(mailOptions);
          console.log(`Email sent to ${donor.user.email}: ${info.response}`);
         
        })
      );
      
      res.status(202).json("Update sent to all the donors")
     
    } catch (error) {
      console.log("Error: ",error)
    
      res.status(404).json("An error occured try again")
     
    }
    }

    const getCampaignWithId=async(req,res,next)=>{
      const transaction=await db.transaction()
        try {
          const {id}=req.params
          const campaignId=parseInt(id)
          const campaign=await campaigns.findByPk(campaignId)
           if(!campaignId) return res.status(404).json("Campaign not found")
            console.log("Campaign Details ",req.user.id," ",campaign.userId)
           if(campaign.userId!==req.user.id) return res.status(404).json("You are not authorised to access this campaign")
          
          const prods=await products.findAll({where:{campaignId:campaignId}})
          
          res.status(202).json({campaign:campaign,products:prods})
          await transaction.commit()
        } catch (error) {
          console.log("Error: ",error)
          
          res.status(404).json("An error occured try again")
          await transaction.rollback()
        }

      }


     const getCampaignData=async(req,res,next)=>{
      const transaction=await db.transaction()
      try {
     
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
            userId: 2,
          },
          group: ["campaign.tag"],
          raw: true,
        });
       
        res.status(202).json(result)
    
        await transaction.commit()
      } 
    

       catch (error) {
        console.log("Error: ",error)
        
        res.status(404).json("An error occred try again")
        await transaction.rollback()
      }
     }


      const getUserData=async(req,res,next)=>{
        const transaction=await db.transaction()
        try {
          const userId=req.user.id
          const totalDonations = await donations.sum('amount', {
            where: { userId }
          });
          const totalCampaigns = await campaigns.count({
            where: { userId }
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
          const allMonths=Array.from({ length: 12 }, (_, i) => ({
            month: i + 1,
            totalAmount: '0'  
          }));
          const donationsByMonth = await donations.findAll({
            attributes: [
              [fn('MONTH', col('date')), 'month'], 
              [fn('SUM', col('amount')), 'totalAmount'] 
            ],
            where:{userId:1},
            group: [literal('MONTH(date)')], 
            order: [[fn('MONTH', col('date')), 'ASC']], 
            raw: true 
          });
          donationsByMonth.forEach(entry => {
            const monthIndex = allMonths.findIndex(item => item.month === entry.month);
            if (monthIndex !== -1) {
              allMonths[monthIndex].totalAmount = entry.totalAmount;
            }
           });
        
          res.status(202).json({totalCamps:totalCampaigns,totalDons:totalDonations,data:result,monthly:allMonths})
          await transaction.commit()
        } catch (error) {
          console.log("Error: ",error)
       
          res.status(404).json("An error occured try again")
          await transaction.rollback()
        }
      }

      const getCampaign=async(req,res,next)=>{
        const transaction=await db.transaction()
        try {
          const userId=req.user.id
          const {id}=req.params
          const campaignId=parseInt(id)
          const userDonations=await donations.findAll({where:{campaignId:campaignId,userId:userId}})
          console.log(userDonations)
      
          const campaign=await campaigns.findByPk(campaignId)

          if(!campaignId) return res.status(404).json("Campaign not found")
          
          const prods=await products.findAll({where:{campaignId:campaignId}})
          if(userDonations.length===0) return res.status(200).json({campaign:campaign,products:prods})
          const campaignUpdates=await updates.findAll({where:{campaignId:campaignId}})
        
          res.status(202).json({campaign:campaign,products:prods,updates:campaignUpdates})
          await transaction.commit()
      
        } catch (error) {
          console.log("Error: ",error)
        
          res.status(404).json("An error occured try again")
          await transaction.rollback()
        }
      }


      
module.exports = {getCampaign, getUserData ,addUpdate,getCampaignWithId,getCampaignData, createCampaign,donateToCampaign,getAllCampaigns,approveCampaigns,getUserCampaigns,getCampaignsByCategory ,getInActiveCampaigns};
