Google PageRank Lookup Tool
===========================

A simple tool to report the PageRank of a given site. Try an example at 
http://pagerank.nfriedly.com or host your own. 

Plays nicely with most node.js 0.8+ environments, including heroku. Expects 
[REDISCLOUD_URL][rediscloud],  [STRIPE_PRIVATE_KEY][stripe] environment variables. The 
`REDISCLOUD_URL` variable should be in the form of:

    redis://username:password@server:port
    
[stripe]: https://manage.stripe.com/account/apikeys
[rediscloud]: http://redis-cloud.com/

You'll also need to edit public/config.js with your stripe public keys and site's domain.

⚠️ No longer working ⚠️ 
-----------------------

Google turned off the API that this library used, so the library is no longer functional.


GPLv3 License:
--------------

Copyright (c) 2013 Nathan Friedly - http://nfriedly.com

Released under the GNU General Public License Version 3:  https://www.gnu.org/licenses/gpl

This project is not affiliated with Google in any way.
