import { supabase } from "../../../supabaseClient";
import { GROUP_WHITELIST } from "../../../group-whitelist";

export async function isOdosComplete(): Promise<boolean> {
  // Ambil semua anggota group tertentu (misalnya Safety Member)
  const { data: members, error: memberError } = await supabase
    .from("manpower")
    .select("nrp")
    .eq("position", 1); // asumsi group pakai position

  // Ambil semua odos hari ini
  const today = new Date().toISOString().split("T")[0];
  const { data: odosData, error: odosError } = await supabase
    .from("odos_log")
    .select("nrp")
    .eq("odos_date", today);

  if (memberError || odosError) {
    throw new Error(`DB Error: ${memberError?.message || odosError?.message}`);
  }

  // Buat set untuk membandingkan
  const memberNrps = new Set(members?.map((m) => m.nrp));
  const filledNrps = new Set(odosData?.map((o) => o.nrp));

  // Cek apakah semua member sudah isi odos
  for (const nrp of memberNrps) {
    if (!filledNrps.has(nrp)) {
      return false; // masih ada yang belum isi
    }
  }

  return true; // semua sudah isi
}
