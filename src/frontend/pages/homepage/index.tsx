'use client'

import React, { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { RangeCalendar, CalendarDate } from "@nextui-org/calendar"
import { Button } from "@nextui-org/button"
import { Input } from "@nextui-org/input"
import { Select, SelectItem } from "@nextui-org/select"
import { Bike, Mountain, User, Menu, ChevronDown } from 'lucide-react'
import { today, getLocalTimeZone } from "@internationalized/date"
import { handleEmailAndCookie, retrieveEmail, createBookingData, fetchBookingData } from "./homepage.helpers"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
export default function Home() {
  const [value, setValue] = useState<{
    start: CalendarDate;
    end: CalendarDate;
  }>({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 1 }),
  })
  const [city, setCity] = useState("London")
  const [roadBikeValue, setRoadBikeValue] = useState("")
  const [mountainBikeValue, setMountainBikeValue] = useState("")
  const [email, setEmail] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    handleEmailAndCookie(setEmail)
  }, [])

  const handleCityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCity(event.target.value)
  }

  const handleRoadBikeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoadBikeValue(event.target.value)
  }

  const handleMountainBikeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMountainBikeValue(event.target.value)
  }

  const cookie = email ? retrieveEmail(email) : undefined

  const handleSend = async () => {
    if (!email || !cookie) {
      logger.error("[FRONTEND SERVICE] Email or cookie is missing")
      return
    }

    setIsLoading(true)
    const data = createBookingData(value, city, email, cookie, roadBikeValue, mountainBikeValue)

    try {
      setIsLoading(false)
      const result = await fetchBookingData(data)
      console.log(result)
      switch (result.status) {
        case 200: {
          let order_id = result.order_id;
          localStorage.setItem("bookingData", JSON.stringify({
            order_id, 
            value,
            city,
            email,
            cookie,
            roadBikeValue,
            mountainBikeValue,
          }))
          router.push("/summary")
          break;
        }
        case 400: {
          console.error("Bad request")
          break;
        }
        case 401: {
          console.error("Need to refresh JWT")
          break;
        }
        default: {
          console.error("Order failed")
        }
      }
    } catch (error) {
      logger.error("Error sending order:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-softbrown py-8 px-4 sm:px-6 lg:px-8">
            <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <img className="h-8 w-auto" src="/logo.png" alt="BnB Booking" />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a href="#" className="border-primary text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Home
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Destinations
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  About
                </a>
                <a href="#" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Contact
                </a>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center text-sm">
                    <span className="sr-only">Open user menu</span>
                    <User className="h-5 w-5 mr-2" />
                    <span>{email || 'Guest'}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="-mr-2 flex items-center sm:hidden">
              <Button variant="ghost" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary">
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </nav>
      </header>
      <div className="max-w-2xl mx-auto space-y-8">
        <header className="text-center">
          <img src="/logo.png" alt="BnB Booking Service Logo" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-gray-900">BnB Booking</h1>
        </header>

        <div className="space-y-4">
          <Select
            label="Select City"
            placeholder="Choose a city"
            onChange={handleCityChange}
            defaultSelectedKeys={[city]}
          >
            {["London", "Paris", "New York", "Rome", "Milan", "Madrid"].map((cityOption) => (
              <SelectItem key={cityOption} value={cityOption}>
                {cityOption}
              </SelectItem>
            ))}
          </Select>

          <div className="flex justify-center border border-gray-200 rounded-lg p-4">
            <RangeCalendar
              value={value}
              onChange={setValue}
              minValue={today(getLocalTimeZone())}
              locale="en-US"
              visibleMonths={1}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Road Bikes"
              type="number"
              placeholder="Quantity"
              value={roadBikeValue}
              onChange={handleRoadBikeChange}
              min={0}
              startContent={<Bike className="text-gray-400" />}
            />
            <Input
              label="Mountain Bikes"
              type="number"
              placeholder="Quantity"
              value={mountainBikeValue}
              onChange={handleMountainBikeChange}
              min={0}
              startContent={<Mountain className="text-gray-400" />}
            />
          </div>
        </div>

        <Button
          color="primary"
          onClick={handleSend}
          isLoading={isLoading}
          className="w-full"
        >
          {isLoading ? "Processing..." : "Book Now"}
        </Button>

        {email && (
          <p className="text-sm text-center text-gray-500">
            Logged in as: <span className="font-medium">{email}</span>
          </p>
        )}
      </div>
    </main>
  )
}