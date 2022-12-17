import {Node, parsePath} from "./node"
import {Range} from "../id/id";
const env = getMiniflareBindings()

describe('parsePath', () => {
    test('should parse id', () => {
        expect(parsePath('/a/b')).toStrictEqual({id: 'a'})
    })
})

describe('Node', () => {
    test('get should return next id', async () => {
        const id = env.NODE.newUniqueId()
        const storage = await getMiniflareDurableObjectStorage(id)
        await storage.put('ranges', [{
            start: 0,
            end: 100,
            current: 0
        }])
        const now = new Date()
        jest.useFakeTimers().setSystemTime(now)
        const stub = env.NODE.get(id)
        let res = await stub.fetch('https://snowflake.broswen.com/1')
        expect(res.status).toEqual(200)
        expect(await res.json<Range>()).toEqual({
            id: `${now.getTime()}${1}${0}`,
            index: 0,
            node: 1,
            ts: now.getTime()
        })

        res = await stub.fetch('https://snowflake.broswen.com/1')
        expect(res.status).toEqual(200)
        expect(await res.json<Range>()).toEqual({
            id: `${now.getTime()}${1}${1}`,
            index: 1,
            node: 1,
            ts: now.getTime()
        })
    })

    test('get should return id from next range', async () => {
        const nodeId = env.NODE.idFromName('1')
        const counterId = env.COUNTER.idFromName('counter')
        const nodeStorage = await getMiniflareDurableObjectStorage(nodeId)
        const counterStorage = await getMiniflareDurableObjectStorage(counterId)
        await nodeStorage.put('ranges', [{
            start: 0,
            end: 100,
            current: 100
        }])
        await counterStorage.put('index', 101)
        const now = new Date()
        jest.useFakeTimers().setSystemTime(now)
        const stub = env.NODE.get(nodeId)
        let res = await stub.fetch('https://snowflake.broswen.com/1')
        expect(res.status).toEqual(200)
        expect(await res.json<Range>()).toEqual({
            id: `${now.getTime()}${1}${100}`,
            index: 100,
            node: 1,
            ts: now.getTime()
        })

        res = await stub.fetch('https://snowflake.broswen.com/1')
        expect(res.status).toEqual(200)
        expect(await res.json<Range>()).toEqual({
            id: `${now.getTime()}${1}${101}`,
            index: 101,
            node: 1,
            ts: now.getTime()
        })
        expect(await nodeStorage.get<Range[]>('ranges')).toEqual([{start: 101, end: 201, current: 102}])
    })
})