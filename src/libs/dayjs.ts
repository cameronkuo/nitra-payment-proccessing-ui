import dayjs from 'dayjs';
import localeEN from 'dayjs/locale/en';
import localeAU from 'dayjs/locale/en-au';
import localeZH from 'dayjs/locale/zh-tw';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

declare module 'dayjs' {
  interface Dayjs {
    /**
     * This indicates whether the Day.js object is between two other supplied date-times.
     * @param start The start date-time to compare against.
     * @param end The end date-time to compare against.
     * @returns
     */
    isBetween: (start: ConfigType, end: ConfigType) => boolean;
    /**
     * Adds business days to the current date.
     * @param days The number of business days to add.
     * @returns A new Day.js object with the added business days.
     */
    addBusinessDays: (days: number) => Dayjs;
  }
}

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.extend(function (option, dayjsClass) {
  const oldFormat = dayjsClass.prototype.format.bind(dayjsClass.prototype);
  const oldDiff = dayjsClass.prototype.diff.bind(dayjsClass.prototype);
  dayjsClass.prototype.format = function (args) {
    return this.isValid() ? oldFormat.call(this, args ?? 'YYYY-MM-DD') : '';
  };
  dayjsClass.prototype.diff = function (...args) {
    // default add 1 day
    return this.isValid() ? oldDiff.call(this, ...args) + 1 : 0;
  };
  dayjsClass.prototype.isBetween = function (start, end) {
    return this.isAfter(start) && this.isBefore(end);
  };
  dayjsClass.prototype.addBusinessDays = function (days: number) {
    let count = 0;
    let result = this.clone();
    while (count < days) {
      result = result.add(1, 'day');
      if (result.day() !== 0 && result.day() !== 6) {
        // Skip Sunday and Saturday
        count++;
      }
    }
    return result;
  };
});

dayjs.locale(
  'en',
  {
    ...localeEN,
    relativeTime: localeAU.relativeTime, // "dayjs/locale/en" 的 relativeTime 有 bug
  },
  true,
);

dayjs.locale(
  'zh',
  {
    ...localeZH,
    relativeTime: localeZH.relativeTime,
  },
  true,
);

dayjs.tz.setDefault('Asia/Taipei');

export default dayjs;
