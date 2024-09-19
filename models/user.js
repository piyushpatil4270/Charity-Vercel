const db=require("../utils/db")
const sequelize=require("sequelize")

const user=db.define("users",{
    id:{
        type:sequelize.INTEGER,
        allowNull:false,
        primaryKey:true,
        autoIncrement:true,
    },
    email:{
        type:sequelize.STRING,
        allowNull:false
    },
    password:{
        type:sequelize.STRING,
        allowNull:false
    },
    name:{
        type:sequelize.STRING,
        allowNull:false
    },
    isAdmin:{
        type:sequelize.BOOLEAN,
        defaultValue:false
    }
},{
    timestamps:false
})


module.exports=user