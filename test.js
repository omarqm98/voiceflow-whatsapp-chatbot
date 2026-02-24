const ws = new WebSocket ("ws://localhost:8091/ws/proxy");

ws.addEventListener ("open", () => {
	setTimeout (() => ws.close (1000, "example"), 1000);
});