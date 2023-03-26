import * as fs from 'fs';

export const log = (message: string) => {
    fs.appendFileSync('log.txt', `${new Date().toUTCString()}: ${message}\n`);
};