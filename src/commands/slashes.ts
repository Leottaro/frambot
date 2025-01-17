import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";

@Discord()
export class SlashCommands {
    @Slash({ name: "ping", description: "Respond with pong!" })
    async ping(interaction: CommandInteraction): Promise<void> {
        interaction.reply("Pong!");
    }

    @Slash({ name: "add", description: "add x and y" })
    async add(
        @SlashOption({
            description: "x value",
            name: "x",
            required: true,
            type: ApplicationCommandOptionType.Number,
        })
        x: number,
        @SlashOption({
            description: "y value",
            name: "y",
            required: true,
            type: ApplicationCommandOptionType.Number,
        })
        y: number,
        interaction: CommandInteraction
    ): Promise<void> {
        interaction.reply(`${x} + ${y} = ${x + y}`);
    }
}
