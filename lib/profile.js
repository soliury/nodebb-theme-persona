$(document).ready(function () {
    $(window).on('action:ajaxify.end', renderQR);
    $(window).on('action:share.addHandlers', addShare);
    $(window).on('action:topic.loaded', renderPostQR);
    $(window).on('action:posts.loaded', renderPostQR);

    function renderQR(event, data) {
        if (data.tpl_url === 'account/profile' && data.url && data.url.indexOf('user') === 0) {
            var customFields = ajaxify.data.customFields || {}
            if (customFields.vite_addr) {
                require(['qrcode'], function (QRCode) {
                    $('.qrcode-popover').popover({
                        container: 'body',
                        content: '<canvas id="vite-addr-qrcode-canvas" style="height: 150px; width: 150px; cursor: pointer;"></canvas>',
                        trigger: 'hover',
                        html: true,
                        placement: 'auto'
                    }).on('shown.bs.popover', function () {
                        var qrCode = new QRCode.qrcode(document.getElementById('vite-addr-qrcode-canvas'));

                        var qrCodeSetting = {
                            size: 400,
                            ecLevel: QRCode.ecLevel.QUARTILE,
                            minVersion: 8,
                            background: '#fff',
                            mode: QRCode.modes.DRAW_WITH_IMAGE_BOX,
                            radius: 0.5,
                            image: '/plugins/nodebb-theme-persona-vite/static/qrcode_addr.png',
                            mSize: 0.15,
                        };
                        qrCode.generate(qrStringify(customFields.vite_addr), qrCodeSetting)
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
        return 'vite:' + address + '?amount=1&data=' + JSON.stringify(JSON.stringify(data || ''));
    }

    function renderPostQR(e, data) {
        if (data.posts && data.posts.length) {
            require(['qrcode'], function (QRCode) {
                $('.qrcode-popover').popover({
                    container: 'body',
                    content: '<canvas id="vite-addr-qrcode-canvas" style="height: 150px; width: 150px; cursor: pointer;"></canvas>',
                    trigger: 'hover',
                    html: true,
                    placement: 'auto'
                }).on('shown.bs.popover', function () {
                    var qrCode = new QRCode.qrcode(document.getElementById('vite-addr-qrcode-canvas'));

                    var qrCodeSetting = {
                        size: 400,
                        ecLevel: QRCode.ecLevel.QUARTILE,
                        minVersion: 8,
                        background: '#fff',
                        mode: QRCode.modes.DRAW_WITH_IMAGE_BOX,
                        radius: 0.5,
                        image: '/plugins/nodebb-theme-persona-vite/static/qrcode_addr.png',
                        mSize: 0.15,
                    };
                    qrCode.generate(qrStringify($(this).attr('data-address')), qrCodeSetting)
                })
            });
        }
    }
})
