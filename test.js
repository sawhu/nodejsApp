const { DefaultAzureCredential } = require("@azure/identity");
const { LogsIngestionClient, isAggregateLogsUploadError } = require("@azure/monitor-ingestion");

require("dotenv").config();

async function main() {
  const logsIngestionEndpoint = "https://dce-for-japaneast-t0qj.japaneast-1.ingest.monitor.azure.com";
  const ruleId = "dcr-1c8ef00043524cc9b67377d7eddcae4c";
  const streamName = "Custom-TestDataIngestAPI_CL";
  const credential = new DefaultAzureCredential();
  const logsIngestionClient = new LogsIngestionClient(logsIngestionEndpoint, credential);
  const logs = [
    {
        "TimeGenerated": "2023-08-18T04:00:03.423211Z",
        "ServerName": "huxi2023",
        "ShellName": "BAT BBM_FILE_DEL_COMPRESS_DUP.bash",
        "ErrorCode": "SHL01",
        "ErrorLevel": "ERROR",
        "ErrorMessages": "test223412312312312",
        "ErrorMessages02": "test223412312312312",
        "ErrorMessages03": "test223412312312312"
    }
];
  try{
    await logsIngestionClient.upload(ruleId, streamName, logs);
  }
  catch(e){
    let aggregateErrors = isAggregateLogsUploadError(e) ? e.errors : [];
    if (aggregateErrors.length > 0) {
      console.log("Some logs have failed to complete ingestion");
      for (const error of aggregateErrors) {
        console.log(`Error - ${JSON.stringify(error.cause)}`);
        console.log(`Log - ${JSON.stringify(error.failedLogs)}`);
      }
    } else {
      console.log(e);
    }
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
  process.exit(1);
});