const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const initialBlogs = [
	{
		title: 'React patterns',
		author: 'Michael Chan',
		url: 'https://reactpatterns.com/',
		likes: 7,
	},
	{
		title: 'Go To Statement Considered Harmful',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
		likes: 5,
	},
	{
		title: 'Canonical string reduction',
		author: 'Edsger W. Dijkstra',
		url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
		likes: 12,
	},
	{
		title: 'First class tests',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
		likes: 10,
	},
	{
		title: 'TDD harms architecture',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
		likes: 0,
	},
	{
		title: 'Type wars',
		author: 'Robert C. Martin',
		url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
		likes: 2,
	},
];

const nonExisitingId = async () => {
	const blog = new Blog(initialBlogs[0]);
	await blog.save();
	await blog.deleteOne();

	return blog._id.toString();
};

const blogsInDb = async () => {
	const blogs = await Blog.find({});
	return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
	const users = await User.find({});
	return users.map((user) => user.toJSON());
};

const getAuthTokenAndUserId = async () => {
	await User.deleteMany({});

	const passwordHash = await bcrypt.hash('secret', 10);
	const user = new User({
		name: 'Test User',
		username: 'testuser',
		passwordHash,
	});

	await user.save();

	const userForToken = {
		username: user.username,
		id: user._id.toString(),
	};

	const token = jwt.sign(userForToken, process.env.JWT_SECRET);

	return { token, userId: user._id.toString() };
};

module.exports = {
	initialBlogs,
	nonExisitingId,
	blogsInDb,
	usersInDb,
	getAuthTokenAndUserId,
};
