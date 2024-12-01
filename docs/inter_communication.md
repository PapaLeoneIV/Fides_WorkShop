```bash
                      +---------------------------------------------+
                      |                 booking_exchange            |
                      |                  (topic)                    |
                      +---------------------------------------------+
                                       /       |        \                
                                      /        |         \
                                     /         |          \
                    +---------------+----------+-----------+-------------+
                    |               |                      |             |
                    |               |                      |             |
              order.create      bike.availability    hotel.availability    payment.completed
                    |               |                      |             |
                    v               v                      v             v

            +-------------+     +--------------+      +-------------+     +--------------+
            |  order      |     |   bike       |      |   hotel    |     |   payment     |
            |  service    |     |   service    |      |   service  |     |   service     |
            +-------------+     +--------------+      +-------------+     +--------------+
                    |               |                        |                |
                    |               |                        |                |
                    |               |                        |                |
                    v               v                        v                v
+-----------------------+ +----------------------+ +-----------------------+ +----------------------+
| order_queue           | | bike_queue           | | hotel_queue           | | payment_queue        |
|                       | |                      | |                       | |                      |
| * Receives:           | | * Receives:          | | * Receives:           | | * Receives:          |    
|   - order.create      | |   - order.created    | |   - order.created     | |   - order.complete   |
|   - bike.availability | |                      | |                       | |                      |
|   - hotel.availability| | * Sends:             | | * Sends:              | | * Sends:             |
|   - payment.completed | |   - bike.availability| |   - hotel.availability| |   - payment.completed|
+-----------------------+ +----------------------+ +-----------------------+ +----------------------+

