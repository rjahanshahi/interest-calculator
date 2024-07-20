const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel.js');


const handleRefreshToken = async (req, res)=> {
    const cookies = req.cookies;
    if (!cookies?.refresh_token) return res.sendStatus(401);
    const refreshToken = cookies.refresh_token;

        const foundUser = await UserModel.find({refreshToken : refreshToken}).exec(); //exec() returns a real Promise
        //console.log(foundUser)
        if (foundUser.length === 0) {
            return res.sendStatus(403); //forbidden
        } 
        //evaluate jwt
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            (err, decoded) => {
                if (err || foundUser[0]['username'] !== decoded.username) return res.sendStatus(403);
                const accessToken = jwt.sign(
                    {"username": decoded.username},
                    process.env.ACCESS_TOKEN_SECRET, 
                    {expiresIn: '30s'}
                );
                res.cookie('access_token', accessToken, {
                    httpOnly: true,
                    sameSite: 'strict',
                    secure: true, 
                    maxAge: 30 * 1000
                }).status(200);
                res.json({'message':'new access token sent'});
            }
        );  
};

module.exports = {handleRefreshToken};