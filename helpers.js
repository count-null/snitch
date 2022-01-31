export const sleep = (ms = 1000) => new Promise((r) => setTimeout(r, ms));
export const log = (msg) => console.log(msg);
