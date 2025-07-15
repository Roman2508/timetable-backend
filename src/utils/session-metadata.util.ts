import { Request } from 'express';
import { lookup } from 'geoip-lite';
import * as countries from 'i18n-iso-countries';
import DeviceDetector = require('device-detector-js');

import { IS_DEV_ENV } from './is-dev.util';
import { SessionMetadata } from 'src/types/session-metadata.types';

// countries.registerLocale(require('i18n-iso-countries/langs/uk.json'));
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

export const getSessionMetadata = (req: Request, userAgent: string): SessionMetadata => {
  const ip = IS_DEV_ENV
    ? '173.166.164.121'
    : Array.isArray(req.headers['cf-connection-ip'])
      ? req.headers['cf-connection-ip'][0]
      : req.headers['cf-connection-ip'] ||
        (typeof req.headers['x-forwarded-for'] === 'string' ? req.headers['x-forwarded-for'].split(',')[0] : req.ip);

  const location = lookup(ip);

  const device = new DeviceDetector().parse(userAgent);

  return {
    ip,
    location: {
      country: countries.getName(location.country, 'en') || 'Невідомо',
      city: location.city || 'Невідомо',
      latitude: location.ll[0] || 0,
      longitude: location.ll[1] || 0,
    },
    device: {
      browser: device.client.name,
      os: device.os.name,
      type: device.device.type,
    },
  };
};
