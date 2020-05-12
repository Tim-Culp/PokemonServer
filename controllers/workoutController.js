const router = require('express').Router();
const sequelize = require('../db');
const userModel = sequelize.import('../models/userModel');
const workoutModel = sequelize.import('../models/workoutModel');

//get all items for individual user
router.get('/', (req, res) => {
    let userID = req.user.id;

    workoutModel
        .findAll({
            where: {owner: userID}
        })
        .then(
            data => res.json(data),
            err => res.send(500, err.message)
        )
})

//post single item for individual user
router.post('/', (req, res) => {
    let owner = req.user.id;
    let logData = req.body.log;

    workoutModel
        .create({
            description: logData.description,
            definition: logData.definition,
            result: logData.result,
            owner: owner
        })
        .then(logData => {
            res.json({
                description: logData.description,
                definition: logData.definition,
                result: logData.result,
            });
        },
        err => res.send(500, err.message)
    );
})

//get single item for individual user
router.get('/:id', (req, res) => {
    let data = req.params.id;
    let userID = req.user.id;

    workoutModel
        .findOne({
            where: {id: data, owner: userID}
        }).then (
            data => res.json(data),
            err => res.send(500, err.message)
        )
})

router.delete('/delete/:id', (req, res) => {
    let data = req.params.id;
    let userID = req.user.id;

    workoutModel
        .destroy({
            where: { id: data, owner: userID }
        }).then(
            data => res.send('You removed a log.'),
            err => res.send(500, err.message)
        )
})

router.put('/:id', (req, res) => {
    let data = req.params.id;
    let logData = req.body.log;

    workoutModel
        .update({
            description: logData.description,
            definition: logData.definition,
            result: logData.result,
        },
        { where : {id: data}}
        ).then(
            (logReturn) => {
                if (logReturn > 0) {
                    res.json({
                        description: logData.description,
                        definition: logData.definition,
                        result: logData.result,
                    });
                } else {
                    res.status(500).json({error: "ID out of range"})
                }
                console.log("log data:", logReturn);
            },
            err => res.send(500, err.message)
        )
})

module.exports = router;