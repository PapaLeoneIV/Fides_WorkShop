const createLogMessage = (
  layer: string,
  level: string,
  action: string,
  message: string,
  data: any = {},
  req?: any // Optional request object
) => ({
  layer,
  level,
  action,
  message,
  data: {
    ...data,
    ...(req
      ? {
          request: {
            id: req.id || null,
            method: req.method || null,
            url: req.url || null,
            user: req.user || null, // Assuming req.user holds authenticated user info
          },
        }
      : {}),
  },
  timestamp: new Date().toISOString(),
});

const log = {
  BOOT: {
    BOOTING: (msg: string, data: any = {}, req?: any) => createLogMessage("BOOT", "BOOTING", msg, data, req),
    CONNECTING: (msg: string, data: any = {}, req?: any) => createLogMessage("BOOT", "CONNECTING", msg, data, req),
    CONFIGURING: (msg: string, data: any = {}, req?: any) => createLogMessage("BOOT", "CONFIGURING", msg, data, req),
    FETCHING: (msg: string, data: any = {}, req?: any) => createLogMessage("BOOT", "FETCHING", msg, data, req),
  },
  CONTROLLER: {
    VALIDATING: (msg: string, data: any, req?: any) => createLogMessage("CONTROLLER", "VALIDATING", msg, data, req),
    PROCESSING: (msg: string, data: any, req?: any) => createLogMessage("CONTROLLER", "PROCESSING", msg, data, req),
    OPERATING: (msg: string, data: any, req?: any) => createLogMessage("CONTROLLER", "OPERATING", msg, data, req),
  },
  SERVICE: {
    VALIDATING: (msg: string, data: any, req?: any) => createLogMessage("SERVICE", "VALIDATING", msg, data, req),
    PROCESSING: (msg: string, data: any, req?: any) => createLogMessage("SERVICE", "PROCESSING", msg, data, req),
  },
  REPOSITORY: {
    READING: (msg: string, data: any, req?: any) => createLogMessage("REPOSITORY", "READING", msg, data, req),
    WRITING: (msg: string, data: any, req?: any) => createLogMessage("REPOSITORY", "WRITING", msg, data, req),
  },
  CLIENT: {
    CONNECTING: (msg: string, data: any = {}, req?: any) => createLogMessage("CLIENT", "CONNECTING", msg, data, req),
    CONFIGURING: (msg: string, data: any = {}, req?: any) => createLogMessage("CLIENT", "CONFIGURING", msg, data, req),
    FETCHING: (msg: string, data: any = {}, req?: any) => createLogMessage("CLIENT", "FETCHING", msg, data, req),
    OPERATING: (msg: string, data: any = {}, req?: any) => createLogMessage("CLIENT", "OPERATING", msg, data, req),
  },
};

export default log;
