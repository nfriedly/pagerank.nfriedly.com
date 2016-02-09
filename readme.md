Google PageRank Lookup Tool
===========================

A simple tool to report the PageRank of a given site. Try an example at 
http://pagerank.nfriedly.com or host your own. 

Plays nicely with most node.js 0.8+ environments, including heroku. Expects a 
[REDISCLOUD_URL](http://redis-cloud.com/) environment variable in the form of:

    redis://username:password@server:port


Todo:
-----

* Fix bookmarklet - should be a popup window so that it can store the results in localStorage
* Sort results by date, newest first
* Add option to delete a result from the list (and localStorage)
* Add option to refresh results > 24 hours old
* Add support for multiple values at different dates
* Add multicore support
* Clear form on submit
* Add multiline form option


GPLv3 License:
--------------

Copyright (c) 2013 Nathan Friedly - http://nfriedly.com

Released under the GNU General Public License Version 3:  https://www.gnu.org/licenses/gpl

This project is not affiliated with Google in any way.
