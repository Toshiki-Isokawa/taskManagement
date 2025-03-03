function doPost(e) {

  var postData = JSON.parse(e.postData.contents);

  //eYACHOからのデータを処理
  if (postData.assignee) {
    return handleEYACHORequest(postData);  
  }

  //スケジュール作成
  if (postData.userComment) 
  {
    return generateSchedule(postData.userComment);
  }

  //Slackからのデータを処理
  if (postData.type === 'url_verification') {
    var challenge = postData.challenge;
    return ContentService.createTextOutput(challenge).setMimeType(ContentService.MimeType.TEXT);
  }

  if (postData.type === "event_callback" && postData.event && postData.event.type === 'message') {
    const botId = "B07TKS5BSSC";
    const userId = "U07SQDTF1TQ";
    const messageText = postData.event.text;

    if (postData.event.subtype === 'bot_message' || postData.event.bot_id)
    {
      return ContentService.createTextOutput('');
    }

    if (messageText.includes(`<@${botId}>`) || messageText.includes(`<@${userId}>`)) {
      return handleSlackRequest(postData);
    }
    return ContentService.createTextOutput('');
  }

  return ContentService.createTextOutput('Request processed');
}

function handleEYACHORequest(postData) {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TaskManagement');
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet('TaskManagement');
  }

  var lastRow = sheet.getLastRow();

  sheet.getRange(lastRow + 1, 1, 1, 12).setValues([[
    postData.assignee,             
    postData.email,                
    postData.task,
    postData.detail,
    postData.priority,
    postData.description,             
    new Date(postData.startDate),  
    Number(postData.progress),
    postData.status, 
    new Date(postData.dueDate),
    new Date(postData.planDate),
    Number(postData.time)
  ]])

  generateAndSendReport(postData);
  notifyNewTaskToSlack(postData);
}

function generateAndSendReport(data) {
  // スプレッドシートとシートの取得
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TaskManagement');
  
  // シートのデータ範囲を取得（1行目はヘッダー行なので2行目から取得）
  var dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 11);  // 11列分（全データ）
  var emailData = dataRange.getValues();
  
  // 各メールアドレスに対してメールを送信
  for (var i = 0; i < emailData.length; i++) {
    var recipient = emailData[i][1];  // B列のメールアドレス
    if (recipient && recipient.includes('@')) {  // メールアドレスが有効か確認
      var subject = '自動レポート: タスク追加のお知らせ';
      
      var body = '以下は最新の追加タスクのレポートです。\n\n' +
        '担当者：' + data.assignee + '\n' +  // A列 担当者
        'メールアドレス：' + data.email + '\n' +  // B列 メールアドレス
        'タスク：' + data.task + '\n' +  // C列 タスク
        '詳細：' + data.detail + '\n' +  // D列 詳細
        '優先度：' + data.priority + '\n' +  // E列 優先度
        'メモ：' + (data.description ? data.description : 'なし') + '\n' +  // F列 メモ (空欄なら「なし」)
        '開始日：' + new Date(data.startDate).toString() + '\n' +  // G列 開始日
        '進捗率：' + data.progress + '%\n' +  // H列 進捗率
        'ステータス：' + data.status + '\n' +  // I列 ステータス
        '期日：' + new Date(data.dueDate).toString() + '\n' +  // J列 期日
        '完成予定日：' + new Date(data.planDate).toString() + '\n'  // K列 完成予定日
        '推定時間：'+ data.time+ '\n';

      // メール送信
      MailApp.sendEmail(recipient, subject, body);
    }
  }
}