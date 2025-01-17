import type { ArgsOf, Client } from "discordx";
import { Discord, On } from "discordx";

@Discord()
export class Example {
    @On()
    messageDelete([message]: ArgsOf<"messageDelete">, client: Client): void {
        console.log(`message from ${client.user?.username} deleted: \n    ${message.content}`);
    }
}
