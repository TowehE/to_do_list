const { DataTypes } = require('sequelize');
const { sequelize } = require('../dbConfig/toDoListConfg'); 
const {todoListModel } = require("../model/toDoListModel")

const userModel = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    newCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, 
{
    tableName: 'User' 
});

// refernece association with Task model
userModel.hasMany(todoListModel, { as: 'todoLists', foreignKey: 'userId' });

// sequelize.sync({ force: true });
module.exports = { userModel };
