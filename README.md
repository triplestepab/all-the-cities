# @triplestep/all-the-cities

This package contains all the cities with population, gps coordinates and (to some degree) alternative spellings for the following countries:

AD,	AE,	AF,	AG,	AI,	AL,	AM,	AN,	AO,	AQ,	AR,	AS,	AT,	AU,	AW,	AX,	AZ,	BA,	BB,	BD,	BE,	BF,	BG,	BH,	BI,	BJ,	BL,	BM,	BN,	BO,	BQ,	BR,	BS,	BT,	BV,	BW,	BY,	BZ,	CA,	CC,	CD,	CF,	CG,	CH,	CI,	CK,	CL,	CM,	CN,	CO,	CR,	CS,	CU,	CV,	CW,	CX,	CY,	CZ,	DE,	DJ,	DK,	DM,	DO,	DZ,	EC,	EE,	EG,	EH,	ER,	ES,	ET,	FI,	FJ,	FK,	FM,	FO,	FR,	GA,	GB,	GD,	GE,	GF,	GG,	GH,	GI,	GL,	GM,	GN,	GP,	GQ,	GR,	GS,	GT,	GU,	GW,	GY,	HK,	HM,	HN,	HR,	HT,	HU,	ID,	IE,	IL,	IM,	IN,	IO,	IQ,	IR,	IS,	IT,	JE,	JM,	JO,	JP,	KE,	KG,	KH,	KI,	KM,	KN,	KP,	KR,	KW,	KY,	KZ,	LA,	LB,	LC,	LI,	LK,	LR,	LS,	LT,	LU,	LV,	LY,	MA,	MC,	MD,	ME,	MF,	MG,	MH,	MK,	ML,	MM,	MN,	MO,	MP,	MQ,	MR,	MS,	MT,	MU,	MV,	MW,	MX,	MY,	MZ,	NA,	NC,	NE,	NF,	NG,	NI,	NL,	NO,	NP,	NR,	NU,	NZ,	OM,	PA,	PE,	PF,	PG,	PH,	PK,	PL,	PM,	PN,	PR,	PS,	PT,	PW,	PY,	QA,	RE,	RO,	RS,	RU,	RW,	SA,	SB,	SC,	SD,	SE,	SG,	SH,	SI,	SJ,	SK,	SL,	SM,	SN,	SO,	SR,	SS,	ST,	SV,	SX,	SY,	SZ,	TC,	TD,	TF,	TG,	TH,	TJ,	TK,	TL,	TM,	TN,	TO,	TR,	TT,	TV,	TW,	TZ,	UA,	UG,	UM,	US,	UY,	UZ,	VA,	VC,	VE,	VG,	VI,	VN,	VU,	WF,	WS,	XK,	YE,	YT,	YU,	ZA,	ZM,	ZW,

It also contains code to accurately calcaulate the distance between two given gps coordinates.

The data comes from geonames.org. For a list of countries, see <http://download.geonames.org/export/dump/>.


## Sample code

```typescript
	import * as allTheCities from "@triplestep/all-the-cities";

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

```

## Branded data types

The `Longitude` and `Latitude` datatypes are branded. To "cast" numbers to the right type, do this:

```typescript
	const lat = 55.839435 as Latitude;
	const long = 13.303121 as Longitude;
```

## Sorting info

The data was sorted using:

```typescript
	const collator = new Intl.Collator(countryCode);
	countryData.sort((a, b) => collator.compare(a.name, b.name));
```

## Notes on memory usage

Upon searching a country, the file for that requested country is loaded into memory and kept there. Upon searching all countries, there's a good chance the memory footprint is huge (The `countryData` folder is over 800Mb on disk).

# Thanks to (including license info)

## Code for calculating distance

Thanks to Chris Veness at Movable-Type for some serious math and code (licensed under MIT). Take a look at the excellent work at <https://www.movable-type.co.uk/scripts/latlong.html>.

## City Data

The original data was downloaded from <http://download.geonames.org/export/dump/> (licensed under a Creative Commons Attribution 4.0 License).
