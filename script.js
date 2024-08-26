let provider;
let contract;
let isWalletConnected = false;

async function initContract() {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const contractAddress = '0x207aae3729168D0eFB9F01AA4998Ef4578a1d591';
    const abi = [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "side",
                    "type": "string"
                }
            ],
            "name": "flipCoin",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    contract = new ethers.Contract(contractAddress, abi, signer);
}

// Connect wallet button handler
document.getElementById('connectWallet').addEventListener('click', async () => {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await provider.listAccounts();
            document.getElementById('walletInfo').textContent = `Connected: ${accounts[0]}`;
            isWalletConnected = true;
            document.getElementById('flipButton').disabled = false; // Enable the flip button
        } catch (error) {
            console.error(error);
            alert('Failed to connect wallet');
        }
    } else {
        alert('Please install MetaMask!');
    }
});

// Adjust bet amount with +/- buttons
document.getElementById('increaseBet').addEventListener('click', () => {
    let betAmount = parseFloat(document.getElementById('betAmount').value);
    document.getElementById('betAmount').value = (betAmount + 0.01).toFixed(2);
});

document.getElementById('decreaseBet').addEventListener('click', () => {
    let betAmount = parseFloat(document.getElementById('betAmount').value);
    if (betAmount > 0.01) {
        document.getElementById('betAmount').value = (betAmount - 0.01).toFixed(2);
    }
});

// Select side buttons handler
document.querySelectorAll('.side-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.side-button').forEach(btn => btn.classList.remove('selected'));
        button.classList.add('selected');
    });
});

// Flip coin button handler
document.getElementById('flipButton').addEventListener('click', async () => {
    if (!isWalletConnected) {
        alert('Please connect your wallet first.');
        return;
    }

    const betAmount = document.getElementById('betAmount').value;
    const selectedSide = document.querySelector('.side-button.selected');
    if (!selectedSide) {
        alert('Please select Heads or Tails');
        return;
    }

    const side = selectedSide.id;
    document.getElementById('result').textContent = 'Processing transaction...';
    
    try {
        // Start the coin flip animation
        document.getElementById('coin-container').style.display = 'block';
        document.getElementById('coin').classList.add('coin-flip-animation');

        // Send the transaction
        const tx = await contract.flipCoin(side, { value: ethers.utils.parseEther(betAmount) });

        // Wait for the transaction to be confirmed or rejected
        const receipt = await tx.wait();

        // If the transaction is successful, show the animation result
        flipCoinAnimation(side);
    } catch (error) {
        // If the transaction is rejected, stop the animation and show a failure message
        console.error(error);
        document.getElementById('coin').classList.remove('coin-flip-animation');
        document.getElementById('result').textContent = 'Transaction failed. Coin flip was not processed.';
        setTimeout(() => {
            document.getElementById('coin-container').style.display = 'none';
        }, 1000); // Match the animation duration to hide after animation
    }
});

function flipCoinAnimation(side) {
    // Simulate coin flip result for demonstration
    // Replace this with the actual result from smart contract if needed
    const flipResult = Math.random() < 0.5 ? 'heads' : 'tails';

    setTimeout(() => {
        document.getElementById('coin').classList.remove('coin-flip-animation');
        document.getElementById('coin').classList.add(flipResult === 'heads' ? 'heads' : 'tails');
        if (flipResult === side) {
            document.getElementById('result').textContent = `You won! The coin landed on ${flipResult}.`;
        } else {
            document.getElementById('result').textContent = `You lost! The coin landed on ${flipResult}.`;
        }
        document.getElementById('coin-container').style.display = 'none';
    }, 1000); // Matches animation duration
}

window.addEventListener('load', () => {
    initContract();
});
