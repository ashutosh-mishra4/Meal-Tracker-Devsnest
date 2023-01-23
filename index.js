require("dotenv").config();
const connectToMongo = require('./db')
const express = require('express')
connectToMongo()
const app = express()
const port = process.env.PORT || 5000
app.use(express.json())

// Available Routes
app.use('/api/auth', require('./routes/auth'))

app.listen(port, () => {
  console.log(`Meal tracker app listening on port ${port}`)
})