import { tsvParse, autoType } from 'd3';
import { getDayOfYear } from '$lib/solar';

export async function load({ fetch }) {
  const responseRadiation = await fetch('/radiation_stockholm_2019_k60.tsv');
  const rawDataRadiation = await responseRadiation.text();

  const dataRadiation = tsvParse(rawDataRadiation).map(d => {
    const parsed = autoType(d);
    return {
      ...parsed,
      radiation: parsed.global_radiation_rolling
    }
  });

  return {
    radiation: dataRadiation
  };
}