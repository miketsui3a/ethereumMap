pragma experimental ABIEncoderV2;

contract Map{
    string[] public data;

    function insertData(string memory _data) public {
        data.push(_data);
    }
    function getData() public view returns(string[] memory){
        return data;
    }
}