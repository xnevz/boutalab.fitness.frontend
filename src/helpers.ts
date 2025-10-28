import dayjs, { Dayjs } from "dayjs";



// how many days before the payment is due
export const MAX_DAYS_TO_PAY = 5;

export function daysToPay(date: Dayjs, daysPaid?: number) {
    return date.add(daysPaid ?? 30, 'day').diff(dayjs().startOf('day'), 'day');
}