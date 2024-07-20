const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const UserModel = require('../models/userModel.js');


const login = async (req, res)=> {
    try {
        const {user, pass} = req.body; //coming from form data
        if (!user||!pass) { 
            return res.status(400).send("Both username and password are required!"); 
        };  

        const foundUser = await UserModel.find({username: user}).exec(); //exec() returns a real Promise
        //console.log(foundUser)
        
        if (foundUser.length === 0) {
            return res.status(401).send(`Could not login. User with name: ${user} not found!`);
        } 
        
        const match = await bcrypt.compare(pass, foundUser[0]['password'])
        if (match) {
            const id = foundUser[0]['_id'];
            const username = foundUser[0]['username'];
            //create JWTs here to use with other protected routes in API 
            const accessToken = jwt.sign(
                { id, username },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '30s'}
            );
            const refreshToken = jwt.sign(
                { id, username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: '1d'}
            );    
            await UserModel.findOneAndUpdate({username : user}, {refreshToken : refreshToken});
            //create secure cookie with refresh token
            res.cookie('access_token', accessToken, {
                httpOnly: true,
                sameSite: 'strict',
                secure: true, 
                maxAge: 30 * 1000
            });
            res.cookie('refresh_token', refreshToken, { 
                httpOnly: true, //accessible only by web server 
                sameSite: 'None', //http or https
                secure: true, //cross-site cookie, (DISABLED FOR THUNDERCLIENT)
                maxAge: 24 * 60 * 60 * 1000 //cookie expiry; matches rT
            });
            //send access token with username to frontend
            res.status(200).json({'message':`${username} logged in`});
        } else {
            res.status(401).send('Wrong password!');
        };
    } catch (error) {
        res.status(500).json({'message': error.message}); 
    };
};


const signup = async (req, res) => {
    try {
        console.log(req.body)
        const {user, pass} = req.body;
        
        if (!user||!pass) { 
            return res.status(400).send("Both username and password are required!"); 
        };  

        const foundUser = await UserModel.find({username: user}).exec();   
        console.log(foundUser);
        
        if (!(foundUser.length === 0)) {
            return res.status(409).send(`Sign up failed. A user with name "${user}" already exists!`);
        };

        const hashedPass = await bcrypt.hash(pass, 10);
        const newUser = new UserModel({username: user, password: hashedPass});
        newUser.save().then(doc => {console.log(doc)}).catch(err => {console.error(err)});
        res.status(201).json({'message': `Sign up successful, ${user}`});
    } catch (error) {
        res.status(500).json({'message': error.message}); 
    };
};

const deleteUser = async (req, res) => {
    UserModel.deleteOne({ username:req.user.username}).exec();
    res.status(200).json({message: `${req.user.username} has been deleted`});
}

const getNumber = (req, res) => {
    const luckyNumber = Math.floor(Math.random()*100)
    res.status(200).json({message:`Hello ${req.user.username}, your lucky number is ${luckyNumber}`});
}

const saveData = (req, res) => {
    const {data} = req.body;
    UserModel.findOneAndUpdate({username:req.user.username}, {data : data}).exec()
    res.status(200).json({message: `${req.user.username}, your data ($${data}),has been saved`});   
}

const getData = async (req, res) => {
    const user = await UserModel.findOne({username:req.user.username}).exec();
    console.log(user);
    res.status(200).json({data: user.data, user: user.username});
};

const logout = async (req, res) => {
    //On client, also delete access token 
    const cookies = req.cookies;
    if (!cookies?.access_token && !cookies?.refresh_token) return res.sendStatus(204); //no content
    const refreshToken = cookies.refresh_token;
    const accessToken = cookies.refresh_token;

    // is refresh token in db?
    const foundUser = await UserModel.find({refreshToken:refreshToken}).exec();
    if (!foundUser) {
        //no user but cookies still in req, so clear cookies
        res.clearCookie('access_token', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
            secure: true, 
            maxAge: 30 * 1000
        });
        res.clearCookie('refresh_token', refreshToken, { 
            httpOnly: true, //accessible only by web server 
            sameSite: 'None', //http or https
            secure: true, //cross-site cookie, (DISABLED FOR THUNDERCLIENT)
            maxAge: 24 * 60 * 60 * 1000 //cookie expiry; matches rT
        });
        return res.sendStatus(403); 
    }

    // delete refresh token in database
    await UserModel.findOneAndUpdate({refreshToken:refreshToken}, {refreshToken:null});
    res.clearCookie('access_token', accessToken, {
        httpOnly: true,
        sameSite: 'strict',
        secure: true, 
        maxAge: 30 * 1000
    });
    res.clearCookie('refresh_token', refreshToken, { 
        httpOnly: true, //accessible only by web server 
        sameSite: 'None', //http or https
        secure: true, //cross-site cookie, (DISABLED FOR THUNDERCLIENT)
        maxAge: 24 * 60 * 60 * 1000 //cookie expiry; matches rT
    });
    res.sendStatus(204);
}


module.exports = {
    login, 
    signup,
    getNumber, 
    deleteUser,
    saveData,
    getData,
    logout
}