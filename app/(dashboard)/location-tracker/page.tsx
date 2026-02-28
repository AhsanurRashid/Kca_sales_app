"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, StopCircle, RefreshCw, Clock, Gauge } from "lucide-react"
import { sendLocationData } from "@/app/actions/send-location-action"

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  altitude: number | null
  speed: number | null
  heading: number | null
  timestamp: number
}

const LocationTrackerPage = () => {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<LocationData[]>([])
  const [sendCount, setSendCount] = useState(0)
  const [lastSendStatus, setLastSendStatus] = useState<"idle" | "success" | "error">("idle")
  const [lastSendTime, setLastSendTime] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const locationRef = useRef<LocationData | null>(null)

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      return
    }
    setError(null)
    setIsTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const data: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: position.timestamp,
        }
        setLocation(data)
        locationRef.current = data
        setHistory((prev) => [data, ...prev].slice(0, 20))
      },
      (err) => {
        setError(err.message)
        setIsTracking(false)
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    )

    // Send location every 500ms
    intervalRef.current = setInterval(() => {
      if (locationRef.current) {
        sendLocationData({
          lat: locationRef.current.latitude,
          lng: locationRef.current.longitude,
        }).then((res) => {
          setSendCount((c) => c + 1)
          setLastSendTime(new Date().toLocaleTimeString())
          setLastSendStatus(res.success ? "success" : "error")
        }).catch(() => {
          setSendCount((c) => c + 1)
          setLastSendTime(new Date().toLocaleTimeString())
          setLastSendStatus("error")
        })
      }
    }, 500)
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsTracking(false)
  }

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const mapSrc = location
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.01},${location.latitude - 0.01},${location.longitude + 0.01},${location.latitude + 0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`
    : null

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold">Location Tracker</h1>
        </div>
        <div className="flex gap-2">
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              <Navigation className="w-4 h-4" />
              Start Tracking
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="flex items-center gap-2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition"
            >
              <StopCircle className="w-4 h-4" />
              Stop Tracking
            </button>
          )}
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`w-2.5 h-2.5 rounded-full ${isTracking ? "bg-green-500 animate-pulse" : "bg-muted-foreground"}`}
        />
        <span className="text-muted-foreground">
          {isTracking ? "Live tracking active" : "Tracking stopped"}
        </span>
      </div>

      {/* Send status debug panel */}
      <div className="flex items-center gap-4 bg-card border rounded-lg px-4 py-2 text-sm">
        <span className="text-muted-foreground font-medium">API Send Status</span>
        <span className={`flex items-center gap-1 font-mono font-semibold ${lastSendStatus === "success" ? "text-green-500" : lastSendStatus === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          <span className={`w-2 h-2 rounded-full ${lastSendStatus === "success" ? "bg-green-500" : lastSendStatus === "error" ? "bg-destructive" : "bg-muted-foreground"}`} />
          {lastSendStatus === "idle" ? "Not sent yet" : lastSendStatus === "success" ? "Success" : "Error"}
        </span>
        <span className="text-muted-foreground">Sends: <span className="text-foreground font-mono font-bold">{sendCount}</span></span>
        {lastSendTime && (
          <span className="text-muted-foreground">Last: <span className="text-foreground font-mono">{lastSendTime}</span></span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Coordinates cards */}
      {location && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-card border rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Latitude</p>
            <p className="text-lg font-mono font-semibold">{location.latitude.toFixed(6)}°</p>
          </div>
          <div className="bg-card border rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Longitude</p>
            <p className="text-lg font-mono font-semibold">{location.longitude.toFixed(6)}°</p>
          </div>
          <div className="bg-card border rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Gauge className="w-3 h-3" /> Accuracy
            </p>
            <p className="text-lg font-mono font-semibold">±{location.accuracy.toFixed(1)} m</p>
          </div>
          {location.altitude !== null && (
            <div className="bg-card border rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Altitude</p>
              <p className="text-lg font-mono font-semibold">{location.altitude.toFixed(1)} m</p>
            </div>
          )}
          {location.speed !== null && (
            <div className="bg-card border rounded-lg p-4 space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Speed</p>
              <p className="text-lg font-mono font-semibold">
                {(location.speed * 3.6).toFixed(1)} km/h
              </p>
            </div>
          )}
          <div className="bg-card border rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Clock className="w-3 h-3" /> Last Update
            </p>
            <p className="text-sm font-mono font-semibold">
              {new Date(location.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}

      {/* Map */}
      {mapSrc && (
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <span className="text-sm font-medium">Live Map</span>
            <a
              href={`https://www.openstreetmap.org/?mlat=${location!.latitude}&mlon=${location!.longitude}#map=16/${location!.latitude}/${location!.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              Open in maps <RefreshCw className="w-3 h-3" />
            </a>
          </div>
          <iframe
            src={mapSrc}
            width="100%"
            height="380"
            className="border-0"
            title="Live Location Map"
          />
        </div>
      )}

      {/* No location yet */}
      {!location && !error && (
        <div className="flex flex-col items-center justify-center bg-card border rounded-lg p-16 text-center gap-3">
          <MapPin className="w-12 h-12 text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">
            Press <strong>Start Tracking</strong> to get your live location.
          </p>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="px-4 py-2 border-b">
            <span className="text-sm font-medium">Location History (last 20)</span>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {history.map((h, i) => (
              <div key={h.timestamp} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="text-muted-foreground text-xs w-5">{i + 1}</span>
                <span className="font-mono">{h.latitude.toFixed(5)}, {h.longitude.toFixed(5)}</span>
                <span className="text-muted-foreground text-xs">
                  {new Date(h.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationTrackerPage
