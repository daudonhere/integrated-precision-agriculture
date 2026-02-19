import mqtt, { MqttClient } from 'mqtt';
import { SensorData } from '@/types/sensor';

const MQTT_BROKER = 'wss://broker.hivemq.com:8884';
const MQTT_TOPIC = 'daud/smartfarm/data';

let client: MqttClient | null = null;
let listeners: ((data: SensorData) => void)[] = [];

export function connectMqtt(): Promise<SensorData | null> {
  return new Promise((resolve) => {
    try {
      client = mqtt.connect(MQTT_BROKER, {
        clientId: `dashboard-${Math.random().toString(16).slice(3)}`,
        connectTimeout: 10000,
        reconnectPeriod: 5000,
      });

      client.on('connect', () => {
        console.log('Connected to MQTT broker');
        client?.subscribe(MQTT_TOPIC, (err) => {
          if (err) {
            console.error('Failed to subscribe:', err);
            resolve(null);
          } else {
            console.log('Subscribed to:', MQTT_TOPIC);
          }
        });
      });

      client.on('message', (topic, message) => {
        if (topic === MQTT_TOPIC) {
          try {
            const data: SensorData = JSON.parse(message.toString());
            listeners.forEach((listener) => listener(data));
            resolve(data);
          } catch (e) {
            console.error('Failed to parse MQTT message:', e);
          }
        }
      });

      client.on('error', (err) => {
        console.error('MQTT error:', err);
        resolve(null);
      });

      client.on('offline', () => {
        console.log('MQTT client offline');
      });

      setTimeout(() => {
        resolve(null);
      }, 15000);
    } catch (e) {
      console.error('Failed to connect MQTT:', e);
      resolve(null);
    }
  });
}

export function subscribeSensorData(callback: (data: SensorData) => void) {
  listeners.push(callback);
}

export function unsubscribeSensorData(callback: (data: SensorData) => void) {
  listeners = listeners.filter((l) => l !== callback);
}

export function disconnectMqtt() {
  if (client) {
    client.end();
    client = null;
  }
  listeners = [];
}

export function getLastData(): Promise<SensorData | null> {
  return connectMqtt();
}
