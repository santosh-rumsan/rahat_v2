import * as React from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

interface LocationPickerProps {
  longitude?: number
  latitude?: number
  onChange: (coords: { longitude: number; latitude: number }) => void
}

export function LocationPicker({ longitude, latitude, onChange }: LocationPickerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const mapRef = React.useRef<mapboxgl.Map | null>(null)
  const markerRef = React.useRef<mapboxgl.Marker | null>(null)

  React.useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = TOKEN

    const initialCenter: [number, number] =
      longitude != null && latitude != null ? [longitude, latitude] : [85.324, 27.7172]

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: initialCenter,
      zoom: longitude != null ? 10 : 5,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    if (longitude != null && latitude != null) {
      markerRef.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([longitude, latitude])
        .addTo(map)

      markerRef.current.on('dragend', () => {
        const lngLat = markerRef.current!.getLngLat()
        onChange({ longitude: lngLat.lng, latitude: lngLat.lat })
      })
    }

    map.on('click', (e) => {
      const { lng, lat } = e.lngLat

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat])
      } else {
        markerRef.current = new mapboxgl.Marker({ draggable: true })
          .setLngLat([lng, lat])
          .addTo(map)

        markerRef.current.on('dragend', () => {
          const lngLat = markerRef.current!.getLngLat()
          onChange({ longitude: lngLat.lng, latitude: lngLat.lat })
        })
      }

      onChange({ longitude: lng, latitude: lat })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-2">
      <div ref={containerRef} className="w-full h-64 rounded-xl overflow-hidden border border-gray-200" />
      <p className="text-xs text-gray-400">Click on the map to set the project location. You can also drag the pin.</p>
    </div>
  )
}
