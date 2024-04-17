"use client";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import React from "react";
import { EngineChoice, SearchResultResponse } from "./types";
import { EngineChoiceGroup } from "../components/EngineChoices";

async function fetchSearch(args: {
    query: string;
    engine: EngineChoice;
}): Promise<SearchResultResponse> {
    const response = await fetch(
        `/api/search?q=${args.query}&engine=${args.engine}`,
    );
    if (!response.ok) {
        return { result: [], queryDuration: 0 };
    } else {
        return (await response.json()) as SearchResultResponse;
    }
}

export default function Home() {
    const [searchInput, setSearchInput] = React.useState<string>("");
    const [searchResults, setSearchResults] = React.useState<
        SearchResultResponse | undefined
    >(undefined);
    const [queryEngine, setQueryEngine] =
        React.useState<EngineChoice>("postgres");
    React.useEffect(() => {
        if (!searchInput) {
            setSearchResults(undefined);
            return;
        }
        fetchSearch({ query: searchInput, engine: queryEngine }).then(
            (response) => setSearchResults(response),
        );
    }, [searchInput, queryEngine]);

    return (
        <main className="h-screen w-screen">
            <div className="flex flex-col items-center gap-4">
                <div className="flex flex-col items-center gap-4 space-y-10">
                    <h1 className="text-3xl underline">
                        Ranked Text Search Query
                    </h1>
                    <p className="mx-auto flex w-1/2 text-center text-xl">
                        An exploration of how to use Sorted Sets and Text Search
                        capabilities in various data stores like Redis or
                        Postgres.
                    </p>
                    <p className="mx-auto flex w-1/2 text-center">
                        In the current example, we search League of Legends
                        Champion names via the below search bar. This uses
                        prefix searching functions like Redis ZRANK, and
                        Postgres tsquery.
                    </p>
                </div>
                <div className="flex w-1/2 flex-col items-center gap-2 bg-neutral-500">
                    <div className="mt-4 w-full max-w-md">
                        <Command className="bg-secondary">
                            <CommandInput
                                placeholder="Type a champion or search..."
                                value={searchInput}
                                onValueChange={setSearchInput}
                            />
                            <CommandList>
                                {searchResults?.result.length === 0 ? (
                                    <CommandEmpty>
                                        No results found.
                                    </CommandEmpty>
                                ) : null}
                                {searchResults?.result ? (
                                    <CommandGroup heading="Champions">
                                        {searchResults?.result.map((result) => (
                                            <CommandItem
                                                key={result.name}
                                                value={result.name}
                                                onSelect={setSearchInput}
                                            >
                                                {result.name}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                ) : null}
                                {searchResults?.result ? (
                                    <>
                                        <div className="h-px w-full bg-zinc-200" />

                                        <p className="p-2 text-xs text-zinc-500">
                                            Found {searchResults.result.length}{" "}
                                            results in{" "}
                                            {searchResults?.queryDuration.toFixed(
                                                0,
                                            )}
                                            ms
                                        </p>
                                    </>
                                ) : null}
                            </CommandList>
                        </Command>
                    </div>
                    <div className="mx-auto mt-10 flex flex-row justify-items-center gap-6">
                        <EngineChoiceGroup
                            // @ts-expect-error - cant hint that the string is of a valid Engine type
                            onValueChange={setQueryEngine}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
