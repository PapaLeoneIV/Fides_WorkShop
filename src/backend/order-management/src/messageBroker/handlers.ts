import { RabbitMQConnection } from "./connection";
import { OrderManagerDB, order_info } from "../api/service/orderService";


// Handler for requests coming from the frontend
export async function handle_req_from_frontend(instance: RabbitMQConnection, msg: string) {
    try {
      console.log(`[ORDER SERVICE] Received Request from frontend:`, msg);
      
      // Parse the incoming message
      const order_info: order_info = JSON.parse(msg);
      
      // Interact with the database manager to create the order
      const manager_db = new OrderManagerDB();
      await manager_db.create_order(order_info);
      
      // Send the order info to the bike and hotel services
      await instance.sendToBikeMessageBroker(msg);
      await instance.sendToHotelMessageBroker(msg);
      
    } catch (error) {
      console.error(`[ORDER SERVICE] Error while handling frontend request:`, error);
    }
  }
  
  // Handler for responses from the bike service
  export async function handle_res_from_bike(instance: RabbitMQConnection, msg: string) {
    try {
      console.log(`[ORDER SERVICE] Received Response from bike service:`, msg);
      
      // Parse the bike service response
      const response = JSON.parse(msg);
      
      // Update the bike status in the database
      const manager_db = new OrderManagerDB();
      await manager_db.update_bike_status(response.id, response.status);
      
      // Check the order status and decide next action
      await handle_order_status(instance, response.id);
      
    } catch (error) {
      console.error(`[ORDER SERVICE] Error while handling bike response:`, error);
    }
  }
  
  // Handler for responses from the hotel service
  export async function handle_res_from_hotel(instance: RabbitMQConnection, msg: string) {
    try {
      console.log(`[ORDER SERVICE] Received Response from hotel service:`, msg);
      
      // Parse the hotel service response
      const response = JSON.parse(msg);
      
      // Update the hotel status in the database
      const manager_db = new OrderManagerDB();
      await manager_db.update_hotel_status(response.id, response.status);
      
      // Check the order status and decide next action
      await handle_order_status(instance, response.id);
      
    } catch (error) {
      console.error(`[ORDER SERVICE] Error while handling hotel response:`, error);
    }
  }
  
  // Handler for responses from the payment service
  export async function handle_res_from_payment(instance: RabbitMQConnection, msg: string) {
    try {
      console.log(`[ORDER SERVICE] Received Response from payment service:`, msg);
      
      // Parse the payment service response
      const response = JSON.parse(msg);
      
      // Update the payment status in the database
      const manager_db = new OrderManagerDB();
      await manager_db.update_payment_status(response.id, response.status);
      
      // TODO: If the payment failed, handle the cancellation of bike and hotel orders.
      if (response.status !== 'SUCCESS') {
        console.log(`[ORDER SERVICE] Payment failed, reverting bike and hotel orders`);
        // Logic for reverting the orders can be added here
      }
      
    } catch (error) {
      console.error(`[ORDER SERVICE] Error while handling payment response:`, error);
    }
  }
  
  // Function to check the order status and send a message to the payment service if ready
  export async function handle_order_status(instance: RabbitMQConnection, order_id: string) {
    try {
      const manager_db = new OrderManagerDB();
      
      // Retrieve the order from the database
      const order = await manager_db.get_order(order_id);
      
      if (order && order.bike_status === "COMPLETED" && order.hotel_status === "COMPLETED") {
        console.log(`[ORDER SERVICE] Order is completed, sending request to payment service`, order);
        
        // Send the completed order to the payment service
        await instance.sendToPaymentMessageBroker(JSON.stringify(order));
      }
    } catch (error) {
      console.error(`[ORDER SERVICE] Error while checking order status:`, error);
    }
  }
  