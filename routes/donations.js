const express=require("express")
const { getUserDonations } = require("../controllers/donation")
const router=express.Router()
const authenticate=require("../middlewares/auth")





router.post("/:id",authenticate,getUserDonations)





module.exports=router