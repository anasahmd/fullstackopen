const assert = require('node:assert');
const { test, after, beforeEach, describe } = require('node:test');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const helper = require('./test_helper');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const api = supertest(app);

describe('when there is initially one user at db', () => {
	beforeEach(async () => {
		await User.deleteMany({});

		const passwordHash = await bcrypt.hash('verysecret', 10);
		const user = new User({ username: 'root', passwordHash });

		await user.save();
	});

	test('creation succeeds with a fresh username', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'anasahmd',
			name: 'Anas Ahmad',
			password: 'veryverysecret',
		};

		await api
			.post('/api/users')
			.send(newUser)
			.expect(201)
			.expect('Content-Type', /application\/json/);

		const usersAtEnd = await helper.usersInDb();
		assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

		const usernames = usersAtEnd.map((u) => u.username);
		assert(usernames.includes(newUser.username));
	});

	test('creation fails with proper statuscode and message if username already taken', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'root',
			name: 'Superuser',
			password: 'secret',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);

		const usersAtEnd = await helper.usersInDb();
		assert(result.body.error.includes('expected `username` to be unique'));

		assert.strictEqual(usersAtEnd.length, usersAtStart.length);
	});

	test('creation fails if username is invalid', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'ab',
			name: 'Invalid User',
			password: 'secret',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);

		const usersAtEnd = await helper.usersInDb();
		assert(
			result.body.error.includes('username must be atleast 3 characters long')
		);

		assert.strictEqual(usersAtEnd.length, usersAtStart.length);
	});

	test('creation fails if password is invalid', async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: 'abcd',
			name: 'Invalid User',
			password: 'ab',
		};

		const result = await api
			.post('/api/users')
			.send(newUser)
			.expect(400)
			.expect('Content-Type', /application\/json/);

		const usersAtEnd = await helper.usersInDb();
		assert(
			result.body.error.includes('password must be atleast 3 characters long')
		);

		assert.strictEqual(usersAtEnd.length, usersAtStart.length);
	});
});

after(async () => {
	await mongoose.connection.close();
});
