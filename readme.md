Google PageRank Lookup Tool
===========================

A simple tool to report the PageRank of a given site. Try an example at 
http://pagerank.nfriedly.com or host your own. 

Plays nicely with most node.js 0.8+ environments, including heroku. Expects 
(REDISCLOUD_URL)[rediscloud],  (STRIPE_PRIVATE_KEY)[stripe] environment variables. The 
`REDISCLOUD_URL` variable should be in the form of:

    redis://username:password@server:port
    
[stripe]: https://manage.stripe.com/account/apikeys
[rediscloud]: http://redis-cloud.com/

You'll also need to edit public/config.js with your stripe public keys and site's domain.

Todo:
-----

* Fix grunt tasks for html and CSS auto-updating
* Improve modal responsiveness
* Redirect old pr app to new one
* Consider adding a uservoice widget
* Add pay-as-you-go plan & user accounts - https://www.mozilla.org/en-US/persona/
* Hide add for paying users
* Start recording historical values
* Offer automatic daily/weekly/monthly refresh for paygo users
* Offer email on change for automatic refresh users
* Add some cool icons (w/ font-awesome?)
* Favicon.ico
* Include fallbacks for external JS / CSS / etc
* Fix html minification
* auto beautify html
* Add retry button to error dialog
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