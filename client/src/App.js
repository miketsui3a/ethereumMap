import React, { Component } from "react";
//import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import MapContract from "./contracts/Map.json"

import { Map, TileLayer, Marker} from 'react-leaflet';
import L from 'leaflet';
import Popup from "reactjs-popup"

import "./App.css";

class App extends Component {
  state = { web3: null, accounts: null, contract: null ,open: false, coordinate: null, markers:[]};

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = MapContract.networks[networkId];
      const instance = new web3.eth.Contract(
        MapContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.getDataFromBlockchain);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  mapOnClick=(e)=>{
    this.setState({ open: true });
    this.setState({coordinate:[e.latlng.lat, e.latlng.lng]})
  }

  getDataFromBlockchain = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    // await contract.methods.insertData("hi").send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getData().call();
    console.log(response)
    let tmp = []
    response.map((x)=>{
      tmp.push([parseFloat(x.split(",")[0]),parseFloat(x.split(",")[1])])
    })
    // Update state with the result.
    this.setState({ markers: tmp });
  };

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App" >
        <Popup open={this.state.open} closeOnDocumentClick onClose={()=>{
          this.setState({open:false})
        }}>
          <button onClick={async ()=>{
            console.log(this.state.coordinate.toString())
            await this.state.contract.methods.insertData(this.state.coordinate.toString()).send({ from: this.state.accounts[0] })
            this.setState({open:false})
          }}>Confirm?</button>
        </Popup>

        <Map center={[22.3193, 114.1694]} zoom={15} maxZoom={19} onclick={this.mapOnClick}>
          <TileLayer
            url="	https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />
          {
            this.state.markers.map(x=>{
              return(
                <Marker position={x}>
                </Marker>
              )
            })
          }
        </Map>
      </div>
    );
  }
}

export default App;
