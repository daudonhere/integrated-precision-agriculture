'use client';

import { useCallback, useState, useEffect } from 'react';
import { useWarehouseStore, Warehouse } from '@/store/warehouseStore';

export function useWarehouseManagement() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<number, { name?: string; capacity?: string }>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldSync, setShouldSync] = useState(false);

  const { data: storedWarehouses, setWarehouses: setStoredWarehouses } = useWarehouseStore();

  useEffect(() => {
    if (!isLoaded && storedWarehouses && storedWarehouses.length > 0) {
      const uniqueWarehouses = Array.from(
        new Map(storedWarehouses.map(w => [w.id, w])).values()
      );
      setWarehouses(uniqueWarehouses);
      setIsLoaded(true);
    } else if (!isLoaded) {
      setWarehouses([]);
      setIsLoaded(true);
    }
  }, [storedWarehouses, isLoaded]);

  useEffect(() => {
    if (isLoaded && shouldSync) {
      const uniqueWarehouses = Array.from(
        new Map(warehouses.map(w => [w.id, w])).values()
      );
      setStoredWarehouses(uniqueWarehouses);
      setShouldSync(false);
    }
  }, [warehouses, isLoaded, shouldSync, setStoredWarehouses]);

  const handleAddWarehouse = useCallback((lat: number, lng: number) => {
    const newWarehouse: Warehouse = {
      id: Date.now(),
      name: `Warehouse ${warehouses.length + 1}`,
      capacity: 1000,
      elevation: 0,
      location: '',
      lat,
      lng,
    };
    setWarehouses(prev => {
      const updated = [...prev, newWarehouse];
      setTimeout(() => setShouldSync(true), 0);
      return updated;
    });
  }, [warehouses.length]);

  const handleUpdateWarehouse = useCallback((id: number, warehouse: Partial<Warehouse>) => {
    setWarehouses(prev => {
      const updated = prev.map(w => w.id === id ? { ...w, ...warehouse } : w);
      setTimeout(() => setShouldSync(true), 0);
      return updated;
    });
    setSelectedWarehouse(prev => prev && prev.id === id ? { ...prev, ...warehouse } : prev);

    if (warehouse.name?.trim()) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id]?.name;
        return newErrors;
      });
    }
    if (warehouse.capacity !== undefined) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id]?.capacity;
        return newErrors;
      });
    }
  }, []);

  const handleDeleteWarehouse = useCallback((id: number) => {
    setWarehouses(prev => {
      const updated = prev.filter(w => w.id !== id);
      setTimeout(() => setShouldSync(true), 0);
      return updated;
    });
    setSelectedWarehouse(null);
    setShowDeleteConfirm(false);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  }, []);

  const handleFetchLocationData = useCallback(async (lat: number, lng: number, warehouseId: number) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    if (warehouse && warehouse.location && warehouse.elevation) {
      return;
    }

    try {
      const addressResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { headers: { 'User-Agent': 'SmartFarm/1.0' } }
      );
      const addressData = await addressResponse.json();

      const elevationResponse = await fetch(
        `https://api.opentopodata.org/v1/aster30m?locations=${lat},${lng}`
      );
      const elevationData = await elevationResponse.json();

      const location = addressData.display_name || 'Address not found';
      const elevation = elevationData.results?.[0]?.elevation || 0;

      setWarehouses(prev => prev.map(w => w.id === warehouseId ? { ...w, location, elevation } : w));
      setSelectedWarehouse(prev => prev && prev.id === warehouseId ? { ...prev, location, elevation } : prev);
    } catch {
      setWarehouses(prev => prev.map(w => w.id === warehouseId ? { ...w, location: 'Failed to load', elevation: 0 } : w));
      setSelectedWarehouse(prev => prev && prev.id === warehouseId ? { ...prev, location: 'Failed to load', elevation: 0 } : prev);
    }
  }, [warehouses]);

  const validateWarehouseFields = useCallback((warehouseId: number): boolean => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    if (!warehouse) return false;

    const errors: { name?: string; capacity?: string } = {};
    let isValid = true;

    if (!warehouse.name || !warehouse.name.trim()) {
      errors.name = 'Warehouse name is required';
      isValid = false;
    }
    if (!warehouse.capacity || warehouse.capacity <= 0) {
      errors.capacity = 'Capacity must be greater than 0';
      isValid = false;
    }

    setValidationErrors(prev => ({ ...prev, [warehouseId]: errors }));
    return isValid;
  }, [warehouses]);

  return {
    warehouses,
    setWarehouses,
    selectedWarehouse,
    setSelectedWarehouse,
    showDeleteConfirm,
    setShowDeleteConfirm,
    validationErrors,
    handleAddWarehouse,
    handleUpdateWarehouse,
    handleDeleteWarehouse,
    handleFetchLocationData,
    validateWarehouseFields,
  };
}
