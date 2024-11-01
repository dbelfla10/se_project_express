const User = require("../models/user");
const {
  badRequest,
  notFound,
  internalServerError,
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(internalServerError)
        .send({ message: "An error has ocurred to the server" });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  return User.findOne({ email }).then((user) => {
    if (user) {
      return res.status(409).send({ message: "This email already exists" });
    }
    return User.create({ name, avatar, email, password })
      .then((user) => res.status(201).send(user))
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

  if (!email | password) {
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
      if (err.message === "Incorrect email or password") {
        return res.status(401).send({ message: "Incorrect email or password" });
      }
    });
};

const getUser = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    .orFail()
    .then((user) => res.status(200).send(user))
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

module.exports = { getUsers, createUser, getUser, login };
