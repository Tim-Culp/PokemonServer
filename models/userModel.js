const DataTypes = require('sequelize').DataTypes;
const sequelize = require('../db');

const User = sequelize.define('user', {
        username: DataTypes.STRING,
        passwordhash: DataTypes.STRING,
        training: DataTypes.BOOLEAN
    })

module.exports = User;