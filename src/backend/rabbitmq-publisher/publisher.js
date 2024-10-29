import amqp from 'amqplib';

const QUEUE = 'order_service_booking_request';
const EXCHANGE = 'OrderEventExchange';
const TOTAL_MESSAGES = 100;  // Adjust the total number of messages as needed
const DELAY = 50;  // Delay in milliseconds between messages to simulate load

async function publishMessage() {
    try {
        // Connect to RabbitMQ
        const connection = await amqp.connect(`amqp://rileone:password@localhost:5672`);
        const channel = await connection.createChannel();

        // Ensure the queue exists
        try {
            await channel.checkExchange(EXCHANGE, 'direct', { durable: true });
        } catch (error) {
            console.error('Error checking exchange:', error);
        }
        
        await channel.assertQueue(QUEUE, { durable: true });

        // Function to publish a single message
        const sendSingleMessage = async (count) => {
            const message = {
                from: new Date(2025, (11 + count) % 12, (11 + count) % 28),
                to: new Date(2025, (11 + count) % 12, (11 + count) % 28 + 1),
                room: "102",
                road_bike_requested: count % 5 + 1,
                dirt_bike_requested: count % 3 + 1,
                bike_status: "PENDING",
                hotel_status: "PENDING",
                payment_status: "PENDING",
                amount: (100 + count).toString(),
                updated_at: new Date(),
                created_at: new Date(),
            };

            // Send the message to the queue
            channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(message)), {
                persistent: true,
            });

            console.log(`Message #${count + 1} sent to ${QUEUE}:`, message);
        };

        // Publish multiple messages
        console.time("StressTestDuration");
        for (let i = 0; i < TOTAL_MESSAGES; i++) {
            await sendSingleMessage(i);
            await new Promise((resolve) => setTimeout(resolve, DELAY));  // Optional delay
        }
        console.timeEnd("StressTestDuration");

        // Close the channel and connection
        await channel.close();
        await connection.close();
        console.log(`Stress test completed. Sent ${TOTAL_MESSAGES} messages.`);
    } catch (error) {
        console.error('Error during stress test:', error);
    }
}

// Execute the stress test
publishMessage();
