import { supabase } from "../../../supabaseClient";
import { MessageHandlerParams } from "../messageHandlerParams";

export async function handleSetOdosStatus({ message, sock, groupId }: MessageHandlerParams) {
  const header = message.split("\n")[0];

  // Filter user
const allowedUsers = [
  "6281333387057@s.whatsapp.net", // ganti dengan nomor asli WhatsApp yang diizinkan
  "6281230717028:48@s.whatsapp.net",
  "6281347932699@s.whatsapp.net",
  "6281230717028:46@s.whatsapp.net"
];

// You need to get senderId from params, not from message string
const senderId = sock?.user?.id || groupId;

if (!allowedUsers.includes(senderId)) {
  console.log("User tidak diizinkan:", senderId);
  if (sock && groupId) {
    await sock.sendMessage(groupId, {
      text: "❌ Maaf, kamu tidak punya izin untuk menggunakan perintah ini.",
    });
  }
  return;
}



  // Validasi format
  const parts = header.trim().split(" ");
  const nickname = parts[1]?.toLowerCase();
  const status = parts[2]?.toLowerCase();
  const [startStr, endStr] = parts.slice(3).join(" ").split(" - ").map(s => s.trim());

  if (!nickname || status !== "offsite" || !startStr || !endStr) {
    console.log("Format salah: #setodos {nickname} offsite yyyy-mm-dd - yyyy-mm-dd");
    return;
  }

  // Cari NRP berdasarkan nickname
  const { data: manpowerData, error: manpowerError } = await supabase
    .from("manpower")
    .select("nrp")
    .ilike("nickname", nickname) // case-insensitive LIKE

  if (manpowerError || !manpowerData || manpowerData.length === 0) {
    console.error("Nickname tidak ditemukan:", nickname);
    return;
  }

  const nrp = manpowerData[0].nrp;

  // Insert ke odos_roster
  const { error: insertError } = await supabase.from("odos_roster").insert({
    nrp,
    start_date: startStr,
    end_date: endStr,
  });

  if (insertError) {
    console.error("Gagal insert ke odos_roster:", insertError);
  } else {
    console.log(`Set ${nickname} (nrp: ${nrp}) sebagai offsite dari ${startStr} sampai ${endStr}`);
    if (sock) {
      await sock.sendMessage(groupId, {
        text: `✅ ${nickname} telah ditandai sebagai offsite dari ${startStr} sampai ${endStr}.`,
      });
    }
  }
}
