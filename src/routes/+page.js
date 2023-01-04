import { tsvParse, autoType } from 'd3';
import { getDayOfYear } from '$lib/solar';

export async function load({ fetch }) {
  const response = await fetch('/clouds_01975.tsv');
  const rawData = await response.text();

  const data = tsvParse(rawData).map(d => {
    const parsed = autoType(d);
    const hour = parsed.date.getHours();
    const minute = parsed.date.getMinutes();
    return {
      ...parsed,
      ms: parsed.date.getTime(),
      dayOfYear: getDayOfYear(parsed.date),
      hour,
      minute
    }
  });

  return {
    clouds: data
  };
}