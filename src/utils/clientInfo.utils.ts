import { Request } from 'express'
import ipaddr from 'ipaddr.js'
import useragent from 'useragent'

const getDeviceInformation = (reqUserAgent: string) => {
  const agent = useragent.parse(reqUserAgent)
  const data = {
    browser: {
      name: `${agent.family}`,
      version: `${agent.major}.${agent.minor}.${agent.patch}`
    },
    device: {
      name: `${agent.device.family}`,
      version: `${agent.device.major}.${agent.device.minor}.${agent.device.patch}`
    },
    os: {
      name: `${agent.os.family}`,
      version: `${agent.os.major}.${agent.os.minor}.${agent.os.patch}`
    }
  }
  return data
}

const getCallerIP = (req: Request) => {
  const ipString = req.ip || '' // getClientIP(req)

  if (ipaddr.isValid(ipString)) {
    try {
      const addr = ipaddr.parse(ipString)
      // @ts-ignore
      if (ipaddr.IPv6.isValid(ipString) && addr.isIPv4MappedAddress()) {
        // @ts-ignore
        return addr.toIPv4Address().toString()
      }
      return addr.toNormalizedString()
    } catch (e) {
      return ipString
    }
  }
  return null
}

export function clientInfo(req: Request) {
  const agent = getDeviceInformation(req.get('user-agent') || '')
  const ip = getCallerIP(req)
  return {
    agent,
    ip
  }
}
