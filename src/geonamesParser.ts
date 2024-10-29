import events from "events";
import * as fs from "fs";
import * as path from "path";
import readline from "readline";
import { citiesOnly, City } from "./types";

/*

Download a country or allCountries.zip from this page:
http://download.geonames.org/export/dump/

const path = "/PATH/allCountries.txt";
const destinationFolder = "./countryData";
geonamesParser.extractCitiesData(path, destinationFolder);

*/

export async function extractCitiesData(allTheCountriesFile: string, destinationFolder: string, batchSize = 33): Promise<void> {
    console.log(`Source file: ${allTheCountriesFile}`);
    console.log(`Destination folder: ${destinationFolder}`);
    const countryList = await extractCountryList(allTheCountriesFile);

    console.log(`Extracting data. BatchSize=${batchSize}...`);
    let totalCities = 0;
    for (let i = 0; i < countryList.length; i += batchSize) {
        const batchCountries = countryList.slice(i, i + batchSize);
        totalCities += await processCountries(batchCountries, allTheCountriesFile, destinationFolder);
    }

    console.log(`Done. Total cities=${totalCities}`);
}

export async function extractCountryList(allTheCountriesFile: string): Promise<string[]> {
    console.log("Finding all countries...");

    let result: string[] = [];

    const rl = readline.createInterface({
        input: fs.createReadStream(allTheCountriesFile, "utf-8"),
        crlfDelay: Infinity,
    });

    rl.on("line", line => {
        if (!result.includes(line.split("\t")[8]))
            result.push(line.split("\t")[8]);
    });

    await events.once(rl, "close");

    result = result.filter(c => c); // Remove empty strings

    console.log(`Found ${result.length} countries. List=${result.join(", ")}`);

    return result;
}
export async function processCountries(countries: string[], allTheCountriesFile: string, destinationFolder: string): Promise<number> {
    console.log(`Processing countries...List=${countries.join(", ")}`);

    let citiesWrittenCount = 0;
    const mapdata: {
        [county: string]: City[];
    } = {};
    const processLine = (line: string): void => {
        // Documentation from http://download.geonames.org/export/dump/ (scroll down!)
        const [
            id, //  integer id of record in geonames database
            name, //  name of geographical point (utf8) varchar(200)
            _asciiname, //  name of geographical point in plain ascii characters, varchar(200)
            alternatenames, //  alternatenames, comma separated, ascii names automatically transliterated, convenience attribute from alternatename table, varchar(10000)
            lat, //  latitude in decimal degrees (wgs84)
            long, //  longitude in decimal degrees (wgs84)
            featureClass, //  see http://www.geonames.org/export/codes.html, char(1)
            _featureCode, //  see http://www.geonames.org/export/codes.html, varchar(10)
            countryCode, //  ISO-3166 2-letter country code, 2 characters
            _cc2, //  alternate country codes, comma separated, ISO-3166 2-letter country code, 200 characters
            _admin1Code, //  fipscode (subject to change to iso code), see exceptions below, see file admin1Codes.txt for display names of this code; varchar(20)
            _admin2Code, //  code for the second administrative division, a county in the US, see file admin2Codes.txt; varchar(80)
            _admin3Code, //  code for third level administrative division, varchar(20)
            _admin4Code, //  code for fourth level administrative division, varchar(20)
            population, //  bigint (8 byte int)
            _elevation, //  in meters, integer
            _dem, //  digital elevation model, srtm3 or gtopo30, average elevation of 3''x3'' (ca 90mx90m) or 30''x30'' (ca 900mx900m) area in meters, integer. srtm processed by cgiar/ciat.
            _timeZone, //  the iana timezone id (see file timeZone.txt) varchar(40)
            _modificationDate, //  date of last modification
        ] = line.split("\t");

        if (!countries.includes(countryCode))
            return;

        // This makes sure we only get cities
        if (featureClass !== citiesOnly)
            return;

        // Fix alternate names
        const alternates = alternatenames.split(",").map(n => n.trim()).filter(n => n);
        const i = alternates.indexOf(name);
        if (i !== -1)
            alternates.splice(i, 1);

        // Create city object
        const city: City = {
            id: parseInt(id),
            name: name.trim(),
            alt: alternates.length > 0 ? alternates : undefined,
            lon: parseFloat(long) as Longitude,
            lat: parseFloat(lat) as Latitude,
            pop: parseInt(population),
        };

        if (!mapdata[countryCode])
            mapdata[countryCode] = [];

        mapdata[countryCode].push(city);
    };

    const rl = readline.createInterface({
        input: fs.createReadStream(allTheCountriesFile, "utf-8"),
        crlfDelay: Infinity,
    });

    rl.on("line", line => {
        processLine(line);
    });

    await events.once(rl, "close");

    for (const country of Object.keys(mapdata)) {
        const countryData = mapdata[country];
        const collator = new Intl.Collator(country);
        countryData.sort((a, b) => collator.compare(a.name, b.name));
        const fileName = path.join(destinationFolder, `${country}.json`);
        fs.writeFileSync(fileName, JSON.stringify(countryData), "utf-8");
        console.log(`Wrote ${countryData.length} cities in ${fileName}`);
        citiesWrittenCount += countryData.length;
    }

    return citiesWrittenCount;
}
