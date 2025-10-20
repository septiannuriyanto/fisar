import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { id as idLocale } from 'date-fns/locale';

const jktTimezone = 'Asia/Jakarta';
const makassarTimezone = 'Asia/Makassar';

export function getCurrentJakartaTime() {
  return toZonedTime(new Date(), jktTimezone);
}
export function getCurrentMakassarTime() {
  return toZonedTime(new Date(), makassarTimezone);
}


export function formatDate(date: Date, formatStr = 'dd MMMM yyyy') {
  return format(date, formatStr, { locale: idLocale });
}
