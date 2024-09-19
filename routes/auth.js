const express=require("express")
const authenticate=require("../middlewares/auth")
const { changePassword, getUser, signUp, signIn } = require("../controllers/auth")
const router=express.Router()




router.post("/changePassword",authenticate,changePassword)
router.post("/getUser",authenticate,getUser)
router.post("/signup",signUp)
router.post("/signin",signIn)

module.exports=router