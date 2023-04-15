var fs = require('fs');

const args = process.argv.slice(2);
const inputJSON = args[0];
const $ = JSON.parse(fs.readFileSync(inputJSON));
const EXCLUDE_SLUGS = ['AUSSTELLUNG'];
const LOOKUP_CITY = 'Aachen';

const $sorted = $.filter(item => {
  const slugs = item.categorySlugs;
  const matches = slugs.filter(slug =>
    EXCLUDE_SLUGS.includes(slug.toUpperCase()),
  );
  return matches.length == 0;
})
  .filter(item => item.place.includes(LOOKUP_CITY))
  .sort(
    (a, b) => new Date(b.startDate.startDate) - new Date(a.startDate.startDate),
  );

const events = $sorted.map(item => {
  const slugs = item.categorySlugs
    .map(text => text.toUpperCase().replace(' ', '_'))
    .join(' #');
  const message = `<a href="https://klenkes.de${
    item.url
  }">${item.startDate.text.replace('Heute, ', '')}</a> @ <code>${
    item.place
  }</code>: \n <b>${item.title}</b> #${slugs}`;
  return message;
});

const now = new Date().toGMTString().slice(0, 12);

const output = `Hey, <code>${now}</code> are ${
  events.length
} events im Aachen: \n\n${events.slice(0, 10).join('\n\n')}`;

// console.log(output, output.length);
process.stdout.write(encodeURIComponent(output));
