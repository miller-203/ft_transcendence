
function errorHandler(error, req, res, next)
{
    console.error(error);
    return res.status(500).json({
        error: "Internal Server Error"
    });

}

module.exports = {
    errorHandler
}