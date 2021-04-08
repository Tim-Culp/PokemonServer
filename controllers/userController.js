const express = require('express');
const router = express.Router();
const sequelize = require('../db');
// const userModel = sequelize.import('../models/userModel');
const Sequelize = require('sequelize');
const userModel = require('../models/userModel')(sequelize, Sequelize.DataTypes);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/create', (req, res) => {
    console.log("CREATE BRANCH STARTED");
    console.log(`REQUEST: ${JSON.stringify(req.body)}`)
    userModel.findOne({where:{username:req.body.user.username}})
        .then(response => {
            console.log("FINDONE COMPLETED")
            if (!response) {
                console.log("DID NOT FIND USER BY THAT NAME... CREATING USER...")
                userModel.create({
                    username: req.body.user.username,
                    //register password with bsync encryption
                    passwordhash: bcrypt.hashSync(req.body.user.password, 11)
                }).then(userData => {
                    console.log("USER CREATION SUCCESSFUL")
                    //give user session token corresponding to this app's jwt secret
                    //token is created by jwt, a node module which handles the encryption and decryption of web tokens. This token is used by validate-session to determine which user is accessing the server. Validate-session uses jwt to break down the session token into its payload using the jwt secret as the salt, which is then readable.
                    let token = jwt.sign({id: userData.id}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
                    res.json({
                        user: userData,
                        message: "created",
                        sessiontoken: token
                    });
                },
                err => {
                    console.log("USER CREATION UNSUCCESSFUL")
                    res.send(err);
                })

            } else {
                console.log("USER FOUND BY THAT NAME")
                res.json({error: "Username already taken.", code:"usernameTaken"})
            }
        
        
        
        }, err => {
            console.log("FINDONE DIDNT WORK")
            console.error(err)
        })
    
})

router.get('/', (req, res) => {
    let username = req.body.user.username;
    userModel.findAll()
        .then(response => res.json({users:response}))
        .catch(err => res.json({error:err}));
})

router.post('/login', (req, res) => {
    userModel.findOne({ where: {username: req.body.user.username}}).then(userData => {
        if (userData) {
            //compare passwords once database's password is decrypted
            bcrypt.compare(req.body.user.password, userData.passwordhash, (err, matches) => {
                if (matches) {
                    //give user a new session token corresponding to this app's jwt secret
                    let token = jwt.sign({id: userData.id}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
                    res.json({
                        user: userData,
                        message: "Logged in",
                        sessiontoken: token
                    })
                } else {
                    res.status(502).send( {error: "Password did not match", code: "wrongPassword"} )
                }
                console.log(matches)
            })
        } else {
            res.status(500).send({error: "User not found", code: "wrongUsername"});
        }
    }, err => {
        res.status(501).send({error: "User not found", code: "wrongUsername"});
    })
})


module.exports = router;