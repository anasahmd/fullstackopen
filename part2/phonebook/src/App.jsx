import { useState } from 'react';

const Filter = ({ search, handleSearchChange }) => {
	return (
		<div>
			filter shown wih <input value={search} onChange={handleSearchChange} />
		</div>
	);
};

const PersonForm = ({
	addContact,
	newName,
	handleNameChange,
	newNumber,
	handleNumberChange,
}) => {
	return (
		<form onSubmit={addContact}>
			<div>
				name: <input value={newName} onChange={handleNameChange} />
			</div>
			<div>
				number: <input value={newNumber} onChange={handleNumberChange} />
			</div>
			<div>
				<button type="submit">add</button>
			</div>
		</form>
	);
};

const Persons = ({ search, filteredPersons, persons }) => {
	return (
		<div>
			{search
				? filteredPersons.map((person) => (
						<p key={person.id}>
							{person.name} {person.number}
						</p>
				  ))
				: persons.map((person) => (
						<p key={person.id}>
							{person.name} {person.number}
						</p>
				  ))}
		</div>
	);
};

const App = () => {
	const [persons, setPersons] = useState([
		{ name: 'Arto Hellas', number: '040-123456', id: 1 },
		{ name: 'Ada Lovelace', number: '39-44-5323523', id: 2 },
		{ name: 'Dan Abramov', number: '12-43-234345', id: 3 },
		{ name: 'Mary Poppendieck', number: '39-23-6423122', id: 4 },
	]);

	const [filteredPersons, setFilteredPersons] = useState(persons);

	const [newName, setNewName] = useState('');
	const [newNumber, setNewNumber] = useState('');
	const [search, setSearch] = useState('');

	const addContact = (event) => {
		event.preventDefault();
		if (persons.some((person) => person.name === newName)) {
			alert(`${newName} is already added to phonebook`);
			return;
		}
		setPersons(
			persons.concat({
				name: newName,
				number: newNumber,
				id: persons.length + 1,
			})
		);
		setNewName('');
	};

	const handleNameChange = (event) => {
		setNewName(event.target.value);
	};

	const handleNumberChange = (event) => {
		setNewNumber(event.target.value);
	};

	const handleSearchChange = (event) => {
		setSearch(event.target.value);

		setFilteredPersons(
			persons.filter((person) =>
				person.name.toLowerCase().includes(event.target.value.toLowerCase())
			)
		);
	};

	return (
		<div>
			<h2>Phonebook</h2>
			<Filter search={search} handleSearchChange={handleSearchChange} />
			<PersonForm
				addContact={addContact}
				newName={newName}
				handleNameChange={handleNameChange}
				newNumber={newNumber}
				handleNumberChange={handleNumberChange}
			/>
			<h2>Numbers</h2>
			<Persons
				search={search}
				persons={persons}
				filteredPersons={filteredPersons}
			/>
		</div>
	);
};

export default App;
