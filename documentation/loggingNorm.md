# Winston levels:

- `error`: 0
- `warn`: 1
- `info`: 2    -- default/actual
- `verbose`: 3
- `debug`: 4
- `silly`: 5

The default level is `info`, which means that `info` and levels above it will be logged. 
If you want to log everything, you can set the level to `silly`.

# Adding a new log

To add a new log, you can use the following code :

```javascript
logger.info('This is an info message');
logger.warn('This is a warning message');
logger.error('This is an error message');
// those are the only levels that are used in the project
```
## Global parameters:
Parameters that can be added to the log:
- `message`: the message to log
- `request_id`: the request id to log
- `order_id`: the order id to log
- `request_body`: the request body to log

For the development environment, please use the following parameters every time you log a message:
- `request_id`: the request id to log
- `order_id`: the order id to log  (if it's an order related log)
- `request_body`: the request body to log

example:

```javascript
logger.log('info', 'This is an info message', {request_id: '1234', order_id: '5678'});
```