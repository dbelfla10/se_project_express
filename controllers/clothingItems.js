const ClothingItem = require("../models/clothingItem");
// const {
//   badRequest,
//   notFound,
//   internalServerError,
//   forbidden,
// } = require("../utils/errors");

const BadRequestError = require("../errors/BadRequestError");
const ForbiddenError = require("../errors/ForbiddenError");
const NotFoundError = require("../errors/NotFoundError");

const createItem = (req, res, next) => {
  console.log(req);
  console.log(req.body);

  const { name, weather, imageUrl } = req.body;

  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((item) => {
      res.status(201).send({ data: item });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Data is invalid"));
        // return res.status(badRequest).send({ message: err.message });
      }
      return next(err);
      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has ocurred to the server" });
    });
};

const getItems = (req, res, next) => {
  ClothingItem.find({})
    .then((items) => res.status(200).send({ data: items }))
    .catch((err) => {
      console.error(err);
      return next(err);
      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has ocurred to the server" });
    });
};

// const updateItem = (req, res) => {
//   const { itemId } = req.params;
//   const { imageURL } = req.body;

//   ClothingItem.findByIdAndUpdate(itemId, { $set: { imageURL } })
//     .orFail()
//     .then((item) => res.status(200).send({ data: item }))
//     .catch((err) => {
//       console.error(err);
//       if (err.name === "DocumentNotFoundError") {
//         return res.status(notFound).send({ message: err.message });
//       }
//       return res
//         .status(internalServerError)
//         .send({ message: "An error has ocurred to the server" });
//     });
// };

const deleteItem = (req, res, next) => {
  const { itemId } = req.params;

  ClothingItem.findById(itemId)
    .orFail()
    .then((item) => {
      if (String(item.owner) !== req.user._id) {
        return next(new ForbiddenError("Access is forbidden"));
        // return res.status(forbidden).send({ message: "Access is forbidden" });
      }
      return item
        .deleteOne()
        .then(() =>
          res.status(200).send({ message: "Item successfully deleted" })
        );
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError("Data is invalid"));
        // return res.status(badRequest).send({ message: err.message });
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item was not found"));
        // return res.status(notFound).send({ message: err.message });
      }
      return next(err);
      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has ocurred to the server" });
    });
};

const likeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => res.status(200).send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError("Data is invalid"));
        // return res.status(badRequest).send({ message: err.message });
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("Item was not found"));
        // return res.status(notFound).send({ message: err.message });
      }
      return next(err);
      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has ocurred to the server" });
    });
};

const dislikeItem = (req, res, next) => {
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .orFail()
    .then((item) => res.status(200).send({ data: item }))
    .catch((err) => {
      console.error(err);
      if (err.name === "CastError") {
        return next(new BadRequestError(err.message));
        // return res.status(badRequest).send({ message: err.message });
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError(err.message));
        // return res.status(notFound).send({ message: err.message });
      }
      return next(err);
      // return res
      //   .status(internalServerError)
      //   .send({ message: "An error has ocurred to the server" });
    });
};

module.exports = {
  createItem,
  getItems,
  // updateItem,
  deleteItem,
  likeItem,
  dislikeItem,
};
