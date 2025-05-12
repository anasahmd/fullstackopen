const Header = ({ name }) => <h1>{name}</h1>;

const Part = ({ name, exercises }) => (
	<p>
		{name} {exercises}
	</p>
);

const Content = ({ parts }) => {
	return (
		<>
			{parts.map((part) => (
				<Part key={part.id} name={part.name} exercises={part.exercises} />
			))}
		</>
	);
};

const Total = ({ total }) => (
	<p>
		<b>total of {total} exercises</b>
	</p>
);

const Course = ({ course }) => {
	return (
		<>
			<Header name={course.name} />
			<Content parts={course.parts} />
			<Total
				total={course.parts.reduce((acc, curr) => acc + curr.exercises, 0)}
			/>
		</>
	);
};

export default Course;
