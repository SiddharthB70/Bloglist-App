const bcrypt = require("bcrypt");
const User = require("../models/user");
const usersRouter = require("express").Router();

usersRouter.post("/", async (request, response) => {
    const { username, name, password } = request.body;
    if (password.length < 3) {
        throw {
            name: "PasswordValidation",
            message: "Password length less than 3 characters",
        };
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
        username,
        name,
        passwordHash,
    });

    const savedUser = await newUser.save();

    response.status(201).json(savedUser);
});

usersRouter.get("/", async (request, response) => {
    const users = await User.find({}).populate("blogs", {
        user: 0,
    });
    response.json(users);
});

module.exports = usersRouter;
