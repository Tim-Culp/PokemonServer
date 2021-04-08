const express = require('express');
const router = express.Router();
const sequelize = require('../db');
//this is where our controller accesses our model. We need this to be able to handle all the requests to our server. Pretty sure sequelize uses the model to manipulate the columns in our postgres database.
const pokemonModel = sequelize.import('../models/pokemonModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

router.post('/create', (req, res) => {
    let pokemon = req.body.pokemon;
    console.log("user----------------------", req.user);
    pokemonModel.findOne({where:{owner:req.user.id, name:pokemon.name}})
        .then(response => {
            if (!response) {
                pokemonModel.create({
                    name: pokemon.name,
                    pokemon: pokemon.pokemon,
                    type: pokemon.type,
                    owner: req.user.id,
                    image: pokemon.image,
                    activity: "resting",
                    level: 0,
                    gender: pokemon.gender
                })
                    .then(data => {
                        res.json({response: data});
                    })
            } else {
                res.json({error: "You already have a pokemon by that name"})
            }
        })
})

router.get('/', (req, res) => {
    pokemonModel.findAll({where:{owner:req.user.id}})
        .then(response => res.json({pokemon:response}))
})

router.put('/rename/:id', (req, res) => {
    pokemonModel.findOne({where: {owner: req.user.id, id: req.params.id}})
        .then(response => {
            if(response) {
                pokemonModel.update({
                    name: req.body.pokemon.name
                }, {where: {id: req.params.id}})
                    .then(returned => res.status(200).json({numChanged: returned}), err => res.status(500).json({err: err}));
            } else {
                res.status(404).json({error: "Pokemon not found"});
            }
        })
        .catch(err => res.json({error: err}))
})

router.put('/train/:id', (req, res) => {
    pokemonModel.update({
        activity: "resting"
    }, {where: {owner: req.user.id, activity: "training"}})
        .then(() => {
            pokemonModel.findOne({where: {owner: req.user.id, id: req.params.id}})
                .then(response => {
                    if (response) {
                        pokemonModel.update({
                            level: (response.level + 1),
                            activity: "training"
                        }, {where: {owner: req.user.id, id: req.params.id}})
                            .then(returned => res.status(200).send({message: `${returned} pokemon in training.`, pokemon: {
                                id: response.id,
                                name: response.name,
                                pokemon: response.pokemon,
                                type: response.type,
                                owner: req.user.id,
                                image: response.image,
                                activity: "training",
                                level: (response.level + 1),
                                gender: response.gender
                            }}))
                    } else {
                        res.status(404).json({error: "Pokemon not found"});
                    }
                })
        },
        () => res.send({message: "whoops"}))
        .catch(err => res.send({error: err}));
})

router.delete('/delete/:id', (req, res) =>{
    pokemonModel.findOne({where: {owner: req.user.id, id: req.params.id}})
        .then(response => {
            pokemonModel.destroy({where: {id: response.id}})
                .then(returned => {
                    res.status(200).send({destroyed: returned, message: `${returned} pokemon destroyed.`, pokemon: response})
                })
        })
})

router.get('/fight', (req, res) => {
    pokemonModel.findAll({
        where: {activity: "readyToFight", owner: {ne: req.user.id}}
    })
        .then(response => res.json({pokemon: response}))
})

router.put('/hostfight', (req, res) => {
    pokemonModel.update({activity: "resting"}, {where: {owner: req.user.id, activity: "readyToFight"}}
    )
        .then(() => {
            pokemonModel.findOne({where:{id: req.body.pokemon.id}})
        
            .then(pokemonData => {
                pokemonModel.update({activity: "readyToFight"}, {where:{owner: req.user.id, id: req.body.pokemon.id}}
                )
                .then(response => {res.json({ numberUpdated: response, pokemon: pokemonData})})
            })
        })
})

router.put('/restall', (req, res) => {
    pokemonModel.update({activity: "resting"}, {where:{owner: req.user.id}})
        .then(response => res.json({response: response}))
})

router.get('/:id', (req, res) => {
    pokemonModel.findOne({
        where: {
            id: req.params.id,
        }
    })
        .then(response => res.json({pokemon: response}))
})

router.put('/joinfight/:id', (req, res) => {
    pokemonModel.update({activity: "resting"}, {where: {owner: req.user.id, activity: "readyToFight"}}
    )
        .then(() => {
            pokemonModel.update({activity: `fought:${req.body.pokemon.id}`}, {where: {id: req.params.id, activity: "readyToFight"}})
                .then(response => {
                    if (response > 0) {
                        pokemonModel.findOne({where: {id: req.body.pokemon.id}})
                        .then(pokemonOne => {
                            pokemonModel.findOne({where: {id: req.params.id}})
                                .then(pokemonTwo => {
                                    let winner = Math.random();
                                    let oldL1 = pokemonOne.level;
                                    let oldL2 = pokemonTwo.level;
                                    if (winner > pokemonTwo.level / (pokemonTwo.level + pokemonOne.level)) {
                                        pokemonOne.level += (pokemonTwo.level/4);
                                        pokemonTwo.level = (0.75 * pokemonTwo.level);
                                    } else {
                                        pokemonTwo.level += (pokemonOne.level/4);
                                        pokemonOne.level = (0.75 * pokemonOne.level);
                                    }
                                    pokemonTwo.level = Math.round(pokemonTwo.level);
                                    pokemonOne.level = Math.round(pokemonOne.level);
                                    pokemonModel.update({level: pokemonOne.level}, {where: {id: pokemonOne.id}})
                                        .then(() => {
                                            pokemonModel.update({level: pokemonTwo.level}, {where: {id: pokemonTwo.id}})
                                            .then(
                                                res.json({
                                                    pokemon1: {
                                                        oldLevel: oldL1,
                                                        pokemon: pokemonOne
                                                    },
                                                    pokemon2: {
                                                        oldLevel: oldL2,
                                                        pokemon: pokemonTwo
                                                    }
                                                })
                                            )
                                        })
                                })
                        })
                    } else {
                        res.send({message: "Pokemon is not ready to fight.", code:"notReady"})
                    }
                    
                })
        })
})

module.exports = router;