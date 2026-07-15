import { FolderGit2 } from "lucide-react";
import { Logo } from "@/shared/ui";

export const Footer = () => {
    return (
        <footer className="mt-auto w-full border-t border-border-subtle bg-rail">
            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="flex flex-col items-center justify-between gap-8 sm:flex-row sm:items-start">

                    <div className="flex flex-col items-center gap-2 sm:items-start">
                        <Logo size={22} to="/" />
                        <p className="text-sm text-muted-foreground">
                            Real-time calls built for fun and learning
                        </p>
                    </div>

                    <div className="flex flex-col items-center sm:items-start gap-2">
                        <span className="text-sm font-medium text-foreground">Links</span>
                        <a
                            href="https://github.com/arsenpaw/yet-another-rtc-chat"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <FolderGit2 size={14} />
                            Source code
                        </a>
                    </div>

                    <div className="flex flex-col items-center sm:items-start gap-2">
                        <span className="text-sm font-medium text-foreground">Authors</span>
                        <a
                            href="https://github.com/arsenpaw"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            @arsenpaw
                        </a>
                        <a
                            href="https://github.com/aquammarine"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            @aquammarine
                        </a>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-border/50 text-center">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} Yet Another RTC Chat
                    </p>
                </div>
            </div >
        </footer >
    );
};