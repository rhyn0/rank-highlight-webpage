"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Image from "next/image";
import Postgres from "@/public/img/postgresql.svg?url";
import Redis from "@/public/img/redis.svg?url";

interface EngineChoiceGroupProps {
    onValueChange: React.Dispatch<React.SetStateAction<string>>;
}
export function EngineChoiceGroup({ onValueChange }: EngineChoiceGroupProps) {
    return (
        <RadioGroup
            defaultValue="postgres"
            onValueChange={onValueChange}
            orientation="horizontal"
            className="mb-5 flex"
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
    );
}
