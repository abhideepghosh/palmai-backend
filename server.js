// Import required modules
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { TextServiceClient } from "@google-ai/generativelanguage";
import { GoogleAuth } from "google-auth-library";
// import OpenAI from "openai";

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse incoming JSON requests
app.use(express.json());

const MODEL_NAME = process.env.PALM_API_MODEL_NAME;
const API_KEY = process.env.PALM_API_KEY;

// Define a sample route that sends a JSON response
app.get("/", (req, res) => {
  res.json({ message: "Hello, This is PALM AI!" });
});

const client = new TextServiceClient({
  authClient: new GoogleAuth().fromAPIKey(API_KEY),
});

app.post("/palmai/prompt", async (req, res) => {
  try {
    const promptString = req.body.prompt;
    const stopSequences = [];
    const response = await client.generateText({
      // required, which model to use to generate the result
      model: MODEL_NAME,
      // optional, 0.0 always uses the highest-probability result
      temperature: 0.7,
      // optional, how many candidate results to generate
      candidateCount: 1,
      // optional, number of most probable tokens to consider for generation
      topK: 40,
      // optional, for nucleus sampling decoding strategy
      topP: 0.95,
      // optional, maximum number of output tokens to generate
      maxOutputTokens: 1024,
      // optional, sequences at which to stop model generation
      stopSequences: stopSequences,
      // optional, safety settings
      safetySettings: [
        {
          category: "HARM_CATEGORY_DEROGATORY",
          threshold: "BLOCK_LOW_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_TOXICITY",
          threshold: "BLOCK_LOW_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_VIOLENCE",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUAL",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_MEDICAL",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
      prompt: {
        text: promptString,
      },
    });
    res.json(response[0].candidates);
  } catch (err) {
    res.json({ err });
  }
});

// Define the port to listen on
const port = process.env.PORT || 5000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
