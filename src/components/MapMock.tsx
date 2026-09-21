/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState } from 'react';
import { MapPin, X, Building, Compass, ZoomIn, ZoomOut, ShieldCheck } from 'lucide-react';
import { Property } from '../types';
import { formatPrice } from './PropertyCard';

interface MapMockProps {
  properties: Property[];
  onPropertyClick: (id: string) => void;
}

interface MapPinPoint {
  property: Property;
  x: number; // mapped pixel x coordinate
  y: number; // mapped pixel y coordinate
}

export const MapMock: React.FC<MapMockProps> = ({ properties, onPropertyClick }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 450 });
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);
  const [hoveredPropId, setHoveredPropId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Use ResizeObserver to keep canvas sized accurately to its parent container
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        let width = entry.contentRect.width;
        let height = entry.contentRect.height || 450;
        
        // Boundaries checks
        if (width < 300) width = 300;
        if (height < 300) height = 300;

        // Debounce resize via animation frame
        requestAnimationFrame(() => {
          setDimensions({ width, height });
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Map Kampala real coordinates (lat, lng) to canvas pixels (x, y)
  // Kampala bounding coordinates approx:
  // Lat: Entebbe (0.04) to Kira (0.40) -> 0.04 to 0.40 (height)
  // Lng: CBD (32.44) to Namugongo (32.66) -> 32.44 to 32.66 (width)
  const getPoints = (): MapPinPoint[] => {
    const latMin = 0.02;
    const latMax = 0.42;
    const lngMin = 32.40;
    const lngMax = 32.68;

    const margin = 50;
    const drawWidth = dimensions.width - margin * 2;
    const drawHeight = dimensions.height - margin * 2;

    return properties.map((prop) => {
      // Linear normalization
      const normLng = (prop.lng - lngMin) / (lngMax - lngMin);
      // Latitude is flipped because Y pixel coordinates go downwards
      const normLat = 1 - (prop.lat - latMin) / (latMax - latMin);

      let x = margin + normLng * drawWidth;
      let y = margin + normLat * drawHeight;

      // Ensure points fit reasonably
      if (isNaN(x) || x < 0) x = dimensions.width / 2;
      if (isNaN(y) || y < 0) y = dimensions.height / 2;

      return {
        property: prop,
        x,
        y
      };
    });
  };

  // Render mock map vectors on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set high-DPI scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    // Apply translation scale / zoom and offset dragging
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // 1. Draw Map Background (Uganda Warm/Off-white theme)
    ctx.fillStyle = '#fbf9f5';
    ctx.fillRect(-1000, -1000, dimensions.width + 2000, dimensions.height + 2000);

    // 2. Draw Lake Victoria (Waterfront area at the bottom)
    ctx.fillStyle = '#e3eff2';
    ctx.beginPath();
    // Curves representing lake shoreline in Kampala South
    ctx.moveTo(-100, dimensions.height);
    ctx.bezierCurveTo(
      dimensions.width * 0.2, dimensions.height * 0.7, 
      dimensions.width * 0.5, dimensions.height * 0.85, 
      dimensions.width * 0.8, dimensions.height * 0.72
    );
    ctx.lineTo(dimensions.width + 200, dimensions.height * 0.65);
    ctx.lineTo(dimensions.width + 200, dimensions.height + 200);
    ctx.lineTo(-200, dimensions.height + 200);
    ctx.closePath();
    ctx.fill();

    // 3. Draw Entebbe Expressway & Kampala Northern Bypass (Major Grid Roads)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Expressway from Entebbe bottom-left to Kampala top-right
    ctx.beginPath();
    ctx.moveTo(dimensions.width * 0.1, dimensions.height * 0.85);
    ctx.quadraticCurveTo(dimensions.width * 0.3, dimensions.height * 0.5, dimensions.width * 0.5, dimensions.height * 0.4);
    ctx.quadraticCurveTo(dimensions.width * 0.7, dimensions.height * 0.35, dimensions.width * 0.9, dimensions.height * 0.2);
    ctx.stroke();

    // Northern Bypass crossing East-West
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-50, dimensions.height * 0.3);
    ctx.quadraticCurveTo(dimensions.width * 0.4, dimensions.height * 0.25, dimensions.width * 0.8, dimensions.height * 0.35);
    ctx.lineTo(dimensions.width + 100, dimensions.height * 0.4);
    ctx.stroke();

    // Inner major Kampala Streets
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Kampala Road / Central block
    ctx.moveTo(dimensions.width * 0.4, dimensions.height * 0.45);
    ctx.lineTo(dimensions.width * 0.6, dimensions.height * 0.48);
    // Kololo loops
    ctx.arc(dimensions.width * 0.55, dimensions.height * 0.35, 30, 0, Math.PI * 2);
    // Muyenga Road
    ctx.moveTo(dimensions.width * 0.6, dimensions.height * 0.48);
    ctx.lineTo(dimensions.width * 0.7, dimensions.height * 0.6);
    ctx.stroke();

    // 4. Landmarks labels (Lake Victoria, Kololo, Central Kampala)
    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('KAMPALA CENTRAL (CBD)', dimensions.width * 0.35, dimensions.height * 0.45);
    
    ctx.fillStyle = '#64748b';
    ctx.fillText('Kira Town', dimensions.width * 0.82, dimensions.height * 0.22);
    ctx.fillText('Wakiso District', dimensions.width * 0.15, dimensions.height * 0.28);
    ctx.fillText('Muyenga Hill', dimensions.width * 0.72, dimensions.height * 0.58);
    
    ctx.fillStyle = '#334155';
    ctx.font = 'black italic 10px sans-serif';
    ctx.fillText('LAKE VICTORIA', dimensions.width * 0.45, dimensions.height * 0.88);

    // 5. Draw Properties Pins
    const points = getPoints();
    points.forEach((point) => {
      const isSelected = selectedProp?.id === point.property.id;
      const isHovered = hoveredPropId === point.property.id;

      // Draw pin drop-shadow
      ctx.beginPath();
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fill();

      // Pin Body
      ctx.beginPath();
      ctx.arc(point.x, point.y - 12, isHovered || isSelected ? 10 : 8, 0, Math.PI * 2);
      ctx.fillStyle = isSelected ? '#000000' : isHovered ? '#525252' : '#94a3b8';
      ctx.fill();

      // Pin center dot or icon representation
      ctx.beginPath();
      ctx.arc(point.x, point.y - 12, isHovered || isSelected ? 4 : 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Draw pointer tail
      ctx.beginPath();
      ctx.moveTo(point.x - 4, point.y - 7);
      ctx.lineTo(point.x, point.y);
      ctx.lineTo(point.x + 4, point.y - 7);
      ctx.fillStyle = isSelected ? '#000000' : isHovered ? '#525252' : '#94a3b8';
      ctx.fill();

      // Mini price tag on pins (Only shown if zoomed in or hovered)
      if (isHovered || isSelected || scale > 1.2) {
        ctx.fillStyle = isSelected ? '#000000' : '#1f2937';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.font = 'bold 9px sans-serif';
        const label = formatPrice(point.property.price, point.property.currency);
        const textWidth = ctx.measureText(label).width;

        // Draw pill bubble above the pin
        ctx.beginPath();
        ctx.roundRect(point.x - textWidth / 2 - 4, point.y - 32, textWidth + 8, 14, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, point.x - textWidth / 2, point.y - 22);
      }
    });

    ctx.restore();
  }, [dimensions, properties, selectedProp, hoveredPropId, scale, offset]);

  // Click & Drag Map Operations
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Calculate canvas-space mouse coordinates
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / scale;
    const mouseY = (e.clientY - rect.top - offset.y) / scale;

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    // Check if mouse is hovering over a pin
    const points = getPoints();
    let foundHover: string | null = null;
    for (const point of points) {
      const dist = Math.hypot(point.x - mouseX, (point.y - 12) - mouseY);
      if (dist < 12) {
        foundHover = point.property.id;
        break;
      }
    }
    setHoveredPropId(foundHover);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(false);
    
    // If not dragging far, assume it's a click selection
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - offset.x) / scale;
    const mouseY = (e.clientY - rect.top - offset.y) / scale;

    const points = getPoints();
    let clickedPoint: MapPinPoint | null = null;
    for (const point of points) {
      const dist = Math.hypot(point.x - mouseX, (point.y - 12) - mouseY);
      if (dist < 12) {
        clickedPoint = point;
        break;
      }
    }

    if (clickedPoint) {
      setSelectedProp(clickedPoint.property);
    } else {
      // Clicked on empty space, close popover
      setSelectedProp(null);
    }
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
    // Reset offset if zooming out near default
    if (scale <= 0.8) setOffset({ x: 0, y: 0 });
  };

  const handleResetMap = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setSelectedProp(null);
  };

  return (
    <div className="relative w-full h-[450px] bg-slate-50 border border-gray-200 rounded-lg overflow-hidden flex flex-col justify-end" ref={containerRef}>
      {/* Top Map Compass Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1">
        <button 
          onClick={handleZoomIn} 
          className="p-2 bg-white hover:bg-gray-100 text-gray-800 rounded-md border border-gray-200 shadow-sm cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button 
          onClick={handleZoomOut} 
          className="p-2 bg-white hover:bg-gray-100 text-gray-800 rounded-md border border-gray-200 shadow-sm cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button 
          onClick={handleResetMap} 
          className="px-2 py-1 bg-white hover:bg-gray-100 text-gray-700 text-[10px] font-bold rounded-md border border-gray-200 shadow-sm mt-1 cursor-pointer"
        >
          Reset Map
        </button>
      </div>

      {/* Canvas Element */}
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Map watermark / compass */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center space-x-1.5 text-slate-500 bg-white/80 px-2 py-1.5 rounded-md border border-gray-100 shadow-xs text-[10px] font-bold">
        <Compass className="w-4 h-4 animate-spin-slow" />
        <span>Kampala Real Estate Index</span>
      </div>

      {/* Selection Popover Overlay */}
      {selectedProp && (
        <div className="absolute bottom-4 right-4 left-4 md:left-auto md:w-80 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-30 animate-fade-in flex space-x-3">
          <img 
            src={selectedProp.images[0]} 
            alt={selectedProp.title} 
            className="w-20 h-20 rounded-md object-cover border border-gray-100"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <span className="text-xs font-black text-gray-900 leading-none">
                  {formatPrice(selectedProp.price, selectedProp.currency)}
                </span>
                <button 
                  onClick={() => setSelectedProp(null)}
                  className="p-0.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h5 className="text-[11px] font-bold text-gray-800 line-clamp-2 mt-1 leading-tight">
                {selectedProp.title}
              </h5>
              <p className="text-[10px] text-gray-500 flex items-center gap-0.5 mt-0.5 truncate">
                <MapPin className="w-3 h-3 text-gray-400" />
                {selectedProp.location}
              </p>
            </div>

            <div className="pt-1.5 flex items-center justify-between">
              {selectedProp.verified && (
                <span className="text-[8px] bg-gray-100 text-gray-900 font-bold px-1 py-0.5 rounded-sm flex items-center gap-0.5">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Verified
                </span>
              )}
              <button
                onClick={() => onPropertyClick(selectedProp.id)}
                className="px-2.5 py-1 bg-[#000000] hover:bg-[#262626] text-white text-[10px] font-bold uppercase rounded-sm transition-all cursor-pointer"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
