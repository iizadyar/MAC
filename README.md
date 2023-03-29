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


## Remaining of assignment 1

An attemp has been done to modify the code and improve the security design by introducing new functions to ask for the sender of each message and also authenticate the sender. The following function can be used:

--send --from  <sender username> --to <recipient username>

The sender is then prompt to enter the password. If authenticated, the utility allows the sender to send the message.


## ## MACs Strategy

## MAC- Modifications to the messages are reported

A message authentication code (MAC) was included with each message in the database. In the code, after a message is successfully sent, the generateMAC function takes a string as input and generates a MAC using the crypto.createHmac function with the sha256 algorithm and a secret key. The generateMAC function returns the MAC as a hexadecimal string. When a message is sent, the saveMessage function stores the MAC along with the message in the database (as well as the sender and recipient (id)). The getMessagesForUser function retrieves messages from the database for a given user. It verifies the MAC for each message using the verifyMAC function before adding it to the list of messages to be returned. The verifyMAC function takes two strings as input: the original message and the MAC generated for that message. It also uses crypto.createHmac function with the same algorithm and secret key to generate a MAC for the original message, then compare the two MACs to check if they match. If the two MACs match, the message is considered to be authentic and has not been tampered. The utility displays a message to the user should the message be modified, i.e., if the integrity of the message can not be verified.

const generateMAC = (data: string): string => {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(data);
  return hmac.digest("hex");
};

const verifyMAC = (data: string, mac: string): boolean => {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(data);
  return hmac.digest("hex") === mac;
};

## MACs cannot be modified

In this utility, appropriate measures have been taken to ensure that the MAC cannot be modified without detection. The following points can be mentioned in this regard

(i)	Implementing a message authentication code (MAC) using the HMAC algorithm with a strong cryptographic hash function such as sha256. Using the sha256 ensures that the likelihood of the message being replaced with one with the same hash is incredibly unlikely.

(ii)	In addition to using a secure hash function, the MAC is stored securely in the database by encrypting it with a key known only to the server. This helps to prevent attackers from modifying the MAC or substituting their own. 

(iii)	The SQL code creates a trigger called message_mac_read_only that is executed before an update is performed on the Messages table. This part of the utility ensures that the mac value cannot be modified during an update. The mac_read_only constraint raises an error if an attempt is made to modify the mac value during an update.

(iv)	One potential improvement for the future is to store the MAC separately (it is currently stored in the same database as the message data) or use a different storage mechanism.

Overall, using a MAC is a good practice for ensuring message integrity, but it should be combined with other security measures. For instance, MAC does not protect against mass flooding. This shortcoming has been addressed in the code by implementing sender authentication. 

# MAC failures are added to log files

A “fs.appendFileSync” function is used to write data to a file in a synchronous manner. The function takes two parameters: the first parameter is the file name to which the data is to be written, and the second parameter is the data to be written.


## Mitigation of Mass Flooding (Sender authentication)

A second problem is the mass flooding of messages to drown out any valid message. To address this issue, a schema is included, which requires a user to authenticate before sending a message. We have also modified the read.ts and message.ts to display the sender of a message when the message is retrieved. The following changes have been made:

(i)	Add a new parameter sender (ID) to the message table and include it in the SQL query as a column to insert.

(ii)	Modify the send.ts to ask for sender + authentication of any specific message. If the sender user does not exist or is unable to authenticate, an error message appears. 

(iii)	Include sender id, recipient id, message, and MAC in the database (db.ts)

(iv)	Modify the read.ts to display the name of the sender when a message is retrieved and the user enter the correct password

(v)	Modify the getMessagesForUser function of the message.ts file to return the sender name in addition to the message body. 

## Justification for MAC changes as correct

Firstly, including MACs with each message in the database helps detect if a message has been modified or tampered with.  A MAC is a cryptographic checksum calculated from the message and a secret key, which helps to ensure the integrity of the messages being sent and received.

Secondly, the MACs prevent message injection attacks where an attacker could modify a message to include malicious content.

Thirdly, the authentication before sending a message ensures that the sender of a message is who they claim to be and also prevents impersonation attacks, where an attacker could send messages as if they were another user without proper authentication.

Additionally, as the sender's identity is included with each message when retrieved, it helps establish accountability for the messages. When inappropriate messages are sent, the sender(s) will be held responsible.

Overall, these changes help to improve the security of the messaging system by providing authentication, accountability, and message integrity.

The following notes should be considered:

(i) The key of the MAC is randomly generated and only owned by the server and hence is not reproducible by a malicious attacker. 
(ii) The attackers need a key and a message to potentially decrypt the key. The identity of sender was assumed to be protected from tampering, whihc makes the attack more difficult.
(iii) Using the SHA-256 ensures that the likelyhood of the message being replaced with one with the same hash is incredibly unlikely.