import { Brand } from "./landing/landing-page";

import Link from "next/link";
import { ReactNode } from "react";
import { SiGithub } from "react-icons/si";

export default function MarketLayout({children}:{children:ReactNode}){
    return(
        <div className="min-h-screen flex flex-col bg-canvas text-txt-primary">
            {/*Shared Header*/}
            <header className="border-b border-line py-5 px-6">
                <div className="max-w-6xl w-full mx-auto flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                    <Brand />
                    <div className="flex items-center gap-3">
                        <Link 
                          href="/login" 
                          className="font-mono text-xs text-txt-secondary hover:text-txt-primary px-3 py-1.5 transition-colors">
                            Sign In
                        </Link>
                        <Link
                          href="/register"
                          className="bg-txt-primary text-canvas font-medium text-xs px-3.5 py-1.5 rounded-md hover:opacity-90 transition-opacity"
                        >
                          Get Started
                        </Link>
                    </div>
                </div>
            </header>
            <div className="flex-1">{children}</div>
            <footer className="border-t border-line py-8 px-6">
                <div className="max-w-6xl w-full mx-auto text-xs font-mono text-txt-muted flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p>Invoicify - MIT License</p>
                    <p className="inline-flex items-center gap-2">Crafted by PrimeFold <SiGithub/></p>
                </div>
            </footer>
        </div>
    )
}
