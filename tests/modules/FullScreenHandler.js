(function() {
    "use strict";

    $(document).ready(function() {
        QUnit.module("FullScreenHandler");

        QUnit.test("initialise - enabled and supported", function(assert) {
            var eventInit = sinon.stub(FullScreenHandler.events, "initialise"),
                handleResize = sinon.stub(FullScreenHandler.events, "handleResize");

            Timeline.SettingsJsonObject.FullScreenEnabled = true;
            Modernizr.fullscreen = true;
            FullScreenHandler.initialise();

            assert.ok(eventInit.called);
            assert.ok(handleResize.called);

            eventInit.restore();
            handleResize.restore();
        });

        QUnit.test("initialise - enabled but not supported", function(assert) {
            var eventInit = sinon.stub(FullScreenHandler.events, "initialise"),
                handleResize = sinon.stub(FullScreenHandler.events, "handleResize");

            Timeline.SettingsJsonObject.FullScreenEnabled = true;
            Modernizr.fullscreen = false;
            FullScreenHandler.initialise();

            assert.notOk(eventInit.called);
            assert.notOk(handleResize.called);

            eventInit.restore();
            handleResize.restore();
        });

        QUnit.test("initialise - not enabled", function(assert) {
            var eventInit = sinon.stub(FullScreenHandler.events, "initialise"),
                handleResize = sinon.stub(FullScreenHandler.events, "handleResize");

            Timeline.SettingsJsonObject.FullScreenEnabled = false;
            FullScreenHandler.initialise();

            assert.notOk(eventInit.called);
            assert.notOk(handleResize.called);

            eventInit.restore();
            handleResize.restore();
        });

        QUnit.test("disable", function(assert) {
            var fullScreenBtn = $("<div id='jsFullScreenButton'></div>"),
                timelineRight = $("<div id='jsTimelineControlsRight'></div>");

            $("body").append(fullScreenBtn);
            $("body").append(timelineRight);

            FullScreenHandler.disable();

            assert.equal(fullScreenBtn.parent().length, 0);
            assert.ok(timelineRight.hasClass("timeline__controls--right-no-fs"));

            timelineRight.remove();
        });

        QUnit.test("isActive", function(assert) {
            assert.notOk(FullScreenHandler.isActive());

            $("html").addClass("fullscreen");
            assert.ok(FullScreenHandler.isActive());

            $("html").removeClass("fullscreen");
        });

        QUnit.test("isRatioNarrowerThan", function(assert) {
            assert.notOk(FullScreenHandler.isRatioNarrowerThan([16, 9], [16, 9]));
            assert.notOk(FullScreenHandler.isRatioNarrowerThan([18, 9], [16, 9]));
            assert.notOk(FullScreenHandler.isRatioNarrowerThan([2.35, 1], [16, 9]));
            assert.notOk(FullScreenHandler.isRatioNarrowerThan([2.76, 1], [16, 9]));

            assert.ok(FullScreenHandler.isRatioNarrowerThan([5, 3], [16, 9]));
            assert.ok(FullScreenHandler.isRatioNarrowerThan([16, 10], [16, 9]));
            assert.ok(FullScreenHandler.isRatioNarrowerThan([1.43, 1], [16, 9]));
            assert.ok(FullScreenHandler.isRatioNarrowerThan([4, 3], [16, 9]));
            assert.ok(FullScreenHandler.isRatioNarrowerThan([1, 1], [16, 9]));
        });

        QUnit.test("toggle", function(assert) {
            var enterFullScreen = sinon.stub(FullScreenHandler, "enterFullScreen"),
                exitFullScreen = sinon.stub(FullScreenHandler, "exitFullScreen");

            FullScreenHandler.toggle();
            assert.ok(enterFullScreen.called);
            assert.notOk(exitFullScreen.called);

            enterFullScreen.reset();
            exitFullScreen.reset();
            $("html").addClass("fullscreen");

            FullScreenHandler.toggle();
            assert.notOk(enterFullScreen.called);
            assert.ok(exitFullScreen.called);

            $("html").removeClass("fullscreen");
            enterFullScreen.restore();
            exitFullScreen.restore();
        });

        QUnit.test("events.toggleHtmlChanges", function(assert) {
            var fullScreenIcon = $("<div id='jsFullScreenIcon' class='timeline__button-icon--fullscreen'></div>"),
                socialIcons = $("<div id='jsSocialIconsTop'></div>");

            $("#jsTimelineContainer").append(fullScreenIcon);
            $("#jsHeader").append(socialIcons);

            FullScreenHandler.events.toggleHtmlChanges();

            assert.ok($("html").hasClass("fullscreen"));
            assert.ok(fullScreenIcon.hasClass("timeline__button-icon--fullscreen-in"));
            assert.notOk(fullScreenIcon.hasClass("timeline__button-icon--fullscreen"));
            assert.equal(socialIcons.parent()[0].id, "jsMain");

            FullScreenHandler.events.toggleHtmlChanges();

            assert.notOk($("html").hasClass("fullscreen"));
            assert.ok(fullScreenIcon.hasClass("timeline__button-icon--fullscreen"));
            assert.notOk(fullScreenIcon.hasClass("timeline__button-icon--fullscreen-in"));
            assert.equal(socialIcons.parent()[0].id, "jsHeader");

            fullScreenIcon.remove();
            socialIcons.remove();
        });

        QUnit.test("events.handleResize", function(assert) {
            var isRatioNarrowerThan = sinon.stub(FullScreenHandler, "isRatioNarrowerThan");
            isRatioNarrowerThan.onFirstCall().returns(false);
            isRatioNarrowerThan.onSecondCall().returns(true);

            FullScreenHandler.events.handleResize();
            assert.notOk($("html").hasClass("less-16-9"));

            FullScreenHandler.events.handleResize();
            assert.ok($("html").hasClass("less-16-9"));

            assert.ok(isRatioNarrowerThan.alwaysCalledWithExactly(
                [window.innerWidth, window.innerHeight],
                [16, 9]
            ));

            isRatioNarrowerThan.restore();
            $("html").removeClass("less-16-9");
        });
    });
})();
