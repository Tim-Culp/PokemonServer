module.exports = (sequelize, DataTypes) => {
    return sequelize.define('log', {
        description: DataTypes.STRING,
        definition: DataTypes.STRING,
        result: DataTypes.STRING,
        owner: DataTypes.INTEGER
    })
}