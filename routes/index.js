const router = require("express").Router();
const NotFoundError = require("../errors/NotFoundError");
const { createUser, login } = require("../controllers/users");

const userRouter = require("./users");
const clothingItemRouter = require("./clothingItems");
const { validateLogin, validateUserBody } = require("../middleware/validation");

router.post("/signin", validateLogin, login);
router.post("/signup", validateUserBody, createUser);

router.use("/users", userRouter);
router.use("/items", clothingItemRouter);

router.use((req, res) => {
  return next(new NotFoundError("Requested resource not found"));
});

module.exports = router;
