var cheerio = require('cheerio');
var fs = require('fs');

const args = process.argv.slice(2);
const inputHtml = args[0];
const $ = cheerio.load(fs.readFileSync(inputHtml));

const events = [];
$('*[itemprop="event"]').each((index, element) => {
  const $elm = $(element);

  const url = $elm.find('[itemprop="url"]').attr('content');
  const title = $elm.find('[itemprop="name"]').text();
  const startDate = $elm.find('[itemprop="startDate"]').attr('content');
  const endDate = $elm.find('[itemprop="endDate"]').attr('content');
  const image = $elm.find('[itemprop="image"]').attr('content');

  const $place = $elm.find('[itemprop="location"]');

  const place_name = $place.find('[itemprop="name"]').attr('content');
  const place_city = $place
    .find('[itemprop="addressLocality"]')
    .attr('content');
  const place_country = $place
    .find('[itemprop="addressCountry"]')
    .find('[itemprop="name"]')
    .attr('content');

  const $lineup = $elm.find('.lineuprow td a');
  const lineup = [];

  if ($lineup.length > 0) {
    const a = $lineup.each((i, elm) => {
      const $elm = $(elm);
      lineup.push({ name: $elm.text(), href: $elm.attr('href') });
    });
  }

  events.push({
    title,
    url,
    image,
    startDate: {
      startDate,
      endDate,
    },
    place: {
      name: place_name,
      city: place_city,
      country: place_country,
    },
    lineup,
  });
});

process.stdout.write(JSON.stringify(events, null, 4));
