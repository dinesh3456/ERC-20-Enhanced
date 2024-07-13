# ERC-20-Enhanced

This project is a comprehensive example of a blockchain application using Ethereum smart contracts for creating an ERC20 token. It consists of two main parts: the backend, which includes the smart contract development and deployment, and the frontend, a React application that interacts with the smart contract.

## Getting Started

To get started with this project, clone the repository to your local machine.

### Prerequisites

- Node.js and npm installed
- MetaMask browser extension for interacting with the Ethereum network

### Backend Setup

1. Navigate to the `backend` directory.
2. Install dependencies with `npm install`.
3. Compile the smart contracts with `truffle compile` (if using Truffle).
4. Deploy the smart contracts to your chosen network with `truffle migrate` (if using Truffle).

### Frontend Setup

1. Navigate to the `frontend` directory.
2. Install dependencies with `npm install`.
3. Start the development server with `npm start`. This will launch the React app in your default browser.

## Usage

The frontend application allows users to interact with the ERC20 token smart contract. Users can transfer tokens, view their current token balance, and monitor token transfer events.

## Deployment

To deploy the frontend application to a production environment, run `npm run build` in the `frontend` directory. This will create a `build` folder containing the production-ready files.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
- Smart contract development was facilitated by the use of [Truffle Suite](https://www.trufflesuite.com/).

## Learn More

For more information on React, check out the [React documentation](https://reactjs.org/).

To learn more about Ethereum and smart contracts, visit the [Ethereum website](https://ethereum.org/).
