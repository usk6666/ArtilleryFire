import { LOG_ITEM_NAME } from "./Constants";

function _zeroPad2(int) {
  return ("00" + String(int)).slice(-2)
}

export function getCurrentDatetime() {

  const now = new Date();
  return `${now.getFullYear()}/${_zeroPad2(now.getMonth() + 1)}/${_zeroPad2(now.getDate())} ${_zeroPad2(now.getHours())}:${_zeroPad2(now.getMinutes())}:${_zeroPad2(now.getSeconds())}`;
}

export function initLogs() {
  localStorage.setItem(LOG_ITEM_NAME, JSON.stringify([]));
}

export function getLogs() {

  let l = localStorage.getItem(LOG_ITEM_NAME);
  if (!l) {
    initLogs();
    l = localStorage.getItem(LOG_ITEM_NAME);
  }
  return JSON.parse(l);
}
