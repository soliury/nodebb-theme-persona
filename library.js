'use strict';

var striptags = require('striptags');
var mediumToMarkdown = require('./src/medium');
var meta = require.main.require('./src/meta');
var User = require.main.require('./src/user');
var db = require.main.require('./src/database');
var vitePush = require('./src/vitePush');
var _ = require('lodash')


var library = {};
var allUsers = [];

library.init = function(params, callback) {
	var app = params.router;
	var middleware = params.middleware;

	app.get('/admin/plugins/persona', middleware.admin.buildHeader, renderAdmin);
	app.get('/api/admin/plugins/persona', renderAdmin);

	callback();
};

library.addAdminNavigation = function(header, callback) {
	header.plugins.push({
		route: '/plugins/persona',
		icon: 'fa-paint-brush',
		name: 'Persona Theme'
	});

	callback(null, header);
};

library.getTeasers = function(data, callback) {
	data.teasers.forEach(function(teaser) {
		if (teaser && teaser.content) {
			teaser.content = striptags(teaser.content, ['img']);
		}
	});
	callback(null, data);
};

library.defineWidgetAreas = function(areas, callback) {
	areas = areas.concat([
		{
			name: "Categories Sidebar",
			template: "categories.tpl",
			location: "sidebar"
		},
		{
			name: "Category Sidebar",
			template: "category.tpl",
			location: "sidebar"
		},
		{
			name: "Topic Sidebar",
			template: "topic.tpl",
			location: "sidebar"
		},
		{
			name: "Categories Header",
			template: "categories.tpl",
			location: "header"
		},
		{
			name: "Category Header",
			template: "category.tpl",
			location: "header"
		},
		{
			name: "Topic Header",
			template: "topic.tpl",
			location: "header"
		},
		{
			name: "Categories Footer",
			template: "categories.tpl",
			location: "footer"
		},
		{
			name: "Category Footer",
			template: "category.tpl",
			location: "footer"
		},
		{
			name: "Topic Footer",
			template: "topic.tpl",
			location: "footer"
		}
	]);

	callback(null, areas);
};

library.getThemeConfig = function(config, callback) {
	meta.settings.get('persona', function(err, settings) {
		config.hideSubCategories = settings.hideSubCategories === 'on';
		config.hideCategoryLastPost = settings.hideCategoryLastPost === 'on';
		config.enableQuickReply = settings.enableQuickReply === 'on';
		callback(null, config);
	});
};

function renderAdmin(req, res, next) {
	res.render('admin/plugins/persona', {});
}

library.addUserToTopic = function(data, callback) {
	if (data.req.user) {
		User.getUserData(data.req.user.uid, function(err, userdata) {
			if (err) {
				return callback(err);
			}

			data.templateData.loggedInUser = userdata;
			callback(null, data);
		});
	} else {
		data.templateData.loggedInUser =  {
			uid: 0,
			username: '[[global:guest]]',
			picture: User.getDefaultAvatar(),
			'icon:text': '?',
			'icon:bgColor': '#aaa',
		};
		callback(null, data);
	}
};

library.getLinkTags = function (data, callback) {
	data.links.push({
		rel: 'prefetch stylesheet',
		type: '',
		href: 'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
	});

	callback(null, data);
};

library.getSocialPosts = function (networks, callback) {
    [
        {
            id: 'weibo',
            name: 'Weibo',
            class: 'fa-weibo',
        },
        {
            id: 'wechat',
            name: 'Wechat',
            class: 'fa-weixin',
        },
        {
            id: 'qq',
            name: 'QQ',
            class: 'fa-qq',
        },
    ].forEach(item => {
    	networks.push(item)
	})
	callback(null, networks)
}

library.ready = function () {
	var ws = vitePush.createWSClient();
	var initMsg = function () {
        vitePush.getAllUser(function (err, userList) {
            if (err) {
                return;
            }
            allUsers = userList;
            if (ws.active) {
                ws.send(JSON.stringify({
                    name: 'forum-reward-rule',
                    toAddress: userList.filter(function (item) {
						return item && item.viteAddress
                    }).map(function (item) {
                        return item.viteAddress
                    }),
                    dataInclude: ['forum-reward']
                }))
			}
        })
	}
	setInterval(function () {
		initMsg();
    }, 1000 * 30);

	if (ws.active) {
		initMsg();
	} else {
		ws.onopen = function () {
            initMsg();
        };
	}
	ws.onmessage = function (data) {
		console.log(data);
        var jsondata;
        try {
            jsondata = JSON.parse(data);
        }
        catch (err) {
            console.log(err);
        }

        if (jsondata.type === 'forum-reward-rule') {
            var block = jsondata.data;
            var toAddress = block.toAddress
            if (toAddress) {
                var cuser = _.find(allUsers, {viteAddress: toAddress});
                cuser && vitePush.sendRewardPush(cuser, block)
            }
        }
    }
}

library.getNotificationTypes = function (data, callback) {
	callback(null, {
        privilegedTypes: data.privilegedTypes.slice(),
        types: data.types.concat(['notificationType_new-vite-reward'])
    })
}

library.createTopicFilter = function (topicData, callback) {
	var topic = topicData.topic;
	var data = topicData.data;
	var content = data.content.trim();
	if (/^https:\/\/medium\.com\/[\w \.-]*\/[^\s]*$/.test(content)) {
        mediumToMarkdown(content)
          .then(function (ob) {
              data.content = ob.content;
              topic.title = ob.title;
              callback(null, Object.assign({}, topicData, {
              	data,
				topic
			  }));
          })
		  .catch(function (err) {
			  callback(err);
          })
	}
}

module.exports = library;
