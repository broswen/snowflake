import { handler } from './index'

class ExecutionContext {
    promises = [];
    waitUntil(promise: Promise<void>) {}
    passThroughOnException() {}
}

const env = getMiniflareBindings()
describe('fetch handler', () => {
    test('', async () => {
    })
})