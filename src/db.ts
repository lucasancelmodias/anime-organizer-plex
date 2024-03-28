import sqlite from 'sqlite3';
import { type Token, type TokenResponse } from './types';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DBSOURCE = "./db.sqlite";
const dbPath = path.join(__dirname, DBSOURCE);

export const db = new sqlite.Database(dbPath, (err) => {
    if(err) {
        console.log('Error connecting to database');
        console.log(err);
    } else {
        console.log('Connected to database');
    }
});

export function initDB() {
    if (!fs.existsSync(dbPath)) {
        console.log('Database file not found. A new file will be created.');
    } else {
        console.log('Database file found.');
    }
    db.serialize(() => {
        
        db.run(`CREATE TABLE IF NOT EXISTS access_tokens (
            access_token TEXT PRIMARY KEY,
            date TEXT NOT NULL,
            token_type TEXT NOT NULL,
            expires_in INTEGER NOT NULL,
            refresh_token TEXT NOT NULL
        )`, (err: Error) => {
            if(err) {
                console.log('error creating access_tokens table');
                console.log(err);
            }
            console.log('access_tokens table created');

        });
    });
}

export function insertAccessToken(response: TokenResponse) {
    db.serialize(() => {
        db.run(`INSERT INTO access_tokens (access_token, date, expires_in,token_type,refresh_token) VALUES (?, ?, ?, ?, ?)`, 
        [response.access_token, new Date().toISOString(), response.expires_in, response.token_type, response.refresh_token],(error: Error) =>{
            if(error) {
                console.log('error inserting access token');
                console.log(error);
            }
            console.log('access token inserted.');
        });
    });
}

export function getAccessTokenFromDB() : Promise<TokenResponse> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get(`SELECT access_token, refresh_token FROM access_tokens ORDER BY date DESC LIMIT 1`, (err, row : TokenResponse) => {
                if(err) {
                    console.log('error getting access token');
                    console.log(err);
                    reject(err);
                }
                if(row) {
                    console.log('access token found');
                    
                    resolve(row);
                } else {
                    reject("No access token found in db");
                }
            });
        });
    });
}

export function isTokenExpired() : Promise<boolean> {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.get(`SELECT date FROM access_tokens ORDER BY date DESC LIMIT 1`, (err, row : Token) => {
                if(err) {
                    reject(err);
                }
                if(row) {
                    console.log('access token found');
                    
                    const date = new Date(row.date);
                    const now = new Date();
                    if(now.getTime() - date.getTime() > 3600000) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                } else {
                    reject("No access token found");
                }
            });
        });
    });
}

