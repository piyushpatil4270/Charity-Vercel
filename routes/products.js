const express=require("express")
const updateProductQty = require("../controllers/products")
const router=express.Router()
const authenticate=require("../middlewares/auth")

router.post("/update",authenticate,updateProductQty)

module.exports=router