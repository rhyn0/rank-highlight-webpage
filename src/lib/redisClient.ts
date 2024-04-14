import {
    createClient,
    type RedisClientOptions,
    type RedisClientType,
} from "redis";

if (!process.env.REDIS_URL) {
    throw new Error("Invalid/Missing environment variable: 'REDIS_URL'");
}

const uri = process.env.REDIS_URL as string;

const options: RedisClientOptions = {
    url: uri,
    database: 1,
};

let client;
let clientPromise: Promise<RedisClientType>;

function createRedisClient(): RedisClientType {
    // @ts-expect-error - specifics about RedisLibrary functions on the client
    return createClient(options).on("error", (err) =>
        console.error("Redis Client Error", err),
    );
}

if (process.env.NODE_ENV === "development") {
    // in development mode use global variable so that client is preserved across HMR
    const globalWithRedis = global as typeof globalThis & {
        _redisClient?: Promise<RedisClientType>;
    };
    if (!globalWithRedis._redisClient) {
        client = createRedisClient();
        globalWithRedis._redisClient = client.connect();
    }
    clientPromise = globalWithRedis._redisClient;
} else {
    client = createRedisClient();
    clientPromise = client.connect();
}

export default clientPromise;
