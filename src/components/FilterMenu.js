import React, { Component } from 'react';
import Drawer from '@material-ui/core/Drawer';
import './FilterMenu.css'; 

class FilterMenu extends Component {
  
  state = {
    filter: ""
  }

  updateFilter = (filter) => {
        this.setState({ filter: filter });
        this.props.filterLocations(filter);
    }

  render = () => {
    return (
      <div>
        <Drawer open={this.props.openMenu} onClose={this.props.toggleDrawer}>
          <div className="List">
            <input className="Filter-text" type="text" placeholder="Filter Options"
                name="filter" onChange={(e) => this.updateFilter(e.target.value)}
                value={this.state.filter} />
            
            <ul className="List-ul">
                {this.props.locations && this.props.locations
                  .map((location, index) => {
                    console.log("val: " + (this.props.originalLocations));
                    return (<li className="List-item" key={index}>
                              <button className="List-button" key={index} onClick={e => this.props.clickListItem(((this.props.originalLocations).findIndex((item) => item.name === location.name)))}>{location.name}</button>
                            </li>
                    )
                  }
                )}
            </ul>

          </div>
         </Drawer>
      </div>
    );
  }
}

export default FilterMenu;