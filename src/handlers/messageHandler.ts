// src/handlers/messageHandler.ts
import { GROUP_WHITELIST } from "../group-whitelist";
import { getSockInstance } from "../class/whatsapp-socket";
import { handleDelayRefueling } from "../usecase/messagehandler/delay_refueling/handleDelayRefueling";
import { handleRitasiReport } from "../usecase/messagehandler/ritasi_report/handleRitasiReport";
import { handleFilterReplacement } from "../usecase/messagehandler/filter_replacement/handleFilterReplacement";
import { handleOilUsageReport } from "../usecase/messagehandler/oil_usage/handleOilUsageRecord";
import { handleDailyReport } from "../usecase/messagehandler/daily_report/handleDailyReport";
import { WASocket } from "@whiskeysockets/baileys";
import { handleOdosMessage } from "../usecase/messagehandler/odos/handleOdosMessage";
import { handleCheckOdosManually } from "../usecase/messagehandler/odos/handleOdosManually";
import { handleSetOdosStatus } from "../usecase/messagehandler/odos/handleSetOdosStatus";
import { handleGenerateWeeklyOdosReport } from "../usecase/cronScheduler/odos/generateWeeklyOdosReport";
import { handleMaterialSearch } from "../usecase/messagehandler/material_management/handleMaterialSearch";
import { handlePlanServiceReminder } from "../usecase/messagehandler/plan_service/handlePlanServiceReminder";
import { handleFtDailyCheck } from "../usecase/messagehandler/ft_daily_check/handleFtDailyCheck";

export const DEV_MODE: boolean = true;

type MessageHandler = {
  match: (groupId: string | null, header: string) => boolean;
  handler: (params: {
    groupId: string;
    header: string;
    message: string;
    sock?: WASocket | null;
  }) => Promise<void> | void;
};

const handlers: MessageHandler[] = [
  {
    match: (groupId, header) =>
      (groupId === GROUP_WHITELIST.SUPPLY || groupId === GROUP_WHITELIST.TEST) &&
      header.toUpperCase().includes("LAPORAN RITASI"),
    handler: handleRitasiReport,
  },
  {
    match: (groupId, header) =>
      (groupId === GROUP_WHITELIST.FAO || groupId === GROUP_WHITELIST.TEST) &&
      header.toUpperCase().includes("LAPORAN PENGGANTIAN FILTER"),
    handler: handleFilterReplacement,
  },
  {
    match: (groupId, header) =>
      (groupId === GROUP_WHITELIST.OLI || groupId === GROUP_WHITELIST.TEST) &&
      header.toUpperCase().includes("LAPORAN PEMAKAIAN OLI"),
    handler: handleOilUsageReport,
  },
  {
    match: (groupId, header) =>
      (groupId === GROUP_WHITELIST.TEST || groupId === GROUP_WHITELIST.FAO) &&
      header.toUpperCase().includes("REPORT DAILY FAO"),
    handler: handleDailyReport,
  },
  {
    match: (groupId, header) =>
      (groupId === GROUP_WHITELIST.TEST || groupId === GROUP_WHITELIST.FAO) &&
      header.toUpperCase().includes("DO2 VERSI SM"),
    handler: handleDelayRefueling,
  },
  {
    match: (groupId, header) =>
      (groupId === GROUP_WHITELIST.TEST || groupId === GROUP_WHITELIST.SM) &&
      header.toUpperCase().includes("ODOS HARI INI"),
    handler: handleOdosMessage,
  },
  {
    match: (groupId, header) =>
      (groupId === GROUP_WHITELIST.TEST || groupId === GROUP_WHITELIST.SM) &&
      header.toUpperCase().includes("#CEKODOS"),
    handler: handleCheckOdosManually,
  },
  {
  match: (groupId, header) =>
    (groupId === GROUP_WHITELIST.TEST || groupId === GROUP_WHITELIST.SM) &&
    header.toLowerCase().startsWith("#setodos"),
  handler: handleSetOdosStatus,
},

{
  match: (groupId, header) =>
    (groupId === GROUP_WHITELIST.TEST || groupId === GROUP_WHITELIST.SM) &&
    header.toLowerCase().startsWith("#odosweekly"),
  handler: handleGenerateWeeklyOdosReport,
},
{
  match: (groupId, header) =>
    groupId!.endsWith('@s.whatsapp.net') &&
    header.toLowerCase().startsWith("#odosweekly"),
  handler: handleGenerateWeeklyOdosReport,
},
  {
    match: (groupId, header) =>
       groupId!.endsWith('@s.whatsapp.net') &&
      header.toUpperCase().includes("#CEKODOS"),
    handler: handleCheckOdosManually,
  },
  {
    match: (groupId, header) =>
       groupId!.endsWith('@s.whatsapp.net') &&
      header.toUpperCase().includes("#CEKODOSYESTERDAY"),
    handler: handleCheckOdosManually,
  },
  {
  match: (chatId, header) =>
    header.toLowerCase().startsWith('#material'),
  handler: async ({ message, sock, groupId }) => {
    const keyword = message.replace(/^#material/i, '').trim();
    if (!keyword) {
      await sock?.sendMessage(groupId, { text: '❗ Gunakan format: #material <nama barang>' });
      return;
    }

    const reply = await handleMaterialSearch(keyword);
    await sock?.sendMessage(groupId, { text: reply });
  }
},
{
  match: (groupId, header) =>
    (groupId === GROUP_WHITELIST.TEST) &&
    header.toLowerCase().startsWith("#dailycheckft"),
  handler: handleFtDailyCheck,
},

{
  match: (groupId, header) =>
    (groupId === GROUP_WHITELIST.CCR || groupId === GROUP_WHITELIST.TEST) &&
    header.toUpperCase().startsWith("PLAN DPS A2B TODAY"),
  handler: handlePlanServiceReminder,
},

];

export async function handleMessage(
  message: string,
  timestamp: number,
  groupId: string | null
) {
  const lines = message.split("\n");
  const header = lines[0];
  const sockInstance = getSockInstance();

  const matched = handlers.find(({ match }) => match(groupId, header));

  if (matched && groupId) {
    await matched.handler({
      groupId,
      header,
      message,
      sock: sockInstance,
    });
  } else if (DEV_MODE) {
    console.log(`Message From ${groupId}`, message);
  }
}
