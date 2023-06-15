const express = require("express");

const tourController = require("../controllers/tourController");

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
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route("/:id")
  .get(tourController.getTourById)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
