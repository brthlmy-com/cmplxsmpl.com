#!/usr/bin/env node

const parser = require("ua-parser-js");

// data is piped in from shell
// since curl is easier than https.get
let data = "";
process.stdin.resume();
process.stdin.on("data", (d) => (data += d));
process.stdin.on("end", () => {
  let entries;
  try {
    entries = JSON.parse(data);
  } catch (error) {
    console.error("JSON parse failed");
    console.error(data);
    process.exit(1);
  }
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 1);
  cutoff.setHours(0, 0, 0, 0);

  let csv =
    "url,device,browser,browser_version,engine,engine_version,os,os_version,timestamp\n";

  for (let { url, ua, timestamp } of entries) {
    if (new Date(timestamp) < cutoff) continue;
    const { browser, engine, os, device } = parser(ua);
    csv +=
      [
        url,
        device.type,
        browser.name,
        browser.version,
        engine.name,
        engine.version,
        os.name,
        os.version,
        timestamp,
      ].join(",") + "\n";
    // i.e. += each value separated by commas, then a new line
  }
  // just write csv to stdout so we can redirect to new file in shell
  process.stdout.write(csv);
});
