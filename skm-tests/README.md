Skrumble-Tests
---

> Tests for the Skrumble tool suite

### Installation

`npm -g install skm-tests`

### Test structure

Example test file:
```Javascript
pragma solidity ^0.4.7;
import "skm_tests.sol"; // injected by skm-tests
import "./simple_storage.sol";

contract MyTest {
  SimpleStorage foo;
  uint i = 0;

  function beforeAll() {
    foo = new SimpleStorage();
  }

  function beforeEach() {
    if (i == 1) {
      foo.set(200);
    }
    i += 1;
  }

  function initialValueShouldBe100() public {
    Assert.equal(foo.get(), 100, "initial value is not correct");
  }

  function initialValueShouldBe200() public constant returns {
    return Assert.equal(foo.get(), 200, "initial value is not correct");
  }

}
```


Available special functions:
* `beforeEach()` - runs before each test
* `beforeAll()` - runs before all tests

#### Assert library

| Available functions  | Supported types |
| ------------- | ------------- |
| `Assert.ok()`  | `bool`  |
| `Assert.equal()`  | `uint`, `int`, `bool`, `address`, `bytes32`, `string`  |
| `Assert.notEqual()` | `uint`, `int`, `bool`, `address`, `bytes32`, `string`  |
| `Assert.greaterThan()` | `uint`, `int` |
| `Assert.lesserThan()` | `uint`, `int` |

#### Use a different sender `msg.sender`

It is quite common that a contract need to be tested in different situation.
Especially being able to set before hand the sender account (`msg.sender`) used for a specific tests suite enable quite a lot a new test use cases.

note that `TestsAccounts` is filled with all the accounts available in `web3.eth.accounts()`.

### Command Line

Skrumble-Tests will assume the tests will files whose name end with `"_test.sol"`. e.g `simple_storage_test.sol`

Usage:

* A directory with tests files `skm-tests examples/`
* A test file `skm-tests examples/simple_storage_test.sol`

### Library

Importing the library:
```Javascript
const SkrumbleTests = require('skm-tests');
```

Running a single test object:
```Javascript
skmTests.runTest(contractName, contractObj, testCallback, resultsCallback)
```
params:
`testName` - `string` name of the test
`testObj` -  web3.js 1.0 contract instance of the test
`testCallback(object)` -  called each time there is a test event. 3 possible type of objects:
* `{ type: 'contract', value: '<TestName>', filename: '<test_filename.sol>' }`
* `{ type: 'testPass', value: '<name of testing function>', time: <time taken>, context: '<TestName>'}`
* `{ type: 'testFailure', value: '<name of testing function>', time: <time taken>, context: '<TestName>', errMsg: '<message in the Assert>' }`

`resultsCallback(object)`
* `passingNum` - number of passing tests
* `failureNum` - number of failing tests
* `timePassed` - time it took for all the tests to run (in seconds)


Running a set of tests given the sourcecode:
```Javascript
skmTests.runTestSources(contractSources, testCallback, resultCallback, finalCallback, importFileCb);
```
params:
`contractSources` - `object` -> `filename => { content: source }`
`testCallback(object)` - called each time there is a test event. 3 possible type of objects:
* `{ type: 'contract', value: '<TestName>', filename: '<test_filename.sol>' }`
* `{ type: 'testPass', value: '<name of testing function>', time: <time taken>, context: '<TestName>'}`
* `{ type: 'testFailure', value: '<name of testing function>', time: <time taken>, context: '<TestName>', errMsg: '<message in the Assert>' }`

`resultCallback(err, object)`
* `passingNum` - number of passing tests
* `failureNum` - number of failing tests
* `timePassed` - time it took for all the tests to run (in seconds)

`finalCallback(err)` - called when all tests finish running.
`importCb(url, cb)`



## License

[MIT](LICENSE.md) © 2020 Skrumble Network

[MIT](LICENSE.md) © 2018 Remix Team
