module.exports = (req, res, next) =>    {
    console.log("REQUEST CAME THROUGH")
    res.header('access-control-allow-origin', '*');
    res.header('access-control-allow-methods', 'GET, POST, PUT, DELETE');
    res.header('access-control-allow-headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    console.log(`REQUEST METHOD: ${req.method}`)
    next();
    console.log("NEXTED FROM HEADERS");
}