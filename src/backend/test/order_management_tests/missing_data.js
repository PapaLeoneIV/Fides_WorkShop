import amqp from 'amqplib';

const QUEUE = 'booking_request';

const message = {
    from: new Date(2025, 11, 11),
    to: new Date(2025, 11, 11),
    //missing room
    road_bike_requested: 1,
    dirt_bike_requested: 2,
    bike_status: "PENDING",
    hotel_status: "PENDING",
    payment_status: "PENDING",
    amount: "100",
    updated_at: new Date(),
    created_at: new Date(),
};

async function publishMessage() {
    try {
        // Connect to RabbitMQ using the connection string
        const connection = await amqp.connect(`amqp://rileone:password@localhost:5672`);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE, { durable: true });      

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
publishMessage();
