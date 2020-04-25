pragma experimental ABIEncoderV2;
import "./myOracle.sol";
contract Map{
    struct markerData{
        string title;
        string description;
        bool status;
        string _address;
    }
    mapping(string => markerData) public marker; 
    string[] public data;
    address oracle_address;
    event Notification(address return_address, markerData message);
    //event addMarker(string);
    function insertData(string memory title, string memory desc,bool status,string memory _data) public {
        data.push(_data);
        marker[_data].title = title;
        marker[_data].description = desc;
        marker[_data].status = status;
        marker[_data]._address = _data;
        myOracle(oracle_address).getOracleData(address(this), _data);
    }
    function getData() public view returns(string[] memory){

        return data;
    }

    function setOracle(address _address) public {
        oracle_address = _address; 
    }
 
    function getOracle() public view returns (address oracle_addr){
        return oracle_address;
    }
 
    function oracleCallback(string memory message) public {
        emit Notification(address(this), marker[message]);
    }
}