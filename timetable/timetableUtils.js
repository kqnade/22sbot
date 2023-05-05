const { EmbedBuilder } = require("discord.js");

const dayOfWeeks = [
  "日曜日",
  "月曜日",
  "火曜日",
  "水曜日",
  "木曜日",
  "金曜日",
  "土曜日",
];

module.exports = function timetableBuilder(classValue, dayOfWeek) {
  const timetableData = require("./timetables.json");
  const classTimetables = timetableData[classValue];
  const timetable = classTimetables.timetables[dayOfWeek - 1];

  if (!classTimetables) {
    return new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("エラー")
      .setDescription("指定されたクラスに対応するデータがありません")
      .setTimestamp();
  }

  const embed = new EmbedBuilder()
    .setColor(0x00bfff)
    .setTitle(`${classTimetables.name} 時間割`)
    .setDescription(
      `${dayOfWeeks[dayOfWeek]}の時間割です。\n※休講や、授業変更等がある可能性があります。`
    )
    .setThumbnail("https://i.imgur.com/d9hJ7mQ.png")
    .setTimestamp();

  timetable.forEach(({ subject, time, teacher, room }) => {
    embed.addFields({
      name: `${time}時限`,
      value: `${subject} (${teacher})\n${room}`,
      inline: false,
    });
  });

  return embed;
};
