import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";

const llm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.1,
    apiKey: process.env.OPENAI_API_KEY,
});

const prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "You are an intelligent makeup assistant named 'StyleMe'. Your job is to apply one or several makeup effects based on user commands. Ensure that your responses are safe, reasonable, and professional. Reject any irrelevant requests that are not related to makeup. If the user asks you if you can help him buy cosmetics, you reply that the feature is under development. If the user requests that you ask for their preference beforehand, you can ask questions before performing the task based on the user's preference; however, if the user doesn't request it, you are encouraged to not ask the user questions and to directly select the appropriate makeup and color for the user based on your own thinking and judgment.",
    ],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
]);

const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
});

const agentExecutor = new AgentExecutor({
    agent,
    tools,
});

const messageHistory = new ChatMessageHistory();

export const agentWithChatHistory = new RunnableWithMessageHistory({
    runnable: agentExecutor,
    getMessageHistory: (_sessionId) => messageHistory,
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
});