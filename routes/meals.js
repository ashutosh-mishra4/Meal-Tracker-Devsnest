const express = require("express");
const router = express.Router();
const Meal = require("../models/Meal");
const nutritionix = require("nutritionix-api");
const { body, validationResult } = require("express-validator");
const fetchuser = require("../middleware/fetchUser");

// Nutritionix API initialized
nutritionix.init(
  process.env.NUTRITIONIX_APP_ID,
  process.env.NUTRITIONIX_API_KEY
);

// Route 1: Fetch all meals of a user using: GET "/api/meals/". Login required
router.get("/", fetchuser, async (req, res) => {
  const meals = await Meal.find({ user: req.user.id });
  res.json(meals);
});

// Route 2: Add a new meal using: POST "/api/meals/new-meal". Login required
router.post(
  "/new-meal",
  fetchuser,
  body("name", "Please enter your meal name"),
  async (req, res) => {
    // If there are errors, return bad request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { name } = req.body;
      let calories = 250;
      console.log(calories)
      // fetch the calories of user input food from the Nutritionix API
      await nutritionix.natural.search(name).then((result) => {
        if (result.foods[0].nf_calories) {
          calories = result.foods[0].nf_calories;
          console.log(calories)
        }
      });
      const meal = new Meal({
        name,
        calories, // fetched value of the calory here,
        user: req.user.id,
      });
      console.log(calories)
      const savedMeal = await meal.save();
      res.json(savedMeal);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server Error Occured");
    }
  }
);

// Route 3: Update an existing note using: PUT "/api/meals/update". Login required
router.put("/update/:id", fetchuser, async (req, res) => {
  try {
    const { name } = req.body;
    // Create a newMeal object
    const newMeal = {};
    if (name) {
      newMeal.name = name;
    }

    // Find the meal to be updated and update it
    let meal = await Meal.findById(req.params.id);
    if (!meal) {
      return res.status(404).send("Not Found");
    }

    if (meal.user.toString() != req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    meal = await Meal.findByIdAndUpdate(
      req.params.id,
      { $set: newMeal },
      { new: true }
    );
    res.json({ meal });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error Occured");
  }
});

module.exports = router;
