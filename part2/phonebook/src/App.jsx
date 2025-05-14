import { useEffect, useState } from 'react';
import personService from './services/persons';

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

const Persons = ({ showPerson, handlePersonDelete }) => {
	return (
		<div>
			{showPerson.map((person) => (
				<p key={person.id}>
					{person.name} {person.number}{' '}
					<button onClick={() => handlePersonDelete(person.id)}>delete</button>
				</p>
			))}
		</div>
	);
};

const App = () => {
	const [persons, setPersons] = useState([]);

	useEffect(() => {
		personService.getAll().then((initialPersons) => {
			setPersons(initialPersons);
		});
	}, []);

	const [newName, setNewName] = useState('');
	const [newNumber, setNewNumber] = useState('');
	const [search, setSearch] = useState('');

	const addContact = (event) => {
		event.preventDefault();
		const existingPerson = persons.find((person) => person.name === newName);

		if (existingPerson) {
			const confirmation = confirm(
				`${newName} is already added to phonebook, replace the old number with a new one?`
			);

			if (confirmation) {
				personService
					.update(existingPerson.id, { ...existingPerson, number: newNumber })
					.then((updatedPerson) => {
						setPersons(
							persons.map((person) =>
								person.id === existingPerson.id ? updatedPerson : person
							)
						);
						setNewName('');
						setNewNumber('');
					});
			}
			return;
		}

		const newPerson = {
			name: newName,
			number: newNumber,
		};

		personService.create(newPerson).then((returnedPerson) => {
			setPersons(persons.concat(returnedPerson));
			setNewName('');
			setNewNumber('');
		});
	};

	const handlePersonDelete = (id) => {
		const person = persons.find((person) => person.id === id);
		const confirmation = confirm(`Delete ${person.name}?`);
		if (confirmation) {
			personService
				.remove(id)
				.then(() => setPersons(persons.filter((person) => person.id !== id)));
		}
	};

	const handleNameChange = (event) => {
		setNewName(event.target.value);
	};

	const handleNumberChange = (event) => {
		setNewNumber(event.target.value);
	};

	const handleSearchChange = (event) => {
		setSearch(event.target.value);
	};

	const showPerson = search
		? persons.filter((person) =>
				person.name.toLowerCase().includes(search.toLowerCase())
		  )
		: persons;

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
				showPerson={showPerson}
				handlePersonDelete={handlePersonDelete}
			/>
		</div>
	);
};

export default App;
