const Sequelize = require("sequelize");


const sequelize = new Sequelize(process.env.DATABASE_URL+ "?sslmode=require", {
    dialect: "postgres",
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
})

// const sequelize = new Sequelize('pokemon', process.env.PG_USER, process.env.PG_PASS, {
//     host: 'localhost',
//     dialect: 'postgres'
// })


// sequelize.authenticate().then(() => {
//     console.log("Connected to postgres database")
// }, err => {
//     console.error(err);
// })

module.exports = sequelize;