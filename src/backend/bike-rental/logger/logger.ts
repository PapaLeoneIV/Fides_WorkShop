import winston from 'winston';
import Elasticsearch from 'winston-elasticsearch';

///**uncomment to try use /config/winston-es-config.json as transporter */
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Get the directory name in ES module scope
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Load the configuration file
// const configPath = path.join(__dirname, 'config', 'winston-es-config.json');
// const esConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// // Override the node URL with the environment variable if it exists
// esConfig.clientOpts.node = process.env.ELASTICSEARCH_URL || esConfig.clientOpts.node;

// console.log('Elasticsearch URL:', esConfig.clientOpts.node);
// console.log('Elasticsearch Transport Options:', esConfig);

// const esTransport = new Elasticsearch(esConfig);

const elasticsearchUrl = process.env.ELASTICSEARCH_URL;
console.log('Elasticsearch URL:', elasticsearchUrl);

const esTransportOpts = {
    level: 'info',
    clientOpts: { 
        node: elasticsearchUrl,
        log: 'info'
    },
    indexPrefix: 'logs',
    ensureMappingTemplate: true
};
console.log('Elasticsearch Transport Options:', esTransportOpts);

const esTransport = new Elasticsearch(esTransportOpts);

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [   
        new winston.transports.Console(),
        esTransport,
        new winston.transports.File({ filename: 'logs.log' }),
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});

export { logger };