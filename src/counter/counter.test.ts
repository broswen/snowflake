import {Range} from "../id/id";

const env = getMiniflareBindings()

describe('Counter', () => {
    test('get first range', async () => {
        const id = env.COUNTER.newUniqueId()
        const storage = await getMiniflareDurableObjectStorage(id)
        const stub = env.COUNTER.get(id)
        const res = await stub.fetch('https://snowflake.broswen.com')
        expect(res.status).toEqual(200)
        expect(await res.json<Range>()).toEqual({
            start: 0,
            end: 99,
            current: 0
        })
    })
    test('get second range', async () => {
        const id = env.COUNTER.newUniqueId()
        const storage = await getMiniflareDurableObjectStorage(id)
        await storage.put('index', 100)
        const stub = env.COUNTER.get(id)
        const res = await stub.fetch('https://snowflake.broswen.com')
        expect(res.status).toEqual(200)
        expect(await res.json<Range>()).toEqual({
            start: 100,
            end: 199,
            current: 100
        })
    })
})