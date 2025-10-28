"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Palette, Zap, Eye } from "@/components/icons"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { AnimatedContainer, AnimatedItem } from "@/components/animations"
import "./animations.css"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-transparent to-blue-500/10" />
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 animate-fade-in">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm text-muted-foreground">Powered by Advanced AI</span>
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl animate-fade-in-up">
            <span className="bg-linear-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Design Your Space
            </span>
            <br />
            with AI Magic
          </h1>

          <p
            className="mb-8 text-lg text-muted-foreground sm:text-xl animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            Transform your interior design vision into reality. Get instant AI-powered design suggestions, 3D
            visualizations, and professional recommendations tailored to your space.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-stagger">
            <div>
              <Button
                size="lg"
                className="bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white hover-scale"
                asChild
              >
                <Link href="/login">
                  Start Designing
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div>
              <Button size="lg" variant="outline" className="hover-scale bg-transparent" asChild>
                <Link href="/ai-design">
                  Watch Demo
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-16 rounded-2xl border border-border bg-card p-8 animate-scale-in hover-lift">
            <div className="aspect-video rounded-lg bg-linear-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
              <div className="text-center">
                <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">3D Design Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8 bg-card/50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center animate-fade-in-up">
            <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">How It Works</h2>
            <p className="text-lg text-muted-foreground">Three simple steps to transform your space with AI</p>
          </div>

          <AnimatedContainer className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <AnimatedItem>
              <div className="relative rounded-2xl border border-border bg-background p-8 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 hover-lift">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-blue-500">
                  <span className="text-lg font-bold text-white">1</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">Upload Your Space</h3>
                <p className="text-muted-foreground">
                  Share photos of your room or describe your space. Our AI analyzes dimensions, lighting, and style
                  preferences.
                </p>
              </div>
            </AnimatedItem>

            {/* Step 2 */}
            <AnimatedItem>
              <div className="relative rounded-2xl border border-border bg-background p-8 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 hover-lift">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-500">
                  <span className="text-lg font-bold text-white">2</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">Get AI Suggestions</h3>
                <p className="text-muted-foreground">
                  Receive personalized design recommendations including color schemes, furniture layouts, and decor
                  ideas.
                </p>
              </div>
            </AnimatedItem>

            {/* Step 3 */}
            <AnimatedItem>
              <div className="relative rounded-2xl border border-border bg-background p-8 transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 hover-lift">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-blue-500">
                  <span className="text-lg font-bold text-white">3</span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">Visualize & Refine</h3>
                <p className="text-muted-foreground">
                  Explore 3D visualizations, adjust designs in real-time, and get shopping recommendations for your
                  favorite pieces.
                </p>
              </div>
            </AnimatedItem>
          </AnimatedContainer>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center animate-fade-in-up">
            <h2 className="mb-4 text-4xl font-bold text-foreground sm:text-5xl">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">Everything you need for professional interior design</p>
          </div>

          <AnimatedContainer className="grid gap-8 md:grid-cols-2">
            {/* Feature 1 */}
            <AnimatedItem>
              <div className="flex gap-4 rounded-xl border border-border bg-card p-6 hover-lift transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-500/20">
                  <Palette className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">Smart Color Matching</h3>
                  <p className="text-sm text-muted-foreground">
                    AI-powered color palette generation that complements your existing décor and lighting.
                  </p>
                </div>
              </div>
            </AnimatedItem>

            {/* Feature 2 */}
            <AnimatedItem>
              <div className="flex gap-4 rounded-xl border border-border bg-card p-6 hover-lift transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
                  <Zap className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">Instant Rendering</h3>
                  <p className="text-sm text-muted-foreground">
                    Get high-quality 3D visualizations in seconds, not hours. See your design come to life instantly.
                  </p>
                </div>
              </div>
            </AnimatedItem>

            {/* Feature 3 */}
            <AnimatedItem>
              <div className="flex gap-4 rounded-xl border border-border bg-card p-6 hover-lift transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-500/20">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">Style Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover furniture and décor items that match your design, with direct shopping links.
                  </p>
                </div>
              </div>
            </AnimatedItem>

            {/* Feature 4 */}
            <AnimatedItem>
              <div className="flex gap-4 rounded-xl border border-border bg-card p-6 hover-lift transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
                  <Eye className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">Multiple Variations</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore different design styles and variations to find the perfect match for your taste.
                  </p>
                </div>
              </div>
            </AnimatedItem>
          </AnimatedContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-linear-to-r from-purple-500/10 to-blue-500/10 p-12 text-center animate-scale-in hover-glow">
          <h2 className="mb-4 text-4xl font-bold text-foreground">Ready to Transform Your Space?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of users creating beautiful interiors with AI
          </p>
          <div className="inline-block">
            <Button
              size="lg"
              className="bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white hover-scale"
              asChild
            >
              <Link href="/login">
                Start Your Free Design
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-purple-500 to-blue-500">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-foreground">DesignAI</span>
              </div>
              <p className="text-sm text-muted-foreground">Transform your interior design with AI</p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Gallery
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 DesignAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
