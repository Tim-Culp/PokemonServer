const express = require('express');
const router = express.Router();
const sequelize = require('../db');
const userModel = sequelize.import('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/create', (req, res) => {
    userModel.findOne({where:{username:req.body.user.username}})
        .then(response => {
            if (!response) {
                userModel.create({
                    username: req.body.user.username,
                    //register password with bsync encryption
                    passwordhash: bcrypt.hashSync(req.body.user.password, 11)
                }).then(userData => {
                    //give user session token corresponding to this app's jwt secret
                    let token = jwt.sign({id: userData.id}, process.env.JWT_SECRET, {expiresIn: 60*60*24})
                    res.json({
                        user: userData,
                        message: "created",
                        sessiontoken: token
                    });
                },
                err => {
                    res.send(err);
                })

            } else {
                res.json({error: "Username already taken.", code:"usernameTaken"})
            }
    
    
    
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