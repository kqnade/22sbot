const { SlashCommandBuilder } = require('discord.js')

const  timetableBuilder  = require('../timetable/timetableUtils')
const fs = require('fs');
const {configPath}=require("../environmentConfig")
module.exports = [
    {
        data: new SlashCommandBuilder()
            .setName('timetable')
            .setDescription('指定した分野・曜日の時間割を送信します')
            .addStringOption(option =>
                option
                    .setName('分野')
                    .setDescription('分野を指定します')
                    .setRequired(true)
                    .addChoices(
                        { name: 'M-機械工学分野', value: 'M' },
                        { name: 'E-電気工学分野', value: 'E' },
                        { name: 'D-電子工学分野', value: 'D' },
                        { name: 'J-情報工学分野', value: 'J' },
                        { name: 'A-建築学分野', value: 'A' },
                    )
            )
            .addStringOption(option =>
                option
                    .setName('曜日')
                    .setDescription('曜日を指定します。指定なければ次の学校の日になります。')
                    .setRequired(false)
                    .addChoices(
                        { name: '月曜日', value: '1' },
                        { name: '火曜日', value: '2' },
                        { name: '水曜日', value: '3' },
                        { name: '木曜日', value: '4' },
                        { name: '金曜日', value: '5' },
                    )
            ),

        async execute(interaction) {

            // get strings from options 分野
            const bunya = interaction.options.getString('分野');
            // get strings from options 曜日
            let dt = new Date();
            let dayOfWeek = dt.getDay();
            let hours = dt.getHours();
            if (interaction.options.getString('曜日') === '1') {
                dayOfWeek = 1;
            } else if (interaction.options.getString('曜日') === '2') {
                dayOfWeek = 2;
            } else if (interaction.options.getString('曜日') === '3') {
                dayOfWeek = 3;
            } else if (interaction.options.getString('曜日') === '4') {
                dayOfWeek = 4;
            } else if (interaction.options.getString('曜日') === '5') {
                dayOfWeek = 5;
            } else {
                if (hours >= 17) {
                    dayOfWeek += 1;
                }
                if (dayOfWeek === 6 || dayOfWeek === 7 || dayOfWeek === 0) {
                    dayOfWeek = 1;
                }
            }
            
            // make timetable embed with timetableBuilder
            
            const embed = timetableBuilder(bunya, dayOfWeek);


            await interaction.reply({ embeds: [embed] });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('tt-switcher')
            .setDescription('時間割定期送信のON/OFFを切り替えます')
            //特定ロールを持つ人のみ実行可能にする
            .setDefaultMemberPermissions(1<<3)
            .addBooleanOption(option =>
                option
                    .setName('options')
                    .setDescription('定期実行の可否を指定します')
                    .setRequired(true)
            ),

        async execute(interaction) {
            const date = JSON.parse(fs.readFileSync(configPath, 'utf8'))  //ここで読み取り
            date.timetable = interaction.options.data[0].value
            fs.writeFileSync(configPath, JSON.stringify(date,null ,"\t")) //ここで書き出し
            await interaction.reply({ content: "時間割定期通知機能を" + interaction.options.data[0].value + "に設定しました", ephemeral: true });
        },
    },
    {
        data: new SlashCommandBuilder()
            .setName('tt-channel-set')
            .setDescription('時間割を送信するチャンネルを設定します')
            .setDefaultMemberPermissions(1<<3)
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription('時間割を送信するチャンネルを指定します')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('分野')
                    .setDescription('分野を指定します')
                    .setRequired(true)
                    .addChoices(
                        { name: 'M-機械工学分野', value: 'M' },
                        { name: 'E-電気工学分野', value: 'E' },
                        { name: 'D-電子工学分野', value: 'D' },
                        { name: 'J-情報工学分野', value: 'J' },
                        { name: 'A-建築学分野', value: 'A' },
                    )
            ),

        async execute(interaction) {
            //overwrite config json file
            //if 分野 value is "M"
            const data = JSON.parse(fs.readFileSync(configPath, 'utf8'))  //ここで読み取り
            if (interaction.options.getString("分野") === "M") {
                const channelID = interaction.options.getChannel("channel").id
                data.timetableChannel.M = channelID
                fs.writeFileSync(configPath, JSON.stringify(data)) //ここで書き出し
                await interaction.reply({ content: "時間割を送信するチャンネルを<#" + channelID + ">に設定しました", ephemeral: true });
            } else if (interaction.options.getString("分野") === "E") {
                const channelID = interaction.options.getChannel("channel").id
                data.timetableChannel.E = channelID
                fs.writeFileSync(configPath, JSON.stringify(data)) //ここで書き出し
                await interaction.reply({ content: "時間割を送信するチャンネルを<#" + channelID + ">に設定しました", ephemeral: true });
            } else if (interaction.options.getString("分野") === "D") {
                const channelID = interaction.options.getChannel("channel").id
                data.timetableChannel.D = channelID
                fs.writeFileSync(configPath, JSON.stringify(data)) //ここで書き出し
                await interaction.reply({ content: "時間割を送信するチャンネルを<#" + channelID + ">に設定しました", ephemeral: true });
            } else if (interaction.options.getString("分野") === "J") {
                const channelID = interaction.options.getChannel("channel").id
                data.timetableChannel.J = channelID
                fs.writeFileSync(configPath, JSON.stringify(data)) //ここで書き出し
                await interaction.reply({ content: "時間割を送信するチャンネルを<#" + channelID + ">に設定しました", ephemeral: true });
            } else if (interaction.options.getString("分野") === "A") {
                const channelID = interaction.options.getChannel("channel").id
                data.timetableChannel.A = channelID
                fs.writeFileSync(configPath, JSON.stringify(data)) //ここで書き出し
                await interaction.reply({ content: "時間割を送信するチャンネルを<#" + channelID + ">に設定しました", ephemeral: true });
            }    
        }


    }


]
