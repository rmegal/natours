/* eslint-disable no-console */
const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.error(`${err.name}: ${err.message}`);
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting Down...");
  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

console.log(`Connecting to: ${DB}`);

const options = {
  serverSelectionTimeoutMS: 3000,
  socketTimeoutMS: 45000
};

mongoose.connect(DB, options).then(() => {
  console.log("DB Connection Successful");
});

const port = process.env.PORT || 3000;

const server = app.listen(port, "localhost", () => {
  console.log(`Server listening on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.error(`${err.name}: ${err.message}`);
  console.log("UNHANDLED REJECTION! 💥 Shutting Down...");
  server.close(() => {
    process.exit(1);
  });
});
