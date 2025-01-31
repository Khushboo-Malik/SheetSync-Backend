require("dotenv").config();

const mongoose=require("mongoose");
const express = require("express");
const { connectMongoDb } = require("./connection");

connectMongoDb(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected!"));

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.listen(PORT, () => console.log(`Server Started at PORT ${PORT}!`));