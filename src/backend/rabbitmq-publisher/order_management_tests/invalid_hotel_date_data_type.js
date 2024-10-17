import amqp from 'amqplib';

const QUEUE = 'booking_request';

async function publishMessage() {
    try {
        // Connect to RabbitMQ using the connection string
        const connection = await amqp.connect(`amqp://rileone:password@localhost:5672`);
        const channel = await connection.createChannel();

        // Ensure the queue exists
        await channel.assertQueue(QUEUE, { durable: true });

        // Create a message to send
        const message = {
            from: new Date(1, 0, 0).toISOString(),
            to: new Date(2025, 11, 11).toISOString(),
            room: "103",
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
publishMessage();
