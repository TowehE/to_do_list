const { userModel } = require('../model/userModel');
const { Sequelize, sequelize, Op } = require('sequelize');
const { todoListModel } = require('../model/toDoListModel');
const { validateCreateTodoList } = require('../helpers/validation');




//function to capitalize the first letter
const capitalizeFirstLetter = (str) => {
    return str[0].toUpperCase() + str.slice(1);
};

//function to create a new task
exports.createtodoList = async (req, res) => {
    try {
        const {error} = validateCreateTodoList(req.body)
        if (error) {
            return res.status(500).json({
                message: error.details[0].message
            });
        }
        const userId = req.user.userId;
        console.log(userId)


        // in the request body
        const { title, description, dueDate } = req.body

        //create a new todo list
        const user = await userModel.findByPk(userId,
            { include: 'todoLists' });
        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            })
        }
        console.log(user)

        // Check if a to-do list with the same title already exists for the user
        const existingTodoList = await todoListModel.findOne({
            where: {
                userId,
                title
            }
        });
        if (existingTodoList) {
            return res.status(400).json({
                message: 'A to-do list with the same description already exists'
            });
        }

        const todoList = new todoListModel({
            title,
            description,
            dueDate,
            userId: userId
        })
        if (!todoList) {
            return res.status(404).json({
                message: "To do list is not available"
            })
        }
        await todoList.save()
        user.todoLists.push(todoList)
        await todoList.save()

        return res.status(200).json({
            message: "To do list successfully created",
            data: todoList
        })

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
}


//function to get a to do list from my list
exports.getthelist = async (req, res) => {
    try {
        // get id and find by id
        const userId = req.user.userId;
        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const todoListId = req.params.todoListId;

        //find by todoList Id
        const todoList = await todoListModel.findByPk(todoListId, {
            order: [['createdAt', 'DESC']]
        })

        if (!todoList) {
            return res.status(404).json({
                message: "Empty todoList"
            })
        }
        return res.status(200).json({
            message: "to do list found",
            data: todoList
        })

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message,
        });
    }
}



// function to schedule a new todo list item for today
exports.scheduleTodoListForToday = async (req, res) => {
    try {
        // Get the user ID
        const userId = req.user.userId;
        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Get the input data from the request body
        const { title, description } = req.body;

        // Create a new todo list item with today's date as the dueDate
        const currentDate = new Date();
        const todoList = await todoListModel.create({
            title: title,
            description: description,
            dueDate: currentDate,
            userId: userId
        });

        return res.status(201).json({
            message: "Todo list item scheduled for today",
            data: todoList
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
};


//function to get all today list for the day
exports.getTodaysTodoList = async (req, res) => {
    try {
        // Get the user ID
        const userId = req.user.userId;
        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Get the current date
        const currentDate = new Date();
        const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);

        // Find to-do lists for today
        const todoLists = await todoListModel.findAll({
            where: {
                userId: userId,
                dueDate: {
                    [Op.between]: [startOfDay, endOfDay]
                }
            }
        });
        if (todoLists.length === 0) {
            return res.status(404).json({
                message: "No todo items scheduled for today"
            });
        }

        return res.status(200).json({
            message: "Today's to-do list found",
            data: todoLists
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
};


//function to get all the list pf my to do 
exports.getAllTask = async (req, res) => {
    try {
        //get the user and find by id
        const userId = req.user.userId;
        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // Get all todo lists for the user and sort by newest
        const todolists = await todoListModel.findAll({
            where: { userId: userId },
            order: [['createdAt', 'DESC']]
        });

        if (!todolists || todolists.length === 0) {
            return res.status(404).json({
                message: "No todo lists found"
            });
        }

        return res.status(200).json({
            message: "All your todo tasks",
            data: todolists
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
};


// finction to complete status of the todo list 
exports.completeTodo = async (req, res) => {
    try {

        //get the user and find by id
        const userId = req.user.userId;

        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // Get the todo list id
        const todoListId = req.params.todoListId;

        // Find the todo list by ID
        const todoList = await todoListModel.findByPk(todoListId);
        if (!todoList) {
            return res.status(404).json({
                message: "Todo list  not found"
            });
        }

        // Update the completed status to true
        todoList.completed = true;

        // Save the updated todo list 
        await todoList.save();

        return res.status(200).json({
            message: "Todo list completed",
            data: todoList
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
};


// finction to uncomplete status of the todo list 
exports.unCompleteTodo = async (req, res) => {
    try {

        //get the user and find by id
        const userId = req.user.userId;

        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }


        // Get the todo list id
        const todoListId = req.params.todoListId;

        // Find the todo list by ID
        const todoList = await todoListModel.findByPk(todoListId);
        if (!todoList) {
            return res.status(404).json({
                message: "Todo list  not found"
            });
        }

        // Update the completed status to true
        todoList.completed = false;

        // Save the updated todo list 
        await todoList.save();

        return res.status(200).json({
            message: "Todo list is marked incompleted",
            data: todoList
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
};



//update the to do list
exports.updateTodoList = async (req, res) => {
    try {

        //find and get user id
        const userId = req.user.userId
        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        //find the todo list by id
        const todoListId = req.params.todoListId
        const todoList = await todoListModel.findByPk(todoListId);
        if (!todoList) {
            return res.status(404).json({
                message: "todoList not found"
            })
        }

        const todoListData = {
            title: req.body.title || todoList.title,
            description: req.body.description || todoList.description,
            dueDate: req.body.dueDate || todoList.dueDate
        }

        // Update the to do list item
        await todoList.update(todoListData);

        return res.status(200).json({
            message: "Todo list updated successfully",
            data: todoListData,
        })

    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
};


// Get all completed tasks
exports.getCompletedTasks = async (req, res) => {
    try {
        //find and get user id
        const userId = req.user.userId
        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // get all completed tasks 
        const completedtodolists = await todoListModel.findAll({
            where: {
                completed: true
            }
        });

        if (completedtodolists.length === 0) {
            return res.status(404).json({
                message: "No completed tasks found"
            });
        }

        return res.status(200).json({
            message: `You have successfully completed ${completedtodolists.length} of your to do list`,
            data: completedtodolists
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
};



// Get all uncompleted tasks
exports.getUnCompletedTasks = async (req, res) => {
    try {
        //find and get user id
        const userId = req.user.userId
        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // get all completed todolist 
        const uncompletedTasks = await todoListModel.findAll({
            where: {
                completed: false
            }
        });

        if (uncompletedTasks.length === 0) {
            return res.status(404).json({
                message: "There is uncompleted tasks found"
            });
        }

        return res.status(200).json({
            message: `There are ${uncompletedTasks.length} uncompleted list(s)`,
            data: uncompletedTasks
        })



    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
};



//delete a todo list task
exports.deleteTask = async (req, res) => {
    try {
        // Find and get user id
        const userId = req.user.userId;
        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const todoListId = req.params.todoListId;
        const taskToDelete = await todoListModel.findByPk(todoListId);
        if (!taskToDelete) {
            return res.status(404).json({
                message: "T0 do not found"
            });
        }

        // Delete the task
        await taskToDelete.destroy();

        res.status(200).json({
            message: "Todo list deleted successfully"
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
};

// Delete multiple tasks
exports.deleteMultipleLists = async (req, res) => {
    try {
        // Find and get user id
        const userId = req.user.userId;
        const user = await userModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const taskIds = req.body.taskIds;

        // Check if taskIds is provided in the request body
        if (!taskIds || taskIds.length === 0) {
            return res.status(400).json({
                message: 'Please provide taskIds to delete'
            });
        }

        // Delete tasks from the database
        const deleteResult = await todoListModel.destroy({
            where: {
                id: taskIds
            }
        });

        // Check if any tasks were deleted
        if (deleteResult === 0) {
            return res.status(404).json({
                message: 'No tasks found with the provided taskIds'
            });
        }


        return res.status(200).json({
            message: `Deleted ${deleteResult} list(s) successfully`
        });
    } catch (err) {
        return res.status(500).json({
            message: "Internal server error: " + err.message
        });
    }
};

