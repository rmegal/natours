/* eslint-disable no-console */
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

console.log(`Connecting to: ${DB}`);

mongoose
  .connect(DB)
  .then(() => {
    console.log("DB Connection Successful");
  })
  .catch((err) => console.log(err));

const port = process.env.PORT || 3000;

app.listen(port, "localhost", () => {
  console.log(`Server listening on port ${port}`);
});
