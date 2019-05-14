(function() {
    "use strict";

    $(document).ready(function() {
        QUnit.module("Promos");

        QUnit.test("render", function(assert) {
            var desktopContainer = $("<div id='jsPromoContainerDesktop' class='jsPromoContainer'><div>Test</div></div>"),
                mobileContainer = $("<div id='jsPromoContainerMobile' class='jsPromoContainer'><div>Test</div></div>");

            $("body").append(desktopContainer);
            $("body").append(mobileContainer);

            Promos.render({
                "promo1": {
                    "trackingName": "promo1",
                    "url": "http://example.com/",
                    "label": "Promo (Top)",
                    "desktopImage": "./images/promo_portrait.png",
                    "mobileImage": "./images/promo_landscape.png"
                },
                "promo2": {
                    "trackingName": "promo2",
                    "url": "http://example.com/",
                    "label": "Promo (Bottom)",
                    "desktopImage": "./images/promo_portrait2.png",
                    "mobileImage": "./images/promo_landscape2.png"
                }
            });

            var desktopPromoItems = $("#jsPromoContainerDesktop .promo__item"),
                mobilePromoItems = $("#jsPromoContainerMobile .promo__item");

            assert.equal(2, desktopPromoItems.length);
            assert.ok($(desktopPromoItems[0]).hasClass("promo__item--1"));
            assert.ok($(desktopPromoItems[1]).hasClass("promo__item--2"));

            assert.equal(2, mobilePromoItems.length);
            assert.ok($(mobilePromoItems[0]).hasClass("promo__item--1"));
            assert.ok($(mobilePromoItems[1]).hasClass("promo__item--2"));

            var desktopPromoLinks = $("#jsPromoContainerDesktop .jsPromoLink"),
                mobilePromoLinks = $("#jsPromoContainerMobile .jsPromoLink");

            assert.equal("promo1", $(desktopPromoLinks[0]).data("promo"));
            assert.equal("promo2", $(desktopPromoLinks[1]).data("promo"));
            assert.equal("promo1", $(mobilePromoLinks[0]).data("promo"));
            assert.equal("promo2", $(mobilePromoLinks[1]).data("promo"));

            var desktopPromoImages = $("#jsPromoContainerDesktop .promo__image"),
                mobilePromoImages = $("#jsPromoContainerMobile .promo__image");

            assert.ok($(desktopPromoImages[0]).css("background-image").match(/promo_portrait\.png/) !== null);
            assert.ok($(mobilePromoImages[0]).css("background-image").match(/promo_landscape\.png/) !== null);
            assert.ok($(desktopPromoImages[1]).css("background-image").match(/promo_portrait2\.png/) !== null);
            assert.ok($(mobilePromoImages[1]).css("background-image").match(/promo_landscape2\.png/) !== null);

            var desktopPromoLabels = $("#jsPromoContainerDesktop .promo__label"),
                mobilePromoLabels = $("#jsPromoContainerMobile .promo__label");

            assert.equal("Promo (Top)", $(desktopPromoLabels[0]).text());
            assert.equal("Promo (Bottom)", $(desktopPromoLabels[1]).text());
            assert.equal("Promo (Top)", $(mobilePromoLabels[0]).text());
            assert.equal("Promo (Bottom)", $(mobilePromoLabels[1]).text());

            desktopContainer.remove();
            mobileContainer.remove();
        });

        QUnit.test("click - with iframe", function(assert) {
            var originalSettings = Promos.SettingsJsonObject,
                originalIframe = VideoPlayerInterface.iframeWindow;

            Promos.SettingsJsonObject = {
                "promo1": {
                    "trackingName": "promo1",
                    "url": "http://example.com/"
                }
            };

            VideoPlayerInterface.iframeWindow = {
                rtc: {
                    utils: {
                        track: sinon.stub()
                    }
                }
            };
            sinon.stub(VideoPlayerInterface.actions, "pause");
            sinon.stub(window, "open");

            Promos.click("promo1");

            assert.ok(VideoPlayerInterface.actions.pause.called);
            assert.ok(VideoPlayerInterface.iframeWindow.rtc.utils.track.calledWith(
                "promo.click",
                JSON.stringify(Promos.SettingsJsonObject.promo1)
            ));
            assert.ok(window.open.calledWith(Promos.SettingsJsonObject.promo1.url));

            VideoPlayerInterface.actions.pause.restore();
            window.open.restore();
            VideoPlayerInterface.iframeWindow = originalIframe;
            Promos.SettingsJsonObject = originalSettings;
        });

        QUnit.test("click - without iframe", function(assert) {
            var originalSettings = Promos.SettingsJsonObject,
                originalIframe = VideoPlayerInterface.iframeWindow;

            Promos.SettingsJsonObject = {
                "promo1": {
                    "trackingName": "promo1",
                    "url": "http://example.com/"
                }
            };

            VideoPlayerInterface.iframeWindow = null;
            sinon.stub(window, "open");

            Promos.click("promo1");

            assert.ok(window.open.calledWith(Promos.SettingsJsonObject.promo1.url));

            window.open.restore();
            VideoPlayerInterface.iframeWindow = originalIframe;
            Promos.SettingsJsonObject = originalSettings;
        });
    });
})();
