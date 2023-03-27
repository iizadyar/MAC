import { connect } from "./db";
import crypto from "crypto";

const secret = "my-secret-key"; // Replace with your own secret key

export const getMessagesForUser = async (user: string): Promise<{sender: string, message: string}[]> => {
  let db = await connect();

  let messages: {sender: string, message: string}[] = [];

  await db.each(
    `
    SELECT u.user AS sender, m.data, m.mac FROM Messages m
    JOIN Users u ON u.id = m.sender
    WHERE m.recipient = (
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
        messages.push({sender: row.sender, message: row.data});
        console.log(`Message from sender ${row.sender} for user ${user} with MAC ${row.mac} verified.`);
      } else {
        console.log(`Message from sender ${row.sender} for user ${user} with MAC ${row.mac} could not be verified.`);
      }
    }
  );

  return messages;
};


export const saveMessage = async (message: string, sender: string, recipient: string) => {
  let db = await connect();

  const mac = generateMAC(message);

  // Get the ID of the sender
  const senderIdResult = await db.get(`SELECT id FROM Users WHERE user = ?`, [sender]);
  if (!senderIdResult) {
    throw new Error(`Sender ${sender} not found`);
  }
  const senderId = senderIdResult.id;

  await db.run(
    `
    INSERT INTO Messages 
      (sender, recipient, data, mac)
    VALUES (
      ?,
      (SELECT id FROM Users WHERE user = ?),
      ?,
      ?
    )
  `,
    [senderId, recipient, message, mac]
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

