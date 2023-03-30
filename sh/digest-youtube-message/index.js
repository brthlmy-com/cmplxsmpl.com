var fs = require('fs');

const args = process.argv.slice(2);
const inputJSON = args[0];
const $ = JSON.parse(fs.readFileSync(inputJSON));

const msgTemplate = (title, viewCountChange, viewCountLast, viewCountPrev) =>
  `${title.substring(
    0,
    80,
  )}... \n P:${viewCountPrev} N:${viewCountChange}+ T:${viewCountLast} C:${(viewCountChange / viewCountLast * 100).toString().substring(0,4)}%+`;

const outputString = items =>
  items.map(item => msgTemplate(item.title, item.change, item.last, item.prev));

const ytVideos = Object.keys($).map(item => item);

const ytVideoViewCount = ytVideos.map(video => {
  const records = Object.keys($[video]);
  const lastRecord = records[records.length - 1];
  const lastWeekRecord = records[records.length - 6];
  const record = $[video][lastRecord];
  const lastWeek = $[video][lastWeekRecord];

  return {
    title: record.title,
    last: record.viewCount,
    prev: lastWeek.viewCount,
    change: record.viewCount - lastWeek.viewCount,
  };
});

const topChangeViewCount = ytVideoViewCount
  .sort((a, b) => a.change - b.change)
  .filter(item => item.last - item.prev > 0)
  .reverse()
  .slice(0, 4);

const lowViewCount = ytVideoViewCount
  .sort((a, b) => a.last - b.last)
  .slice(0, 3);

const output = `7 Days ago: \n
                ${outputString(topChangeViewCount).join('\n')}
                \n
                Low view count: \n
                ${outputString(lowViewCount).join('\n')}
`;

process.stdout.write(encodeURIComponent(output));
