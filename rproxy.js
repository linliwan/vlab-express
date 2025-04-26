import https from 'https';
import url from 'url';
import httpProxy from 'http-proxy';
import fs from 'fs';

// Create a proxy server
const proxy = httpProxy.createProxyServer({
  ws: true,           // Enable WebSocket proxy
  secure: false,      // Do not verify the upstream server's certificate
  changeOrigin: true, // Modify the Host header
});

// Add response header processing
proxy.on('proxyRes', function(proxyRes, req, res) {
  // Add CORS and cache control headers
  proxyRes.headers['Access-Control-Allow-Origin'] = req.headers.origin || '*';
  proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
  proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,HEAD,PUT,PATCH,POST,DELETE';
  proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  
  // For static resources like images, add cache control
  if (req.url.match(/\.(jpg|jpeg|png|gif|ico|svg)$/i)) {
    proxyRes.headers['Cache-Control'] = 'public, max-age=86400';
  }
});

// Error handling
proxy.on('error', function(err, req, res) {
  console.error('Proxy error:', err);
  if (res && res.writeHead) {
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end('Proxy error');
  }
});

// Create a HTTPS server
const options = {
  key: fs.readFileSync('./cert/private.key'),
  cert: fs.readFileSync('./cert/certificate.crt')
};

// Create a HTTPS server, handle HTTP requests and WebSocket upgrades
const server = https.createServer(options, function(req, res) {
  try {
    const parsedUrl = url.parse(req.url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    // Check if it is an ESXi path
    if (pathParts[0] === 'esxi') {
      // ESXi request, return 400, because ESXi only accepts WebSocket connections
      res.writeHead(400, {
        'Content-Type': 'text/plain'
      });
      res.end('This path only accepts WebSocket connections');
      return;
    }

    // All other requests are proxied to port 3100
    proxy.web(req, res, {
      target: 'http://localhost:3100'
    });
  } catch (error) {
    console.error('Error handling request:', error);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end('Server error');
  }
});

// Handle WebSocket upgrade requests
server.on('upgrade', function(req, socket, head) {
  try {
    // Parse the request URL
    const parsedUrl = url.parse(req.url);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    // Check if it is an ESXi WebSocket request
    if (pathParts[0] === 'esxi' && pathParts[1] && pathParts[1].includes(':')) {
      // ESXi WebSocket request
      const targetHost = pathParts[1];
      const remainingPath = pathParts.slice(2).join('/');
      
      // Modify the request URL, ensure it contains the full path
      req.url = '/' + remainingPath;
      
      // Set the proxy target
      const target = {
        target: `wss://${targetHost}`,
        secure: false,
        ws: true,
        changeOrigin: true
      };
      
      console.log(`Proxy WebSocket connection to wss://${targetHost}/${remainingPath}`);
      proxy.ws(req, socket, head, target);
    } else {
      // Non-ESXi WebSocket request, close the connection
      console.error('Unsupported WebSocket request path');
      socket.destroy();
    }
  } catch (error) {
    console.error('Error handling WebSocket upgrade request:', error);
    socket.destroy();
  }
});

// Listen on port
server.listen(8843, function() {
  console.log('Reverse proxy server is listening on port 8843');
});
