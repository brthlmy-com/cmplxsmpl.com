const { GoogleSpreadsheet } = require("google-spreadsheet");
const {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  SPREADSHEET_ID,
  SPREADSHEET_SHEET_FORM_TITLE
} = process.env;

function redirectUrl(url) {
  return {
    statusCode: 302,
    headers: {
      Location: url,
      "Cache-Control": "no-cache"
    },
    body: JSON.stringify({})
  };
}

function returnResponse(statusCode = 400, statusText = "invalid-method") {
  return {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type"
    },
    body: JSON.stringify({
      status: statusText
    })
  };
}

exports.handler = async (event, context) => {
  if (
    GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    GOOGLE_PRIVATE_KEY &&
    SPREADSHEET_ID &&
    SPREADSHEET_SHEET_FORM_TITLE
  ) {

    if (!event.body || event.httpMethod !== "POST") {
      returnResponse(400, "invalid-method");
    }

    try {
      // form
      const timestamp = new Date().toISOString();

      const { body: formData, headers } = event;
      const {
        "user-agent": ua,
        "x-language": locale,
        "x-country": country
      } = headers;

      const row = { timestamp, formData, country, locale, ua };

      // google-spreadsheet
      const client_email = GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const private_key = GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({ client_email, private_key });
      await doc.loadInfo();

      // store
      const sheet = doc.sheetsByTitle[SPREADSHEET_SHEET_FORM_TITLE];
      const addedRow = await sheet.addRow(row);

      // response
      returnResponse(200, 'form-submitted')

    } catch (error) {
      console.error(error);
      returnResponse(500, 'server-error')
    }
  } else {
    console.log(
      `[ENV] GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY && SPREADSHEET_ID && SPREADSHEET_SHEET_FORM_TITLE`
    );
  }
};
