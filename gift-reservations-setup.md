# Connecting the Gift List to a Google Sheet

This is the one part I can't do for you — it needs your own Google account to create the
sheet and deploy the script. Takes about 5 minutes.

## 1. Create the spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new sheet.
2. Rename the first sheet tab to `Gifts` (bottom-left tab name).
3. In row 1, add these exact headers:

   | A | B | C | D |
   |---|---|---|---|
   | Item | Reserved | ReservedBy | Email |

4. Below that, add one row per gift, with the **exact same names** used in `main.js`'s
   `GIFT_ITEMS` list (case-sensitive):

   | Item | Reserved | ReservedBy | Email |
   |---|---|---|---|
   | Portable Power Station | | | |
   | Coffee Machine | | | |
   | Oven Toaster / Airfryer | | | |
   | Rice Cooker | | | |
   | Microwave | | | |
   | Blender | | | |
   | Vacuum Cleaner | | | |
   | Robot Vacuum | | | |
   | Air Purifier | | | |
   | Humidifier | | | |
   | Charging Station | | | |
   | Indoor Camera | | | |
   | Cat Automatic Dry Food Machine | | | |
   | Cat Automatic Wet Food Machine | | | |
   | Cat Water Fountain | | | |
   | Extension Cord | | | |
   | Rechargeable Battery | | | |
   | Philips Oneturn Iron Steamer | | | |

   Leave "Reserved", "ReservedBy" and "Email" blank for now — the script fills them in.

## 2. Add the script

1. In the sheet, go to **Extensions → Apps Script**.
2. Delete any starter code in `Code.gs` and paste this in:

```javascript
function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Gifts');
  const rows = sheet.getDataRange().getValues();
  const result = {};

  for (let i = 1; i < rows.length; i++) {
    const [item, reserved, reservedBy] = rows[i];
    if (!item) continue;
    result[item] = {
      reserved: reserved === true || String(reserved).toUpperCase() === 'TRUE',
      reservedBy: reservedBy || ''
    };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // prevent two guests reserving the same gift at once

  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Gifts');
    const rows = sheet.getDataRange().getValues();

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.item) {
        const alreadyReserved = rows[i][1] === true || String(rows[i][1]).toUpperCase() === 'TRUE';
        if (alreadyReserved) {
          return ContentService.createTextOutput(JSON.stringify({
            success: false,
            message: 'This gift was already reserved by someone else.'
          })).setMimeType(ContentService.MimeType.JSON);
        }

        sheet.getRange(i + 1, 2).setValue(true);              // Reserved column
        sheet.getRange(i + 1, 3).setValue(data.name);         // ReservedBy column
        sheet.getRange(i + 1, 4).setValue(data.email || '');  // Email column

        return ContentService.createTextOutput(JSON.stringify({ success: true }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Gift item not found in the sheet.'
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

3. Click **Save** (the floppy disk icon), name the project something like "Gift List Backend".

## 3. Deploy it as a Web App

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Set:
   - **Execute as**: Me (your account)
   - **Who has access**: Anyone
4. Click **Deploy**.
5. It'll ask you to authorize — click through the Google warning screen ("Google hasn't verified this app" → **Advanced** → **Go to [project name] (unsafe)**). This is normal for your own scripts.
6. Copy the **Web app URL** it gives you (looks like `https://script.google.com/macros/s/AKfycb.../exec`).

## 4. Paste the URL into the site

Open `main.js`, find this line near the "Gift Reservations" section:

```javascript
const GIFT_SCRIPT_URL = 'PASTE_YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE';
```

Replace `'PASTE_YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE'` with the URL you copied, save, and
you're done. Send me the URL and I'll paste it in for you if you'd rather not edit the file
yourself.

## How it behaves after that

- All 18 gift cards (Portable Power Station, Coffee Machine, etc.) are rendered from the
  `GIFT_ITEMS` list in `main.js`, each already pointing at its matching image in `images/`.
- Opening the gift list fetches the current reservation status from your sheet.
- Clicking "Reserve Gift" opens a popup asking for the guest's name (required) and email
  (optional) — matching the "Reserve this gift?" form you shared.
- Confirming writes the name/email into the sheet's `Reserved`/`ReservedBy`/`Email` columns
  for that row — you'll see it appear live in the spreadsheet.
- Any gift marked reserved shows grayed out (image desaturated, name dimmed), both the
  "View Gift" and "Reserve Gift" buttons disappear, and a single "✓ Reserved by [Name]"
  pill badge shows instead.
- If two people try to reserve the same gift at nearly the same time, the script's lock
  ensures only the first one succeeds; the second gets an "already reserved" message.

## Still needed

- The "View Gift" links on each card currently point to `#` (placeholder) — if you want them
  to open the actual product page (Lazada/Shopee/Amazon/etc.), send me the URLs for each item
  and I'll wire them in.

If you ever redeploy the script (not just edit it — actually create a **new deployment**),
you'll get a new URL and will need to update `GIFT_SCRIPT_URL` again. Editing the code and
using "Manage deployments → Edit" keeps the same URL.
