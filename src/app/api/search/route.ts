import { ChampionResult, EngineChoice } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
// used custom prefix for KV
import { createClient } from "@vercel/kv";

const MAX_RESULTS = 20;

export async function GET(request: NextRequest): Promise<NextResponse> {
    // default engine to be redis, if not set
    const start = performance.now();
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q")?.toUpperCase();
    const engine = (searchParams.get("engine") || "redis") as EngineChoice;
    if (!query) {
        return new NextResponse("Missing Query for request", { status: 400 });
    }
    let queryResult: ChampionResult[];
    if (engine === "redis") {
        queryResult = await redisQuery(query);
    } else if (engine === "postgres") {
        queryResult = await pgQuery(query);
    } else {
        return new NextResponse("Missing engine choice for request", {
            status: 400,
        });
    }
    const end = performance.now();
    return new NextResponse(
        JSON.stringify({
            result: queryResult,
            queryDuration: end - start,
        }),
        { status: 200 },
    );
}

async function redisQuery(query: string): Promise<ChampionResult[]> {
    const redisUrl = process.env.REDIS_REST_API_URL;
    const redisToken = process.env.REDIS_REST_API_TOKEN;
    if (!redisUrl || !redisToken) {
        console.error("Redis not set");
        return [];
    }
    const kv = createClient({
        url: process.env.REDIS_REST_API_URL as string,
        token: process.env.REDIS_REST_API_TOKEN as string,
    });
    const closestRank = await kv.zrank("champTerms", query);

    if (!closestRank) return [];

    const tempResults = await kv.zrange<string[]>(
        "champTerms",
        closestRank,
        closestRank + MAX_RESULTS,
    );
    // filter the results
    const res: ChampionResult[] = [];
    for (const temp of tempResults) {
        if (!temp.startsWith(query)) {
            // we requested too many results and have gotten too far off.
            break;
        }
        if (temp.endsWith("*")) {
            // only full terms end with '*' (its our stop character). so these are the real ones.
            res.push({ name: temp.substring(0, temp.length - 1) });
        }
    }
    return res;
}
async function pgQuery(query: string): Promise<ChampionResult[]> {
    const prefixed = `${query}:*`;
    const result =
        await sql`SELECT name from champions where champions.vector @@ to_tsquery(${prefixed}) LIMIT 20;`;

    return result.rows as ChampionResult[];
}
