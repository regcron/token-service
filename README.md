# Token service
Basic ERC20 token backend service allowing to query an ERC20 token information on Ethereum Sepolia testnet

## Features
- Query token info by via GET /token

## Deployment instructions
1. Install dependencies with ```npm install```
2. Run ```npm run build```
3. Run ```npm run start```
4. Start sending queries to http://localhost:5005

# Project structure
Every development files are located within the ```./src``` folder. 

```
├── app.ts
├── controllers
│   └── token-controller.ts
├── middleware
│   ├── async-middleware.ts
│   └── error-middleware.ts
├── routes
│   └── token-route.ts
├── types
│   ├── interfaces
│   │   └── interfaces.common.ts
│   └── types
│   │   └──  types.common.ts
│   └── index.d.ts
└── utils
    ├── ApiError.ts
    └── ApiSucess.ts
```