import { format, toZonedTime } from "date-fns-tz";
import { supabase } from "../../../supabaseClient";
import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.WA_ENCRYPTION_KEY as string;

function decryptPhoneNum(encrypted: string): string {
  const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

export async function generateChecklist({ date }: { date: Date }): Promise<string> {
  const zonedDate = toZonedTime(date, "Asia/Makassar");
  const odos_date = format(zonedDate, "yyyy-MM-dd", { timeZone: "Asia/Makassar" });

  // 1️⃣ Ambil manpower
  const { data: users, error } = await supabase
    .from("manpower")
    .select("nrp, nama, nickname, phone_num")
    .eq("position", 1)
    .eq("odos_flag", true) 
    ;

  if (error) {
    console.error("Failed to fetch manpower", error);
    return "";
  }

  // 2️⃣ Ambil ODOS hari ini
  const { data: odosToday } = await supabase
    .from("odos_log")
    .select("nrp")
    .eq("odos_date", odos_date);

  const filledSet = new Set(odosToday?.map((o) => o.nrp));

  // 3️⃣ Ambil roster cuti yang overlap dengan odos_date
  const { data: roster } = await supabase
    .from("odos_roster")
    .select("nrp")
    .lte("start_date", odos_date)
    .gte("end_date", odos_date);

  const cutiSet = new Set(roster?.map((r) => r.nrp));

  // 4️⃣ Generate checklist
  const checklist = users
    ?.map((u) => {
      if (cutiSet.has(u.nrp)) {
        return `💤 ${u.nickname}`; // sedang cuti, tidak perlu mention
      }

      const mark = filledSet.has(u.nrp) ? "✅" : "❌";
      let mention = "";

      if (!filledSet.has(u.nrp) && u.phone_num) {
        const decryptedPhone = decryptPhoneNum(u.phone_num);
        mention = ` @${decryptedPhone}`;
      }

      return `${mark} ${u.nickname}${mention}`;
    })
    .join("\n");

  return checklist;
}
