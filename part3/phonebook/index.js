require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const app = express();
const Person = require('./models/person');

morgan.token('body', function getBody(req) {
	if (req.method === 'POST' || req.method === 'PUT') {
		return JSON.stringify(req.body);
	}
});

const errorHandler = (error, request, response, next) => {
	console.log(error.message);

	if (error.name === 'CastError') {
		return response.status(400).send({ error: 'malformatted id' });
	} else if (error.name === 'ValidationError') {
		return response.status(400).json({ error: error.message });
	}

	next(error);
};

app.use(express.json());
app.use(express.static('dist'));
app.use(
	morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

// let persons = [
// 	{
// 		id: '1',
// 		name: 'Arto Hellas',
// 		number: '040-123456',
// 	},
// 	{
// 		id: '2',
// 		name: 'Ada Lovelace',
// 		number: '39-44-5323523',
// 	},
// 	{
// 		id: '3',
// 		name: 'Dan Abramov',
// 		number: '12-43-234345',
// 	},
// 	{
// 		id: '4',
// 		name: 'Mary Poppendieck',
// 		number: '39-23-6423122',
// 	},
// ];

app.get('/', (request, response) => {
	response.send('<h1>Hello World</h1>');
});

app.get('/info', (request, response, next) => {
	Person.find({})
		.then((result) => {
			response.send(
				`<div>
      <p>
        Phonebook has info for ${result.length} people
      </p>
      <p>
        ${new Date()}
      </p>
    </div>`
			);
		})
		.catch((error) => {
			next(error);
		});
});

app.get('/api/persons', (request, response) => {
	Person.find({}).then((result) => {
		response.json(result);
	});
});

app.get('/api/persons/:id', (request, response, next) => {
	Person.findById(request.params.id)
		.then((person) => {
			if (!person) {
				return response.status(404).end();
			}
			response.json(person);
		})
		.catch((error) => {
			next(error);
		});
});

app.post('/api/persons', (request, response, next) => {
	const newPerson = request.body;

	if (!newPerson.name || !newPerson.number) {
		return response.status(400).json({
			error: 'name or number missing',
		});
	}

	const person = new Person({ name: newPerson.name, number: newPerson.number });

	person
		.save()
		.then((savedPerson) => {
			response.json(savedPerson);
		})
		.catch((error) => {
			next(error);
		});
});

app.put('/api/persons/:id', (request, response, next) => {
	const { name, number } = request.body;

	Person.findByIdAndUpdate(
		request.params.id,
		{ name, number },
		{ new: true, runValidators: true, context: 'query' }
	)
		.then((updatedPerson) => {
			if (!updatedPerson) {
				return response.status(400).end();
			}
			response.json(updatedPerson);
		})
		.catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
	Person.findByIdAndDelete(request.params.id)
		.then(() => {
			response.status(204).end();
		})
		.catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
	return response.status(404).send({ error: 'unknown endpoint' });
};

app.use(unknownEndpoint);
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server started on PORT ${PORT}`);
});
