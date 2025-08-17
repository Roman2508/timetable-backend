import * as dayjs from 'dayjs'
import * as uk from 'dayjs/locale/uk'
import * as updateLocale from 'dayjs/plugin/updateLocale'
import * as customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.locale(uk)

dayjs.extend(updateLocale)
dayjs.extend(customParseFormat)

dayjs.updateLocale('uk', {
  weekdaysShort: ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', "П'ятниця", 'Субота'],
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
})

export const customDayjs = dayjs
