# Connecting the Gift List to the Google Sheet

The site is set up to work with the existing gift sheet:
https://docs.google.com/spreadsheets/d/1lkrYqa4d8o54eCgUnWtAssoJEsurHjfulkT0S3O8ruA/edit

This part needs your own Google account (to deploy the script). Takes about 5 minutes.

## 1. Check the sheet

The script finds the header row by itself (the row with **Product Category**), and then uses
these columns by their header names — so you can move or add columns freely:

| Header | Used for |
|---|---|
| Product Category | Gift name — must match the names in `GIFT_ITEMS` in `main.js` |
| Taken? | Checkbox — ticked when a guest reserves the gift on the website |
| Name | Guest's name, filled in by the website |
| Email *(optional)* | If there's no Email column, the script adds one right after **Name** the first time a guest enters an email |

Matching ignores capital letters, spaces and punctuation, but spelling must be the same.
Things to fix in the sheet:

- Row 16 says **Humidifer** — change it to **Humidifier**.
- Rows 22–23 must read **Cat Automatic Dry Food Machine** and **Cat Automatic Wet Food Machine**.

You can still tick **Taken?** by hand (e.g. after a guest messages you on Messenger) — the
website will show that gift as reserved too.

## 2. Add the script

1. In the sheet, go to **Extensions → Apps Script**.
2. Delete any starter code in `Code.gs` and paste this in:

```javascript
// Tab that holds the gift list. Leave blank to use the first tab.
const SHEET_NAME = '';
const HIGHLIGHT_COLOR = '#d9ead3'; // light green for taken gifts

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  return SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
}

function norm_(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function isTaken_(v) {
  return v === true || String(v).toUpperCase() === 'TRUE';
}

// Finds the header row and the column of each needed header (0-based).
function getLayout_(rows) {
  for (let r = 0; r < rows.length; r++) {
    const headers = rows[r].map(norm_);
    const item = headers.indexOf('productcategory');
    if (item === -1) continue;
    return {
      headerRow: r,
      item: item,
      taken: headers.indexOf('taken'),
      name: headers.indexOf('name'),
      email: headers.indexOf('email')
    };
  }
  throw new Error('Could not find the "Product Category" header row.');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const rows = getSheet_().getDataRange().getValues();
  const layout = getLayout_(rows);
  const result = {};

  for (let i = layout.headerRow + 1; i < rows.length; i++) {
    const item = rows[i][layout.item];
    if (!item) continue;
    result[item] = {
      reserved: isTaken_(rows[i][layout.taken]),
      reservedBy: layout.name === -1 ? '' : rows[i][layout.name] || ''
    };
  }
  return json_(result);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // prevent two guests reserving the same gift at once

  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();
    const rows = sheet.getDataRange().getValues();
    const layout = getLayout_(rows);
    const wanted = norm_(data.item);

    for (let i = layout.headerRow + 1; i < rows.length; i++) {
      if (norm_(rows[i][layout.item]) !== wanted) continue;

      if (isTaken_(rows[i][layout.taken])) {
        return json_({ success: false, message: 'This gift was already reserved by someone else.' });
      }

      sheet.getRange(i + 1, layout.taken + 1).setValue(true);
      sheet.getRange(i + 1, layout.name + 1).setValue(data.name);

      if (data.email) {
        let emailCol = layout.email;
        if (emailCol === -1) {
          emailCol = layout.name + 1;
          sheet.getRange(layout.headerRow + 1, emailCol + 1).setValue('Email');
        }
        sheet.getRange(i + 1, emailCol + 1).setValue(data.email);
      }
      return json_({ success: true });
    }

    return json_({ success: false, message: 'Gift item not found in the sheet.' });
  } finally {
    lock.releaseLock();
  }
}

// Run once by hand: highlights the whole row whenever "Taken?" is ticked
// (whether by a guest on the website or by you manually).
function setupRowHighlight() {
  const sheet = getSheet_();
  const rows = sheet.getDataRange().getValues();
  const layout = getLayout_(rows);
  const firstRow = layout.headerRow + 2;
  const takenCol = columnLetter_(layout.taken + 1);
  const range = sheet.getRange(firstRow, 1, sheet.getMaxRows() - firstRow + 1, sheet.getLastColumn());

  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$' + takenCol + firstRow + '=TRUE')
    .setBackground(HIGHLIGHT_COLOR)
    .setRanges([range])
    .build();

  const rules = sheet.getConditionalFormatRules();
  rules.push(rule);
  sheet.setConditionalFormatRules(rules);
}

function columnLetter_(n) {
  let s = '';
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}
```

3. Click **Save** (the floppy disk icon), name the project something like "Gift List Backend".

## 3. Turn on row highlighting (once)

1. In the Apps Script editor, pick **setupRowHighlight** from the function dropdown at the top
   and click **Run**. Authorize it when asked (same Google warning as below).
2. Back in the sheet, tick any **Taken?** box — the whole row should turn light green. Untick it
   to test that the highlight goes away.

Run it only once. Running it again adds a duplicate rule (harmless, but you can remove extras
under **Format → Conditional formatting**). To change the color, edit that rule there.

*Manual alternative:* select `A5:I` → **Format → Conditional formatting** → "Custom formula is"
`=$G5=TRUE` → pick a fill color → **Done**.

## 4. Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Set:
   - **Execute as**: Me (your account)
   - **Who has access**: Anyone
4. Click **Deploy**.
5. It'll ask you to authorize — click through the Google warning screen ("Google hasn't verified this app" → **Advanced** → **Go to [project name] (unsafe)**). This is normal for your own scripts.
6. Copy the **Web app URL** it gives you (looks like `https://script.google.com/macros/s/AKfycb.../exec`).

## 5. Paste the URL into the site

Open `main.js`, find this line near the "Gift Reservations" section:

```javascript
const GIFT_SCRIPT_URL = 'PASTE_YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE';
```

Replace `'PASTE_YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE'` with the URL you copied, save, and
you're done. Send me the URL and I'll paste it in for you if you'd rather not edit the file
yourself.

## How it behaves after that

- The 24 gift cards are rendered from the `GIFT_ITEMS` list in `main.js`, in the same order
  as the sheet. Gifts without a photo yet (Dishwashing Machine, Water Purifier, Washing
  Machine, Dryer, Smart Fan, Tool Set) show a placeholder gift icon.
- Opening the gift list fetches the current **Taken?** status from the sheet.
- Clicking "Reserve Gift" asks for the guest's name (required) and email (optional).
- Confirming ticks **Taken?**, writes the name into **Name** (and email into **Email**), and
  the row turns green in the sheet.
- Reserved gifts show grayed out with a "Reserved" stamp on the website.
- If two people try to reserve the same gift at nearly the same time, the script's lock
  ensures only the first one succeeds; the second gets an "already reserved" message.

## Adding a new gift later

1. Add a row in the sheet.
2. Add a matching entry to `GIFT_ITEMS` in `main.js` (same name as **Product Category**).

If you ever redeploy the script (not just edit it — actually create a **new deployment**),
you'll get a new URL and will need to update `GIFT_SCRIPT_URL` again. Editing the code and
using "Manage deployments → Edit" keeps the same URL.
