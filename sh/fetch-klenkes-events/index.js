var cheerio = require('cheerio');
var fs = require('fs');

const args = process.argv.slice(2);
const inputHtml = args[0];
const $ = cheerio.load(fs.readFileSync(inputHtml));
const today = new Date().toISOString().slice(0, 10);

if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function(str, newStr) {
    // If a regex pattern
    if (
      Object.prototype.toString.call(str).toLowerCase() === '[object regexp]'
    ) {
      return this.replace(str, newStr);
    }

    // If a string
    return this.replace(new RegExp(str, 'g'), newStr);
  };
}

const categoriesFromUrl = url => {
  const categories = url.split('/event/')[0];
  const slugs = categories.split('/').filter(item => item.length > 0);

  return slugs;
};

const extractDatetime = text => {
  // Heute, 09:00 - 17:00 Uhr
  // Heute, 09:00
  const matchRegex = text.match(
    '([0-9]{0,2}:[0-9]{0,2} - [0-9]{0,2}:[0-9]{0,2}) |([0-9]{0,2}:[0-9]{0,2})',
  );

  if (!matchRegex)
    return {
      startDate: today,
      text: text
    };

  switch (matchRegex[0].length) {
    case 14:
      // 09:00 - 17:00 Uhr
      const startDate = matchRegex[1].split('-')[0].trim();
      const endDate = matchRegex[1].split('-')[1].trim();
      return {
        startDate: new Date(`${today}T${startDate}:00Z`),
        endDate: new Date(`${today}T${endDate}:00Z`),
        text: text
      };
      break;
    case 5:
      // 09:00
      return {
        startDate: new Date(`${today}T${matchRegex[0]}:00Z`),
        text: text
      };
      break;
    default:
    // all day
  }
};

const cleanString = text => text.replaceAll(/  +/g, '').trim();

const events = [];
$('a[data-fancybox="day-calendar"]').each((index, element) => {
  const $elm = $(element);

  const url = $elm.attr('href');
  const title = $elm.attr('data-title');
  const categorySlugs = categoriesFromUrl(url);
  const image = $elm.find('.lazy:nth(0)').attr('data-image');
  const startDate = $elm.find('p.p-data:nth(0)').text();
  const place = $elm.find('p.p-data:nth(1)').text();

  events.push({
    title,
    url,
    startDate: extractDatetime(startDate),
    place: cleanString(place),
    categorySlugs,
    image,
  });
});

process.stdout.write(JSON.stringify(events, null, 4));
