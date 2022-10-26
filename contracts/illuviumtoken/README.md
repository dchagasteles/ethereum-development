# illuvium token

This is a illuvium solidiy task project

## commands to run

- npm i
- npx hardhat compile
- npx hardhat test

## Also helpful scripts and files are added for supporting smart contract development

- test/lib.ts
  this is a library to setup all testing environments and useful functionals.

- helpers/contract.ts
  this is that place that manages contract deploy for unit test.

- helpers/types.ts
  this is a file to define all contract types.

## verify contract

npx hardhat verify --network rinkeby --constructor-args argument.js 0xCEc1A02D8a316c56aF3513998667a665CFb1777E

## test transaction

https://rinkeby.etherscan.io/tx/0x4bee3fa512def3c05719f912272afb9e906f79b557a469d1dbbba9057aef21cc
