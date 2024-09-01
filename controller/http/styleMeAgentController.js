

export const styleMeAgent = async (req, res) => {
    try {
      const { userMessage } = req.body;
      const result = await agentWithChatHistory.invoke(
        { input: userMessage },
        { configurable: { sessionId: "foo" } }
      );
      console.log(result);
      res.json({ result: result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }