import { BaseApi } from '../base.api';
import type { ScriptType } from './types';
import type {
  Transaction,
  TransactionSkeleton,
  TransactionConfidence,
  WitnessToSignTransaction,
} from './interfaces';

export interface NewTransactionInput {
  addresses?: string[];
  prev_hash?: string;
  output_index?: number;
  wallet_name?: string;
  wallet_token?: string;
}

export interface NewTransactionOutput {
  addresses: string[];
  value: number;
  script_type?: ScriptType;
}

export interface NewTransactionPayload {
  preference?: 'high' | 'medium' | 'low';
  fee?: number;
  change_address?: string;
  inputs: NewTransactionInput[];
  outputs: NewTransactionOutput[];
}

export interface AggregatedOrigin {
  latitude: number;
  longitude: number;
}

export interface TransactionPropogationResponse {
  transaction: string;
  first_location: AggregatedOrigin;
  first_city?: string;
  first_country: string;
  aggregated_origin: AggregatedOrigin;
  aggregated_origin_radius: number;
  first_received: string;
}

/** https://www.blockcypher.com/dev/bitcoin/#transaction-api */
export class TransactionApi extends BaseApi {
  /** https://www.blockcypher.com/dev/bitcoin/#unconfirmed-transactions-endpoint */
  async getUnconfirmedTransactions(params?: {
    limit?: number;
    minValue?: number;
  }) {
    const response = await this.axios.get<Transaction[]>('/txs', { params });
    return response.data;
  }

  /** https://www.blockcypher.com/dev/bitcoin/#transaction-hash-endpoint */
  async getTransactionByHash(
    hash: string,
    params?: {
      limit?: number;
      instart?: number;
      outstart?: number;
      legacyaddrs?: boolean;
      includeHex?: boolean;
      includeConfidence?: boolean;
    },
  ) {
    const response = await this.axios.get<Transaction>(`/txs/${hash}`, {
      params,
    });
    return response.data;
  }

  /**
   * https://www.blockcypher.com/dev/bitcoin/#creating-transactions
   * https://www.blockcypher.com/dev/bitcoin/#customizing-transaction-requests
   */
  async newTransaction(
    payload: NewTransactionPayload,
    params?: { includeToSignTx?: boolean },
  ) {
    const response = await this.axios.post<TransactionSkeleton>(
      '/txs/new',
      payload,
      { params },
    );
    return response.data;
  }

  /** https://www.blockcypher.com/dev/bitcoin/#send-transaction-endpoint */
  async sendTransaction(transactionSkeleton: TransactionSkeleton) {
    const response = await this.axios.post<
      Pick<TransactionSkeleton, 'tx' | 'tosign'>
    >('/txs/send', transactionSkeleton);
    return response.data;
  }

  /** https://www.blockcypher.com/dev/bitcoin/#push-raw-transaction-endpoint */
  async pushRawTransaction(transactionHex: string) {
    const response = await this.axios.post<Transaction>('/txs/push', {
      tx: transactionHex,
    });
    return response.data;
  }

  /** https://www.blockcypher.com/dev/bitcoin/#decode-raw-transaction-endpoint */
  async decodeRawTransaction(transactionHex: string) {
    const response = await this.axios.post<Transaction>('/txs/decode', {
      tx: transactionHex,
    });
    return response.data;
  }

  /** https://www.blockcypher.com/dev/bitcoin/#decode-transaction-witness-to-sign-endpoint */
  async decodeTransactionWitnessToSign(witnessToSignTransactionHex: string) {
    const response = await this.axios.post<WitnessToSignTransaction>(
      '/txs/decodeWitnessToSign',
      {
        witness_tosign_tx: witnessToSignTransactionHex,
      },
    );
    return response.data;
  }

  /** https://www.blockcypher.com/dev/bitcoin/#transaction-propagation-endpoint */
  async getTransactionPropogation(transactionHash: string) {
    const response = await this.axios.get<TransactionPropogationResponse>(
      `/txs/${transactionHash}/propogation`,
    );
    return response.data;
  }

  /** https://www.blockcypher.com/dev/bitcoin/#transaction-confidence-endpoint */
  async getTransactionConfidence(transactionHash: string) {
    const response = await this.axios.get<TransactionConfidence>(
      `/txs/${transactionHash}/confidence`,
    );
    return response.data;
  }
}
