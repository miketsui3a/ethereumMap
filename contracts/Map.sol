pragma experimental ABIEncoderV2;
import "./myOracle.sol";
contract Map{
    string[] public data;
    address oracle_address;
    event Notification(address return_address, string message);
    event addMarker(string);
    function insertData(string memory _data) public {
        data.push(_data);
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
        emit Notification(address(this), message);
    }
}