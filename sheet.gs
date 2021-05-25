function dumpSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const now = new Date();
  const newSheetName = sheetName + "-" + now.getFullYear() + ("0" + (now.getMonth() + 1)).slice(-2);
  console.log("copy from " + sheetName + "->" + newSheetName);

  const newSheet = ss.getSheetByName(newSheetName);
  if (newSheet) {
    ss.deleteSheet(newSheet);
  }

  const origin = ss.getSheetByName(sheetName);
  if (origin) {
    origin.setName(newSheetName);
  }
}

function setTableAppearance(s) {
  // 交互の背景色を設定
  const b = s.getBandings();
  for (key in b) {
    // すでに交互の背景色が設定されている場所には、交互の背景色を設定できないので一回消す
    b[key].remove();
  }
  s.getRange(1, 1, s.getLastRow(), s.getLastColumn()).applyRowBanding(SpreadsheetApp.BandingTheme.BLUE);
}

function prettyDialogue() {
  // どっから引っ張ってきた召喚口上のテキストをいい感じで改行していく
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("VRAINS");

  for (i = 1; i <= s.getLastRow(); i++) {
    const text = s.getRange(i, 1).getValue();
    console.log(text);

    s.getRange(i, 3).setValue(text.replace(/\s+/g, "").replace(/！/g, "！\n").trim());
  }
}

function extractMonster() {
  // 召喚口上最終行をモンスター名として抜き出す
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("summon");
  for (i = 1; i <= s.getLastRow(); i++) {
    if (s.getRange(i, 5).getValue() == "") {
      const v = s.getRange(i, 3).getValue().split("\n");
      console.log(v[v.length - 1].replace(/！/g, ""));
      s.getRange(i, 5).setValue(v[v.length - 1].replace(/！/g, ""));
    }
  }
}

function searchCID() {
  // モンスター名からcidを検索
  const cs = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("cards");
  const values = cs.getRange(2, 1, cs.getLastRow(), 2).getValues();
  const cids = {}
  for (key in values) {
    const v = values[key];
    cids[v[1]] = v[0];
  }

  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("summon");
  for (i = 1; i <= s.getLastRow(); i++) {
    if (s.getRange(i, 4).getValue() == "") {
      const name = s.getRange(i, 5).getValue();
      console.log("name:" + name + " cid:" + cids[name]);
      const cid = cids[name];
      if (cid !== undefined) {
        s.getRange(i, 4).setValue(cids[name]);
      }
    }
  }
}
