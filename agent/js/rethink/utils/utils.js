module.exports = {

  randomToken: function() {
    return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
  },

  // This function creates a new anchor element and uses location
  // properties (inherent) to get the desired URL data. Some String
  // operations are used (to normalize results across browsers).

  parseURL: function(url) {
    var a =  document.createElement('a');
    a.href = url;

    return {
      source: url,
      protocol: a.protocol,
      hostname: a.hostname,
      port: a.port,
      query: a.search,
      params: (function() {
        var ret = {};
        var seg = a.search.replace(/(\/^\?\/)/, '').split('&');
        var len = seg.length;
        var i = 0;
        var s;

        for (; i < len; i++) {
          if (!seg[i]) { continue; }
          s = seg[i].split('=');
          ret[s[0]] = s[1];
        }

        return ret;
      })(),

      file: (a.pathname.match(/\/([^/?#]+)$/i) || [,''])[1],
      hash: a.hash.replace('#', ''),
      path: a.pathname.replace(/^([^/])/, '/$1'),
      relative: (a.href.match(/tps?:\/\/[^/]+(.+)/) || [,''])[1],
      segments: a.pathname.replace(/^\//, '').split('/')
    };
  }
}
