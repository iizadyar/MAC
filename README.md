#  deaddrop-js

A deaddrop utility written in Typescript. Put files in a database behind a password to be retrieved at a later date.

This is a part of the University of Wyoming's Secure Software Design Course (Spring 2023). This is the base repository to be forked and updated for various assignments. Alternative language versions are available in:
- [Go](https://github.com/andey-robins/deaddrop-go)
- [Rust](https://github.com/andey-robins/deaddrop-rs)

## Versioning

`deaddrop-js` is built with:
- node v18.13.0

## Usage

`npm run build && node dist/index.js --help` for instructions

Then run `node dist/index.js --new --user <username here>` and you will be prompted to create the initial password.

For the second user onward, `node dist/index.js --new --user <first username here>` and you will be prompted to enter the password. If the password is correct, you will prompted to enter the name and password for the second user.


## Database

Data gets stored into the local database file dd.db. This file will not by synched to git repos. Delete this file if you don't set up a user properly on the first go


## Logging strategy

The original version of the code was modified to include logging of actions during the execution of the system. Logging allows one to  understand if anything went wrong with the utility. It was attempted to develop a meaningful logging system for the deaed drop code that was analyzed in HW#1. The strategy was to first introduce the "log" constant (function) as a separate file (logging.ts) in the source folder. This function is capable of generating the "log.txt" file and updating it based on the actions. 

The log function is repeatedly recalled in various files, i.e., new, read, and send, and outputs the action, time, date, and username. The following actions can be tracked in each of these files:

- new: (i) creating a new user; (ii) error in creating a new user

- send: (i) sending a message to a user that exists; (ii) sending failure if the sender does not exist, (iii) sending failure if the sender does not authenticate, (iv) sending failure when the recipient does not exist.

- read: (i) reading a message for a user that exists; (ii) error when attempting to read messages with wrong password; (iii) error when attempting to read messages for a wrong username.

The log.txt file is placed in the the root of the repository.



## Mitigation (Message sender and password change)

An attemp has been done to modify the code and improve the security design by introducing new functions to ask for the sender of each message and also authenticate the sender. The following function can be used:

--send --from  <sender username> --to <recipient username>

The sender is then prompt to enter the password. If authenticated, the utility allows the sender to send the message.

Another plan is to include a module that enables changing the password for the main user(s). I will be working on this item in future.