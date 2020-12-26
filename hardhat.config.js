require('dotenv').config();
const axios = require('axios');
const ethers = require('ethers');
const { cyan, gray, green } = require('chalk');

function hexToNumber(hex) {
  return parseFloat(ethers.utils.formatEther(
    ethers.BigNumber.from(hex)
  ));
}

task('1inchcheck', 'Checks if an account/s can claim 1INCH rewards')
  .addPositionalParam('accounts', 'Comma separated list of accounts to check for 1INCH rewards to claim')
  .setAction(async (taskArguments) => {
    const providerUrl = process.env.PROVIDER;
    const provider = providerUrl ?
      new ethers.providers.JsonRpcProvider(providerUrl) :
      ethers.getDefaultProvider();

    let accounts = taskArguments.accounts;

    accounts = accounts.split(',');
    console.log(gray(`  > Checking ${accounts.length} accounts...`));
    console.log(gray(`  > Using provider: ${providerUrl ? providerUrl : 'Ethers fallback provider'}`));
    console.log('\n');

    let toBeClaimed = hasBeenClaimed = canClaim = haveClaimed = 0;
    const num = accounts.length;
    for (let i = 0; i < num; i++) {
      const account = ethers.utils.getAddress(accounts[i]);
      console.log(cyan(`Checking account ${i} of ${num} ${account}`));

      const result = await axios.get(`https://governance.1inch.exchange/v1.0/distribution/${account}`)
        .catch(() => {});
      const entry = result ? result.data : undefined;

      if (entry) {
        const amount = hexToNumber(entry.amount);

        console.log(gray(`  > Account *could* claim ${amount} 1INCH...`));
        // console.log(entry);

        console.log(gray(`  > Querying TokenDistributor.isClaimed(${entry.index})...`));
        const TokenDistributor = new ethers.Contract(
          '0xE295aD71242373C37C5FdA7B57F26f9eA1088AFe',
          require('./abis/TokenDistributor.json'),
          provider
        );

        const isClaimed = await TokenDistributor.isClaimed(entry.index);
        if (isClaimed) {
          console.log(gray(`  > Account has already claimed ${amount} 1INCH`));

          haveClaimed++;
          hasBeenClaimed += amount;
        } else {
          console.log(green(`  > Account has ${amount} 1INCH to claim!`));

          canClaim++;
          toBeClaimed += amount;
        }
      } else {
        console.log(gray('  > Account has no 1INCH to claim :('));
      }
      console.log(gray(`  > ${canClaim} accounts can claim ${toBeClaimed} 1INCH`));
      console.log(gray(`  > ${haveClaimed} accounts have claimed ${hasBeenClaimed} 1INCH`));
    }
  });

module.exports = {
  solidity: '0.7.3',
};

