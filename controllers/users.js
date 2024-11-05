const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const {
  badRequest,
  notFound,
  internalServerError,
  unauthorized,
  conflict,
} = require("../utils/errors");
const { JWT_SECRET } = require("../utils/config");

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  if (!email || !password) {
    return res
      .status(badRequest)
      .send({ message: "Email and password fields are required" });
  }

  return User.findOne({ email }).then((existingUser) => {
    if (existingUser) {
      return res
        .status(conflict)
        .send({ message: "This email already exists" });
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
          return res.status(badRequest).send({ message: err.message });
        }
        return res
          .status(internalServerError)
          .send({ message: "An error has ocurred to the server" });
      });
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(badRequest)
      .send({ message: "Email and password fields are required" });
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
        return res
          .status(unauthorized)
          .send({ message: "Incorrect email or password" });
      }
      return res
        .status(internalServerError)
        .send({ message: "An error has ocurred to the server" });
    });
};

const getCurrentUser = (req, res) => {
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
        return res.status(notFound).send({ message: err.message });
      }
      if (err.name === "CastError") {
        return res.status(badRequest).send({ message: err.message });
      }
      return res
        .status(internalServerError)
        .send({ message: "An error has ocurred to the server" });
    });
};

const updateUser = (req, res) => {
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
        return res.status(badRequest).send({ message: err.message });
      }
      if (err.name === "DocumentNotFoundError") {
        return res.status(notFound).send({ message: err.message });
      }
      if (err.name === "CastError") {
        return res.status(badRequest).send({ message: err.message });
      }
      return res
        .status(internalServerError)
        .send({ message: "An error has ocurred to the server" });
    });
};

module.exports = { getCurrentUser, createUser, updateUser, login };
