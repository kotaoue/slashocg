function fetchCard() {
  const sheetName = "cards";

  // 今のページを保存しておく
  dumpSheet(sheetName);

  // 今のページを保存
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (sheet) {
    sheet.clear();
  } else {
    ss.insertSheet(sheetName);
    sheet = ss.getSheetByName(sheetName);
  }

  // ヘッダー部分を用意
  const header = headerArray();
  const headerRange = sheet.getRange(1, 1, 1, header.length);
  headerRange.setValues([header]);
  headerRange.createFilter();

  // データを取得
  fetchCardList();

  // セルの背景を交互に
  setTableAppearance(sheet);
}

function fetchCardList(page = 1) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("cards");

  const url = "https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=1&sort=1&rp=100&request_locale=ja&page=" + page;
  const html = UrlFetchApp.fetch(url).getContentText('UTF-8');

  const box_list = Parser.data(html).from('<ul class="box_list">').to('</ul>').build();
  const cards = Parser.data(box_list).from('<li>').to('</li>').iterate();

  let lastList = false;
  if (cards.length > 0) {
    const arr = [];
    for (i = 0; i < cards.length; i++) {
      const card = parseCard(cards[i]);
      console.log(card["cid"] + ":" + card["カード名"]);

      if (!isNaN(card["cid"])) {
        arr.push(cardToArray(card));
      } else {
        lastList = true;
      }
    }
    if (arr.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, arr.length, arr[0].length).setValues(arr);
    }
  }

  if (!lastList) {
    fetchCardList(page + 1);
  }
}

function parseCard(html) {
  // 改行とタブを除去
  html = html.replace(/\r/g, "").replace(/\n/g, "").replace(/\t/g, "");

  const box_card_name = Parser.data(html).from('<dt class="box_card_name">').to('</dt>').build();
  const box_card_attribute = Parser.data(html).from('<span class="box_card_attribute">').to('</span>').build();
  const box_card_effect = Parser.data(html).from('<span class="box_card_effect">').to('</span>').build();
  const other_info = Parser.data(html).from('<span class="card_info_species_and_other_item">').to('</span>').build();

  // モンスターの効果を分類 【機械族／シンクロ／チューナー／効果】
  const d = other_info.replace("【", "").replace("】", "").split("／");

  // 魔法・罠を分類
  const effect = Parser.data(box_card_effect).from('alt="').to('"').build();
  const attribute = Parser.data(box_card_attribute).from('alt="').to('"').build();
  const spell_and_trap = effect + attribute;

  let card = {
    "cid": Parser.data(html).from('value="/yugiohdb/card_search.action?ope=2&cid=').to('">').build(),
    "カード名": Parser.data(box_card_name).from('<strong>').to('</strong>').build(),
    "読み": Parser.data(box_card_name).from('<span>').to('</span>').build(),
    "カードテキスト": Parser.data(html).from('<dd class="box_card_text">').to('</dd>').build(),
    "通常魔法": false,
    "通常罠": false,
  };

  const monster_types = [
    "通常",
    "効果",
    "儀式",
    "融合",
    "シンクロ",
    "エクシーズ",
    "トゥーン",
    "スピリット",
    "ユニオン",
    "デュアル",
    "チューナー",
    "リバース",
    "ペンデュラム",
    "特殊召喚",
    "リンク"
  ];
  for (key in monster_types) {
    const type = monster_types[key]
    card[type] = d.includes(type);
  }

  // 魔法の種別を判定
  if (attribute == "魔法") {
    // 魔法だったらいったん通常魔法に分類
    card["通常魔法"] = true;
  }
  const spell_types = ["装備魔法", "フィールド魔法", "儀式魔法", "速攻魔法", "永続魔法"];
  for (key in spell_types) {
    const type = spell_types[key]
    card[type] = (spell_and_trap == type);
    if (card[type]) {
      // 別の魔法だったらいったん通常魔法以外とする
      card["通常魔法"] = false;
    }
  }

  // 罠の種別を判定
  if (attribute == "罠") {
    // 罠だったらいったん通常罠に分類
    card["通常罠"] = true;
  }
  const trap_types = ["カウンター罠", "永続罠"];
  for (key in trap_types) {
    const type = trap_types[key]
    card[type] = (spell_and_trap == type);
    if (card[type]) {
      // 別の魔法だったらいったん通常魔法以外とする
      card["通常罠"] = false;
    }
  }

  return card;
}

function headerArray() {
  return [
    "cid",
    "カード名",
    "読み",
    "通常",
    "効果",
    "儀式",
    "融合",
    "シンクロ",
    "エクシーズ",
    "トゥーン",
    "スピリット",
    "ユニオン",
    "デュアル",
    "チューナー",
    "リバース",
    "ペンデュラム",
    "特殊召喚",
    "リンク",
    "通常魔法",
    "装備魔法",
    "フィールド魔法",
    "儀式魔法",
    "速攻魔法",
    "永続魔法",
    "通常罠",
    "カウンター罠",
    "永続罠",
  ];
}

function cardToArray(card) {
  const header = headerArray();
  const arr = [];
  for (key in header) {
    arr.push(card[header[key]]);
  }
  return arr;
}
