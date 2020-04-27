pragma solidity >=0.4.21 <0.7.0;


contract myOracle {
    //O1
    event ToOracle(address me, string data, string time); //event K

    function getOracleData(address client_address, string calldata data_input, string calldata time)
        external
    {
        emit ToOracle(client_address, data_input, time); // O1 emit K
    }
}
