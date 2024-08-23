#!/usr/bin/env node

const ytdl = require('@distube/ytdl-core');
const ytpl = require('@distube/ytpl');
const fs = require('fs');
const _ = require('lodash');

// data is piped in from shell
// since curl is easier than https.get
let input = '';
let output = {};

const fetchVideoInfo = async youtubeUrl => {
  const {videoDetails} = await ytdl.getInfo(youtubeUrl);

  const {
    videoId,
    viewCount,
    likes,
    dislikes,
    title,
    description,
    lengthSeconds,
    category,
    uploadDate,
    publishDate,
    isPrivate,
    isUnlisted,
    isFamilySafe,
    availableCountries,
    author: {verified, subscriber_count},
  } = videoDetails;

  const info = {
    timestamp: new Date().toISOString(),
    videoId,
    lengthSeconds,
    viewCount,
    likes,
    dislikes,
    title,
    description,
    category,
    uploadDate,
    publishDate,
    isPrivate,
    isUnlisted,
    isFamilySafe,
    verified,
    subscriber_count,
    availableCountries: availableCountries.length,
  };

  // console.log('***', info.videoId, info.timestamp, info.title);

  return info;
};

process.stdin.resume();
process.stdin.on('data', data => (input += data));
process.stdin.on('end', async () => {
  let entries = {};
  try {
    entries = JSON.parse(input);

    const ytChannelVideos = await ytpl('UC_gtVpAyiUt7vcqS5mCpVgw');
    // console.log(
      // '#',
      // ytChannelVideos.estimatedItemCount,
      // ytChannelVideos.title,
      // ytChannelVideos.id,
      // ytChannelVideos.lastUpdated,
    // );

    const ytFetched = ytChannelVideos.items.map(async ytVideo => {
      // console.log(
        // '**',
        // ytVideo.index,
        // ytVideo.title,
        // ytVideo.id,
        // ytVideo.shortUrl,
      // );
      return fetchVideoInfo(ytVideo.shortUrl);
    });

    // console.log('#', 'Fetching', ytFetched.length);

    const resolved = await Promise.all(ytFetched);

    const ytVideoIdStats = resolved.map(item => item);

    const output = ytVideoIdStats.reduce(function(result, current) {
      return Object.assign(result, {
        [current.videoId]: {[current.timestamp]: {...current}},
      });
    }, {});

    const updated = _.merge(entries, output);

    // fs.writeFileSync('./yt-stats.txt', JSON.stringify(updated, null, 4));
    process.stdout.write(JSON.stringify(updated, null, 4));
  } catch (error) {
    console.error('JSON parse failed', error);
    process.exit(1);
  }
});
