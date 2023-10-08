import "./App.css";
import "@tomtom-international/web-sdk-maps/dist/maps.css";
import * as ttmaps from "@tomtom-international/web-sdk-maps";
import { useRef, useEffect, useState } from "react";
import tt from "@tomtom-international/web-sdk-services";

import legend from './legendflow.jpg'

const App = () => {
  const mapElement = useRef();
  const [map, setMap] = useState({});
  const [mapLongitude, setMapLongitude] = useState(null);
  const [mapLatitude, setMapLatitude] = useState(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState({});

  const moveMapTo = (newLoc) => {
    map.flyTo({
      center: newLoc,
      zoom: 14,
    });
  };

  
  const ResultBox = ({ result }) => (
    <div
      className="result"
      onClick={(e) => {
        moveMapTo(result.position);
        setMapLongitude(result.position.lng);
        setMapLatitude(result.position.lat);
      }}
    >
      {result.address.freeformAddress}, {result.address.country}
    </div>
  );

  const fuzzySearch = (query) => {
    tt.services.fuzzySearch({
      key: "PrI8sO86JcjBR6TBBeuAiQlEd5JOZAWt",
      query: query,
    })
      .then((res) => {
        const amendRes = res.results;
        setResult(amendRes);
        moveMapTo(res.results[0].position);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    const initializeMap = () => {
      const mapInstance = ttmaps.map({
        key: "PrI8sO86JcjBR6TBBeuAiQlEd5JOZAWt",
        container: mapElement.current,
        center: [mapLongitude, mapLatitude],
        zoom: 20,
        pitch: 50,
        style: {
          map: "basic_main",
          poi: "poi_main",
          trafficFlow: "flow_relative",
          trafficIncidents: "incidents_day",
        },
        stylesVisibility: {
          trafficFlow: true,
          trafficIncidents: true,
        },
      });

      mapInstance.on('styledata', () => {
      });

      setMap(mapInstance);

      return () => {
        mapInstance.remove();
      };
    };

    initializeMap();
  }, [mapLongitude, mapLatitude]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapLongitude(position.coords.longitude);
        setMapLatitude(position.coords.latitude);
      },
      (error) => {
        alert(error.message);
      }
    );
  }, []);


  return (
    <div className="App">
      <div className="control">
        <h2>Traffic Flow</h2>
        <div className="search-wrapper">
          <div className="search-control">
            <input
              className="input"
              type="text"
              placeholder="Search Location"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  fuzzySearch(query);
                }
              }}
              required
            />
            <button type="submit" onClick={() => fuzzySearch(query)}>
              Search
            </button>
          </div>
          <div className="results">
            {result.length > 0 ? (
              result.map((resultItem) => (
                <ResultBox result={resultItem} key={resultItem.id} />
              ))
            ) : (
              <h4>No locations</h4>
            )}
          </div>
        </div>
      </div>
      <div ref={mapElement} id="map-area"></div>
      <img src={legend} alt="Legend" className="image-overlay" />
    </div>
  );
};

export default App;
