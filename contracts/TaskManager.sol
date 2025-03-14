// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract TaskManager is Ownable {
    struct Task {
        uint256 id;
        string title;
        string description;
        bool isCompleted;
        address owner;
    }

    // Mapping from task ID to Task
    mapping(uint256 => Task) private tasks;

    // Array to keep track of all task IDs
    uint256[] private taskIds;

    // Counter for generating unique task IDs
    uint256 private taskIdCounter;

    // Events
    event TaskCreated(uint256 indexed taskId, string title, string description);
    event TaskUpdated(uint256 indexed taskId, string title, string description);
    event TaskCompleted(uint256 indexed taskId);
    event TaskDeleted(uint256 indexed taskId);

    // Modifier to check if caller is the task owner
    modifier onlyTaskOwner(uint256 _taskId) {
        require(_taskExists(_taskId), "Task does not exist");
        require(
            tasks[_taskId].owner == msg.sender,
            "Only the task owner can perform this action"
        );
        _;
    }

    constructor() Ownable(msg.sender) {}

    // Create a new task
    function createTask(
        string memory _title,
        string memory _description
    ) public returns (uint256) {
        require(bytes(_title).length > 0, "Title cannot be empty");

        uint256 taskId = taskIdCounter;

        tasks[taskId] = Task({
            id: taskId,
            title: _title,
            description: _description,
            isCompleted: false,
            owner: msg.sender
        });

        taskIds.push(taskId);
        taskIdCounter++;

        emit TaskCreated(taskId, _title, _description);
        return taskId;
    }

    // Update task
    function updateTask(
        uint256 _taskId,
        string memory _title,
        string memory _description
    ) public onlyTaskOwner(_taskId) {
        require(bytes(_title).length > 0, "Title cannot be empty");

        Task storage task = tasks[_taskId];
        task.title = _title;
        task.description = _description;

        emit TaskUpdated(_taskId, _title, _description);
    }

    // Mark a task as completed
    function completeTask(uint256 _taskId) public onlyTaskOwner(_taskId) {
        Task storage task = tasks[_taskId];
        require(!task.isCompleted, "Task is already completed");

        task.isCompleted = true;

        emit TaskCompleted(_taskId);
    }

    // Delete a task
    function deleteTask(uint256 _taskId) public onlyTaskOwner(_taskId) {
        // Remove from taskIds array
        for (uint256 i = 0; i < taskIds.length; i++) {
            if (taskIds[i] == _taskId) {
                taskIds[i] = taskIds[taskIds.length - 1];
                taskIds.pop();
                break;
            }
        }

        emit TaskDeleted(_taskId);
        delete tasks[_taskId];
    }

    // Get all tasks
    function getAllTasks() public view returns (Task[] memory) {
        Task[] memory allTasks = new Task[](taskIds.length);

        for (uint256 i = 0; i < taskIds.length; i++) {
            allTasks[i] = tasks[taskIds[i]];
        }

        return allTasks;
    }

    // Internal function to check if a task exists
    function _taskExists(uint256 _taskId) internal view returns (bool) {
        return tasks[_taskId].owner != address(0);
    }
}
