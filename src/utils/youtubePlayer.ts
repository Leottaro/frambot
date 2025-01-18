import {
    AudioPlayer,
    AudioPlayerStatus,
    AudioResource,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    VoiceConnection,
} from "@discordjs/voice";
import { VoiceBasedChannel } from "discord.js";
import { existsSync, mkdirSync } from "fs";
import youtubeDl from "youtube-dl-exec";

const directory = "./res/youtube";
if (!existsSync(directory)) {
    mkdirSync(directory, { recursive: true });
}

class YoutubePlayer {
    private channel?: VoiceBasedChannel;
    private connection?: VoiceConnection;
    private player: AudioPlayer;
    private queue: string[] = [];

    constructor() {
        this.player = createAudioPlayer();
        this.player.on(AudioPlayerStatus.Idle || AudioPlayerStatus.AutoPaused, () => {
            this.skip();
        });
    }

    join(channel: VoiceBasedChannel): void {
        if (this.connection) {
            this.leave();
        }
        this.channel = channel;
        this.connection = joinVoiceChannel({
            channelId: this.channel.id,
            guildId: this.channel.guild.id,
            adapterCreator: this.channel.guild.voiceAdapterCreator,
        });
        this.connection.subscribe(this.player);
        this.play();
    }

    leave(): void {
        this.connection?.destroy();
        this.connection = undefined;
        this.channel = undefined;
        this.clear();
    }

    async addAudio(video_id: string): Promise<void> {
        if (!existsSync(`${directory}/${video_id}.mp3`)) {
            await youtubeDl(`https://www.youtube.com/watch?v=${video_id}`, {
                extractAudio: true,
                audioFormat: "mp3",
                output: `${directory}/${video_id}.mp3`,
                noCheckCertificates: true,
                noWarnings: true,
            });
        }

        this.queue.push(video_id);
        this.play();
    }

    play(): void {
        this.player.unpause();
        if (!this.isPlaying()) {
            this.player.play(createAudioResource(`${directory}/${this.queue.shift()}.mp3`));
        }
    }

    pause(): void {
        this.player.pause();
    }

    skip(): void {
        const song = this.queue.shift();
        if (song) {
            this.player.play(createAudioResource(`${directory}/${song}.mp3`));
        } else {
            this.leave();
        }
    }

    clear(): void {
        this.queue = [];
        this.player.stop(true);
    }

    audioExists = (video_id: string) => existsSync(`${directory}/${video_id}.mp3`);
    isPlaying = () => this.player.state.status === AudioPlayerStatus.Playing;

    getChannel = () => this.channel;
    getConnection = () => this.connection;
    getPlayer = () => this.player;
    getSongs = () => this.queue;
}
export default YoutubePlayer;
