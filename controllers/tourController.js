/* eslint-disable no-console */
const fs = require("fs");
const Tour = require("../models/tourModel");

const toursFile = `${__dirname}/../dev-data/data/tours-simple.json`;
const tours = JSON.parse(fs.readFileSync(toursFile));

exports.checkId = (req, res, next, val) => {
  const id = val * 1;
  const tour = tours.find((t) => t.id === id);

  console.log("checkId", val, id, tour);

  if (tour === undefined) {
    console.log("checkId bailing out!");
    return res.status(404).json({
      status: "fail",
      requestedAt: req.requestTime,
      message: `Tour with id of ${id} not found by checkId!`
    });
  }

  next();
};

exports.getTours = (req, res) => {
  res.status(200).json({
    status: "success",
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find((t) => t.id === id);

  if (tour) {
    res.status(200).json({
      status: "success",
      requestedAt: req.requestTime,
      results: 1,
      data: {
        tour
      }
    });
  } else {
    res.status(404).json({
      status: "fail",
      requestedAt: req.requestTime,
      message: `Tour with id of ${id} not found.`
    });
  }
};

exports.checkBody = (req, res, next) => {
  if (req.body.name && req.body.price) {
    next();
  } else {
    res.status(400).json({
      status: "fail",
      requestedAt: req.requestTime,
      message: "Tour missing required properties: name and price!"
    });
  }
};

exports.createTour = (req, res) => {
  const tour = req.body;
  const newId =
    tours.reduce((accumulator, current) => {
      accumulator = accumulator.id > current.id ? accumulator.id : current.id;
    }, 0) + 1;

  const newTour = { id: newId, ...tour };
  tours.push(newTour);

  fs.writeFile(toursFile, JSON.stringify(tours), (_err) => {
    res.status(201).json({
      status: "success",
      requestedAt: req.requestTime,
      data: {
        tour: newTour
      }
    });
  });
};

exports.updateTour = (req, res) => {
  const id = req.params.id * 1;
  let tour = null;
  let tourIdx = -1;

  for (let i = 0; i < tours.length; i += 1) {
    if (tours[i].id === id) {
      tour = tours[i];
      tourIdx = i;
      break;
    }
  }

  if (tour && tourIdx > -1) {
    const patch = req.body;
    const updatedTour = {
      ...tour,
      ...patch
    };

    tours[tourIdx] = updatedTour;

    fs.writeFile(toursFile, JSON.stringify(tours), (err) => {
      res.status(204).end();
    });
  } else {
    res.status(404).json({
      status: "fail",
      requestedAt: req.requestTime,
      message: `Tour with id of ${id} not found.`
    });
  }
};

exports.deleteTour = (req, res) => {
  const id = req.params.id * 1;
  let tour = null;
  let tourIdx = -1;

  for (let i = 0; i < tours.length; i++) {
    if (tours[i].id === id) {
      tour = tours[i];
      tourIdx = i;
      break;
    }
  }

  if (tour && tourIdx > -1) {
    tours.splice(tourIdx, 1);

    fs.writeFile(toursFile, JSON.stringify(tours), (err) => {
      res.status(204).end();
    });
  } else {
    res.status(404).json({
      status: "fail",
      requestedAt: req.requestTime,
      message: `Tour with id of ${id} not found.`
    });
  }
};
