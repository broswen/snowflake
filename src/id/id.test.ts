import {NewRange, percentUsed, Range} from "./id";


describe('range', () => {
    test('should return 0-99', () => {
        expect(NewRange(0,100)).toEqual({
            start: 0,
            end: 99,
            current: 0
        })
    })
    test('should return 100-199', () => {
        expect(NewRange(100,100)).toEqual({
            start: 100,
            end: 199,
            current: 100
        })
    })
    test('should return 35% used', () => {
        let r: Range = {
            start: 0,
            end: 99,
            current: 34
        }
        expect(percentUsed(r)).toEqual(35)
        r = {
            start: 100,
            end: 199,
            current: 134
        }
        expect(percentUsed(r)).toEqual(35)
    })
    test('should return 100% used', () => {
        let r: Range = {
            start: 0,
            end: 99,
            current: 99
        }
        expect(percentUsed(r)).toEqual(100)
        r = {
            start: 100,
            end: 199,
            current: 199
        }
        expect(percentUsed(r)).toEqual(100)
    })
})