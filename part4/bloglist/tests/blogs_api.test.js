const assert = require('node:assert');
const { test, after, beforeEach } = require('node:test');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
	await Blog.deleteMany({});
	await Blog.insertMany(helper.initialBlogs);
});

test('blogs are returned in json format', async () => {
	await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/);
});

test('all blogs are returned', async () => {
	const response = await api.get('/api/blogs');

	assert.strictEqual(response.body.length, helper.initialBlogs.length);
});

test('unique identifier is named id', async () => {
	const response = await api.get('/api/blogs');

	assert('id' in response.body[0]);
});

test('post request creates a new blog post', async () => {
	const newBlog = {
		title: 'Testing is easy',
		author: 'Anas Ahmad',
		url: 'anasahmad.dev',
		likes: 1,
	};

	await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/);

	const blogsAfterPost = await helper.blogsInDb();

	assert.strictEqual(blogsAfterPost.length, helper.initialBlogs.length + 1);

	const titles = await blogsAfterPost.map((n) => n.title);
	assert(titles.includes('Testing is easy'));
});

test('empty likes field creates a blog with 0 likes', async () => {
	const newBlog = {
		title: 'Oops! No like sent.',
		author: 'Dumb user',
		url: 'test.com',
	};

	const response = await api
		.post('/api/blogs')
		.send(newBlog)
		.expect(201)
		.expect('Content-Type', /application\/json/);

	assert.strictEqual(response.body.likes, 0);
});

test('missing title or url returns status 400', async () => {
	await api
		.post('/api/blogs')
		.send({ title: 'Blog without url should return 400' })
		.expect(400)
		.expect('Content-Type', /application\/json/);

	await api
		.post('/api/blogs')
		.send({ url: 'anasahmad.dev/blog-without-title' })
		.expect(400)
		.expect('Content-Type', /application\/json/);
});

test('delete blog by id', async () => {
	const blogsAtStart = await helper.blogsInDb();
	const blogToDelete = blogsAtStart[0];

	await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

	const blogsAtEnd = await helper.blogsInDb();

	const titles = blogsAtEnd.map((n) => n.title);

	assert.strictEqual(blogsAtStart.length - 1, blogsAtEnd.length);

	assert(!titles.includes(blogToDelete.title));
});

test('update blog', async () => {
	const blogs = await helper.blogsInDb();
	const blogToUpdate = blogs[0];

	await api
		.put(`/api/blogs/${blogToUpdate.id}`)
		.send({
			title: 'Updated Title',
			author: 'Update Author',
			likes: blogToUpdate.likes + 1,
		})
		.expect(200)
		.expect('Content-Type', /application\/json/);

	const blogsAfterUpdate = await helper.blogsInDb();

	const titles = blogsAfterUpdate.map((n) => n.title);

	assert(titles.includes('Updated Title'));

	const foundBlog = blogsAfterUpdate.find(
		(blog) => blog.title === 'Updated Title'
	);

	assert.strictEqual(foundBlog.likes, blogToUpdate.likes + 1);
});

after(async () => {
	await mongoose.connection.close();
});
