import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { WebSocketServer } from "ws";
import http from "http";

import { connectionWs } from "./controller/ws/connectionController.js";
import { styleMeAgent } from "./controller/http/styleMeAgentController.js";

// import { pull } from "langchain/hub";
// import { RunnableSequence, RunnableBinding } from "@langchain/core/runnables";
const app = express();
const server = http.createServer(app);
app.use(express.static('frontend'));
// app.use(express.static('assets'));

const wss = new WebSocketServer({ server });

wss.on("connection", connectionWs);

// const prompt = await pull<ChatPromptTemplate>(
//     "jasperleo/styleme_basic"
// );

// const prompt = new RunnableSequence({
//   last: new RunnableBinding({
//     bound: llm,
//     kwargs: {},
//   }),
//   first: ChatPromptTemplate.fromMessages([
//     ["system", "You are an intelligent makeup assistant named 'StyleMe'. Your job is to apply makeup effects based on user commands. Ensure that your responses are safe, reasonable, and professional. Reject any irrelevant requests that are not related to makeup."],
//     ["placeholder", "{chat_history}"],
//     ["human", "{input}"],
//     ["placeholder", "{agent_scratchpad}"],
//   ]),
// })

app.use(cors());
app.use(bodyParser.json());

// router group
app.post("/styleme_agent", styleMeAgent);
app.get("/test", (req, res) => {
  console.log("Hi");
  res.send("Hi");
})

const port = 3000;
server.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});
