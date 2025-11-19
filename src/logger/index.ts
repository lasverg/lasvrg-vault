import { pino } from 'pino'
import dayjs from 'dayjs'

// import os from 'os'

// os.freemem()
// os.totalmem()

const log = pino({
  levelComparison: 'DESC',
  base: {
    pid: false
  },
  timestamp: () => `,"time":"${dayjs().format()}"`
})

export default log

// lasverg.io.		1800	IN	SOA	osmar.ns.cloudflare.com. dns.cloudflare.com. 2358440507 10000 2400 604800 1800
