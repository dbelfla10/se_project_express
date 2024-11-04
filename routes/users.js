const router = require("express").Router();
const { getCurrentUser, createUser, getUser } = require("../controllers/users");

router.get("/me", getCurrentUser);
// router.get("/:userId", getUser);
// router.post("/", createUser);

module.exports = router;
