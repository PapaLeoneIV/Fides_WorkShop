import amqp from 'amqplib';

const QUEUE = 'login_request';

async function publishMessage() {
    try {
        // Connect to RabbitMQ using the connection string
        const connection = await amqp.connect(`amqp://rileone:password@localhost:5672`);
        const channel = await connection.createChannel();

        // Ensure the queue exists
        await channel.assertQueue(QUEUE, { durable: true });

        // Create a message to send
        const message = {
            email: 'rileone@gmail.com',
            password: 'password',
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
