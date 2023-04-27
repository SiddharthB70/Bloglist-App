const mongoose = require("mongoose");
const app = require("../app");
const supertest = require("supertest");
const agent = require("supertest").agent(app);
const helper = require("./test_helper");
const Blog = require("../models/blog");
const User = require("../models/user");

let tokenResponse;
const hook = (method = "post") => {
    return (args) =>
        supertest(app)
            [method](args)
            .set("Authorization", `bearer ${tokenResponse.body.token}`);
};

const api = {
    post: hook("post"),
    get: hook("get"),
    put: hook("put"),
    delete: hook("delete"),
};

describe("viewing blogs initially in database", () => {
    test("all blogs are returned with status code 200", async () => {
        const response = await api.get("/api/blogs").expect(200);

        expect(response.body).toHaveLength(helper.initialBlogs.length);
    });

    test("all blogs have id", async () => {
        const response = await api.get("/api/blogs");
        const blogs = response.body;
        console.log;
        for (let blog of blogs) {
            expect(blog.id).toBeDefined();
        }
    });
});

describe("creating a new blog", () => {
    test("succeeds with status code 201 for valid data", async () => {
        const newNote = {
            title: "Post added to database",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 4,
        };

        await api.post("/api/blogs").send(newNote).expect(201);

        const blogsAtEnd = await helper.blogsInDb();
        const titles = blogsAtEnd.map((blog) => blog.title);

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1);
        expect(titles).toContain("Post added to database");
    });

    test("sets likes to 0 when it is not defined", async () => {
        const newNote = {
            title: "Post added to database",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        };

        await api.post("/api/blogs").send(newNote);

        const blogsAtEnd = await helper.blogsInDb();
        const testBlog = blogsAtEnd.find(
            (blog) =>
                blog.title === "Post added to database" &&
                blog.author === "Edsger W. Dijkstra"
        );

        expect(testBlog.likes).toBe(0);
    });

    test("fails with status code 400 if url is not defined", async () => {
        const newNote = {
            title: "Post added to database",
            author: "Edsger W. Dijkstra",
        };

        await api.post("/api/blogs").send(newNote).expect(400);
    });

    test("fails with status code 400 if title is not defined", async () => {
        const newNote = {
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        };

        await api.post("/api/blogs").send(newNote).expect(400);
    });
});

describe("deleting a blog", () => {
    test("succeeds with status code 204 for valid id", async () => {
        const blogsAtStart = await helper.blogsInDb();
        const firstNote = blogsAtStart[0];

        await api.delete(`/api/blogs/${firstNote.id}`).expect(204);

        const blogsAtEnd = await helper.blogsInDb();

        expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1);

        const content = blogsAtEnd.map((blog) => blog.title);

        expect(blogsAtEnd).not.toContain(firstNote.title);
    });
});

describe("updating a blog", () => {
    test("with likes succeeds for valid id", async () => {
        const blogsAtStart = await helper.blogsInDb();
        const testBlog = blogsAtStart[0];

        const changedBlog = {
            ...testBlog,
            likes: 2,
        };

        const updatedBlog = await api
            .put(`/api/blogs/${testBlog.id}`)
            .send(changedBlog);

        expect(updatedBlog.body.likes).toBe(2);

        const blogsAtEnd = await helper.blogsInDb();
        expect(blogsAtEnd).toContainEqual({
            ...testBlog,
            likes: 2,
        });
    });

    test("fails with status code 404 for wrong id", async () => {
        const blogsAtStart = await helper.blogsInDb();
        const testBlog = blogsAtStart[0];
        const newNote = {
            ...testBlog,
            id: "641347239d5ec06fe04f62a4",
        };

        await api.put(`/api/blogs/${newNote.id}`).send(newNote).expect(404);
    });
});

beforeEach(async () => {
    await Blog.deleteMany({});
    await User.deleteMany({});
    await helper.hashInitialPasswords();
    const users = await User.insertMany(helper.initialHashedUsers);
    await helper.setBlogUsers(users);
    const blogs = await Blog.insertMany(helper.initialBlogs);
    await helper.setUserBlogs(blogs);
    tokenResponse = await agent.post("/api/login").send({
        username: "username1",
        password: "password1",
    });
}, 100000);

afterAll(async () => {
    await mongoose.connection.close();
});
