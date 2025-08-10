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

const MIN_DIMENSION = 10; // Minimum width or height for a slice to be valid

export function SliceAndSlide() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentRect, setCurrentRect] = useState<Box | null>(null);
  const [draggingPiece, setDraggingPiece] = useState<DragInfo | null>(null);
  const [mousePos, setMousePos] = useState<Point | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const clickStartRef = useRef<number | null>(null);

  const handleMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (draggingPiece || (e.target as HTMLElement).dataset.piece) {
      return;
    }

    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    clickStartRef.current = Date.now();
    setStartPoint({ x, y });
    setCurrentRect(null); // Reset current rect
    // Defer setting isDrawing to handle click vs. drag
  }, [draggingPiece]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setMousePos({ x: mouseX, y: mouseY });

    if (draggingPiece) {
      setBoxes(prevBoxes =>
        prevBoxes.map(box =>
          box.id === draggingPiece.id
            ? { ...box, x: mouseX - draggingPiece.offsetX, y: mouseY - draggingPiece.offsetY }
            : box
        )
      );
    } else if (startPoint) {
      // If mouse moved a bit, start drawing
      if (!isDrawing && (Math.abs(startPoint.x - mouseX) > 5 || Math.abs(startPoint.y - mouseY) > 5)) {
        setIsDrawing(true);
      }

      if (isDrawing) {
        const x = Math.min(startPoint.x, mouseX);
        const y = Math.min(startPoint.y, mouseY);
        const width = Math.abs(startPoint.x - mouseX);
        const height = Math.abs(startPoint.y - mouseY);
        setCurrentRect({ id: -1, x, y, width, height, color: 'border-primary' });
      }
    }
  }, [isDrawing, startPoint, draggingPiece]);

  const handleMouseUp = useCallback(() => {
    const clickDuration = clickStartRef.current ? Date.now() - clickStartRef.current : null;
    clickStartRef.current = null;
    
    if (draggingPiece) {
      setDraggingPiece(null);
      return;
    }
    
    // If it was a short click (not a drag), then slice
    if (startPoint && !isDrawing && clickDuration !== null && clickDuration < 200) {
      sliceAllBoxes(startPoint);
    } else if (isDrawing && currentRect && currentRect.width >= MIN_DIMENSION && currentRect.height >= MIN_DIMENSION) {
        setBoxes(prev => [...prev, { ...currentRect, id: nextId.current++, color: getRandomColor() }]);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentRect(null);
  }, [isDrawing, startPoint, currentRect, draggingPiece]);

  const sliceAllBoxes = (clickPoint: Point) => {
    let newBoxes: Box[] = [];
    let changed = false;

    boxes.forEach(box => {
        const canSliceHorizontally = clickPoint.y > box.y && clickPoint.y < box.y + box.height;
        const canSliceVertically = clickPoint.x > box.x && clickPoint.x < box.x + box.width;

        if (!canSliceHorizontally && !canSliceVertically) {
            newBoxes.push(box);
            return;
        }
        
        let currentSlices = [box];
        let tempSlices: Box[] = [];

        // Horizontal slice
        if (canSliceHorizontally) {
            changed = true;
            currentSlices.forEach(slice => {
                const topHeight = clickPoint.y - slice.y;
                const bottomHeight = slice.y + slice.height - clickPoint.y;

                if (topHeight >= MIN_DIMENSION && bottomHeight >= MIN_DIMENSION) {
                    tempSlices.push({ ...slice, id: nextId.current++, height: topHeight });
                    tempSlices.push({ ...slice, id: nextId.current++, y: clickPoint.y, height: bottomHeight });
                } else {
                    tempSlices.push(slice);
                }
            });
            currentSlices = tempSlices;
            tempSlices = [];
        }

        // Vertical slice
        if (canSliceVertically) {
            changed = true;
            currentSlices.forEach(slice => {
                const leftWidth = clickPoint.x - slice.x;
                const rightWidth = slice.x + slice.width - clickPoint.x;

                if (leftWidth >= MIN_DIMENSION && rightWidth >= MIN_DIMENSION) {
                    tempSlices.push({ ...slice, id: nextId.current++, width: leftWidth });
                    tempSlices.push({ ...slice, id: nextId.current++, x: clickPoint.x, width: rightWidth });
                } else {
                    tempSlices.push(slice);
                }
            });
            currentSlices = tempSlices;
        }
        
        newBoxes.push(...currentSlices);
    });

    if (changed) {
        setBoxes(newBoxes);
    }
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
  
  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
    if(isDrawing) {
        handleMouseUp();
    }
  }, [isDrawing, handleMouseUp]);

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
        className="w-full h-[60vh] md:h-[70vh] bg-muted/20 cursor-none touch-none select-none overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
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
        
        {mousePos && !isDrawing && !draggingPiece && (
          <>
            <div
              className="absolute bg-red-500/70"
              style={{ left: 0, right: 0, top: mousePos.y - 0.5, height: 1, pointerEvents: 'none', zIndex: 20 }}
            />
            <div
              className="absolute bg-red-500/70"
              style={{ top: 0, bottom: 0, left: mousePos.x - 0.5, width: 1, pointerEvents: 'none', zIndex: 20 }}
            />
          </>
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
