import { odosMap } from './odosmap';

export function parseOdosMessage(message: string) {
  const lines = message.split('\n');
  const data: any = {};

  for (let line of lines) {
    line = line.trim();

    if (line.startsWith('NRP')) {
      data.nrp = line.split(':')[1]?.trim();
    } else if (line.startsWith('Keterangan')) {
      data.notes = line.split(':')[1]?.trim();
    } else if (line.startsWith('Nama')) {
      continue; // abaikan Nama, tidak perlu disimpan
    } else {
      const [label, valueStr] = line.split(':').map(s => s.trim());
      if (
        label &&
        valueStr &&
        Object.prototype.hasOwnProperty.call(odosMap, label)
      ) {
        const value = parseInt(valueStr);
        if (!isNaN(value)) {
          data[label] = value;
        }
      }
    }
  }

  return data;
}
