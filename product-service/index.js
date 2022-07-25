const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const Product = require("./Product");
const isAuthenticated = require("../middleware/isAuthenticated");

let channel, connection, order;

mongoose.connect(
  "mongodb://localhost/product-service",
  {
    useNewUrlParser: true,
    UseUnifiedTopology: true,
  },
  () => {
    console.log("Product Service Connected to MongoDB");
  }
);

app.use(express.json());

async function connect() {
  const amqpServer = "amqp://localhost";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("PRODUCT");
  console.log("Connect product queue");
}
connect();

// Create a new product
// Buy a product

app.post("/product/create", isAuthenticated, async (req, res) => {
  // req.user.email
  const {name, description, price} = req.body;
  const product = new Product({
    name,
    description,
    price,
  })
  await product.save();
  res.json({product});
})
// User sends a list of product's IDs to Buy
// Create a new order with the products and total price

app.post("/product/buy", isAuthenticated, async (req, res) => {
  const { ids } = req.body;
  const products = await Product.find({ _id: { $in: ids } });
  // const totalPrice = products.reduce((acc, product) => {  
  //   return acc + product.price;
  // });
// console.log(totalPrice)
  channel.sendToQueue("ORDER", Buffer.from(JSON.stringify({ 
    products,
    userEmail: req.user.email,
    // totalPrice
  })));

  channel.consume("PRODUCT", (data) => {
    if (data !== null) {
      console.log("Product Received");
      order = JSON.parse(data.content);
      channel.ack(data);
    }
    return res.json( {order} );
  })
})


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Product-service at ${PORT}`);
});

