import handler from "./api/index.js";
const req = { url: "/api/health", method: "GET", headers: {} };
const res = { 
  status: (c: number) => { console.log("Status:", c); return res; }, 
  json: (d: any) => { console.log("Data:", d); },
  send: (d: any) => { console.log("Send:", d); }
};
handler(req as any, res as any).catch(console.error);
