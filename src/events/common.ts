import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";

@Discord()
export class Example {
    @On()
    messageDelete([message]: ArgsOf<"messageDelete">, client: Client): void {
        console.log(`message from ${client.user?.username} deleted: \n    ${message.content}`);
    }

    @On({ event: "messageCreate" })
    onMessage(
        [message]: ArgsOf<"messageCreate">, // Type message automatically
        client: Client, // Client instance injected here,
        guardPayload: any
    ) {
        if (message.mentions.has(client.user!.id)) {
            message.react("👋");
        }
    }
}
