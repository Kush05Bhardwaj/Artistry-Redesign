import { Button } from "@/components/ui/button"
import { Sparkles } from "@/components/icons"
import Link from "next/link"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-blue-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">DesignAI</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="/ai-design" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              AI Design
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              size="sm"
              className="bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              asChild
            >
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
