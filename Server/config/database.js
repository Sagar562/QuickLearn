const mongoose = require('mongoose');
require('dotenv').config();


exports.connect = () => {
    mongoose.connect(process.env.DATABASEURL)
    .then( () => {
        console.log("Database connected")
    })
    .catch( (error) => {
        console.log("Database not connected")
        console.error(error)
        process.exit(1)
    })
}