import fetch from "node-fetch";

const nightscoutUrl = process.env.NIGHTSCOUT_URL ?? "http://localhost:1337";
const nightscoutSecret = process.env.NIGHTSCOUT_SECRET ?? "yoursecret";

let lastBG = 110;

function simulateBG(t: number): number {
    const day = 86400 * 1000;
    const x = (t % day) / day;

    const w1 = Math.sin(x * 2 * Math.PI * 3) * 40;
    const w2 = Math.sin(x * 2 * Math.PI * 7) * 25;
    const w3 = Math.sin(x * 2 * Math.PI * 11 + 1) * 18;

    if (Math.random() < 0.06) {
        lastBG += (Math.random() - 0.5) * 80;
    }
    lastBG += (Math.random() - 0.5) * 5;

    const noise = (Math.random() - 0.5) * 15;
    const value = 115 + w1 + w2 + w3 + (lastBG - 115) * 0.35 + noise;

    lastBG = Math.round(Math.min(400, Math.max(40, value)));
    return lastBG;
}

function direction(delta: number): string {
    if (delta > 12) return "DoubleUp";
    if (delta > 6) return "SingleUp";
    if (delta > 2) return "FortyFiveUp";
    if (delta < -12) return "DoubleDown";
    if (delta < -6) return "SingleDown";
    if (delta < -2) return "FortyFiveDown";
    return "Flat";
}

async function backfill() {
    const baseUrl = nightscoutUrl.replace(/\/$/, "");
    const now = Date.now();
    const tenHoursAgo = now - 10 * 60 * 60 * 1000;
    const intervalMs = 5 * 60 * 1000;

    const timestamps: number[] = [];
    for (let t = tenHoursAgo; t <= now; t += intervalMs) {
        timestamps.push(t);
    }

    console.log(`Sending ${timestamps.length} entries (${new Date(tenHoursAgo).toISOString()} → now)`);

    let prevBG = lastBG;

    for (const ts of timestamps) {
        const bg = simulateBG(ts);
        const delta = bg - prevBG;

        const entry = {
            date: ts,
            dateString: new Date(ts).toISOString(),
            sysTime: new Date(ts).toISOString(),
            device: "xDrip-DexcomG5",
            sgv: bg,
            direction: direction(delta),
            delta,
            noise: 1,
            rssi: 100,
            filtered: 0,
            unfiltered: 0,
            utcOffset: 60,
        };

        prevBG = bg;

        const res = await fetch(`${baseUrl}/api/v1/entries`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-secret": nightscoutSecret,
            },
            body: JSON.stringify([entry]),
        });

        if (!res.ok) {
            console.error(`Failed at ${new Date(ts).toISOString()}: ${res.status} ${await res.text()}`);
        } else {
            console.log(`${new Date(ts).toISOString()}  BG=${bg}  dir=${direction(delta)}`);
        }
    }

    console.log("Done!");
}

backfill().catch(console.error);
