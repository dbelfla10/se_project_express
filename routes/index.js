const router = require("express").Router();
const { notFound } = require("../utils/errors");

const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);

router.use((req, res) => {
  res.status(notFound).send({ message: "Requested resource not found" });
});

module.exports = router;
