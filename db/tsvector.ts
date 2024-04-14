// More info: https://github.com/drizzle-team/drizzle-orm/issues/247#issuecomment-1726743672
import { customType } from "drizzle-orm/pg-core";

export const tsvector = customType<{
    data: string;
    config: { sources: string[] };
}>({
    dataType(config) {
        if (config) {
            const sources = config.sources.join(" || ' ' || ");
            return `tsvector generated always as (to_tsvector('english', ${sources})) stored`;
        } else {
            return `tsvector`;
        }
    },
});
