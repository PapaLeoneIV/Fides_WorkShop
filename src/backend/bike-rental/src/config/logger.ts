import winston from "winston";
import { ElasticsearchTransport } from "winston-elasticsearch";

const esTransport = new ElasticsearchTransport({
  level: process.env.LOG_LEVEL || "info",
  clientOpts: { node: process.env.ELASTICSEARCH_URL || "http://localhost:9200" }, // Make sure this matches your Docker config
  indexPrefix: process.env.ELASTICSEARCH_INDEX_PREFIX,
});

const logFormat = winston.format.printf(({ timestamp, level, message, layer, data }) => {
  const safeData = data ? JSON.stringify(data, null, 2) : "";
  const safeLayer = layer || "GENERAL";
  return `${process.env.ELASTICSEARCH_INDEX_PREFIX} | [${timestamp}] [${level.toUpperCase()}] [${safeLayer}] ${message} - ${safeData}`;
});

const consoleFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.colorize({ all: true }), // Enables colorization for all fields
  winston.format.printf(({ timestamp, level, message, layer, data }) => {
    const safeData = data ? JSON.stringify(data, null, 2) : ""; // Pretty-print data
    const safeLayer = layer || "GENERAL"; // Default layer
    return `[${timestamp}] [${level}] [${safeLayer}] ${message} - ${safeData}`;
  })
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(winston.format.timestamp(), logFormat),
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({ filename: "logs/combined.info" }),
    new winston.transports.File({ filename: "logs/error.info", level: "error" }),
    esTransport,
  ],
});

export default logger;
