const express = require('express');

const router = express.Router();

const { createtodoList, 
   getthelist,
   getTodaysTodoList,
   scheduleTodoListForToday,
   getAllTask,
   completeTodo,
   unCompleteTodo,
   updateTodoList,
   getCompletedTasks,
   getUnCompletedTasks,
   deleteTask,
   deleteMultipleLists
} = require('../controller/toDoListController');

const { authenticate } = require('../middlewear/authentication');


//endpoint to register a new user
router.post('/createlist/', authenticate, createtodoList);

//endpoint to get one to do list
router.get('/getlist/:todoListId',authenticate, getthelist);


//endpoint to get today list
router.get('/getTodayList/',authenticate, getTodaysTodoList);


//endpoint to get today list
router.get('/scheduletoday/',authenticate, scheduleTodoListForToday);

//endpoint to get all to do list
router.get('/alltask/',authenticate, getAllTask);

// endpoint to mark the  status of a todo list completed
router.put('/completed/:todoListId/',authenticate, completeTodo);


// endpoint to mark the  status of a todo list uncompleted 
router.put('/uncompleted/:todoListId/',authenticate, unCompleteTodo);

// endpoint to get all the completed status of a todo list 
router.get('/completedtasks/',authenticate, getCompletedTasks);


// endpoint to get all uncompleted status of a todo list 
router.get('/uncompletedtasks/',authenticate, getUnCompletedTasks);


// Update todo list 
router.put('/updatemytodolist/:todoListId',authenticate, updateTodoList);

// delete the task
router.delete('/deleteTodo/:todoListId',authenticate, deleteTask);

// delete the task
router.delete('/deletelists/',authenticate, deleteMultipleLists);

module.exports = router;



