import { RabbitMQConnection } from "./connection";
import { OrderManagerDB, order_info } from "../api/service/orderService";


export async function handle_req_from_frontend(instance: RabbitMQConnection, msg: string) {
    try {
      console.log(`[ORDER SERVICE] Received Request from frontend:`, msg);
      

      //TODO parse the message
      const order_info: order_info = JSON.parse(msg);
      //TODO split the message to send bike and hotel service only needed data
      
      const manager_db = new OrderManagerDB();
      manager_db.create_order(order_info);
      
      instance.sendToBikeMessageBroker(msg);
      instance.sendToHotelMessageBroker(msg);
      
    } catch (error) {
      console.error(`[ORDER SERVICE] Error while handling frontend request:`, error);
    }
  }
  
  export async function handle_res_from_bike(instance: RabbitMQConnection, msg: string) {
    try {
      console.log(`[ORDER SERVICE] Received Response from bike service:`, msg);
      //TODO parse the message
      
      const response = JSON.parse(msg);
      
      const manager_db = new OrderManagerDB();
      await manager_db.update_bike_status(response.id, response.status);
      
      await handle_order_status(instance, response.id);
      
    } catch (error) {
      console.error(`[ORDER SERVICE] Error while handling bike response:`, error);
    }
  }
  
  export async function handle_res_from_hotel(instance: RabbitMQConnection, msg: string) {
    try {
      console.log(`[ORDER SERVICE] Received Response from hotel service:`, msg);
      //TODO parse the message
      
      const response = JSON.parse(msg);
      
      const manager_db = new OrderManagerDB();
      await manager_db.update_hotel_status(response.id, response.status);
      
      await handle_order_status(instance, response.id);
      
    } catch (error) {
      console.error(`[ORDER SERVICE] Error while handling hotel response:`, error);
    }
  }
  
  export async function handle_res_from_payment(instance: RabbitMQConnection, msg: string) {
    try {
      console.log(`[ORDER SERVICE] Received Response from payment service:`, msg);
      //TODO parse the message
      
      const response = JSON.parse(msg);
      
      const manager_db = new OrderManagerDB();
      await manager_db.update_payment_status(response.id, response.status);
      
      if (response.status !== 'SUCCESS') {
        console.log(`[ORDER SERVICE] Payment failed, reverting bike and hotel orders`);
      }
      
    } catch (error) {
      console.error(`[ORDER SERVICE] Error while handling payment response:`, error);
    }
  }
  
  export async function handle_order_status(instance: RabbitMQConnection, order_id: string) {
    try {
      const manager_db = new OrderManagerDB();
      //TODO parse the message
      
      const order = await manager_db.get_order(order_id);
      
      if (order && order.bike_status === "COMPLETED" && order.hotel_status === "COMPLETED") {
        console.log(`[ORDER SERVICE] Order is completed, sending request to payment service`, order);
        
        await instance.sendToPaymentMessageBroker(JSON.stringify(order));
      }
    } catch (error) {
      console.error(`[ORDER SERVICE] Error while checking order status:`, error);
    }
  }
  