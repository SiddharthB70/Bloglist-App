const _ = require("lodash");

const dummy = (blogs) => {
    return 1;
};

const totalLikes = (blogs) => {
    //prettier-ignore
    return blogs.length === 0
        ? 0
        : blogs.reduce((sum, blog) => sum + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
    if (blogs.length === 0) {
        return null;
    }
    const maxLikes = Math.max(...blogs.map((blog) => blog.likes));
    return blogs.find((blog) => blog.likes === maxLikes);
};

const mostBlogs = (blogs) => {
    if (blogs.length === 0) {
        return null;
    }
    const blogsPerAuthor = _.countBy(blogs, (blog) => blog.author);

    return returnMaxProperty(blogsPerAuthor, "blogs");
};

const mostLikes = (blogs) => {
    if (blogs.length === 0) {
        return null;
    }

    const likesPerAuthor = _.transform(
        blogs,
        (result, blog) => {
            _.defaults(result, {
                [blog.author]: 0,
            });
            result[blog.author] += blog.likes;
        },
        {}
    );

    return returnMaxProperty(likesPerAuthor, "likes");
};

const returnMaxProperty = (blogObject, property) => {
    return _.reduce(
        blogObject,
        function (result, value, key) {
            if (value > result[property]) {
                result.author = key;
                result[property] = value;
            }
            return result;
        },
        {
            author: null,
            [property]: 0,
        }
    );
};

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
};
