'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Head } from "@/components/head"

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Here you would typically make an API call to register the user
    // For this example, we'll just simulate a successful registration
    const response = await fetch('http://localhost:3004/users/register', {
      method: 'POST',
      headers: {
      'Access-Control-Allow-Origin' : '*',
      'Content-Type': 'application/json',
      },
      body: JSON.stringify({
      email,
      password
      })
    })
    
    if (!response.ok) {
      const data = await response.json()
      setError(data.error)
      return
    }

    console.log('User registered:', email)


    // Redirect to login page after successful registration
    router.push('/auth/login')
  }

  return (
      <><title>Register</title><div className="flex items-center justify-center min-h-screen bg-softbrown">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit">Register</Button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <p className="mt-4 text-sm text-center">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div></>
  )
}