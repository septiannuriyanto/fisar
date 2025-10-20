
import { GROUP_LIST } from "../../../group-whitelist";
import { supabase } from "../../../supabaseClient";
import { sendToTopic } from "../../../notifications/sendToTopic";
import { WASocket } from "@whiskeysockets/baileys";
import { MessageHandlerParams } from "../messageHandlerParams";



export async function handleDelayRefueling({ message, sock }: MessageHandlerParams) {

  const lines = message.split("\n");

  const dateMatch = message.match(/TGL (\d{2}\/\d{2}\/\d{4})/i);
  const reportDateRaw = dateMatch ? dateMatch[1] : "??/??/????";
  const reportDateFormatted = dateMatch
    ? dateMatch[1].split("/").reverse().join("-")
    : null;

  const shiftMatch = message.match(/SHIFT (\d)/);
  const shift = shiftMatch ? parseInt(shiftMatch[1], 10) : null;

  const allowedWindow =
    shift === 1
      ? { start: "12:00", end: "13:00" }
      : { start: "00:00", end: "01:00" };

  const delayUnits: string[] = [];
  const records: any[] = [];

  const isInAllowedWindow = (timeStr: string): boolean => {
    const [hour, minute] = timeStr.split(":").map(Number);
    const timeMinutes = hour * 60 + minute;

    const [startHour, startMinute] = allowedWindow.start.split(":").map(Number);
    const [endHour, endMinute] = allowedWindow.end.split(":").map(Number);

    return timeMinutes >= startHour * 60 + startMinute &&
           timeMinutes <= endHour * 60 + endMinute;
  };

  for (const line of lines) {
    const timeMatch = line.match(/Jam\s(\d{2}):(\d{2})/i);
    const unitMatch = line.match(/EX\s?[-]?\d+/i);
    const volumeMatch = line.match(/:\s?([\d.,]+)\s?LTR/i);
    const breatherMatch = line.match(/Breather\s(Normal|Bocor)/i);
    const locationMatch = line.match(/-\s([\w\s]+)$/i);

    if (timeMatch && unitMatch && breatherMatch) {
      const unit = unitMatch[0].replace(" ", "");
      const timeStr = `${timeMatch[1]}:${timeMatch[2]}`;
      const volume = volumeMatch ? parseFloat(volumeMatch[1].replace(",", ".")) : null;
      const breather = breatherMatch[1].toLowerCase() === "normal" ? 1 : 3;
      const location = locationMatch ? locationMatch[1].trim() : "-";

      if (!isInAllowedWindow(timeStr)) {
        delayUnits.push(`${unit} : ${volume} LTR - Breather ${breather} - ${timeStr} WITA - ${location}`);

        records.push({
          unit,
          location,
          report_date: reportDateFormatted,
          report_shift: shift,
          status: 0,
          time_refueling: timeStr,
          breather_status: breather,
          qty_refueling: volume,
        });
      }
    }
  }

  // Insert all at once (optional)
  if (records.length > 0) {
    const { data, error } = await supabase
      .from("delay_refueling")
      .insert(records);

    if (error) {
      console.error("Gagal insert:", error);
    } else {
      console.log("Berhasil insert:", data);
    }
  }

  if (delayUnits.length > 0) {
    await sendToTopic(
      "tmr_alert",
      "⚠️ WARNING! Delay Refueling Detected",
      `Unit: ${delayUnits.join(", ")}`,
      { screen: "/delay_refueling" }
    );

    const msg = `⚠️ Refueling outside rest time hours, ${reportDateRaw} shift ${shift}:\n\n${delayUnits
      .map((u) => `• ${u}`)
      .join("\n")}\n\n⏰ Allowed time: ${allowedWindow.start} - ${allowedWindow.end}`;

    try {
      if (sock) {
        await sock.sendMessage(GROUP_LIST.TEST, { text: msg });
      } else {
        console.error("❌ WhatsApp socket not available.");
      }
    } catch (err) {
      console.error("❌ Error sending WhatsApp message:", err);
    }
  }
}
