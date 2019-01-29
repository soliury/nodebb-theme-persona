$(document).ready(function () {
    $(window).on('action:ajaxify.end', renderQR);
    $(window).on('action:share.addHandlers', addShare);
    $(window).on('action:topic.loaded', renderPostQR);
    $(window).on('action:posts.loaded', renderPostQR);

    var QR_SETTING = {
        size: 400,
        minVersion: 8,
        background: '#fff',
        radius: 0.5,
        image: '/plugins/nodebb-theme-persona-vite/static/qrcode_addr.png',
        mSize: 0.15,
    }


    function renderQR(event, data) {
        if (data.tpl_url === 'account/profile' && data.url && data.url.indexOf('user') === 0) {
            var customFields = ajaxify.data.customFields || {}
            if (customFields.vite_addr) {
                require(['qrcode'], function (QRCode) {
                    popoverInit(function () {
                        var qrCode = new QRCode.qrcode(document.getElementById('vite-addr-qrcode-canvas'));

                        qrCode.generate(qrStringify(customFields.vite_addr), Object.assign({
                            ecLevel: QRCode.ecLevel.QUARTILE,
                            mode: QRCode.modes.DRAW_WITH_IMAGE_BOX,
                        }, QR_SETTING))
                    })
                });
            }
        }
    }

    function addShare(e, data) {
        var openShare = data.openShare
        var title = document.title
        addHandler('[component="share/weibo"]', function () {
            return openShare('http://v.t.sina.com.cn/share/share.php?title='+ title +'&url=', getPostUrl($(this)), 500, 570);
        });
        addHandler('[component="share/wechat"]', function () {
            return openShare('https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=', getPostUrl($(this)), 500, 570);
        });
        addHandler('[component="share/qq"]', function () {
            return openShare('http://connect.qq.com/widget/shareqq/index.html?title=' + title + '&url=', getPostUrl($(this)), 500, 570);
        });
    }

    function popoverInit(callback) {
        $('.qrcode-popover').popover({
            container: 'body',
            content: '<canvas id="vite-addr-qrcode-canvas" style="height: 150px; width: 150px; cursor: pointer;"></canvas>',
            trigger: 'hover',
            html: true,
            placement: 'auto'
        }).on('shown.bs.popover', callback)
    }

    function getPostUrl(clickedElement) {
        var pid = parseInt(clickedElement.parents('[data-pid]').attr('data-pid'), 10);
        return '/post' + (pid ? '/' + (pid) : '');
    }

    function addHandler(selector, callback) {
        $('#content').off('click', selector).on('click', selector, callback);
    }

    function qrStringify(address, data) {
        data = data || {}
        data = Object.assign({}, data, {
            type: 'forum-reward',
            from: app.user.userslug,
            uid: app.user.uid,
            uname: app.user.username
        })
        if (!data.from) {
            data = Object.assign(data, {
                url: location.pathname
            })
        }
        return 'vite:' + address + '?amount=1&data=' + Base64.toBase64(JSON.stringify(data || ''), true);
    }

    function renderPostQR(e, data) {
        if (data.posts && data.posts.length) {
            require(['qrcode'], function (QRCode) {
                popoverInit(function () {
                    var qrCode = new QRCode.qrcode(document.getElementById('vite-addr-qrcode-canvas'));
                    qrCode.generate(qrStringify($(this).attr('data-address')), Object.assign({
                        ecLevel: QRCode.ecLevel.QUARTILE,
                        mode: QRCode.modes.DRAW_WITH_IMAGE_BOX,
                    }, QR_SETTING))
                })
            });
        }
    }
})
