(function() {
    "use strict";

    $(document).ready(function() {
        QUnit.module("Utils");

        QUnit.test("userAgentInList", function(assert) {
            var list = [
                /ipad/,
                /iphone/,
                /ipod/,
                /android(?!.*?mobile)/,
                /android.*?mobile/,
                /blackberry/,
                /windows ce/,
                /iemobile/,
                /webos/,
                /playbook/
            ];

            assert.notOk(Utils.userAgentInList("", list));
            assert.notOk(Utils.userAgentInList("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36", list));
            assert.notOk(Utils.userAgentInList("Mozilla/5.0 (Windows NT 6.1; WOW64; Trident/7.0; AS; rv:11.0) like Gecko", list));

            assert.ok(Utils.userAgentInList("Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1", list));
            assert.ok(Utils.userAgentInList("Mozilla/5.0 (Linux; Android 5.1.1; Nexus 6 Build/LYZ28E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Mobile Safari/537.36", list));
            assert.ok(Utils.userAgentInList("Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Mobile Safari/537.36", list));
            assert.ok(Utils.userAgentInList("Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 520)", list));
        });
    });
})();
