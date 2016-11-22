1/Please take a look:
- git clone https://github.com/prerender/prerender.git
- cd prerender
- npm install
- node server.js
- change port of prerender to 1337 to make sure it not conflict with our server by go to lib/index.js and change it to 1337

2/Install Solr search engine:
- download search engine at http://lucene.apache.org/solr/
- start search server by run solr start
- create new core named 'the-symbol-solr' by enter solr create -c the-symbol-solr
- sync our current DB to solr by run thesymbol-api/sync-solr-search.js