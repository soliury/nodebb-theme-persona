$(document).ready(function () {
    $(window).on('action:share.addHandlers', addShare);


    require(['viteBridge', 'qrcode'], function (module, QRCode) {
        var QR_SETTING = {
            size: 400,
            minVersion: 8,
            background: '#fff',
            radius: 0.5,
            image: '/plugins/nodebb-theme-persona-vite/static/qrcode_addr.png',
            mSize: 0.15,
            ecLevel: QRCode.ecLevel.QUARTILE,
            mode: QRCode.modes.DRAW_WITH_IMAGE_BOX
        }

        var ViteBridge = module.default;

        var bridge = new ViteBridge({
            readyCallback: ()=> {
                alert('ready');
            },
            selfDefinedMethods: ['app.setWebTitle', 'wallet.currentAddress', 'wallet.sendTxByURI']
        });
        $(window).on('action:ajaxify.end', renderQR);
        $(window).on('action:topic.loaded', renderPostQR);
        $(window).on('action:posts.loaded', renderPostQR);

        function renderQR(event, data) {
            if (data.tpl_url === 'account/profile' && data.url && data.url.indexOf('user') === 0) {
                var customFields = ajaxify.data.customFields || {}
                if (customFields.vite_addr) {
                    if (bridge._ready) {
                        openModal(customFields.vite_addr);
                    } else {
                        popoverInit(function () {
                            var qrCode = new QRCode.qrcode(document.getElementById('vite-addr-qrcode-canvas'));
                            qrCode.generate(qrStringify(customFields.vite_addr), QR_SETTING);
                        });
                    }
                }
            }
        }

        function renderPostQR(e, data) {
            if (data.posts && data.posts.length) {
                if (bridge._ready) {
                    // If open on mobile wallet
                    openModal();
                } else {
                    popoverInit(function () {
                        var qrCode = new QRCode.qrcode(document.getElementById('vite-addr-qrcode-canvas'));
                        qrCode.generate(qrStringify($(this).attr('data-address')), QR_SETTING);
                    })
                }
            }
        }

        function qrStringify(address, amount, data) {
            data = data || {};
            amount = amount || 1;
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
            return 'vite:' + address + '?amount=' + amount + '&data=' + Base64.toBase64(JSON.stringify(data || ''), true);
        }

        function sendTx(address, amount, data) {
            console.log(qrStringify(address, amount, data))
            return bridge['wallet.currentAddress']()
              .then(function (currentAddress) {
                  return bridge['wallet.sendTxByURI']({
                      uri: qrStringify(address, amount, data),
                      address: currentAddress
                  })
              })
              // .then(function (e) {
              //     app.alert({message: '[[vite:vite-reward-success]]'})
              // })
        }

        function openModal() {
            // If open on mobile wallet
            var rewardAmount = 1;
            var modal = $('.vite-reward-modal').modal({
                show: false
            });
            var address;

            $('.vite-reward-modal-range').rangeslider({
                polyfill: false
            }).on('input', function (e) {
                rewardAmount = e.target.value;
                modal.find('.modal-title > strong').text(rewardAmount);
            });

            var onSubmit = function () {
                sendTx(modal.find('.modal-body strong.address').text(), rewardAmount)
                  .then(function () {
                      modal.modal('hide');
                  })
                  .catch(function (e) {
                      app.alert({
                          message: e,
                          type: 'danger'
                      })
                  });
            };

            modal.on('shown.bs.modal', function () {
                $('.vite-reward-modal-range').rangeslider('update', true);
                modal.find('.modal-body strong.address').text(address);

                $(this).find('.modal-footer .submit').on('click', onSubmit);
            });

            modal.on('hidden.bs.modal', function () {
                $(this).find('.modal-footer .submit').off('click', onSubmit);
            });


            $('.qrcode-popover').on('click', function () {
                modal.modal('show');
                address = $(this).attr('data-address');
                modal.find('.modal-body strong.username').text($(this).attr('data-username'));
            });
        }
    })


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
})
