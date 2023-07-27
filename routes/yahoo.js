const express = require("express");
const { query, validationResult } = require("express-validator");
const service = require("../api/yahoo");
const { logger } = require("../helpers/logger");
const router = express.Router();

//Middle ware that is specific to this router
router.use(function timeLog(req, res, next) {
  logger.info("Time: ", Date.now());
  next();
});

router.get(
  "/conversations",
  query("symbol").isLength({ min: 2 }).isAlpha(),
  query("count").isFloat({ min: 1, max: 50 }).optional(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const symbol = req.query.symbol;
    const count = +req.query.count || 1;
    service
      .getData(symbol, count)
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send({
          error: `General Error: ${err}`,
          statusCode: 500,
        });
      });
  }
);

router.get("/statistics", async (req, res) => {
  service
    .getStatistics()
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.send({
        error: `General Error: ${err}`,
        statusCode: 500,
      });
    });
});

module.exports = router;
