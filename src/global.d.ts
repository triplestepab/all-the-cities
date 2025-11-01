declare global {
	export type Brand<K, T> = K & { __brand: T };

	type Longitude = Brand<number, "Longitude">;
	type Latitude = Brand<number, "Latitude">;

    declare namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: "development" | "production";
        }
    }


}

export {};
