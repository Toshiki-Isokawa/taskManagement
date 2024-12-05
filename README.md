# Google Apps Script 実装プロジェクト「タスク自動管理システム」

## 概要
本プロジェクトでは、業務報告や現場作業を効率的に集約・管理する支援アプリ「eYACHO」を基盤に、外部データ連携をテーマとしたシステム開発を行いました。Google Apps Script (GAS) を活用し、タスク管理を中心とした各種機能を実装しました。特に、SlackおよびOpenAIのChatGPTとの連携を実現するAPIを開発し、RESTコネクタを用いてeYACHOとの統合を図りました。これにより、タスクの登録、通知、進捗確認、AIを活用したスケジュール生成やGoogleカレンダーとの同期などの幅広い機能を提供できるシステムを構築しました。

---

## 実装機能
### 2.1. スプレッドシートへの転記
eYACHO上で設定されるタスク情報（例: 担当者のメールアドレス、優先度、期日など12項目）をGoogle Apps Scriptを利用してスプレッドシートに転記する機能を実装しました。doPost関数でデータを判別し、handleEYACHORequest関数を用いて適切に処理しています。

### 2.2. Gmailで通知
eYACHOで新たに追加されたタスク情報を、スプレッドシートに記載されている全担当者に自動でメール通知する機能を実装しました。メール本文にはタスクの詳細情報がフォーマット化されて含まれています。

### 2.3. Slackで通知
Incoming Webhookを利用して、eYACHOから新規追加されたタスク情報をSlackに自動通知する機能を実装しました。これにより、チーム全員がリアルタイムでタスク情報を共有できます。

### 2.4. SlackでChatGPTを利用してタスク確認
SlackチャンネルでChatGPTボットをメンションし、質問を投げかけると、タスク情報や進捗状況の確認ができるようにしました。メッセージ内容をChatGPT APIに送信し、返答を再びSlackに通知する仕組みです。

### 2.5. ChatGPTを利用してスケジュール作成
ユーザーがeYACHOからスケジュールを立ててほしいタスクを指定し、特別なコメント（例: 土日稼働不可）を提供することで、ChatGPTにスケジュールを自動作成させる機能を実装しました。プロンプトの生成からスケジュール返答の処理までを一貫して行います。

### 2.6. ChatGPTが作ったスケジュールをSlackで通知
ChatGPTが作成したスケジュールをSlackに通知します。sendSlackNotification関数を用い、スケジュールの詳細（担当者、タスク名、作業時間など）を含むメッセージをWebhook経由で送信しています。

### 2.7. ChatGPTが作ったスケジュールをGoogleカレンダーに追加
ChatGPTが生成したスケジュールを解析し、Googleカレンダーに自動的にイベントとして追加する処理を実現します。

- **スケジュールレスポンスの解析**  
  parseScheduleResponse関数を使用してChatGPTからのレスポンスを処理し、担当者、タスク名、日付、作業時間を抽出します。

- **Googleカレンダーへのイベント追加**  
  addTasksToCalendar関数で解析したタスク情報を基に、Googleカレンダーにイベントを追加します。担当者名、タスク名、開始時間、終了時間を指定し、createEventメソッドでカレンダーイベントを作成します。

---

## 改良できる点や取り組んでいる点
- **eYACHO側のデザイン改良**  
  GASの実装を中心に進めてきたため、eYACHOのUI/UX改善が課題です。

- **より良いスケジュール作成**  
  プロンプトの工夫で、より正確で実用的なスケジュールを生成する取り組みが必要です。

- **全タスクの表示**  
  eYACHOにスプレッドシート上の全タスクを表示させる機能を開発中です。これにより、タスクの進捗確認が容易になります。

- **リスケジュール機能の追加**  
  初期スケジュールが進行しなかった場合、ChatGPTを利用してリスケジュールを自動生成する機能を構築中です。

---

## 動画リンク
作成した各機能の動作例を以下の動画で確認できます。  
- **スプレッドシートへの転記**  
  [動画を見る](videos/スプレッドシート.mp4)  
- **Gmailで通知**  
  [動画を見る](videos/Gmail通知.mp4)  
- **Slackで通知**  
  [動画を見る](videos/新タスクSlack通知.mp4)  
- **SlackでChatGPTを利用してタスク確認**  
  [動画を見る](videos/SlackとChatGPT.mp4)  
- **ChatGPTを利用してスケジュール作成し、Slackで通知**  
- **ChatGPTが作ったスケジュールをGoogleカレンダーに追加**  
  [動画を見る](videos/カレンダー追加.mp4)

---