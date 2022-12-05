import {Node, parsePath} from "./node"
const env = getMiniflareBindings()

describe('parsePath', () => {
    test('should parse id', () => {
        expect(parsePath('/a/b')).toStrictEqual({id: 'a'})
    })
})

describe('Node', () => {
    test('get', async () => {

    })
})