import React, { Component } from "react";
//import SimpleStorageContract from "./contracts/SimpleStorage.json";


import getWeb3 from "./getWeb3";
import MapContract from "./contracts/Map.json"
import MyOracle from "./contracts/myOracle.json";
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import Popupl from "reactjs-popup"
//import 'react-notifications/lib/notifications.css';
import Callback from "./contracts/Callback.json"
import "./App.css";
var AppSelf
var MarkerCount = 0;
var MarkerName = [];
var MarkersTimestamps = [];
var rows = [];
class App extends Component {
  state = {
    web3: null, accounts: null, contract: null, open: false, coordinate: null, markers: [], blockNo: null, networkId: null,
    listToOracleTimeout: null, monitorMapperTimeout: null, checkMakersTimeout: null, oracleContract: null, monitorMarkerTimeout: null,
    fromBlock: 0, selected: 0, markersHistory: [], openMenu: false, startDate: "2020-04-20T19:00:00", endDate: "2020-05-30T23:00:00",
     eventTitle: '',eventDesc: '',eventStatus: false, historyLocation: [], smallMapCoor:null
  };

  componentDidMount = async () => {
    AppSelf = this;
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
      const OracleDeployedNetwork = MyOracle.networks[networkId];
      const oracleInstance = new web3.eth.Contract(
        MyOracle.abi,
        OracleDeployedNetwork && OracleDeployedNetwork.address
      );
      
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3, accounts, contract: instance, networkId: networkId,
        oracleContract: oracleInstance
      }, this.getDataFromBlockchain);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  mapOnClick = (e) => {
    this.setState({ open: true });
    this.setState({ coordinate: [e.latlng.lat, e.latlng.lng] })
  }

  getDataFromBlockchain = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    // await contract.methods.insertData("hi").send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.getData().call();
    //console.log('123444',response)
    let tmp = []
    response.map((x) => {
      let a = x.split(",")
      if(new Date().getTime()-parseInt(a[2])<=86400000){
        tmp.push([parseFloat(x.split(",")[0]), parseFloat(x.split(",")[1]),parseInt(x.split(",")[2])])
      }
    })
    //console.log('123', tmp)
    // Update state with the result.
    this.setState({ markers: tmp }
      , function () {
        var x = setTimeout(this.monitorMarker, 2000);
        var y = setTimeout(this.checkMakers, 2000);
        var z = setTimeout(this.listToOracle, 2000);
        this.setState({
          monitorMarkerTimeout: x,
          checkMakersTimeout: y,
          listToOracleTimeout: z
        })
      }
    );
  };
  monitorMarker() {
    var x = setTimeout(AppSelf.monitorMarker, 2000);
    AppSelf.setState({ monitorMarkerTimeout: x });
    console.log("pre-monitorMarker: " + AppSelf.state.contract._address);
    var fromBlock = AppSelf.state.fromBlock;
    // const ac = AppSelf.state.defaultaccount;
    console.log('454', AppSelf.state.contract)
    AppSelf.state.web3.eth.subscribe("logs", { address: AppSelf.state.contract._address }, function (error, result) {
      if (!error)
        console.log(result);
    })
      .on("data", function (event) {
        console.log('111', event)
        if (!fromBlock || fromBlock < event.blockNumber) {
          AppSelf.setState({ fromBlock: event.blockNumber });
          AppSelf.setState({ blockNo: event.blockNumber });
        }
        console.log('callback in monitorWinner: block ' + event.blockNumber);
      });
  }
  checkMakers() {
    var history = AppSelf.state.markersHistory
    var tmpBlockNo = 0
    var y = setTimeout(AppSelf.checkMakers, 2000);
    AppSelf.setState({ checkMakersTimeout: y });
    const b = AppSelf.state.fromBlock;
    if (!b) {
      console.log('in checkMarker: bypass',b);
      return;
    }
    console.log('in checkMarkers: ' + b);
    //console.log('555',AppSelf.state.contract)
    // console.log('test1', AppSelf.state.contract.events.addMarker({
    //   fromBlock: b, toBlock: 'latest'
    // }))
    AppSelf.state.contract.events.Notification({
      fromBlock: b, toBlock: 'latest'
    })
      .on('data', function (event) {
        // console.log(event.blockNumber, event.returnValues)

        // process the data in the transaction log for Winner event
        if (!AppSelf.state.fromBlock || AppSelf.state.fromBlock <= event.blockNumber) {
          if(tmpBlockNo !=event.blockNumber){
          history.push(event)
          }
          AppSelf.setState({
            blockNo: event.blockNumber,
            fromBlock: event.blockNumber,
            markersHistory: history
          });
          tmpBlockNo = event.blockNumber
          console.log('344', event)
          // clear the two timeout events
          clearTimeout(AppSelf.state.monitorMapperTimeout);
          clearTimeout(AppSelf.state.checkMakersTimeout);
          console.log('222', AppSelf.state.markersHistory)

        }
      })
      .on('changed', function (event) {
        // remove event from local database
      })
      .on('error', console.error);
    // y = setTimeout(AppSelf.checkWinner, 2000);
    // AppSelf.setState({checkWinnerTimeout: y});
  }

  processOracleData(callback_address, data) {
    return data
  }
  sendDataToBlockchain = async (address, data) => {
    if (!address) return;
    console.log('in sendDataToBlockchain:' + address);
    const contractToCall = new AppSelf.state.web3.eth.Contract(
      Callback.abi,
      address
    );
    //console.log('1112', contractToCall); // the contract to be called back
    //console.log('2223', AppSelf.state.contract); // for our comparison only
    var callerAC = AppSelf.state.accounts[0];
    var parameter = data; // X wins the game.
    var prefix = "contractToCall.methods";
    var method = "." + Callback.abi[0].name + "('" + parameter + "')"; // callback function
    var sendTx = "." + "send({ from:'" + callerAC + "', gas: 80000 })";
    var wholeCall = prefix + method + sendTx;
    //console.log(wholeCall); // for our visualization of the call only
    eval(wholeCall);
  }
  handleStart = (value) => {
    this.setState({ startDate: value }, this.getPastHistory());
  };
  handleEnd = (value) => {
    this.setState({ endDate: value }, this.getPastHistory());
  };
  getPastHistory() {
    MarkersTimestamps = [];
    MarkerName = [];
    AppSelf.state.contract.getPastEvents("Notification", { fromBlock: 0, toBlock: 'latest' },
      (error, result) => { })
      .then((events) => {
        if (events.length > 0) {
          MarkerName.push("GENESIS");
          var block = AppSelf.state.web3.eth.getBlock(0);
          block.then(function (response) {
            MarkersTimestamps.push(response.timestamp);
            console.log("in getPastHistory:" + block);
          });
          for (var i = 0; i < events.length; i++) {
            //This is an asynchronous call
            var block2 = async () => {
              console.log('==>' + events[i].returnValues[1]);
              MarkerName.push(events[i].returnValues[1]);
              var response = await AppSelf.state.web3.eth.getBlock(events[i].blockNumber);
              //console.log(response.timestamp);
              return response;
            };
            block2().then((response) => {
              MarkersTimestamps.push(response.timestamp);
            });
          }
        }
      });
  }
  printHistory = () => {
    var start = new Date(this.state.startDate + "Z");
    var end = new Date(this.state.endDate + "Z");
    var startTS = Math.round((new Date()).getTime() / 1000) - (8 * 3600);
    var endTS = Math.round((new Date(end)).getTime() / 1000) - (8 * 3600);
    rows = [];
    for (var i = 0; i < MarkerName.length; i++) {
      if (MarkersTimestamps[i] > startTS && MarkersTimestamps[i] < endTS) {
        var row = [i, MarkerName[i], AppSelf.timeConverter(MarkersTimestamps[i])];
        console.log(i + 1 + " => " + MarkerName[i] + " WON at " + MarkersTimestamps[i]);
        rows.push(row);
      }
    }
  }
  timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours() < 10 ? ('0' + a.getHours()) : a.getHours();
    var min = a.getMinutes() < 10 ? ('0' + a.getMinutes()) : a.getMinutes();
    var sec = a.getSeconds() < 10 ? ('0' + a.getSeconds()) : a.getSeconds();
    var time = date + '-' + month + '-' + year + ' @ ' + hour + ':' + min + ':' + sec;
    return time;
  }
  listToOracle() {
    var z = setTimeout(AppSelf.listToOracle, 2000);
    AppSelf.setState({ listToOracleTimeout: z });
    const b = AppSelf.state.fromBlock;
    //console.log('000', AppSelf.state.oracleContract)
    AppSelf.state.oracleContract.events.ToOracle({
      fromBlock: b, toBlock: 'latest'
    })
      .on('data', function (event) {
        console.log('098', event)
        if (event.blockNumber <= MarkerCount) return;
        MarkerCount = event.blockNumber;
        console.log('123', event.returnValues[0], event.returnValues[1])
        var result = AppSelf.processOracleData(event.returnValues[0], event.returnValues[1]);
        AppSelf.sendDataToBlockchain(event.returnValues[0], result);
      }
      )
      .on('error', console.error);
  };
  
  popUp() {
    return (
      <Popupl open={this.state.open} closeOnDocumentClick onClose={() => {
        this.setState({ open: false })
      }}>
        <div className="form">
        <form>
          <label style={{marginLeft:"42px"}}>Event:</label>
          <input type="text" placeholder="Write down the title...." onChange={(event)=>{this.setState({eventTitle: event.target.value})}}/>
          <br />
          <label>Description:</label>
        <input type="text" placeholder="Write down the description...."  onChange={(event)=>{this.setState({eventDesc: event.target.value})}}/>
          <br />
          <label>Happaning?</label>
        <input type="checkBox" value={this.state.eventStatus} onChange={()=>{this.setState({eventStatus: !this.state.eventStatus})}}/>
          <br />
          <button onClick={async () => {
    console.log('marked Event',this.state.eventTitle,this.state.eventDesc,this.state.eventStatus)
    await this.state.contract.methods.insertData(this.state.eventTitle,this.state.eventDesc,this.state.eventStatus,this.state.coordinate.toString()+","+new Date().getTime().toString()).send({ from: this.state.accounts[0] })
    this.setState({ open: false })
  }}>Confirm?</button>
          </form>
          </div>
      </Popupl>
    );
  }
  changeMap(location){
    let address = location.split(',')
    this.setState({
      historyLocation: address
    })
  }
  showHistory() {
    console.log('help',this.state.markersHistory)
    return this.state.markersHistory.map(historyList =>
      <li onClick={()=>{this.changeMap(historyList.returnValues.message._address)}} key={historyList.key} style={{backgroundColor: historyList.returnValues.message.status? '#F97777': null}}>
      <button onClick={()=>{this.setState({smallMapCoor:[parseFloat(historyList.returnValues.message._address.split(",")[0]),parseFloat(historyList.returnValues.message._address.split(",")[1])]})}}> Block No: {historyList.blockNumber} 
      <br /> Event: {historyList.returnValues.message.title} 
      <br /> Description: {historyList.returnValues.message.description}
      <br /> Happaning: {historyList.returnValues.message.status? "Yes": "No"}
      <br /> Location: {historyList.returnValues.message._address} 
      <br />{historyList.address}</button></li>)
  }

  printM=()=>{
    if(this.state.smallMapCoor!==null){
      return (
        <Marker position={this.state.smallMapCoor}>
      </Marker>
      )
    }
  }
  render() {
   
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    console.log('lll',this.state.historyLocation)
    return (
      <div className="App" >
        <div className="menu" style={{ visibility: this.state.openMenu ? "visible" : "hidden" }}>
          <div className="picture">
          <Map center={this.state.smallMapCoor||[22.3193, 114.1694]} zoom={15} maxZoom={19} style={{ width: "100%", height:"30%"}}>
            <TileLayer
              url="	https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {this.printM()}
          </Map>
          </div>
          <div style={{margin: 10,}}>History</div>
          <div className="history">
            <ol id="historyList">
              {this.showHistory()}
            </ol>
          </div>
        </div>

        <div className="map" style={{ width: this.state.openMenu ? '70%' : '100%' }}>
          {this.popUp()}
          <Map center={[22.3193, 114.1694]} zoom={15} maxZoom={19} onclick={this.mapOnClick} style={{ width: this.state.openMenu ? '70%' : '100%' }}>
            <TileLayer
              url="	https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            {
              this.state.markers.map(x => {
                return (

                  <Marker position={x.slice(0,2)} opacity={(86400000-new Date().getTime()+x[2])/86400000}>
                    <Popup> Address: [{x[0]}, {x[1]}]</Popup>
                  </Marker>
                )
              })
            }

          </Map>
          <input type="button" id="Btn1" value="Menu" onClick={() => { this.setState({ openMenu: !this.state.openMenu }) }} className="btnStyle" />
        </div>
      </div>
    );
  }
}

export default App;
