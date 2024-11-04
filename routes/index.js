const router = require("express").Router();
const { notFound } = require("../utils/errors");
const { createUser, login } = require("../controllers/users");
const auth = require("../middleware/auth");

const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");

router.post("/signin", login);
router.post("/signup", createUser);

router.use(auth);

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);

router.use((req, res) => {
  res.status(notFound).send({ message: "Requested resource not found" });
});

module.exports = router;
