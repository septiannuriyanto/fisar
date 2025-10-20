import { supabase } from "../../../supabaseClient";

export async function handleMaterialSearch(keyword: string) {
  const { data, error } = await supabase
    .from('materials')
    .select('material_code, item_name, stock_taking_order')
    .or(`item_name.ilike.%${keyword}%,item_description.ilike.%${keyword}%,colloquials.ilike.%${keyword}%`)
    .limit(5);

  if (error) {
    console.error('❌ Error querying materials:', error);
    return 'Terjadi kesalahan saat mencari material.';
  }

  if (!data || data.length === 0) {
    return `Material dengan kata kunci "${keyword}" tidak ditemukan.`;
  }

  let reply = `📦 Hasil pencarian material "${keyword}":\n\n`;
  data.forEach((row, i) => {
    reply += `${i + 1}. *${row.item_name || '-'}*\n   Code: \`${row.material_code}\`\n   Stock: ${row.stock_taking_order ?? 0}\n\n`;
  });

  return reply.trim();
}
