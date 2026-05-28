import { FolderGit2, MessagesSquare } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
    return (
        <footer className="w-full border-t border-border bg-secondary mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">

                    <div className="flex flex-col items-center sm:items-start gap-2">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="rounded-full bg-primary p-2">
                                <MessagesSquare size={14} className="text-secondary" />
                            </div>
                            <span className="text-lg text-primary font-semibold font-serif tracking-tight">
                                Yet Another RTC Chat
                            </span>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            Real-time chat built for fun and learning
                        </p>
                    </div>

                    <div className="flex flex-col items-center sm:items-start gap-2">
                        <span className="text-sm font-medium text-primary">Links</span>
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
                        <span className="text-sm font-medium text-primary">Authors</span>
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