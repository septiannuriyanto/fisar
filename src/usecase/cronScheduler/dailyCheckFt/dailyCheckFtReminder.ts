import { GROUP_WHITELIST } from "../../../group-whitelist";
import { formatPlantReminderSection, UnitData } from "../../../helpers/dailyCheckft/formatters";
import { fetchFilterSetup, fetchLastFilterChange } from "../../../services/dailyCheckft/filterService";
import { fetchDailyCheckUnits } from "../../../services/dailyCheckft/storageService";
import { formatDate, getCurrentMakassarTime } from "../../../utils/timeUtils";
import { MessageHandlerParams } from "../../messagehandler/messageHandlerParams";


export async function dailyCheckFtReminder({ sock, groupId }: MessageHandlerParams) {
  if (!sock) {
    console.error('Socket instance not available');
    return;
  }

  const now = getCurrentMakassarTime();
  const todayDay = ((now.getDay() + 6) % 7);
  const formattedDate = formatDate(now, 'EEEE, dd MMMM yyyy');

  // Reminder untuk hari ini
  let units;
  try {
    units = await fetchDailyCheckUnits();
  } catch (err) {
    console.error('Failed to fetch daily check units:', err);
    return;
  }
  if (!units || units.length < 7) {
    console.error('Insufficient units data');
    return;
  }

  const todayUnit = units[todayDay]?.unit_id ?? '—';
  const dailyCheckMessage = `🔧 *Reminder Daily Check FT - ${formattedDate}*

FT yang dijadwalkan hari ini: *${todayUnit}*

📋 *Ketentuan:*
1. Daily check dilaksanakan 1 FT per hari sesuai jadwal
2. Filter harus diorder H-1 oleh plant dan diinformasikan nomor reservationnya pada tim SPEX
3. Jam 15.00 tet wajib sampai Workshop SPEX biar awal shift 2 unit RFU dan bisa goyang
4. Penggantian filter dilakukan pencatatan flowrate, data awal menggunakan acuan per 2 minggu, kecuali *FT304* 1 minggu sekali.

Terima kasih 🙏`;

  await sock.sendMessage(groupId, { text: dailyCheckMessage });

  // Reminder ke Plant
  let reminderUnits = [];
  if (todayDay === 6) {
    reminderUnits = [units[0], units[1]];
  } else {
    reminderUnits = [units[(todayDay + 1) % 7]];
  }

  const sections: string[] = [];

  for (const unit of reminderUnits) {
    if (!unit.filter_config) {
      console.warn(`No filter config for unit ${unit.unit_id}`);
      continue;
    }

    let filterSetup;
    let lastChange;
    try {
      filterSetup = await fetchFilterSetup(unit.filter_config);
      lastChange = await fetchLastFilterChange(unit.unit_id);
    } catch (err) {
      console.warn(`Failed to fetch filter data for unit ${unit.unit_id}`, err);
      continue;
    }

    if (!filterSetup) {
      console.warn(`No filter setup for unit ${unit.unit_id}`);
      continue;
    }

    const unitData: UnitData = {
      unit_id: unit.unit_id,
      filter_material_code: filterSetup.filter_material_code,
      qty: filterSetup.qty ?? 1,
      replacement_interval_days: filterSetup.replacement_interval_days ?? undefined,
      replacement_interval_hours: filterSetup.replacement_interval_hours ?? undefined,
      lastChangeDate: lastChange?.tanggal ? new Date(lastChange.tanggal) : null,
    };

    const section = formatPlantReminderSection(unitData, now);
    sections.push(section);
  }

  if (sections.length === 0) {
    console.warn('No valid units found for Plant reminder.');
    return;
  }

  const plantReminderMessage = `📦 *Reminder Daily Check FT*\n\n${sections.join('\n\n')}`;

  await sock.sendMessage(GROUP_WHITELIST.RESERVE, { text: plantReminderMessage });
}
