import {percentUsed, Range} from "./id";


describe('range', () => {
    test('should return 35% used', () => {
        let r: Range = {
            start: 0,
            end: 100,
            current: 35
        }
        expect(percentUsed(r)).toEqual(35)
        r = {
            start: 101,
            end: 201,
            current: 136
        }
        expect(percentUsed(r)).toEqual(35)
    })
})