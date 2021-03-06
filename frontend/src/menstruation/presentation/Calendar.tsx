import React, { useState } from 'react';
import { utcDate } from '../../core/domain/dateService';
import './calendar.scss';

export interface Interval {
  start: Date;
  end: Date;
}

function range(endInclusive: number): Array<number> {
  return Array.from(Array(endInclusive + 1).keys());
}

function rest(array: Array<number>): Array<number> {
  const [, ...tail] = array;
  return tail;
}

export function offsetWithMonday([firstDay, ...restDays]: Date[]): Date[] {
  if (firstDay.getDay() === 1) {
    return [firstDay, ...restDays];
  }
  let dayIndex = firstDay.getDay();
  if (firstDay.getDay() === 0) {
    dayIndex = 7;
  }

  const offsetDays = range(dayIndex - 2)
    .reverse()
    .map((day) =>
      utcDate(firstDay.getFullYear(), firstDay.getMonth() + 1, -day)
    );
  return [...offsetDays, firstDay, ...restDays];
}

function isActive(
  day: Date,
  setStateFn: ((date: Date) => any) | undefined,
  startDate: Date | null,
  endDate: Date | null,
  activeIntervals: Interval[] | undefined,
  isInCurrentMonth: boolean
): boolean {
  if (!isInCurrentMonth) {
    return false;
  }
  if (setStateFn === undefined && activeIntervals) {
    const availableIntervals = activeIntervals.find(
      (interval) =>
        interval.start.getTime() <= day.getTime() &&
        day.getTime() <= interval.end.getTime()
    );
    return availableIntervals !== undefined;
  }
  return (
    (startDate && startDate.getTime() === day.getTime()) ||
    (endDate && endDate.getTime() === day.getTime()) ||
    ((startDate &&
      endDate &&
      startDate.getTime() < day.getTime() &&
      endDate.getTime() > day.getTime()) as boolean)
  );
}

function renderDayElement(
  day: Date,
  setStateFn: ((date: Date) => any) | undefined,
  startDate: Date | null,
  endDate: Date | null,
  activeIntervals: Interval[] | undefined,
  isInCurrentMonth: boolean
): JSX.Element {
  if (
    isActive(
      day,
      setStateFn,
      startDate,
      endDate,
      activeIntervals,
      isInCurrentMonth
    )
  ) {
    return <div className="active">{day.getDate()}</div>;
  }
  return <>{day.getDate()}</>;
}

function dayStateClass(
  day: Date,
  isInCurrentMonth: boolean,
  index: number
): string {
  let state = '';
  if (Math.floor(index / 7) % 2 === 0) {
    state += 'gray';
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (today.getTime() === day.getTime()) {
    state += ' today';
  }

  if (!isInCurrentMonth) {
    state += ' previousMonth';
  }
  return state;
}

function renderDay(
  setStateFn: ((date: Date) => any) | undefined,
  currentStartDate: Date | null,
  currentEndDate: Date | null,
  activeIntervals: Interval[] | undefined,
  currentMonth: number,
  onClickFn: ((date: Date) => any) | undefined
): (day: Date, index: number) => JSX.Element {
  return (day: Date, index: number) => {
    const isInCurrentMonth = day.getMonth() === currentMonth;
    const dayElement = renderDayElement(
      day,
      setStateFn,
      currentStartDate,
      currentEndDate,
      activeIntervals,
      isInCurrentMonth
    );
    const dayState = dayStateClass(day, isInCurrentMonth, index);
    if (setStateFn === undefined || !isInCurrentMonth) {
      if (onClickFn) {
        return (
          <section
            key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
            data-testid={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
            className={`calendar__month__day ${dayState}`}
            onClick={() => onClickFn(day)}
            aria-hidden="true"
          >
            {dayElement}
          </section>
        );
      }
      return (
        <section
          key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
          data-testid={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
          className={`calendar__month__day ${dayState}`}
        >
          {dayElement}
        </section>
      );
    }
    return (
      <section
        key={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
        data-testid={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
        className={`calendar__month__day ${dayState} cursor`}
        onClick={() => setStateFn(day)}
        aria-hidden="true"
      >
        {dayElement}
      </section>
    );
  };
}

function renderWeekDay(weekDay: string): JSX.Element {
  return (
    <section className="calendar__month__week_days__day" key={weekDay}>
      {weekDay}
    </section>
  );
}

function renderMonth(
  setStateFn: ((date: Date) => any) | undefined,
  currentStartDate: Date | null,
  currentEndDate: Date | null,
  activeIntervals: Interval[] | undefined,
  onClickFn: ((date: Date) => any) | undefined
): (monthDate: Date) => JSX.Element {
  return (monthDate) => {
    const month = monthDate.toLocaleString('en-us', { month: 'long' });
    const lastDay = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0
    );
    const days = rest(range(lastDay.getDate())).map(
      (day) => new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
    );
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const daysWithOffset = offsetWithMonday(days);
    return (
      <section className="calendar__month" key={monthDate.getMonth()}>
        <section className="calendar__month__title">
          {`${month} ${monthDate.getFullYear()}`}
        </section>
        <section className="calendar__month__week_days">
          {weekDays.map(renderWeekDay)}
        </section>
        {daysWithOffset.map(
          renderDay(
            setStateFn,
            currentStartDate,
            currentEndDate,
            activeIntervals,
            monthDate.getMonth(),
            onClickFn
          )
        )}
      </section>
    );
  };
}

function toggleState(
  startDate: Date | null,
  setStartDateFn: any,
  endDate: Date | null,
  setEndDateFn: any,
  intervalSelectionFn: ((interval: Interval) => any) | undefined
): ((date: Date) => any) | undefined {
  if (intervalSelectionFn === undefined) {
    return undefined;
  }
  return (date: Date) => {
    if (!startDate && !endDate) {
      setStartDateFn(date);
      intervalSelectionFn({ start: date, end: date });
    }
    if (startDate && !endDate && startDate.getTime() < date.getTime()) {
      setEndDateFn(date);
      intervalSelectionFn({ start: startDate, end: date });
    } else {
      setStartDateFn(date);
      setEndDateFn(undefined);
      intervalSelectionFn({ start: date, end: date });
    }
  };
}

export function Calendar({
  currentDate,
  previousMonths,
  upcomingMonths,
  intervalSelectionFn,
  activeIntervals,
  onClickFn,
  ...otherProps
}: {
  currentDate: Date;
  previousMonths: number;
  upcomingMonths: number;
  intervalSelectionFn?: (interval: Interval) => any;
  onClickFn?: (date: Date) => any;
  activeIntervals?: Interval[];
}): JSX.Element {
  if (onClickFn && intervalSelectionFn) {
    throw new Error(
      'Not allowed to set both intervalSelectionFn and onClickFn. Please use either one of them exclusively.'
    );
  }
  const [startDate, setStartDate] = useState<null | Date>(null);
  const [endDate, setEndDate] = useState<null | Date>(null);

  const upcomingRange = rest(range(upcomingMonths));
  const upcomingMonthRange = upcomingRange.map(
    (monthIncrease) =>
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + monthIncrease,
        1
      )
  );

  const previousRange = rest(range(previousMonths));
  const previousMonthRange = previousRange
    .reverse()
    .map(
      (monthIncrease) =>
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - monthIncrease,
          1
        )
    );

  const currentMonth = [
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
  ];
  const monthRange = previousMonthRange
    .concat(currentMonth)
    .concat(upcomingMonthRange);
  const stateFn = toggleState(
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    intervalSelectionFn
  );
  return (
    <section className="calendar" {...otherProps}>
      {monthRange.map(
        renderMonth(stateFn, startDate, endDate, activeIntervals, onClickFn)
      )}
    </section>
  );
}

Calendar.defaultProps = {
  intervalSelectionFn: undefined,
  onClickFn: undefined,
  activeIntervals: undefined,
};
