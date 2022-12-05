import {Config, DefaultConfig, Env, getConfig} from "../index";
import {Range} from "../id/id";

export function parsePath(path: string): {id: string} {
    const details = {
        id: ''
    }
    const parts = path.split('/')
    if (parts.length > 1) {
        details.id = parts[1]
    }
    return details
}

export function jsonResponse(body: unknown, status: number, id: string = '-1'): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Node': id,
            'Content-Type': 'application/json'
        }
    })
}

export class Node implements DurableObject {
    state: DurableObjectState
    env: Env
    config: Config = DefaultConfig
    id: string = ''
    ranges: Range[] = []
    constructor(state: DurableObjectState, env: Env) {
        this.state = state
        this.env = env
        this.state.blockConcurrencyWhile(async () => {
            this.ranges = await this.state.storage?.get<Range[]>('ranges') ?? []
            this.config = await getConfig('node', env)
        })
    }

    async fetch(request: Request): Promise<Response> {
        const url = new URL(request.url)
        const {id} = parsePath(url.pathname)
        this.id = id

        if (request.method === 'GET') {

            // if no ranges exist, request new range from counter
            // find the lowest range for this node
            // increment current on range and use that index
            // if current is greater than end, remove range
            // if no more ranges, request a new range
            // if only one range exists and it is almost empty, request a new range
            this.state.storage?.put('ranges', this.ranges)
            return jsonResponse('', 200, this.id)
        }
        return jsonResponse({error: 'not allowed'}, 405, this.id)
    }
}