import { tsvParse, autoType } from 'd3';

export async function load({ fetch }) {
  // const responseRadiation = await fetch('/radiation_bremen_2022_k10.tsv');
	const responseRadiation = await fetch('/radiation_mannheim_2022_k10.tsv');
  // const responseRadiation = await fetch('/radiation_hamburg_2022_k10.tsv');
  // const responseRadiation = await fetch('/radiation_mannheim_2020_k10.tsv');
  // const responseRadiation = await fetch('/radiation_stockholm_2019_k60.tsv');
  // const responseRadiation = await fetch('/radiation_weihenstephan_2013_k10.tsv');
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