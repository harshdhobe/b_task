// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {TaskManager} from "../contracts/TaskManager.sol";


contract Deploy is Script {
    function run() external { 
        vm.startBroadcast(); 
        
        TaskManager taskManager = new TaskManager(); 

        vm.stopBroadcast();
    }
}