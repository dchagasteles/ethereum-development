## Account Abstraction (AA) Technology
**Account Abstraction** is a concept that aims to enhance the user experience in blockchain systems by making accounts more flexible and programmable. In traditional blockchain systems, there are two types of accounts:

1. **Externally Owned Accounts (EOAs)**: Controlled by private keys, typically belonging to users.
2. **Contract Accounts**: Controlled by code, typically smart contracts.

Account Abstraction blurs the lines between these two types by allowing the logic that determines the validity of a transaction to be embedded within the account itself, not just in the blockchain protocol.

**Key Features of Account Abstraction:**
**Customizable Transaction Logic**: Users can define custom logic for transaction validation, such as multi-signature requirements or rate limiting.
**Improved Security**: By embedding security checks directly in the account, users can prevent certain types of attacks.
**User Experience**: Enables features like meta-transactions, where a third party can pay for gas fees on behalf of the user.


## Program Derived Addresses (PDAs)
**Program Derived Addresses (PDAs)** are a concept from Solana but can be adapted to other blockchain protocols. PDAs are addresses derived from a seed value and a program ID, making them predictable and deterministic.

**How PDAs Work:**
- Seed Value: A base value used to derive the address.
- Program ID: A unique identifier for the program (smart contract) generating the address.
- Deterministic: The same seed and program ID will always generate the same PDA.

PDAs are particularly useful for creating addresses that need to interact with specific smart contracts, ensuring that funds or data sent to these addresses are automatically handled by the designated program.

## Degen
**Degen** is a slang term in the cryptocurrency and DeFi communities referring to someone who engages in high-risk, speculative trading or investing, often with little regard for due diligence or the potential for losses. The term is short for "degenerate," highlighting the reckless nature of such behavior.