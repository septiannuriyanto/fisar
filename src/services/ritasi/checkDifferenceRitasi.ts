import { createClient } from '@supabase/supabase-js'
import { supabase } from '../../supabaseClient'

function removeThirdLastChar(input: string): string {
  if (input.length < 3) return input
  const index = input.length - 3
  return input.slice(0, index) + input.slice(index + 1)
}

export async function checkUnrecordedSuratJalan() {
  const today = new Date().toISOString().split('T')[0] // format YYYY-MM-DD

  // Step 1: Ambil data dari ritasi_fuel
  const { data: fuelData, error: fuelError } = await supabase
    .from('ritasi_fuel')
    .select('no_surat_jalan')
    .eq('ritation_date', today)

  if (fuelError) {
    console.error('Error fetching ritasi_fuel:', fuelError)
    return
  }

  // Step 2: Ambil data dari ritasi_daily_reconcile
  const { data: reconcileData, error: reconcileError } = await supabase
    .from('ritasi_daily_reconcile')
    .select('do_number')
    .eq('report_date', today)

  if (reconcileError) {
    console.error('Error fetching ritasi_daily_reconcile:', reconcileError)
    return
  }

  // Step 3: Normalisasi dan bandingkan
  const fuelSJSet = new Set(fuelData?.map(item => item.no_surat_jalan))

  const normalizedDoNumbers = reconcileData
    .map(item => item.do_number)
    .filter((val): val is string => !!val) // buang null/undefined
    .map(removeThirdLastChar)

  const unmatchedDoNumbers = normalizedDoNumbers.filter(doNumber => !fuelSJSet.has(doNumber))

  return unmatchedDoNumbers;
  // Step 4: Tampilkan di console
  
}
