import { Link } from "react-router-dom"
import { Palette, ShoppingBag, TrendingDown, MessageCircle } from "lucide-react"

export default function Home() {
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      location: "Pune",
      text: '"Artistry AI helped me visualize my dream living room! The suggestions were spot on with my taste. The process was so simple and affordable."',
      rating: 5,
      avatar: "PS",
    },
    {
      id: 2,
      name: "Amit Kumar",
      location: "Jaipur",
      text: '"I was skeptical about DIY design, but this platform made it incredibly easy. I found the perfect furniture for my small apartment without any hassle."',
      rating: 5,
      avatar: "AK",
    },
    {
      id: 3,
      name: "Sunita Devi",
      location: "Lucknow",
      text: '"A fantastic tool for anyone on a budget. I managed to redesign my entire kitchen and saved a lot compared to hiring a professional designer."',
      rating: 5,
      avatar: "SD",
    },
  ]

  const brands = ["IKEA", "Flipkart", "Amazon", "Urban Ladder", "Pepperfry", "Wayfair"]

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-linear-to-b from-amber-50 to-white pt-20 pb-16 px-2">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-xl lg:text-6xl font-bold text-amber-800 mb-6 leading-tight">
                Redesign your room with AI.
              </h1>
              <p className="text-gray-700 text-l mb-8">Fast. Affordable. DIY. Your dream home is just a photo away.</p>
              <div className="flex gap-4">
                <Link
                  to="/mvp"
                  className="bg-amber-700 text-white px-8 py-3 rounded hover:bg-amber-800 transition-colors font-medium shadow-lg"
                >
                  Try MVP Workflow ✨
                </Link>
                <Link
                  to="/enhanced-workflow"
                  className="bg-white text-amber-700 border-2 border-amber-700 px-8 py-3 rounded hover:bg-amber-50 transition-colors font-medium"
                >
                  Try Full AI Workflow
                </Link>
                <Link
                  to="/ai-design"
                  className="border-2 border-amber-700 text-amber-700 px-8 py-3 rounded hover:bg-amber-50 transition-colors font-medium"
                >
                  Upload Your Room
                </Link>
              </div>
            </div>
            <div className="relative">
                <img
                src="/image.bedroom.png"
                alt="Modern bedroom design"
                className="rounded-2xl shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-amber-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-16">Transform your space in three simple steps.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Palette className="w-12 h-12 text-amber-700" />,
                title: "AI Design",
                description:
                  "Upload a photo of your room and get instant, personalized design suggestions from our AI.",
              },
              {
                icon: <ShoppingBag className="w-12 h-12 text-amber-700" />,
                title: "Design Visualization",
                description:
                  "See your redesigned space with before and after comparisons. Visualize your dream room in seconds.",
              },
              {
                icon: <TrendingDown className="w-12 h-12 text-amber-700" />,
                title: "Save Costs",
                description:
                  "Get professional-level design without the high cost. Perfect for the savvy Indian homeowner.",
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-amber-50 p-4 rounded-full">{item.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {index + 1}. {item.title}
                </h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
            
      {/* Testimonials */}
      <section className="py-20 px-4 bg-amber-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">What Our Users Say</h2>
          <p className="text-center text-gray-600 mb-16">
            Trusted by families across India to build their dream homes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white p-8 rounded-lg shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">{testimonial.text}</p>
                <div className="flex gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
        <h3 className="text-4xl font-bold text-center text-gray-900 mb-4">Our Trusted Brands</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center">
            {brands.map((brand, index) => (
              <div key={index} className="text-center text-gray-900 font-semibold">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-12 px-4 bg-amber-100">
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
      </section>

            {/* WhatsApp Button */}
            <div className="fixed bottom-8 right-8 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors cursor-pointer">
        <MessageCircle size={24} />
      </div>

    </main>
  )
}