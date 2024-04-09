const { DataTypes } = require('sequelize');
const {sequelize} = require('../dbConfig/toDoListConfg');

const todoListModel = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dueDate: {
    type: DataTypes.DATE
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW 
  }
},
  {
    tableName: 'Task' 
});

sequelize.sync();


module.exports = {todoListModel};
