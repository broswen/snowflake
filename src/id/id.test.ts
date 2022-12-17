import {percentUsed, Range} from "./id";


describe('range', () => {
    test('test percent used', () => {
        const r: Range = {
            start: 0,
            end: 100,
            current: 35
        }
        expect(percentUsed(r)).toEqual(35)
    })
    test('test percent used', () => {
        const r: Range = {
            start: 101,
            end: 201,
            current: 136
        }
        expect(percentUsed(r)).toEqual(35)
    })
})