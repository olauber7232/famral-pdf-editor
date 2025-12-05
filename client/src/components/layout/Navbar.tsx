import { Link } from "wouter";

export function Navbar() {
  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src="https://www.famral.com/favicon.png" alt="Famral Logo" className="h-10 w-auto object-contain" />
            <span className="text-xl font-bold text-primary hidden md:block">PDF Editor</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/editor">
            <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">Edit</span>
          </Link>
          <Link href="/editor">
            <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">Merge</span>
          </Link>
          <Link href="/editor">
            <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">Compress</span>
          </Link>
          <Link href="/editor">
            <span className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors cursor-pointer">Sign</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/editor">
            <button className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
