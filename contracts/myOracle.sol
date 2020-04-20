pragma solidity >=0.4.21 <0.7.0;


contract myOracle {
    //O1
    event ToOracle(address me, string data); //event K

    function getOracleData(address client_address, string calldata data_input)
        external
    {
        emit ToOracle(client_address, data_input); // O1 emit K
    }
}
