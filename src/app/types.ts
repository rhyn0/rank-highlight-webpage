export interface SearchResultResponse {
    result: ChampionResult[];
    queryDuration: number;
}

export interface ChampionResult {
    name: string;
}

export type EngineChoice = "postgres" | "redis";
