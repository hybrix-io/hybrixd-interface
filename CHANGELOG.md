# v0.6.18
## 29-06-2021

* Refresh asset before validating available funds for transaction
* Add mode to private key import
* Allow for async rout




# v0.6.17
## 10-06-2021

* Improve unified transaction feedback and performance




# v0.6.16
## 05-06-2021

* Implement fee sufficiency checks on refresh
* Add base assets automatically




# v0.6.15
## 13-05-2021

* Fix form for too long numbers




# v0.6.14
## 07-05-2021

* Add toggle for adding to pending list.




# v0.6.13
## 22-04-2021

* Added data option to rout method for POST requests.
* Use POST for large save requests
* Improvement to unified transaction fee feedback





# v0.6.12
## 09-04-2021

* Define specific hosts per pending transaction type
* Reset hosts on logout





# v0.6.11
## 06-04-2021

* Smart handling of address prefixes. 
* Prevent passing expanded unified addresses for transaction review.
* Fix handling errors in decoding of unified addresses.




# v0.6.10
## 25-03-2021

* Increase pending time threshold: wait a bit longer for slow transactions.
* Sanitize hostname: don't break over a missing slash at the end




# v0.6.9
## 11-03-2021

* Improve auto config.
* Audit improvements



# v0.6.8
## 30-01-2021

* Add encryption by default option to rout and addHost methods
* Add specialized hosts. These will only be used when specified.




# v0.6.7
## 11-01-2021

* Track pending swap deals




# v0.6.6
## 08-01-2021

* Fix hy balance refresh




# v0.6.5
## 25-12-2020

* Track pending transactions. Keep an overview of your pending transactions.
* Upgraded to webpack 5.
* Update session checks before methods.




# v0.6.4
## 19-11-2020


* Implement throttle on refreshAsset
* add getBalance method
* Add file storage connector
* Improve balance feedback




# v0.6.3
## 27-10-2020

* Add xhr connection failed error
* Add more methods to hash
* Parallel: fail if any fails option
* Implement local storage connectors
* Add offset to session to generate multiple accounts from same login
* Add option to work with session key pairs directly
* Handle non json responses 
* Add subbalances for unified assets
* Fix undefineds returned by tests




# v0.6.2
## 18-09-2020

* Export private key for multi-address asset
* Add asset automatically for asset method




# v0.6.1
## 11-09-2020

* Update unified assets
* Improve error handling with nested callbacks
* Add failIfAnyFails option to parallel

# v0.6.0
## 03-09-2020

* Autodetect environment (no longer required to pass connectors explicitly)
* Add list method for storage




# v0.5.17
## 01-09-2020

* Add burn method
* Handle more errors during session interruption
* Align load command to api
* Automate initialization, init is no longer required explicitly
* Improve parallel, sequential and call methods




# v0.5.16
## 20-08-2020

* Add option for partial source address
* Update dependencies
* improve ES6 minification





# v0.5.15
## 13-08-2020

* refreshAsset now automatically adds the asset if required


# v0.5.14
## 29-07-2020

* Improve session reconnect
* Ensure clean urls (no double slashes)
* Add host tests
* Add sub balances to refreshAsset
* Improve require for interface
* Remove exp from tests (depreciated)
* Catch decimal error in test
* Catch non numeric/ non string value
* Remove hardcoded knownIssues
* Align test amount with deterministic test




# v0.5.13
## 11-06-2020


* Reconnect session if lost
* Improve import/export of deterministic code
* Keep old balance if failed to retrieve update
