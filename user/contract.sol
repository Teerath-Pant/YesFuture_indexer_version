// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

library SafeERC20 {
    function safeTransfer(IERC20 token, address to, uint256 amount) internal {
        _callOptionalReturn(address(token), abi.encodeCall(token.transfer, (to, amount)));
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 amount) internal {
        _callOptionalReturn(address(token), abi.encodeCall(token.transferFrom, (from, to, amount)));
    }

   function _callOptionalReturn(address token, bytes memory data) private {
    require(token.code.length > 0, "NOT_A_CONTRACT");
    (bool success, bytes memory returndata) = token.call(data);
    require(success, "TOKEN_CALL_FAILED");
    if (returndata.length > 0) {
        require(abi.decode(returndata, (bool)), "TOKEN_RETURNED_FALSE");
    }
}
}

contract ReentrancyGuard {
    bool private locked;
    modifier nonReentrant() {
        require(!locked, "REENTRANCY");
        locked = true;
        _;
        locked = false;
    }
}

contract meta20 is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public usdt;

    address public owner;
    address public adminWallet; 

    modifier onlyOwner() {
        require(msg.sender == owner && owner != address(0), "NOT_OWNER");
        _;
    }

    modifier onlyRegistered() {
        require(memberId[msg.sender] != 0, "NOT_REGISTERED");
        _;
    }

    function renounceOwnership() external onlyOwner {
        owner = address(0);
        emit OwnershipRenounced(msg.sender);
    }

    function rescueTokens(address tokenAddress, uint256 amount) external onlyOwner nonReentrant {
        require(tokenAddress != address(usdt), "CANNOT_RESCUE_USDT");
        IERC20(tokenAddress).safeTransfer(adminWallet, amount);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "INVALID_NEW_OWNER");
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function setAdminWallet(address newAdminWallet) external onlyOwner {
        require(newAdminWallet != address(0), "INVALID_ADMIN");
        adminWallet = newAdminWallet;
    }

    // ---------------------------------------------------------------
    // MEMBER DETAILS (UNILEVEL)
    // ---------------------------------------------------------------
    uint256 public memberCounter;
    mapping(address => uint256) public memberId;
    mapping(uint256 => address) public memberAddress;
    mapping(address => string)  public memberStringId;
    mapping(string  => address) public memberByStringId;
    
    mapping(address => address) public sponsor;
    mapping(address => bool)    public topupFlag;
    mapping(address => uint256) public activationDate;

    mapping(address => uint8) public matrixPackageId;
    mapping(address => uint8) public maxMatrixPackage;
    
    mapping(address => uint8) public sponsorPackageId;
    mapping(address => uint8) public maxSponsorPackage;
    
    mapping(address => uint8) public levelPackageId;
    mapping(address => uint8) public maxLevelPackage;

    mapping(address => uint256) public referralCount;
    mapping(address => uint256) public recycleCount; 
      
    // ---------------------------------------------------------------
    // MATRIX VARIABLES
    // ---------------------------------------------------------------
    mapping(uint8 => mapping(address => address))   public matrixParentByPkg;
    mapping(uint8 => mapping(address => address))   public realOwnerByPkg;

    // matrixChildrenByPkg scoped by TREE OWNER as well as node.
    // Confirmed rule: per-sponsor local tree, BFS left-right/top-down,
    // max 2 children per node, unbounded depth. Bug was: single node
    // playing two roles (root of own tree + filler slot in upline's
    // tree) wrote into ONE shared array with two unaware head counters
    // -> 3+ children. Keying by [packageId][treeOwner][node] gives each
    // tree isolated storage, roles can't collide anymore.
    mapping(uint8 => mapping(address => mapping(address => address[]))) public matrixChildrenByPkg;
    
    uint256 public phantomCounter;

    mapping(uint8 => mapping(address => uint256)) public level5MemberCountByPkg;
    mapping(uint8 => mapping(address => uint256)) public matrixHoldByPkg;

    // Per-sponsor (per treeOwner) queue+head — matches confirmed rule.
    mapping(uint8 => mapping(address => address[])) public matrixOpenQueue;
    mapping(uint8 => mapping(address => uint256))    public matrixQueueHead;

    // ---------------------------------------------------------------
    // SPONSOR 5-CYCLE VARIABLES
    // ---------------------------------------------------------------
    mapping(uint8 => mapping(address => uint256)) public sponsorCycleCountByPkg;
    mapping(uint8 => mapping(address => uint256)) public sponsorHoldByPkg;

    // ---------------------------------------------------------------
    // STATS, PACKAGES & HISTORY
    // ---------------------------------------------------------------
    mapping(uint8 => uint256) public totalLevelIncomeByLevel;
    mapping(address => mapping(uint8 => uint256)) public userLevelIncome;
    mapping(address => uint256) public userTotalLevelProfit;
    
    uint256 public totalInvestment;
    mapping(address => uint256) public userTotalInvestment;

    mapping(address => uint256) public userTotalMatrixIncome;
    mapping(address => uint256) public userTotalDirectIncome;

    mapping(address => string) public displayName;
    event NameUpdated(address indexed user, string newName);

    struct PackageConfig { uint256 price; }
    mapping(uint8 => PackageConfig) public packages;
    
    uint8 public constant MAX_PACKAGE = 9;

    uint256 public constant PERCENT_DENOMINATOR = 1_000_000;
    uint256 public constant MATRIX_POOL_PERCENT = 500000;   // 50.0%
    uint256 public constant LEVEL_POOL_PERCENT = 333000;    // 33.3%
    uint256 public constant DIRECT_INCOME_PERCENT = 167000; // 16.7%

    uint256[11] public levelPercent;
    uint256[6] public matrixPercent; 

    mapping(uint8 => mapping(address => address[])) public cycleRootByPkg;

    // ---------------------------------------------------------------
    // EVENTS
    // ---------------------------------------------------------------
    event OwnerSet(address indexed owner);
    event OwnershipRenounced(address indexed previousOwner);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event UserRegistered(address indexed user, address indexed _sponsor, uint256 numericId, string stringId);
    
    event MatrixIncome(address indexed receiver, address indexed from, uint8 packageId, uint8 level, uint256 amount);
    event DirectIncome(address indexed receiver, address indexed from, uint8 packageId, uint256 cycle, uint256 amount);
    event LevelIncome(address indexed receiver, address indexed from, uint8 packageId, uint8 level, uint256 amount);
    
    event MatrixIncomeHeld(address indexed user, uint8 indexed packageId, uint256 amount, uint256 memberCount);
    event SponsorIncomeHeld(address indexed sponsor, uint8 indexed packageId, uint256 amount, uint256 count);
    
    event MatrixAutoUpgrade(address indexed user, uint8 fromPackageId, uint8 newPackageId, uint256 priceUsed);
    event SponsorAutoUpgrade(address indexed sponsor, uint8 fromPackageId, uint8 newPackageId, uint256 priceUsed);
    event ManualUpgrade(address indexed user, uint8 packageId, string track);
    
    event MatrixPlaced(address indexed user, address indexed matrixParent, address indexed sponsor, uint8 packageId);
    event Level5ReEntry(address indexed user, uint8 indexed packageId, uint256 cycleNumber, address phantomNode);
    event SponsorReEntry(address indexed sponsor, uint8 indexed packageId);

    event SponsorHoldRefunded(address indexed user, uint8 packageId, uint256 amount);
    event MatrixHoldRefunded(address indexed user, uint8 packageId, uint256 amount);

    event SponsorIncomeRedirected(address indexed wouldBeReceiver, address indexed from, uint8 packageId, uint256 amount);
    event LevelIncomeRedirected(address indexed wouldBeReceiver, address indexed from, uint8 level, uint8 packageId, uint256 amount);

    event IncomeCapped(address indexed user, uint256 requestedAmount, uint256 paidAmount, uint256 redirectedToAdmin);

    // ---------------------------------------------------------------
    // CONSTRUCTOR
    // ---------------------------------------------------------------
    constructor(address _usdtAddress, address _adminWallet) {
        require(_usdtAddress != address(0), "INVALID_USDT");
        require(_adminWallet != address(0), "INVALID_ADMIN");

        usdt        = IERC20(_usdtAddress);
        owner       = msg.sender;
        adminWallet = _adminWallet;

        memberCounter = 1;
        string memory rootId = "YF00001";
        memberId[_adminWallet]       = memberCounter;
        memberAddress[memberCounter] = _adminWallet;
        memberStringId[_adminWallet] = rootId;
        memberByStringId[rootId]     = _adminWallet;
        
        topupFlag[_adminWallet]       = true;
        maxMatrixPackage[_adminWallet] = MAX_PACKAGE;
        maxSponsorPackage[_adminWallet] = MAX_PACKAGE;
        maxLevelPackage[_adminWallet] = MAX_PACKAGE;

        packages[1] = PackageConfig({ price: 75 * 10**18 });
        packages[2] = PackageConfig({ price: 150 * 10**18 });
        packages[3] = PackageConfig({ price: 300 * 10**18 });
        packages[4] = PackageConfig({ price: 600 * 10**18 });
        packages[5] = PackageConfig({ price: 1200 * 10**18 });
        packages[6] = PackageConfig({ price: 2400 * 10**18 });
        packages[7] = PackageConfig({ price: 4800 * 10**18 });
        packages[8] = PackageConfig({ price: 9600 * 10**18 });
        packages[9] = PackageConfig({ price: 19200 * 10**18 });

        levelPercent[1] = 200000; levelPercent[2] = 150000; levelPercent[3] = 100000;
        levelPercent[4] = 50000;  levelPercent[5] = 50000;  levelPercent[6] = 50000; 
        levelPercent[7] = 50000;  levelPercent[8] = 50000;  levelPercent[9] = 50000; 
        levelPercent[10] = 50000;

        matrixPercent[1] = 100000; matrixPercent[2] = 150000; matrixPercent[3] = 200000; 
        matrixPercent[4] = 250000; matrixPercent[5] = 250000; 

        emit OwnerSet(msg.sender);
    }

    // ---------------------------------------------------------------
    // PRICE HELPERS
    // ---------------------------------------------------------------
    function getMatrixPrice(uint8 packageId) public view returns (uint256) {
        return (packages[packageId].price * MATRIX_POOL_PERCENT) / PERCENT_DENOMINATOR;
    }
    function getSponsorPrice(uint8 packageId) public view returns (uint256) {
        return (packages[packageId].price * DIRECT_INCOME_PERCENT) / PERCENT_DENOMINATOR;
    }
    function getLevelPrice(uint8 packageId) public view returns (uint256) {
        return (packages[packageId].price * LEVEL_POOL_PERCENT) / PERCENT_DENOMINATOR;
    }

    // ---------------------------------------------------------------
    // EARNINGS CAP (2x total invested, combined across all 3 tracks)
    // ---------------------------------------------------------------
    function getTotalEarned(address user) public view returns (uint256) {
        return userTotalMatrixIncome[user] + userTotalDirectIncome[user] + userTotalLevelProfit[user];
    }

    function getEarningsCap(address user) public view returns (uint256) {
        return userTotalInvestment[user] * 2;
    }

    function _splitByCap(address user, uint256 desiredAmount) internal view returns (uint256 payableAmount, uint256 excessAmount) {
        uint256 cap = getEarningsCap(user);
        uint256 earned = getTotalEarned(user);
        if (earned >= cap) {
            return (0, desiredAmount);
        }
        uint256 headroom = cap - earned;
        if (desiredAmount <= headroom) {
            return (desiredAmount, 0);
        }
        return (headroom, desiredAmount - headroom);
    }

    function _payCapped(address user, uint256 desiredAmount) internal returns (uint256 paid) {
        if (user == adminWallet) {
            if (desiredAmount > 0) usdt.safeTransfer(adminWallet, desiredAmount);
            return desiredAmount;
        }
        (uint256 payableAmount, uint256 excessAmount) = _splitByCap(user, desiredAmount);
        if (payableAmount > 0) {
            usdt.safeTransfer(user, payableAmount);
        }
        if (excessAmount > 0) {
            usdt.safeTransfer(adminWallet, excessAmount);
            emit IncomeCapped(user, desiredAmount, payableAmount, excessAmount);
        }
        return payableAmount;
    }

    // ---------------------------------------------------------------
    // REGISTRATION (Auto-buys Package 1 for all 3 tracks)
    // ---------------------------------------------------------------
    function registerMember(string calldata sponsorStringId) external nonReentrant {
        require(memberId[msg.sender] == 0, "ALREADY_REGISTERED");

        address sponsorAddr = memberByStringId[sponsorStringId];
        require(sponsorAddr != address(0), "SPONSOR_NOT_FOUND");

        uint256 fullPrice = packages[1].price;
        usdt.safeTransferFrom(msg.sender, address(this), fullPrice);

        memberCounter++;
        string memory newStringId = _generateMemberId(memberCounter);

        memberId[msg.sender]         = memberCounter;
        memberAddress[memberCounter]  = msg.sender;
        memberStringId[msg.sender]    = newStringId;
        memberByStringId[newStringId] = msg.sender;
        sponsor[msg.sender]           = sponsorAddr;
        referralCount[sponsorAddr]++;

        topupFlag[msg.sender] = true;
        activationDate[msg.sender] = block.timestamp;
        
        matrixPackageId[msg.sender] = 1;
        maxMatrixPackage[msg.sender] = 1;
        sponsorPackageId[msg.sender] = 1;
        maxSponsorPackage[msg.sender] = 1;
        levelPackageId[msg.sender] = 1;
        maxLevelPackage[msg.sender] = 1;

        totalInvestment += fullPrice;
        userTotalInvestment[msg.sender] += fullPrice;

        emit ManualUpgrade(msg.sender, 1, "MATRIX");
        emit ManualUpgrade(msg.sender, 1, "SPONSOR");
        emit ManualUpgrade(msg.sender, 1, "LEVEL");

        emit UserRegistered(msg.sender, sponsorAddr, memberCounter, newStringId);

        _placeInPackageTreeIfNeeded(msg.sender, 1);
        _releaseMatrixIncome(msg.sender, 1);
        _releaseLevelIncome(msg.sender, 1, fullPrice);
        _releaseDirectIncome(msg.sender, 1, fullPrice);
    }

    // ---------------------------------------------------------------
    // DISPLAY NAME
    // ---------------------------------------------------------------
    function setDisplayName(string calldata newName) external onlyRegistered {
        require(bytes(newName).length > 0 && bytes(newName).length <= 32, "INVALID_NAME_LENGTH");
        displayName[msg.sender] = newName;
        emit NameUpdated(msg.sender, newName);
    }

    // ---------------------------------------------------------------
    // MANUAL PURCHASES
    // ---------------------------------------------------------------
    function purchaseMatrixPackage(uint8 packageId) external onlyRegistered nonReentrant {
        require(packageId >= 1 && packageId <= MAX_PACKAGE, "INVALID_PACKAGE_ID");
        require(matrixPackageId[msg.sender] == packageId - 1, "MUST_BUY_SEQUENTIAL");

        uint8 oldPkg = matrixPackageId[msg.sender];
        if (oldPkg >= 1) {
            uint256 held = matrixHoldByPkg[oldPkg][msg.sender];
            if (held > 0) {
                matrixHoldByPkg[oldPkg][msg.sender] = 0;
                uint256 paidHeld = _payCapped(msg.sender, held);
                userTotalMatrixIncome[msg.sender] += paidHeld;
                emit MatrixHoldRefunded(msg.sender, oldPkg, paidHeld);
            }
        }

        uint256 price = getMatrixPrice(packageId);
        usdt.safeTransferFrom(msg.sender, address(this), price);

        userTotalInvestment[msg.sender] += price;

        matrixPackageId[msg.sender] = packageId;
        if (packageId > maxMatrixPackage[msg.sender]) maxMatrixPackage[msg.sender] = packageId;

        _placeInPackageTreeIfNeeded(msg.sender, packageId);
        _releaseMatrixIncome(msg.sender, packageId);
        emit ManualUpgrade(msg.sender, packageId, "MATRIX");
    }

    function purchaseSponsorPackage(uint8 packageId) external onlyRegistered nonReentrant {
        require(packageId >= 1 && packageId <= MAX_PACKAGE, "INVALID_PACKAGE_ID");
        require(sponsorPackageId[msg.sender] == packageId - 1, "MUST_BUY_SEQUENTIAL");

        uint8 oldPkg = sponsorPackageId[msg.sender];
        if (oldPkg >= 1) {
            uint256 held = sponsorHoldByPkg[oldPkg][msg.sender];
            if (held > 0) {
                sponsorHoldByPkg[oldPkg][msg.sender] = 0;
                uint256 paidHeld = _payCapped(msg.sender, held);
                userTotalDirectIncome[msg.sender] += paidHeld;
                emit SponsorHoldRefunded(msg.sender, oldPkg, paidHeld);
            }
        }

        uint256 price = getSponsorPrice(packageId);
        usdt.safeTransferFrom(msg.sender, address(this), price);

        userTotalInvestment[msg.sender] += price;
        
        sponsorPackageId[msg.sender] = packageId;
        if (packageId > maxSponsorPackage[msg.sender]) maxSponsorPackage[msg.sender] = packageId;

        _releaseDirectIncome(msg.sender, packageId, packages[packageId].price);
        emit ManualUpgrade(msg.sender, packageId, "SPONSOR");
    }

    function purchaseLevelPackage(uint8 packageId) external onlyRegistered nonReentrant {
        require(packageId >= 1 && packageId <= MAX_PACKAGE, "INVALID_PACKAGE_ID");
        require(levelPackageId[msg.sender] == packageId - 1, "MUST_BUY_SEQUENTIAL");
        uint256 price = getLevelPrice(packageId);
        usdt.safeTransferFrom(msg.sender, address(this), price);

        userTotalInvestment[msg.sender] += price;
        
        levelPackageId[msg.sender] = packageId;
        if (packageId > maxLevelPackage[msg.sender]) maxLevelPackage[msg.sender] = packageId;

        _releaseLevelIncome(msg.sender, packageId, packages[packageId].price);
        emit ManualUpgrade(msg.sender, packageId, "LEVEL");
    }

    // ---------------------------------------------------------------
    // MATRIX PLACEMENT
    // _treeOwner = per-sponsor local tree root, confirmed rule.
    // matrixChildrenByPkg keyed [packageId][_treeOwner][slot] — this is
    // THE bug fix. Node acting as root of own tree AND filler slot in
    // upline's tree now write to two separate arrays, no collision,
    // no more 3+ children in one slot.
    // ---------------------------------------------------------------
    function _placeInMatrixForPackage(uint8 packageId, address _user, address _treeOwner) internal {
        address[] storage queue = matrixOpenQueue[packageId][_treeOwner];
        if (queue.length == 0) {
            queue.push(_treeOwner);
        }

        uint256 head = matrixQueueHead[packageId][_treeOwner];
        address slot = queue[head];

        matrixParentByPkg[packageId][_user] = slot;
        matrixChildrenByPkg[packageId][_treeOwner][slot].push(_user);
        emit MatrixPlaced(_user, slot, _treeOwner, packageId);

        if (matrixChildrenByPkg[packageId][_treeOwner][slot].length >= 2) {
            matrixQueueHead[packageId][_treeOwner] = head + 1;
        }

        queue.push(_user);
    }

    // FIX: anchor now walks to nearest eligible upline (maxMatrixPackage
    // >= packageId), not just raw direct sponsor. Old code anchored to
    // sponsor[user] unconditionally — broke when direct sponsor hadn't
    // bought this package tier yet (e.g. child buys pkg3 before parent
    // does), placing child under an ineligible sponsor's tree instead of
    // walking up to the next qualified upline (admin as ultimate fallback).
    function _placeInPackageTreeIfNeeded(address user, uint8 packageId) internal {
        if (matrixParentByPkg[packageId][user] != address(0)) return;
        address anchor = _findEligibleMatrixUpline(user, packageId);
        _placeInMatrixForPackage(packageId, user, anchor);
        cycleRootByPkg[packageId][user].push(user);
    }

    // ---------------------------------------------------------------
    // 1. MATRIX INCOME (32-Member Cycle)
    // ---------------------------------------------------------------
    function _releaseMatrixIncome(address buyer, uint8 packageId) internal {
        uint256 matrixPoolAmount = getMatrixPrice(packageId); 
        address currentParent = matrixParentByPkg[packageId][buyer]; 
        uint8 level = 1;
        uint256 adminLeftover = 0;

        while (level <= 5) {
            uint256 share = matrixPoolAmount * matrixPercent[level] / PERCENT_DENOMINATOR;

            if (currentParent == address(0)) {
                adminLeftover += share;
                level++;
                continue;
            }

            bool parentQualifies = topupFlag[currentParent] && maxMatrixPackage[currentParent] >= packageId;

            if (!parentQualifies) {
                adminLeftover += share;
                currentParent = matrixParentByPkg[packageId][currentParent];
                level++;
                continue;
            }

            if (level == 5) {
                _handleLevel5Share(packageId, currentParent, buyer, share);
            } else {
                address payoutWallet = realOwnerByPkg[packageId][currentParent] != address(0)
                    ? realOwnerByPkg[packageId][currentParent]
                    : currentParent;
                uint256 paidShare = _payCapped(payoutWallet, share);
                userTotalMatrixIncome[payoutWallet] += paidShare;
                emit MatrixIncome(payoutWallet, buyer, packageId, level, paidShare);
            }

            currentParent = matrixParentByPkg[packageId][currentParent];
            level++;
        }

        uint256 remainingPool = matrixPoolAmount - (matrixPoolAmount * 950000 / PERCENT_DENOMINATOR);
        adminLeftover += remainingPool;

        if (adminLeftover > 0) {
            usdt.safeTransfer(adminWallet, adminLeftover);
        }
    }

    function _handleLevel5Share(uint8 packageId, address matrixNode, address buyer, uint256 share) internal {
        address userA = realOwnerByPkg[packageId][matrixNode] != address(0)
            ? realOwnerByPkg[packageId][matrixNode]
            : matrixNode;

        level5MemberCountByPkg[packageId][userA]++;
        uint256 count = level5MemberCountByPkg[packageId][userA];

        bool upgraded = (packageId >= MAX_PACKAGE) || (matrixPackageId[userA] > packageId);

        bool conditionalHoldWindow = (count >= 21 && count <= 28);
        bool unconditionalHoldWindow = (count >= 29 && count <= 32);

        bool shouldHold = (conditionalHoldWindow && !upgraded) || unconditionalHoldWindow;

        if (shouldHold) {
            matrixHoldByPkg[packageId][userA] += share;
            emit MatrixIncomeHeld(userA, packageId, share, count);
        } else {
            uint256 paidShare = _payCapped(userA, share);
            userTotalMatrixIncome[userA] += paidShare;
            emit MatrixIncome(userA, buyer, packageId, 5, paidShare);
        }

        if (count == 28 && !upgraded) {
            _tryMatrixAutoUpgrade(packageId, userA);
        }

        if (count == 32) {
            _level5ReEntry(packageId, userA);
        }
    }

    function _tryMatrixAutoUpgrade(uint8 packageId, address userA) internal {
        if (packageId >= MAX_PACKAGE) return;
        if (matrixPackageId[userA] != packageId) return; 

        uint8 nextPackageId = packageId + 1;
        uint256 requiredHeld = getMatrixPrice(nextPackageId);

        if (matrixHoldByPkg[packageId][userA] >= requiredHeld) {
            uint256 leftover = matrixHoldByPkg[packageId][userA] - requiredHeld;
            matrixHoldByPkg[packageId][userA] = 0; 

            if (leftover > 0) usdt.safeTransfer(adminWallet, leftover); 

            userTotalInvestment[userA] += requiredHeld;

            matrixPackageId[userA] = nextPackageId;
            if (nextPackageId > maxMatrixPackage[userA]) maxMatrixPackage[userA] = nextPackageId;

            _placeInPackageTreeIfNeeded(userA, nextPackageId);
            emit MatrixAutoUpgrade(userA, packageId, nextPackageId, requiredHeld);
        }
    }

    // Phantom re-entry places back into userA's OWN tree (root=userA).
    // FIX applied here: _placeInMatrixForPackage now called with 3rd
    // arg userA — was missing before, wouldn't compile / wrong tree.
    function _level5ReEntry(uint8 packageId, address userA) internal {
        level5MemberCountByPkg[packageId][userA] = 0;
        recycleCount[userA]++;
        phantomCounter++;
        address phantomNode = address(uint160(uint256(keccak256(
            abi.encodePacked("L5_REENTRY", packageId, userA, phantomCounter, block.timestamp)
        ))));

        realOwnerByPkg[packageId][phantomNode] = userA;
        topupFlag[phantomNode] = true;
        maxMatrixPackage[phantomNode] = maxMatrixPackage[userA] >= packageId ? maxMatrixPackage[userA] : packageId;

        address eligibleUpline = _findEligibleMatrixUpline(userA, packageId);

        uint256 reEntryCost = getMatrixPrice(packageId);
        if (matrixHoldByPkg[packageId][userA] >= reEntryCost) {
            matrixHoldByPkg[packageId][userA] -= reEntryCost;
            uint256 paidCost = _payCapped(eligibleUpline, reEntryCost);
            userTotalMatrixIncome[eligibleUpline] += paidCost;
            emit MatrixIncome(eligibleUpline, userA, packageId, 5, paidCost);
        }

        _placeInMatrixForPackage(packageId, phantomNode, userA);

        cycleRootByPkg[packageId][userA].push(phantomNode);

        emit Level5ReEntry(userA, packageId, recycleCount[userA], phantomNode);
    }

    // ---------------------------------------------------------------
    // 2. SPONSOR INCOME (5-Member Cycle) — 90/10 SPLIT
    // ---------------------------------------------------------------
    function _splitSponsorShare(uint256 grossShare) internal pure returns (uint256 sponsorNet, uint256 adminCut) {
        sponsorNet = grossShare * 900000 / PERCENT_DENOMINATOR; // 90%
        adminCut = grossShare - sponsorNet;                     // 10%
    }

    function _releaseDirectIncome(address buyer, uint8 packageId, uint256 fullAmount) internal {
        address directSponsor = sponsor[buyer];
        uint256 sponsorShare = fullAmount * DIRECT_INCOME_PERCENT / PERCENT_DENOMINATOR; 
        
        if (directSponsor == address(0)) {
            usdt.safeTransfer(adminWallet, sponsorShare);
            return;
        }

        bool sponsorQualifies = topupFlag[directSponsor] && maxSponsorPackage[directSponsor] >= packageId;
        if (!sponsorQualifies) {
            usdt.safeTransfer(adminWallet, sponsorShare);
            emit SponsorIncomeRedirected(directSponsor, buyer, packageId, sponsorShare);
            return;
        }

        sponsorCycleCountByPkg[packageId][directSponsor]++;
        uint256 count = sponsorCycleCountByPkg[packageId][directSponsor];
        
        bool upgraded = (packageId >= MAX_PACKAGE) || (sponsorPackageId[directSponsor] > packageId);

        (uint256 sponsorNet, uint256 adminCut) = _splitSponsorShare(sponsorShare);

        if (count == 1 || count == 2) {
            usdt.safeTransfer(adminWallet, adminCut);
            uint256 paidNet = _payCapped(directSponsor, sponsorNet);
            userTotalDirectIncome[directSponsor] += paidNet;
            emit DirectIncome(directSponsor, buyer, packageId, count, paidNet);
        }
        else if (count == 3) {
            if (upgraded) {
                usdt.safeTransfer(adminWallet, adminCut);
                uint256 paidNet = _payCapped(directSponsor, sponsorNet);
                userTotalDirectIncome[directSponsor] += paidNet;
                emit DirectIncome(directSponsor, buyer, packageId, count, paidNet);
            } else {
                sponsorHoldByPkg[packageId][directSponsor] += sponsorShare;
                emit SponsorIncomeHeld(directSponsor, packageId, sponsorShare, count);
            }
        }
        else if (count == 4) {
            if (upgraded) {
                usdt.safeTransfer(adminWallet, adminCut);
                uint256 paidNet = _payCapped(directSponsor, sponsorNet);
                userTotalDirectIncome[directSponsor] += paidNet;
                emit DirectIncome(directSponsor, buyer, packageId, count, paidNet);
            } else {
                sponsorHoldByPkg[packageId][directSponsor] += sponsorShare;
                emit SponsorIncomeHeld(directSponsor, packageId, sponsorShare, count);
                _trySponsorAutoUpgrade(packageId, directSponsor);
            }
        }
        else if (count == 5) {
            address eligibleUpline = _findEligibleSponsorUpline(directSponsor, packageId);

            usdt.safeTransfer(adminWallet, adminCut);
            uint256 paidNet = _payCapped(eligibleUpline, sponsorNet);
            userTotalDirectIncome[eligibleUpline] += paidNet;
            emit DirectIncome(eligibleUpline, buyer, packageId, count, paidNet);

            sponsorCycleCountByPkg[packageId][directSponsor] = 0;
            recycleCount[directSponsor]++;
            
            phantomCounter++;
            address phantom = address(uint160(uint256(keccak256(
                abi.encodePacked("SPONSOR_RE", packageId, directSponsor, phantomCounter, block.timestamp)
            ))));
            
            realOwnerByPkg[packageId][phantom] = directSponsor;
            topupFlag[phantom] = true;
            maxSponsorPackage[phantom] = maxSponsorPackage[directSponsor];
            
            // FIX: phantom placed into directSponsor's OWN tree (3rd arg
            // was missing before — wouldn't compile).
            _placeInMatrixForPackage(packageId, phantom, directSponsor);
            
            emit SponsorReEntry(directSponsor, packageId);
        }
    }

    function _findEligibleSponsorUpline(address startFrom, uint8 packageId) internal view returns (address) {
        address current = sponsor[startFrom];
        while (current != address(0)) {
            if (topupFlag[current] && maxSponsorPackage[current] >= packageId) {
                return current;
            }
            current = sponsor[current];
        }
        return adminWallet;
    }

    function _findEligibleMatrixUpline(address startFrom, uint8 packageId) internal view returns (address) {
        address current = sponsor[startFrom];
        while (current != address(0)) {
            if (topupFlag[current] && maxMatrixPackage[current] >= packageId) {
                return current;
            }
            current = sponsor[current];
        }
        return adminWallet;
    }

    function _trySponsorAutoUpgrade(uint8 packageId, address userA) internal {
        if (packageId >= MAX_PACKAGE) return;
        if (sponsorPackageId[userA] != packageId) return; 

        uint8 nextPackageId = packageId + 1;
        uint256 requiredHeld = getSponsorPrice(nextPackageId);

        if (sponsorHoldByPkg[packageId][userA] >= requiredHeld) {
            uint256 leftover = sponsorHoldByPkg[packageId][userA] - requiredHeld;
            sponsorHoldByPkg[packageId][userA] = 0; 

            if (leftover > 0) usdt.safeTransfer(adminWallet, leftover); 

            userTotalInvestment[userA] += requiredHeld;

            sponsorPackageId[userA] = nextPackageId;
            if (nextPackageId > maxSponsorPackage[userA]) maxSponsorPackage[userA] = nextPackageId;

            emit SponsorAutoUpgrade(userA, packageId, nextPackageId, requiredHeld);
        }
    }

    // ---------------------------------------------------------------
    // 3. LEVEL INCOME (10 Levels)
    // ---------------------------------------------------------------
    function _releaseLevelIncome(address buyer, uint8 packageId, uint256 fullAmount) internal {
        address parent = sponsor[buyer];
        uint8  level  = 1;
        uint256 adminLeftover;

        uint256 levelPoolAmount = fullAmount * LEVEL_POOL_PERCENT / PERCENT_DENOMINATOR;

        while (level <= 10) {
            uint256 share = levelPoolAmount * levelPercent[level] / PERCENT_DENOMINATOR;

            if (parent == address(0)) {
                adminLeftover += share;
                level++;
                continue;
            }

            bool hasEnoughDirects = (referralCount[parent] >= level) || (parent == adminWallet);
            bool hasTier = (parent == adminWallet) || (maxLevelPackage[parent] >= packageId);

            if (topupFlag[parent] && hasTier && hasEnoughDirects) { 
                uint256 paidShare = _payCapped(parent, share);
                userTotalLevelProfit[parent]   += paidShare;
                userLevelIncome[parent][level] += paidShare;
                totalLevelIncomeByLevel[level] += paidShare;

                emit LevelIncome(parent, buyer, packageId, level, paidShare);
            } else {
                adminLeftover += share;
                if (topupFlag[parent] && !hasTier) {
                    emit LevelIncomeRedirected(parent, buyer, level, packageId, share);
                }
            }

            parent = sponsor[parent];
            level++;
        }

        uint256 unallocatedPool = levelPoolAmount - (levelPoolAmount * 800000 / PERCENT_DENOMINATOR);
        adminLeftover += unallocatedPool;

        if (adminLeftover > 0) {
            usdt.safeTransfer(adminWallet, adminLeftover);
        }
    }

    // ---------------------------------------------------------------
    // UTILITIES
    // ---------------------------------------------------------------
    function _generateMemberId(uint256 id) internal pure returns (string memory) {
        return string(abi.encodePacked("YF", _toPaddedString(id, 5)));
    }

    function _toPaddedString(uint256 value, uint256 minDigits) internal pure returns (string memory) {
        bytes memory digits = bytes(_toString(value));
        if (digits.length >= minDigits) return string(digits);
        bytes memory padded = new bytes(minDigits);
        uint256 padLen = minDigits - digits.length;
        for (uint256 i = 0; i < padLen; i++) padded[i] = "0";
        for (uint256 i = 0; i < digits.length; i++) padded[padLen + i] = digits[i];
        return string(padded);
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + value % 10));
            value /= 10;
        }
        return string(buffer);
    }

}
