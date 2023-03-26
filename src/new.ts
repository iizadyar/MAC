import readline from "readline";
import {log} from "./logging";

import { noUsers, setUserPassHash, userExists } from "./db";
import { authenticate, getPassword } from "./session";

export const newUser = async (user: string) => {
    try {
        if (!noUsers() && !userExists(user)) {
            throw new Error("User not recognized");
        }

        if (!(await authenticate(user))) {
            throw new Error("Unable to authenticate user");
        }

        let newUser = await getNewUsername();
        let newPassHash = await getPassword();

        await setUserPassHash(newUser, newPassHash);
        log(newUser + " was created successfully.");

    } catch (error) {
        console.error("Error ocurred creating a new user.", error);
        log("Error ocurred creating a new user.");
    }
}

const getNewUsername = async (): Promise<string> => {
    let rl = readline.createInterface(process.stdin, process.stdout);
    let username: string = await new Promise(resolve => rl.question("Username: ", resolve));
    return username;
}