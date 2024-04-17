import * as dayjs from 'dayjs';
import * as uk from 'dayjs/locale/uk';
import * as updateLocale from 'dayjs/plugin/updateLocale';

dayjs.locale(uk);

dayjs.extend(updateLocale);

dayjs.updateLocale('uk', {
  weekdaysShort: [
    'Неділя',
    'Понеділок',
    'Вівторок',
    'Середа',
    'Четвер',
    "П'ятниця",
    'Субота',
  ],
  months: [
    'січня',
    'лютого',
    'березня',
    'квітня',
    'травня',
    'червня',
    'липня',
    'серпня',
    'вересня',
    'жовтня',
    'листопада',
    'грудня',
  ],
});

export const customDayjs = dayjs;
