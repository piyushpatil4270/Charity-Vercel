const multer = require("multer");
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const {
  createCampaign,
  getAllCampaigns,
  getUserCampaigns,
  getCampaignsByCategory,
  getInActiveCampaigns,
  approveCampaigns,
  donateToCampaign,
  addUpdate,
  getCampaignWithId,
  getCampaignData,
  getUserData,
  getCampaign,
} = require("../controllers/campaign");
const campaigns = require("../models/campaigns");
const authenticate = require("../middlewares/auth");

const storage = multer.memoryStorage(); 
const upload = multer({ storage: storage });

router.post("/create",authenticate, upload.single("file"), createCampaign);

router.post("/all",authenticate, getAllCampaigns);

router.post("/user/:id",authenticate, getUserCampaigns);

router.post("/all/:category",authenticate, getCampaignsByCategory);

router.get("/admin",authenticate, getInActiveCampaigns);

router.post("/approve",authenticate, approveCampaigns);
router.post("/donate",authenticate, donateToCampaign);

router.post("/addUpdate", addUpdate);

router.get("/:id",authenticate, getCampaignWithId);
router.post("/campaignData",authenticate, getCampaignData);

router.post("/getUserData",authenticate, getUserData);
router.post("/getCampaignData",getCampaignData)
router.post("/deactivate/:id",authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const campaignId = parseInt(id);
    const campaign=await campaigns.findOne({where:{id,campaignId}})
    await campaign.destroy()
    res.status(200).json("Campaign deactivated succesfully");
  } catch (error) {
    console.log("Error: ", error);
    res.status(404).json("An error occured try again");
  }
});
router.post("/:id",authenticate, getCampaign);

module.exports = router;
