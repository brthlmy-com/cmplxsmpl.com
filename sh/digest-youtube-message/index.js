var fs = require('fs');

const args = process.argv.slice(2);
const inputJSON = args[0];
const $ = JSON.parse(fs.readFileSync(inputJSON));
const humanSeconds = (value, word = true) => {
  with (new Date(value * 1000))
    var dd = getUTCDate() - 1,
      hh = getUTCHours(),
      mm = getUTCMinutes(),
      ss = getUTCSeconds(),
      ml = getUTCMilliseconds(),
      dg = toUTCString().match(/\d{2}:\d{2}:\d{2}/);

  return word
    ? (dd ? dd + ' days ' : '') +
        (hh ? hh + ' hours ' : '') +
        (mm ? mm + ' minutes ' : '') +
        (ss ? ss + ' seconds ' : '') +
        (ml ? ml + ' miliseconds ' : '')
    : (dd ? dd + ':' : '') + dg[0] + (ml ? '.' + ml : '');
};

const ytHref = videoId => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};

const timeSince = date => {
  var seconds = Math.floor((new Date() - date) / 1000);

  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + ' years';
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + ' months';
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + ' days';
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + ' hours';
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + ' minutes';
  }
  return Math.floor(seconds) + ' seconds';
};

const buildRecord = (video, daysAgoInt) => {
  const records = Object.keys($[video]);
  const todayRecord = records[records.length - daysAgoInt];
  const today = $[video][todayRecord];

  return {
    url: ytHref(today.videoId),
    title: today.title.slice(0, 30),
    date: todayRecord,
    likes: today.likes || 0,
    subscriberCount: today['subscriber_count'],
    lengthSeconds: today.lengthSeconds,
    publishDate: today.publishDate,
    timeSince: timeSince(new Date(today.publishDate)),
    viewCount: today.viewCount,
  };
};

const ytVideos = Object.keys($).map(item => item);

const aWeekAgoVideos = ytVideos
  .filter(video => Object.keys($[video]).length > 7) // has yesterday
  .map(video => buildRecord(video, 7));

const yesterdayVideos = ytVideos
  .filter(video => Object.keys($[video]).length > 1) // has yesterday
  .map(video => buildRecord(video, 2));

const ytVideoViewCount = ytVideos.map(video => buildRecord(video, 1));

const videosTop5 = ytVideoViewCount
  .sort((a, b) => b.viewCount - a.viewCount)
  .map(
    item =>
      `${item.viewCount} | <a href="${item.url}">${item.title}</a> | ${item.timeSince}`,
  )
  .slice(0, 5)
  .join('\n\n');

const mostRecent = ytVideoViewCount.sort(
  (a, b) => new Date(b.publishDate) - new Date(a.publishDate),
);

const videosRecently = mostRecent
  .map(
    item =>
      `${item.viewCount} | <a href="${item.url}">${item.title}</a> | ${item.timeSince}`,
  )
  .slice(0, 5)
  .join('\n\n');

const channelViews = ytVideoViewCount
  .map(item => parseInt(item.viewCount))
  .reduce((a, b) => a + b, 0);

const channelViewsYesterday = yesterdayVideos
  .map(item => parseInt(item.viewCount))
  .reduce((a, b) => a + b, 0);

const channelViewsWeekAgo = aWeekAgoVideos
  .map(item => parseInt(item.viewCount))
  .reduce((a, b) => a + b, 0);

const subscriberCount = ytVideoViewCount
  .map(item => parseInt(item.subscriberCount))
  .reduce((a, b) => (b = a > b ? a : b), 0);

const contentLength = ytVideoViewCount
  .map(item => parseInt(item.lengthSeconds))
  .reduce((a, b) => a + b, 0);

const output = `#youtube #monitoring\n
https://youtube.com/@_mesotv_\n
Supported by ${subscriberCount} great humans.\n
New Video online ${mostRecent[0].timeSince} ago\n
\n
Watched ${channelViews}\n
Since Yesterday +${channelViews - channelViewsYesterday} ${channelViewsYesterday} \n
7 Days Ago +${channelViews - channelViewsWeekAgo} ${channelViewsWeekAgo} \n
\n
TotalVideo ${ytVideoViewCount.length} | #ContentHours ${humanSeconds(
  contentLength,
)}
\n \n
Recently released:\n
${videosRecently}\n
\n \n
Most watched videos:\n
${videosTop5}
`;

// console.log(
  // // changeCountVideos.length,
  // // ytVideoViewCount.length,
  // output,
  // output.length,
// );
process.stdout.write(encodeURIComponent(output));
