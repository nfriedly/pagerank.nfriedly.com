Google PageRank Lookup Tool
===========================

A simple tool to report the PageRank of a given site. Try an example at 
http://pagerank.nfriedly.com or host your own. 

Plays nicely with most node.js 0.8+ environments, including heroku. Expects a 
(REDISCLOUD_URL)[http://redis-cloud.com/] environment variable in the form of:

    redis://username:password@server:port


Todo:
-----

* Sort results by date, newest first
* Add support for multiple values at different dates
* Clear form on submit
* Add partial support for legacy bookmarklett (pr, but no history), add analytics to legacy bookmarklett
* Redirect old pr app to new one.


GPLv3 License:
--------------

Copyright (c) 2013 Nathan Friedly - http://nfriedly.com

Released under the GNU General Public License Version 3:  https://www.gnu.org/licenses/gpl

This project is not affiliated with Google in any way.