'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};
const account5 = {
  owner: 'Bogdan Ostrovskiy',
  movements: [4300, 1000, 74000, 500, 90],
  interestRate: 1,
  pin: 228,
};

const accounts = [account1, account2, account3, account4, account5];

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
const displayMovements = function (movements, sort = false) {
  if (sort) movements = [...movements].sort((a, b) => a - b);
  containerMovements.innerHTML = '';
  movements.forEach((mov, i) => {
    // ELEMENT HTML FOR MOVEMENTS
    const isWithdrawal = mov > 0 ? 'deposit' : 'withdrawal';
    const element = `<div class="movements__row">
    <div class="movements__type movements__type--${isWithdrawal}">${
      i + 1
    } ${isWithdrawal}</div>
    <div class="movements__date">3 days ago</div>
    <div class="movements__value">${mov}€</div>
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
      ? Math.trunc(filterFunc(true).reduce((sum, curr) => sum + curr)) + '€'
      : 0;

  labelSumOut.textContent =
    filterFunc(false).length !== 0
      ? Math.abs(
          Math.trunc(filterFunc(false).reduce((sum, curr) => sum + curr))
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
      }, 0) + '€';
};

const calcPrintBalance = function (movements) {
  let balance = Math.trunc(movements.reduce((sum, curr) => sum + curr));
  labelBalance.textContent = balance + '€';
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
  calcPrintBalance(currentAccount.movements);
  displayMovements(currentAccount.movements);
  calcDisplaySummary(currentAccount);
}

function loginFunction(a) {
  a.preventDefault();
  let login = inputLoginUsername.value;
  let pin = inputLoginPin.value;
  function findAccount(login, pin) {
    const acc = accounts.find(acc => acc.userName === login);
    if (acc?.pin && acc.pin == Number(pin)) {
      currentAccount = acc;
      displayAll();
      labelWelcome.textContent = `Welcome back, ${acc.owner.split(' ')[0]}`;
      containerApp.style.opacity = 1;
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

const transfer = e => {
  e.preventDefault();
  let userToTransfer = inputTransferTo.value;
  let amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => acc.userName === userToTransfer);
  if (
    amount > 0 &&
    calcPrintBalance(currentAccount.movements) > amount &&
    userToTransfer !== currentAccount.userName &&
    receiverAcc
  ) {
    currentAccount.movements.push(-1 * amount);

    receiverAcc.movements.push(amount);
    displayAll();
    inputTransferTo.value = '';
    inputTransferAmount.value = '';
  }
};

const deleteAcc = e => {
  e.preventDefault();
  const user = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);
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
  const loan = Number(inputLoanAmount.value);
  console.log(currentAccount.movements);
  if (
    currentAccount.movements.some(mov => mov >= (loan / 100) * 10) &&
    inputLoanAmount.value > 0
  ) {
    currentAccount.movements.push(loan);
    displayAll();
  }
};
let sortParam = false;
const sort = () => {
  sortParam = !sortParam;
  displayMovements(currentAccount.movements, sortParam);
};
btnLogin.addEventListener('click', loginFunction);
btnTransfer.addEventListener('click', transfer);
btnClose.addEventListener('click', deleteAcc);
btnLoan.addEventListener('click', requestLoan);
btnSort.addEventListener('click', sort);
