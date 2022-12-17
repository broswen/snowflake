export interface ID {
    id: string
    node: number
    ts: number
    index: number
}

export interface Range {
    start: number
    end: number
    current: number
}

// NewRange returns a Range starting at start and ending at start+size
export function NewRange(start: number, size: number): Range {
    return {
        start,
        end: start + (size-1),
        current: start
    }
}

// percentUsed returns the percent (0-100) of how used range is
export function percentUsed(range: Range): number {
    return ((range.current - range.start + 1) / (range.end - range.start + 1)) * 100
}
