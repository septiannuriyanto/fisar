import { odosReminder } from "../../cronScheduler/odos/odosReminder";
import { MessageHandlerParams } from "../messageHandlerParams";

export async function handleCheckOdosManually({
  message,
  sock,
  groupId,
}: MessageHandlerParams) {
  if (message.toLowerCase().includes("yesterday")) {
    await odosReminder({ timeOfDay: "yesterday", groupId: groupId });
    console.log(`✅ Check ODOS today manually executed.`);
  }
  else{
await odosReminder({ timeOfDay: "justInTime", groupId: groupId });
    console.log(`✅ Check ODOS yesterday manually executed.`);
  }
}
