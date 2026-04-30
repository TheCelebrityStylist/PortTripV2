import { query } from "@anthropic-ai/claude-agent-sdk";
import { Composio } from "@composio/core";

const composio = new Composio();
const userId = "user_85tnt";

const session = await composio.create(userId);

const stream = await query({
  prompt: "Star the composiohq/composio repo on GitHub",
  options: {
    permissionMode: "bypassPermissions",
    mcpServers: {
      composio: session.mcp,
    },
  },
});

for await (const event of stream) {
  if (event.type === "result" && event.subtype === "success") {
    process.stdout.write(event.result);
  }
}
