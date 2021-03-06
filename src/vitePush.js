var Base64 = require('js-base64').Base64;
var BigNumber = require('bignumber.js');
const uuidv4 = require('uuid/v4');
var notifications = require.main.require('./src/notifications');
var db = require.main.require('./src/database');
var async = require.main.require('async');
var WS = require('./ws');

var wsc = new WS();

var createObjectKey = function (uid) {
    return 'user:' + uid + ':ns:custom_fields';
};

function parseAmount (amount) {
    var t = new BigNumber(amount);
    return t.dividedBy(1e+18).toFixed(2);
}

exports.sendRewardPush = function (user, tx) {
    var markupdata = Base64.decode(tx.data);
    try {
        markupdata = JSON.parse(markupdata)
        console.log(markupdata);
        var body = '[[notifications:new-vite-reward, ' + markupdata.uname + ', ' + parseAmount(tx.amount) + ']]';
        console.log(body);
        async.waterfall([
            function (next) {
                notifications.create({
                    type: 'new-vite-reward',
                    bodyShort: body,
                    nid: 'new-vite-reward:' + tx.hash,
                    path: markupdata.from ? '/user/' + markupdata.from : markupdata.url,
                    from: markupdata.uid,
                    subject: '[[notifications:new-vite-reward-subject, ' + markupdata.uname + ', ' + parseAmount(tx.amount) + ']]',
                }, next);
            },
            function (notification, next) {
                notifications.push(notification, user.uid, next);
            },
        ], function (err) {
            console.log(err)
        });
    } catch (e) {
        console.log(e)
    }
}

function getAllUser (callback) {
    db.getSortedSetRange('users:joindate', 0, -1, function (err, uids) {
        // Get their custom_field
        // User.getUsersWithFields(uids, ['username'], 0, function (err, users) {
        //     console.log(users)
        // })
        db.getObjects(uids.map(function (uid) {
            return createObjectKey(uid)
        }), function (err, data) {
            if (!err) {
                var userList = data.map(function (item, index) {
                    if (item && item.vite_addr) {
                        return {
                            uid: uids[index],
                            viteAddress: item.vite_addr
                        }
                    }
                    return {
                        uid: uids[index],
                        viteAddress: null
                    }
                })
                callback(null, userList)
            } else {
                callback(err)
            }
        });
    });
}

exports.createWSClient = function () {
    // wsc.open('ws://192.168.31.147:8080/dev/websocket/wangmiantest');
    wsc.open('ws://150.109.32.175:8080/websocket/' + uuidv4());
    return wsc;
}

exports.getAllUser = getAllUser;
