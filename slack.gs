function doPost(e) {
  console.log(e);

  let text = "";
  let unfurl_links = false;
  switch (e.parameter.command) {
    case "/召喚":
      text = summon(e.parameter.text);
      break;
    case "/俺のターン":
      unfurl_links = (e.parameter.text == "ocg");
      text = drawCard();
      break;
  }

  if (e.parameter.response_url) {
    postText(e.parameter.response_url, text, unfurl_links);
  }

  // メッセージは空で返す
  return ContentService.createTextOutput();
}

function summon(filter) {
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("summon");
  const values = s.getRange('A:E').getValues().filter(
    function (value) {
      if (filter == undefined) {
        // フィルタなし
        return true;
      } else if (filter == "★") {
        // お気に入りのみ指定
        return value[1] == "★";
      } else if (filter != "") {
        // シリーズ指定
        return value[0] == filter;
      } else {
        // それ以外の文字列の場合もフィルタなし
        return true;
      }
    }
  );

  const i = Math.floor(Math.random() * values.length);
  const value = values[i];

  let text = value[2];
  if (value[3] != "" && value[4] != "") {
    // cidとカード名が入っていた場合はリンクに置き換え
    console.log(value);
    text = text.replace(value[4], "<" + detailURL(value[3]) + "|" + value[4] + ">");
  }
  console.log(text);
  return text;
}

function drawCard() {
  const header = headerArray();
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("cards");

  const min = 2;
  const row = Math.floor(Math.random() * (s.getLastRow() + 1 - min)) + min;

  const cid = s.getRange(row, header.indexOf("cid") + 1).getValue();
  const name = s.getRange(row, header.indexOf("カード名") + 1).getValue();
  return drawText(cid, name);
}

function drawText(cid, name) {
  return text = "貴様の魂のカードは " +
    "«<https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&request_locale=ja&cid=" + cid + "|*" + name + "*>» だ！";
}

function detailURL(cid) {
  return "https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&request_locale=ja&cid=" + cid;
}

function drawCard() {
  const header = headerArray();
  const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("cards");

  const min = 2;
  const row = Math.floor(Math.random() * (s.getLastRow() + 1 - min)) + min;

  const cid = s.getRange(row, header.indexOf("cid") + 1).getValue();
  const name = s.getRange(row, header.indexOf("カード名") + 1).getValue();
  return drawText(cid, name);
}

function postText(url, text, unfurl_links) {
  const payload = {
    "response_type": "in_channel",
    "replace_original": false,
    "unfurl_links": unfurl_links,
    "text": text
  };
  console.log(payload);

  const options = {
    "method": "post",
    "payload": JSON.stringify(payload)
  };
  UrlFetchApp.fetch(url, options);
}
