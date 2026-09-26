/** Никита и Ксения · гостевая анкета. Развернуть как веб-приложение от имени владельца, доступ: все. */
const SHEET_PROPERTY = 'WEDDING_RESPONSE_SHEET_ID';
const HEADERS = ['Дата ответа','Имя','Присутствие','Напитки','Крепкие напитки — уточнение','Особенности питания','Проживание','Музыкальное пожелание','Комментарий','Request ID'];

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Никита и Ксения · 24 июля 2027')
    .addMetaTag('viewport','width=device-width, initial-scale=1');
}

function getResponseSheet_() {
  const properties = PropertiesService.getScriptProperties();
  let id = properties.getProperty(SHEET_PROPERTY);
  let spreadsheet;
  if (id) { spreadsheet = SpreadsheetApp.openById(id); }
  else {
    spreadsheet = SpreadsheetApp.create('Никита и Ксения · ответы гостей · 24.07.2027');
    const sheet = spreadsheet.getSheets()[0];
    sheet.setName('Ответы');
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#dfe4d8');
    sheet.setColumnWidths(1,HEADERS.length,175);
    properties.setProperty(SHEET_PROPERTY, spreadsheet.getId());
  }
  return spreadsheet.getSheetByName('Ответы');
}

function safe_(value, maxLength) {
  const s = String(value || '').trim().slice(0,maxLength);
  return /^[=+@\-\t\r]/.test(s) ? "'"+s : s;
}

function saveRsvp(data) {
  if (!data || typeof data !== 'object') throw new Error('Некорректная анкета.');
  const name = safe_(data.name,120);
  const attendance = data.attendance;
  const requestId = safe_(data.requestId,100);
  if (name.length < 3 || !/[А-Яа-яA-Za-z]/.test(name) || !['yes','no'].includes(attendance) || !requestId) throw new Error('Заполните обязательные поля.');
  if (attendance === 'yes' && (!data.drinks || !['Да','Нет','Пока не уверен(а)'].includes(data.lodging))) throw new Error('Заполните напитки и проживание.');
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sheet = getResponseSheet_();
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const ids = sheet.getRange(2,10,lastRow-1,1).getDisplayValues();
      if (ids.some(row => row[0] === requestId)) return {ok:true,duplicate:true};
    }
    sheet.appendRow([new Date(),name,attendance === 'yes'?'Буду':'Не смогу',safe_(data.drinks,200),safe_(data.strong,120),safe_(data.food,500),safe_(data.lodging,40),safe_(data.song,120),safe_(data.comment,500),requestId]);
    return {ok:true};
  } finally {lock.releaseLock();}
}
