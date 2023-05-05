const {
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
  EmbedBuilder,
  Events,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  MessageEmbed,
  ActivityType,
} = require("discord.js");
const config = require("./environmentConfig");
const timetableBuilder = require("./timetable/timetableUtils");
const timetableData = require("./timetable/timetables.json");
const Classes = require("./timetable/timetables.json");
const TxtEasterEgg = require("./functions/TxtEasterEgg.js");
const dashboard = require("./functions/dashboard.js");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const cron = require("node-cron");
require("date-utils");
const { configPath } = require("./environmentConfig");
dotenv.config();
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
  ],
  partials: [Partials.Channel],
});
module.exports.client = client;

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));
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
  client.user.setActivity("/help | 釧路高専22s", {
    type: ActivityType.Playing,
  });
  console.log("Ready!");
});

/*実際の動作*/
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) return;
  console.log("SlashCommand : " + command.data.name);
  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "おっと、想定外の事態が起きちゃった。管理者に連絡してくれ。",
      ephemeral: true,
    });
  }
});

/*TxtEasterEgg*/
client.on("messageCreate", (message) => {
  TxtEasterEgg.func(message);
});

cron.schedule("*/1  * * * *", async () => {
  //ダッシュボードの更新
  const data = JSON.parse(fs.readFileSync(configPath, "utf8"));
  const dashboardGuild = client.guilds.cache.get(
    data.dashboard[2]
  ); /*ギルド情報取得*/
  const channel = client.channels.cache.get(
    data.dashboard[1]
  ); /*チャンネル情報取得*/
  const field = await dashboard.generation(dashboardGuild); /*フィールド生成*/
  channel.messages
    .fetch(data.dashboard[0])
    .then((dashboard) => {
      const newEmbed = new EmbedBuilder()
        .setColor(0x00a0ea)
        .setTitle("NIT,Kushiro College 22s ダッシュボード")
        .setAuthor({
          name: "釧路高専22s統合管理BOT",
          iconURL: "https://i.imgur.com/d9hJ7mQ.png",
          url: "https://github.com/kqnade/22sbot",
        })
        .addFields(field)
        .setTimestamp()
        .setFooter({ text: "Developed by NITKC22s" });

      dashboard.edit({ embeds: [newEmbed] });
      console.log("dashboard updated");
    })
    .catch((error) => {
      console.error(
        `メッセージID ${messageId} のダッシュボードを取得できませんでした: ${error}`
      );
    });
});

cron.schedule("0 20 * * *", async () => {
  const data = JSON.parse(fs.readFileSync(configPath, "utf8"));
  //時間割の送信
  let dayOfWeek = new Date().getDay() + 1;
  console.log(data.timetable);
  if (data.timetable === true) {
    const channelm = client.channels.cache.get(data.Mchannel);
    const embedm = timetableBuilder("M", dayOfWeek);
    await channelm.send({ embeds: [embedm] });

    const channele = client.channels.cache.get(data.Echannel);
    const embede = timetableBuilder("E", dayOfWeek);
    await channele.send({ embeds: [embede] });

    const channeld = client.channels.cache.get(data.Dchannel);
    const embedd = timetableBuilder("D", dayOfWeek);
    await channeld.send({ embeds: [embedd] });

    const channelj = client.channels.cache.get(data.Jchannel);
    const embedj = timetableBuilder("J", dayOfWeek);
    await channelj.send({ embeds: [embedj] });

    const channela = client.channels.cache.get(data.Achannel);
    const embeda = timetableBuilder("A", dayOfWeek);
    await channela.send({ embeds: [embeda] });

    console.log("timetable sent");
  } else {
    console.log("timetable not sent");
  }
});

client.login(config.token);
