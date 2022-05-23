// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

interface IERC20 {
    function decimals() external pure returns(uint);

    function balanceOf(address account) external view returns(uint);

    function transfer(address to, uint amount) external;

    function allowance(address owner, address spender) external view returns(uint);

    function approve(address spender, uint amount) external;

    function transferFrom(address sender, address recepient, uint amount) external;

    event Transfer(address indexed from, address indexed to, uint amount);

    event Approval(address indexed owner, address indexed to, uint amount);

}

contract ERC20 is IERC20 {
    uint public totalSupply;
    mapping(address => uint) balances;
    mapping(address => mapping(address => uint)) allowances;
    string public name = "HayatToken";
    string public symbol = "AHT";
    address public owner;

    constructor(
        string memory name,
        string memory symbol,
        uint totalSupply,
        uint8 decimals
    ) {
        owner = msg.sender;
        name = name;
        symbol = symbol;
        totalSupply = totalSupply;
        decimals = decimals;
    }

    function decimals() external pure override returns(uint) {
        return 0;
    }

    function balanceOf(address account) public view override returns(uint) {
        return balances[account];
    }

    function transfer(address to, uint amount) external override {
        require(to != address(0), "Cannot transfer to the null address");
        require(amount <= balances[msg.sender], "Cannot transfer out of balance");
    unchecked {
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }
    }

    function allowance(address owner, address spender) external view override returns(uint) {
        return allowances[owner][spender];
    }

    function approve(address spender, uint amount) external override {
        require(spender != address(0), "Cannot approve to the null address");
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
    }

    function transferFrom(address sender, address recepient, uint amount) external override {
        require(sender.balance != 0, "not enough money");
        allowances[sender][recepient] -= amount;
        balances[sender] -= amount;
        balances[recepient] += amount;
        emit Transfer(sender, recepient, amount);
    }

    function mint(address account, uint amount) public OnlyOwner {
        require(account != address(0), "Cant mint to zero address");
        balances[msg.sender] += amount;
        totalSupply += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function burn(address account, uint amount) external OnlyOwner {
        require(account != address(0), "Cant mint to zero address");
        require(amount <= balances[account], "Amount out of balance");
        balances[msg.sender] -= amount;
        totalSupply -= amount;
        emit Transfer(msg.sender, address(0), amount);
    }

    modifier OnlyOwner {
        require(owner == msg.sender, "You not an owner");
        _;
    }

    modifier EnoughTokens(address from, uint amount) {
        require(balanceOf(from) >= amount, "Not enough tokens!");
        _;
    }
}