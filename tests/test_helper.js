const Blog = require("../models/blog");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const initialBlogs = [
    {
        title: "React patterns",
        author: "Michael Chan",
        url: "https://reactpatterns.com/",
        likes: 7,
    },
    {
        title: "Go To Statement Considered Harmful",
        author: "Edsger W. Dijkstra",
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
        likes: 5,
    },
    {
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
    },
];

const initialUsers = [
    {
        username: "username1",
        name: "name1",
        password: "password1",
    },
    {
        username: "username2",
        name: "name2",
        password: "password2",
    },
];

const initialHashedUsers = [
    {
        username: "username1",
        name: "name1",
    },
    {
        username: "username2",
        name: "name2",
    },
];

const blogsInDb = async () => {
    const blogs = await Blog.find({});
    return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
    const users = await User.find({});
    return users.map((user) => user.toJSON());
};

const hashInitialPasswords = async () => {
    for (let index in initialUsers) {
        const password = initialUsers[index].password;
        initialHashedUsers[index].passwordHash = await bcrypt.hash(
            password,
            10
        );
    }
};

const setBlogUsers = (users) => {
    for (let i = 0; i <= 1; i++) {
        initialBlogs[i].user = users[0]._id;
    }
    initialBlogs[2].user = users[1]._id;
};

const setUserBlogs = async (blogs) => {
    for (let blog of blogs) {
        const user = await User.findById(blog.user);
        user.blogs = user.blogs.concat(blog._id);
        await user.save();
    }
};

module.exports = {
    initialBlogs,
    initialHashedUsers,
    blogsInDb,
    usersInDb,
    hashInitialPasswords,
    setBlogUsers,
    setUserBlogs,
};
