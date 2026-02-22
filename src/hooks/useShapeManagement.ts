'use client';

import { useCallback, useState, useEffect } from 'react';
import L from 'leaflet';
import { calculateArea } from '../utils/calculateArea';
import { DrawnShape, UpdateShapeData } from '@/types/map';
import { POLYGON_COLORS } from '../utils/mapConstants';
import { useFarmStore, FarmArea } from '@/store/farmStore';
import { formatAddress } from '../utils/formatAddress';

export function useShapeManagement() {
  const [shapes, setShapes] = useState<DrawnShape[]>([]);
  const [selectedShape, setSelectedShape] = useState<DrawnShape | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<number, { name?: string; varieties?: string; harvestDate?: string }>>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldSync, setShouldSync] = useState(false);

  const { data: farmAreas, setAreas } = useFarmStore();

  useEffect(() => {
    if (!isLoaded && farmAreas && farmAreas.length > 0) {
      const uniqueShapes = Array.from(
        new Map(farmAreas.map(a => [a.id, a])).values()
      ).map((area) => ({
        id: area.id,
        name: area.name,
        varieties: area.varieties,
        harvestDate: area.harvest,
        area: area.area,
        elevation: area.elevation,
        address: area.location,
        points: area.points,
        color: area.color,
      }));
      setShapes(uniqueShapes);
      setIsLoaded(true);
    } else if (!isLoaded) {
      setShapes([]);
      setIsLoaded(true);
    }
  }, [farmAreas, isLoaded]);

  useEffect(() => {
    if (isLoaded && shouldSync) {
      const farmData: FarmArea[] = shapes.map((shape) => ({
        id: shape.id,
        name: shape.name,
        varieties: shape.varieties || '',
        harvest: shape.harvestDate || '',
        area: shape.area,
        elevation: shape.elevation || 0,
        location: shape.address || '',
        points: shape.points,
        color: shape.color,
      }));
      setAreas(farmData);
      setShouldSync(false);
    }
  }, [shapes, isLoaded, shouldSync, setAreas]);

  const updateShapePoints = useCallback((shapeId: number, newPoints: [number, number][]) => {
    const area = calculateArea(newPoints);
    setShapes(prev => {
      const updated = prev.map(s =>
        s.id === shapeId ? { ...s, points: newPoints, area } : s
      );
      setTimeout(() => setShouldSync(true), 0);
      return updated;
    });
  }, []);

  const handleRectangleDraw = useCallback((points: [number, number][]) => {
    const color = POLYGON_COLORS[shapes.length % POLYGON_COLORS.length];
    const area = calculateArea(points);
    const shapeId = Date.now();

    const creationDate = new Date();
    const defaultHarvestDate = new Date(creationDate.getFullYear(), creationDate.getMonth() + 1, creationDate.getDate());
    const harvestDateStr = defaultHarvestDate.toISOString().split('T')[0];

    setShapes(prev => {
      const updated = [...prev, {
        id: shapeId,
        name: `Area ${shapes.length + 1}`,
        varieties: `Varieties ${shapes.length + 1}`,
        harvestDate: harvestDateStr,
        points,
        color,
        area,
      }];
      setTimeout(() => setShouldSync(true), 0);
      return updated;
    });
  }, [shapes.length]);

  const handleUpdateShapeName = useCallback((shapeId: number, name: string) => {
    setShapes(prev => {
      const updated = prev.map(s => s.id === shapeId ? { ...s, name } : s);
      setTimeout(() => setShouldSync(true), 0);
      return updated;
    });
    setSelectedShape(prev => prev && prev.id === shapeId ? { ...prev, name } : prev);
    if (name.trim()) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[shapeId]?.name;
        return newErrors;
      });
    }
  }, []);

  const handleUpdateShapeField = useCallback((shapeId: number, field: keyof Pick<DrawnShape, 'varieties' | 'harvestDate'>, value: string) => {
    setShapes(prev => {
      const updated = prev.map(s => s.id === shapeId ? { ...s, [field]: value } : s);
      setTimeout(() => setShouldSync(true), 0);
      return updated;
    });
    setSelectedShape(prev => prev && prev.id === shapeId ? { ...prev, [field]: value } : prev);
    if (value.trim()) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[shapeId]?.[field];
        return newErrors;
      });
    }
  }, []);

  const validateShapeFields = useCallback((shapeId: number): boolean => {
    const shape = shapes.find(s => s.id === shapeId);
    if (!shape) return false;
    
    const errors: { name?: string; varieties?: string; harvestDate?: string } = {};
    let isValid = true;
    
    if (!shape.name || !shape.name.trim()) {
      errors.name = 'Area name is required';
      isValid = false;
    }
    if (!shape.varieties || !shape.varieties.trim()) {
      errors.varieties = 'Varieties name is required';
      isValid = false;
    }
    if (!shape.harvestDate || !shape.harvestDate.trim()) {
      errors.harvestDate = 'Harvest date is required';
      isValid = false;
    }
    
    setValidationErrors(prev => ({ ...prev, [shapeId]: errors }));
    return isValid;
  }, [shapes]);

  const handleVertexDrag = useCallback((shapeId: number, vertexIndex: number, newLatLng: L.LatLng) => {
    setShapes(prev => {
      const shape = prev.find(s => s.id === shapeId);
      if (!shape) return prev;
      const newPoints = [...shape.points];
      newPoints[vertexIndex] = [newLatLng.lat, newLatLng.lng];
      const area = calculateArea(newPoints);
      const updated = prev.map(s =>
        s.id === shapeId ? { ...s, points: newPoints, area } : s
      );
      setTimeout(() => setShouldSync(true), 0);
      return updated;
    });
  }, []);

  const handleAddVertex = useCallback((shapeId: number, edgeIndex: number, latlng: L.LatLng) => {
    setShapes(prev => {
      const shape = prev.find(s => s.id === shapeId);
      if (!shape) return prev;
      const newPoints = [...shape.points];
      newPoints.splice(edgeIndex + 1, 0, [latlng.lat, latlng.lng]);
      const area = calculateArea(newPoints);
      const updated = prev.map(s =>
        s.id === shapeId ? { ...s, points: newPoints, area } : s
      );
      setTimeout(() => setShouldSync(true), 0);
      return updated;
    });
  }, []);

  const handleDeleteShape = useCallback((shapeId: number) => {
    setShapes(prev => {
      const updated = prev.filter(s => s.id !== shapeId);
      setTimeout(() => setShouldSync(true), 0);
      return updated;
    });
    setSelectedShape(null);
    setShowDeleteConfirm(false);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[shapeId];
      return newErrors;
    });
  }, []);

  const handleFetchLocationData = useCallback(async (lat: number, lng: number, shapeId: number) => {
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

      const address = addressData.display_name || 'Address not found';
      const elevation = elevationData.results?.[0]?.elevation || 0;
      const updateData: UpdateShapeData = { address, elevation };

      setShapes(prev => {
        const updated = prev.map(s => s.id === shapeId ? { ...s, ...updateData } : s);
        setTimeout(() => setShouldSync(true), 0);
        return updated;
      });
      setSelectedShape(prev => prev && prev.id === shapeId ? { ...prev, ...updateData } : prev);
    } catch {
      const updateData: UpdateShapeData = { address: 'Failed to load', elevation: 0 };
      setShapes(prev => {
        const updated = prev.map(s => s.id === shapeId ? { ...s, ...updateData } : s);
        setTimeout(() => setShouldSync(true), 0);
        return updated;
      });
      setSelectedShape(prev => prev && prev.id === shapeId ? { ...prev, ...updateData } : prev);
    }
  }, []);

  return {
    shapes,
    setShapes,
    selectedShape,
    setSelectedShape,
    showDeleteConfirm,
    setShowDeleteConfirm,
    validationErrors,
    updateShapePoints,
    handleRectangleDraw,
    handleUpdateShapeName,
    handleUpdateShapeField,
    handleVertexDrag,
    handleAddVertex,
    handleDeleteShape,
    handleFetchLocationData,
    validateShapeFields,
  };
}
