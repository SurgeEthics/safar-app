/**
 * SAFAR GAFARGAON - CLOUDFLARE EDGE WORKER
 * Real-time GPS Live-Tracking & WebSocket Broadcast Engine
 * 
 * Features:
 * - High-speed Edge geolocation routing (<30ms latency)
 * - WebSocket Pair for real-time live coordinate stream between drivers & passengers
 * - REST API fallback endpoints:
 *     - GET  /api/live/health
 *     - GET  /api/live/drivers
 *     - POST /api/live/driver/update
 *     - POST /api/live/passenger/request
 * - Full CORS support for cross-origin browser requests
 */

// In-memory cache for active drivers and passengers in edge region
const activeDrivers = new Map();
const activePassengers = new Map();
const activeWebSockets = new Set();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...corsHeaders,
    },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // 2. Health Check & Latency Ping
    if (url.pathname === '/api/live/health' || url.pathname === '/health') {
      return jsonResponse({
        status: 'online',
        server: 'Cloudflare Edge Worker (সফর গফরগাঁও)',
        edgeColo: request.cf?.colo || 'DAC (Dhaka)',
        region: request.cf?.country || 'BD',
        timestamp: new Date().toISOString(),
        activeDriversCount: activeDrivers.size,
        activePassengersCount: activePassengers.size,
        features: {
          webSockets: true,
          liveGpsStreaming: true,
          emergencyAlerts: true
        }
      });
    }

    // 3. WebSocket Real-time Live Connection
    if (url.pathname === '/ws' || url.pathname === '/api/live/ws') {
      const upgradeHeader = request.headers.get('Upgrade');
      if (!upgradeHeader || upgradeHeader.toLowerCase() !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 426 });
      }

      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      server.accept();
      activeWebSockets.add(server);

      // Send initial snapshot to newly connected client
      server.send(JSON.stringify({
        type: 'INIT_SYNC',
        drivers: Array.from(activeDrivers.values()),
        passengers: Array.from(activePassengers.values()),
        serverTime: Date.now()
      }));

      server.addEventListener('message', (event) => {
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === 'DRIVER_LOCATION_UPDATE') {
            const driverData = {
              ...payload.driver,
              updatedAt: new Date().toISOString(),
              lat: Number(payload.driver.lat),
              lng: Number(payload.driver.lng),
            };
            activeDrivers.set(driverData.id, driverData);

            // Broadcast to all other connected sockets
            const broadcastMsg = JSON.stringify({
              type: 'DRIVER_MOVED',
              driver: driverData
            });
            for (const ws of activeWebSockets) {
              if (ws !== server) {
                try { ws.send(broadcastMsg); } catch (_) {}
              }
            }
          }

          if (payload.type === 'PASSENGER_REQUEST') {
            const passengerData = {
              ...payload.passenger,
              updatedAt: new Date().toISOString()
            };
            activePassengers.set(passengerData.id, passengerData);

            const broadcastMsg = JSON.stringify({
              type: 'NEW_PASSENGER_ALERT',
              passenger: passengerData
            });
            for (const ws of activeWebSockets) {
              try { ws.send(broadcastMsg); } catch (_) {}
            }
          }
        } catch (err) {
          console.error('WebSocket message parsing error:', err);
        }
      });

      server.addEventListener('close', () => {
        activeWebSockets.delete(server);
      });

      server.addEventListener('error', () => {
        activeWebSockets.delete(server);
      });

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // 4. REST Endpoint: GET /api/live/drivers
    if (url.pathname === '/api/live/drivers' && request.method === 'GET') {
      // Auto purge stale drivers (>10 minutes inactive)
      const now = Date.now();
      for (const [id, driver] of activeDrivers.entries()) {
        const last = new Date(driver.updatedAt || 0).getTime();
        if (now - last > 10 * 60 * 1000) {
          activeDrivers.delete(id);
        }
      }

      return jsonResponse({
        success: true,
        count: activeDrivers.size,
        drivers: Array.from(activeDrivers.values())
      });
    }

    // 5. REST Endpoint: POST /api/live/driver/update
    if (url.pathname === '/api/live/driver/update' && request.method === 'POST') {
      try {
        const body = await request.json();
        if (!body.id || body.lat === undefined || body.lng === undefined) {
          return jsonResponse({ error: 'Missing driver id or coordinates' }, 400);
        }

        const driverData = {
          ...body,
          updatedAt: new Date().toISOString()
        };
        activeDrivers.set(driverData.id, driverData);

        return jsonResponse({
          success: true,
          message: 'Driver location recorded',
          driver: driverData
        });
      } catch (e) {
        return jsonResponse({ error: 'Invalid JSON request payload' }, 400);
      }
    }

    // 6. REST Endpoint: POST /api/live/passenger/request
    if (url.pathname === '/api/live/passenger/request' && request.method === 'POST') {
      try {
        const body = await request.json();
        const passenger = {
          ...body,
          id: body.id || `req_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        activePassengers.set(passenger.id, passenger);

        return jsonResponse({
          success: true,
          message: 'Ride request posted to live edge',
          passenger
        });
      } catch (e) {
        return jsonResponse({ error: 'Invalid JSON' }, 400);
      }
    }

    // Default Fallback
    return jsonResponse({
      app: 'Safar Gafargaon - Cloudflare Live Edge Server',
      status: 'operational',
      endpoints: [
        'GET  /api/live/health',
        'GET  /api/live/drivers',
        'POST /api/live/driver/update',
        'POST /api/live/passenger/request',
        'WS   /api/live/ws'
      ]
    });
  }
};
