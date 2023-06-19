const express = require("express");

const tourController = require("../controllers/tourController");
const authController = require("../controllers/authController");

const router = express.Router();

// router.param('id', tourController.checkId);

router
  .route("/top-5-tours")
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route("/monthly-plan/:year")
  .get(tourController.getMonthlyPlan);

router
  .route("/stats")
  .get(tourController.getTourStats);

router
  .route("/")
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(authController.protect, authController.restrictTo("admin", "lead-guid"), tourController.deleteTour);

module.exports = router;
