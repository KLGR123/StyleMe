import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import WebSocket, { WebSocketServer } from 'ws';

import { ChatOpenAI } from '@langchain/openai';
import { createOpenAIFunctionsAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { ChatMessageHistory } from "langchain/stores/message/in_memory";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// import { pull } from "langchain/hub";
// import { RunnableSequence, RunnableBinding } from "@langchain/core/runnables";


const wss = new WebSocketServer({ port: 4000 });

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log(`wss Received: ${message}`);
    });
    ws.on('close', () => {
        console.log('wss Client disconnected');
    });
});

function broadcastMessage(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

const llm = new ChatOpenAI({
    model: "gpt-4o",
    temperature: 0.1,
    apiKey: process.env.OPENAI_API_KEY
});

const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are an intelligent makeup assistant named 'StyleMe'. Your job is to apply one or several makeup effects based on user commands. Ensure that your responses are safe, reasonable, and professional. Reject any irrelevant requests that are not related to makeup. If the user asks you if you can help him buy cosmetics, you reply that the feature is under development. If the user requests that you ask for their preference beforehand, you can ask questions before performing the task based on the user's preference; however, if the user doesn't request it, you are encouraged to not ask the user questions and to directly select the appropriate makeup and color for the user based on your own thinking and judgment."],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
])

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

const LipstickOn = new DynamicStructuredTool({
    name: "LipstickOn",
    description: "Turn on and apply the lipstick to the user's face.",
    schema: z.object({}),
    func: async () => {
        console.log("LipstickOn called"); 
        broadcastMessage(JSON.stringify({ tool_name: "LipstickOn", params: {} }));
    },
});

const LipstickChangeColor = new DynamicStructuredTool({
    name: "LipstickChangeColor",
    description: "Change the color of the lipstick.",
    schema: z.object({
        color: z.string().describe("Set lips color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal)."),
    }),
    func: async ({ color }) => {
        console.log("LipstickChangeColor with parameter called", color);
        broadcastMessage(JSON.stringify({ tool_name: "LipstickChangeColor", params: { color } }));
    },
});

const LipstickChangeBrightness = new DynamicStructuredTool({
    name: "LipstickChangeBrightness",
    description: "Change the brightness of the lipstick.",
    schema: z.object({
        brightness: z.string().describe("Change lips brightness intensity, where n - any value from 0 to 2 (including decimal). 0 stands for the minimal brightness (black color), 1 stands for standard brightness. Values > 2 may be also provided."),
    }),
    func: async ({ brightness }) => {
        console.log("LipstickChangeBrightness with parameter called", brightness);
        broadcastMessage(JSON.stringify({ tool_name: "LipstickChangeBrightness", params: { brightness } }));
    },
});

const LipstickChangeSaturation = new DynamicStructuredTool({
    name: "LipstickChangeSaturation",
    description: "Change the shine saturation intensity of the lipstick.",
    schema: z.object({
        saturation: z.string().describe("changes shine saturation intensity, where n - any value from 0 to 1 (including decimal)."),
    }),
    func: async ({ saturation }) => {
        console.log("LipstickChangeSaturation with parameter called", saturation);
        broadcastMessage(JSON.stringify({ tool_name: "LipstickChangeSaturation", params: { saturation } }));
    }
});

const LipstickChangeShineIntensity = new DynamicStructuredTool({
    name: "LipstickChangeShineIntensity",
    description: "Change the shine intensity of the lipstick.",
    schema: z.object({
        shineIntensity: z.string().describe("changes shine intensity, where n - any value from 0 to 2 (including decimal). Values > 2 may be also provided."),
    }),
    func: async ({ shineIntensity }) => {
        console.log("LipstickChangeShineIntensity with parameter called", shineIntensity);
        broadcastMessage(JSON.stringify({ tool_name: "LipstickChangeShineIntensity", params: { shineIntensity } }));
    }
});

const LipstickChangeShineBleeding = new DynamicStructuredTool({
    name: "LipstickChangeShineBleeding",
    description: "Change the shine bleeding of the lipstick.",
    schema: z.object({
        shineBleeding: z.string().describe("changes shine blending strength, where n - any value from 0 to 1 (including decimal). Values > 1 may be also provided."),
    }),
    func: async ({ shineBleeding }) => {
        console.log("LipstickChangeShineBleeding with parameter called", shineBleeding);
        broadcastMessage(JSON.stringify({ tool_name: "LipstickChangeShineBleeding", params: { shineBleeding } }));
    }
})

const LipstickChangeShineScale = new DynamicStructuredTool({
    name: "LipstickChangeShineScale",
    description: "Change the shine scale of the lipstick.",
    schema: z.object({
        shineScale: z.string().describe("changes shine scale, where n - any value from 0 to 1 (including decimal). 0 stands for the minimal scale (shine disabled), 1 stands for standard scale. Values > 1 may be also provided."),
    }),
    func: async ({ shineScale }) => {
        console.log("LipstickChangeShineScale with parameter called", shineScale);
        broadcastMessage(JSON.stringify({ tool_name: "LipstickChangeShineScale", params: { shineScale } }));
    }
})

const LipstickChangeGlitterGrain = new DynamicStructuredTool({
    name: "LipstickChangeGlitterGrain",
    description: "Change the glitter grain of the lipstick.",
    schema: z.object({
        glitterGrain: z.string().describe("changes glitter grain strength, where n - any value from 0 to 2 (including decimal). Values > 2 may be also provided."),
    }),
    func: async ({ glitterGrain }) => {
        console.log("LipstickChangeGlitterGrain with parameter called", glitterGrain);
        broadcastMessage(JSON.stringify({ tool_name: "LipstickChangeGlitterGrain", params: { glitterGrain } }));
    }
})

const LipstickChangeGlitterIntensity = new DynamicStructuredTool({
    name: "LipstickChangeGlitterIntensity",
    description: "Change the glitter intensity of the lipstick.",
    schema: z.object({
        glitterIntensity: z.string().describe("changes glitter intensity, where n - any value from 0 to 2 (including decimal). Values > 2 may be also provided."),
    }),
    func: async ({ glitterIntensity }) => {
        console.log("LipstickChangeGlitterIntensity with parameter called", glitterIntensity);
        broadcastMessage(JSON.stringify({ tool_name: "LipstickChangeGlitterIntensity", params: { glitterIntensity } }));
    }
})

const LipstickChangeGlitterBleeding = new DynamicStructuredTool({
    name: "LipstickChangeGlitterBleeding",
    description: "Change the glitter bleeding of the lipstick.",
    schema: z.object({
        glitterBleeding: z.string().describe("changes glitter blending strength, where n - any value from 0 to 2 (including decimal). Values > 2 may be also provided."),
    }),
    func: async ({ glitterBleeding }) => {
        console.log("LipstickChangeGlitterBleeding with parameter called", glitterBleeding);
        broadcastMessage(JSON.stringify({ tool_name: "LipstickChangeGlitterBleeding", params: { glitterBleeding } }));
    }
})

const LipstickOff = new DynamicStructuredTool({
    name: "LipstickOff",
    description: "Turn off the lipstick.",
    schema: z.object({}),
    func: async () => {
        console.log("LipstickOff called");
        broadcastMessage(JSON.stringify({ tool_name: "LipstickOff", params: {} }));
    },
});

const BrowOn = new DynamicStructuredTool({
    name: "BrowOn",
    description: "Turn on and apply brow to the user's face.",
    schema: z.object({}),
    func: async () => {
        console.log("BrowOn called");
        broadcastMessage(JSON.stringify({ tool_name: "BrowOn", params: {} }));
    },
});

const BrowChangeColor = new DynamicStructuredTool({
    name: "BrowChangeColor",
    description: "Change the color of the brow.",
    schema: z.object({
        color: z.string().describe("set brows color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal)."),
    }),
    func: async ({ color }) => {
        console.log("BrowChangeColor with parameter called", color);
        broadcastMessage(JSON.stringify({ tool_name: "BrowChangeColor", params: { color } }));
    },
});

const BrowOff = new DynamicStructuredTool({
    name: "BrowOff",
    description: "Turn off the brow.",
    schema: z.object({}),
    func: async () => {
        console.log("BrowOff called");
        broadcastMessage(JSON.stringify({ tool_name: "BrowOff", params: {} }));
    },
});

const EyeshadowOn = new DynamicStructuredTool({
    name: "EyeshadowOn",
    description: "Turn on and apply eye shadow to the user's face.",
    schema: z.object({}),
    func: async () => {
        console.log("EyeshadowOn called");
        broadcastMessage(JSON.stringify({ tool_name: "EyeshadowOn", params: {} }));
    },
});

const EyeshadowChangeColor = new DynamicStructuredTool({
    name: "EyeshadowChangeColor",
    description: "Change the color of the eye shadow.",
    schema: z.object({
        color: z.string().describe("set eyeshadow color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal)."),
    }),
    func: async ({ color }) => {
        console.log("EyeshadowChangeColor with parameter called", color);
        broadcastMessage(JSON.stringify({ tool_name: "EyeshadowChangeColor", params: { color } }));
    },
});

const EyeshadowOff = new DynamicStructuredTool({
    name: "EyeshadowOff",
    description: "Turn off the eye shadow.",
    schema: z.object({}),
    func: async () => {
        console.log("EyeshadowOff called");
        broadcastMessage(JSON.stringify({ tool_name: "EyeshadowOff", params: {} }));
    },
});

const EyeLinerOn = new DynamicStructuredTool({
    name: "EyeLinerOn",
    description: "Turn on and apply eye liner to the user's eyes.",
    schema: z.object({}),
    func: async () => {
        console.log("EyeLinerOn called");
        broadcastMessage(JSON.stringify({ tool_name: "EyeLinerOn", params: {} }));
    },
})

const EyeLinerChangeColor = new DynamicStructuredTool({
    name: "EyeLinerChangeColor",
    description: "Change the color of the eye liner.",
    schema: z.object({
        color: z.string().describe("set eyeliner color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal)."),
    }),
    func: async ({ color }) => {
        console.log("EyeLinerChangeColor with parameter called", color);
        broadcastMessage(JSON.stringify({ tool_name: "EyeLinerChangeColor", params: { color } }));
    },
});

const EyeLinerOff = new DynamicStructuredTool({
    name: "EyeLinerOff",
    description: "Turn off the eye liner.",
    schema: z.object({}),
    func: async () => {
        console.log("EyeLinerOff called");
        broadcastMessage(JSON.stringify({ tool_name: "EyeLinerOff", params: {} }));
    },
})

const HighlighterOn = new DynamicStructuredTool({
    name: "HighlighterOn",
    description: "Turn on and apply face highlighter to the user's face.",
    schema: z.object({}),
    func: async () => {
        console.log("HighlighterOn called");
        broadcastMessage(JSON.stringify({ tool_name: "HighlighterOn", params: {} }));
    },
})

const HighlighterChangeColor = new DynamicStructuredTool({
    name: "HighlighterChangeColor",
    description: "Change the color of the highlighter.",
    schema: z.object({
        color: z.string().describe("set highlighter color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal)."),
    }),
    func: async ({ color }) => {
        console.log("HighlighterChangeColor with parameter called", color);
        broadcastMessage(JSON.stringify({ tool_name: "HighlighterChangeColor", params: { color } }));
    },
});

const HighlighterOff = new DynamicStructuredTool({
    name: "HighlighterOff",
    description: "Turn off the highlighter.",
    schema: z.object({}),
    func: async () => {
        console.log("HighlighterOff called");
        broadcastMessage(JSON.stringify({ tool_name: "HighlighterOff", params: {} }));
    },
});

const ContourOn = new DynamicStructuredTool({
    name: "ContourOn",
    description: "Turn on and apply face contour to the user's face.",
    schema: z.object({}),
    func: async () => {
        console.log("ContourOn called");
        broadcastMessage(JSON.stringify({ tool_name: "ContourOn", params: {} }));
    },
})

const ContourChangeColor = new DynamicStructuredTool({
    name: "ContourChangeColor",
    description: "Change the color of the contour.",
    schema: z.object({
        color: z.string().describe("set contour color in R G B A format (separated with space). Each value should be in a range from 0 to 1 (including decimal)."),
    }),
    func: async ({ color }) => {
        console.log("ContourChangeColor with parameter called", color);
        broadcastMessage(JSON.stringify({ tool_name: "ContourChangeColor", params: { color } }));
    },
});

const ContourOff = new DynamicStructuredTool({
    name: "ContourOff",
    description: "Turn off the contour.",
    schema: z.object({}),
    func: async () => {
        console.log("ContourOff called");
        broadcastMessage(JSON.stringify({ tool_name: "ContourOff", params: {} }));
    },
})

const FoundationOn = new DynamicStructuredTool({
    name: "FoundationOn",
    description: "Turn on and apply face foundation to the user's face.",
    schema: z.object({}),
    func: async () => {
        console.log("FoundationOn called");
        broadcastMessage(JSON.stringify({ tool_name: "FoundationOn", params: {} }));
    },
})

const FoundationChangeColor = new DynamicStructuredTool({
    name: "FoundationChangeColor",
    description: "Change the color of the foundation.",
    schema: z.object({
        color: z.string().describe("set skin color in R G B A format (separated with space). Each value should be in a rage from 0 to 1 (including decimal)."),
    }),
    func: async ({ color }) => {
        console.log("FoundationChangeColor with parameter called", color);
        broadcastMessage(JSON.stringify({ tool_name: "FoundationChangeColor", params: { color } }));
    },
})

const FoundationOff = new DynamicStructuredTool({
    name: "FoundationOff",
    description: "Turn off the foundation.",
    schema: z.object({}),
    func: async () => {
        console.log("FoundationOff called");
        broadcastMessage(JSON.stringify({ tool_name: "FoundationOff", params: {} }));
    },
})

const BlushOn = new DynamicStructuredTool({
    name: "BlushOn",
    description: "Turn on and apply face blush to the user's face.",
    schema: z.object({}),
    func: async () => {
        console.log("BlushOn called");
        broadcastMessage(JSON.stringify({ tool_name: "BlushOn", params: {} }));
    },
})

const BlushChangeColor = new DynamicStructuredTool({
    name: "BlushChangeColor",
    description: "Change the color of the face blush.",
    schema: z.object({
        color: z.string().describe("set blush color in R G B A format (separated with space). Each value should be in a rage from 0 to 1 (including decimal)."),
    }),
    func: async ({ color }) => {
        console.log("BlushChangeColor called");
        broadcastMessage(JSON.stringify({ tool_name: "BlushChangeColor", params: { color } }));
    }
})

const BlushOff = new DynamicStructuredTool({
    name: "BlushOff",
    description: "Turn off the face blush.",
    schema: z.object({}),
    func: async () => {
        console.log("BlushOff called");
        broadcastMessage(JSON.stringify({ tool_name: "BlushOff", params: {} }));
    },
});

const tools = [
    LipstickOn,
    LipstickOff,
    LipstickChangeColor,
    LipstickChangeBrightness,
    LipstickChangeSaturation,
    LipstickChangeShineIntensity,
    LipstickChangeShineBleeding,
    LipstickChangeShineScale,
    LipstickChangeGlitterGrain,
    LipstickChangeGlitterIntensity,
    LipstickChangeGlitterBleeding,
    LipstickOff,
    BrowOn,
    BrowChangeColor,
    BrowOff,
    EyeshadowOn,
    EyeshadowChangeColor,
    EyeshadowOff,
    EyeLinerOn,
    EyeLinerChangeColor,
    EyeLinerOff,
    HighlighterOn,
    HighlighterChangeColor,
    HighlighterOff,
    ContourOn,
    ContourChangeColor,
    ContourOff,
    FoundationOn,
    FoundationChangeColor,
    FoundationOff,
    BlushOn,
    BlushChangeColor,
    BlushOn,
    BlushOff,
];

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

const agentWithChatHistory = new RunnableWithMessageHistory({
    runnable: agentExecutor,
    getMessageHistory: (_sessionId) => messageHistory,
    inputMessagesKey: "input",
    historyMessagesKey: "chat_history",
});

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post('/styleme_agent', async (req, res) => {
    try {
        const { userMessage } = req.body;
        const result = await agentWithChatHistory.invoke(
            {input: userMessage},
            {configurable: {sessionId: "foo"}}
        );
        console.log(result);
        res.json({ result: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const port = 3000
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
