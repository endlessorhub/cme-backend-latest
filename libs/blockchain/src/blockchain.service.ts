import { Injectable } from '@nestjs/common';

@Injectable()
export class BlockchainService {
  public async getPublicKey(web3: any, private_key: string) {
    const publicKeyAccount = await web3.eth.accounts.privateKeyToAccount(private_key);
    if (publicKeyAccount == null) throw 'invalid private key';
    const publicKey = publicKeyAccount.address;
    return publicKey;
  }

  public async sendSignedTransaction(web3: any, contract_address: string, private_key: string, data: any) {
    try {
      const publicKey = await this.getPublicKey(web3, private_key);

      const txCount = await web3.eth.getTransactionCount(publicKey);
      let gasPrice = await web3.eth.getGasPrice();
      gasPrice = (+gasPrice + 1000000000).toString();
      const txObject = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(2000000),
        gasPrice: web3.utils.toHex(gasPrice),
        to: contract_address,
        data: data,
      };

      const signTransaction = await web3.eth.accounts.signTransaction(txObject, private_key);

      const tranasctionReceipt = await web3.eth.sendSignedTransaction(signTransaction.rawTransaction);

      return tranasctionReceipt;
    } catch (error: any) {
      console.log(error);
      if (error.receipt !== undefined) return error.receipt;
      return error;
    }
  }
}
