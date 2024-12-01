import winston from "winston";
import { ElasticsearchTransport } from "winston-elasticsearch";

const esTransport = new ElasticsearchTransport({
  level: process.env.LOG_LEVEL || "info",
  clientOpts: { node: process.env.ELASTICSEARCH_URL || "http://localhost:9200" }, // Make sure this matches your Docker config
  indexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX,
});

const logFormat = winston.format.printf(({ timestamp, level, message, layer, data }) => {
  return `[${timestamp}] [${level.toUpperCase()}] [${layer}] ${message} - ${JSON.stringify(data)}`;
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(), 
    logFormat
),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
),
    }),
    new winston.transports.File({ filename: "logs/combined.log" }),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    esTransport,
  ],
});

export default logger;
