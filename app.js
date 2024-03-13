// 必要なモジュールを読み込む
const express = require('express');

// Express アプリケーションを作成
const app = express();

// ルートパスにアクセスがあった場合に "Hello, World!" を返す
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// アプリケーションを指定のポートでリッスン
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



const { DefaultAzureCredential } = require("@azure/identity");
const { Durations, LogsQueryClient, LogsQueryResultStatus } = require("@azure/monitor-query");

const azureLogAnalyticsWorkspaceId = "b53332c0-83ba-4353-a0f4-4d4a611f26b0";
const logsQueryClient = new LogsQueryClient(new DefaultAzureCredential());

async function run() {
  const kustoQuery = "Heartbeat | limit 1";
  const result = await logsQueryClient.queryWorkspace(azureLogAnalyticsWorkspaceId, kustoQuery, {
    duration: Durations.twentyFourHours,
  });

  if (result.status === LogsQueryResultStatus.Success) {
    const tablesFromResult = result.tables;

    if (tablesFromResult.length === 0) {
      console.log(`No results for query '${kustoQuery}'`);
      return;
    }
    console.log(`This query has returned table(s) - `);
    processTables(tablesFromResult);
  } else {
    console.log(`Error processing the query '${kustoQuery}' - ${result.partialError}`);
    if (result.partialTables.length > 0) {
      console.log(`This query has also returned partial data in the following table(s) - `);
      processTables(result.partialTables);
    }
  }
}

async function processTables(tablesFromResult) {
  for (const table of tablesFromResult) {
    const columnHeaderString = table.columnDescriptors
      .map((column) => `${column.name}(${column.type}) `)
      .join("| ");
    console.log("| " + columnHeaderString);

    for (const row of table.rows) {
      const columnValuesString = row.map((columnValue) => `'${columnValue}' `).join("| ");
      console.log("| " + columnValuesString);
    }
  }
}

run().catch((err) => console.log("ERROR:", err));
