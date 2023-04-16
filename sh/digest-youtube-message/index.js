var fs = require('fs');

const args = process.argv.slice(2);
const inputJSON = args[0];
const $ = JSON.parse(fs.readFileSync(inputJSON));
const humanSeconds = ( value, word = true ) => {
    with( new Date( value * 1000) )
    var dd = getUTCDate() - 1,
        hh = getUTCHours(),
        mm = getUTCMinutes(),
        ss = getUTCSeconds(),
        ml = getUTCMilliseconds(),
    dg = toUTCString().match(/\d{2}:\d{2}:\d{2}/);

 return word ?
        (dd ? dd + " days " : "") +
        (hh ? hh + " hours ": "") +
        (mm ? mm + " minutes ": "") +
        (ss ? ss + " seconds ": "") +
        (ml ? ml + " miliseconds " : "" )
        :
        (dd ? dd + ":" : "") + dg[0] + (ml ? "." + ml : "");
  };

const ytVideos = Object.keys($).map(item => item);

const ytVideoViewCount = ytVideos.map(video => {
  const records = Object.keys($[video]);

  const todayRecord = records[records.length - 1];
  const twoWeeksAgoRecord = records[records.length - 14];

  const today = $[video][todayRecord];
  // twoWeeksAgoRecord does not exist, take today
  const lastWeek = twoWeeksAgoRecord
    ? $[video][twoWeeksAgoRecord]
    : {...today, likes: null, viewCount: 0};

  return {
    title: today.title.slice(0, 30),
    date: todayRecord,
    likes: today.likes || 0,
    subscriberCount: today["subscriber_count"],
    lengthSeconds: today.lengthSeconds,
    publishDate: today.publishDate,
    plusLikes: (today.likes || 0) - (lastWeek.likes || 0),
    viewCount: today.viewCount,
    plusViews: today.viewCount - lastWeek.viewCount,
    twoWeeksAgo: {
      date: twoWeeksAgoRecord,
      likes: lastWeek.likes || 0,
      viewCount: lastWeek.viewCount,
      viewerCount: today.viewCount - lastWeek.viewCount,
      data: lastWeek,
    },
  };
});

// video was watched within two weeks
const changeCountVideos = ytVideoViewCount.filter(
  item => item.viewCount - item.twoWeeksAgo.viewCount > 0,
);

// info about latest videos published
const latestViewCounts = changeCountVideos
  .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
  .map(
    item =>
      `"${item.title}" published on ${item.publishDate}, ${
        item.viewCount
      }x viewed. ${item.likes || 0} people liked`,
  );

const latestViewCountsText = latestViewCounts.slice(0, 3).join('\n\n');

const likedCountVideos = ytVideoViewCount
  .filter(item => {
    return (item.likes || 0) - (item.twoWeeksAgo.likes || 0) > 0;
  })
  .sort((a, b) => b.plusLikes - a.plusLikes);

const likedCountVideosText = likedCountVideos
  .map(
    item =>
      `"${item.title}" published on ${item.publishDate} liked ${item.likes ||
        0} people, ${item.plusLikes} more.`,
  )
  .slice(0, 3)
  .join('\n\n');

const mostViewsVideos = changeCountVideos
  .sort((a, b) => b.plusViews - a.plusViews)
  .map(
    item =>
      `"${item.title}" published on ${item.publishDate} watched x ${
        item.viewCount
      }, ${
        item.plusViews
      } more, ${item.likes ||
        0} people liked, ${item.plusLikes} more.`,
  );

const mostViews = mostViewsVideos.slice(0, 3).join('\n\n');

const todayVideos = ytVideoViewCount
  .sort((a, b) => b.viewCount - a.viewCount)
  .map(
    item =>
      `"${item.title}" published on ${item.publishDate} watched ${item.viewCount} views.`,
  )
  .slice(0, 5)
  .join('\n\n');

const totalPlusLikes = ytVideoViewCount
  .map(item => item.plusLikes)
  .reduce((a, b) => a + b, 0);

const totalPlusViews = ytVideoViewCount
  .map(item => parseInt(item.plusViews))
  .reduce((a, b) => a + b, 0);

const channelViews = ytVideoViewCount
  .map(item => parseInt(item.viewCount))
  .reduce((a, b) => a + b, 0);

const totalLikes = ytVideoViewCount
  .map(item => parseInt(item.likes))
  .reduce((a, b) => a + b, 0);

const subscriberCount = ytVideoViewCount
  .map(item => parseInt(item.subscriberCount))
  .reduce((a, b) => b = a > b ? a : b,  0);

const contentLength = ytVideoViewCount
  .map(item => parseInt(item.lengthSeconds))
  .reduce((a, b) => a + b, 0);

const output = `These are the latest 3 published videos: \n
${latestViewCountsText}\n
Compared with today and two weeks ago.\n
These received the most new likes, ${likedCountVideos.length} videos with total of ${totalPlusLikes} likes:\n
${likedCountVideosText}\n
These received the most views,  ${mostViewsVideos.length} videos watched, for a total of ${totalPlusViews} views:\n
${mostViews}\n
Of ${ytVideoViewCount.length} videos have the most views today.\n
${todayVideos}\n
Channel has ${channelViews} views, ${ytVideoViewCount.length} videos (${humanSeconds(contentLength)}), ${totalLikes} video likes and ${subscriberCount} subscribers.
`;

// console.log(
  // // changeCountVideos.length,
  // // ytVideoViewCount.length,
  // // likedCountVideos,
  // output,
  // output.length,
// );
process.stdout.write(encodeURIComponent(output));
