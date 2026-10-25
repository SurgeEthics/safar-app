export interface LiveDriverLocation {
  id: string;
  name: string;
  phone: string;
  category: string;
  vehicleModel?: string;
  plateNumber?: string;
  standName?: string;
  lat: number;
  lng: number;
  speed?: number;
  rating?: number;
  isOnline?: boolean;
  isLiveEdge?: boolean;
  updatedAt?: string;
}

export interface LivePassengerLocation {
  id: string;
  name: string;
  phone?: string;
  pickupPoint: string;
  destination?: string;
  lat: number;
  lng: number;
  status?: string;
  updatedAt?: string;
}

export interface LiveServerState {
  drivers: LiveDriverLocation[];
  passengers: LivePassengerLocation[];
  status: 'connected' | 'connecting' | 'disconnected';
  latencyMs: number;
  serverType: 'cloudflare' | 'local';
}

type Listener = (state: LiveServerState) => void;

class LiveLocationService {
  private customServerUrl: string = '';
  private state: LiveServerState = {
    drivers: [],
    passengers: [],
    status: 'connected',
    latencyMs: 35,
    serverType: 'local'
  };
  private listeners: Set<Listener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        this.customServerUrl = localStorage.getItem('safar_custom_worker_url') || '';
        if (this.customServerUrl) {
          this.state.serverType = 'cloudflare';
        }
      } catch {
        // ignore
      }
    }
  }

  public getCustomServerUrl(): string {
    return this.customServerUrl;
  }

  public setCustomServerUrl(url: string): void {
    this.customServerUrl = url.trim();
    if (typeof window !== 'undefined') {
      try {
        if (this.customServerUrl) {
          localStorage.setItem('safar_custom_worker_url', this.customServerUrl);
          this.state.serverType = 'cloudflare';
        } else {
          localStorage.removeItem('safar_custom_worker_url');
          this.state.serverType = 'local';
        }
      } catch {
        // ignore
      }
    }
    this.notify();
  }

  public syncDriversFromCatalog(catalogDrivers: any[]): void {
    if (!catalogDrivers || catalogDrivers.length === 0) return;
    
    const liveDrivers: LiveDriverLocation[] = catalogDrivers
      .filter((d: any) => d.isOnline !== false)
      .map((d: any) => ({
        id: d.id,
        name: d.name || d.nameBn || 'চালক',
        phone: d.phone || '',
        category: d.category || 'cng',
        vehicleModel: d.vehicleModel || d.vehicleName || '',
        plateNumber: d.plateNumber || d.licensePlate || '',
        standName: d.standName || '',
        lat: d.lat || 24.4340,
        lng: d.lng || 90.5510,
        speed: d.approxSpeedKmh || Math.floor(Math.random() * 20) + 12,
        rating: d.rating || 4.9,
        isOnline: d.isOnline !== false,
        isLiveEdge: true,
        updatedAt: new Date().toISOString()
      }));

    this.state.drivers = liveDrivers;
    this.state.status = 'connected';
    this.notify();
  }

  public registerPassenger(passenger: LivePassengerLocation): void {
    const existingIdx = this.state.passengers.findIndex((p: LivePassengerLocation) => p.id === passenger.id);
    if (existingIdx >= 0) {
      this.state.passengers[existingIdx] = passenger;
    } else {
      this.state.passengers.push(passenger);
    }
    this.notify();
  }

  public unregisterPassenger(id: string): void {
    this.state.passengers = this.state.passengers.filter((p: LivePassengerLocation) => p.id !== id);
    this.notify();
  }

  public getState(): LiveServerState {
    return this.state;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((fn: Listener) => fn({ ...this.state }));
  }
}

export const liveLocationService = new LiveLocationService();
