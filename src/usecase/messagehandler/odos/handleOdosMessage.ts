import { GROUP_WHITELIST } from "../../../group-whitelist";
import { supabase } from "../../../supabaseClient";
import { MessageHandlerParams } from "../messageHandlerParams";
import { generateThankYouMessage } from "./generateThankYouMessage";
import { odosMap } from "./odosmap";
import { parseOdosMessage } from "./parseOdosMessage";
import { format, toZonedTime } from 'date-fns-tz';


export async function handleOdosMessage({ message, sock, groupId }: MessageHandlerParams) {
  const parsedData = parseOdosMessage(message);
  console.log(`Parsed ODOS Data:`, parsedData);

  if (!parsedData?.nrp) {
    console.error('Failed to parse ODOS message:', message);
    return;
  }

const now = new Date();
const zonedDate = toZonedTime(now, 'Asia/Makassar');
const odos_date = format(zonedDate, 'yyyy-MM-dd', { timeZone: 'Asia/Makassar' });
  const inserts = [];

  for (const [label, odos_type] of Object.entries(odosMap)) {
    const jumlah = parsedData[label];
    if (jumlah && jumlah > 0) {
      for (let i = 0; i < jumlah; i++) {
        inserts.push({
          nrp: parsedData.nrp,
          odos_type,
          odos_date,
          notes: parsedData.notes || null,
        });
      }
    }
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from('odos_log').insert(inserts);
    if (error) {
      console.error('Insert ODOS failed:', error);
      return;
    }
    console.log(`Inserted ${inserts.length} ODOS logs.`);
  } else {
    console.log('No ODOS entries to insert.');
    return;
  }

  // Ambil nickname
  const { data: user, error: userError } = await supabase
    .from('manpower')
    .select('nickname')
    .eq('nrp', parsedData.nrp)
    .single();

  if (userError || !user?.nickname) {
    console.error('Failed to fetch nickname:', userError);
    return;
  }

  const nickname = user.nickname;

  // Generate pesan balasan
  let thankYouMessage = await generateThankYouMessage(nickname);
  if (!thankYouMessage) {
    thankYouMessage = `Terima kasih, ${nickname}, atas kontribusimu hari ini dalam menciptakan lingkungan kerja yang lebih aman! 👍`;
  }

  if (!sock) {
    console.error('Socket instance is not available.');
    return;
  }

  // Kirim balasan ke grup
  await sock.sendMessage(groupId, {
    text: thankYouMessage,
  });

  console.log('Thank you message sent.');
}