const CONTRACT_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; 
        
const ABI = [
    "function registerLand(address owner, string tokenURI, string loc, uint256 area, uint256 taxId) public",
    "function getLandDetails(uint256 tokenId) public view returns (tuple(string location, uint256 areaSqFt, uint256 propertyTaxId, bool isVerified))",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function safeTransferFrom(address from, address to, uint256 tokenId) public"
];

let provider;
let signer;
let contract;

// --- WALLET CONNECTION ---
async function connectWallet() {
    if (window.ethereum) {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            signer = await provider.getSigner();
            contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
            
            const address = await signer.getAddress();
            const connectBtn = document.getElementById('connectWalletBtn');
            if(connectBtn) {
                connectBtn.innerText = address.slice(0,6) + "..." + address.slice(-4);
                // Set authenticated official button state
                connectBtn.className = "bg-gray-100 text-gray-800 px-6 py-2 text-sm font-bold uppercase tracking-wider rounded border border-gray-300 shadow-inner cursor-default";
            }
        } catch (error) {
            console.error("Connection failed", error);
        }
    } else {
        alert("Please install MetaMask to use this application.");
    }
}

// Auto-connect if already authorized
window.addEventListener('DOMContentLoaded', async () => {
    if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) connectWallet();
    }
});

if (document.getElementById('connectWalletBtn')) {
    document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
}

// --- PAGE LOGIC: MINT ---
if (document.getElementById('registerBtn')) {
    document.getElementById('registerBtn').addEventListener('click', async () => {
        if (!contract) return alert("Please connect your wallet first.");
        const status = document.getElementById('regStatus');
        try {
            status.innerText = "Awaiting wallet approval...";
            status.classList.remove('hidden');
            const tx = await contract.registerLand(
                document.getElementById('regOwner').value,
                document.getElementById('regUri').value,
                document.getElementById('regLocation').value,
                document.getElementById('regArea').value,
                document.getElementById('regTaxId').value
            );
            status.innerText = "Transaction pending...";
            await tx.wait();
            status.innerText = "✅ Asset successfully registered! TX: " + tx.hash.slice(0,12) + "...";
            status.className = "text-xs mt-3 text-center text-green-400 font-medium block";
        } catch (error) {
            console.error(error);
            status.innerText = "❌ Transaction failed or rejected.";
            status.className = "text-xs mt-3 text-center text-red-400 font-medium block";
        }
    });
}

// --- PAGE LOGIC: VERIFY ---
if (document.getElementById('queryBtn')) {
    document.getElementById('queryBtn').addEventListener('click', async () => {
        if (!contract) return alert("Please connect your wallet first.");
        const id = document.getElementById('queryId').value;
        if (id === "") return;
        try {
            const details = await contract.getLandDetails(id);
            const ownerAddr = await contract.ownerOf(id);
            document.getElementById('resOwner').innerText = ownerAddr;
            document.getElementById('resLoc').innerText = details.location;
            document.getElementById('resArea').innerText = details.areaSqFt.toString();
            document.getElementById('resTax').innerText = details.propertyTaxId.toString();
            document.getElementById('resVer').innerText = details.isVerified ? "VERIFIED" : "UNVERIFIED";
            document.getElementById('resVer').className = details.isVerified ? "font-bold text-green-400" : "font-bold text-red-400";
            document.getElementById('queryResult').classList.remove('hidden');
            
            // Populate dynamic data into the Certificate (if on the Verify page)
            if (document.getElementById('certOwner')) {
                document.getElementById('certOwner').innerText = ownerAddr;
                document.getElementById('certLoc').innerText = details.location;
                document.getElementById('certArea').innerText = details.areaSqFt.toString();
                document.getElementById('certTax').innerText = details.propertyTaxId.toString();
                document.getElementById('certToken').innerText = id;
                document.getElementById('certDate').innerText = new Date().toLocaleDateString();
                
                // Keep certificate hidden until the user explicitly requests it
                document.getElementById('certificatePanel').classList.add('hidden');
            }
        } catch (error) {
            alert("Record not found. Ensure the Token ID exists.");
            document.getElementById('queryResult').classList.add('hidden');
            if (document.getElementById('certificatePanel')) document.getElementById('certificatePanel').classList.add('hidden');
        }
    });
}

// --- PAGE LOGIC: CERTIFICATE GENERATOR ---
if (document.getElementById('viewCertBtn')) {
    document.getElementById('viewCertBtn').addEventListener('click', () => {
        const certPanel = document.getElementById('certificatePanel');
        certPanel.classList.remove('hidden');
        certPanel.classList.add('fade-in');
        // Smooth scroll to the newly generated certificate
        setTimeout(() => certPanel.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    });
}

// --- PAGE LOGIC: TRANSFER ---
if (document.getElementById('transferBtn')) {
    document.getElementById('transferBtn').addEventListener('click', async () => {
        if (!contract) return alert("Please connect your wallet first.");
        const status = document.getElementById('transStatus');
        try {
            const tx = await contract.safeTransferFrom(await signer.getAddress(), document.getElementById('transTo').value, document.getElementById('transId').value);
            status.innerText = "Transaction pending..."; status.classList.remove('hidden');
            await tx.wait();
            status.innerText = "✅ Transfer successful!"; status.className = "text-xs mt-3 text-green-400 block text-center";
        } catch (error) {
            status.innerText = "❌ Transfer failed."; status.className = "text-xs mt-3 text-red-400 block text-center";
        }
    });
}