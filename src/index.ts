import { createRestAPIClient, mastodon } from "masto";
import { calculate } from "./algorithm.js";

function givePerspective(client: mastodon.rest.Client, content: string, triggerId: string) {
    const matches = content.matchAll(/[0-9]+(\.[0-9]+)? [a-zA-Z]+/gm);
    let flag = false;
    let text = "Some Perspective:\n";
    for (const match of matches) {
        const parts = match[0].split(" ", 2);
        const result = calculate(parts[1], parseFloat(parts[0]));
        if (result != null) {
            text += `- ${match[0]} is approximately ${result.count} ${result.name}\n`;
            flag = true;
        }
    }
    if (flag) {
        client.v1.statuses.create({
            inReplyToId: triggerId,
            status: text
        });
    }
}

async function sleep(ms: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
}

async function loop(client: mastodon.rest.Client, startId: string | null): Promise<string | null> {
    for await (const notifications of client.v1.notifications.list({
        types: ["mention"],
        sinceId: startId == null ? undefined : startId
    })) {
        let id: string = startId;
        for (const notification of notifications) {
            if (notification.status.content.toLowerCase().includes("give")) {
                if (notification.status.inReplyToId) {
                    let status = await client.v1.statuses.$select(notification.status.inReplyToId).fetch();
                    givePerspective(client, status.content, notification.status.id);
                }
            }
            id = notification.status.id;
        }
        return id;
    }
}

const subscribe = async (): Promise<void> => {
    const client = createRestAPIClient({
        url: process.env.URL,
        accessToken: process.env.TOKEN
    });
    let sinceId = await process.env.SINCE_TOKEN || null;
    while (true) {
        sinceId = await loop(client, sinceId);
        await sleep(3000);
    }
}

await subscribe();
