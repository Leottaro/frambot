import type { CommandInteraction } from "discord.js";
import { ApplicationCommandOptionType } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import YoutubePlayer from "../utils/youtubePlayer.js";

const youtube_player = new YoutubePlayer();
@Discord()
@SlashGroup({ name: "youtube", description: "youtube player" })
@SlashGroup("youtube")
export class Youtube {
    @Slash({ name: "join", description: "join the same channel the user is in" })
    async join(interaction: CommandInteraction) {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member) {
            interaction.reply("I can't find you");
            return;
        }

        // join the voice channel
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            interaction.reply("You need to be in a voice channel to use this command.");
            return;
        }
        if (!voiceChannel.joinable) {
            interaction.reply("I cannot join this voice channel.");
            return;
        }
        youtube_player.join(voiceChannel);
        interaction.reply(`Joined ${voiceChannel.name}`);
    }

    @Slash({ name: "leave", description: "leave a the channel the bot is in" })
    async leave(interaction: CommandInteraction) {
        youtube_player.leave();
        interaction.reply("Left the voice channel.");
    }

    @Slash({ name: "play", description: "Play a youtube video" })
    async play(
        @SlashOption({
            name: "link",
            description: "the youtube link to play",
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        link: string, // https://www.youtube.com/watch?v=XXXXXXXXXXX&... or https://youtu.be/XXXXXXXXXXX?...
        interaction: CommandInteraction
    ): Promise<void> {
        const member = interaction.guild?.members.cache.get(interaction.user.id);
        if (!member) {
            interaction.reply("I can't find you");
            return;
        }
        if (!member.voice.channel) {
            interaction.reply("You need to be in a voice channel to use this command.");
            return;
        }

        if (!youtube_player.getChannel()) {
            youtube_player.join(member.voice.channel);
        } else if (youtube_player.getChannel() !== member.voice.channel) {
            console.log(youtube_player.getChannel(), member.voice.channel);
            interaction.reply("I'm not in the same channel as you.");
            return;
        }

        const regex = /(?:\/watch\?v=([^&\n ]+))|(?:youtu\.be\/([^?\n \/]+))/;
        const match = link.match(regex);
        if (!match) {
            interaction.reply("Invalid YouTube link.");
            return;
        }
        const video_id = match[1] || match[2];

        // interaction.deferReply();
        if (youtube_player.audioExists(video_id)) {
            await interaction.reply(`Loading https://youtu.be/${video_id}`);
        } else {
            await interaction.reply(`Downloading https://youtu.be/${video_id}`);
        }

        youtube_player.addAudio(video_id).then(async () => {
            await interaction.editReply(`Playing https://youtu.be/${video_id}`);
            console.log(`Playing https://youtu.be/${video_id}`);
        });
    }

    @Slash({ name: "pause", description: "Pause the current song" })
    async pause(interaction: CommandInteraction) {
        youtube_player.pause();
        interaction.reply("Paused the current song.");
    }

    @Slash({ name: "resume", description: "Resume the current song" })
    async resume(interaction: CommandInteraction) {
        youtube_player.play();
        interaction.reply("Resumed the current song.");
    }

    @Slash({ name: "skip", description: "Skip the current song" })
    async skip(interaction: CommandInteraction) {
        youtube_player.skip();
        interaction.reply("Skipped the current song.");
    }

    @Slash({ name: "stop", description: "Stop the bot" })
    async stop(interaction: CommandInteraction) {
        youtube_player.clear();
        youtube_player.leave();
        interaction.reply("Stopped the bot.");
    }
}
