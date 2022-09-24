const { GoogleSpreadsheet } = require("google-spreadsheet");
const {
  GOOGLE_SERVICE_ACCOUNT_EMAIL,
  GOOGLE_PRIVATE_KEY,
  SPREADSHEET_ID,
  SPREADSHEET_SHEET_FORM_TITLE,
  APEX_DOMAIN
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

exports.handler = async (event, context) => {
  if (
    GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    GOOGLE_PRIVATE_KEY &&
    SPREADSHEET_ID &&
    SPREADSHEET_SHEET_FORM_TITLE &&
    APEX_DOMAIN
  ) {
    if (!event.body || event.httpMethod !== "POST") {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type"
        },
        body: JSON.stringify({
          status: "invalid-method"
        })
      };
    }

    try {
      console.log(event, context);
      // form
      const timestamp = new Date().toISOString();

      const { headers: eventHeaders, body: formData } = event;
      const { host } = eventHeaders;

      const {
        referer = `https://${host}`,
        "user-agent": ua,
        "x-language": locale,
        "x-country": country
      } = eventHeaders;

      // block request, based on referer
      const { host: hostReferer } = new URL(referer);
      const refererApexDomain = hostReferer.replace("www.", "");

      if (refererApexDomain !== APEX_DOMAIN) {
        return {
          statusCode: 418,
          body: JSON.stringify({ status: "I'm a teapot" })
        };
      }

      const { "form-name": formName, ...parsedFormData } = JSON.parse(formData);

      const row = { timestamp, formName, parsedFormData, country, locale, ua };

      // google-spreadsheet
      const client_email = GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const private_key = GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n");

      const doc = new GoogleSpreadsheet(SPREADSHEET_ID);
      await doc.useServiceAccountAuth({ client_email, private_key });
      await doc.loadInfo();

      // store
      const sheet = doc.sheetsByTitle[SPREADSHEET_SHEET_FORM_TITLE];
      const addedRow = await sheet.addRow(row);
    } catch (error) {
      console.error(error);
      return {
        statusCode: error.statusCode || 500,
        body: JSON.stringify({
          error: error.message
        })
      };
    }
  } else {
    console.log(
      `[ENV] GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY && SPREADSHEET_ID && SPREADSHEET_SHEET_FORM_TITLE && APEX_DOMAIN`
    );
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      result: "true"
    })
  };
};
