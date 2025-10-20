const blogRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const middleware = require('../utils/middleware');

blogRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({}).populate('user', { name: 1, username: 1 });
	response.json(blogs);
});

blogRouter.post('/', middleware.userExtractor, async (request, response) => {
	const body = request.body;
	if (!body.title || !body.author || !body.url) {
		return response
			.status(400)
			.json({ error: 'title, author or url is missing.' });
	}

	const user = request.user;

	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes || 0,
		user: user._id,
	});

	const savedBlog = await blog.save();

	user.blogs = user.blogs.concat(savedBlog._id);
	await user.save();

	response.status(201).json(savedBlog);
});

blogRouter.put(
	'/:id',
	middleware.userExtractor,
	async (request, response, next) => {
		const { title, url, author, likes } = request.body;
		const user = request.user;

		const blog = await Blog.findById(request.params.id);

		if (!blog) {
			return response.status(404).end();
		}

		if (blog.user.toString() !== user._id.toString()) {
			return response.status(401).json({ error: 'invalid operation' });
		}

		blog.title = title;
		blog.url = url;
		blog.author = author;
		blog.likes = likes;

		try {
			const updatedBlog = await blog.save();
			response.json(updatedBlog);
		} catch (e) {
			next(e);
		}
	}
);

blogRouter.delete(
	'/:id',
	middleware.userExtractor,
	async (request, response) => {
		const user = request.user;

		const blog = await Blog.findById(request.params.id);

		if (!blog) {
			return response.status(401).json({ error: 'blog not found' });
		}

		if (blog.user.toString() !== user._id.toString()) {
			return response.status(401).json({ error: 'invalid operation' });
		}

		await blog.deleteOne();

		await User.updateOne({ _id: user._id }, { $pull: { blogs: blog._id } });

		response.status(204).end();
	}
);

module.exports = blogRouter;
