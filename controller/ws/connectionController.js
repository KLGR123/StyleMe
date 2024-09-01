export const connectionWs = (ws) => {
    ws.on("message", (message) => {
        console.log(`wss Received: ${message}`);
    });
    ws.on("close", () => {
        console.log("wss Client disconnected");
    });
}