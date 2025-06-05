import { format, isSameDay, parseISO, addMonths, isWithinInterval } from 'date-fns';

export const formatDate = (date: string) => {
  return format(parseISO(date), 'MMMM dd');
};

export const isBirthdayToday = (birthday: string) => {
  const today = new Date();
  const birthdayDate = parseISO(birthday);
  return isSameDay(
    new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate()),
    today
  );
};

export const isUpcomingBirthday = (birthday: string) => {
  const today = new Date();
  const endDate = addMonths(today, 1);
  const birthdayDate = parseISO(birthday);
  const thisYearBirthday = new Date(
    today.getFullYear(),
    birthdayDate.getMonth(),
    birthdayDate.getDate()
  );

  return isWithinInterval(thisYearBirthday, { start: today, end: endDate });
};