import logger from "../../config/logger";
import { CalendarDate } from "@nextui-org/calendar";
import { getLocalTimeZone } from "@internationalized/date";


export const handleEmailAndCookie = (setEmail: React.Dispatch<React.SetStateAction<string | null>>) => {
    //serve a controllare che non sono nel server side
    if (typeof window !== 'undefined') {
        //mi prendo il query param
        const cookie = window.document.cookie
            .split("; ")
            .find((row) => row.startsWith("jwt="))
            //sono salvati come email=$value
            ?.split("=")[1];

        const urlParams = new URLSearchParams(window.location.search);
        //sto prendendo solo l email
        const emailFromQuery = urlParams.get('email');

        if (emailFromQuery) {
            setEmail(emailFromQuery);
        }
    }
};

export const retrieveEmail = (email: string) => {
    //serve a controllare che non sono nel server side
    let res = typeof window !== 'undefined' ? window.document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${email}`))
        //i jwt sono salvati come (key)$email=(value)$jwt
        ?.split("=")[1] : undefined;
    return res;
}

export const createBookingData = (value: {
    start: CalendarDate;
    end: CalendarDate;
},
    city: string,
    email: string,
    cookie: string,
    roadBikeValue: string,
    mountainBikeValue: string) => {
        //TODO i valori sono hardcodati per ora
    return {
        userJWT: cookie,
        userEmail: email,
        city: city,
        from: value.start.toDate(getLocalTimeZone()),
        to: value.end.toDate(getLocalTimeZone()),
        room: "103",
        road_bike_requested: parseInt(roadBikeValue, 10),
        dirt_bike_requested: parseInt(mountainBikeValue, 10),
        amount: "100",
        bike_status: "PENDING",
        hotel_status: "PENDING",
        payment_status: "PENDING",
        created_at: new Date(),
        updated_at: new Date(),
    };
};



export const fetchBookingData = async (data: any) => {
    try {
        const response = await fetch("http://localhost:3003/order/booking", {
            method: "POST",
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        logger.info(`Order sent successfully: ${result}`);
        return result;
    } catch (error) {
        logger.error(`Error sending order: ${error}`);
        throw error;
    }
};