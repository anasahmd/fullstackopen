const blogRouter = require('express').Router();
const Blog = require('../models/blog');

blogRouter.get('/', async (request, response) => {
	const blogs = await Blog.find({});
	response.json(blogs);
});

blogRouter.post('/', async (request, response) => {
	const body = request.body;
	if (!body.title || !body.author || !body.url) {
		return response
			.status(400)
			.json({ error: 'title, author or url is missing.' });
	}

	const blog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes || 0,
	});

	const savedBlog = await blog.save();
	response.status(201).json(savedBlog);
});

blogRouter.put('/:id', async (request, response, next) => {
	const { title, url, author, likes } = request.body;

	const blog = await Blog.findById(request.params.id);

	if (!blog) {
		return response.status(404).end();
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
});

blogRouter.delete('/:id', async (request, response) => {
	await Blog.findByIdAndDelete(request.params.id);
	response.status(204).end();
});

module.exports = blogRouter;
