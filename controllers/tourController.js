const Tour = require("../models/tourModel");

exports.getAllTours = async (req, res) => {
  try {
    const tours = await Tour.find();
    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      requestedAt: req.requestTime,
      message: err.message
    });
  }
};

exports.getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    if (tour) {
      res.status(200).json({
        status: "success",
        requestedAt: req.requestTime,
        data: {
          tour
        }
      });
    } else {
      res.status(404).json({
        status: "fail",
        requestedAt: req.requestTime,
        message: `Tour with id of ${req.params.id} not found.`
      });
    }
  } catch (err) {
    res.status(404).json({
      status: "fail",
      requestedAt: req.requestTime,
      message: `Tour with id of ${req.params.id} not found.`
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "success",
      requestedAt: req.requestTime,
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      requestedAt: req.requestTime,
      message: err.message
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      requestedAt: req.requestTime,
      message: err.message
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id, req.body);

    if (tour) {
      res.status(204).end();
    } else {
      res.status(404).json({
        status: "fail",
        requestedAt: req.requestTime,
        message: `Tour with id of ${req.params.id} not found.`
      });
    }
  } catch (err) {
    res.status(400).json({
      status: "fail",
      requestedAt: req.requestTime,
      message: err.message
    });
  }
};
