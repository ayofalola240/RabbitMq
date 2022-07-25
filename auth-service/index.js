const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./User");

mongoose.connect(
  "mongodb://localhost/auth-service",
  {
    useNewUrlParser: true,
    UseUnifiedTopology: true,
  },
  () => {
    console.log("Auth Service Connected to MongoDB");
  }
);

//Register User
//Login User
app.use(express.json());

app.post("/auth/register", async (req, res) => {
  const { email, name, password } = req.body;
  const userExits = await User.findOne({ email });
  if (userExits) {
    return res.status(400).send("User already exists");
  } else {
    const user = new User({ email, name, password });
    await user.save();
    res.json({ user: user });
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send("User does not exist");
  } else {
    if (user.password === password) {
      const payload = {
        email,
        name: user.name,
      };
      jwt.sign(payload, "secret", { expiresIn: "24h" }, (err, token) => {
        if (err) {
          return res.status(500).send("Error signing token");
        } else {
          res.json({ token });
        }
      });
    } else {
      return res.status(400).send("Password is incorrect");
    }
  }
});

const PORT = process.env.PORT || 7070;
app.listen(PORT, () => {
  console.log(`Auth-service at ${PORT}`);
});
