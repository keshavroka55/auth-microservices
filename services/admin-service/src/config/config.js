import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

const required = (name) => {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required env var: ${name}`);
    return value;
};

// Fail fast at startup instead of failing mysteriously on the first request.
const publicKeyPath = path.resolve(required("ACCESS_TOKEN_PUBLIC_KEY_PATH"));

export const config = {
    PORT: process.env.PORT || 5001,
    NODE_ENV: process.env.NODE_ENV || "development",

    ACCESS_TOKEN_PUBLIC_KEY: fs.readFileSync(publicKeyPath, "utf8"),
    TOKEN_ISSUER: "auth-service", // must match what auth-service puts in the token

    AUTH_SERVICE_URL: required("AUTH_SERVICE_URL"),
    INTERNAL_API_KEY: required("INTERNAL_API_KEY"),

    CLIENT_URL: process.env.CLIENT_URL || "http://localhost:3000",
};
