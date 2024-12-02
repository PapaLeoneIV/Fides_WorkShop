import {verify, JwtPayload, Secret } from "jsonwebtoken";
import logger from "@/config/logger";
import dotenv from 'dotenv'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
interface Message {
  email: string;
  password: string;
  jwtToken?: string;
}

dotenv.config()

export default function LoginPage() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const makeLoginRequest = async (msg : Message) => {
    const response = await fetch('http://localhost:3004/users/login', {
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msg
      })
    })
    return await response.json();
  }

  const makeRefreshRequest = async (msg : Message) => {
    const response = await fetch('http://localhost:3004/auth/refreshJWT', {
      method: 'POST',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        msg
      })
    })
    return await response.json();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let message: Message = { email: email, password: password };

    // Retrieve token from cookies
    let token = getCookie(`${email}`);
    if (!token) {
        logger.error(`JWT not found, making login request.`);
        let response = await makeLoginRequest(message);
        if (response.status === 'APPROVED') {
            logger.info(`Login approved, storing JWT.`);
            document.cookie = `${email}=${response.token}; path=/`;
            router.push(`/homepage?email=${email}`);
        } else {
            setError(response.message);
            return;
        }
    } else {
        logger.info(`JWT found, verifying.`);

        // Check if token is expired
        let isExpired = checkTokenExpiry(token);
        if (isExpired) {
            logger.error(`Token expired, making refresh request.`);
            let response = await makeRefreshRequest({email:email, password: password,  jwtToken: token });
            if (response.status === 'APPROVED') {
                logger.info(`Refresh approved, storing new JWT.`);
                document.cookie = `${email}=${response.token}`; `path=/`;
                router.push(`/homepage?email=${email}`);
            } else {
                setError("Session expired, please login again.");
                return;
            }
        } else {
            logger.info(`Token verified, redirecting to homepage.`);
            router.push(`/homepage?email=${email}`);
        }
    }
};

function getCookie(name: string): string | undefined {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([.$?*|{}\(\)\[\]\/\\])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function checkTokenExpiry(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000; // Convert to milliseconds
        return expiry < Date.now();
    } catch (e) {
        return true;
    }
}

  return (
    <><title>Login</title><div className="bg-softbrown flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
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
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit">Login</Button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
            <p className="mt-4 text-sm text-center">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-blue-500 hover:underline">
                Register
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div></>
  )

}