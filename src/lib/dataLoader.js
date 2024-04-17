/* eslint-disable @typescript-eslint/no-var-requires */
// @ts-expect-error - JS require for a script
const { parse } = require("node-html-parser");
// @ts-expect-error - JS require for a script
const { existsSync, readFileSync, writeFileSync } = require("fs");
// @ts-expect-error - JS require for a script
const { sql } = require("@vercel/postgres");
const { createClient } = require("@vercel/kv");

const tableFilePath = "champs-table.html";

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
    const kv = createClient({
        url: process.env.REDIS_REST_API_URL,
        token: process.env.REDIS_REST_API_TOKEN,
    });
    for (const champion of data) {
        const { name } = champion;
        const upperName = name.toUpperCase();
        const champTerms = [];
        for (let i = 0; i < upperName.length; i++) {
            champTerms.push({ score: 0, member: upperName.substring(0, i) });
        }
        champTerms.push({ score: 0, member: upperName + "*" });
        const populateDb = async () => {
            await kv.zadd("champTerms", ...champTerms);
        };

        populateDb();
    }
}
async function storeDataPg(data) {
    await sql`CREATE TABLE IF NOT EXISTS champions(id SERIAL PRIMARY KEY, name TEXT NOT NULL, release_date DATE NOT NULL, vector TSVECTOR NOT NULL);`;
    for (const champion of data) {
        const { name, releaseDate } = champion;
        await sql`INSERT INTO champions(name, release_date, vector) \
             VALUES (${name}::text, ${releaseDate}::date, setweight(to_tsvector(${name}::text), 'A') || setweight(to_tsvector(${releaseDate}::text), 'B'));`;
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
    console.table(champArray);
    await storeData(champArray);
}
main().then(() => {
    console.log("finished with main");
});
