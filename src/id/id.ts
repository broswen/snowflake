export interface ID {
    node: number
    ts: number
    index: number
}

export interface Range {
    start: number
    end: number
    current: number
}

export function NewRange(start: number, size: number): Range {
    return {
        start,
        end: start + size,
        current: start
    }
}

export function percentUsed(range: Range): number {
    return ((range.current - range.start) / (range.end - range.start)) * 100
}
