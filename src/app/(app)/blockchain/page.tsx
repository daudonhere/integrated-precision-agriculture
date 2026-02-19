'use client';

import { useState } from 'react';

const NFT_ASSETS = [
  { id: 'NFT-001', name: 'Harvest Batch #001', crop: 'Tomat Cherry', quantity: '500 kg', harvestDate: '2025-01-15', tokenId: '0x1a2b...3c4d', status: 'minted', ipfs: 'QmX7k9...' },
  { id: 'NFT-002', name: 'Harvest Batch #002', crop: 'Cabai Rawit', quantity: '300 kg', harvestDate: '2025-01-20', tokenId: '0x5e6f...7g8h', status: 'minted', ipfs: 'QmY8m0...' },
  { id: 'NFT-003', name: 'Harvest Batch #003', crop: 'Timun Japan', quantity: '800 kg', harvestDate: '2025-02-01', tokenId: '0x9i0j...1k2l', status: 'pending', ipfs: '-' },
];

const SMART_CONTRACTS = [
  { name: 'Harvest Tracker', address: '0xABC123...DEF456', network: 'Polygon', status: 'active', transactions: 156 },
  { name: 'Supply Chain', address: '0x789GHI...JKL012', network: 'Polygon', status: 'active', transactions: 89 },
  { name: 'Carbon Credits', address: '0x345MNO...PQR678', network: 'Polygon', status: 'draft', transactions: 0 },
];

const TRANSACTIONS = [
  { hash: '0x1a2b3c4d...', type: 'Mint NFT', from: 'Farm', to: 'Distributor', date: '2025-02-18 10:30', status: 'confirmed' },
  { hash: '0x5e6f7g8h...', type: 'Transfer', from: 'Distributor', to: 'Retailer', date: '2025-02-17 14:20', status: 'confirmed' },
  { hash: '0x9i0j1k2l...', type: 'Sale', from: 'Retailer', to: 'Consumer', date: '2025-02-16 09:15', status: 'pending' },
];

export default function BlockchainPage() {
  const [activeTab, setActiveTab] = useState<'nft' | 'contracts' | 'transactions'>('nft');

  return (
    <div className="p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Blockchain</h1>
          <p className="text-xs text-gray-500">Web3 integration & supply chain tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            Polygon Connected
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Total NFTs Minted</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">2</p>
            <p className="text-xs text-gray-500">1 pending</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Smart Contracts</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">3</p>
            <p className="text-xs text-green-600">2 active</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Total Transactions</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">245</p>
            <p className="text-xs text-gray-500">On-chain</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Gas Spent</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">0.45 MATIC</p>
            <p className="text-xs text-gray-500">Last 30 days</p>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex gap-4">
            <button
              onClick={() => setActiveTab('nft')}
              className={`border-b-2 py-2 text-sm font-medium transition-colors ${
                activeTab === 'nft'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              NFT Assets
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`border-b-2 py-2 text-sm font-medium transition-colors ${
                activeTab === 'contracts'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Smart Contracts
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`border-b-2 py-2 text-sm font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Transactions
            </button>
          </nav>
        </div>

        {activeTab === 'nft' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Harvest NFTs</h2>
              <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                Mint New NFT
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {NFT_ASSETS.map((nft) => (
                <div key={nft.id} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">{nft.name}</h3>
                      <p className="text-xs text-gray-500">{nft.crop}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      nft.status === 'minted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {nft.status}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Quantity</span>
                      <span className="font-medium text-gray-900">{nft.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Harvest Date</span>
                      <span className="font-medium text-gray-900">{nft.harvestDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Token ID</span>
                      <span className="font-mono text-gray-900">{nft.tokenId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">IPFS</span>
                      <span className="font-mono text-gray-900">{nft.ipfs}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      View on Polygon
                    </button>
                    <button className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                      IPFS Metadata
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Deployed Contracts</h2>
              <button className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                Deploy New
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contract</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Network</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Transactions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {SMART_CONTRACTS.map((contract, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{contract.name}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-500">{contract.address}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{contract.network}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          contract.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {contract.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{contract.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Recent Transactions</h2>
              <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                View All
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">From</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">To</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Hash</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {TRANSACTIONS.map((tx, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{tx.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{tx.from}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{tx.to}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{tx.date}</td>
                      <td className="px-4 py-3 text-sm font-mono text-gray-500">{tx.hash}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          tx.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
