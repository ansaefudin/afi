(function() {
    "use strict";

    $(document).ready(function() {
        QUnit.module("CtaButtons");

        QUnit.test("render", function(assert) {
            var ctaContainer = $("<div class='jsCtaContainer cta--1'><div>Test</div></div>");
            $("body").append(ctaContainer);

            CtaButtons.render({
                "button1": {
                    "card": "d1b4d742",
                    "label": "Contact",
                    "icon": "contact"
                },
                "button2": {
                    "card": "d1b4d742",
                    "label": "Website",
                    "icon": "website"
                },
                "button3": {
                    "card": "d1b4d742",
                    "label": "Email",
                    "icon": "email"
                },
                "button4": {
                    "card": "d1b4d742",
                    "label": "Save",
                    "icon": "save"
                },
                "button5": {
                    "url": "http://example.com/",
                    "label": "Share",
                    "icon": "share"
                }
            });

            var buttons = $(".jsCtaButton");
            assert.equal(5, buttons.length);

            assert.equal("button1", $(buttons[0]).data("button"));
            assert.equal("button2", $(buttons[1]).data("button"));
            assert.equal("button3", $(buttons[2]).data("button"));
            assert.equal("button4", $(buttons[3]).data("button"));
            assert.equal("button5", $(buttons[4]).data("button"));

            var icons = $(".jsCtaIcon");

            assert.ok($(icons[0]).hasClass("cta__icon--contact"));
            assert.ok($(icons[1]).hasClass("cta__icon--website"));
            assert.ok($(icons[2]).hasClass("cta__icon--email"));
            assert.ok($(icons[3]).hasClass("cta__icon--save"));
            assert.ok($(icons[4]).hasClass("cta__icon--share"));

            var labels = $(".cta__label");
            assert.equal("Contact", $(labels[0]).text());
            assert.equal("Website", $(labels[1]).text());
            assert.equal("Email", $(labels[2]).text());
            assert.equal("Save", $(labels[3]).text());
            assert.equal("Share", $(labels[4]).text());

            assert.notOk(ctaContainer.hasClass("cta--1"));
            assert.ok(ctaContainer.hasClass("cta--5"));

            ctaContainer.remove();
        });
    });
})();
