import Toucan from "toucan-js"
import {nodeURL, rendezvousHash} from "./sharding/sharding";
import {jsonResponse} from "./node/node";
export {Node} from './node/node'
export {Counter} from './counter/counter'

export interface Config {
	nodeCount: number
	rangeSize: number
}

export const DefaultConfig: Config = {
	nodeCount: 10,
	rangeSize: 100
}

export interface WorkerAnalyticsNamespace {
	writeDataPoint(data: DataPoint): void
}

export interface DataPoint {
	blobs?: string[]
	doubles?: number[]
	indexes?: string[]
}

export interface Env {
	CONFIG: KVNamespace
	COUNTER: DurableObjectNamespace
	NODE: DurableObjectNamespace
	NODE_DATA: WorkerAnalyticsNamespace
	COUNTER_DATA: WorkerAnalyticsNamespace
	SENTRY_DSN: string
	environment: string
}

export async function getConfig(key: string, env: Env): Promise<Config> {
	let data = '{}'
	try {
		data = await env.CONFIG.get(key) ?? '{}'
	} catch (e) {
		console.log(`couldn't get ${key} config from kv`)
	}
	const parsedConfig = JSON.parse(data)
	let config = DefaultConfig
	Object.assign(config, DefaultConfig, parsedConfig)
	return config
}

export default {
	fetch: handler
};


export async function handler(
	request: Request,
	env: Env,
	ctx: ExecutionContext
): Promise<Response> {
	const sentry = new Toucan({
		dsn: env.SENTRY_DSN,
		request,
		context: ctx,
		tracesSampleRate: 1.0,
		environment: env.environment
	})
	const config = await getConfig('node', env)
	const url = new URL(request.url)
	const ip = request.headers.get('cf-connecting-ip') ?? ''

	if (url.pathname === '/counter') {
		const counter = env.COUNTER.idFromName("counter")
		const obj = env.COUNTER.get(counter)
		return obj.fetch(request)
	}

	if (request.method === 'GET') {
		// use key + ip for node hash, help distribute reads
		const nodeId = `${await rendezvousHash(ip, config.nodeCount)}`
		const nodeUrl = nodeURL(nodeId)
		const id = env.NODE.idFromName(nodeId)
		const obj = env.NODE.get(id)
		if (url.pathname === '/node') {
			return obj.fetch(request)
		}
		try {
			return obj.fetch(new Request(nodeUrl))
		} catch (e) {
			sentry.captureException(e)
			return jsonResponse({error: 'internal server error'}, 500)
		}
	}
	return jsonResponse({error: 'not allowed'}, 405)
}
