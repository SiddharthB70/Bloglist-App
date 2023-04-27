const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        autopopulate: true,
    },
    comments: [String],
});

blogSchema.plugin(require("mongoose-autopopulate"));

blogSchema.set("toJSON", {
    transform: (document, requestedObject) => {
        requestedObject.id = requestedObject._id.toString();
        delete requestedObject._id;
        delete requestedObject.__v;
    },
});

blogSchema.pre("findOneAndDelete", async function (next) {
    const docToUpdate = await this.model.findOne(this.getQuery());
    docToUpdate
        .model("User")
        .updateMany({ $pull: { blogs: docToUpdate._id } }, next);
});

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
