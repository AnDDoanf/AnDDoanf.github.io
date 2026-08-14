"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useI18n } from "@/components/i18n/I18nProvider";

const FALLBACK_POINTS = [
  { mapX: 35, mapY: 43, labelX: 9, labelY: 19 },
  { mapX: 65, mapY: 48, labelX: 82, labelY: 24 },
  { mapX: 44, mapY: 64, labelX: 13, labelY: 78 },
  { mapX: 72, mapY: 66, labelX: 84, labelY: 78 },
];
const MAP_WIDTH = 2400;
const MAP_HEIGHT = 1100;
const MAP_ART_MAX_WIDTH = 1120;
const MAP_ART_ASPECT_RATIO = 1025 / 483;
const MAP_ART_VERTICAL_OFFSET = 0.44;
const MAP_ART_MAX_VIEWPORT_HEIGHT = 0.67;
const MAP_GEO_BOUNDS = {
  west: -180,
  east: 180,
  // The artwork omits Antarctica, so its vertical projection spans roughly 88°N to 40°S.
  north: 88,
  south: -40,
  // Longitude spans the full SVG viewBox; the apparent margins are ocean, not projection padding.
  svgLeft: 0,
  svgRight: 1,
  svgTop: 0,
  svgBottom: 1,
};

function clampPan(position, viewportWidth, viewportHeight) {
  function clampAxis(value, viewportSize, worldSize) {
    const travel = Math.max(0, (worldSize - viewportSize) / 2);
    return Math.min(travel, Math.max(-travel, value));
  }
  return {
    x: clampAxis(position.x, viewportWidth, MAP_WIDTH),
    y: clampAxis(position.y, viewportHeight, MAP_HEIGHT),
  };
}

function clampPercent(value, fallback) {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(96, Math.max(4, value));
}

function projectCoordinates(latitude, longitude) {
  const boundedLatitude = Math.min(MAP_GEO_BOUNDS.north, Math.max(MAP_GEO_BOUNDS.south, latitude));
  const boundedLongitude = Math.min(MAP_GEO_BOUNDS.east, Math.max(MAP_GEO_BOUNDS.west, longitude));
  const longitudeRatio = (boundedLongitude - MAP_GEO_BOUNDS.west)
    / (MAP_GEO_BOUNDS.east - MAP_GEO_BOUNDS.west);
  const latitudeRatio = (MAP_GEO_BOUNDS.north - boundedLatitude)
    / (MAP_GEO_BOUNDS.north - MAP_GEO_BOUNDS.south);

  return {
    mapX: (MAP_GEO_BOUNDS.svgLeft
      + longitudeRatio * (MAP_GEO_BOUNDS.svgRight - MAP_GEO_BOUNDS.svgLeft)) * 100,
    mapY: (MAP_GEO_BOUNDS.svgTop
      + latitudeRatio * (MAP_GEO_BOUNDS.svgBottom - MAP_GEO_BOUNDS.svgTop)) * 100,
  };
}

function getMapArtSize(viewportHeight) {
  const width = Math.min(
    MAP_ART_MAX_WIDTH,
    viewportHeight * MAP_ART_MAX_VIEWPORT_HEIGHT * MAP_ART_ASPECT_RATIO,
  );
  return { width, height: width / MAP_ART_ASPECT_RATIO };
}

function getPinWorldPosition(point, artSize) {
  const left = (MAP_WIDTH - artSize.width) / 2;
  const top = MAP_HEIGHT / 2 - artSize.height * MAP_ART_VERTICAL_OFFSET;
  return {
    x: left + (point.mapX / 100) * artSize.width + point.mapOffsetX,
    y: top + (point.mapY / 100) * artSize.height + point.mapOffsetY,
  };
}

function getPoint(gallery, index) {
  const fallback = FALLBACK_POINTS[index % FALLBACK_POINTS.length];
  const hasCoordinates = Number.isFinite(gallery.latitude) && Number.isFinite(gallery.longitude);
  const projected = hasCoordinates
    ? projectCoordinates(gallery.latitude, gallery.longitude)
    : null;
  return {
    mapX: clampPercent(projected?.mapX ?? gallery.mapX, fallback.mapX),
    mapY: clampPercent(projected?.mapY ?? gallery.mapY, fallback.mapY),
    mapOffsetX: gallery.mapOffsetX || 0,
    mapOffsetY: gallery.mapOffsetY || 0,
    labelX: clampPercent(gallery.labelX, fallback.labelX),
    labelY: clampPercent(gallery.labelY, fallback.labelY),
  };
}

function getFloatingLabelPositions(locations, pan, viewport) {
  if (!viewport.width || !viewport.height) {
    return locations.map(() => ({ x: 0, y: 0 }));
  }

  const panDeltaX = pan.x;
  const panDeltaY = pan.y;
  const labelWidth = viewport.width <= 768 ? 112 : 166;
  const labelHeight = viewport.width <= 768 ? 52 : 58;
  const halfWidth = labelWidth / 2;
  const halfHeight = labelHeight / 2;
  const edgeGap = 12;
  const collisionGap = 40;
  const placed = [];

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function overlaps(candidate) {
    return placed.some((other) => (
      Math.abs(candidate.x - other.x) < labelWidth + collisionGap
      && Math.abs(candidate.y - other.y) < labelHeight + collisionGap
    ));
  }

  return locations.map(({ point }, index) => {
    const isCompact = viewport.width <= 768;
    const rangeX = Math.min(
      isCompact ? 110 : 260,
      Math.max(isCompact ? 64 : 120, viewport.width * (0.11 + (index % 3) * 0.018)),
    );
    const rangeY = Math.min(
      isCompact ? 90 : 180,
      Math.max(isCompact ? 48 : 80, viewport.height * (0.09 + (index % 2) * 0.025)),
    );
    const factorX = 0.34 + ((index * 37) % 5) * 0.055;
    const factorY = 0.3 + ((index * 29) % 5) * 0.05;
    const baseX = (point.labelX / 100) * viewport.width;
    const baseY = (point.labelY / 100) * viewport.height;
    const viewportMinX = halfWidth + edgeGap;
    const viewportMaxX = viewport.width - halfWidth - edgeGap;
    const viewportMinY = halfHeight + edgeGap;
    const viewportMaxY = viewport.height - halfHeight - edgeGap;
    const minX = Math.max(viewportMinX, baseX - rangeX);
    const maxX = Math.min(viewportMaxX, baseX + rangeX);
    const minY = Math.max(viewportMinY, baseY - rangeY);
    const maxY = Math.min(viewportMaxY, baseY + rangeY);
    const target = {
      x: clamp(baseX + panDeltaX * factorX, minX, maxX),
      y: clamp(baseY + panDeltaY * factorY, minY, maxY),
    };
    const candidates = [target];

    for (let radius = 20; radius <= Math.max(rangeX, rangeY) * 2; radius += 20) {
      const steps = Math.max(8, Math.ceil((Math.PI * 2 * radius) / 28));
      for (let step = 0; step < steps; step += 1) {
        const angle = (step / steps) * Math.PI * 2;
        candidates.push({
          x: clamp(target.x + Math.cos(angle) * radius, minX, maxX),
          y: clamp(target.y + Math.sin(angle) * radius, minY, maxY),
        });
      }
    }

    let position = candidates.find((candidate) => !overlaps(candidate));

    if (!position) {
      const fallback = [];
      for (let y = viewportMinY; y <= viewportMaxY; y += labelHeight + collisionGap) {
        for (let x = viewportMinX; x <= viewportMaxX; x += labelWidth + collisionGap) {
          fallback.push({ x, y });
        }
      }
      fallback.sort((left, right) => (
        ((left.x - target.x) ** 2 + (left.y - target.y) ** 2)
        - ((right.x - target.x) ** 2 + (right.y - target.y) ** 2)
      ));
      position = fallback.find((candidate) => !overlaps(candidate)) ?? target;
    }

    placed.push(position);
    return {
      x: position.x,
      y: position.y,
    };
  });
}

export default function GalleryPageClient({ galleries }) {
  const { t } = useI18n();
  const mapRef = useRef(null);
  const dragRef = useRef(null);
  const movedRef = useRef(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const locations = galleries.map((gallery, index) => ({
    ...gallery,
    point: getPoint(gallery, index),
  }));
  const floatingLabels = getFloatingLabelPositions(locations, pan, mapSize);
  const mapArtSize = getMapArtSize(mapSize.height);

  useEffect(() => {
    const node = mapRef.current;
    if (!node) return undefined;

    const updateBounds = () => {
      const { width, height } = node.getBoundingClientRect();
      setMapSize({ width, height });
      setPan((current) => clampPan(current, width, height));
    };

    updateBounds();
    const observer = new ResizeObserver(updateBounds);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  function handlePointerDown(event) {
    if (event.button !== 0) return;
    movedRef.current = false;
    if (event.target.closest("a")) return;
    dragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
      originX: pan.x,
      originY: pan.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  function handlePointerMove(event) {
    const drag = dragRef.current;
    const node = mapRef.current;
    if (!drag || !node || drag.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - drag.clientX;
    const deltaY = event.clientY - drag.clientY;
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) movedRef.current = true;
    const { width, height } = node.getBoundingClientRect();
    setPan(clampPan({
      x: drag.originX + deltaX,
      y: drag.originY + deltaY,
    }, width, height));
  }

  function endDrag(event) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
  }

  function handleLocationClick(event) {
    if (movedRef.current) event.preventDefault();
  }

  if (locations.length === 0) {
    return <p className="gallery-empty">{t("gallery.empty")}</p>;
  }

  return (
    <section className="gallery-map-page" aria-labelledby="gallery-map-title">
      <div
        ref={mapRef}
        className={`gallery-map ${isDragging ? "is-dragging" : ""} ${mapSize.width ? "is-ready" : ""}`}
        role="group"
        aria-label={t("gallery.mapAriaLabel")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="gallery-map-world"
          style={{
            transform: `translate3d(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px), 0)`,
          }}
        >
          <div
            className="gallery-map-art-layer"
            style={{ width: `${mapArtSize.width}px`, height: `${mapArtSize.height}px` }}
          >
            <img
              className="gallery-map-art"
              src="/location-map.svg"
              alt=""
              aria-hidden="true"
              draggable="false"
            />

            {locations.map((gallery) => {
              const { point } = gallery;
              return (
                <Link
                  key={gallery.slug}
                  href={`/gallery/${gallery.slug}`}
                  className="gallery-map-pin"
                  style={{
                    left: `calc(${point.mapX}% + ${point.mapOffsetX}px)`,
                    top: `calc(${point.mapY}% + ${point.mapOffsetY}px)`,
                  }}
                  aria-label={t("gallery.openGallery", { title: gallery.title })}
                  onClick={handleLocationClick}
                />
              );
            })}
          </div>
        </div>

        <svg className="gallery-map-connectors" aria-hidden="true">
          {locations.map(({ slug, point }, index) => {
            const labelPosition = floatingLabels[index];
            const pin = getPinWorldPosition(point, mapArtSize);
            return (
              <line
                key={slug}
                x1={(mapSize.width - MAP_WIDTH) / 2 + pan.x + pin.x}
                y1={(mapSize.height - MAP_HEIGHT) / 2 + pan.y + pin.y}
                x2={labelPosition.x}
                y2={labelPosition.y}
              />
            );
          })}
        </svg>

        {locations.map((gallery, index) => {
          const { point } = gallery;
          const pin = getPinWorldPosition(point, mapArtSize);
          const pinScreenX = (mapSize.width - MAP_WIDTH) / 2 + pan.x + pin.x;
          const labelPosition = floatingLabels[index];
          return (
            <div
              key={gallery.slug}
              className="gallery-map-label-anchor"
              style={{
                left: `${labelPosition.x}px`,
                top: `${labelPosition.y}px`,
                "--gallery-label-float-x": `${18 + (index % 4) * 5}px`,
                "--gallery-label-float-y": `${12 + (index % 3) * 4}px`,
                "--gallery-label-float-duration": `${4.2 + (index % 3) * 0.65}s`,
                "--gallery-label-float-delay": `${index * -0.85}s`,
              }}
            >
              <Link
                href={`/gallery/${gallery.slug}`}
                className={`gallery-map-label ${labelPosition.x < pinScreenX ? "is-left" : "is-right"}`}
                onClick={handleLocationClick}
              >
                <span className="gallery-map-label-location">{gallery.location}</span>
                <span className="gallery-map-label-title">{gallery.title}</span>
              </Link>
            </div>
          );
        })}

        <div className="gallery-map-legend" aria-hidden="true">
          <span /> {t("gallery.dragToExplore")}
        </div>
      </div>
    </section>
  );
}
