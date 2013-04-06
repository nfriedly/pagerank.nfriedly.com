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

* Add multi-url form
* Add partial support for legacy bookmarklett (pr, but no history), add analytics to legacy bookmarklett
* Improve responsiveness for small screens
* Redirect old pr app to new one
* Add pay-as-you-go plan & user accounts
* Hide add for paying users
* Add retry button to error dialog
* Add "refresh all" button
* Start recording historical values
* Add no-js warning
* Lots of unit tests
* Add way to view historical values
* Accept bitcoin
* Internationalization


GPLv3 License:
--------------

Copyright (c) 2013 Nathan Friedly - http://nfriedly.com

Released under the GNU General Public License Version 3:  https://www.gnu.org/licenses/gpl

This project is not affiliated with Google in any way.