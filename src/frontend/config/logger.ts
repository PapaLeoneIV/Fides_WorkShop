const logger = {
  info: (message: string, data: any = {}) => {
    console.log(`[INFO] ${message}`, data || ""); // Basic logging to the browser console
  },
  warn: (message: string, data: any = {}) => {
    console.warn(`[WARN] ${message}`, data || "");
  },
  error: (message: string, data: any = {}) => {
    console.error(`[ERROR] ${message}`, data || "");
  },
  debug: (message: string, data: any = {}) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, data || ""); // Only log debug messages in development mode
    }
  },
};

export default logger;
