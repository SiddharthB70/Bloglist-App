const blogsRouter = require("express").Router();
const Blog = require("../models/blog");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

blogsRouter.get("/", async (request, response) => {
    const blogs = await Blog.find({});
    response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
    let { title, author, url, likes, comments } = request.body;
    if (!title || !url) {
        return response.status(400).end();
    }
    if (!likes) {
        likes = 0;
    }
    if (!comments) {
        comments = [];
    }

    const user = await User.findById(request.user.id);

    const blog = new Blog({
        title: title,
        author: author,
        url: url,
        likes: likes,
        user: user._id,
        comments: comments,
    });

    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    user.save();
    response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
    const id = request.params.id;
    const blog = await Blog.findById(id);
    if (!blog) {
        return response.status(404).json({ error: "non-existent blog" });
    }

    if (blog.user._id.toString() != request.user.id.toString()) {
        return response.status(401).json({ error: "unauthorized to delete" });
    }
    await Blog.findByIdAndDelete(id);
    response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
    const { title, author, url, likes, comments } = request.body;

    const savedBlog = await Blog.findById(request.params.id);
    if (!savedBlog) {
        return response.status(404).end();
    }

    const blog = {
        title: title,
        author: author,
        url: url,
        likes: likes,
        comments: comments,
    };

    const updatedNote = await Blog.findByIdAndUpdate(request.params.id, blog, {
        new: true,
        runValidators: true,
        context: "query",
    });
    response.status(201).json(updatedNote);
});

blogsRouter.post("/:id/comments", async (request, response) => {
    const blogId = request.params.id;
    const { comment } = request.body;

    const blog = await Blog.findById(blogId);
    if (!blog) {
        return response.status(404).end();
    }

    blog.comments = blog.comments.concat(comment);

    const updatedNote = await Blog.findByIdAndUpdate(
        blogId,
        {
            $set: { comments: blog.comments },
        },
        {
            new: true,
            runValidators: true,
            context: "query",
        }
    );

    response.status(201).json(updatedNote);
});

module.exports = blogsRouter;
