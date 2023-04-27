const mongoose = require("mongoose");
const User = require("../models/user");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const helper = require("./test_helper");

describe("addition of users", () => {
    test("succeeds with status code 201 for valid user", async () => {
        const usersAtStart = await helper.usersInDb();
        const newUser = {
            username: "mluukkai",
            name: "Matti Luukkainen",
            password: "password",
        };

        await api.post("/api/users").send(newUser).expect(201);

        const usersAtEnd = await helper.usersInDb();
        const users = usersAtEnd.map((user) => user.username);

        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);
        expect(users).toContain("mluukkai");
    });

    test("fails with status code 401 for invalid user", async () => {
        const usersAtStart = await helper.usersInDb();
        const newUser = {
            username: "he",
            name: "check",
            password: "pass",
        };

        await api.post("/api/users").send(newUser).expect(401);

        const usersAtEnd = await helper.usersInDb();
        const users = usersAtEnd.map((user) => user.username);

        expect(usersAtEnd).not.toContain("he");
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    });
});

beforeEach(async () => {
    await User.deleteMany({});
}, 100000);

afterAll(async () => {
    await mongoose.connection.close();
});
