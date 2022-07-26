import { Injectable, Logger } from '@nestjs/common';

// Owned by the Crypto team.
// TODO:
// - functions (transferListener, createWallet, transferMKCToExternalWallet, feesComputing)
// - connectors (to subgraph api, blockchain etc...)
//
@Injectable()
export class BlockchainMsMKCRelayService {
  private logger: Logger = new Logger('BlockchainMsMKCRelayService');
}
