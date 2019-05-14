(function() {
    "use strict";

    $(document).ready(function() {
        QUnit.module("Timeline");

        QUnit.test("render", function(assert) {
            sinon.spy(ContrastProgress, "updateLabels");

            Timeline.render([
                {
                    "label": "Introduction",
                    "states": [
                        {
                            "cardId": "START",
                            "width": 10
                        }
                    ]
                },
                {
                    "label": "Your Account",
                    "states": [
                        {
                            "cardId": "77a834f0",
                            "width": 20
                        },
                        {
                            "cardId": "c23a68c9",
                            "width": 20
                        }
                    ]
                },
                {
                    "label": "Thank You",
                    "states": [
                        {
                            "cardId": "7b0123a5",
                            "width": 30
                        }
                    ]
                },
                {
                    "label": "Test",
                    "states": [
                        {
                            "cardId": "7b0123a5",
                            "width": 20
                        }
                    ]
                }
            ]);

            var chapters = $(".jsTimelineChapter");

            assert.equal(chapters.length, 4);
            assert.equal(chapters[0].children.length, 2);
            assert.equal(chapters[1].children.length, 3);
            assert.equal(chapters[2].children.length, 2);
            assert.equal(chapters[3].children.length, 2);

            var states = $(".jsTimelineState");

            assert.equal(states.length, 5);
            assert.equal(states.eq(0).data("percent-start"), 0);
            assert.equal(states.eq(0).data("percent-width"), 10);
            assert.equal(states.eq(0).data("state"), "START");
            assert.equal(states.eq(1).data("percent-start"), 10);
            assert.equal(states.eq(1).data("percent-width"), 20);
            assert.equal(states.eq(1).data("state"), "77a834f0");
            assert.equal(states.eq(2).data("percent-start"), 30);
            assert.equal(states.eq(2).data("percent-width"), 20);
            assert.equal(states.eq(2).data("state"), "c23a68c9");
            assert.equal(states.eq(3).data("percent-start"), 50);
            assert.equal(states.eq(3).data("percent-width"), 30);
            assert.equal(states.eq(3).data("state"), "7b0123a5");
            assert.equal(states.eq(4).data("percent-start"), 80);
            assert.equal(states.eq(4).data("percent-width"), 20);
            assert.equal(states.eq(4).data("state"), "7b0123a5");

            var labels = $(".timeline-chapters__label");

            assert.equal(labels.length, 4);
            assert.equal(labels.eq(0).text(), "Introduction");
            assert.equal(labels.eq(1).text(), "Your Account");
            assert.equal(labels.eq(2).text(), "Thank You");
            assert.equal(labels.eq(3).text(), "Test");

            assert.ok(ContrastProgress.updateLabels.called);

            $("#jsTimelineContainer").empty();
        });
    });
})();
