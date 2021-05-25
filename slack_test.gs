function testDrawText() {
  const tests = [
    {
      "input": {
        "cid": "14952",
        "name": "超魔導竜騎士－ドラグーン・オブ・レッドアイズ"
      },
      "want": "貴様の魂のカードは «<https://www.db.yugioh-card.com/yugiohdb/card_search.action?ope=2&request_locale=ja&cid=14952|*超魔導竜騎士－ドラグーン・オブ・レッドアイズ*>» だ！"
    },
  ];
  for (const tt of tests) {
    const got = drawText(tt.input.cid, tt.input.name);
    if (got != tt.want) {
      console.error("[NG]");
      console.log("input");
      console.log(tt.input);
      console.log("want");
      console.log(tt.want);
      console.log("got");
      console.log(got);
    }
  }
}