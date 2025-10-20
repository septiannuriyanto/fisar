import { getSockInstance } from "../../../class/whatsapp-socket";
import { GROUP_LIST } from "../../../group-whitelist";
import { sendToTopic } from "../../../notifications/sendToTopic";
import { supabase } from "../../../supabaseClient";



export async function runCheckSkoStatusJob() {
  console.log('📅 Reminder SKO dinamis...');

  try {
    const { data, error } = await supabase.rpc('get_sko_status') as {
      data: SkoStatus[] | null;
      error: any;
    };

    if (error) throw error;
    if (!data) return;

    const sock = getSockInstance();

    const parsedData = data.map(d => ({
      ...d,
      expired_date: new Date(d.expired_date),
    }));

    const expired = parsedData.filter(d => d.status_sko === 'EXPIRED');
    const h1 = parsedData.filter(d => d.days_remaining === 1);
    const h7 = parsedData.filter(d => d.days_remaining === 7);
    const h30 = parsedData.filter(d => d.days_remaining === 30);

    parsedData.sort((a, b) => a.expired_date.getTime() - b.expired_date.getTime());

    const groupMessage = (title: string, list: typeof parsedData) =>
      `${title}\n\n` +
      list.map(d => `🔸 ${d.unit_id} → ${d.expired_date.toLocaleDateString()}`).join('\n');

    if (sock) {
      if (expired.length > 0) {
        await sock.sendMessage(GROUP_LIST.TEST, {
          text: groupMessage('❌ *SKO EXPIRED*', expired),
        });
      }
      if (h30.length > 0) {
        await sock.sendMessage(GROUP_LIST.TEST, {
          text: groupMessage('📆 *SKO akan habis dalam 30 hari*', h30),
        });
      }
      if (h7.length > 0) {
        await sock.sendMessage(GROUP_LIST.TEST, {
          text: groupMessage('⚠️ *SKO tinggal 7 hari*', h7),
        });
      }
      if (h1.length > 0) {
        await sock.sendMessage(GROUP_LIST.TEST, {
          text: groupMessage('🚨 *SKO BESOK EXPIRED!*', h1),
        });
      }
    }

    const totalSoon = h1.length + h7.length + h30.length;
    if (totalSoon > 0) {
      await sendToTopic(
        'compliance_alert',
        '⏰ Reminder SKO',
        `${totalSoon} unit akan habis masa SKO-nya dalam 30 hari.`,
        { screen: '/skodashboard' }
      );
    }

  } catch (err) {
    console.error('❌ Gagal kirim notifikasi dinamis:', err);
  }
}
