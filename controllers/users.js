const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");

const BadRequestError = require("../errors/BadRequestError");
const ConflictError = require("../errors/ConflictError");
const NotFoundError = require("../errors/NotFoundError");
const UnauthorizedError = require("../errors/UnauthorizedError");

const createUser = (req, res, next) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password fields are required"));
  }

  return User.findOne({ email }).then((existingUser) => {
    if (existingUser) {
      return next(new ConflictError("This email already exists"));
    }
    return bcrypt
      .hash(req.body.password, 10)
      .then((hash) => User.create({ name, avatar, email, password: hash }))
      .then((user) =>
        res
          .status(201)
          .send({ name: user.name, avatar: user.avatar, email: user.email })
      )
      .catch((err) => {
        console.error(err);
        if (err.name === "ValidationError") {
          return next(new BadRequestError("Data is invalid"));
        }
        return next(err);
      });
  });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and password fields are required"));
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.status(200).send({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.message === "Incorrect email or password") {
        return next(new UnauthorizedError("Incorrect email or password"));
      }
      return next(err);
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => {
      const { _id, email, avatar, name } = user;

      res.status(200).send({
        _id,
        email,
        avatar,
        name,
      });
    })
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User was not Found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Data is invalid"));
      }
      return next(err);
    });
};

const updateUser = (req, res, next) => {
  const { name, avatar } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .orFail()
    .then((user) =>
      res.status(200).send({ name: user.name, avatar: user.avatar })
    )
    .catch((err) => {
      console.error(err);
      if (err.name === "ValidationError") {
        return next(new BadRequestError("Data is invalid"));
      }
      if (err.name === "DocumentNotFoundError") {
        return next(new NotFoundError("User was not found"));
      }
      if (err.name === "CastError") {
        return next(new BadRequestError("Data is invalid"));
      }
      return next(err);
    });
};

module.exports = { getCurrentUser, createUser, updateUser, login };
