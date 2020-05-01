# Map Notification Application

The map provide people to notify event to others people

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

What things you need to install the software and how to install them

- Install Ganache from this link: 
https://truffleframework.com/ganache
- Install Nodejs and init a folder:
https://nodejs.org/en/download/

- Build tool:  
```
#PowerShell Admin
npm install --global windows-build-tools 
```
- node-gyp: 
```
#PowerShell Admin
npm install -g node-gyp
```
- Install truffle:

```
#inside your work directory
 npm install -g truffle@5.1.4 
```
- Install React: 
```
#inside your work directory
npm install -g react
```

- Add metaMask to your chrome browser and create account: 
https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn


### Installing

- React-leaflet
```
npm install react-leaflet
```
- Reactjs-popup

```
npm install reactjs-popup --save
```


## Run the application

### Before running the application, you need to create new custom network in MetaMask which using port 7545
In your work directory
```
npm run start
```

If the website did not show, you deployed the contract again
```
truffle migrate --network ganache --reset --compile-all
```




