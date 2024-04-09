const { Sequelize } = require('sequelize');
require('dotenv').config();

// Define configuration
const config = {
  db: {
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    name: process.env.NAME,
    port: process.env.PORT
  },
};

// Initialize Sequelize 
const sequelize = new Sequelize({
  dialect: 'postgresql',
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.name
});

// Check the connection
sequelize.authenticate()
  .then(() => {
    console.log('Connected successfully to the database');
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  });

module.exports = { sequelize, Sequelize };
