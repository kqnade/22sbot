const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, Events, ActionRowBuilder, StringSelectMenuBuilder, MessageEmbed } = require('discord.js');
const config = require('./environmentConfig')
const timetableBuilder  = require('./timetable/timetableUtils');
const timetableData = require('./timetable/timetables.json');
const Classes = require('./timetable/timetables.json');
const TxtEasterEgg = require('./functions/TxtEasterEgg.js');
const dashboard = require('./functions/dashboard.js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
require('date-utils');
const {configPath} = require("./environmentConfig");
dotenv.config();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences
    ],
    partials: [Partials.Channel],
});
module.exports.client=client;

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Collection();
module.exports = client.commands;


/*スラッシュコマンド登録*/
client.once("ready", async () => {
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        for (let i = 0; i < command.length; i++) {
            client.commands.set(command[i].data.name, command[i]);
        }

    }
    console.log("Ready!");
});

/*実際の動作*/
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) {
        return;
    }
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;
    console.log("SlashCommand : "+command.data.name);
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'おっと、想定外の事態が起きちゃった。管理者に連絡してくれ。', ephemeral: true });
    }
});

/*TxtEasterEgg*/
client.on('messageCreate', message => {
    TxtEasterEgg.func(message);
})

cron.schedule('*/1  * * * *', async () => {
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    const dashboardGuild = client.guilds.cache.get(data.dashboard[2]); /*ギルド情報取得*/
    const channel = client.channels.cache.get(data.dashboard[1]); /*チャンネル情報取得*/
    const field = await dashboard.generation(dashboardGuild); /*フィールド生成*/
    channel.messages.fetch(data.dashboard[0])
        .then((dashboard) => {
            const newEmbed = new EmbedBuilder()
                .setColor(0x00A0EA)
                .setTitle('NIT,Kisarazu College 22s ダッシュボード')
                .setAuthor({
                    name: "釧路高専22s統合管理BOT",
                    iconURL: 'https://cdn.discordapp.com/attachments/1094104877266894868/1094124874844356608/Orange_Modern_Logo.png',
                    url: 'https://github.com/kqnade/22sbot'
                })
                .addFields(field)
                .setTimestamp()
                .setFooter({text: 'Developed by NITKC22s server Admin'});

            dashboard.edit({embeds: [newEmbed]});
        })
        .catch((error) => {
            console.error(`メッセージID ${messageId} のダッシュボードを取得できませんでした: ${error}`);
        });
});

cron.schedule('*/1  * * * *', async () => {
    let dayOfWeek = new Date().getDay() + 1;
    //timetable == trueのとき
    let timetable = JSON.parse(await fs.promises.readFile(config.configPath, "utf-8")).timetable
    if (timetable === true) {
        (await (client.channels.cache.get(config.M) ?? await client.channels.fetch(config.M))
            .send({ embeds: [timetableBuilder(Classes.M, dayOfWeek)] }));
        (await (client.channels.cache.get(config.E) ?? await client.channels.fetch(config.E))
            .send({ embeds: [timetableBuilder(Classes.E, dayOfWeek)] }));
        (await (client.channels.cache.get(config.D) ?? await client.channels.fetch(config.D))
            .send({ embeds: [timetableBuilder(Classes.D, dayOfWeek)] }));
        (await (client.channels.cache.get(config.J) ?? await client.channels.fetch(config.J))
            .send({ embeds: [timetableBuilder(Classes.J, dayOfWeek)] }));
        (await (client.channels.cache.get(config.C) ?? await client.channels.fetch(config.C))
            .send({ embeds: [timetableBuilder(Classes.C, dayOfWeek)] }));
    }
    console.log("timetable sent");
});


client.login(config.token);
