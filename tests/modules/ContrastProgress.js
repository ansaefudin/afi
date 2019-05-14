(function() {
    "use strict";

    $(document).ready(function() {
        QUnit.module("ContrastProgress");

        QUnit.test("updateLabels - disabled", function(assert) {
            $("#jsTimelineContainer").append("<div id='jsTimelineContrastFixed'><div id='test'></div></div>");

            ContrastProgress.enabled = false;
            ContrastProgress.updateLabels();

            assert.ok($("#jsTimelineContrastFixed").children().length);

            $("#jsTimelineContainer").empty();
        });

        QUnit.test("updateLabels - enabled", function(assert) {
            $("#jsTimelineContainer").append("<div class='jsTimelineChapter'><div class='jsTimelineState'>Test1</div></div>");
            $("#jsTimelineContainer").append("<div class='jsTimelineChapter'><div class='jsTimelineState'>Test2</div></div>");

            $("#jsTimelineContainer").append("<div id='jsTimelineContrastFixed'><div id='test'></div></div>");

            ContrastProgress.enabled = true;
            ContrastProgress.updateLabels();

            assert.equal($("#jsTimelineContrastFixed").children().length, 2);

            assert.equal($("#jsTimelineContrastFixed").children()[0].children.length, 1);
            assert.equal($("#jsTimelineContrastFixed").children()[0].children[0].innerHTML, "Test1");

            assert.equal($("#jsTimelineContrastFixed").children()[1].children.length, 1);
            assert.equal($("#jsTimelineContrastFixed").children()[1].children[0].innerHTML, "Test2");

            $("#jsTimelineContainer").empty();
        });
    });
})();
