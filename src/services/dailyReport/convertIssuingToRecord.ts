export function issuingArrayToRecord(
  issuingArray: { unit_id: string; qty: number }[]
): Record<string, number> {
  const result: Record<string, number> = {};
  issuingArray.forEach(item => {
    result[item.unit_id] = item.qty;
  });
  return result;
}
