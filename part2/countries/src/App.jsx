import { useState, useEffect } from 'react';
import axios from 'axios';
const weather_key = import.meta.env.VITE_OPEN_WEATHER_API_KEY;

const WeatherInfo = ({ weather }) => {
	return (
		<>
			<h2>Weather in {weather.name}</h2>
			<div>Temperature {(weather.main.temp - 273.15).toFixed(2)} Celsius</div>
			<img
				src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
				alt={weather.weather[0].description}
			/>
			<div>Wind {weather.wind.speed} m/s</div>
		</>
	);
};

const CountryInfo = ({ country }) => {
	const [weather, setWeather] = useState(null);
	useEffect(() => {
		axios
			.get(
				`https://api.openweathermap.org/data/2.5/weather?lat=${country.latlng[0]}&lon=${country.latlng[1]}&appid=${weather_key}`
			)
			.then((response) => {
				setWeather(response.data);
				console.log(response.data);
			});
	}, [country]);

	return (
		<>
			<h1>{country.name.common}</h1>
			<div>Capital {country.capital.join(', ')}</div>
			<div>Area {country.area}</div>
			<h2>Languages</h2>
			<ul>
				{Object.values(country.languages).map((lang, index) => (
					<li key={index}>{lang}</li>
				))}
			</ul>
			<img src={country.flags.png} alt={country.flags.alt} />
			{weather && <WeatherInfo weather={weather} />}
		</>
	);
};

const App = () => {
	const [search, setSearch] = useState('');
	const [allCountries, setAllCountries] = useState([]);

	const handleChange = (event) => {
		setSearch(event.target.value);
	};

	useEffect(() => {
		axios
			.get(`https://studies.cs.helsinki.fi/restcountries/api/all`)
			.then((response) => {
				setAllCountries(response.data);
			});
	}, []);

	const countriesToShow = allCountries.filter((country) =>
		country.name.common.toLowerCase().includes(search.toLowerCase())
	);

	return (
		<div>
			<input type="text" value={search} onChange={handleChange} />
			{countriesToShow.length > 10 && (
				<p>Too many matches, specify another filter</p>
			)}
			{countriesToShow.length < 10 &&
				countriesToShow.length > 1 &&
				countriesToShow.map((country) => (
					<div key={country.name.common}>
						{country.name.common}{' '}
						<button
							onClick={() => {
								setSearch(country.name.common);
							}}
						>
							Show
						</button>
					</div>
				))}

			{countriesToShow.length === 1 && (
				<CountryInfo country={countriesToShow[0]} />
			)}
		</div>
	);
};

export default App;
