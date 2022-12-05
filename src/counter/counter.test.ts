import {Range} from "../id/id";

const env = getMiniflareBindings()

describe('Counter', () => {
    test('get first range', async () => {
        const id = env.COUNTER.newUniqueId()
        const storage = await getMiniflareDurableObjectStorage(id)
        const stub = env.COUNTER.get(id)
        const res = await stub.fetch('https://snowflake.broswen.com/counter')
        expect(res.status).toEqual(200)
        expect(await res.json<Range>()).toStrictEqual({
            start: 0,
            end: 100,
            current: 0
        })
    })
    test('get second range', async () => {
        const id = env.COUNTER.newUniqueId()
        const storage = await getMiniflareDurableObjectStorage(id)
        await storage.put('index', 101)
        const stub = env.COUNTER.get(id)
        const res = await stub.fetch('https://snowflake.broswen.com/counter')
        expect(res.status).toEqual(200)
        expect(await res.json<Range>()).toStrictEqual({
            start: 101,
            end: 201,
            current: 101
        })
    })
})