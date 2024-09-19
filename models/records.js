const db=require("../utils/db")
const sequelize=require("sequelize")


const record=db.define("updates",{
    id:{
        type:sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
    },
    title:{
        type:sequelize.STRING,
        allowNull:false
    },
    campaignId:{
        type:sequelize.INTEGER,
        allowNull:false
    }
},{
    timestamps:false
})


module.exports=record