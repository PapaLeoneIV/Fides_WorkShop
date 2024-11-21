//TODO: Add to all messages about a request the request object
export const Messages = {
    BOOT: {
      ERROR: {
        BOOTING: (message: string, data: any = {}) => ({
          message: `Booting: ${message}`,
          data: { ...data },
        }),
        CONNECTING: (message: string, data: any = {}) => ({
          message: `Connecting: ${message}`,
          data: { ...data },
        }),
      },
      WARNING: {},
      INFO: {
        BOOTING: (message: string, data: any = {}) => ({
          message: `Booting: ${message}`,
          data: { ...data },
        }),
        CONNECTING: (message: string, data: any = {}) => ({
          message: `Connecting: ${message}`,
          data: { ...data },
        }),
        FETCHING: (message: string, data: any = {}) => ({
          message: `Fetching: ${message}`,
          data: { ...data },
        }),
        CONFIGURING: (message: string, data: any = {}) => ({
          message: `Configuring: ${message}`,
          data: { ...data },
        }),
      },
    },
    CONTROLLER: {
      ERROR: {
        VALIDATING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Validating: ${message}`,
          data: { h_req, ...data },
        }),
        PROCESSING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Processing: ${message}`,
          data: { h_req, ...data },
        }),
      },
      WARNING: {
        VALIDATING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Request not validated: ${message}`,
          data: { h_req, ...data },
        }),
        PROCESSING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Request not processed: ${message}`,
          data: { h_req, ...data },
        }),
      },
      INFO: {
        PROCESSING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Processing: ${message}`,
          data: { h_req, ...data },
        }),
        VALIDATING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Validating: ${message}`,
          data: { h_req, ...data },
        }),
        OPERATING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Operation successful: ${message}`,
          data: { h_req, ...data },
        }),
      },
    },
    SERVICE: {
      ERROR: {
        PROCESSING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Error processing : ${message}`,
          data: { h_req, ...data },
        }),
      },
      WARNING: {
        PROCESSING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Request not processed: ${message}`,
          data: { h_req, ...data },
        }),
      },
      INFO: {
        PROCESSING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Event received: ${message}`,
          data: { h_req, ...data },
        }),
        VALIDATING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Parameter validated: ${message}`,
          data: { h_req, ...data },
        }),
      },
    },
    REPOSITORY: {
      ERROR: {
        READING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Error occurred while reading data: ${message}`,
          data: { h_req, ...data },
        }),
        WRITING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Error occurred while writing data: ${message}`,
          data: { h_req, ...data },
        }),
      },
      WARNING: {
        READING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Warning occurred while reading data: ${message}`,
          data: { h_req, ...data },
        }),
        WRITING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Warning occurred while writing data: ${message}`,
          data: { h_req, ...data },
        }),
      },
      INFO: {
        READING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Data has been read: ${message}`,
          data: { h_req, ...data },
        }),
        WRITING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Data written: ${message}`,
          data: { h_req, ...data },
        }),
      },
    },
    CLIENT: {
      ERROR: {
        CONNECTING: (message: string, data: any = {}) => ({
          message: `Connecting: ${message}`,
          data: { ...data },
        }),
        CONFIGURING: (message: string, data: any = {}) => ({
          message: `Configuring : ${message}`,
          data: { ...data },
        }),
        FETCHING: (message: string, data: any = {}) => ({
          message: `Fetching: ${message}`,
          data: { ...data },
        }),
        OPERATING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Operating: ${message}`,
          data: { h_req, ...data },
        }),
      },
      WARNING: {
        CONNECTING: (message: string, data: any = {}) => ({
          message: `Connecting: ${message}`,
          data: { ...data },
        }),
        OPERATING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Operating: ${message}`,
          data: { h_req, ...data },
        }),
      },
      INFO: {
        CONNECTING: (message: string, data: any = {}) => ({
          message: `Connecting: ${message}`,
          data: { ...data },
        }),
        CONFIGURING: (message: string, data: any = {}) => ({
          message: `Configuring: ${message}`,
          data: { ...data },
        }),
        FETCHING: (message: string, data: any = {}) => ({
          message: `Fetching: ${message}`,
          data: { ...data },
        }),
        OPERATING: (message: string, h_req: string = "", data: any = {}) => ({
          message: `Operating: ${message}`,
          data: { h_req, ...data },
        }),
      },
    },
  };
  