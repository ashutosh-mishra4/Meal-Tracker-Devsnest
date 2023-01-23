require("dotenv").config();
const mongoose = require("mongoose");
const mongoURI = `mongodb+srv://ashutoshmishra:${process.env.MONGO_PASSWORD}@cluster0.9hv01oy.mongodb.net/?retryWrites=true&w=majority`;

const connectToMongo = async () => {
  mongoose.connect(mongoURI, () => {
    console.log("Connected to Mongo successfully");
  });
};

module.exports = connectToMongo;