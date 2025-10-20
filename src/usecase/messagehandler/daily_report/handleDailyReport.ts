import { GROUP_LIST } from "../../../group-whitelist";
import { sendToTopic } from "../../../notifications/sendToTopic";
import { convertFuelmanReportToDailyReport } from "../../../services/dailyReport/dailyReportConverter";
import { insertFuelmanReport } from "../../../services/dailyReport/dailyReportServices";
import { tuningRawDailyReport } from "../../../services/dailyReport/dailyReportTuning";
import { parseFuelmanReport } from "../../../services/dailyReport/parseDailyReportFuel";
import { MessageHandlerParams } from "../messageHandlerParams";


export async function handleDailyReport({
  message,
  sock,
}: MessageHandlerParams) {
  const result = await parseFuelmanReport(message);
  if (!result) {
    console.log("❌ Gagal parsing laporan FAO");
    return;
  }

  console.log(result);
  const report = convertFuelmanReportToDailyReport(result);
  const tunedReport = tuningRawDailyReport(report);

  console.log("Tuned Report:", tunedReport);

  await insertFuelmanReport(tunedReport);

  if (sock) {
    await sock.sendMessage(GROUP_LIST.TEST, {
      text: `✅ Daily FAO report inserted successfully`,
    });
  }

  await sendToTopic(
    "dailyreport_alert",
    "⚠️ Daily Report FAO Alert",
    `Daily Report tanggal ${tunedReport.report_date} shift ${tunedReport.shift} telah berhasil diinput.`,
    { screen: "/splash" }
  );

  console.log("✅ Push notification sent to topic 'dailyreport_alert'.");
}
