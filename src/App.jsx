import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'

import TaskManagerABI from './artifacts/contracts/TaskManager.sol/TaskManager.json'

//contract address
const CONTRACT_ADDRESS = "0x007E4666058711d09be9E3c89c9eA6B30Ef4320C";
const EXPECTED_CHAIN_ID = "0x13882";

function App() {
  const [state, setState] = useState({
    account: '',
    contract: null,
    tasks: [],
    loading: false,
    error: '',
    newTaskTitle: '',
    newTaskDescription: '',
    isConnected: false
  });

  
  useEffect(() => {
    if (state.contract) loadTasks(state.contract);
  }, [state.contract]);

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));

      if (!window.ethereum) {
        setState(prev => ({ ...prev, error: 'Please install MetaMask', loading: false }));
        return;
      }

      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== EXPECTED_CHAIN_ID) {
        setState(prev => ({
          ...prev,
          error: 'Please connect to Polygon Amoy testnet (Chain ID: 80002)',
          loading: false
        }));
        return;
      }

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const taskContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        TaskManagerABI.abi,
        provider.getSigner()
      );

      setState(prev => ({
        ...prev,
        account: accounts[0],
        contract: taskContract,
        isConnected: true,
        loading: false
      }));

    
      window.ethereum.on('accountsChanged', (accounts) => {
        setState(prev => ({ ...prev, account: accounts[0] }));
        loadTasks(taskContract);
      });

      window.ethereum.on('chainChanged', () => window.location.reload());
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to connect wallet: ' + err.message,
        loading: false
      }));
    }
  };


  const loadTasks = async (taskContract) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      const contractToUse = taskContract || state.contract;

      if (!contractToUse) {
        setState(prev => ({ ...prev, error: 'Contract not initialized', loading: false }));
        return;
      }

      const allTasks = await contractToUse.getAllTasks();
      const formattedTasks = allTasks.map(task => ({
        id: task.id.toNumber(),
        title: task.title,
        description: task.description,
        isCompleted: task.isCompleted,
        owner: task.owner
      }));

      setState(prev => ({ ...prev, tasks: formattedTasks, loading: false }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load tasks: ' + err.message,
        loading: false
      }));
    }
  };

  // Create a new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!state.newTaskTitle.trim()) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: '' }));
      const tx = await state.contract.createTask(state.newTaskTitle, state.newTaskDescription);
      await tx.wait();

      setState(prev => ({ ...prev, newTaskTitle: '', newTaskDescription: '' }));
      await loadTasks(state.contract);
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to add task: ' + err.message,
        loading: false
      }));
    }
  };

  // Mark a task as completed
  const completeTask = async (taskId) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await (await state.contract.completeTask(taskId)).wait();
      await loadTasks(state.contract);
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to complete task: ' + err.message,
        loading: false
      }));
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await (await state.contract.deleteTask(taskId)).wait();
      await loadTasks(state.contract);
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: 'Failed to delete task: ' + err.message,
        loading: false
      }));
    }
  };

  return (
    <div className="app-container">
      <header className="navbar">
        <h1>Blockchain Task Manager</h1>
        <div className="nav-right">
          {!state.isConnected ? (
            <button className="connect-btn" onClick={connectWallet} disabled={state.loading}>
              {state.loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <span className="account">
              {state.account.slice(0, 6)}...{state.account.slice(-4)}
            </span>
          )}
        </div>
      </header>

      <div className="todo-app">
        {state.error && <div className="error">{state.error}</div>}

        {state.isConnected && (
          <>
            <div className="add-task">
              <input
                type="text"
                value={state.newTaskTitle}
                onChange={(e) => setState(prev => ({ ...prev, newTaskTitle: e.target.value }))}
                placeholder="Enter Your Tasks"
              />
              <button onClick={addTask} disabled={state.loading || !state.newTaskTitle.trim()}>
                ADD
              </button>
            </div>

            {state.loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <ul className="task-list">
                {state.tasks.map(task => (
                  <li key={task.id} className={task.isCompleted ? 'completed' : ''}>
                    <div className="task-content">
                      <input
                        type="checkbox"
                        checked={task.isCompleted}
                        onChange={() => !task.isCompleted && completeTask(task.id)}
                        disabled={task.isCompleted || state.loading}
                      />
                      <span>{task.title}</span>
                    </div>
                    <div className="task-actions">
                      <button
                        className="delete-btn"
                        onClick={() => deleteTask(task.id)}
                        disabled={state.loading}
                      >
                        ✖
                      </button>
                    </div>
                  </li>
                ))}
                {state.tasks.length === 0 && (
                  <p className="empty-list">No tasks found. Add a task to get started!</p>
                )}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App
