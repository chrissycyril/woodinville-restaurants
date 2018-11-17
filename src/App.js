import React, { Component } from 'react';
import locations from './resources/locations.json';
import MapContainer from './components/MapContainer';
import FilterMenu from './components/FilterMenu';
//import 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css';

import './App.css';

class App extends Component {
  
  state = {
    lat: 47.7542837,
    lng: -122.1506417,
    zoom: 15,
    locations: locations,
    filtered: null,
    openMenu: false
  }

  filterLocations = (locations, filter) => {
    // Filter locations
    return locations.filter(location => location.name.toLowerCase().includes(filter.toLowerCase()));
  }
  
  componentDidMount = () => {
    this.setState({
      ...this.state,
      filtered: this.filterLocations(this.state.locations, "")
    });
  } 

  updateFilter = (filter) => {
    // Update the query value and filter the list of locations accordingly
    this.setState({
      ...this.state,
      selectedIndex: null,
      filtered: this.filterLocations(this.state.locations, filter)
    });
  }

  toggleDrawer = () => {
    this.setState({
      openMenu: !this.state.openMenu
    });
  }

  clickListItem = (index) => {
    // Set the state to reflect the selected location array index
    this.setState({ selectedIndex: index, openMenu: !this.state.open })
  }

  render = () => {
    return (
      <div>
        <button onClick={this.toggleDrawer} className="Menu-button">
          <i className="fa fa-bars fa-2x"></i>
        </button>
        <div className="App">
          <h1>Restaurants in Woodinville</h1>
        </div>
        <MapContainer
          lat={this.state.lat}
          lng={this.state.lng}
          zoom={this.state.zoom}
          locations={this.state.locations}
          selectedIndex={this.state.selectedIndex}
          clickListItem={this.clickListItem}/>
        <FilterMenu
          openMenu={this.state.openMenu}
          toggleDrawer={this.toggleDrawer}
          locations={this.state.filtered}
          filterLocations={this.updateFilter}
          originalLocations={this.state.locations}
          clickListItem={this.clickListItem}/>
      </div>
    );
  }
}

export default App;
