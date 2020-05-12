module.exports = (sequelize, DataTypes) => {
    return sequelize.define('pokemon', {
        name: DataTypes.STRING,
        pokemon: DataTypes.STRING,
        type: DataTypes.STRING,
        activity: DataTypes.STRING,
        owner: DataTypes.INTEGER,
        image: DataTypes.STRING,
        level: DataTypes.INTEGER,
        gender: DataTypes.STRING
    })
}