# cmplxsmpl.com

This repository is hosted on netlify.com, and uses the netlify functions
to provide services for the static website that is hosted on a
virtual private server.

[![Netlify Status](https://api.netlify.com/api/v1/badges/f5420774-3428-4a6d-8e33-7211754dbd62/deploy-status)](https://app.netlify.com/sites/cmplxsmplcom/deploys)

## Netlify functions

This repository contains the following netlify functions:

* `doorbell` - records a visit in a google spreadsheet
* `analytics` - returns the visits from the google spreadsheet of yesterday
* `form` - saves a submitted form

## Github workflows
This repository contains the following github workflows

* `analytics` - runs daily, fetches the visits of yesterday and
   writes a csv file with the visits of yesterday

## Github secrets

The `analytics` github workflow needs the following github secrets:

* `ANALYTICS_URL` - endpoint to call for visits of yesterday, used in the github action
* `ANALYTICS_ACCESS_TOKEN` - access token to call netlify function analytics,
   used in the github action

## Netlify secrets

* `APEX_DOMAIN`, eg. `example.com`

`doorbell`, `form`, `analytics` needs the following netlify secrets:

* `GOOGLE_SERVICE_ACCOUNT_EMAIL`
* `GOOGLE_PRIVATE_KEY`
* `SPREADSHEET_ID`

`doorbell` needs the following netlify secrets:

* `SPREADSHEET_SHEET_TITLE`

`form` needs the following netlify secrets:

* `SPREADSHEET_SHEET_FORM_TITLE`

`analytics` needs the following netlify secrets:

* `ANALYTICS_ACCESS_TOKEN` (same as Github secret)

## Netlify functions security

* `doorbell` & `form`: parses the `event.referer` which need to be present and
   matches the `APEX_DOMAIN` in netlify secrets.

* `analytics`: parses "Authorization: Bearer XXX" to match `ANALYTICS_ACCESS_TOKEN`

## Helpers

Use the following snippet to create `ANALYTICS_ACCESS_TOKEN`:

```
$ echo $RANDOM | md5sum | head -c 33; echo;
```
