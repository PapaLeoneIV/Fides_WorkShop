import React from "react";
import { RangeCalendar, CalendarDate } from "@nextui-org/calendar";
import { Button, ButtonGroup } from "@nextui-org/button";
import { today, getLocalTimeZone } from "@internationalized/date";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/dropdown';
import { Input } from '@nextui-org/react';

export default function Home() {
  let [value, setValue] = React.useState({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 1 }),
  });

  let selectedDateStart = new Date(value.start.year, value.start.month, value.start.day);
  let selectedDateEnd = new Date(value.end.year, value.end.month, value.end.day);

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
                <DropdownItem>London</DropdownItem>
                <DropdownItem>Paris</DropdownItem>
                <DropdownItem>New York</DropdownItem>
                <DropdownItem>Rome</DropdownItem>
                <DropdownItem>Milan</DropdownItem>
                <DropdownItem>Madrid</DropdownItem>
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
                />
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Button className="bg-blue-500 text-xs w-32">Mountain Bike</Button>
                <Input
                  type="number"
                  placeholder="Enter value"
                  className="w-32 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                />
              </div>
            </div>
            <Button className="bg-green-500 text-white mt-4 w-32">SEND</Button>
          </div>
        </div>

      </div>
    </main>
  );
}
