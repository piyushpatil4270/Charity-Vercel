const products =require("../models/products")
const db=require("../utils/db")


exports.handleUpdateProduct=async(prodId,quantity)=>{
    const [updateCount]=await products.update({currentQty:quantity},{where:{id:prodId}})
    return updateCount
}