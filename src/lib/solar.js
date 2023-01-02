// day of year
// https://stackoverflow.com/questions/8619879/javascript-calculate-the-day-of-the-year-1-366
export const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  var diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  var oneDay = 1000 * 60 * 60 * 24;
  var dayOfYear = Math.floor(diff / oneDay);
  return dayOfYear;
};

// add one day to date
// https://codingbeautydev.com/blog/javascript-add-one-day-to-date/
export const addDays = (date, i) => {
  const dateCopy = new Date(date);
  dateCopy.setDate(date.getDate() + i);
  return dateCopy;
};

// https://www.w3resource.com/javascript-exercises/javascript-math-exercise-33.php
export const deg2rad = (deg) => (deg * Math.PI) / 180;

// https://www.w3resource.com/javascript-exercises/javascript-math-exercise-34.php
export const rad2deg = (rad) => (rad * 180) / Math.PI;

// local standard time meridian
// https://www.pveducation.org/pvcdrom/properties-of-sunlight/the-suns-position
export const getLSTM = (deltaGMT) => 15 * deltaGMT;

// equation of time (in minutes)
// empirical equation that corrects for the eccentricity of the Earth's orbit and the Earth's axial tilt
export const getEOT = (dayOfYear) => {
  const B = (360 / 365) * (dayOfYear - 81) * Math.PI / 180;
  return 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);
};

// time correction factor (in minutes) accounts for the variation of the Local Solar Time (LST) within a given time zone due to the longitude variations within the time zone and also incorporates the EoT above
export const getTC = (EOT, lon, LSTM) => 4 * (lon - LSTM) + EOT;

// local solar time
export const getLST = (lt, TC) => lt + (TC / 60);

// hour angle converts the local solar time (LST) into the number of degrees which the sun moves across the sky
export const getHRA = (LST) => 15 * (LST - 12);

// declination angle
export const getDeclination = (dayOfYear) => 23.45 * Math.sin((360 / 365) * (dayOfYear - 81) * Math.PI / 180);

// elevation
export const getElevation = (declination, lat, HRA) => {
  const radDeclination = deg2rad(declination);
  const radLat = deg2rad(lat);
  const radHRA = deg2rad(HRA);
  const radElevation = Math.asin(Math.sin(radDeclination) * Math.sin(radLat) + Math.cos(radDeclination) * Math.cos(radLat) * Math.cos(radHRA));
  return rad2deg(radElevation);
};

// azimuth
export const getAzimuth = (declination, lat, HRA, elevation) => {
  const radDeclination = deg2rad(declination);
  const radLat = deg2rad(lat);
  const radHRA = deg2rad(HRA);
  const radElevation = deg2rad(elevation); 
  let radAzimuth = Math.acos((Math.sin(radDeclination) * Math.cos(radLat) - Math.cos(radDeclination) * Math.sin(radLat) * Math.cos(radHRA)) / Math.cos(radElevation));
  
  if (radHRA > 0) {
    radAzimuth = 2 * Math.PI - radAzimuth;
  }

  return rad2deg(radAzimuth);
};

// combined function to calculate sun position
export const getSunPosition = ({ dayOfYear, localTime, deltaGMT, lat, lon }) => {
  const LSTM = getLSTM(deltaGMT);
  const EOT = getEOT(dayOfYear);
  const TC = getTC(EOT, lon, LSTM);
  const LST = getLST(localTime, TC);
  const HRA = getHRA(LST);
  const declination = getDeclination(dayOfYear);
  const elevation = getElevation(declination, lat, HRA);
  const azimuth = getAzimuth(declination, lat, HRA, elevation);
  return [elevation, azimuth];
};