/* eslint-disable no-console */
const fs = require('fs');
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Tour = require("../../models/tourModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => console.log(err));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, "utf-8"));

const importData = async () => {
  try {
    await Tour.create(tours);
    console.log("Data successfully loaded");
  } catch (err) {
    console.log(err);
  }

  process.exit();
}

const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log("TRUNCATED tours Collection");
  } catch (err) {
    console.log(err);
  }

  process.exit();
}

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
} else {
  console.log("Doing nadda!");
  process.exit();
}
