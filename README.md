
# Blockchain-Based Task Manager

---

## Prerequisites
1. **Foundry**
2. **Node.js**
3. **MetaMask**
4. **Testnet Polygon Amoy**
5. **Polygonscan API Key**

---

## Setup

### 1. Clone the Repository
```shell
git clone https://github.com/your-username/task-manager.git
cd task-manager
```
2. Install Dependencies
```shell
npm install
```
3. Configure Environment Variables

Create a .env file in the root directory:

```shell
PRIVATE_KEY=your_wallet_private_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

Deployment
1. Local Deployment (Anvil)
Start a local blockchain:

```shell
anvil
```
```shell
forge script script/Deploy.s.sol:Deploy --broadcast --rpc-url http://localhost:8545
```
2. Polygon Amoy Deployment
```shell
forge script script/Deploy.s.sol:Deploy \
--rpc-url amoy \
--private-key $PRIVATE_KEY \
--broadcast \
```
Deployed Contract Address:0x007E4666058711d09be9E3c89c9eA6B30Ef4320C

