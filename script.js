'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};
const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
const eurToUsd = 1.1;
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

let currentAccount;

const displayMovements = function (acc, sort = false) {
  if (sort) acc.movements = [...acc.movements].sort((a, b) => a - b);

  containerMovements.innerHTML = '';
  acc.movements.forEach((mov, i) => {
    // ELEMENT HTML FOR MOVEMENTS
    const date = new Date(acc.movementsDates[i]);
    const day = `${date.getDate()}`.padStart(2, '0');
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const year = `${date.getFullYear()}`.padStart(2, '0');

    const isWithdrawal = mov > 0 ? 'deposit' : 'withdrawal';
    const element = `<div class="movements__row">
    <div class="movements__type movements__type--${isWithdrawal}">${
      i + 1
    } ${isWithdrawal}</div>
    <div class="movements__date">${day}/${month}/${year}</div>
    <div class="movements__value">${mov.toFixed(2)}€</div>
  </div>`;

    // INSERTING HTML
    containerMovements.insertAdjacentHTML('afterbegin', element);
  });
};
/////////////////////////////////////////////////

const calcDisplaySummary = function ({ movements, interestRate }) {
  // filtering withdrawals/deposits
  const filterFunc = isWithdrawal =>
    isWithdrawal
      ? movements.filter(mov => mov > 0)
      : movements.filter(mov => mov < 0);

  // assigning text content

  labelSumIn.textContent =
    filterFunc(true).length !== 0
      ? filterFunc(true)
          .reduce((sum, curr) => sum + curr)
          .toFixed(2) + '€'
      : 0;

  labelSumOut.textContent =
    filterFunc(false).length !== 0
      ? Math.abs(
          filterFunc(false)
            .reduce((sum, curr) => sum + curr)
            .toFixed(2)
        ) + '€'
      : 0;

  labelSumInterest.textContent =
    movements
      .filter(mov => mov > 0)
      .map(deposit => {
        return (deposit / 100) * interestRate;
      })
      .reduce((sum, curr) => {
        if (curr >= 1) return sum + curr;
        return sum;
      }, 0)
      .toFixed(2) + '€';
};

const calcPrintBalance = function (acc) {
  console.log(acc);
  let balance = acc.movements.reduce((sum, curr) => sum + curr);
  labelBalance.textContent = balance.toFixed(2) + '€';
  return balance;
};

const createUserName = function (arr) {
  arr.forEach(
    ({ owner }, i) =>
      (accounts[i].userName = owner
        .split(' ')
        .map(word => word.slice(0, 1))
        .join('')
        .toLowerCase())
  );
};

createUserName(accounts);
function displayAll() {
  console.log(currentAccount);
  calcPrintBalance(currentAccount);
  displayMovements(currentAccount);
  calcDisplaySummary(currentAccount);

  containerApp.style.opacity = 1;
}

function loginFunction(a) {
  a.preventDefault();
  let login = inputLoginUsername.value;
  let pin = inputLoginPin.value;
  function findAccount(login, pin) {
    const acc = accounts.find(acc => acc.userName === login);
    if (acc?.pin && acc.pin == +pin) {
      currentAccount = acc;
      displayAll();
      labelWelcome.textContent = `Welcome back, ${acc.owner.split(' ')[0]}`;
    } else {
      document
        .querySelector('.navigation')
        .insertAdjacentHTML(
          'afterend',
          '<div  class="wrong" >Wrong login or password</div>'
        );
      setTimeout(() => {
        document.querySelector('.wrong').style.opacity = '0';
        setTimeout(
          () => (document.querySelector('.wrong').style.display = 'none'),
          1000
        );
      }, 1000);
    }
  }
  // create function finds acc
  if (login && pin) {
    findAccount(login, pin);
  }
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();
  inputLoginUsername.blur();
}
// FAKE ACC ALWAYS DISPLAY
currentAccount = account1;
const notSorted = [...currentAccount.movements];
calcPrintBalance(currentAccount);
displayMovements(currentAccount, false, notSorted);
calcDisplaySummary(currentAccount);
containerApp.style.opacity = 1;
const now = new Date();
const day = `${now.getDate()}`.padStart(2, '0');
const month = `${now.getMonth() + 1}`.padStart(2, '0');
const hours = `${now.getHours()}`.padStart(2, 0);
const minutes = `${now.getMinutes()}`.padStart(2, 0);
labelDate.textContent = `${day}/${month}/${now.getFullYear()}, ${hours}:${minutes}`;

const transfer = e => {
  e.preventDefault();
  let userToTransfer = inputTransferTo.value;
  let amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(acc => acc.userName === userToTransfer);
  if (
    amount > 0 &&
    calcPrintBalance(currentAccount) > amount &&
    userToTransfer !== currentAccount.userName &&
    receiverAcc
  ) {
    currentAccount.movements.push(-1 * amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movements.push(amount);
    receiverAcc.movementsDates.push(new Date().toISOString());
    displayAll();
    inputTransferTo.value = '';
    inputTransferAmount.value = '';
  }
};

const deleteAcc = e => {
  e.preventDefault();
  const user = inputCloseUsername.value;
  const pin = +inputClosePin.value;
  const index = accounts.findIndex(
    acc => acc.userName === user && acc.pin === pin
  );
  inputCloseUsername.value = inputClosePin.value = '';
  if (index === -1) return;
  if (pin === currentAccount.pin && user === currentAccount.userName) {
    if (index === 0) accounts.shift();
    if (index === accounts.length - 1) {
      accounts.pop();
    } else {
      accounts.splice(index, index);
    }
    containerApp.style.opacity = 0;
  }
};
const requestLoan = function (e) {
  e.preventDefault();

  // mov that at least 10% of loan amount
  const loan = Math.floor(inputLoanAmount.value);

  if (
    currentAccount.movements.some(mov => mov >= (loan / 100) * 10) &&
    inputLoanAmount.value > 0
  ) {
    currentAccount.movements.push(loan);
    currentAccount.movementsDates.push(new Date().toISOString());

    displayAll();
  }
  inputLoanAmount.value = '';
};
let sortParam = false;

const sort = () => {
  sortParam = !sortParam;

  displayMovements(currentAccount, sortParam, notSorted);
};

btnLogin.addEventListener('click', loginFunction);
btnTransfer.addEventListener('click', transfer);
btnClose.addEventListener('click', deleteAcc);
btnLoan.addEventListener('click', requestLoan);
btnSort.addEventListener('click', sort);
