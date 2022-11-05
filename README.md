# Project Name

nft-market

# Project description

NFT platform constructed with IPFS,including creation and purchase and show of NFT

Store on IPFS, use IPFS gateway to store/obtain information and pictures

# IPFS related code

This project use [js-ipfs/ipfs-core](https://github.com/ipfs/js-ipfs) to implementation of the IPFS protocol

- [IPFS class](https://github.com/LeoWangJ/nft-market/blob/main/pages/api/ipfs.js)
  - The collection of the main practical method, including uploading and retrieval data
- [IPFS add](https://github.com/LeoWangJ/nft-market/blob/main/pages/mint-item.js#L41)
  - add image & json
- [IPFS retrieve](https://github.com/LeoWangJ/nft-market/blob/main/pages/index.js#L33)
  - retrieve data

# Project run

- run website

```
yarn install
yarn dev
```

- run local node

```
yarn node-local
```

- run local deploy contract
  You need to add your infura projectId & keyData in env file

```
yarn deploy-local
```

# Project requirements

- Node v16.13.2

# Working App

please use goeril testnet

Website - [https://nft-market-neon.vercel.app/](https://nft-market-neon.vercel.app/)

# Demo video

- [youtube](https://youtu.be/pmdqLZQ67O0)

# Contract address

- [nft market](https://goerli.etherscan.io/address/0x4977FD14aA6D7CD8a6FD5651b2abCD9Ca187C36b)

- [nft](https://goerli.etherscan.io/address/0xbb2DcA26ddfC00e82B493bc825f18d89D444C2AA)

# Team

- [leowang](https://github.com/LeoWangJ)

# Contact Info

- Discord ID - leoJ#5012
- Email ID - [rfv7855659@gmail.com](mailto:rfv7855659@gmail.com)
- Gitcoin - [leowangj](https://gitcoin.co/leowangj)
