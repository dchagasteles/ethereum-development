## Overview
In defi world, its very important to define token price.


#### Chainlink PriceFeed
[Chainlink](https://data.chain.link/) provodes very useful priceFeed contracts.
You can reference Chainlink's priceFeed contracts [here](https://docs.chain.link/docs/reference-contracts/)

#### Other oracle contracts
Chainlink is great. But there're still many token contracts that Chainlink does not support.
In this case, we need to create own oracle contracts that provide token price.

Here are useful links about price oracle contract development.
- [aave price-aggregators](https://github.com/aave/price-aggregators)
These are the contracts that AAVE protocol uses to read prices for the `Balancer` and `Uniswap V2` AMM tokens.
- [Chainlink Oracles x Curve Pool Tokens](https://news.curve.fi/chainlink-oracles-and-curve-pools/)
Building Price Manipulation Resistant DeFi Applications with Curve Finance Liquidity Pools.
- 