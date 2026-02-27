// Google Apps Script backend V2
var FOLDER_ID = "YOUR_GOOGLE_DRIVE_FOLDER_ID_HERE";
var SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";
var MAIN_SHEET_NAME = "Sheet1";
var MASTER_SHEET_NAME = "MasterData";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    
    var dateOnCourier = data.dateOnCourier;
    var partyName = data.partyName;
    var handlerName = data.handlerName;
    var location = data.location;
    var aboutCourier = data.aboutCourier;
    
    var imageBase64 = data.imageBase64;
    var imageName = "Courier_" + new Date().getTime() + ".jpg";
    var mimeType = "image/jpeg";
    
    // 1. Save Image to Google Drive
    var folder = DriveApp.getFolderById(FOLDER_ID);
    var base64Data = imageBase64;
    var commaIndex = imageBase64.indexOf(',');
    if (commaIndex > -1) {
      base64Data = imageBase64.substring(commaIndex + 1);
    }
    
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, mimeType, imageName);
    
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    var fileUrl = file.getUrl();
    
    // 2. Append Data to Google Sheets
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(MAIN_SHEET_NAME);
    
    var automaticDate = new Date();
    
    // Updated row structure: Timestamp, Date on Courier, Party, Handler, Location, About, Image URL
    sheet.appendRow([
      automaticDate,
      dateOnCourier,
      partyName,
      handlerName,
      location,
      aboutCourier,
      fileUrl
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileUrl: fileUrl,
      message: "Data saved successfully"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var masterSheet = ss.getSheetByName(MASTER_SHEET_NAME);
    
    if (!masterSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "MasterData sheet not found"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var data = masterSheet.getDataRange().getValues();
    // Assuming Column A: Party, B: Handler, C: Location
    // Skip header row
    var parties = [];
    var handlers = [];
    var locations = [];
    
    for (var i = 1; i < data.length; i++) {
      if (data[i][0]) parties.push(data[i][0]);
      if (data[i][1]) handlers.push(data[i][1]);
      if (data[i][2]) locations.push(data[i][2]);
    }
    
    // Return unique values
    var response = {
      parties: [...new Set(parties)],
      handlers: [...new Set(handlers)],
      locations: [...new Set(locations)]
    };
    
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
