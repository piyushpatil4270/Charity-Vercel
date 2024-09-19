const express=require("express")
const cors=require("cors")
const db = require("./utils/db");
const app=express()
const bodyParser=require("body-parser")
const authRouter=require("./routes/auth")
const campaignRouter=require("./routes/campaign")
const donationRouter=require("./routes/donations")
const productsRouter=require("./routes/products")
app.use(bodyParser.json())
const campaigns=require("./models/campaigns")
const users=require("./models/user")
const paypal = require('@paypal/checkout-server-sdk');
const donations=require("./models/donations")
const updates=require("./models/records")
const path=require("path")
require("dotenv").config()

campaigns.hasMany(updates,{foreignKey:"campaignId"})
updates.belongsTo(campaigns,{foreignKey:"campaignId"})

users.hasMany(campaigns,{foreignKey:"userId"})
campaigns.belongsTo(users,{foreignKey:"userId"})
users.hasMany(donations,{foreignKey:"userId"})
campaigns.hasMany(donations,{foreignKey:"campaignId"})
donations.belongsTo(users,{foreignKey:"userId"})
donations.belongsTo(campaigns,{foreignKey:"campaignId"})

app.use(cors())

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
const client = new paypal.core.PayPalHttpClient(environment);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/api/create-order', async (req, res) => {
  const { amount } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer('return=representation');
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: amount,
      },
    }],
  });

  try {
    const order = await client.execute(request);
    res.json({ id: order.result.id });
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    res.status(500).send('Error creating PayPal order');
  }
});

app.post('/api/capture-order', async (req, res) => {
  const { orderID } = req.body;

  const request = new paypal.orders.OrdersCaptureRequest(orderID);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    res.json({ capture });
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    res.status(500).send('Error capturing PayPal order');
  }
});


app.get("/",(req,res)=>{res.status(202).json("We are live")})

db.sync()
.then(()=>console.log("Connected to the database "))
.catch((err)=>console.log("Error: ",err))

app.use("/auth",authRouter)
app.use("/campaigns",campaignRouter)
app.use("/donations",donationRouter)
app.use("/products",productsRouter)







app.listen(5500,()=>console.log("Server started on port 5500"))