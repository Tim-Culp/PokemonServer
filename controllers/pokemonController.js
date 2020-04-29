const express = require('express');
const router = express.Router();
const sequelize = require('../db');
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
        })
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

module.exports = router;