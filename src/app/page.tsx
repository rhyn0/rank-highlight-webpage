import redisPromise from "@/lib/redisClient";

export default async function Home() {
    const client = await redisPromise;
    await client.set("key", "value");
    const value = await client.get("key");
    const keys = await client.keys("*");

    return (
        <main>
            <div>Received value {value} from redis</div>
            <div>
                There are currently {keys.length} keys in the database of{" "}
                {JSON.stringify(keys)}
            </div>
        </main>
    );
}
