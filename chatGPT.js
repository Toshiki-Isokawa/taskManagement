function generateSchedule(userComment) {

    // スケジュール生成用のプロンプトを生成
    var prompt = generateSchedulePrompt(userComment);
  
    // ChatGPTにプロンプトを送信して、返答を取得
    var response = callChatGPT(prompt);
  
    //Googleカレンダーに追加するためにデータを整形
    const tasks = parseScheduleResponse(response);
  
    //Googleカレンダーに追加
    addTasksToCalendar(tasks);
  
    //Slack通知のための文字列整形
    var slackMessage = "Googleカレンダーに以下のスケジュールを追加しました:\n" + response;
    
    //Slackでスケジュール通知
    sendSlackNotification(slackMessage);
  }
  
  function getTaskData() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('taskManagement');
    var dataRange = sheet.getRange(2, 1, sheet.getLastRow() - 1, 12);
    var tasks = dataRange.getValues();
    
    return tasks;
  }
  
  function generateTaskDataString(tasks) {
    return tasks.map(function(task) {
      return '担当者: ' + task[0] + 
             ', メールアドレス: ' + task[1] + 
             ', タスク: ' + task[2] + 
             ', 詳細: ' + task[3] + 
             ', 優先度: ' + task[4] + 
             ', メモ: ' + task[5] + 
             ', 開始日: ' + task[6] + 
             ', 進捗率: ' + task[7] + 
             ', ステータス: ' + task[8] + 
             ', 期日: ' + task[9] + 
             ', 完成予定日: ' + task[10] + 
             ', 推定必要時間: ' + task[11];
    }).join('\n');
  }
  
  function generateChatGPTPrompt(Text) {
    var tasks = getTaskData();
  
    var taskDataString = generateTaskDataString(tasks);
    
    var prompt = '以下のタスクデータに基づいて、次の質問に答えてください。\n\n' +
                 'タスクデータ:\n' + taskDataString + '\n\n' +
                 '質問: ' + Text;
                 
    return prompt;
  }
  
  function generateSchedulePrompt(userComments) {
    var tasks = getTaskData();
  
    var taskDataString = generateTaskDataString(tasks);
  
    var prompt = '以下のタスクデータに基づいて、スケジュールを組んでください。\n\n' +
                 'タスクデータ:\n' + taskDataString + '\n\n' +
                 'ユーザのコメント: ' + userComments + '\n\n' +
                 '条件: メモ、進捗率、優先度、推定必要時間、開始日時から期日までの期間、ユーザのコメントを考慮して必ず以下の形式に則って返してください。合計の作業時間は必ず推定時間を越えるようにする。日本語で返答してください。' + '\n\n' +
                 '「担当者名 (タスク): ' + '\n' +
                  '⚪︎月⚪︎日(⚪︎): ⚪︎:00-⚪︎:00, ⚪︎時間作業 ' + '\n' +
                  '⚪︎月⚪︎日(⚪︎): ⚪︎:00-⚪︎:00, ⚪︎時間作業 ' + '\n' +
                  '⚪︎月⚪︎日(⚪︎): ⚪︎:00-⚪︎:00, ⚪︎時間作業」';
    
    return prompt;
  }
  
  function callChatGPT(prompt) {
    var apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');  // ChatGPTのAPIキー
    var url = 'https://api.openai.com/v1/chat/completions';
  
    var options = {
      "method": "post",
      "contentType": "application/json",
      "headers": {
        "Authorization": "Bearer " + apiKey
      },
      "payload": JSON.stringify({
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": prompt}]
      })
    };
  
    var response = UrlFetchApp.fetch(url, options);
    var json = JSON.parse(response.getContentText());
    return json.choices[0].message.content;
  }
  
  function parseScheduleResponse(response) {
    const tasks = [];
    
    // 担当者名 (タスク) を解析
    const lines = response.trim().split('\n');
    const [assigneeTask, ...scheduleLines] = lines;
    const assignee = assigneeTask.split('(')[0].trim();
    const taskName = assigneeTask.match(/\(([^)]+)\)/)[1];
    
    // 各スケジュール行を解析
    scheduleLines.forEach(line => {
      const match = line.match(/(\d{1,2})月(\d{1,2})日\(.{1}\): (\d{1,2}:\d{2})-(\d{1,2}:\d{2}), (\d+)時間作業/);
      if (match) {
        const month = match[1];
        const day = match[2];
        const startTime = match[3];
        const endTime = match[4];
        
        // 日付を現在の年で生成
        const year = new Date().getFullYear();
        const date = new Date(`${year}-${month}-${day}`);
        
        tasks.push({
          assignee,
          taskName,
          date,
          startTime,
          endTime
        });
      }
    });
    
    return tasks;
  }
  
  function addTasksToCalendar(tasks) {
    // 使用するカレンダーを指定（ここではデフォルトのカレンダーを使用）
    const calendar = CalendarApp.getDefaultCalendar();
    
    tasks.forEach(task => {
      const { assignee, taskName, date, startTime, endTime } = task;
      
      // 開始時間と終了時間をDateオブジェクトに変換
      const startDateTime = new Date(date);
      const [startHour, startMinute] = startTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute);
  
      const endDateTime = new Date(date);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute);
  
      // カレンダーにイベントを追加
      calendar.createEvent(
        `${assignee} - ${taskName}`,
        startDateTime,
        endDateTime,
        {
          description: `Task: ${taskName}\nAssignee: ${assignee}`
        }
      );
    });
  }