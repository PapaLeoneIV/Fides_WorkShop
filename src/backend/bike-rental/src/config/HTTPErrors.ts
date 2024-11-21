
export const HTTPErrors = {
    BAD_REQUEST: {
        scode: 400,
        message: 'The request could not be understood by the server. Please check your request and try again.',
    },
    UNAUTHORIZE: {
        scode: 401,
        message: 'You need to log in to access this resource. Please authenticate yourself and try again.',
    },
    FORBIDDEN: {
        scode: 403,
        message: 'You do not have permission to access this resource. Please check your access rights.',
    },
    NOT_FOUND: {
        scode: 404,
        message: 'The requested resource could not be found. Please check your request and try again.',
    },
    INTERNAL_SERVER_ERROR: { 
        scode: 500,
        message: 'An unexpected error occurred on the server. Please try again later.',
    },
    BAD_GATEWAY: {
        scode: 502,
        message: 'The server received an invalid response from an upstream server. Please try again later.',
    },
    SERVICE_UNAVAILABLE: {
        scode: 503,
        message: 'The server is currently unavailable. Please try again later.',
    },
    GATEWAY_TIMEOUT: {
        scode: 504,
        message: 'The server took too long to respond. Please try again later.',
    },
};