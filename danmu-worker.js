const BIN_ID = "69e48501856a6821894cd45d";
const ALLOWED_ORIGIN = "*";
const BAD = ["广告","微信","加我","二维码","私信","推广","代购","刷单","兼职","赚钱","丑","难听","垃圾","滚","死","傻","蠢","烂"];

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
    const key = env.JSONBIN_KEY;

    if (request.method === "GET") {
      const res = await fetch(url + "/latest", { headers: { "X-Master-Key": key } });
      const data = await res.json();
      return new Response(JSON.stringify(data), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    if (request.method === "PUT") {
      const body = await request.json();
      if (body.msgs) {
        body.msgs = body.msgs
          .map(s => String(s).replace(/<[^>]*>/g, "").trim().slice(0, 30))
          .filter(s => s.length > 0 && !BAD.some(w => s.includes(w)))
          .slice(-100);
      }
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-Master-Key": key },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      return new Response(JSON.stringify(data), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    return new Response("Method Not Allowed", { status: 405, headers: cors });
  },
};
