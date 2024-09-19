const db=require("../utils/db")
const sequelize=require("sequelize")


const record=db.define("donations",{
    id:{
        type:sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
    },
    campaignId:{
        type:sequelize.INTEGER,
        allowNull:false
    },
    userId:{
        type:sequelize.INTEGER,
        allowNull:false
    },
    date:{
        type:sequelize.DATE,
        defaultValue:sequelize.NOW
    },
    amount:{
        type:sequelize.INTEGER,
        allowNull:false
    }

},{
    timestamps:false
})


module.exports=record