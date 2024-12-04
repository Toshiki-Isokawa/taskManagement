function handleSlackRequest(postData) {

  var slackMessage = postData.event.text;

  // ChatGPT APIに送るプロンプトを作成
  var prompt = generateChatGPTPrompt(slackMessage);

  // ChatGPTを呼び出す
  var chatGPTResponse = callChatGPT(prompt);

  // Slackにメッセージを送る
  return returnSlackMessage(postData.event.channel, chatGPTResponse);
}

function sendSlackNotification(message) {
  var webhookUrl = 'https://hooks.slack.com/services/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'; 
  var payload = {
    "text": message
  };

  var options = {
    "method": "post",
    "contentType": "application/json",
    "payload": JSON.stringify(payload)
  };

  UrlFetchApp.fetch(webhookUrl, options);
}

function notifyNewTaskToSlack(data) {
  var message = '新しいタスクが追加されました:\n' +
    '担当者：' + data.assignee + '\n' + 
    'メールアドレス：' + data.email + '\n' +  
    'タスク：' + data.task + '\n' +  
    '詳細：' + data.detail + '\n' +  
    '優先度：' + data.priority + '\n' +  
    'メモ：' + (data.description ? data.description : 'なし') + '\n' +  
    '開始日：' + new Date(data.startDate).toString() + '\n' +  
    '進捗率：' + data.progress + '%\n' +  
    'ステータス：' + data.status + '\n' +  
    '期日：' + new Date(data.dueDate).toString() + '\n' +  
    '完成予定日：' + new Date(data.planDate).toString() + '\n'
    '推定時間：'+ data.time+ '\n';  

  sendSlackNotification(message);
}

function returnSlackMessage(channel, message) {
  var token = PropertiesService.getScriptProperties().getProperty('SLACK_API_TOKEN');
  var url = "https://slack.com/api/chat.postMessage";

  var options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "payload": JSON.stringify({
      "channel": channel,
      "text": message
    })
  };

  var response = UrlFetchApp.fetch(url, options);
}
