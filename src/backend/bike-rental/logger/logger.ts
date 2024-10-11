import winston from 'winston';
import Elasticsearch from 'winston-elasticsearch';

const esConfig = {
    level: 'info',
    clientOpts: {
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
    },
    indexPrefix: 'bike-rental-log',
    ensureMappingTemplate: true
};


const esTransport = new Elasticsearch.ElasticsearchTransport(esConfig);

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [   
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        esTransport,
        new winston.transports.File({ filename: 'logs.log' }),
        new winston.transports.File({ filename: 'error.log', level: 'error' })
    ]
});

export { logger };