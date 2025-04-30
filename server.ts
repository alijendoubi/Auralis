import { APP_BASE_HREF } from '@angular/common';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readFileSync } from 'node:fs';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, 'dist/med-clinic/browser');
  const indexHtml = join(browserDistFolder, 'index.html');

  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular app
  server.get('*', (req, res, next) => {
    try {
      // Read index.html
      const html = readFileSync(indexHtml, 'utf-8');
      
      // Send the HTML with the app base href set
      res.send(html.replace(
        '<base href="/">', 
        `<base href="${req.baseUrl || '/'}">`
      ));
    } catch (error) {
      next(error);
    }
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
