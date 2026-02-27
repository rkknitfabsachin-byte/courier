# Courier Tracking Web App V2 - Setup Instructions

This updated version includes dynamic dropdowns for Party, Handler, and Location, plus a new "About Courier" notes field. 

## 1. Google Sheets Setup (CRITICAL)
1. Open your "Courier Tracking" Google Sheet.
2. In the main sheet (typically `Sheet1`), update row 1 with these headers:
   - A1: `Timestamp`
   - B1: `Date on Courier`
   - C1: `Party Name`
   - D1: `Handler Name`
   - E1: `Location`
   - F1: `About Courier`
   - G1: `Image URL`
3. Click the **"+" (plus icon)** at the bottom left to create a **New Sheet**.
4. Rename this new sheet to **`MasterData`**.
5. In your `MasterData` sheet:
   - **Column A:** Add your list of **Party Names**.
   - **Column B:** Add your list of **Handlers**.
   - **Column C:** Add your list of **Storage Locations**.
   *(Note: Add headers in row 1 of `MasterData` as well: `Parties`, `Handlers`, `Locations`)*

## 2. Update and Re-deploy Google Apps Script
1. Open your [Google Apps Script project](https://script.google.com/).
2. Copy the contents of the new `Code.gs` from your local folder and paste it into the editor.
3. Keep your `FOLDER_ID` and `SHEET_ID` at the top of the script.
4. Click **Deploy > Manage deployments**.
5. Edit the active deployment and set **Version** to **New Version**. 
6. Ensure "Execute as" is **Me** and "Who has access" is **Anyone**.
7. Click **Deploy**.

## 3. Verify Frontend
1. Open `index.html` in your browser.
2. You will see a "Fetching master data..." overlay while it loads the lists from your spreadsheet.
3. The dropdowns for Party, Handler, and Location should now be populated with the items you wrote in the `MasterData` sheet!

## 4. Design Aesthetics
The UI has been redesigned to be a clean, white, work-oriented interface with a focus on efficiency and readability.
