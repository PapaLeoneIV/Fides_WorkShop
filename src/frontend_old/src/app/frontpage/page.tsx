
import { Calendar, DateValue } from "@nextui-org/calendar";
import { today, getLocalTimeZone } from "@internationalized/date";



export default function Home() {
 
  // let todayDate : DateValue = today(getLocalTimeZone());
  return (
    <main className="h-screen bg-softbrown flex items-center justify-center">
      <div className="flex flex-col items-center w-screen h-screen rounded-lg shadow-lg">
        <div>
          <img src="/static/hotelLogo.png" alt="logo" className="w-100 h-60" />
        </div>
        <Calendar
          aria-label="Date (Min Date Value)"
          defaultValue={today(getLocalTimeZone())}
          minValue={today(getLocalTimeZone())}
        />
        <div className="flex flex-col items-center space-y-4 flex-grow">
          <p className="text-gray-700 text-lg">Body</p>
          <form className="flex flex-col space-y-4 w-full max-w-xs">
            <input
              type="text"
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter text"
            />
            <input
              type="text"
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter text"
            />
            <input
              type="text"
              className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Enter text"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-cyan-500 text-white rounded hover:bg-cyan-600 transition duration-200"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}



