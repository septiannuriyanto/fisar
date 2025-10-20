import puppeteer from "puppeteer";
import { supabase } from "../../../supabaseClient";
import fs from "fs";
import { format, getISOWeek } from "date-fns";
import { id } from "date-fns/locale";
import { getMonthWeekNum } from "./generateWeeklyOdosReport";

export interface OdosReportItem {
  nickname: string;
  weekly_days: number;
  weekly_percent: number;
  monthly_days: number;
  monthly_percent: number;
  offsite_range: string | null; // <- tambahan kolom remark
}



export function generateOdosHTML(reportData: OdosReportItem[]): string {
  const labels = reportData.map(r => r.nickname);
  const weeklyData = reportData.map(r => r.weekly_percent);
  const monthlyData = reportData.map(r => r.monthly_percent);

  const now = new Date();
  const weekNum = getMonthWeekNum(now);
  const monthName = format(now, "LLLL", { locale: id });
  const year = now.getFullYear();

  const tableRows = reportData.map(r => {
    const highlight = r.weekly_days === 0 ? ' style="background-color:#ffcccc;font-weight:bold;"' : '';
    const remark = r.offsite_range ? `Offsite ${r.offsite_range}` : "";
    return `
      <tr${highlight}>
        <td>${r.nickname}</td>
        <td>${r.weekly_days}</td>
        <td>${r.weekly_percent}%</td>
        <td>${r.monthly_days}</td>
        <td>${r.monthly_percent}%</td>
        <td>${remark}</td>
      </tr>
    `;
  }).join("");

  return `
  <html>
    <head>
      <meta charset="UTF-8">
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>
      <style>
        @page { size: A4 landscape; margin: 20px; }
        body { font-family: Arial, sans-serif; padding: 20px; }
        h2 { text-align: center; margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: center; }
        th { background-color: #f2f2f2; }
        canvas { margin: auto; display: block; max-width: 100%; }
      </style>
    </head>
    <body>
      <h2>📊 Laporan ODOS Week ${weekNum} Bulan ${monthName} Tahun ${year}</h2>
      <canvas id="chart" width="1100" height="400"></canvas>
      <table>
        <thead>
          <tr>
            <th>Nickname</th>
            <th>Weekly Days</th>
            <th>Weekly %</th>
            <th>Monthly Days</th>
            <th>Monthly %</th>
            <th>Remark</th> <!-- Kolom remark -->
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
      <script>
  const ctx = document.getElementById('chart').getContext('2d');
  const weeklyData = ${JSON.stringify(weeklyData)};
  const monthlyData = ${JSON.stringify(monthlyData)};

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ${JSON.stringify(labels)},
      datasets: [
        {
          label: 'Weekly %',
          data: weeklyData,
          backgroundColor: 'rgba(54, 162, 235, 0.7)',
          datalabels: {
            color: 'rgba(54, 162, 235, 1)', // biru
            font: { weight: 'bold' }
          }
        },
        {
          label: 'Monthly %',
          data: monthlyData,
          backgroundColor: 'rgba(255, 159, 64, 0.7)',
          datalabels: {
            color: 'rgba(255, 159, 64, 1)', // oranye
            font: { weight: 'bold' }
          }
        }
      ]
    },
    options: {
      responsive: false,
      plugins: {
        legend: { position: 'bottom' },
        datalabels: {
          anchor: 'end',
          align: (ctx) => {
            const value = ctx.dataset.data[ctx.dataIndex];
            return value === 0 ? 'start' : 'end'; // 0% geser ke atas
          },
          offset: (ctx) => {
            const value = ctx.dataset.data[ctx.dataIndex];
            return value === 0 ? -14 : 4; // 0% naik supaya gak nabrak axis
          },
          formatter: (value) => value + '%',
          clip: false
        }
      },
      scales: {
        y: { beginAtZero: true, max: 100 }
      }
    },
    plugins: [ChartDataLabels]
  });
</script>

    </body>
  </html>`;
}



export async function exportOdosReport(reportData: OdosReportItem[]): Promise<string> {
  const html = generateOdosHTML(reportData);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const buffer = await page.screenshot({ type: "png", fullPage: true });
  await browser.close();

  const filename = `odos-report-${Date.now()}.png`;
  fs.writeFileSync(filename, buffer);
  return filename;
}

export async function getOdosReportData(): Promise<OdosReportItem[]> {
  const { data, error } = await supabase.rpc('odos_weekly_report');
  if (error) throw new Error(error.message);
  return data || [];
}

