const classValue = "J";

const timetableData = require("./timetable/timetables.json");
const Classes = require("./timetable/timetables.json");

const classTimetables = timetableData[classValue];
let dayOfWeek = new Date().getDay() + 1;

console.log(classTimetables);
console.log(dayOfWeek);

//時間割の送信
timetableBuilder2("M", 1);

const { EmbedBuilder } = require("discord.js");
const dayOfWeeks = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
function timetableBuilder2(classValue, dayOfWeek) {
  const timetableData = require("./timetable/timetables.json");
  const classTimetables = timetableData[classValue];
  const timetable = classTimetables.timetables[dayOfWeek - 1];

  console.log(classTimetables);
  console.log(dayOfWeek);
  console.log(timetable);
}
