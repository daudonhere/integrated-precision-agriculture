'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { SensorData } from '@/types/sensor';

const MQTT_BROKER = 'wss://broker.emqx.io:8084/mqtt';
const MQTT_TOPIC = 'daud/smartfarm/data';

interface UseMqttReturn {
  data: SensorData | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  lastReceived: Date | null;
  disconnect: () => void;
}

export function useMqtt(): UseMqttReturn {
  const [data, setData] = useState<SensorData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastReceived, setLastReceived] = useState<Date | null>(null);

  const clientRef = useRef<MqttClient | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    setIsConnecting(true);
    setError(null);

    try {
      const client = mqtt.connect(MQTT_BROKER, {
        clientId: `dashboard-${Math.random().toString(16).slice(3)}`,
        connectTimeout: 10000,
        reconnectPeriod: 5000,
        clean: true,
        protocolVersion: 4,
        keepalive: 30,
        rejectUnauthorized: false,
      });

      clientRef.current = client;

      client.on('connect', () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(null);

        client.subscribe('daud/#');
        client.subscribe(MQTT_TOPIC);
      });

      client.on('message', (topic, message) => {
        if (topic.startsWith('daud/')) {
          try {
            const parsedData: SensorData = JSON.parse(message.toString());
            setData(parsedData);
            setLastReceived(new Date());
          } catch {
            setError('Invalid data format');
          }
        }
      });

      client.on('error', (err) => {
        setError(`MQTT Error: ${err.message}`);
        setIsConnected(false);
        setIsConnecting(false);
      });

      client.on('offline', () => {
        setIsConnected(false);
      });

      client.on('reconnect', () => {
        setIsConnecting(true);
        setError(null);
      });

      client.on('close', () => {
        setIsConnected(false);
      });

      client.on('end', () => {
        setIsConnected(false);
        setIsConnecting(false);
      });

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      setError(errorMessage);
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
    setIsConnecting(false);
  }, []);

  useEffect(() => {
    const initMqtt = async () => {
      await connect();
    };
    initMqtt();

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    isConnected,
    isConnecting,
    error,
    lastReceived,
    disconnect,
  };
}
