const campaigns = require("../models/campaigns");
const products = require("../models/products");
const users = require("../models/user");
const express = require("express");
const nodemailer = require("nodemailer");
const donations = require("../models/donations");
const updates = require("../models/records");
const { Sequelize, where, literal, fn, col } = require("sequelize");

const db = require("../utils/db");
const { uploadS3Object } = require("../aws");
const {
  handleCreateCampaign,
  handleGetAllCampaigns,
  handleGetUserCampaigns,
  handleGetCampaignsByCategory,
  handleGetInactiveCampaigns,
  handleGetCampaign,
  handleGetCampaignById,
  handleGetCampaignData,
  handleApproveCampaigns,
  handleDonateToCampaign,
  handleAddUpdate,
  handleGetUserData
} = require("../services/campaign");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.User_Email,
    pass: process.env.User_Pass,
  },
});

const createCampaign = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    if (!req.file)
      return res.status(404).json("Please upload the application document");

    const userId = req.user.id;
    const urlPath = await uploadS3Object(req.file);
    await handleCreateCampaign(req.body, userId, urlPath);
    await transaction.commit();
    return res
      .status(202)
      .json("Campaign created and products added successfully");
  } catch (error) {
    console.log("Error: ", error);

    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

const getAllCampaigns = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const result = await handleGetAllCampaigns(req.body);

    res.status(202).json({ campaigns: result.rows, total: result.count });
    await transaction.commit();
  } catch (error) {
    console.log("Error: ", error);

    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

const getUserCampaigns = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    
    const userId = req.user.id;
   const result=await handleGetUserCampaigns(userId,req.body)

    res.status(202).json({ campaigns: result.rows, total: result.count });
    await transaction.commit();
  } catch (error) {
    console.log("Error: ", error);

    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

const getCampaignsByCategory = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const { category } = req.params;
    const result = await handleGetCampaignsByCategory(category)

    res.status(202).json({ campaigns: result });
    await transaction.commit();
  } catch (error) {
    console.log("Error: ", error);

    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

const getInActiveCampaigns = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const result = await handleGetInactiveCampaigns()
    res.status(202).json(result);
    await transaction.commit();
  } catch (error) {
    console.log("Error: ", error);

    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

const approveCampaigns = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const { campaignId } = req.body;
   const result=await handleApproveCampaigns(campaignId)
    if (result === 0) return res.status(404).json("Campaign not activated");

    res.status(202).json("Campaign activated successfully");
    await transaction.commit();
  } catch (error) {
    console.log(error);

    res.status(404);
    await transaction.rollback();
  }
};

const donateToCampaign = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
 
    const userId = req.user.id;
    const result=await handleDonateToCampaign(userId,req.body)
    if(result===1) return res.status(202).json("Campaign not found")
    return res.status(202).json("Amount donated successfully")
    await transaction.commit();
  } catch (error) {
    console.log("Error: ", error);

    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

const addUpdate = async (req, res, next) => {
  try {
   const result=await handleAddUpdate(req.body)

    res.status(202).json("Update sent to all the donors");

  } catch (error) {
    console.log("Error: ", error);

    res.status(404).json("An error occured try again");
  }
};

const getCampaignWithId = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const { id } = req.params;
    const result=await handleGetCampaignById(id,req.user.id)
    if(result===1) return res.status(404).json("Campaign not found")
    res.json(result)
    await transaction.commit();
  } catch (error) {
    console.log("Error: ", error);

    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

const getCampaignData = async (req, res, next) => {
  const transaction = await db.transaction();
  const userId=req.user.id
  try {
    const result=await handleGetCampaignData(userId)

    res.status(202).json(result);

    await transaction.commit();
  } catch (error) {
    console.log("Error: ", error);

    res.status(404).json("An error occred try again");
    await transaction.rollback();
  }
};

const getUserData = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const userId = req.user.id;
    const result=await handleGetUserData(userId)
    res.status(202).json(result)
    await transaction.commit();
  } catch (error) {
    console.log("Error: ", error);

    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

const getCampaign = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    console.log("campaign router hitted now", req.user.id);
    const userId = req.user.id;
    const { id } = req.params;
    const result=await handleGetCampaign(userId,id)
    res.status(202).json(result)
    await transaction.commit();
  } catch (error) {
    console.log("Error: ", error);

    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

module.exports = {
  getCampaign,
  getUserData,
  addUpdate,
  getCampaignWithId,
  getCampaignData,
  createCampaign,
  donateToCampaign,
  getAllCampaigns,
  approveCampaigns,
  getUserCampaigns,
  getCampaignsByCategory,
  getInActiveCampaigns,
};
