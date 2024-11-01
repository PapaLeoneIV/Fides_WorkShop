import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";

export default function Home() {
  return (
    <main>
      <div className="flex items-center gap-2 hover:underline hover:underline-offset-4">
        <div>Booking service</div>
        <button className="flex items-center gap-2 hover:underline hover:underline-offset-4">Riccardo</button>
      </div>
    </main>
  )
}

Home()
