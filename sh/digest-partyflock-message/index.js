var fs = require('fs');

const args = process.argv.slice(2);
const inputJSON = args[0];
const $ = JSON.parse(fs.readFileSync(inputJSON));
const pois = ['Eindhoven', 'Tilburg', 'Maastricht'];

const $sorted = $.filter(item => pois.includes(item.place.city))
  .sort((a, b) => new Date(b.startDate.startDate) - new Date(a.startDate.startDate))

const events = $sorted.map(item => {
  const lineup =
    item.lineup.length > 0
      ? `#${item.lineup
          .map(text => text.name.toUpperCase().replace(' ', '_'))
          .join(' #')}`
      : ``;
  const place = `${item.place.name}, ${item.place.city}`;
  const startDateText = new Date(item.startDate.startDate).toUTCString().slice(-12).replace(':00 GMT', ' Uhr');

  const message = `<a href="${item.url}">${startDateText}</a> @ <code>${place}</code>: \n <b>${item.title}</b> ${lineup}`;
  return message;
});

const now = new Date().toGMTString().slice(0,12);

const output = `Hey, <code>${now}</code> are ${
  events.length
} events in ${pois.join(', ')}: \n\n${events.slice(0,12).join('\n\n')}`;

// console.log(output, output.length);
process.stdout.write(encodeURIComponent(output));
