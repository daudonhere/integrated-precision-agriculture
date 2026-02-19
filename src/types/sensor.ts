export interface SensorData {
  id: string;
  ts: number;
  lat: number;
  lon: number;
  message: string;
  payload: Payload;
}

export interface Payload {
  temp: number;
  hum: number;
  moist: number;
  ph: number;
  n: number;
  p: number;
  k: number;
  water: number;
}

export interface SensorStatus {
  label: string;
  value: number | string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  icon: string;
}
