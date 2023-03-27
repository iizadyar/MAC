import readline from "readline";
import { saveMessage, userExists, getMessagesForUser } from "./db";
import{log} from "./logging";
import { authenticate } from "./session";


export const sendMessage = async (sender: string, user: string) => {
    try {
        if (!await userExists(sender)) {
            log("Message sending failed. User " +sender+ " does not exist."  );
            throw new Error("sender account does not exist");
        }
        if (!await authenticate(sender)) {
           log("Message sending failed. Unable to authenticate sender " + sender +".");
            throw new Error("Unable to authenticate sender");
        }

        if (!await userExists(user)) {
            log("Message sending failed. Recipient " +user+" does not exist. " );
            throw new Error("Destination user does not exist");
        }

        getUserMessage().then(async (message) => {
            await saveMessage(message, sender, user);
        });
        log(" Message was sent successfully to the user " + user + " from user " +sender);
  
    } catch (error) {
        //log(" can not send message because User does not exist " );
        console.error("Error occured .", error);
    }
}

const getUserMessage = async (): Promise<string> => {
    let rl = readline.createInterface(process.stdin, process.stdout);
    let message: string = await new Promise(resolve => rl.question("Enter your message: ", resolve));
    rl.close();
    return message;
}

const getUsername = async (): Promise<string> => {
    let rl = readline.createInterface(process.stdin, process.stdout);
    let message: string = await new Promise(resolve => rl.question("Enter your name: ", resolve));
    rl.close();
    return message;
}
