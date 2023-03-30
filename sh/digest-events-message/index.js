var fs = require('fs');

const args = process.argv.slice(2);
const inputJSON = args[0];
const $ = JSON.parse(fs.readFileSync(inputJSON));

const $sorted = $.filter(item => item.startDate).sort((a,b) => b.startDate.startDate - a.startDate.startDate);

const events = $sorted.map(item => {
  const slugs = item.categorySlugs.map(text => text.toUpperCase()).join(' #');
  const message = `${item.startDate.text}: <b>${item.title}</b> #${slugs} @[${item.place}]`;
  return message;
});

const output = events.slice(0,12).sort().join('\n\n');

process.stdout.write(encodeURIComponent(output));
