const classValue = 'J';
const dayOfWeek = 2;


const timetableData = require('./timetable/timetables.json');

const classTimetables = timetableData[classValue];

console.log(classTimetables);
console.log(dayOfWeek);


if (!classTimetables) {
    console.log('指定されたクラスに対応するデータがありません');
} else {
    const timetable = classTimetables.timetables[dayOfWeek - 1];
    if (!timetable) {
        console.log('指定された曜日に対応するデータがありません');
    } else {
        timetable.forEach(({ subject, time, teacher, room }) => {
            console.log(`${time}時限`, `${subject} (${teacher})\n${room}`);
        });
    }
}
