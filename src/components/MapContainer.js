import React, { Component } from 'react';
import './MapContainer.css';
import {Map, InfoWindow, GoogleApiWrapper} from 'google-maps-react';

const MAP_KEY = "AIzaSyDA184Me0mUoWY2JEvHzUJ6EkwHpmK2mjc";
const FS_CLIENT = "W24OUX3GL14PJNBHTMSPEFS1UOE4JR52GJGNWLFFLE5BAOTX";
const FS_SECRET = "WZPNQGVT1AFX32WKKI0KSRAE5L4XV1RCTTWFQJQU0Y0DGZCI";
const FS_VERSION = "20181110";


export class MapContainer extends Component {
  
  state = {
    map: null,
    markers: [],
    markerProperties: [],
    activeMarker: null,
    activeMarkerProperties: null,
    showInfoWindow: false
  }

  componentWillReceiveProps = (props) => {
    
    this.setState({firstDrop: false});

    // Handling Change in the number of locations.
    if (this.state.markers.length !== props.locations.length) {
      this.closeInfoWindow();
      this.updateMarkers(props.locations);
      this.setState({activeMarker: null});
      return;
    }

    // Closing info when the selected maker changes.
    if (!props.selectedIndex || (this.state.activeMarker && 
        (this.state.markers[props.selectedIndex] !== this.state.activeMarker))) {
          this.closeInfoWindow();
    }

    // Dont do anything if there is no selected marker.
    if (props.selectedIndex === null || typeof(props.selectedIndex) === "undefined") {
        return;
    };
    
    this.onMarkerClick(this.state.markerProperties[props.selectedIndex], this.state.markers[props.selectedIndex]);
  }

  closeInfoWindow = () => {
    // Close info window
    this.state.activeMarker && this.state.activeMarker.setAnimation(null);
    this.setState({showInfoWindow: false, activeMarker: null, activeMarkerProperties: null});
  }

  onMarkerClick = (props, marker, e) => {
    this.closeInfoWindow();
    // Fetch the FourSquare data for the selected restaurant
    let url = `https://api.foursquare.com/v2/venues/search?client_id=${FS_CLIENT}&client_secret=${FS_SECRET}&v=${FS_VERSION}&radius=100&ll=${props.position.lat},${props.position.lng}&llAcc=100`;
    let headers = new Headers();
    let request = new Request(url, {
      method: 'GET',
      headers
    });

    fetch(request)
      .then(response => response.json())
      .then(result => {
        let activeMarkerProperties;
        let restaurant = result.response
            .venues
            .filter(item => item.name.includes(props.name) || props.name.includes(item.name));
        activeMarkerProperties = {
          ...props,
          foursquare: restaurant[0]
        }

        if (activeMarkerProperties.foursquare) {
          let url = `https://api.foursquare.com/v2/venues/${restaurant[0].id}/photos?client_id=${FS_CLIENT}&client_secret=${FS_SECRET}&v=${FS_VERSION}`;
          fetch(url)
            .then(response => response.json())
            .then(result => {
              result.response ? (
                activeMarkerProperties = {
                ...activeMarkerProperties,
                images: result.response.photos
              }):activeMarkerProperties = {
                ...activeMarkerProperties};
              marker.setAnimation(this.props.google.maps.Animation.BOUNCE);
              this.setState({showInfoWindow: true, activeMarker: marker, activeMarkerProperties});
            })
        } else {
          marker.setAnimation(this.props.google.maps.Animation.BOUNCE);
          this.setState({showInfoWindow: true, activeMarker: marker, activeMarkerProperties});
        }
    })
    .catch(error => {
      let activeMarkerProperties = {
        ...props
      }
      marker.setAnimation(this.props.google.maps.Animation.BOUNCE);
      this.setState({showInfoWindow: true, activeMarker: marker, activeMarkerProperties});
    });
    
  }

  updateMarkers = (locations) => {
    // If all locations have been filtered, do nothing
    if (!locations) 
      return;
        
    // Clear existing markers from the map.
    this.state.markers.forEach(marker => marker.setMap(null));

    // Iterate over the locations and add them in markers
    // Also keep track of the corresponding property in markerProperties
    let markerProperties = [];
    let markers = locations.map((location, index) => {
      let markerProperty = {
        key: index,
        name: location.name,
        street: location.street,
        city: location.city,
        state: location.state,
        zip: location.zip,
        position: location.pos,
        url: location.url
      };
      
      markerProperties.push(markerProperty);
      let animation = this.props.google.maps.Animation.DROP;
      let marker = new this.props.google.maps
                      .Marker({position: location.pos, map: this.state.map, animation});
      marker.addListener('click', (target) => {
        this.onMarkerClick(markerProperty, marker, target);
      });
      
      return marker;
    })

    this.setState({markers, markerProperties});
  }

  mapReady = (props, map) => {
    this.setState({map});
    this.updateMarkers(this.props.locations);
  }

	render = () => {
    let mapStyles = {
      width: '100%',
      height: '100%'
    }

    let center = {
      lat: this.props.lat,
      lng: this.props.lng
    }
    let activeProperties = this.state.activeMarkerProperties;
    return (
      <Map
        role="application"
        aria-label="map"
        google={this.props.google}
        style={mapStyles}
        initialCenter={center}
        zoom={this.props.zoom}
        onReady={this.mapReady}
        onClick={this.closeInfoWindow}>
        <InfoWindow
          marker={this.state.activeMarker}
          visible={this.state.showInfoWindow}
          onClose={this.closeInfoWindow}>
          <div>
            {activeProperties && activeProperties.images
              ? (
                <div className="Images">
                <img alt={activeProperties.name} 
                  src={activeProperties.images.items[0].prefix + "100x100" + activeProperties.images.items[0].suffix}/>
                  </div>
                  ):""}

            {activeProperties? 
            (<div className="Content">
              <h3>{activeProperties.name}</h3>
              <h4>{activeProperties.street? 
                  activeProperties.street: ""}, {activeProperties.city? 
                  activeProperties.city: ""}, {activeProperties.state? 
                  activeProperties.state: ""} - {activeProperties.zip? 
                  activeProperties.zip: ""}</h4>
                  {activeProperties&&activeProperties.url? 
                  (<a href={activeProperties.url}>Website</a>): ""}
            </div>) : ""
            }
          </div>
        </InfoWindow>
      </Map>
    );
  }
}

export default GoogleApiWrapper({apiKey: MAP_KEY})(MapContainer);