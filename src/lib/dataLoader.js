/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-expect-error - JS require for a script
const { parse } = require("node-html-parser");
// @ts-expect-error - JS require for a script
const { existsSync, readFileSync, writeFileSync } = require("fs");
// @ts-expect-error - JS require for a script
const { createClient } = require("redis");
const { Client } = require("pg");

const tableFilePath = "../../champs-table.html";
const redisClientPromise = createClient({
    url: process.env.REDIS_URL,
    database: 1,
})
    .on("error", (err) => console.error(err))
    .connect();
const pgClient = new Client({
    connectionString: process.env.PG_URL,
});

async function getTableData() {
    // dont repeatedly crawl the table
    if (existsSync(tableFilePath)) {
        console.log("Local file exists, reading it instead of fetching.");
        const buf = readFileSync(tableFilePath);
        return buf.toString();
    } else {
        const response = await fetch(
            "https://leagueoflegends.fandom.com/wiki/List_of_champions",
        );
        const data = await response.text();
        writeFileSync(tableFilePath, data);
        return data;
    }
}

async function pullChampsData() {
    const pageHtml = await getTableData();
    const pageRoot = parse(pageHtml);
    const tableRoot = pageRoot.querySelector("table.article-table");
    if (!tableRoot) {
        throw new Error("Loaded page content is of unexpected form.");
    }
    const tableBody = tableRoot.querySelector("tbody");
    const champions = [];
    for (const row of tableBody.getElementsByTagName("tr").slice(1)) {
        const rowRawText = row.rawText;
        const [nameTitle, , releaseString] = rowRawText.split("\n\n");
        const [, name] = nameTitle.split("\n");
        champions.push({ name, releaseDate: releaseString });
    }
    return champions;
}

async function storeDataRedis(data) {
    const redisClient = await redisClientPromise;
    for (const champion of data) {
        const { name } = champion;
        const upperName = name.toUpperCase();
        const champTerms = [];
        for (let i = 0; i < upperName.length; i++) {
            champTerms.push({ score: 0, value: upperName.substring(0, i) });
        }
        champTerms.push({ score: 0, value: upperName + "*" });
        const populateDb = async () => {
            await redisClient.zAdd("champTerms", champTerms);
        };

        populateDb();
    }
}
async function storeDataPg(data) {
    await pgClient.connect();
    await pgClient.query(
        "CREATE TABLE IF NOT EXISTS champions(id SERIAL PRIMARY KEY, name TEXT NOT NULL, release_date DATE NOT NULL, vector TSVECTOR NOT NULL);",
    );
    for (const champion of data) {
        const { name, releaseDate } = champion;
        await pgClient.query(
            "INSERT INTO champions(name, release_date, vector) \
             VALUES ($1::text, $2::date, setweight(to_tsvector($1::text), 'A') || setweight(to_tsvector($2::text), 'B'));",
            [name, releaseDate],
        );
    }
}
async function storeData(data) {
    const upperData = data.map((champ) => ({
        name: champ.name.toUpperCase(),
        ...champ,
    }));
    storeDataPg(upperData);
    storeDataRedis(upperData);
}

async function main() {
    const champArray = await pullChampsData();
    await storeData(champArray);
}
main().then(() => {
    console.log("finished with main");
});
