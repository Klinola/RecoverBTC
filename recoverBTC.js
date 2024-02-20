const bitcoin = require('bitcoinjs-lib');
const network = bitcoin.networks.bitcoin;

async function recoverBTC(utxoTxId, utxoVout, privateKeyWIF, destinationAddress, amount) {
    try {
        const ecpair = bitcoin.ECPair.fromWIF(privateKeyWIF, network);
        
        const { address } = bitcoin.payments.p2tr({
            pubkey: ecpair.publicKey,
            network: network,
        });

        const psbt = new bitcoin.Psbt({ network: network })
            .addInput({
                hash: utxoTxId,
                index: utxoVout,
                witnessUtxo: {
                    script: bitcoin.address.toOutputScript(address, network),
                    value: amount, 
                },
            })
            .addOutput({
                address: destinationAddress,
                value: amount - minFee,
            });
        psbt.signInput(0, ecpair);
        psbt.finalizeAllInputs();

        const transaction = psbt.extractTransaction();

        console.log(`Transaction Hex: ${transaction.toHex()}`);
    } catch (error) {
        console.error('Error in recovering BTC:', error);
    }
}

// Usage
const utxoTxId = 'UTXO_TXID';
const utxoVout = 0; // Output index of the UTXO
const privateKeyWIF = 'PRIVATE_KEY_WIF';
const destinationAddress = 'DESTINATION_ADDRESS';
const amount = 10000; // Amount of satoshis in the UTXO
const minFee = 500; // Estimated fee in satoshis, adjust based on current network conditions

recoverBTC(utxoTxId, utxoVout, privateKeyWIF, destinationAddress, amount);
