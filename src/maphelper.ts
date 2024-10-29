import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { City, Country } from "./types";

const mapdata: {
    [county in Country]: City[];
} = {};

export function getData(iCountry: Country): City[] {
    if (/^[A-Z]{2}$/.test(iCountry) === false)
        throw new Error(`Invalid country code: ${iCountry}`);

    const file = path.join(fileURLToPath(import.meta.url), "..", "..", "countryData", `${iCountry}.json`);

    if (!mapdata[iCountry]) {
        if (fs.existsSync(file)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const reviver = (key: string, value: any): any => {
                return (key === "modificationDate") ? new Date(value) : value;
            };

            mapdata[iCountry] = JSON.parse(fs.readFileSync(file, "utf-8"), reviver);
        }
        else {
            mapdata[iCountry] = [];
        }
    }

    return mapdata[iCountry];
}

export function getDataWithDistanceMeters(iCountry: Country, lat1: Latitude, lon1: Longitude): (City & { DistanceMeters: number })[] {
    const data = getData(iCountry);

    const result = data.map(c => ({
        ...c,
        DistanceMeters: distance(lat1, lon1, c.lat, c.lon),
    }));

    return result;
}

export function findCity(iCountry: Country, iName: string, iMatchType: "Exact" | "Substring" | "Alternative" = "Exact"): City[] {
    const data = getData(iCountry);

    switch (iMatchType) {
        case "Exact":
            return data.filter(c => c.name.toLocaleLowerCase() === iName.toLocaleLowerCase());
        case "Substring":
            return data.filter(c => c.name.toLocaleLowerCase().includes(iName.toLocaleLowerCase()));
        case "Alternative":
            return data.filter(c =>
                c.name.toLocaleLowerCase().includes(iName.toLocaleLowerCase())
                || c.alt?.some(s => s.toLocaleLowerCase().includes(iName.toLocaleLowerCase()))
            );
    }
}

export function findNearBy(iCountry: Country, lat1: Latitude, lon1: Longitude, distancemeters: number): (City & { DistanceMeters: number })[] {
    const data = getDataWithDistanceMeters(iCountry, lat1, lon1);
    return data.filter(m => m.DistanceMeters < distancemeters);
}

export function findNearestCities(iCountry: Country, lat1: Latitude, lon1: Longitude, count = 1): (City & { DistanceMeters: number })[] {
    const data = getDataWithDistanceMeters(iCountry, lat1, lon1);
    data.sort((a, b) => a.DistanceMeters - b.DistanceMeters);
    return data.slice(0, count);
}

export function distanceBetweenCities(city1: City, city2: City): number {
    return distance(city1.lat, city1.lon, city2.lat, city2.lon);
}

/**
 * Calculates the distance (in meters) between two points on the Earth's surface
 * given their latitude and longitude coordinates using the Haversine formula.
 * @param lat1 Latitude of the first point in degrees.
 * @param lon1 Longitude of the first point in degrees.
 * @param lat2 Latitude of the second point in degrees.
 * @param lon2 Longitude of the second point in degrees.
 * @returns The distance between the two points in meters.
 */
export function distance(lat1: Latitude, lon1: Longitude, lat2: number, lon2: number): number {
    const earthRadius = 6371e3; // meters

    // Convert latitude and longitude from degrees to radians
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    // Haversine formula
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const centralAngle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate the distance in meters and return the truncated value
    const distanceInMeters = earthRadius * centralAngle;
    return Math.trunc(distanceInMeters);
}

/**
 * Calculates a square area (bounding box) on the Earth's surface, given a
 * starting latitude, longitude, and distance from the center to each side of the square.
 * @param lat Latitude of the center point in degrees.
 * @param long Longitude of the center point in degrees.
 * @param dist Distance from the center to each side of the square in meters.
 * @returns An object containing the coordinates of the upper-left (from) and lower-right (to) corners of the square.
 */
export function getSquare(lat: number, long: number, dist: number): {
    from: { lat: number; long: number };
    to: { lat: number; long: number };
} {
    const upperLeft = getPoint(lat, long, dist, 90 + 90 + 90 + 45);
    const lowerRight = getPoint(lat, long, dist, 90 + 45);

    return {
        from: {
            lat: upperLeft.lat,
            long: upperLeft.long,
        },
        to: {
            lat: lowerRight.lat,
            long: lowerRight.long,
        },
    };
}

/**
 * Calculates a new geographical point based on the given latitude, longitude,
 * distance, and angle (degrees) from the starting point.
 * @param lat Latitude of the starting point in degrees.
 * @param long Longitude of the starting point in degrees.
 * @param dist Distance to travel from the starting point in meters.
 * @param degrees Angle (in degrees) of movement from the starting point.
 * @returns An object containing the new latitude, longitude, latitude delta,
 * longitude delta, and the original degrees value.
 */
export function getPoint(lat: number, long: number, dist: number, degrees: number): {
    lat: number;
    long: number;
    latDelta: number;
    longDelta: number;
    degrees: number;
} {
    const earthRadius = 6371e3; // meters
    const b = (Math.PI * 2 / 360) * degrees;
    const φ1 = (lat * Math.PI) / 180;
    const λ1 = (long * Math.PI) / 180;

    const φ2 = Math.asin(Math.sin(φ1) * Math.cos(dist / earthRadius) + Math.cos(φ1) * Math.sin(dist / earthRadius) * Math.cos(b));
    const λ2 = λ1 + Math.atan2(Math.sin(b) * Math.sin(dist / earthRadius) * Math.cos(φ1), Math.cos(dist / earthRadius) - Math.sin(φ1) * Math.sin(φ2));

    const newLat = φ2 / Math.PI * 180;
    const newLong = λ2 / Math.PI * 180;

    return {
        lat: newLat,
        long: newLong,
        latDelta: lat - newLat,
        longDelta: long - newLong,
        degrees,
    };
}
