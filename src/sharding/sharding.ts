let encoder: TextEncoder | null = null

export function nodeURL(node: string): string {
    let url = `https://snowflake.broswen.com/${node}`
    return url
}

export async function hash(value: string): Promise<number> {
    if(encoder === null) {
        encoder = new TextEncoder()
    }
    const data = encoder.encode(value)
    const buf = await crypto.subtle.digest('SHA-1', data)
    const dv = new DataView(buf)
    return dv.getUint32(0)
}

function jumpConsistentHash(key: number, buckets: number): number {
    let k = BigInt(key)
    let b = BigInt(-1);
    let j = BigInt(0);
    while (j < buckets) {
        b = j;
        k =
            ((k * BigInt(2862933555777941757)) % BigInt(2) ** BigInt(64)) +
            BigInt(1);
        j = BigInt(
            Math.floor(
                ((Number(b) + 1) * Number(BigInt(1) << BigInt(31))) /
                Number((k >> BigInt(33)) + BigInt(1))
            )
        );
    }
    return Number(b);
}

export async function rank(key: string, shard: number): Promise<number> {
    if(encoder === null) {
        encoder = new TextEncoder()
    }
    const data = encoder.encode(`${key}${shard}`)
    const buf = await crypto.subtle.digest('SHA-1', data)
    const dv = new DataView(buf)
    return dv.getUint32(0)
}

export async function rendezvousHash(key: string, buckets: number): Promise<number> {
    let maxIndex = 0
    let maxValue = 0
    for (let i = 0; i < buckets; i++) {
        const value = await rank(key, i)
        if (value > maxValue) {
            maxIndex = i
            maxValue = value
        }
    }
    return maxIndex
}
