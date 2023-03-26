import { connect } from "./db";
import crypto from "crypto";

const secret = "my-secret-key"; // Replace with your own secret key

export const getMessagesForUser = async (user: string): Promise<string[]> => {
  let db = await connect();

  let messages: string[] = [];

  await db.each(
    `
    SELECT data, mac FROM Messages
    WHERE recipient = (
      SELECT id FROM Users WHERE user = :user
    );
  `,
    {
      ":user": user,
    },
    (err, row) => {
      if (err) {
        throw new Error(err);
      }
      if (verifyMAC(row.data, row.mac)) {
        messages.push(row.data);
        console.log(`Message for user ${user} with MAC ${row.mac} verified.`);
      } else {
        console.log(`Message for user ${user} with MAC ${row.mac} could not be verified.`);
      }
    }
  );

  return messages;
};

export const saveMessage = async (message: string, recipient: string) => {
  let db = await connect();

  const mac = generateMAC(message);

  await db.run(
    `
    INSERT INTO Messages 
      (recipient, data, mac)
    VALUES (
      (SELECT id FROM Users WHERE user = :user),
      :message,
      :mac
    )
  `,
    {
      ":user": recipient,
      ":message": message,
      ":mac": mac,
    }
  );
};

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
