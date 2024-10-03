
const db = require("../utils/db");
const {
  handleSignup,
  handleSignIn,
  handleGetUser,
  handleChangePassword,
} = require("../services/auth");

const changePassword = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const result = await handleChangePassword(req.body);
    if (result === 1) return res.status(200).json("User not found");
    else if (result === 2) return res.status(201).json("Incorrect password");

    res.status(202).json("Password updated succesfully");
    await transaction.commit();
  } catch (error) {
    console.log("Error: ", error);

    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

const getUser = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const result = await handleGetUser(req.body.userId);

    res.status(202).json(result);
    await transaction.commit();
  } catch (error) {
    console.log(error);
    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

const signUp = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const result = await handleSignup(req.body);
    if (result === 1)
      return res.status(200).json("User with email already exist");
    res.status(202).json("User registered successfully");
    await transaction.commit();
  } catch (error) {
    console.log("error: ", error);
    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

const signIn = async (req, res, next) => {
  const transaction = await db.transaction();
  try {
    const result = await handleSignIn(req.body);
    if (result === 1) return res.status(200).json("Enter valid email");
    else if (result === 2) return res.status(201).json("Incorrect password");
    res.status(202).json(result);
    await transaction.commit();
  } catch (error) {
    console.log("error: ", error);

    res.status(404).json("An error occured try again");
    await transaction.rollback();
  }
};

module.exports = { changePassword, getUser, signUp, signIn };
