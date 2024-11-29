import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, MapPinIcon, Router, SearchIcon, StarIcon, UserIcon } from 'lucide-react'
import { useRouter } from 'next/router'

export default function LandingPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-b from-softbrown to-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <MapPinIcon className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-blue-900">StayScape</h1>
        </div>
        <nav className="hidden md:flex space-x-8">
          <a href="#" className="text-blue-900 hover:text-blue-700">Home</a>
          <a href="#" className="text-blue-900 hover:text-blue-700">Listings</a>
          <a href="#" className="text-blue-900 hover:text-blue-700">About</a>
          <a href="#" className="text-blue-900 hover:text-blue-700">Contact</a>
        </nav>
        <div className="flex space-x-4">
          <Button variant="outline"
            onClick={() => { router.push("/auth/login") }}>Sign In</Button>
          <Button
            onClick={() => { router.push("/auth/register") }
            }>Sign Up</Button>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-blue-900 leading-tight">
                Find Your Perfect Getaway
              </h2>
              <p className="text-xl text-blue-700">
                Discover unique stays and experiences in beautiful locations around the world.
              </p>
              <div className="bg-white p-6 rounded-lg shadow-lg space-y-4">
                <div className="flex space-x-4">
                  <Input placeholder="Where are you going?" className="flex-grow" />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? date.toDateString() : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex space-x-4">
                  <Input placeholder="Guests" type="number" min="1" />
                  <Button className="w-full">
                    <SearchIcon className="mr-2 h-4 w-4" /> Search
                  </Button>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="Beautiful vacation rental"
                className="rounded-lg shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <p className="text-lg font-semibold text-blue-900">Over 1 million stays</p>
                <p className="text-blue-700">Book your dream vacation today</p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-softbrown py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold text-blue-900 mb-8">Featured Properties</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden transition-transform hover:scale-105">
                  <img
                    src={`/house${i}.jpg?height=200&width=300&text=Property+${i}`}
                    alt={`Featured property ${i}`}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-4">
                    <h4 className="text-xl font-semibold text-blue-900 mb-2">Cozy Cabin Retreat</h4>
                    <p className="text-blue-700 mb-4">Nestled in the heart of nature, perfect for a relaxing getaway.</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-blue-900">$150/night</span>
                      <div className="flex items-center">
                        <StarIcon className="h-5 w-5 text-yellow-500 mr-1" />
                        <span className="text-blue-700">4.9 (128 reviews)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 md:py-24">
          <h3 className="text-3xl font-bold text-blue-900 mb-12 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: SearchIcon, title: "Search", description: "Find the perfect stay from our vast selection of properties." },
              { icon: CalendarIcon, title: "Book", description: "Choose your dates and book instantly with our easy-to-use platform." },
              { icon: UserIcon, title: "Enjoy", description: "Arrive at your destination and enjoy a memorable stay." }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-100 rounded-full p-6 inline-block mb-4">
                  <step.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="text-xl font-semibold text-blue-900 mb-2">{step.title}</h4>
                <p className="text-blue-700">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-blue-900 text-white py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold mb-12 text-center">What Our Guests Say</h3>
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <Card key={i} className="bg-blue-800 text-white p-6">
                  <CardContent>
                    <p className="mb-4 italic">"Absolutely amazing experience! The property was even better than the pictures, and the host was incredibly helpful. Can't wait to book again!"</p>
                    <div className="flex items-center">
                      <img
                        src={`/placeholder.svg?height=50&width=50&text=Guest+${i}`}
                        alt={`Guest ${i}`}
                        className="rounded-full w-12 h-12 mr-4"
                      />
                      <div>
                        <p className="font-semibold">Sarah Johnson</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon key={i} className="h-5 w-5 text-yellow-500" />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16 md:py-24 text-center">
          <h3 className="text-3xl font-bold text-blue-900 mb-6">Ready to Start Your Adventure?</h3>
          <p className="text-xl text-blue-700 mb-8">Join thousands of happy travelers and book your perfect stay today.</p>
          <Button size="lg" className="text-lg px-8 py-4">
            Get Started
          </Button>
        </section>
      </main>

      <footer className="bg-blue-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-4">About StayScape</h4>
              <p className="text-blue-700">Connecting travelers with unique and comfortable accommodations around the world.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-4">Quick Links</h4>
              <ul className="space-y-2 text-blue-700">
                <li><a href="#" className="hover:underline">Home</a></li>
                <li><a href="#" className="hover:underline">Listings</a></li>
                <li><a href="#" className="hover:underline">About Us</a></li>
                <li><a href="#" className="hover:underline">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-4">Support</h4>
              <ul className="space-y-2 text-blue-700">
                <li><a href="#" className="hover:underline">FAQ</a></li>
                <li><a href="#" className="hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:underline">Terms of Service</a></li>
                <li><a href="#" className="hover:underline">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-blue-900 mb-4">Connect With Us</h4>
              <div className="flex space-x-4">
                {/* Add social media icons here */}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-blue-200 text-center text-blue-700">
            <p>&copy; 2023 StayScape. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}