## 1INCH Token Distribution

Similar to https://github.com/ajsantander/uni-token-distribution

Instead of using a large data file, this script queries entries one by one from https://governance.1inch.exchange/v1.0/distribution/*

### Running the script

```
npm install
```

Then run the script.

```
npx hardhat 1inchcheck <address-list>
```

Note: The script uses Ethers' default provider, but you can specify your own in a .env file. See `.env.sample`.
