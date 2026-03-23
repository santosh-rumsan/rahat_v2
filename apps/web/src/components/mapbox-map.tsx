import * as React from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

interface Marker {
  longitude: number
  latitude: number
}

interface MapboxMapProps {
  longitude?: number
  latitude?: number
  zoom?: number
  className?: string
  legend?: string
  markers?: Marker[]
}

export function MapboxMap({ longitude, latitude, zoom = 10, className, legend, markers }: MapboxMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<mapboxgl.Map | null>(null)

  React.useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = TOKEN

    const allMarkers: Marker[] =
      markers ?? (longitude != null && latitude != null ? [{ longitude, latitude }] : [])

    const center: [number, number] =
      longitude != null && latitude != null
        ? [longitude, latitude]
        : allMarkers.length > 0
          ? [allMarkers[0].longitude, allMarkers[0].latitude]
          : [85.324, 27.7172]

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center,
      zoom,
      attributionControl: false,
    })

    for (const m of allMarkers) {
      new mapboxgl.Marker({ color: '#2563eb' })
        .setLngLat([m.longitude, m.latitude])
        .addTo(map)
    }

    if (allMarkers.length > 1) {
      const bounds = allMarkers.reduce(
        (b, m) => b.extend([m.longitude, m.latitude] as [number, number]),
        new mapboxgl.LngLatBounds(
          [allMarkers[0].longitude, allMarkers[0].latitude],
          [allMarkers[0].longitude, allMarkers[0].latitude],
        ),
      )
      map.fitBounds(bounds, { padding: 60 })
    }

    map.on('load', () => {
      const logo = containerRef.current?.querySelector('.mapboxgl-ctrl-logo') as HTMLElement | null
      if (logo) logo.style.display = 'none'
      const attr = containerRef.current?.querySelector('.mapboxgl-ctrl-attrib') as HTMLElement | null
      if (attr) attr.style.display = 'none'
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [longitude, latitude, zoom, markers])

  return (
    <div ref={containerRef} className={`relative ${className ?? 'w-full h-64 rounded-xl'}`}>
      {legend && (
        <div
          style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, pointerEvents: 'none' }}
          className="bg-white rounded-lg shadow-md px-3 py-1.5 flex items-center gap-2 text-sm"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0" />
          <span className="text-gray-700 font-medium">{legend}</span>
        </div>
      )}
    </div>
  )
}
