'use client'

import { useEffect, useState } from "react"
import { Loader2, Mail, Calendar, MapPin, Bike, Facebook, Instagram, Twitter } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

type DateType = {
  calendar: {
    identifier: string
  }
  era: string
  year: number
  month: number
  day: number
}

type BookingData = {
  order_id: string
  value: {
    start: DateType
    end: DateType
  }
  city: string
  email: string
  cookie: string
  roadBikeValue: number
  mountainBikeValue: number
}

type FetchStatus = 'idle' | 'loading' | 'success' | 'error'

export default function OrderConfirmation() {
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [fetchStatus, setFetchStatus] = useState<FetchStatus>('idle')
  const [confirmationMessage, setConfirmationMessage] = useState<string>('')

  useEffect(() => {
    const data = localStorage.getItem("bookingData")
    if (data) {
      setBookingData(JSON.parse(data) as BookingData)
      localStorage.removeItem("bookingData")
    }
  }, [])

  useEffect(() => {
    if (bookingData) {
      simulateApiCall()
    }
  }, [bookingData])

  const simulateApiCall = async () => {
    setFetchStatus('loading')
    try {
      console.log("bookingData:", bookingData?.order_id)  
      if(bookingData){
        let result = await fetch(`http://localhost:3003/order/confirmation?order_id=${bookingData.order_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        console.info("RESULT:", result);
        switch (result.status) {
          case 200:
            setFetchStatus('success')
            console.info(fetchStatus)
            setConfirmationMessage('Your order has been successfully processed!')
            break
          case 202:
            setFetchStatus('error')
            setConfirmationMessage('Order is still processing. Please check back later.')
            break
          case 400:
            setFetchStatus('error')
            setConfirmationMessage('An error occurred while processing your order. Please try again.')
            break
          case 404:
            setFetchStatus('error')
            setConfirmationMessage('Order not found. Please try again.')
            break
          case 409:
            setFetchStatus('error')
            setConfirmationMessage('Order was cancelled. Please try again with another date/city.')
            break
        }
      }
    } catch (error) {
      setFetchStatus('error')
      setConfirmationMessage('An error occurred while processing your order. Please try again.')
    }
  }

  const formatDate = (date: DateType) => {
    return `${date.day}/${date.month}/${date.year}`
  }

  if (!bookingData) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-softbrown">
      <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="text-3xl font-bold text-center">Order Confirmation</CardTitle>
          </CardHeader>
          <CardContent className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Calendar className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-lg">Booking Period</p>
                  <p>{formatDate(bookingData.value.start)} to {formatDate(bookingData.value.end)}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-lg">City</p>
                  <p>{bookingData.city}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-lg">Email</p>
                  <p>{bookingData.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Bike className="h-5 w-5 text-primary mt-1" />
                <div>
                  <p className="font-semibold text-lg">Bikes</p>
                  <p>Road: {bookingData.roadBikeValue}, Mountain: {bookingData.mountainBikeValue}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          {fetchStatus === 'loading' && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-xl font-semibold">Processing your order...</p>
            </div>
          )}
          {fetchStatus === 'success' && (
            <Card className="shadow-lg">
              <CardHeader className="bg-green-500 text-white">
                <CardTitle className="text-2xl font-bold">Booking Confirmed!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 mt-6">
                <Alert className="bg-green-50 border-green-200">
                  <Mail className="h-5 w-5 text-green-600" />
                  <AlertTitle className="text-green-800 font-semibold">Confirmation Email Sent</AlertTitle>
                  <AlertDescription className="text-green-700">
                    We've sent a detailed confirmation to {bookingData.email}. Please check your inbox (and spam folder, just in case).
                  </AlertDescription>
                </Alert>
                <div className="text-left space-y-3">
                  <p><strong className="font-semibold">Order ID:</strong> {bookingData.order_id}</p>
                  <p><strong className="font-semibold">Pickup Location:</strong> Our main store in {bookingData.city}. Address details are in your email.</p>
                  <p><strong className="font-semibold">Pickup Time:</strong> You can collect your bikes from 9 AM on {formatDate(bookingData.value.start)}.</p>
                  <p><strong className="font-semibold">Return:</strong> Please return the bikes by 6 PM on {formatDate(bookingData.value.end)}.</p>
                  <p><strong className="font-semibold">Need Help?</strong> Our customer service is available 24/7 at +1 (555) 123-4567.</p>
                </div>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                  <Button size="lg">View Full Order Details</Button>
                  <Button variant="outline" size="lg">Print Confirmation</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {fetchStatus === 'error' && (
            <Card className="shadow-lg bg-red-50 border-red-200">
              <CardContent className="p-6">
                <p className="text-xl font-semibold text-red-600 mb-4">{confirmationMessage}</p>
                <Button className="bg-red-600 hover:bg-red-700 text-white" size="lg" onClick={simulateApiCall}>Try Again</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-lg font-semibold">Bnb Booking Co.</p>
              <p className="text-sm text-gray-400">© 2023 All rights reserved</p>
            </div>
            <div className="flex space-x-6">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Twitter className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}