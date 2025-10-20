import { format, toZonedTime } from "date-fns-tz";
import { supabase } from "../../../supabaseClient";

export async function generateCompletedOdos() {
  const now = new Date();
  const zonedDate = toZonedTime(now, "Asia/Makassar");
  const odos_date = format(zonedDate, "yyyy-MM-dd", { timeZone: "Asia/Makassar" });

  // Ambil semua user dengan position = 1
  const { data: users, error: manpowerError } = await supabase
    .from("manpower")
    .select("nrp")
    .eq("position", 1)
    .eq("odos_flag", true) // hanya yang aktif di ODOS')
    ;

  if (manpowerError) {
    console.error("Failed to fetch manpower", manpowerError);
    return "";
  }

  // Ambil semua yang sudah isi odos hari ini
  const { data: odosToday, error: odosError } = await supabase
    .from("odos_log")
    .select("nrp")
    .eq("odos_date", odos_date);

  if (odosError) {
    console.error("Failed to fetch odos_log", odosError);
    return "";
  }

  const allNrps = new Set(users?.map((u) => u.nrp));
  const filledNrps = new Set(odosToday?.map((o) => o.nrp));

  const allFilled = [...allNrps].every((nrp) => filledNrps.has(nrp));

  return allFilled ? "Semua sudah isi ODOS hari ini ✅" : "";
}
