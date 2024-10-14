# Deposit

Provide liquidity to the market

## Deposit APY

Base Market Rate: 13.94%
Radiant Emissions: 509% (only activated for those who supply Dynamic Liquidity)

## Collateral

After deposit, can enable them as collateral
Collateralized asset will activate borrowing power, but can be partially liquidated

## 1-Click Loop & Lock (Leverage your Collateral)

this enables users to increase collateral value by automating depsoit & borrow cycle multiple times

- may not execute if selected leverage causes `health factor` to drop below 1.11.
  if loop tx fails, lower the leverage
- automatically ensures dLP eligibility.
  if user already eligible, zero ETH will be borrowed.
  if ineligible for RDNT emission, will automatically borow ETH to zap into a locked dLP position to maintain minimum 5% dLP requirementn for activating RDNT emissions
- slippage is fixed at 5%.
  If user wants to reduce it, recommend to manually create dLP on Balancer Pool.
- dLP will be locked for Default Locking Length

## rToken (interest-bearing tokens: rUSDC)
