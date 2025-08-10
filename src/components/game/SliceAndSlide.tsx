'use client';

import React, { useState, useRef, useCallback } from 'react';
import type { MouseEvent } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
type Box = {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

type Point = {
  x: number;
  y: number;
};

type DragInfo = {
  id: number;
  offsetX: number;
  offsetY: number;
};

// Color palette for boxes
const boxColors = [
  'hsl(210, 80%, 85%)',
  'hsl(0, 80%, 85%)',
  'hsl(60, 80%, 85%)',
  'hsl(145, 63%, 85%)',
  'hsl(265, 80%, 85%)',
  'hsl(340, 80%, 85%)',
  'hsl(25, 80%, 85%)',
  'hsl(180, 80%, 85%)',
];

const getRandomColor = () => boxColors[Math.floor(Math.random() * boxColors.length)];

export function SliceAndSlide() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentRect, setCurrentRect] = useState<Box | null>(null);
  const [draggingPiece, setDraggingPiece] = useState<DragInfo | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (draggingPiece || (e.target as HTMLElement).dataset.piece) {
      return;
    }

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });
  }, [draggingPiece]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (draggingPiece) {
      setBoxes(prevBoxes =>
        prevBoxes.map(box =>
          box.id === draggingPiece.id
            ? { ...box, x: mouseX - draggingPiece.offsetX, y: mouseY - draggingPiece.offsetY }
            : box
        )
      );
    } else if (isDrawing && startPoint) {
      const x = Math.min(startPoint.x, mouseX);
      const y = Math.min(startPoint.y, mouseY);
      const width = Math.abs(startPoint.x - mouseX);
      const height = Math.abs(startPoint.y - mouseY);
      setCurrentRect({ id: -1, x, y, width, height, color: 'border-primary' });
    }
  }, [isDrawing, startPoint, draggingPiece]);

  const handleMouseUp = useCallback(() => {
    if (draggingPiece) {
      setDraggingPiece(null);
      return;
    }
    
    if (isDrawing && startPoint && currentRect) {
      if (currentRect.width > 5 && currentRect.height > 5) {
        setBoxes(prev => [...prev, { ...currentRect, id: nextId.current++, color: getRandomColor() }]);
      } else {
        const boxToCut = boxes.find(box => 
          startPoint.x > box.x && startPoint.x < box.x + box.width && 
          startPoint.y > box.y && startPoint.y < box.y + box.height
        );
        if (boxToCut) {
          cutBox(boxToCut, startPoint);
        }
      }
    }
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
  }, [isDrawing, startPoint, currentRect, boxes, draggingPiece]);

  const cutBox = (boxToCut: Box, clickPoint: Point) => {
    const { id, x, y, width, height, color } = boxToCut;
    const { x: clickX, y: clickY } = clickPoint;
    const newPieces: Box[] = [];

    const definitions = [
      { x, y, width: clickX - x, height: clickY - y }, // Top-left
      { x: clickX, y, width: x + width - clickX, height: clickY - y }, // Top-right
      { x, y: clickY, width: clickX - x, height: y + height - clickY }, // Bottom-left
      { x: clickX, y: clickY, width: x + width - clickX, height: y + height - clickY }, // Bottom-right
    ];

    definitions.forEach(p => {
      if (p.width > 5 && p.height > 5) {
        newPieces.push({ ...p, id: nextId.current++, color });
      }
    });

    setBoxes(prev => [...prev.filter(b => b.id !== id), ...newPieces]);
  };

  const handlePieceMouseDown = (e: MouseEvent<HTMLDivElement>, piece: Box) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setDraggingPiece({
      id: piece.id,
      offsetX: mouseX - piece.x,
      offsetY: mouseY - piece.y
    });
  };

  const handleReset = useCallback(() => {
    setBoxes([]);
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
    setDraggingPiece(null);
    nextId.current = 0;
  }, []);

  return (
    <div className="relative w-full">
      <div
        ref={canvasRef}
        className="w-full h-[60vh] md:h-[70vh] bg-muted/20 cursor-crosshair touch-none select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {boxes.map(box => (
          <div
            key={box.id}
            data-piece="true"
            className={cn(
              'absolute border border-black/30 rounded-sm shadow-lg cursor-grab active:cursor-grabbing transition-transform duration-100 ease-in-out'
            )}
            style={{
              left: box.x,
              top: box.y,
              width: box.width,
              height: box.height,
              backgroundColor: box.color,
              transform: draggingPiece?.id === box.id ? 'scale(1.05)' : 'scale(1)',
              zIndex: draggingPiece?.id === box.id ? 10 : 1,
            }}
            onMouseDown={(e) => handlePieceMouseDown(e, box)}
          ></div>
        ))}

        {isDrawing && currentRect && (
          <div
            className="absolute border-2 border-dashed border-primary/80 bg-primary/10 rounded-sm"
            style={{
              left: currentRect.x,
              top: currentRect.y,
              width: currentRect.width,
              height: currentRect.height
            }}
          />
        )}
      </div>
      <div className="absolute top-4 right-4">
        <Button variant="outline" size="icon" onClick={handleReset} aria-label="Reset Canvas">
          <RotateCcw className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
