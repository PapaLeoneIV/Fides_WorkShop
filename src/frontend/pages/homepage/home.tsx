
import React from "react";
import { RangeCalendar, CalendarDate } from "@nextui-org/calendar";
import { Button, ButtonGroup } from "@nextui-org/button";
import { today, getLocalTimeZone } from "@internationalized/date";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/dropdown';



export default function Home() {
  let [value, setValue] = React.useState({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 1 }),
  });


  let selectedDateStart = new Date(value.start.year, value.start.month, value.start.day);
  let selectedDateEnd = new Date(value.end.year, value.end.month, value.end.day);



  return (
    <main className="h-screen bg-softbrown flex items-center justify-center">
      <div className="flex flex-col items-center w-screen h-screen rounded-lg shadow-lg">
        <div>
          <img src="/logo.png" alt="logo" className="w-100 h-60" />
        </div>
        <div className="px-8 w-screen">
          <div className="flex justify-center rounded-lg">
            <Dropdown>
              <DropdownTrigger>
                <Button className="bg-blue-500" >Select city</Button>
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
        <div className="flex items-center h-10 sm:h-32">
          <Button className="bg-blue-500">
            {selectedDateStart.toDateString()}
          </Button>
          <Button className="bg-blue-500">
            {selectedDateEnd.toDateString()}
          </Button>
        </div>
        <div className="px-8 w-screen">
          <div className="flex items-center h-10 sm:h-32">
            <p>The hotel you selected has a bundle for transportation!</p>

              <Button className="bg-blue-500">
                {selectedDateStart.toDateString()}
              </Button>
              <Button className="bg-blue-500">
                {selectedDateEnd.toDateString()}
              </Button>
          </div>
        </div>
      </div>
    </main>
  );
}



