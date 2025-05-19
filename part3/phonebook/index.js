const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

morgan.token('body', function getBody(req) {
	if (req.method === 'POST') {
		return JSON.stringify(req.body);
	}
});

app.use(
	morgan(':method :url :status :res[content-length] - :response-time ms :body')
);

let persons = [
	{
		id: '1',
		name: 'Arto Hellas',
		number: '040-123456',
	},
	{
		id: '2',
		name: 'Ada Lovelace',
		number: '39-44-5323523',
	},
	{
		id: '3',
		name: 'Dan Abramov',
		number: '12-43-234345',
	},
	{
		id: '4',
		name: 'Mary Poppendieck',
		number: '39-23-6423122',
	},
];

app.get('/', (request, response) => {
	response.send('<h1>Hello World</h1>');
});

app.get('/info', (request, response) => {
	response.send(
		`<div>
      <p>
        Phonebook has info for ${persons.length} people
      </p>
      <p>
        ${new Date()}
      </p>
    </div>`
	);
});

app.get('/api/persons', (request, response) => {
	response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
	const id = request.params.id;
	const person = persons.find((person) => person.id === id);

	if (!person) {
		return response.status(404).end();
	}

	response.json(person);
});

app.post('/api/persons', (request, response) => {
	const newPerson = request.body;

	if (!newPerson.name || !newPerson.number) {
		return response.status(400).json({
			error: 'name or number missing',
		});
	}

	if (
		persons.find(
			(person) => person.name.toLowerCase() === newPerson.name.toLowerCase()
		)
	) {
		return response.status(400).json({
			error: 'name must be unique',
		});
	}
	newPerson.id = String(Math.floor(Math.random() * 100000));
	persons.push(newPerson);
	response.json(newPerson);
});

app.delete('/api/persons/:id', (request, response) => {
	const id = request.params.id;
	persons = persons.filter((person) => person.id !== id);
	response.status(204).end();
});

const PORT = 3001;

app.listen(PORT, () => {
	console.log(`Server started on PORT ${PORT}`);
});
