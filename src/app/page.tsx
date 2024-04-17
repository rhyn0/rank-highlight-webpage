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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import Postgres from "@/public/img/postgresql.svg?url";
import Redis from "@/public/img/redis.svg?url";

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
                <h1>Ranked Text Search Query</h1>
                <p>
                    An exploration of how to use Sorted Sets and Text Search
                    capabilities in various data stores like Redis or Postgres.
                </p>
                <div className="w-full max-w-md">
                    <Command>
                        <CommandInput
                            placeholder="Type a champion or search..."
                            value={searchInput}
                            onValueChange={setSearchInput}
                        />
                        <CommandList>
                            {searchResults?.result.length === 0 ? (
                                <CommandEmpty>No results found.</CommandEmpty>
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
                    <RadioGroup
                        defaultValue="postgres"
                        // @ts-expect-error - cant hint that the string is of a valid Engine type
                        onValueChange={setQueryEngine}
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="postgres"
                                id="postgres"
                            />
                            <Label htmlFor="postgres">
                                <div className="flex h-10 w-10 items-center bg-white align-middle">
                                    <Image
                                        src={Postgres}
                                        alt="PostgreSQL"
                                        height={32}
                                        width={32}
                                        className="mx-auto my-auto"
                                    />
                                </div>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem
                                value="redis"
                                id="redis"
                            />
                            <Label htmlFor="redis">
                                <div className="flex h-10 w-10 items-center bg-white align-middle">
                                    <Image
                                        src={Redis}
                                        alt="Redis"
                                        height={32}
                                        width={32}
                                        className="mx-auto my-auto"
                                    />
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </div>
            </div>
        </main>
    );
}
