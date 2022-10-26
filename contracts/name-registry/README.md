# Name Registry

Build a vanity name registering system resistant against frontrunning.
An unregistered name can be registered for a certain amount of time by locking a certain amount of Ether. After the registration expires, the account loses ownership of the name and his balance is unlocked. The registration can be renewed by making an on-chain call to keep the name registered and balance locked. 
You can assume reasonable defaults for the locking amount and period.
The fee to register the name depends directly on the size of the name. Also, a malicious
node/validator should not be able to front-run the process by censoring transactions of an
honest user and registering its name in its own account.
