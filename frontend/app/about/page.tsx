import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { ArrowRight, Users, Lightbulb, Target, Award } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  const team = [
    {
      name: "Sarah Chen",
      role: "Founder & CEO",
      bio: "Interior design expert with 15+ years of experience",
      image: "/professional-woman.png",
    },
    {
      name: "Marcus Johnson",
      role: "CTO",
      bio: "AI and 3D visualization specialist",
      image: "/professional-man.png",
    },
    {
      name: "Elena Rodriguez",
      role: "Head of Design",
      bio: "Award-winning interior designer",
      image: "/professional-woman-designer.jpg",
    },
    {
      name: "David Kim",
      role: "Product Lead",
      bio: "User experience and product strategy expert",
      image: "/professional-man-tech.jpg",
    },
  ]

  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We leverage cutting-edge AI and 3D technology to revolutionize interior design",
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "We work closely with designers and homeowners to create beautiful spaces",
    },
    {
      icon: Target,
      title: "Accessibility",
      description: "Professional design should be accessible to everyone, regardless of budget",
    },
    {
      icon: Award,
      title: "Quality",
      description: "We maintain the highest standards in design recommendations and visualizations",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/10 via-transparent to-blue-500/10" />
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-purple-500/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
            <span className="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              About DesignAI
            </span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
            We're on a mission to democratize interior design by combining AI innovation with professional expertise
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-card/50">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <h2 className="mb-6 text-3xl font-bold text-foreground">Our Mission</h2>
              <p className="mb-4 text-lg text-muted-foreground">
                DesignAI was founded with a simple belief: everyone deserves access to professional interior design
                expertise. We combine artificial intelligence with human creativity to make beautiful, personalized
                interior design accessible to everyone.
              </p>
              <p className="text-lg text-muted-foreground">
                Our platform empowers homeowners, renters, and designers to visualize, plan, and execute their design
                dreams with confidence and ease.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-linear-to-br from-purple-500/20 to-blue-500/20 p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🎨</div>
                <p className="text-muted-foreground">Design Innovation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground">Our Values</h2>
            <p className="text-lg text-muted-foreground">What drives us every day</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <Card key={index} className="p-6 hover:border-purple-500/50 transition-colors">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20">
                    <Icon className="h-6 w-6 text-purple-500" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-card/50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-foreground">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground">
              Passionate experts dedicated to transforming interior design
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square overflow-hidden bg-linear-to-br from-purple-500/20 to-blue-500/20">
                  <img
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="mb-1 text-lg font-semibold text-foreground">{member.name}</h3>
                  <p className="mb-3 text-sm font-medium text-purple-500">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                50K+
              </div>
              <p className="text-muted-foreground">Happy Users</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                100K+
              </div>
              <p className="text-muted-foreground">Designs Created</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                4.9★
              </div>
              <p className="text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-4xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                15+
              </div>
              <p className="text-muted-foreground">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 bg-card/50">
        <div className="mx-auto max-w-4xl rounded-2xl border border-border bg-linear-to-r from-purple-500/10 to-blue-500/10 p-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-foreground">Ready to Transform Your Space?</h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Join thousands of users creating beautiful interiors with AI
          </p>
          <Link href="/ai-design">
            <Button
              size="lg"
              className="bg-linear-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              Start Designing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>&copy; 2025 DesignAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
