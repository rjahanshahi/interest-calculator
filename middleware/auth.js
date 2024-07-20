const jwt = require('jsonwebtoken');

const authenticationMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;   
    // check for proper header
    /*
    if (!authHeader|| !authHeader.startsWith('Bearer ')) {
        return res.status(401).send('No token provided');
    }*/
    const cookies = req.cookies;
    if (!cookies?.access_token) return res.status(401).json({'error': 'no token provided'});
    const accessToken = cookies.access_token;
    if (!accessToken) {
        return res.status(401).json({'error': 'no token provided'});
    }

    //const token = authHeader.split(' ')[1];  //header is space delimited: Bearer `token`
    try {   
        const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        const {id, username} = decoded;
        req.user = {id, username};
    } catch (err) {
        console.error(err);
        return res.status(401).json(
            {'error': 'invalid_token'}
        );
    }
    next();
}

module.exports = authenticationMiddleware