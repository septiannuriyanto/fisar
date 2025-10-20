import { formatDate } from '../../utils/timeUtils';

export type UnitData = {
  unit_id: string;
  filter_material_code: string;
  qty: number;
  replacement_interval_days?: number;
  replacement_interval_hours?: number;
  lastChangeDate?: Date | null;
};

export function formatPlantReminderSection(unitData: UnitData, now: Date) {
  const formattedDate = formatDate(now);
  const lastChangeStr = unitData.lastChangeDate
    ? formatDate(unitData.lastChangeDate)
    : 'Belum pernah diganti';

  let planNextDateStr = '-';
  let needReplacement = false;

  if (unitData.lastChangeDate && unitData.replacement_interval_days) {
    const planNextDate = new Date(unitData.lastChangeDate);
    planNextDate.setDate(planNextDate.getDate() + unitData.replacement_interval_days);
    planNextDateStr = formatDate(planNextDate);

    if (now >= planNextDate) {
      needReplacement = true;
    }
  }

  let intervalStr = '';
  if (unitData.replacement_interval_days) {
    intervalStr = `${unitData.replacement_interval_days} hari`;
  } else if (unitData.replacement_interval_hours) {
    intervalStr = `${unitData.replacement_interval_hours} jam`;
  }

  const baseInfo = [
    `Unit : ${unitData.unit_id}`,
    `Plan Date : ${formattedDate}`,
    `Plan Time : 15:00 - 17:00`,
    `Penggantian filter terakhir : ${lastChangeStr}`,
    `Interval Penggantian : ${intervalStr}`,
    `Plan Penggantian Berikutnya : ${planNextDateStr}`,
  ];

  if (needReplacement) {
    baseInfo.push(
      `Material number : ${unitData.filter_material_code}`,
      `Qty : ${unitData.qty} pcs`
    );
  } else {
    baseInfo.push(`*Filter belum masuk masa penggantian*`);
  }

  return baseInfo.join('\n');
}
