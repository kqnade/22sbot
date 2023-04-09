const { SlashCommandBuilder, EmbedBuilder , version} = require('discord.js');
const packageVer = require('../package.json');
const {setTimeout} = require ("node:timers/promises");
require('date-utils');


module.exports =
    [
        {
            data: new SlashCommandBuilder()
                .setName('help')
                .setDescription('このBOTのヘルプを表示します'),
            async execute(interaction) {
                const commands = require('../botmain')
                const embed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('ヘルプ')
                    .setAuthor({
                        name: "釧路高専22s統合管理BOT",
                        iconURL: 'https://cdn.discordapp.com/attachments/1094104877266894868/1094124874844356608/Orange_Modern_Logo.png',
                        url: 'https://github.com/kqnade/22sbot'
                    })
                    .setDescription('現在実装されているコマンド一覧です')
                    .addFields(
                        commands.map(e => ({ name: '/' + e.data.name, value: e.data.description }))
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Developed by NITKC22s server Admin' });
                await interaction.reply({ embeds: [embed] });
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('about')
                .setDescription('このBOTの概要を表示します'),
            async execute(interaction) {
                const embed = new EmbedBuilder()
                    .setColor(0x00A0EA)
                    .setTitle('NITKC統合管理BOT概要')
                    .setAuthor({
                        name: "釧路高専22s統合管理BOT",
                        iconURL: 'https://cdn.discordapp.com/attachments/1094104877266894868/1094124874844356608/Orange_Modern_Logo.png',
                        url: 'https://github.com/kqnade/22sbot'
                    })
                    .setDescription('このbotの概要を紹介します')
                    .addFields(
                        [
                            {
                                name: 'バージョン情報',
                                value: 'v' + packageVer.version,
                            },
                            {
                                name: '開発者',
                                value: '開発は、K4nade([github.com/kqnade](https://github.com/kqnade))が行っています',
                            },
                            {
                                name: '搭載機能',
                                value: '時間割通知/閲覧機能\nダッシュボード機能\npingコマンド機能',
                            },
                            {
                                name: '実行環境',
                                value: 'node.js v' + process.versions.node + `\n discord.js v` + version,

                            },
                        ]
                    )
                    .setTimestamp()
                    .setFooter({ text: 'Developed by NITKC22s' });
                await interaction.reply({ embeds: [embed] });
            },
        },
        {
            data: new SlashCommandBuilder()
                .setName('ping')
                .setDescription('このBOTのpingを測定します'),
            async execute(interaction) {
                await interaction.reply( `Ping : ${interaction.client.ws.ping}ms` );
            },
        }
    ]
