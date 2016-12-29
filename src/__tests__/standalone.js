import generateRobotstxt from '../standalone';
import path from 'path';
// eslint-disable-next-line node/no-unpublished-import
import test from 'ava';

const fixturesPath = path.join(__dirname, 'fixtures');

test('should generated default output without options',
    (t) => generateRobotstxt()
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\n');
        })
);

test('should `contain one `policy` item with `Allow` directive',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            userAgent: 'Google'
        }]
    })
        .then((content) => {
            t.is(content, 'User-agent: Google\nAllow: /\n');
        })
);

test('should contain two `policy` item with `Allow` directive',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            userAgent: 'Google'
        }, {
            allow: '/',
            userAgent: 'Yandex'
        }]
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: Google\nAllow: /\n\n'
                    + 'User-agent: Yandex\nAllow: /\n'
            );
        })
);

test('should `contain two `policy` item with `Allow` and `Disallow` directives',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            disallow: '/search-foo',
            userAgent: 'Google'
        }, {
            allow: '/',
            disallow: '/search-bar',
            userAgent: 'Yandex'
        }]
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: Google\nAllow: /\nDisallow: /search-foo\n\n'
                    + 'User-agent: Yandex\nAllow: /\nDisallow: /search-bar\n'
            );
        })
);

test('should `contain two policy item, first have multiple `User-agent` option',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            disallow: '/search-foo',
            userAgent: ['Google', 'AnotherBot']
        }, {
            allow: '/',
            disallow: '/search-bar',
            userAgent: 'Yandex'
        }]
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: Google\nUser-agent: AnotherBot\nAllow: /\nDisallow: /search-foo\n\n'
                    + 'User-agent: Yandex\nAllow: /\nDisallow: /search-bar\n'
            );
        })
);

test('should use encode url in `allow` and `disallow` options',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/корзина',
            disallow: '/личный-кабинет',
            userAgent: 'Google'
        }]
    })
        .then((content) => {
            t.is(content, 'User-agent: Google\n'
                + 'Allow: /%D0%BA%D0%BE%D1%80%D0%B7%D0%B8%D0%BD%D0%B0\n'
                + 'Disallow: /%D0%BB%D0%B8%D1%87%D0%BD%D1%8B%D0%B9-%D0%BA%D0%B0%D0%B1%D0%B8%D0%BD%D0%B5%D1%82\n'
            );
        })
);

test('should throw error if `policy` option is not array', (t) => {
    t.throws(generateRobotstxt({
        policy: 'string'
    }), 'Options `policy` must be array');
});

test('should throw error if `policy` option not have `userAgent` option', (t) => {
    t.throws(generateRobotstxt({
        policy: [{}]
    }), 'Each `police` should have single string `userAgent` option');
});

test('should throw error if `policy` option have array `userAgent` option', (t) => {
    t.throws(generateRobotstxt({
        policy: [{
            userAgent: []
        }]
    }), 'Each `police` should have single string `userAgent` option');
});

test('should `contain `Sitemap`',
    (t) => generateRobotstxt({
        sitemap: 'sitemap.xml'
    })
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\nSitemap: sitemap.xml\n');
        })
);

test('should `contain two `Sitemap`',
    (t) => generateRobotstxt({
        sitemap: [
            'sitemap.xml',
            'sitemap1.xml'
        ]
    })
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\nSitemap: sitemap.xml\nSitemap: sitemap1.xml\n');
        })
);

test('should `contain `Host`',
    (t) => generateRobotstxt({
        host: 'http://domain.com'
    })
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\nHost: domain.com\n');
        })
);

test('should `contain `Host` without trailing slash',
    (t) => generateRobotstxt({
        host: 'http://domain.com/'
    })
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\nHost: domain.com\n');
        })
);

test('should `contain `Host` in punycode format',
    (t) => generateRobotstxt({
        host: 'интернет-магазин.рф'
    })
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\nHost: xn----8sbalhasbh9ahbi6a2ae.xn--p1ai\n');
        })
);

test('should `contain `Host` without `80` port',
    (t) => generateRobotstxt({
        host: 'domain.com:80'
    })
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\nHost: domain.com\n');
        })
);

test('should `contain `Host` if `host` options without protocol scheme',
    (t) => generateRobotstxt({
        host: 'www.domain.com'
    })
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\nHost: www.domain.com\n');
        })
);

test('should throw error on invalid `host` option',
    (t) => t.throws(generateRobotstxt({
        host: '?:foobar'
    }), 'Option `host` does not contain correct host')
);

test('should throw error if `host` being IP address version 4',
    (t) => t.throws(generateRobotstxt({
        host: '127.0.0.1'
    }), 'Options `host` should be not IP address')
);

test('should throw error if `host` being IP address version 6',
    (t) => t.throws(generateRobotstxt({
        host: '0:0:0:0:0:0:7f00:1'
    }), 'Options `host` should be not IP address')
);

test('should `contain `Host` with `https` scheme',
    (t) => generateRobotstxt({
        host: 'https://domain.com'
    })
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\nHost: https://domain.com\n');
        })
);

test('should `contain `Host` without any extra URL entire',
    (t) => generateRobotstxt({
        host: 'http://www.domain.com:8080/foo/bar/foobar.php?foo=bar#foobar'
    })
        .then((content) => {
            t.is(content, 'User-agent: *\nAllow: /\nHost: www.domain.com:8080\n');
        })
);

test('should throw error if `Host` option is array', (t) => {
    t.throws(generateRobotstxt({
        host: [
            'http://domain.com',
            'http://domain1.com'
        ]
    }), 'Options `host` must be `string` and single');
});

test('should `contain multiple `User-agent` and `Crawl-delay`',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            crawlDelay: 10,
            userAgent: 'Google'
        }, {
            allow: '/',
            crawlDelay: 0.5,
            userAgent: 'Yandex'
        }]
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: Google\nAllow: /\nCrawl-delay: 10\n\nUser-agent: Yandex\nAllow: /\nCrawl-delay: 0.5\n'
            );
        })
);

test('should throw error on invalid `crawlDelay` option', (t) => {
    t.throws(generateRobotstxt({
        policy: [{
            allow: '/',
            crawlDelay: 'foo',
            userAgent: 'Google'
        }]
    }), 'Option `crawlDelay` must be integer or float');
});

test('should `contain one policy item with one `Clean-param`',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            cleanParam: 's /forum/showthread.php',
            userAgent: 'Yandex'
        }]
    })
        .then((content) => {
            t.is(content, 'User-agent: Yandex\nAllow: /\nClean-param: s /forum/showthread.php\n');
        })
);

test('should `contain one policy item with two `Clean-params`',
    (t) => generateRobotstxt({
        policy: [{
            allow: '/',
            cleanParam: [
                's /forum/showthread.php',
                'ref /forum/showthread.php'
            ],
            userAgent: 'Yandex'
        }]
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: Yandex\nAllow: /\n'
                    + 'Clean-param: s /forum/showthread.php\n'
                    + 'Clean-param: ref /forum/showthread.php\n'
            );
        })
);

test('should throw error if `cleanParam` option more than 500 characters', (t) => {
    t.throws(generateRobotstxt({
        policy: [{
            allow: '/',
            cleanParam: new Array(502).join('a'),
            userAgent: 'Yandex'
        }]
    }), 'Option `cleanParam` should be less or equal 500 characters');
});

test('should throw error if item in `cleanParam` option more than 500 characters', (t) => {
    t.throws(generateRobotstxt({
        policy: [{
            allow: '/',
            cleanParam: [new Array(502).join('a')],
            userAgent: 'Yandex'
        }]
    }), 'String in `cleanParam` option should be less or equal 500 characters');
});

test('should throw error if `cleanParam` option not string or array', (t) => {
    t.throws(generateRobotstxt({
        policy: [{
            allow: '/',
            cleanParam: {},
            userAgent: 'Yandex'
        }]
    }), 'Option `cleanParam` should be string or array');
});

test('should throw error if item in `cleanParam` option not string', (t) => {
    t.throws(generateRobotstxt({
        policy: [{
            allow: '/',
            cleanParam: [{}],
            userAgent: 'Yandex'
        }]
    }), 'String in `cleanParam` option should be string');
});

test('should load config file',
    (t) => generateRobotstxt({
        configFile: `${fixturesPath}/config.js`
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: *\nAllow: /\nHost: some-domain.com\n'
            );
        })
);

test('should load commonjs config file',
    (t) => generateRobotstxt({
        configFile: `${fixturesPath}/config-commonjs.js`
    })
        .then((content) => {
            t.is(
                content,
                'User-agent: *\nAllow: /\nHost: some-some-domain.com\n'
            );

            return content;
        })
);
