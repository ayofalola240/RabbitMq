const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const amqp = require("amqplib");
const isAuthenticated = require("../middleware/isAuthenticated");
const Order = require("./Order");

mongoose.connect(
  "mongodb://localhost/order-service",
  {
    useNewUrlParser: true,
    UseUnifiedTopology: true,
  },
  () => {
    console.log("Order Service Connected to MongoDB");
  }
);

app.use(express.json());

async function connect() {
  const amqpServer = "amqp://localhost";
  connection = await amqp.connect(amqpServer);
  channel = await connection.createChannel();
  await channel.assertQueue("ORDER");
  console.log("Connect order queue");
}
 function createOrder({ products, userEmail }) {
  let total = 0;
  for(let i = 0; i < products.length; i++) {
    total += products[i].price;
  }
  const newOrder = new Order({
    products: products,
    user: userEmail,
    total_price: total,
  });
   newOrder.save();
   return newOrder;
}
connect().then(() => {
  channel.consume("ORDER", (data) => {
    if (data !== null) {
      const order = JSON.parse(data.content);
      console.log(`Order Received: ${order.userEmail}`);
      const newOrder = createOrder(order);
      channel.ack(data);
      channel.sendToQueue("PRODUCT", Buffer.from(JSON.stringify(newOrder)));
    }
  })
});



const PORT = process.env.PORT || 9090;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
