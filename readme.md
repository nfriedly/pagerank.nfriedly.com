Google PageRank Lookup Tool
===========================

A simple tool to report the PageRank of a given site. Try an example at 
http://pagerank.nfriedly.com or host your own. 

Plays nicely with most node.js 0.8+ environments, including heroku. Expects 
(REDISCLOUD_URL)[rediscloud],  (STRIPE_PRIVATE_KEY)[stripe], and (STRIPE_PUBLIC_KEY)[stripe] 
environment variables. The `REDISCLOUD_URL` variable should be in the form of:

    redis://username:password@server:port
    
[stripe]: https://manage.stripe.com/account/apikeys
[rediscloud]: http://redis-cloud.com/

Todo:
-----

* Add support for multiple values at different dates
* Add partial support for legacy bookmarklett (pr, but no history), add analytics to legacy bookmarklett
* Redirect old pr app to new one
* Use Bootstrap's built-in modals and whatnot
* Uses requirejs or something similar to organize client-side js
* Finish stripe setup
* Add pay-as-you-go plan & user accounts
* Move google analytics out of core classes
* Reduce coupling
* Lots of unit tests
* Update node version
* Make html use configs
* Update to latest node.js release


GPLv3 License:
--------------

Copyright (c) 2013 Nathan Friedly - http://nfriedly.com

Released under the GNU General Public License Version 3:  https://www.gnu.org/licenses/gpl

This project is not affiliated with Google in any way.