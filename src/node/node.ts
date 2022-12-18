import {Config, DefaultConfig, Env, getConfig} from "../index";
import {ID, percentUsed, Range} from "../id/id";
import Toucan from "toucan-js";

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
    id: number = -1
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
        this.id = parseInt(id)

        const sentry = new Toucan({
            dsn: this.env.SENTRY_DSN,
            request,
            tracesSampleRate: 1.0,
            environment: this.env.environment
        })
        sentry.setTag('node', this.id)

        if (url.pathname === '/node') {
            return jsonResponse({index: this.ranges}, 200, `${this.id}`)
        }

        if (request.method === 'GET') {

            // if no ranges exist, request new range from counter
            if (this.ranges.length < 1) {
                try {
                    await this.fetchRange()
                } catch (e) {
                    sentry.captureException(e)
                }
            }
            // find the lowest range for this node
            // increment current on range and use that index
            const index = this.ranges[0].current
            this.ranges[0].current++
            // if range is used, discard
            if (percentUsed(this.ranges[0]) > 100) {
                this.ranges = this.ranges.slice(1)
            }
            const ts = new Date().getTime()
            // if only one range exists, and it is almost empty, request a new range
            if (this.ranges.length === 1 && percentUsed(this.ranges[0]) > 90) {
                // don't await, do async
                try {
                    this.fetchRange()
                } catch (e) {
                    sentry.captureException(e)
                }
            }
            this.state.storage?.put('ranges', this.ranges)
            const id: ID = {
                id: `${ts}${this.id}${index}`,
                node: this.id,
                index: index,
                ts
            }
            if (this.env.environment === 'production') {
                this.env.NODE_DATA.writeDataPoint({
                    doubles: [index],
                    indexes: [`${this.id}`]
                })
            }

            return jsonResponse(id, 200, `${this.id}`)
        }
        return jsonResponse({error: 'not allowed'}, 405, `${this.id}`)
    }

    async fetchRange(): Promise<void> {
        const counter = this.env.COUNTER.idFromName("counter")
        const obj = this.env.COUNTER.get(counter)
        let res = await obj.fetch(`https://snowflake.broswen.com?size=${this.config.rangeSize}`)
        let newRange: Range = await res.json<Range>()
        this.ranges.push(newRange)
    }
}