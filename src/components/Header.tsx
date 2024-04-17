import Link from "next/link";
import React from "react";

import { ThemeToggle } from "./themeToggle";
import { cn } from "@/lib/utils";

interface HeaderProps {
    className?: string;
}

export function Header({ className }: HeaderProps) {
    return (
        <header className={cn("bg-secondary", className)}>
            <div className="container flex">
                <div>
                    <Link
                        href="/"
                        scroll
                    >
                        Text Search
                    </Link>
                </div>
                <div className="flex flex-1 md:justify-end">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}
