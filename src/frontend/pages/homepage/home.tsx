import React from "react";
import { RangeCalendar, CalendarDate } from "@nextui-org/calendar";
import { Button, ButtonGroup } from "@nextui-org/button";
import { today, getLocalTimeZone } from "@internationalized/date";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/dropdown';
import { Input } from '@nextui-org/react';
import { create } from "domain";

export default function Home() {
  let [value, setValue] = React.useState({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 1 }),
  });

  let [city, setCity] = React.useState("London");
  let [roadBikeValue, setRoadBikeValue] = React.useState("");
  let [mountainBikeValue, setMountainBikeValue] = React.useState("");

  const handleCityChange = (selectedCity : any) => {
    setCity(selectedCity);
  };

  const handleRoadBikeChange = (event: any) => {
    setRoadBikeValue(event.target.value);
  };

  const handleMountainBikeChange = (event: any) => {
    setMountainBikeValue(event.target.value);
  };

  const cookie = typeof window !== 'undefined' ? window.document.cookie
    .split("; ")
    .find((row) => row.startsWith("jwt="))
    ?.split("=")[1] : undefined;
  const handleSend = () => {
    console.log("Sending data to the server...");
    const data = {
      userJWT : cookie,
      //TODO hardcoded values
      userEmail: "everonel@gmail.com",
      city: city,
      from: value.start.toDate(getLocalTimeZone()),
      to: value.end.toDate(getLocalTimeZone()),
      //TODO hardcoded values
      room: "103",
      road_bike_requested: parseInt(roadBikeValue,10),
      dirt_bike_requested: parseInt(mountainBikeValue, 10),
      //TODO hardcoded values
      amount: "100",
      //TODO hardcoded values
      bike_status: "PENDING",
      //TODO hardcoded values
      hotel_status: "PENDING",
      //TODO hardcoded values
      payment_status: "PENDING",
      //TODO hardcoded values
      created_at: new Date(),
      //TODO hardcoded values
      updated_at: new Date()
    };

    //TODO set up route
    fetch("http://localhost:3003/order/booking", {
      method: "POST",
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        // Handle the response from the server
      })
      .catch((error) => {
        // Handle any errors
      });
  };

  return (
    <main className="flex items-center justify-center h-screen bg-softbrown">
      <div className="flex flex-col items-center w-screen h-screen rounded-lg shadow-lg">
        <img src="/logo.png" alt="logo" className="w-100 h-60" />

        <div className="px-8 w-screen">
          <div className="flex justify-center">
            <Dropdown>
              <DropdownTrigger>
                <Button className="bg-blue-500">Select city</Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem onClick={() => handleCityChange("London")}>London</DropdownItem>
                <DropdownItem onClick={() => handleCityChange("Paris")}>Paris</DropdownItem>
                <DropdownItem onClick={() => handleCityChange("New York")}>New York</DropdownItem>
                <DropdownItem onClick={() => handleCityChange("Rome")}>Rome</DropdownItem>
                <DropdownItem onClick={() => handleCityChange("Milan")}>Milan</DropdownItem>
                <DropdownItem onClick={() => handleCityChange("Madrid")}>Madrid</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>

        <RangeCalendar
          aria-label="Date (Min Date Value)"
          value={value}
          onChange={setValue}
        />
        <div className="flex flex-col items-center px-10 w-screen mt-10">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-lg font-semibold text-center">Select how many bikes you would like to rent!</p>
            <div className="flex flex-row space-x-4">
              <div className="flex flex-col items-center space-y-2">
                <Button className="bg-blue-500 text-xs w-32">Road Bike</Button>
                <Input
                  type="number"
                  placeholder="Enter value"
                  className="w-32 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  value={roadBikeValue}
                  onChange={handleRoadBikeChange}
                />
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Button className="bg-blue-500 text-xs w-32">Mountain Bike</Button>
                <Input
                  type="number"
                  placeholder="Enter value"
                  className="w-32 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                  value={mountainBikeValue}
                  onChange={handleMountainBikeChange}
                />
              </div>
            </div>
            <Button className="bg-green-500 text-white mt-4 w-32" onClick={handleSend}>SEND</Button>
          </div>
        </div>

      </div>
    </main>
  );
}
