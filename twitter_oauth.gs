function getTwitterOAuthURL() {
  Logger.log(twitterService().authorize());
}

function twitterService() {
  return OAuth1.createService('Twitter')
    .setAccessTokenUrl("https://api.twitter.com/oauth/access_token")
    .setRequestTokenUrl("https://api.twitter.com/oauth/request_token")
    .setAuthorizationUrl("https://api.twitter.com/oauth/authorize")
    .setConsumerKey(PropertiesService.getScriptProperties().getProperty("twitter_api_key"))
    .setConsumerSecret(PropertiesService.getScriptProperties().getProperty("twitter_api_secret"))
    .setCallbackFunction("twitterCallback")
    .setPropertyStore(PropertiesService.getUserProperties());
}

function twitterCallback(request) {
  const service = getService();
  if (service.handleCallback(request)) {
    return HtmlService.createHtmlOutput("🐓");
  } else {
    return HtmlService.createHtmlOutput("🐔");
  }
}