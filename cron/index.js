import { configDotenv } from "dotenv";

configDotenv();

const URL = "https://winget-pkg-api.onrender.com/api/v1/ping";
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY is not defined in .env file");
}
const timeBefore = Date.now();

const response = await fetch(URL, {
  method: "GET",
  headers: {
    "X-API-Key": API_KEY,
  },
});

const data = await response.json();

const timeAfter = Date.now();
const timeTaken = timeAfter - timeBefore;

console.log(`Response time: ${timeTaken} ms`);
console.log("Response data:", data);

if (!response.ok) {
  throw new Error(`HTTP error! status: ${response.status}`);
}
