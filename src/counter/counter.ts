import {Config, DefaultConfig, Env, getConfig} from "../index";
import {NewRange, Range} from "../id/id";
import {jsonResponse} from "../node/node";

export class Counter implements DurableObject {
    state: DurableObjectState
    env: Env
    config: Config = DefaultConfig
    index: number = 0

    constructor(state: DurableObjectState, env: Env) {
        this.state = state
        this.env = env
        this.state.blockConcurrencyWhile(async () => {
            this.index = await this.state.storage?.get<number>('index') ?? 0
            this.config = await getConfig('node', env)
        })
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url)
        if (request.method === 'GET') {
            const size = parseInt(url.searchParams.get('size') ?? '100')
            const r: Range = NewRange(this.index, size)
            this.index += size + 1
            this.state.storage?.put<number>('index', this.index)
            return jsonResponse(JSON.stringify(r), 200, 'counter')
        }
        return new Response('not allowed', {status: 405})
    }

}