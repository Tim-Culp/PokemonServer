const Sequelize = require("sequelize");


const sequelize = new Sequelize('pokemon', 'postgres', process.env.PG_PASS, {
    host: "localhost",
    dialect: "postgres"
})


sequelize.authenticate().then(() => {
    console.log("Connected to postgres database")
}, err => {
    console.error(err);
})

module.exports = sequelize;