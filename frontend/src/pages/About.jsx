import { Users, Target, Lightbulb } from "lucide-react"

export default function About() {
  const team = [
    {
      name: "Rahul Sharma",
      role: "Co-founder & CEO",
      image: "/professional-man-headshot.png",
    },
    {
      name: "Priya Patel",
      role: "Co-founder & CTO",
      image: "/professional-woman-headshot.png",
    },
    {
      name: "Amit Verma",
      role: "Head of Design",
      image: "/professional-man-headshot.png",
    },
    {
      name: "Neha Singh",
      role: "Head of Product",
      image: "/professional-woman-headshot.png",
    },
  ]

  return (
    <main className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">About Artistry AI</h1>
          <p className="text-l text-gray-600 max-w-2xl mx-auto">
            At Artistry AI, we believe that a beautiful home isn't a luxury reserved for the few. It's a space where memories are made, families grow, and dreams take shape. Our mission is to empower you with the tools and inspiration to create a home you love, regardless of your budget or design experience
          </p>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-10 mb-20">
          {[
            {
              icon: <Target className="w-12 h-12 text-amber-700" />,                                                                            
              title: "Our Mission",
              description:
                "To democratize interior design by leveraging AI technology, making it accessible to every Indian household.",
            },
            {
              icon: <Lightbulb className="w-12 h-12 text-amber-700" />,
              title: "Our Vision",
              description:
                "A world where everyone can create their dream space without breaking the bank or hiring expensive designers.",
            },
            {
              icon: <Users className="w-12 h-12 text-amber-700" />,
              title: "Our Values",
              description: "Innovation, affordability, and customer-centricity drive everything we do at Artistry AI.",
            },
          ].map((item, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-amber-50 p-4 rounded-full">{item.icon}</div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
              <div className="text-center">
                <img
                  src="public\professional-man-headshot 1.jpg"
                  alt="Rahul Sharma"
                  className="w-full aspect-square rounded-lg mb-4 object-cover"
                />
                <h3 className="text-lg font-bold text-gray-900 mb-1">Rahul Sharma</h3>
                <p className="text-gray-600">Co-founder & CEO</p>
              </div>
              <div className="text-center">
                <img
                  src="public\professional-woman-headshot 1.jpg"
                  alt="Priya Patel"
                  className="w-full aspect-square rounded-lg mb-4 object-cover"
                />
                <h3 className="text-lg font-bold text-gray-900 mb-1">Priya Patel</h3>
                <p className="text-gray-600">Co-founder & CTO</p>
              </div>
              <div className="text-center">
                <img
                  src="public\professional-man-headshot.jpg"
                  alt="Amit Verma"
                  className="w-full aspect-square rounded-lg mb-4 object-cover"
                />
                <h3 className="text-lg font-bold text-gray-900 mb-1">Amit Verma</h3>
                <p className="text-gray-600">Head of Design</p>
              </div>
              <div className="text-center">
                <img
                  src="public\professional-woman-headshot.jpg"
                  alt="Neha Singh"
                  className="w-full aspect-square rounded-lg mb-4 object-cover"
                />
                <h3 className="text-lg font-bold text-gray-900 mb-1">Neha Singh</h3>
                <p className="text-gray-600">Head of Product</p>
              </div>
          </div>
        </div>
        

        {/* Stats */}
        <div className="bg-linear-to-r from-[#fdf6ec] to-[#fffaf3] rounded-2xl p-12 text-gray-800 mb-16">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "50K+", label: "Happy Users" },
              { number: "100K+", label: "Rooms Redesigned" },
              { number: "500K+", label: "Designs Created" },
              { number: "4.8★", label: "Average Rating" },
            ].map((stat, index) => (
              <div key={index}>
                <p className="text-4xl font-bold mb-2">{stat.number}</p>
                <p className="text-black-100">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Us Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-amber-900 mb-3">Get In Touch</h2>
            <p className="text-gray-700">
              Have questions? We'd love to hear from you. Drop us a message below.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-amber-900 mb-1">Contact Us</h3>
              <p className="text-sm text-gray-600">
                We'll get back to you as soon as possible.
              </p>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm text-gray-700 mb-1 font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your Name"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-700 mb-1 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your Email"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-gray-700 mb-1 font-medium">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  placeholder="Your message..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-amber-50 resize-none"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-700 text-white py-3 rounded-lg hover:bg-amber-800 transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
