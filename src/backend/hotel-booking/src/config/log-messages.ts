//TODO: Add to all messages about a request the request object
export const Messages = {
    BOOT: {
        ERROR: {
            CONNECTION_ERROR: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Error connecting: ${message}`,
                data: { h_req, ...data },
            }),
            FETCH_ERROR: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Error fetching: ${message}`,
                data: { h_req, ...data },
            }),
        },
        WARNING: { },
        INFO: {
            CONNECTION_SUCCESS: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Connection successful: ${message}`,
                data: { h_req, ...data },
            }),
            FETCH_SUCCESS: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Fetch successful: ${message}`,
                data: { h_req, ...data },
            }),
            CONSUMER_CONNECTED: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Consumer connected: ${message}`,
                data: { h_req, ...data },
            }),
            QUEUE_CREATED: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Queue created: ${message}`,
                data: { h_req, ...data },
            }),
        },
        DEBUG: {
            CONNECTION_ATTEMPT: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Attempting to connect: ${message}`,
                data: { h_req, ...data },
            }),
            FETCH_ATTEMPT: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Attempting to fetch: ${message}`,
                data: { h_req, ...data },
            }),
        },
    },
    CONTROLLER: {
        INFO: {
            REQUEST_VALIDATED: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Request validated successfully: ${message}`,
                data: { h_req, ...data },
            }),
            REQUEST_RECEIVED: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Request received: ${message}`,
                data: { h_req, ...data },
            }),
        },
        ERROR: {
            VALIDATING_REQUEST: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Error validating request: ${message}`,
                data: { h_req, ...data },
            }),
        },
    },
    SERVICE: {
        ERROR: {
            ERROR_PUBLISHING_RESPONSE: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Error publishing response: ${message}`,
                data: { h_req, ...data },
            }),
            ERROR_PROCESSING_REQUEST: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Error processing request: ${message}`,
                data: { h_req, ...data },
            }),
        },
        WARNING: {
            REQUEST_NOT_PROCESSED: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Request not processed: ${message}`,
                data: { h_req, ...data },
            }),
        },
        INFO: {
            RESPONSE_PUBLISHED: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Event published: ${message}`,
                data: { h_req, ...data },
            }),
            REQUEST_RECEIVED: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Event received: ${message}`,
                data: { h_req, ...data },
            }),
            REQUEST_PROCESSED: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Request processed: ${message}`,
                data: { h_req, ...data },
            }),
        },
        DEBUG: {
            REQUEST_PROCESSED: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Request processed: ${message}`,
                data: { h_req, ...data },
            }),
        }

    },
    REPOSITORY: {
        ERROR: {
        },
        WARNING: {
            READING_DATA: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Warning occurred while reading data: ${message}`,
                data: { h_req, ...data },
            }),
            WRITING_DATA: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Warning occurred while writing data: ${message}`,
                data: { h_req, ...data },
            }),
        },
        INFO: {
            READING_DATA: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Data has been read: ${message}`,
                data: { h_req, ...data },
            }),
            WRITING_DATA: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Data written: ${message}`,
                data: { h_req, ...data },
            }),
            
        },
        DEBUG: {
            READING_DATA: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Reading data: ${message}`,
                data: { h_req, ...data },
            }),
            WRITING_DATA: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Writing data: ${message}`,
                data: { h_req, ...data },
            }),
        },
    },
    CLIENT: {
        ERROR: {
            NULL_OCCURED: (message: string, h_req: string = "", data: any = {}) => ({
                message: `Null occurred: ${message}`,
                data: { h_req, ...data },
            }),
        }
    },
};