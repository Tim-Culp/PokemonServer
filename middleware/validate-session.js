let jwt = require('jsonwebtoken');
let sequelize = require('../db');
let Sequelize = require('sequelize');
// let User = sequelize.import('../models/userModel');
let User = require('../models/userModel')(sequelize, Sequelize.DataTypes);

module.exports = (req, res, next) => {
    //if preflight options check, just let it through without headers
    if (req.method == "OPTIONS") {
        next();
    } else {
        //get session token from request header
        let sessionToken = req.headers.authorization;
        console.log(sessionToken);
        if (!sessionToken) {
            //403 error if there is no session token
            return res.status(403).send({auth: false, message: "No token provided."});
        } else {
            //check session token against this app's jwt secret
            jwt.verify(sessionToken, process.env.JWT_SECRET, (err, decoded) => {
                if(decoded) {
                    //search for user with the id returned from the token
                    User.findOne({where: {id: decoded.id}}).then(user => {
                        if (user) {
                            console.log("USER VERIFIED. USER----------", user)
                            req.user = user;
                            next();
                        } else {
                            res.status(404).send({error: "user not found"})
                        }
                    },
                    () => {
                        //no user found with that id
                        res.status(401).send({error: "Not authorized."});
                    })
                } else {
                    //session token did not clear the secret check
                    res.status(401).send({error: "not authorized.", code:"badToken"});
                }
            })
        }   
    } 
}