const router = require("express").Router();
const auth = require("../middleware/auth");

const {
  createItem,
  getItems,
  // updateItem,
  deleteItem,
  likeItem,
  dislikeItem,
} = require("../controllers/clothingItems");
const { validateId, validateCardBody } = require("../middleware/validation");

router.post("/", auth, validateCardBody, createItem);
router.get("/", getItems);
// router.put("/:itemId", auth, updateItem);
router.delete("/:itemId", auth, validateId, deleteItem);
router.put("/:itemId/likes", auth, validateId, likeItem);
router.delete("/:itemId/likes", auth, validateId, dislikeItem);

module.exports = router;
