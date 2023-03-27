import { getMessagesForUser, userExists } from "./db";
import { authenticate } from "./session";
import { log } from "./logging";

export async function readMessages(user: string) {
  try {
    if (!await userExists(user)) {
      log(user + " does not exist.");
      throw new Error("User does not exist");
    }

    if (!await authenticate(user)) {
      log(user + " Unables to authenticate.");
      throw new Error("Unable to authenticate");
    }

    getMessagesForUser(user).then((messages) => {
      messages.forEach((message) => console.log(`${message.sender}: ${message.message}\n`));
    });

    log(user + " checked the message box successfully.");
  } catch (error) {
    log(user + " does not exist or unables to authenticate.");
    console.error("Error occured during reading.", error);
  }
}
