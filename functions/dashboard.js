const fs = require("fs");
const {configPath} = require("../environmentConfig");
const axios = require('axios');
const { max } = require("moment/moment");


function getMaxRainChance(forecast) {
  // 6時間ごとの降水確率の配列を作成する
  const rainChances = [
    forecast.chanceOfRain.T00_06,
    forecast.chanceOfRain.T06_12,
    forecast.chanceOfRain.T12_18,
    forecast.chanceOfRain.T18_24,
  ];

    const maxPercentage = Math.max(
  ...rainChances.map(p => {
    const percentage = parseInt(p);
    return Number.isNaN(percentage) ? -Infinity : percentage;
  })
);    

    return maxPercentage;

} 


async function getWeather() {
    const response = await fetch('https://weather.tsukumijima.net/api/forecast/city/015010');
    const data = await response.json();
    return data;
}

/*日数カウント*/
function diffInMonthsAndDays(from, to) {
    if(from > to) {
        [from, to] = [to, from];
    }
    const fromDate = new Date(from);
    let toDate = new Date(to);
    let months=0,days;
    let daysInMonth;
    if (toDate.getFullYear() % 4 === 0 && toDate.getFullYear() % 4 !== 0) {
        daysInMonth = [31, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30]; /*前の月が何日であるかのリスト*/
    } else if (toDate.getFullYear() % 400 === 0) {
        daysInMonth = [31, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30];
    } else {
        daysInMonth = [31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30];
    }

    if(toDate.getFullYear() - fromDate.getFullYear() >= 1) { /*12ヶ月以上あるなら、その分加算*/
        months += (toDate.getFullYear() - fromDate.getFullYear() - 1) *12
    }
    months += 12 * (toDate.getFullYear() - fromDate.getFullYear()) + (toDate.getMonth() - fromDate.getMonth())

    if(fromDate.getDate() > toDate.getDate()) {
        days = daysInMonth[toDate.getMonth()] - fromDate.getDate() + toDate.getDate()
        months -= 1;
    }
    else{
        days = toDate.getDate() - fromDate.getDate();
    }

    return [ months, days ];
}

exports.generation = async function func(guild) {
    /*現在時刻を取得*/
    const date = new Date();
    const time = date.toFormat('YYYY年 MM月DD日 HH24:MI:SS').toLocaleString({ timeZone: 'Asia/Tokyo' });

    

    /*bot及びユーザーの人数を取得*/
    const members = await guild.members.fetch({withPresences: true});
    const user = members.filter(member => member.user.bot === false).size;
    const online = members.filter(member => member.presence && member.presence.status !== "offline" && member.user.bot === false).size;
    const botOnline = members.filter(member => member.presence && member.presence.status !== "offline" && member.user.bot === true).size;

    /*定期テスト*/
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    let test, UNIXtest, testStart, testEnd;
    let now = Date.now() + 32400000;
    if (data.nextTest[0][0] === 0) {
        test = "現在設定されている次のテストはありません。"
        for (let i = 0; i < 3; i++) {
            data.nextTest[i] = data.nextTest[i + 1]
        }
        data.nextTest[3] = [0, 0, 0, 0, 0]
    } else {
        UNIXtest = Date.UTC(data.nextTest[0][0], data.nextTest[0][1] - 1, data.nextTest[0][2], 8, 50, 0);
        testStart = Date.UTC(data.nextTest[0][0], data.nextTest[0][1] - 1, data.nextTest[0][2], 0, 0, 0);
        testEnd = Date.UTC(data.nextTest[0][0], data.nextTest[0][3] - 1, data.nextTest[0][4], 15, 0, 0);
        if (now > testStart) {
            if (now > testEnd) { /*テストが終了してたら*/
                for (let i = 0; i < 3; i++) {
                    data.nextTest[i] = data.nextTest[i + 1]
                }
                data.nextTest[3] = [0, 0, 0, 0, 0]
                if (data.nextTest[0][0] === 0) {
                    test = "現在設定されている次のテストはありません。"
                }
            } else {
                if (now > testEnd - 86400000) { /*最終日なら*/
                    test = 'テスト最終日です'
                } else {
                    test = `テスト${Math.floor((now - testStart) / 86400000 + 1)}日目です(〜${data.nextTest[0][3]}月${data.nextTest[0][4]}日)`

                }
            }
        } else {
            test = `${data.nextTest[0][0]}年${data.nextTest[0][1]}月${data.nextTest[0][2]}日〜${data.nextTest[0][3]}月${data.nextTest[0][4]}日`
            let day = diffInMonthsAndDays(now, UNIXtest)
            test += `(${day[0]}ヶ月と${day[1]}日後)`
        }
    }

    /*今年度残り日数計算*/
    let year;
    if (date.getMonth() < 3) {
        year = date.getFullYear();
    } else {
        year = date.getFullYear() + 1;
    }
    const endOfTheYear = Date.UTC(year, 2, 31, 23, 59, 59);
    const remainingYear = (endOfTheYear - now);
    const remainingProportion = 20 - (remainingYear / 31557600000 * 20);
    let bar = `[`;
    for (let i = 0; i < Math.floor(remainingProportion); i++) {
        bar += `#`;
    }
    bar += `#`
    for (let i = 0; i < 20 - Math.floor(remainingProportion); i++) {
        bar += `-`;
    }
    bar += `] ${Math.floor((remainingProportion / 2) * 100) / 10}% DONE`

    /*天気取得*/
    const weatherData = await getWeather();
    let weather;
    if (!weatherData) {
        weather = "天気情報を取得できませんでした。";
    } else {
        const today = weatherData.forecasts[0];
        const tomorrow = weatherData.forecasts[1];
        

        const todayMax = today.temperature.max.celsius || '--';
        const todayMin = today.temperature.min.celsius || '--';
        const todayWeather = today.telop || '--';
        const todayRain06 = today.chanceOfRain.T00_06 || '--';
        const todayRain612 = today.chanceOfRain.T06_12 || '--';
        const todayRain1218 = today.chanceOfRain.T12_18 || '--';
        const todayRain1824 = today.chanceOfRain.T18_24 || '--';
        const todayMaxRainChance = getMaxRainChance(today);

        const tomorrowMax = tomorrow.temperature.max.celsius || '--';
        const tomorrowMin = tomorrow.temperature.min.celsius || '--';
        const tomorrowWeather = tomorrow.telop || '--';
        const tomorrowRain06 = tomorrow.chanceOfRain.T00_06 || '--';
        const tomorrowRain612 = tomorrow.chanceOfRain.T06_12 || '--';
        const tomorrowRain1218 = tomorrow.chanceOfRain.T12_18 || '--';
        const tomorrowRain1824 = tomorrow.chanceOfRain.T18_24 || '--';
        const tomorrowMaxRainChance = getMaxRainChance(tomorrow);

        weather = `今日の天気：${todayWeather}\n最高気温：${todayMax}℃ 最低気温：${todayMin}℃ \n降水確率：${todayMaxRainChance}% (${todayRain06} / ${todayRain612} / ${todayRain1218} / ${todayRain1824})\n\n明日の天気：${tomorrowWeather}\n最高気温：${tomorrowMax}℃ 最低気温：${tomorrowMin}℃ \n降水確率：${tomorrowMaxRainChance}% (${tomorrowRain06} / ${tomorrowRain612} / ${tomorrowRain1218} / ${tomorrowRain1824})\n\n発表時刻：${weatherData.publicTimeFormatted}`;
    }
    fs.writeFileSync(configPath, JSON.stringify(data, null, "\t"))
    return [
        {
            name: '更新時刻',
            value: `\`\`\`${time}\`\`\``,
        },
        {
            name: 'サーバーの人数',
            value: `\`\`\`参加人数${user}人　/　現在オンライン${online}人\`\`\``,
        },
        {
            name: '次の定期テスト',
            value: `\`\`\`${test}\`\`\``,
        },
        {
            name: '今年度残り',
            value: `\`\`\`\n${bar}\`\`\``,

        },
        {
            name: '釧路の天気(Powered by 気象庁)',
            value: `\`\`\`${weather}\`\`\``,

        }
    ]


}