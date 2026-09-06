import { TimezoneOption } from '@/lib/types/database';

export const COMMON_TIMEZONES: TimezoneOption[] = [
  { id: 'Asia/Karachi', label: 'Pakistan Standard Time (PKT)', offset: 'UTC+05:00', region: 'Asia' },
  { id: 'Asia/Dubai', label: 'Gulf Standard Time (GST) — Dubai / UAE', offset: 'UTC+04:00', region: 'Middle East' },
  { id: 'Asia/Riyadh', label: 'Arabia Standard Time (AST) — Saudi Arabia', offset: 'UTC+03:00', region: 'Middle East' },
  { id: 'Asia/Kolkata', label: 'India Standard Time (IST)', offset: 'UTC+05:30', region: 'Asia' },
  { id: 'Asia/Dhaka', label: 'Bangladesh Standard Time (BST)', offset: 'UTC+06:00', region: 'Asia' },
  { id: 'Asia/Istanbul', label: 'Turkey Time (TRT) — Istanbul', offset: 'UTC+03:00', region: 'Europe/Middle East' },
  { id: 'Europe/London', label: 'Greenwich Mean Time / BST — London', offset: 'UTC+00:00 / +01:00', region: 'Europe' },
  { id: 'America/New_York', label: 'Eastern Time (ET) — New York / Toronto', offset: 'UTC-05:00 / -04:00', region: 'Americas' },
  { id: 'America/Chicago', label: 'Central Time (CT) — Chicago / Texas', offset: 'UTC-06:00 / -05:00', region: 'Americas' },
  { id: 'America/Los_Angeles', label: 'Pacific Time (PT) — Los Angeles / Vancouver', offset: 'UTC-08:00 / -07:00', region: 'Americas' },
  { id: 'Australia/Sydney', label: 'Australian Eastern Time (AEST) — Sydney', offset: 'UTC+10:00 / +11:00', region: 'Oceania' },
  { id: 'UTC', label: 'Coordinated Universal Time (UTC)', offset: 'UTC+00:00', region: 'Universal' },
];

/**
 * Parses local date (YYYY-MM-DD) and time (HH:MM) in target IANA timezone and returns UTC ISO string.
 */
export function convertLocalToUTC(dateStr: string, timeStr: string, timeZone: string): string {
  // Build a test date
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // We find the UTC time whose formatted date/time in `timeZone` matches `year, month, day, hours, minutes`
  const targetTimeMs = Date.UTC(year, month - 1, day, hours, minutes, 0);
  
  // Initial estimate
  let guess = new Date(targetTimeMs);

  for (let i = 0; i < 3; i++) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(guess);
    const p: Record<string, string> = {};
    parts.forEach((part) => {
      p[part.type] = part.value;
    });

    const formattedYear = parseInt(p.year, 10);
    const formattedMonth = parseInt(p.month, 10);
    const formattedDay = parseInt(p.day, 10);
    let formattedHour = parseInt(p.hour, 10);
    if (formattedHour === 24) formattedHour = 0;
    const formattedMinute = parseInt(p.minute, 10);

    const formattedUtcMs = Date.UTC(
      formattedYear,
      formattedMonth - 1,
      formattedDay,
      formattedHour,
      formattedMinute,
      0
    );

    const diff = targetTimeMs - formattedUtcMs;
    if (diff === 0) {
      break;
    }
    guess = new Date(guess.getTime() + diff);
  }

  return guess.toISOString();
}

/**
 * Formats a UTC ISO string into user's local timezone date/time representation.
 */
export function formatScheduledDateTime(utcIsoStr: string, timeZone: string): string {
  try {
    const date = new Date(utcIsoStr);
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch {
    return utcIsoStr;
  }
}

/**
 * Returns clean local date (YYYY-MM-DD) and time (HH:MM) parts from UTC ISO in target timezone.
 */
export function getLocalDateAndTime(utcIsoStr: string, timeZone: string): { dateStr: string; timeStr: string; formattedTime: string } {
  try {
    const date = new Date(utcIsoStr);
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const p: Record<string, string> = {};
    parts.forEach((part) => {
      p[part.type] = part.value;
    });

    let hour = p.hour;
    if (hour === '24') hour = '00';
    const dateStr = `${p.year}-${p.month}-${p.day}`;
    const timeStr = `${hour}:${p.minute}`;

    const formattedTime = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);

    return { dateStr, timeStr, formattedTime };
  } catch {
    return { dateStr: '', timeStr: '', formattedTime: '' };
  }
}

/**
 * Checks if target UTC ISO string is in the future.
 * bufferSeconds: Allows a small tolerance (e.g. at least 30 seconds ahead).
 */
export function isFutureUTC(utcIsoStr: string, bufferSeconds = 30): boolean {
  try {
    const scheduledTime = new Date(utcIsoStr).getTime();
    const now = Date.now();
    return scheduledTime > now + bufferSeconds * 1000;
  } catch {
    return false;
  }
}
