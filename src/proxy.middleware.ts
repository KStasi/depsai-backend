import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { ProxyService } from './proxy.service';
import * as httpProxy from 'express-http-proxy';

console.log(httpProxy);

@Injectable()
export class ProxyMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService,
    private readonly proxyService: ProxyService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    // console.log(req.hostname);

    const subdomain = req.hostname.split('.')[0];
    // console.log('subdomain', subdomain);
    // const domain = this.configService.get<string>('DOMAIN');

    if (subdomain === 'localhost' || subdomain === 'depsai') {
      // Default route for Server A
      return next();
    } else {
      if (!this.proxyService.childMap.has(subdomain)) {
        return res.status(404).send('Instance not found');
      }
      if (!this.proxyService.portMap.has(subdomain)) {
        return res.status(404).send('Instance not found');
      }

      if (this.proxyService.childMap.get(subdomain)?.killed) {
        return res.status(404).send('Instance expired');
      }
      const port = this.proxyService.portMap.get(subdomain);

      const instanceUrl = `http://localhost:${port}`;
      console.log('instanceUrl', instanceUrl);
      return this.proxyMiddleware(instanceUrl)(req, res, next);
    }
  }

  private proxyMiddleware(instanceUrl: string) {
    return httpProxy(instanceUrl, {
      proxyReqPathResolver: (req: Request) => {
        // Extract the subdomain and append it to the request URL
        return `${instanceUrl}${req.url}`;
      },
    });
  }
}
