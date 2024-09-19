const db=require("../utils/db")
const sequelize=require("sequelize")

const campaigns=db.define("campaigns",{
    id:{
        type:sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
    },
   userId:{
    type:sequelize.INTEGER,
    allowNull:false
   },
   title:{
   type:sequelize.STRING,
   allowNull:false
   },
   description:{
    type:sequelize.TEXT,
   allowNull:false
   },
   currentAmount:{
    type:sequelize.INTEGER,
    defaultValue:0
   },
   targetAmount:{
    type:sequelize.INTEGER,
    defaultValue:0,
   },
   startedOn:{
    type:sequelize.DATE,
    defaultValue:sequelize.NOW
   },
   image:{
    type:sequelize.TEXT,
    allowNull:true
   },
   isActive:{
    type:sequelize.BOOLEAN,
    defaultValue:false
   },
   tag:{
    type:sequelize.STRING,
    allowNull:false
   },
   document:{
    type:sequelize.STRING,
    allowNull:false 
   }

},{
    timestamps:false
})


module.exports=campaigns