function updateBeginnersDeck() {
  fetchYuGiOh_INS_INFO();
  fetchhHashBeginnersDeck();
  setTableAppearance(SpreadsheetApp.getActiveSpreadsheet().getSheetByName("beginners"));
}

function fetchYuGiOh_INS_INFO(max_id = 0) {
  const ts = twitterService();

  if (ts.hasAccess()) {
    const method = { method: "GET" };
    let q = "?screen_name=YuGiOh_INS_INFO&tweet_mode=extended&count=200";
    if (max_id != 0) {
      q = q + "&max_id=" + max_id;
    }
    const json = ts.fetch("https://api.twitter.com/1.1/statuses/user_timeline.json" + q, method);

    const tweets = JSON.parse(json);
    for (i in tweets) {
      const tweet = tweets[i];
      if (tweet.id_str) {
        console.log(tweet.id + "-" + tweet.id_str);
        max_id = tweet.id;
        if (tweet.full_text.includes("#ビギナーズデッキ")) {
          const r = parseBeginnerDeck(tweet.full_text, tweet.id_str);
          console.log(r);
          setBeginnerDeckValue(r);
        }
      }
    }

    if (tweets.length != 0) {
      fetchYuGiOh_INS_INFO(max_id)
    }
  } else {
    console.error(ts.getLastError());
  }
}

function fetchhHashBeginnersDeck() {
  const ts = twitterService();

  if (ts.hasAccess()) {
    const method = { method: "GET" };
    // #ビギナーズデッキ from:YuGiOh_INS_INFO
    const q = "?q=%23ビギナーズデッキ+from%3AYuGiOh_INS_INFO&tweet_mode=extended&count=10";
    const json = ts.fetch("https://api.twitter.com/1.1/search/tweets.json" + q, method);

    const tweets = JSON.parse(json);

    for (i in tweets.statuses) {
      const tweet = tweets.statuses[i];
      if (tweet.id_str) {
        console.log(tweet.id + "-" + tweet.id_str);
        const r = parseBeginnerDeck(tweet.full_text, tweet.id_str);
        console.log(r);
        setBeginnerDeckValue(r);
      }
    }
  } else {
    console.error(ts.getLastError());
  }
}

function parseBeginnerDeck(text, id_str) {
  const r = {
    "Name": "",
    "Target": "",
    "Power": "",
    "Difficulty": "",
    "Collectings": "",
    "DeckURL": "",
    "TweetURL": "https://twitter.com/YuGiOh_INS_INFO/status/" + id_str,
  };

  const ss = text.split("\n");
  let preface = false;
  for (i in ss) {
    const s = ss[i];

    // デッキ名は末尾に0〜2文字の絵文字が付く
    if (s.endsWith("デッキ")) {
      r["Name"] = s;
    } else if (s.slice(0, -1).endsWith("デッキ")) {
      r["Name"] = s;
    } else if (s.slice(0, -2).endsWith("デッキ")) {
      r["Name"] = s;
    } else if (preface) {
      r["Name"] = s;
    }

    // 次の行がデッキ名だと想定される場合
    preface = s.includes("初級者に向けてデッキを作成");

    if (s.startsWith("こんな人向け：")) {
      r["Target"] = s.replace("こんな人向け：", "");
    }
    if (s.startsWith("デッキの強さ：")) {
      r["Power"] = s.replace("デッキの強さ：", "");
    }
    if (s.startsWith("ルールや処理：")) {
      r["Difficulty"] = s.replace("ルールや処理：", "");
    }
    if (s.startsWith("集めやすさ：")) {
      r["Collectings"] = s.replace("集めやすさ：", "");
    }
    if (s.startsWith("http")) {
      const urls = s.split(" ");
      r["DeckURL"] = urls[0];
    }
  }

  if (r["Name"] == "") {
    console.error(text);
  }

  return r;
}

function deckURLs() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("beginners");
  const values = sheet.getRange(2, 6, sheet.getLastRow()).getValues();

  const r = [];
  for (i in values) {
    const v = values[i];
    r.push(v[0]);
  }

  return r;
}

function setBeginnerDeckValue(deck) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("beginners");

  if (!deckURLs().includes(deck.DeckURL)) {
    const arr = [[
      deck.Name,
      deck.Target,
      deck.Power,
      deck.Difficulty,
      deck.Collectings,
      deck.DeckURL,
      deck.TweetURL,
    ]];
    sheet.getRange(sheet.getLastRow() + 1, 1, arr.length, arr[0].length).setValues(arr);
  }
}

