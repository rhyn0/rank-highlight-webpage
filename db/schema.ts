import { timestamp, serial, text, pgTable } from "drizzle-orm/pg-core";
import { tsvector } from "./tsvector";

export const champions = pgTable("champions", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("biography").notNull(),
    releaseDate: timestamp("release_date").notNull(),
    vector: tsvector("vector", { sources: ["name", "description"] }),
});
