// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import './Token.sol';

contract StakingAlg {
    IERC20 public rewardsToken;
    IERC20 public stakingToken;

    uint public rewardRate = 20;
    uint public lastUpdateTime;
    uint public rewardPerTokenStored;

    // сколько мы заплатили пользователю за каждый токен
    mapping(address => uint) public userRewardPerTokenPaid;

    // сколько награды пользователь должен получить
    mapping(address => uint) public rewards;

    mapping(address => uint) private _balances;
    uint private _totalSupply;

    constructor(address _stakingToken, address _rewardsToken) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
    }

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        rewards[_account] = earned(_account);
        userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        _;

    }

    function rewardPerToken() public view returns(uint) {
        if(_totalSupply == 0) {
            return 0;
        }
        rewardPerTokenStored + (
            rewardRate * (block.timestamp - lastUpdateTime)
            ) * 1e18 / _totalSupply;
    }

    function earned(address _account) public view returns(uint) {
        return (
            // Мы считаем сколько уже надо было выплатить данному аккаунту и плюсую с тем
            // сколько данный аккаунт уже заработал дополнительно
            _balances[_account] * (
                rewardPerToken() - userRewardPerTokenPaid[_account]
            ) / 1e18
        ) + rewards[_account];
    }

    // Положить сколько-то токен на счет смарт контракта
    function stake(uint _amount) external updateReward(msg.sender) {
        _totalSupply += _amount;
        _balances[msg.sender] += _amount;
        
        // Забираем у инициатора транзакции столько токенов,
        // сколько он нам сказал и отправляем их на текущий адресс
        stakingToken.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint _amount) external updateReward(msg.sender) {
        require(_balances[msg.sender] >= _amount, 'You dont have enough balance');
        _totalSupply -= _amount;
        _balances[msg.sender] -= _amount;
        stakingToken.transfer(msg.sender, _amount);
    }

    function getReward() external updateReward(msg.sender) {
        uint reward = rewards[msg.sender];
        rewards[msg.sender] = 0;
        rewardsToken.transfer(msg.sender, reward);
    }
}