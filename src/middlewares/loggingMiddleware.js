const loggingMiddleware = (request, response, next) => {
    console.log(`${request.method} - ${request.url}`)
    next()
};

export default loggingMiddleware