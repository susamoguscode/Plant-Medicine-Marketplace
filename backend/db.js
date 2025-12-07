const { Sequelize } = require("sequelize")

const sequelize = new Sequelize({
    dialect: "postgres",
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
})

sequelize.authenticate()
    .then(() => console.log("Database connected successfully"))
    .catch(err => console.log("Unable to connect to the database:", err))

module.exports = sequelize