import sqlite3 from "sqlite3";
import { existsSync } from "fs";
import { exit } from "process";
import { Database, open } from "sqlite";

const schema: string = `
CREATE TABLE Users (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    user TINYTEXT NOT NULL,
    hash TEXT NOT NULL
);

CREATE TABLE Messages (
    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    sender TINYTEXT NOT NULL,
    recipient INTEGER NOT NULL REFERENCES Users(id),
    data TEXT NOT NULL,
    mac TEXT NOT NULL,
    CONSTRAINT mac_read_only
      CHECK (mac = OLD.mac)
      DEFERRABLE INITIALLY DEFERRED
);

CREATE TRIGGER message_mac_read_only
BEFORE UPDATE ON Messages
FOR EACH ROW
BEGIN
    SELECT RAISE(ABORT, 'MAC field is read-only') WHERE NEW.mac != OLD.mac;
END;

`;



export const connect = async (): Promise<Database<sqlite3.Database, sqlite3.Statement>> => {
    try {
        let mustInitDb = false;
        if (!existsSync("dd.db")) {
            mustInitDb = true;
        }

        return await open({
            filename: "dd.db",
            driver: sqlite3.Database,
        }).then(async (db) => {
            if (mustInitDb) {
                await db.exec(schema);
            }
            return db;
        }).then(async (db) => await db);

    } catch (error) {
        console.error(error)
        exit();
    }
};
