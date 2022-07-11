//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

    function totalSupply() external view returns (uint256);

    function balanceOf(address _owner) external view returns (uint256);

    function allowance(address _owner, address _value)
        external
        view
        returns (uint256);

    function transfer(address _to, uint256 _value) external returns (bool);

    function approve(address _spender, uint256 _value) external returns (bool);

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) external returns (bool);

    function mint(address _account, uint _amount) external;

    function burn(address _account, uint _amount) external;
}
