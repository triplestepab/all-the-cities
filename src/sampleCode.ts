import * as allTheCities from ".";

export function Sample(): void {
	// ****************************************************
	// Find two cities and calculate distance between them
	// ****************************************************

	const simple = allTheCities.findCity("XK", "Açarevë");
	console.log(`Found Açarevë in XK:${JSON.stringify(simple)}`);

	// ****************************************************
	// Find two cities and calculate distance between them
	// ****************************************************

	const city1 = allTheCities.findCity("SE", "Eslöv");
	const city2 = allTheCities.findCity("SE", "Stockholm");

	if (city1.length > 0 && city2.length > 0) {
		console.log("City 1 found:");
		console.log(city1[0]);
		console.log("City 2 found:");
		console.log(city2[0]);
		console.log("Distance between them:");
		console.log(allTheCities.distanceBetweenCities(city1[0], city2[0]));
	}

	// ****************************************************
	// Find the 10 nearest cities on these coordinates
	// ****************************************************

	const lat = 55.839435 as Latitude;
	const long = 13.303121 as Longitude;

	console.log(`Find the 10 nearest cities on these coordinates. Lat: ${lat}, Long: ${long}`);
	console.log(allTheCities.findNearestCities("SE", lat, long, 10));

	// ****************************************************
	// Find the cities within 10km on these coordinates
	// ****************************************************

	console.log(`Find the cities within 10km on these coordinates. Lat: ${lat}, Long: ${long}`);
	console.log(allTheCities.findNearBy("SE", lat, long, 10000));

	// ****************************************************
	// Find all cities with a population over 100000 and sort them by population
	// ****************************************************

	const allCities = allTheCities.getData("SE");
	console.log(allCities.filter(c => c.population > 100000).sort((c1, c2) => c2.population - c1.population).map(c => c.name));
}
