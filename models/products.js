const db=require("../utils/db")
const sequelize=require("sequelize")

const products=db.define("products",{
    id:{
        type:sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
    },
    campaignId:{
        type:sequelize.INTEGER,
        allowNull:false,
    },
    name:{
        type:sequelize.STRING,
        allowNull:false
    },
    amount:{
        type:sequelize.INTEGER,
        allowNull:false,
    },
    requiredQty:{
        type:sequelize.INTEGER,
        allowNull:false,
    },
    currentQty:{
        type:sequelize.INTEGER,
        defaultValue:0 
    }
},{
    timestamps:false
})


module.exports=products