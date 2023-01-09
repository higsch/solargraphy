import { tsvParse, autoType } from 'd3';
import { getDayOfYear } from '$lib/solar';

export async function load({ fetch }) {
  const responseClouds = await fetch('/clouds_01975.tsv');
  const rawDataClouds = await responseClouds.text();

  const dataClouds = tsvParse(rawDataClouds).map(d => {
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

  const responseRadiation = await fetch('/radiation_01975.tsv');
  const rawDataRadiation = await responseRadiation.text();

  const dataRadiation = tsvParse(rawDataRadiation).map(d => {
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
    clouds: dataClouds,
    radiation: dataRadiation
  };
}