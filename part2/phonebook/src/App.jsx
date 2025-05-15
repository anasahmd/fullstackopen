import { useEffect, useState } from 'react';
import personService from './services/persons';

const Notification = ({ message }) => {
	if (message === null) {
		return null;
	}

	return (
		<div
			className={`${
				message.type === 'success' ? 'success' : 'error'
			} notification`}
		>
			{message.content}
		</div>
	);
};

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

const Persons = ({ personsToShow, handlePersonDelete }) => {
	return (
		<div>
			{personsToShow.map((person) => (
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
	const [notfication, setNotification] = useState(null);

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
					})
					.catch(() => {
						setNotification({
							content: `Information of ${existingPerson.name} has already been removed from the server`,
							type: 'error',
						});

						setPersons(
							persons.filter((person) => person.name !== existingPerson.name)
						);

						setTimeout(() => {
							setNotification(null);
						}, 5000);
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
			setNotification({ content: `Added ${newPerson.name}`, type: 'success' });

			setTimeout(() => {
				setNotification(null);
			}, 5000);
		});
	};

	const handlePersonDelete = (id) => {
		const existingPerson = persons.find((person) => person.id === id);
		const confirmation = confirm(`Delete ${existingPerson.name}?`);
		if (confirmation) {
			personService
				.remove(id)
				.then(() => setPersons(persons.filter((person) => person.id !== id)))
				.catch(() => {
					setNotification({
						content: `Information of ${existingPerson.name} has already been removed from the server`,
						type: 'error',
					});

					setPersons(
						persons.filter((person) => person.name !== existingPerson.name)
					);

					setTimeout(() => {
						setNotification(null);
					}, 5000);
				});
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

	const personsToShow = search
		? persons.filter((person) =>
				person.name.toLowerCase().includes(search.toLowerCase())
		  )
		: persons;

	return (
		<div>
			<h2>Phonebook</h2>
			<Notification message={notfication} />
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
				personsToShow={personsToShow}
				handlePersonDelete={handlePersonDelete}
			/>
		</div>
	);
};

export default App;
