import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Colors } from '../theme/colors';
import api from '../api/client';

const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { padding: 0; margin: 0; }
    html, body, #map { height: 100%; width: 100vw; }
    
    /* Reset default Leaflet divIcon background and border */
    .leaflet-div-icon {
      background: transparent !important;
      border: none !important;
    }
    
    /* Teardrop map pin with arrow pointing directly down */
    .custom-pin-container {
      position: relative;
      width: 36px;
      height: 42px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .custom-pin-emblem {
      background-color: #1B56FD;
      border: 2px solid white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      z-index: 2;
    }
    .custom-pin-arrow {
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 8px solid #1B56FD;
      margin-top: -2px;
      z-index: 1;
      filter: drop-shadow(0 2px 2px rgba(0,0,0,0.2));
    }
    
    /* Tourist avatar pulsing styles */
    .custom-pulse-container {
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .custom-tourist-avatar {
      background-color: #FFB300;
      border: 2.5px solid white;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 3px 12px rgba(0,0,0,0.4);
      z-index: 10;
    }
    .custom-pulse-ring {
      position: absolute;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: rgba(255, 179, 0, 0.4);
      animation: ripple 1.6s infinite;
      z-index: 1;
    }
    @keyframes ripple {
      0% {
        transform: scale(0.6);
        opacity: 1;
      }
      100% {
        transform: scale(1.4);
        opacity: 0;
      }
    }
    
    .leaflet-popup-content-wrapper {
      border-radius: 16px;
      padding: 6px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .leaflet-popup-content {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      font-size: 13px;
      color: #333;
      line-height: 18px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Initialize map centered in Jordan
    var map = L.map('map', { 
      zoomControl: false,
      minZoom: 7,
      maxZoom: 18
    }).setView([31.2, 36.5], 8.2);
    
    // Restrict scrolling/dragging strictly to Jordan borders
    var jordanBounds = L.latLngBounds(
      L.latLng(29.1, 34.5), // Southwest corner (Aqaba)
      L.latLng(33.4, 39.3)  // Northeast corner (Border)
    );
    map.setMaxBounds(jordanBounds);
    map.on('drag', function() {
      map.panInsideBounds(jordanBounds, { animate: false });
    });
    
    // Clean, premium, minimalist cartodb map style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    var userMarker = null;
    var markers = {};

    // Premium custom landmark marker icon with arrow pointing directly down
    var destIcon = L.divIcon({
      html: '<div class="custom-pin-container"><div class="custom-pin-emblem">🏛️</div><div class="custom-pin-arrow"></div></div>',
      className: 'custom-dest-icon',
      iconSize: [36, 42],
      iconAnchor: [18, 42]
    });

    function handleReactNativeMessage(event) {
      var data;
      try {
        data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      } catch (e) {
        return;
      }
      if (!data) return;

      if (data.type === "setLocations") {
        data.locations.forEach(function(loc) {
          if (loc.coordinates) {
            if (markers[loc._id]) {
              markers[loc._id].remove();
            }
            var marker = L.marker([loc.coordinates.lat, loc.coordinates.lng], { icon: destIcon })
              .addTo(map)
              .bindPopup("<b>📍 " + loc.name + "</b><br>" + (loc.description || "معلم سياحي أردني"));
            markers[loc._id] = marker;
          }
        });
      }

      if (data.type === "setUserLocation") {
        var lat = data.lat;
        var lng = data.lng;
        
        if (userMarker) {
          userMarker.setLatLng([lat, lng]);
        } else {
          // Display user as a beautiful tourist emoji avatar with pulse effect
          var touristIcon = L.divIcon({ 
            html: '<div class="custom-pulse-container"><div class="custom-pulse-ring"></div><div class="custom-tourist-avatar">🤠</div></div>',
            className: 'custom-tourist-icon',
            iconSize: [36, 36],
            iconAnchor: [18, 18]
          });
          userMarker = L.marker([lat, lng], { icon: touristIcon }).addTo(map)
            .bindPopup("<b>أنت هنا (السائح المغامر) 👋</b>");
        }
        
        if (data.center) {
          map.setView([lat, lng], 13);
          userMarker.openPopup();
        }
      }
    }

    // Attach to both window and document to guarantee Android compatibility!
    window.addEventListener("message", handleReactNativeMessage);
    document.addEventListener("message", handleReactNativeMessage);

    window.ReactNativeWebView.postMessage(JSON.stringify({ type: "ready" }));
  </script>
</body>
</html>
`;

export default function MapScreen() {
  const webViewRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    if (mapReady) {
      const timer = setTimeout(() => {
        loadLocations();
        startLocationTracking();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [mapReady]);

  const loadLocations = async () => {
    try {
      const res = await api.get('/api/locations');
      sendMessageToMap({
        type: 'setLocations',
        locations: res.data
      });
    } catch (err) {
      console.log('Error loading locations for map:', err);
    }
  };

  const startLocationTracking = async () => {
    // Send initial default location (Amman Citadel) immediately so the avatar Cowboy ALWAYS appears!
    sendMessageToMap({
      type: 'setUserLocation',
      lat: 31.9547,
      lng: 35.9344,
      center: true
    });

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000,
          distanceInterval: 10
        },
        (loc) => {
          sendMessageToMap({
            type: 'setUserLocation',
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
            center: false
          });
        }
      );
    } catch (err) {
      console.log('Error watching user position:', err);
    }
  };

  const centerOnUser = async () => {
    setTracking(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        sendMessageToMap({
          type: 'setUserLocation',
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
          center: true
        });
        setTracking(false);
        return;
      }
    } catch (err) {
      console.log('Error centering on user, falling back to default:', err);
    }

    // Fallback to Amman coordinates if GPS is off/denied
    sendMessageToMap({
      type: 'setUserLocation',
      lat: 31.9547,
      lng: 35.9344,
      center: true
    });
    setTracking(false);
  };

  const sendMessageToMap = (data) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify(data));
    }
  };

  const handleMapMessage = (event) => {
    const data = JSON.parse(event.nativeEvent.data);
    if (data.type === 'ready') {
      setMapReady(true);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header - renamed to 'مسار' based on request */}
      <View style={styles.header}>
        <Text style={styles.title}>🗺️ مساري السياحي في الأردن</Text>
        <Text style={styles.subtitle}>تتبع موقعك المغامر واستكشف معالم الأردن المحدودة 🇯🇴</Text>
      </View>

      {/* Map WebView Container */}
      <View style={styles.mapContainer}>
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          style={styles.webView}
          onMessage={handleMapMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />

        {/* Center on User Float Action Button */}
        <TouchableOpacity style={styles.fab} onPress={centerOnUser} disabled={tracking}>
          {tracking ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.fabText}>🎯</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: Colors.primary },
  header:       { backgroundColor: Colors.mainBlue, padding: 20, paddingTop: 10 },
  title:        { color: Colors.white, fontSize: 18, fontWeight: '800' },
  subtitle:     { color: Colors.paleBlue, fontSize: 12, marginTop: 2 },
  mapContainer: { flex: 1, position: 'relative' },
  webView:      { flex: 1 },
  fab:          { position: 'absolute', bottom: 20, left: 20, backgroundColor: Colors.mainBlue, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, elevation: 6 }
});
