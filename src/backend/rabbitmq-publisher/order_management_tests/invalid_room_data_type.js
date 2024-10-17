import amqp from 'amqplib';

const QUEUE = 'booking_request';

async function publishMessage(room) {
    try {
        // Connect to RabbitMQ using the connection string
        const connection = await amqp.connect(`amqp://rileone:password@localhost:5672`);
        const channel = await connection.createChannel();

        // Ensure the queue exists
        await channel.assertQueue(QUEUE, { durable: true });

        // Create a message to send
        const message = {
            from: new Date(2025, 11, 11),
            to: new Date(2025, 11, 11),
            room: room,
            road_bike_requested: 1,
            dirt_bike_requested: 2,
            bike_status: "PENDING",
            hotel_status: "PENDING",
            payment_status: "PENDING",
            amount: "100",
            updated_at: new Date(),
            created_at: new Date(),
        };
        

        // Send the message to the queue
        channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), {
            persistent: true,
        });

        console.log(`Message sent to ${QUEUE}:`, message);

        // Close the channel and connection
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error publishing message:', error);
    }
}

// Execute the publishMessage function
let room = [];

room.push(0); //0
room.push("104"); //valid string
room.push(104); //invalid data type number
room.push(""); //invalid empty string
room.push(" "); //invalid whitespace string
room.push("104 "); //invalid whitespace string
room.push(" 104"); //invalid whitespace string
room.push("10 4"); //invalid whitespace string
room.push("10a4"); //invalid whitespace string
room.push("104a"); //invalid whitespace string
room.push("a104"); //invalid whitespace string
room.push("a"); //invalid whitespace string
room.push("a104a"); //invalid whitespace string
room.push("104a104"); //invalid whitespace string
room.push(new Date()); //invalid data type DATE
room.push(null); //invalid data type NULL
room.push(undefined); //invalid data type UNDEFINED
room.push(true); //invalid data type BOOLEAN
room.push(false); //invalid data type BOOLEAN
room.push({}); //invalid data type OBJECT
room.push([]); //invalid data type ARRAY
room.push([104]); //invalid data type ARRAY
room.push(["104"]); //invalid data type ARRAY

for (let i = 0; i < room.length; i++) {
    console.log("Publishing message with room:", room[i], "typeof room:", typeof room[i]);
    publishMessage(room[i]);
}

