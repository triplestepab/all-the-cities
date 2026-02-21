import { expect } from "chai";
import "mocha";
import "../src/global.d.ts"; // Ensure global types are available in tests
import {
    distance,
    getPoint,
    getSquare,
    getData,
    findCity,
    findNearBy,
    findNearestCities,
    distanceBetweenCities,
    getDataWithDistanceMeters,
} from "../src/maphelper.js";
import type { City } from "../src/types.js";

// Known coordinates
const stockholmLat = 59.32938 as Latitude;
const stockholmLon = 18.06871 as Longitude;
const eslovLat = 55.83928 as Latitude;
const eslovLon = 13.30393 as Longitude;

// ***************************************************
// * Pure functions (no I/O)
// ***************************************************

describe("distance", () => {
    it("should return 0 for identical points", () => {
        const result = distance(0 as Latitude, 0 as Longitude, 0, 0);
        expect(result).to.equal(0);
    });

    it("should calculate known distance Stockholm to Eslov", () => {
        const result = distance(stockholmLat, stockholmLon, eslovLat, eslovLon);
        expect(result).to.be.closeTo(480653, 500);
    });

    it("should be symmetric", () => {
        const ab = distance(stockholmLat, stockholmLon, eslovLat, eslovLon);
        const ba = distance(
            eslovLat,
            eslovLon,
            stockholmLat as number as Latitude,
            stockholmLon as number as Longitude,
        );
        expect(ab).to.equal(ba);
    });

    it("should calculate approximately 111km for 1 degree on equator", () => {
        const result = distance(0 as Latitude, 0 as Longitude, 0, 1);
        expect(result).to.be.closeTo(111194, 200);
    });

    it("should calculate north pole to south pole as half Earth circumference", () => {
        const result = distance(90 as Latitude, 0 as Longitude, -90, 0);
        expect(result).to.be.closeTo(20015086, 1000);
    });

    it("should return an integer (Math.trunc)", () => {
        const result = distance(stockholmLat, stockholmLon, eslovLat, eslovLon);
        expect(Number.isInteger(result)).to.be.true;
    });
});

describe("getPoint", () => {
    it("should move north when degrees is 0", () => {
        const result = getPoint(0, 0, 1000, 0);
        expect(result.lat).to.be.greaterThan(0);
        expect(result.long).to.be.closeTo(0, 0.0001);
    });

    it("should move east when degrees is 90", () => {
        const result = getPoint(0, 0, 1000, 90);
        expect(result.lat).to.be.closeTo(0, 0.0001);
        expect(result.long).to.be.greaterThan(0);
    });

    it("should move south when degrees is 180", () => {
        const result = getPoint(0, 0, 1000, 180);
        expect(result.lat).to.be.lessThan(0);
        expect(result.long).to.be.closeTo(0, 0.0001);
    });

    it("should move west when degrees is 270", () => {
        const result = getPoint(0, 0, 1000, 270);
        expect(result.lat).to.be.closeTo(0, 0.0001);
        expect(result.long).to.be.lessThan(0);
    });

    it("should return the same point when distance is 0", () => {
        const result = getPoint(55.8, 13.3, 0, 90);
        expect(result.lat).to.equal(55.8);
        expect(result.long).to.equal(13.3);
    });

    it("should pass through the degrees value", () => {
        const result = getPoint(0, 0, 1000, 45);
        expect(result.degrees).to.equal(45);
    });

    it("should have consistent latDelta and longDelta", () => {
        const inputLat = 55.8;
        const inputLong = 13.3;
        const result = getPoint(inputLat, inputLong, 10000, 45);
        expect(result.latDelta).to.be.closeTo(inputLat - result.lat, 0.000001);
        expect(result.longDelta).to.be.closeTo(inputLong - result.long, 0.000001);
    });
});

describe("getSquare", () => {
    it("should return from and to with lat and long", () => {
        const result = getSquare(55.8, 13.3, 10000);
        expect(result).to.have.property("from");
        expect(result).to.have.property("to");
        expect(result.from).to.have.property("lat");
        expect(result.from).to.have.property("long");
        expect(result.to).to.have.property("lat");
        expect(result.to).to.have.property("long");
    });

    it("should have from (NW) with higher lat and lower long than to (SE)", () => {
        const result = getSquare(55.8, 13.3, 10000);
        expect(result.from.lat).to.be.greaterThan(result.to.lat);
        expect(result.from.long).to.be.lessThan(result.to.long);
    });

    it("should have center approximately in the middle", () => {
        const lat = 55.8;
        const long = 13.3;
        const result = getSquare(lat, long, 10000);
        const midLat = (result.from.lat + result.to.lat) / 2;
        const midLong = (result.from.long + result.to.long) / 2;
        expect(midLat).to.be.closeTo(lat, 0.01);
        expect(midLong).to.be.closeTo(long, 0.01);
    });

    it("should produce a larger square with larger distance", () => {
        const small = getSquare(55.8, 13.3, 1000);
        const large = getSquare(55.8, 13.3, 10000);
        const smallSpan = small.from.lat - small.to.lat;
        const largeSpan = large.from.lat - large.to.lat;
        expect(largeSpan).to.be.greaterThan(smallSpan);
    });

    it("should produce a point when distance is 0", () => {
        const result = getSquare(55.8, 13.3, 0);
        expect(result.from.lat).to.be.closeTo(result.to.lat, 0.0001);
        expect(result.from.long).to.be.closeTo(result.to.long, 0.0001);
    });
});

// ***************************************************
// * Data-dependent functions
// ***************************************************

describe("getData", () => {
    it("should load SE data successfully", () => {
        const data = getData("SE");
        expect(data).to.be.an("array");
        expect(data.length).to.be.greaterThan(0);
    });

    it("should return City objects with correct shape", () => {
        const data = getData("SE");
        const city = data[0];
        expect(city).to.have.property("id").that.is.a("number");
        expect(city).to.have.property("name").that.is.a("string");
        expect(city).to.have.property("lon").that.is.a("number");
        expect(city).to.have.property("lat").that.is.a("number");
        expect(city).to.have.property("pop").that.is.a("number");
    });

    it("should throw on invalid country code", () => {
        expect(() => getData("123" as any)).to.throw("Invalid country code");
        expect(() => getData("" as any)).to.throw("Invalid country code");
        expect(() => getData("abc" as any)).to.throw("Invalid country code");
    });

    it("should throw on lowercase country code", () => {
        expect(() => getData("se" as any)).to.throw("Invalid country code");
    });

    it("should return empty array for valid but nonexistent country file", () => {
        const data = getData("BV"); // Bouvet Island — uninhabited, likely no data
        expect(data).to.be.an("array");
    });

    it("should cache data (same reference on subsequent calls)", () => {
        const first = getData("SE");
        const second = getData("SE");
        expect(first).to.equal(second);
    });

    it("should contain Stockholm", () => {
        const data = getData("SE");
        const stockholm = data.find((c) => c.name === "Stockholm");
        expect(stockholm).to.not.be.undefined;
    });

    it("should have expected coordinates for Stockholm", () => {
        const data = getData("SE");
        const stockholm = data.find((c) => c.name === "Stockholm")!;
        expect(stockholm.lat).to.be.closeTo(59.33, 0.1);
        expect(stockholm.lon).to.be.closeTo(18.07, 0.1);
    });
});

describe("findCity", () => {
    it("should find exact match (default)", () => {
        const results = findCity("SE", "Stockholm");
        expect(results.length).to.be.greaterThanOrEqual(1);
        expect(results[0].name).to.equal("Stockholm");
    });

    it("should be case-insensitive for exact match", () => {
        const upper = findCity("SE", "Stockholm");
        const lower = findCity("SE", "stockholm");
        expect(lower.length).to.equal(upper.length);
    });

    it("should return empty array for non-existent city", () => {
        const results = findCity("SE", "Nonexistent123");
        expect(results).to.deep.equal([]);
    });

    it("should find substring match", () => {
        const results = findCity("SE", "Stock", "Substring");
        expect(results.length).to.be.greaterThanOrEqual(1);
        const hasStockholm = results.some((c) => c.name === "Stockholm");
        expect(hasStockholm).to.be.true;
    });

    it("should not do substring match in Exact mode", () => {
        const results = findCity("SE", "Stock", "Exact");
        const hasStockholm = results.some((c) => c.name === "Stockholm");
        expect(hasStockholm).to.be.false;
    });

    it("should search alternative names in Alternative mode", () => {
        const results = findCity("SE", "Gothenburg", "Alternative");
        expect(results.length).to.be.greaterThanOrEqual(1);
    });

    it("should also search name in Alternative mode", () => {
        const results = findCity("SE", "Stockholm", "Alternative");
        expect(results.length).to.be.greaterThanOrEqual(1);
    });
});

describe("findNearBy", () => {
    it("should find cities within radius", () => {
        const results = findNearBy("SE", eslovLat, eslovLon, 10000);
        expect(results.length).to.be.greaterThan(0);
    });

    it("should only return cities with DistanceMeters less than threshold", () => {
        const threshold = 10000;
        const results = findNearBy("SE", eslovLat, eslovLon, threshold);
        for (const city of results) {
            expect(city.DistanceMeters).to.be.lessThan(threshold);
        }
    });

    it("should have DistanceMeters on each result", () => {
        const results = findNearBy("SE", eslovLat, eslovLon, 10000);
        for (const city of results) {
            expect(city).to.have.property("DistanceMeters").that.is.a("number");
        }
    });

    it("should return more cities with a larger radius", () => {
        const small = findNearBy("SE", eslovLat, eslovLon, 5000);
        const large = findNearBy("SE", eslovLat, eslovLon, 50000);
        expect(large.length).to.be.greaterThanOrEqual(small.length);
    });
});

describe("findNearestCities", () => {
    it("should return the requested count", () => {
        const results = findNearestCities("SE", stockholmLat, stockholmLon, 5);
        expect(results.length).to.equal(5);
    });

    it("should return 1 city by default", () => {
        const results = findNearestCities("SE", stockholmLat, stockholmLon);
        expect(results.length).to.equal(1);
    });

    it("should return results sorted by distance ascending", () => {
        const results = findNearestCities("SE", stockholmLat, stockholmLon, 10);
        for (let i = 1; i < results.length; i++) {
            expect(results[i].DistanceMeters).to.be.greaterThanOrEqual(
                results[i - 1].DistanceMeters,
            );
        }
    });

    it("should have DistanceMeters on each result", () => {
        const results = findNearestCities("SE", stockholmLat, stockholmLon, 3);
        for (const city of results) {
            expect(city).to.have.property("DistanceMeters").that.is.a("number");
        }
    });
});

describe("distanceBetweenCities", () => {
    let stockholm: City;
    let eslov: City;

    before(() => {
        const data = getData("SE");
        stockholm = data.find((c) => c.name === "Stockholm")!;
        eslov = data.find((c) => c.name === "Eslöv")!;
    });

    it("should calculate distance between two cities", () => {
        const result = distanceBetweenCities(stockholm, eslov);
        expect(result).to.be.greaterThan(0);
    });

    it("should be consistent with distance()", () => {
        const fromCities = distanceBetweenCities(stockholm, eslov);
        const fromCoords = distance(
            stockholm.lat,
            stockholm.lon,
            eslov.lat,
            eslov.lon,
        );
        expect(fromCities).to.equal(fromCoords);
    });

    it("should return 0 for same city", () => {
        const result = distanceBetweenCities(stockholm, stockholm);
        expect(result).to.equal(0);
    });

    it("should be symmetric", () => {
        const ab = distanceBetweenCities(stockholm, eslov);
        const ba = distanceBetweenCities(eslov, stockholm);
        expect(ab).to.equal(ba);
    });
});

describe("getDataWithDistanceMeters", () => {
    it("should return all cities with DistanceMeters", () => {
        const allCities = getData("SE");
        const withDistance = getDataWithDistanceMeters(
            "SE",
            stockholmLat,
            stockholmLon,
        );
        expect(withDistance.length).to.equal(allCities.length);
    });

    it("should have non-negative DistanceMeters", () => {
        const results = getDataWithDistanceMeters("SE", stockholmLat, stockholmLon);
        for (const city of results) {
            expect(city.DistanceMeters).to.be.greaterThanOrEqual(0);
        }
    });

    it("should have DistanceMeters as a number on each city", () => {
        const results = getDataWithDistanceMeters("SE", stockholmLat, stockholmLon);
        for (const city of results) {
            expect(city).to.have.property("DistanceMeters").that.is.a("number");
        }
    });
});
