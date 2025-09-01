// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "../contracts/BaseContractAnalysis.sol";
import "../contracts/BaseMonitoring.sol";
import "../contracts/BaseSocialAnalysis.sol";
import "../contracts/BaseTokenomics.sol";

contract BaseGuardianTest is Test {
    BaseContractAnalysis public contractAnalysis;
    BaseMonitoring public monitoring;
    BaseSocialAnalysis public socialAnalysis;
    BaseTokenomics public tokenomics;
    
    address public owner = address(1);
    address public user = address(2);
    
    function setUp() public {
        vm.startPrank(owner);
        
        contractAnalysis = new BaseContractAnalysis();
        monitoring = new BaseMonitoring();
        socialAnalysis = new BaseSocialAnalysis();
        tokenomics = new BaseTokenomics();
        
        vm.stopPrank();
    }
    
    function testContractAnalysis() public {
        vm.startPrank(user);
        
        // Test payment requirement
        vm.expectRevert("Payment of 0.01 ETH required for each analysis");
        contractAnalysis.requestContractAnalysis("0x1234567890123456789012345678901234567890");
        
        // Test successful request
        contractAnalysis.requestContractAnalysis{value: 0.01 ether}("0x1234567890123456789012345678901234567890");
        
        // Check user requests
        BaseContractAnalysis.AnalysisRequest[] memory requests = contractAnalysis.getUserRequests(user);
        assertEq(requests.length, 1);
        assertEq(requests[0].user, user);
        assertEq(requests[0].contractAddress, "0x1234567890123456789012345678901234567890");
        assertEq(requests[0].payment, 0.01 ether);
        assertEq(requests[0].completed, false);
        
        vm.stopPrank();
        
        // Test owner completing analysis
        vm.startPrank(owner);
        contractAnalysis.completeAnalysis(user, 0, 75, "High risk contract with potential vulnerabilities");
        
        requests = contractAnalysis.getUserRequests(user);
        assertEq(requests[0].completed, true);
        assertEq(requests[0].riskScore, 75);
        assertEq(requests[0].analysis, "High risk contract with potential vulnerabilities");
        
        vm.stopPrank();
    }
    
    function testMonitoring() public {
        vm.startPrank(user);
        
        // Test successful monitoring request
        monitoring.requestMonitoring{value: 0.01 ether}("0x1234567890123456789012345678901234567890");
        
        // Check user requests
        BaseMonitoring.MonitoringRequest[] memory requests = monitoring.getUserRequests(user);
        assertEq(requests.length, 1);
        assertEq(requests[0].isActive, true);
        
        vm.stopPrank();
        
        // Test owner completing analysis
        vm.startPrank(owner);
        monitoring.completeAnalysis(user, 0, 60, "Moderate risk monitoring report");
        
        requests = monitoring.getUserRequests(user);
        assertEq(requests[0].completed, true);
        assertEq(requests[0].riskScore, 60);
        
        // Test alert triggering
        monitoring.triggerAlert(user, 0, "High Risk", "Suspicious activity detected");
        
        vm.stopPrank();
        
        // Test user stopping monitoring
        vm.startPrank(user);
        monitoring.stopMonitoring(0);
        
        requests = monitoring.getUserRequests(user);
        assertEq(requests[0].isActive, false);
        
        vm.stopPrank();
    }
    
    function testSocialAnalysis() public {
        vm.startPrank(user);
        
        // Test successful social analysis request
        socialAnalysis.requestSocialAnalysis{value: 0.01 ether}("TestProject");
        
        // Check user requests
        BaseSocialAnalysis.SocialRequest[] memory requests = socialAnalysis.getUserRequests(user);
        assertEq(requests.length, 1);
        assertEq(requests[0].projectName, "TestProject");
        
        vm.stopPrank();
        
        // Test owner completing analysis
        vm.startPrank(owner);
        socialAnalysis.completeAnalysis(user, 0, 45, "Good community engagement, moderate risk");
        
        requests = socialAnalysis.getUserRequests(user);
        assertEq(requests[0].completed, true);
        assertEq(requests[0].riskScore, 45);
        
        vm.stopPrank();
    }
    
    function testTokenomics() public {
        vm.startPrank(user);
        
        // Test successful tokenomics request
        tokenomics.requestTokenomicsAnalysis{value: 0.01 ether}("0x1234567890123456789012345678901234567890");
        
        // Check user requests
        BaseTokenomics.TokenomicsRequest[] memory requests = tokenomics.getUserRequests(user);
        assertEq(requests.length, 1);
        assertEq(requests[0].tokenAddress, "0x1234567890123456789012345678901234567890");
        
        vm.stopPrank();
        
        // Test owner completing analysis
        vm.startPrank(owner);
        tokenomics.completeAnalysis(user, 0, 30, "Fair token distribution, low risk");
        
        requests = tokenomics.getUserRequests(user);
        assertEq(requests[0].completed, true);
        assertEq(requests[0].riskScore, 30);
        
        vm.stopPrank();
    }
    
    function testPaymentWithdrawal() public {
        vm.startPrank(user);
        
        // Make payments to contracts
        contractAnalysis.requestContractAnalysis{value: 0.01 ether}("0x1234567890123456789012345678901234567890");
        monitoring.requestMonitoring{value: 0.01 ether}("0x1234567890123456789012345678901234567890");
        socialAnalysis.requestSocialAnalysis{value: 0.01 ether}("TestProject");
        tokenomics.requestTokenomicsAnalysis{value: 0.01 ether}("0x1234567890123456789012345678901234567890");
        
        vm.stopPrank();
        
        // Test owner withdrawal
        vm.startPrank(owner);
        
        uint256 initialBalance = owner.balance;
        
        contractAnalysis.withdrawPayments();
        monitoring.withdrawPayments();
        socialAnalysis.withdrawPayments();
        tokenomics.withdrawPayments();
        
        uint256 finalBalance = owner.balance;
        assertEq(finalBalance, initialBalance + 0.04 ether);
        
        vm.stopPrank();
    }
    
    function testOwnershipTransfer() public {
        address newOwner = address(3);
        
        vm.startPrank(owner);
        
        contractAnalysis.transferOwnership(newOwner);
        monitoring.transferOwnership(newOwner);
        socialAnalysis.transferOwnership(newOwner);
        tokenomics.transferOwnership(newOwner);
        
        vm.stopPrank();
        
        // Test that new owner can withdraw
        vm.startPrank(user);
        contractAnalysis.requestContractAnalysis{value: 0.01 ether}("0x1234567890123456789012345678901234567890");
        vm.stopPrank();
        
        vm.startPrank(newOwner);
        contractAnalysis.withdrawPayments();
        vm.stopPrank();
    }
    
    function testUnauthorizedAccess() public {
        vm.startPrank(user);
        
        // Test unauthorized completion
        vm.expectRevert();
        contractAnalysis.completeAnalysis(user, 0, 50, "Test");
        
        // Test unauthorized withdrawal
        vm.expectRevert();
        contractAnalysis.withdrawPayments();
        
        // Test unauthorized ownership transfer
        vm.expectRevert();
        contractAnalysis.transferOwnership(address(3));
        
        vm.stopPrank();
    }
}
