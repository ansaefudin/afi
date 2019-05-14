function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}

if (!Object.keys) {
    Object.keys = function(obj) {
        var keys = [];

        for ( var i in obj) {
            if (obj.hasOwnProperty(i)) {
                keys.push(i);
            }
        }

        return keys;
    };
}

$(document).ready(function() {

    $("#jsDate").text(Utils.getFullYear());
    /**
     * Initialise the mobile orientation handler
     */
    MobileOrientationHandler.initialise();

    /**
     * Initialise timeline with settings defined in settings.js
     */
    Timeline.initialise(0, timelineSettings);

    /**
     * Initialise contrast progress bar with settings defined in settings.js
     */
    ContrastProgress.initialise(timelineSettings);

    /**
     * Initialise the social icons with settings defined in settings.js
     */
    SocialIcons.initialise(socialIconSettings);

    /**
     * Initialise cta buttons with settings defined in settings.js
     */
    CtaButtons.initialise();

    /**
     * Initialise promos with settings defined in settings.js
     */
    Promos.initialise();

    /**
     * Initialise volume slider
     */
    VolumeSlider.initialise();

    /**
     * Initialise language selector
     */
    LanguageSelector.initialise(languageSettings);

    /**
     * Initialise closed caption selector
     */
    ClosedCaptionSelector.initialise();

    /**
     * Initialise the fullscreen handler
     */
    FullScreenHandler.initialise();

    /**
     * Initialise video player interface and quality selector with settings defined in settings.js
     */
    VideoPlayerInterface.initialise();

    /**
     * Initialise the keyboard input controller
     */
    KeyboardInputController.initialise();
});

var Utils = {
    /**
     * Checks whether the current useragent is in the provided array of regular expressions
     * Taken in part from the jPlayer _uaBlocklist method.
     *
     * @param {string} userAgent     the current user agent
     * @param {array}  userAgentList the user agents (in the form of regular expressions) to check against
     *
     * @return {boolean} whether the current user agent is in the list
     */
    userAgentInList: function(userAgent, userAgentList) {
        var inList = false;
        userAgent = userAgent.toLowerCase();

        /**
         * Test each agent in the list against the one provided
         *
         * @param {number} index the array index
         * @param {string} agentExpression the regular expression to test
         */
        $.each(userAgentList, function testEachAgent(index, agentExpression) {
            if (agentExpression.test(userAgent)) {
                inList = true;
                return false;
            }
        });

        return inList;
    },

    getFullYear: function() {
        return (new Date()).getFullYear();
    }
};

var BufferStatus = {

    seenStates: [],

    initBuffer: function () {
        if(Timeline.SettingsJsonObject.BufferBarEnabled){
            BufferStatus.createBufferDivs();
        }
    },

    createBufferDivs: function () {
        var counter = 1;

        var bufferSectionHTMLTemplate =
            '<div id="jsBufferSection" class="timeline__buffer-section"> \
                <div id="jsSectionInner" class="timeline__buffer-section-inner"></div> \
            </div>';

        var bufferTimeline = $('#jsBufferTimeline');

        bufferTimeline.children().remove();

        $('.jsTimelineState').each(function () {
            var stateTemplate = $(bufferSectionHTMLTemplate).clone();
            var stateName = $(this).data('state');
            var stateWidth = $(this).data('percent-width');
            stateTemplate.attr('id', 'jsBufferSection'+counter);
            stateTemplate.data('interaction-id', stateName);
            stateTemplate.find('.timeline__buffer-section-inner').attr('id', 'jsSectionInner' + stateName);
            stateTemplate.css('width', stateWidth + "%");
            bufferTimeline.append(stateTemplate);
            counter++;
        });
        BufferStatus.applyBufferSettings();
    },

    applyBufferSettings: function () {
        var opacity = Timeline.SettingsJsonObject.BufferBarOpacity;
        var color = Timeline.SettingsJsonObject.BufferBarColor;
    },

    updateBuffer: function () {
        if(LanguageSelector.currentLanguageObj !== {}){
            try {
                var videoTimes = VideoPlayerInterface.iframeWindow.rtc.player.getVideoTimes(),
                    currentState = Timeline.getStateFromProgress(),
                    chapters = VideoPlayerInterface.getVideoChapters();

                //Checks if the video has reached the end and prevents the introduction buffer bar loading
                if(Timeline.getProgress() !== 1){
                    if(isInArray(currentState,BufferStatus.seenStates)){
                        $.each(chapters, function(state, chapter) {
                            if (videoTimes.buffered > chapter.start + chapter.duration) {
                                BufferStatus.updateStateBufferProgress(state, 100);
                            } else {
                                BufferStatus.updateStateBufferProgress(
                                    state,
                                    ((videoTimes.buffered - chapter.start) / chapter.duration) * 100
                                );
                            }
                        });
                    }
                }
                if(!isInArray(currentState,BufferStatus.seenStates)){
                    BufferStatus.seenStates.push(currentState);
                }
                BufferStatus.clearOldBuffers(currentState);
            } catch (e) {}
        }
    },

    clearOldBuffers: function (currentState) {
        for (var i=0; i < BufferStatus.seenStates.length; i++){
            var state = BufferStatus.seenStates[i];
            if(state !== currentState) {
                BufferStatus.updateStateBufferProgress(state,0);
            }
        }
    },

    //State is the id of the interaction card as a string.
    updateStateBufferProgress: function(state, percentage) {
        if (typeof state === "string"){
            $('#jsSectionInner'+state).css('width', percentage + "%");
        }
    }
};

var ClosedCaptionSelector = {

    initialise: function () {
        ClosedCaptionSelector.events.initialise();
        $('#jsCCOffTick').show();
        $('#jsCCOnTick').hide();
    },

    setClosedCaptions: function(value){
        var captionsOn = VideoPlayerInterface.iframeWindow.rtc.player.vars.showCaptions;
        if (value === 'on' && !captionsOn) {
            VideoPlayerInterface.iframeWindow.rtc.player.toggleCC();
            $('#jsCCOnTick').show();
            $('#jsCCOffTick').hide();
        } else if (value === 'off' && captionsOn) {
            VideoPlayerInterface.iframeWindow.rtc.player.toggleCC();
            $('#jsCCOffTick').show();
            $('#jsCCOnTick').hide();
        }
    },

    events: {
        /**
         * Link up the events and the event handlers
         */
        initialise: function() {
            $('#jsCCMenuTitle').click(ClosedCaptionSelector.events.closeCCMenu);
            $('.jsTimelineSettingsCaption').click(ClosedCaptionSelector.events.ccItemClickEventHandler);
        },

        closeCCMenu: function (e) {
            $('#jsSettingsButtonPopout').show();
            $('#jsCCSelectorPopout').hide();
            $("#jsCCMenuItem").focus();
        },

        ccItemClickEventHandler: function(e) {
            //off or on
            var newValue = $(this).data('value');
            ClosedCaptionSelector.setClosedCaptions(newValue);
        }
    }
};

var ContrastProgress = {
    enabled: false,

    initialise: function (timelineSettings){
        ContrastProgress.enabled = timelineSettings.ContrastProgressBarEnabled;

        if (ContrastProgress.enabled) {
            ContrastProgress.createContrastTimeline();
        }
    },

    createContrastTimeline: function (){
        ContrastProgress.cloneDivAppendTo("jsTimelineContainer", "jsTimelineContrast", "jsTimelineControlsCenter");
        $("#jsTimelineContrast").addClass("timeline-contrast");
        $("#jsTimelineProgressHover").addClass("timeline-contrast-hover");

        ContrastProgress.addFixedDiv();
    },

    cloneDivAppendTo: function (divId, newDivId, appendToDivID) {
        $('#' + divId).clone(true).prop('id', newDivId).appendTo('#' + appendToDivID);
    },

    addFixedDiv: function () {
        $("#jsTimelineContrast").wrapInner("<div id='jsTimelineContrastFixed'></div>");
        $("#jsTimelineContrastFixed").css('width', $("#jsTimelineContainer").width() + "px");
    },

    setContrastTimelineProgress: function (progress){
        $("#jsTimelineContrast").width($("#jsTimelineContainer").width() * progress);
    },

    /**
     * Update the labels used on the Contrast Progress bar, by cloning them into the contrast div
     */
    updateLabels: function() {
        if (!ContrastProgress.enabled) {
            return;
        }

        $("#jsTimelineContrastFixed").empty();

        /**
         * Append each timeline chapter to the contrast progress bar
         *
         * @param {number} i       the index
         * @param {jQuery} chapter the chapter element
         */
        $(".jsTimelineChapter").each(function appendChapterToContrast(i, chapter) {
            $(chapter).clone(true).appendTo("#jsTimelineContrastFixed");
        });
    }
};

var KeyboardInputController = {

    initialise: function () {
        KeyboardInputController.initKeyboardControls();
        KeyboardInputController.hideOutlines();
    },

    hideOutlines: function () {
        $('a[href], area[href], input, select, textarea, button, iframe, object, embed, *[tabindex], *[contenteditable]')
            .not('[disabled]').removeClass('focusable').addClass('no-focus');
    },

    showOutlines: function () {
        $('a[href], area[href], input, select, textarea, button, iframe, object, embed, *[tabindex], *[contenteditable]')
            .not('[disabled]').removeClass('no-focus').addClass('focusable');
    },

    initKeyboardControls: function() {
        var keyStart = {37: null, 39: null};
        var keyEnd = {37: null, 39: null};

        //Add a listener on the body of videoPlayer.php
        $(document).keydown(function(e) {
            //Then, if the element in focus isn't an input, select, textarea or form, allow the user to control the video player
            var inputActive = $("input, select, textarea, form").is(":focus");
            var currentDate = new Date();

            if(inputActive === false) {
                switch (e.keyCode) {
                    //Space bar
                    case 32:
                        e.preventDefault();
                        if (VideoPlayerInterface.iframeWindow.rtc.player.video.status().paused) {
                            VideoPlayerInterface.iframeWindow.rtc.player.controls.resume();
                        } else {
                            VideoPlayerInterface.iframeWindow.rtc.player.controls.pause();
                        }

                        VideoPlayerInterface.iframeWindow.rtc.utils.track("keyboard.spacebar");
                        break;
                    //Left and right arrow keys
                    case 37:
                    case 39:
                        //Record the time the keypress started
                        if(keyStart[e.keyCode] === null) {
                            keyStart[e.keyCode] = new Date();
                        }

                        //Then if the current time is a second after the key press started, rewind or fast-forward the video
                        if(currentDate.getTime() > keyStart[e.keyCode].getTime() + 500) {
                            if(VideoPlayerInterface.iframeWindow.rtc.player.vars.videoDuration !== 0 && VideoPlayerInterface.iframeWindow.rtc.player.vars.videoDuration < 10) {
                                if(e.keyCode == 37) {
                                    VideoPlayerInterface.iframeWindow.rtc.player.skipPrevious();
                                    VideoPlayerInterface.iframeWindow.rtc.utils.track("keyboard.skip-previous");
                                } else {
                                    VideoPlayerInterface.iframeWindow.rtc.player.skipNext();
                                    VideoPlayerInterface.iframeWindow.rtc.utils.track("keyboard.skip-next");
                                }
                            } else if(VideoPlayerInterface.iframeWindow.rtc.player.vars.videoDuration !== 0) {
                                if(e.keyCode == 37) {
                                    VideoPlayerInterface.iframeWindow.rtc.player.vars.currentTime -= 10;
                                    VideoPlayerInterface.iframeWindow.rtc.utils.track("keyboard.rewind", "newTime=" + rtc.player.vars.currentTime);
                                } else {
                                    VideoPlayerInterface.iframeWindow.rtc.player.vars.currentTime += 10;
                                    VideoPlayerInterface.iframeWindow.rtc.utils.track("keyboard.fast-forward", "newTime=" + rtc.player.vars.currentTime);
                                }

                                //Limiting the percentage to 99.9% as 100% seems to break the rewind/fast-forward functionality
                                var percent = Math.min((VideoPlayerInterface.iframeWindow.rtc.player.vars.currentTime / VideoPlayerInterface.iframeWindow.rtc.player.vars.videoDuration) * 100, 99.9);
                                VideoPlayerInterface.iframeWindow.rtc.timeline.slideCurrentState(RTCVisit.currentState, null, percent);
                            }
                        }
                        break;
                    // Enter key
                    case 13:
                        if (document.activeElement.type !== "button" && !document.activeElement.href) {
                            $(document.activeElement).click();
                        }
                        break;
                    // Tab key
                    case 9:
                        KeyboardInputController.showOutlines();
                        break;
                }
            }
        });

        $(document).keyup(function(e) {
            //If the element in focus isn't an input, select, textarea or form, allow the user to control the video player
            var inputActive = $("input, select, textarea, form").is(":focus");
            var currentDate = new Date();

            if(inputActive === false) {
                switch (e.keyCode) {
                    //Left and right arrow keys
                    case 37:
                    case 39:
                        keyStart[e.keyCode] = null;

                        //If the user has pressed an arrow key twice, skip the section
                        if(keyEnd[e.keyCode] !== null) {
                            if(e.keyCode == 37 && currentDate.getTime() < keyEnd[37].getTime() + 1000) {
                                VideoPlayerInterface.iframeWindow.rtc.player.skipPrevious();
                                VideoPlayerInterface.iframeWindow.rtc.utils.track("keyboard.skip-previous");
                            } else if(e.keyCode == 39 && currentDate.getTime() < keyEnd[39].getTime() + 1000) {
                                VideoPlayerInterface.iframeWindow.rtc.player.skipNext();
                                VideoPlayerInterface.iframeWindow.rtc.utils.track("keyboard.skip-next");
                            }
                        }

                        //Record the time the keyup started
                        if(keyEnd[e.keyCode] === null || currentDate.getTime() >= keyEnd[e.keyCode].getTime() + 1000) {
                            keyEnd[e.keyCode] = new Date();
                        }
                        break;
                }
            }
        });
    }
};

var LanguageSelector = {

    currentLanguageCode: 'en',
    currentLanguageObj: {},
    settings: {},

    /**
     * Initialise the language selector
     *
     * @param {Object} languageSettings settings for the language selector
     */
    initialise: function(languageSettings) {
        LanguageSelector.settings = languageSettings;

        // Generate the language selector options
        LanguageSelector.generateOptions(languageSettings.languages);

        // Events for language selector
        LanguageSelector.events.initialise();

        var startingLanguage = LanguageSelector.getStartingLanguage();
        LanguageSelector.loadLanguageJSON(startingLanguage);
        LanguageSelector.setLanguage(startingLanguage);
    },

    /**
     * Generate the language selector options, based on the languageSettings
     *
     * @param {object} languages the languages object as defined in the settings (langCode: langName)
     */
    generateOptions: function(languages) {
        var languageSelector = $("#jsLanguageSelectorPopout");

        /**
         * Generate a language option in the language selection menu
         *
         * @param {string} langCode the language code
         * @param {string} langName the friendly name/label of the language
         */
        $.each(languages, function generateLangOption(langCode, langName) {
            var option = $("<div class='timeline__settings-item jsTimelineSettingsLanguage no-focus' tabindex='0'></div>"),
                label = $("<div class='timeline__settings-text'>" + langName + "</div>"),
                icon = $("<div class='timeline__settings-icon timeline__settings-icon--right'></div>"),
                iconInner = $("<div class='timeline__button-icon timeline__button-icon--tick jsSelectedLanguage'></div>");

            option.data("language", langCode);

            icon.append(iconInner);
            option.append(label);
            option.append(icon);
            option.append("<div class='clearfix'></div>");

            languageSelector.append(option);
        });
    },

    /**
     * Gets the initial language for the landing page.
     *
     * This is determined in the following order;
     *  - from the 'language' URL parameter (if defined)
     *  - from the users locale (if available)
     *  - from the 'defaultLanguage' set in 'settings.js'
     *
     * @return {string} the language code to initially load
     */
    getStartingLanguage: function() {
        var availableLanguages = LanguageSelector.getNavigatorLanguages(navigator),
            languageFromParam = LanguageSelector.getLanguageFromParam(window),
            languageFromLocale = LanguageSelector.getLanguageFromLocale(availableLanguages);

        if (languageFromParam) {
            return languageFromParam;
        } else if (languageFromLocale) {
            return languageFromLocale;
        }

        return LanguageSelector.settings.defaultLanguage;
    },

    /**
     * Attempts to determine the language from the 'language' URL parameter
     *
     * @param {object} windowObj the window object to use
     *
     * @return {string|boolean} the language code if a valid one was found, otherwise false
     */
    getLanguageFromParam: function(windowObj) {
        if (windowObj.location.search.search(/language=[a-z][a-z]/) != -1) {
            var langArray = windowObj.location.search.match(/language=[a-z][a-z]/),
                langCode = langArray[0].replace("language=", "");

            if (LanguageSelector.settings.languages.hasOwnProperty(langCode)) {
                return langCode;
            }
        }

        return false;
    },

    /**
     * Attempts to determine the language from the users preferred set of locales
     *
     * @param {array} languages the array of locales from the users browser (navigator.languages)
     *
     * @return {string|boolean} the language code if a valid one was found, otherwise false
     */
    getLanguageFromLocale: function(languages) {
        var langCode = false;

        if (languages) {
            /**
             * Check the users locale is supported by the landing page
             *
             * @param {number} i the locale index
             * @param {string} language the language/locale code
             */
            $.each(languages, function checkLocaleSupported(i, language) {
                var locale = language.substr(0, 2).toLowerCase();

                if (LanguageSelector.settings.languages.hasOwnProperty(locale)) {
                    langCode = locale;
                    return false;
                }
            });
        }

        return langCode;
    },

    /**
     * Set language with one of the values from LanguageSettings
     *
     * @param value
     */
    setLanguage: function(langCode) {
        $('.jsTimelineSettingsLanguage').each(function() {
            if ($(this).data('language') === langCode) {
                LanguageSelector.currentLanguageCode = $(this).data('language');
                $(this).find('.jsSelectedLanguage').show();
            } else {
                $(this).find('.jsSelectedLanguage').hide();
            }
        });
    },

    loadLanguageJSON: function(langCode){
        var langFileUrl = "./language/" + langCode + ".js";

        /**
         * Updates the page based on the translations loaded
         */
        $.getScript(langFileUrl, function loadTranslationsSuccess() {
            LanguageSelector.currentLanguageObj = Translations;
            LanguageSelector.updateLanguage(langCode);
        });
    },

    updateLanguage: function(langCode) {
        Timeline.render(LanguageSelector.currentLanguageObj.ChapterSettings);
        $("#jsTopWrapper").removeClass("top-wrapper--no-cta top-wrapper--no-promo");
        $("#jsBottomWrapper").removeClass("bottom-wrapper--no-cta bottom-wrapper--no-promo");

        // Checks whether promo or cta button content exists. If it doesn't then it adds in a css class to resize the other elements.
        if (isEmpty(LanguageSelector.currentLanguageObj.CtaButtonSettings)) {
            $("#jsTopWrapper").addClass("top-wrapper--no-cta");
            $("#jsBottomWrapper").addClass("bottom-wrapper--no-cta");
        } else {
            CtaButtons.render(LanguageSelector.currentLanguageObj.CtaButtonSettings);
        }

        if (isEmpty(LanguageSelector.currentLanguageObj.PromoSettings)) {
            $("#jsTopWrapper").addClass("top-wrapper--no-promo");
            $("#jsBottomWrapper").addClass("bottom-wrapper--no-promo");
        } else {
            Promos.render(LanguageSelector.currentLanguageObj.PromoSettings);
        }

        //Change the text of every .translate element to current language
        $(".translate").each(function () {
            var translateId = $(this).data('translate');
            if(LanguageSelector.currentLanguageObj.hasOwnProperty(translateId)){
                $(this).text(LanguageSelector.currentLanguageObj[translateId]);
                if($(this).parent().attr('title')){
                    $(this).parent().attr('title',LanguageSelector.currentLanguageObj[translateId]);
                }
            }
        });

        //Updates the lang tag at the top of the index.php html tag
        LanguageSelector.updateLangTag(langCode);

        /*
        * If the iframe is present and its src path already contains language=xx
        * then replace the lang code with new code else append the language parameter to iframe src url
        */
        if (document.getElementById('videoPlayerIframe') != null) {
            var iframe = document.getElementById("videoPlayerIframe"),
                videoUrl = iframe.src;

            if (videoUrl.search(/language=[a-z][a-z]/) != -1) {
                videoUrl = videoUrl.replace(/language=../, "language=" + langCode);
            } else if ("en" != langCode) {
                videoUrl += '&language=' + langCode;
            }

            if (videoUrl != iframe.src) {
                iframe.src = videoUrl;
            }
        }
    },

    updateLangTag: function(newLangCode){
        $('html').attr('lang', newLangCode);
    },

    getTextByKey: function (key) {
        if(typeof LanguageSelector.currentLanguageObj[key] === 'string'){
            return LanguageSelector.currentLanguageObj[key];
        }
        return false;
    },

    /**
     * Get available languages from navigator browser object
     *
     * @param {object} nav Browser Navigator object
     *
     * @return {array|boolean}
     */
    getNavigatorLanguages: function(nav) {
        if (nav.languages) {
            return nav.languages
        }

        var languages = [];

        if (nav.language) {
            languages.push(nav.language);
        }

        if (nav.userLanguage) {
            languages.push(nav.userLanguage);
        }

        if (nav.browserLanguage) {
            languages.push(nav.browserLanguage);
        }

        return languages.length ? languages : false;
    },

    /**
     * Define the events
     */
    events: {
        /**
         * Link up the events and the event handlers
         */
        initialise: function() {
            $('#jsLanguageMenuTitle').click(LanguageSelector.events.closeLanguageMenu);
            $('.jsTimelineSettingsLanguage').click(LanguageSelector.events.languageItemClickEventHandler);
        },

        closeLanguageMenu: function (e) {
            $('#jsSettingsButtonPopout').show();
            $('#jsLanguageSelectorPopout').hide();
            $("#jsLangMenuItem").focus();
        },

        languageItemClickEventHandler: function(e) {
            var newLang = $(this).data('language');
            LanguageSelector.loadLanguageJSON(newLang);
            LanguageSelector.setLanguage(newLang);
            ClosedCaptionSelector.setClosedCaptions('off');
        }
    }
};

var Promos = {

    SettingsJsonObject: {},

    /**
     * Initialises the promo areas
     */
    initialise: function() {
        Promos.events.initialise();
    },

    /**
     * Render the promo areas
     *
     * @param {object} promos the promo areas to render
     */
    render: function(promos) {
        Promos.SettingsJsonObject = promos;
        $(".jsPromoContainer").empty();

        /**
         * Generates an individual promo area (by default, one for desktop and one for mobile breakpoints)
         *
         * @param {number} areaIndex the array index
         * @param {string} area      the area being generated
         */
        $.each(["Desktop", "Mobile"], function generatePromoArea(areaIndex, area) {
            var i = 0;

            /**
             * Generates an individual promo item
             *
             * @param {string} name the internal name of the promo item
             * @param {object} promo the promo area object
             */
            $.each(promos, function generatePromoItem(name, promo) {
                var item = $("<div class='promo__item'></div>"),
                    link = $("<a href='#' class='promo__link jsPromoLink'></a>"),
                    image = $("<div class='promo__image'></div>"),
                    label = $("<span class='promo__label sr-only'></span>");

                item.addClass("promo__item--" + (i + 1));
                link.data("promo", name);
                image.css("background-image", "url(" + promo[area.toLowerCase() + "Image"] + ")");
                label.text(promo.label);

                image.append(label);
                link.append(image);
                item.append(link);
                $("#jsPromoContainer" + area).append(item);

                i++;
            });

            $(".jsPromoContainer").removeClass("promo--1 promo--2 promo--3 promo--4 promo--5");
            $(".jsPromoContainer").addClass("promo--" + i);

        });
    },

    /**
     * Process a click on a promo area
     *
     * @param {object} promoName the internal name of the promo area
     */
    click: function(promoName) {
        var promo = Promos.SettingsJsonObject[promoName];

        if (VideoPlayerInterface.iframeWindow) {
            VideoPlayerInterface.actions.pause();

            // Log the click event
            VideoPlayerInterface.iframeWindow.rtc.utils.track(
                "promo.click",
                JSON.stringify({
                    trackingName: promo.trackingName,
                    url: promo.url
                })
            );
        }

        // Open the URL in a new window
        window.open(promo.url, "_blank");
    },

    events: {
        initialise: function () {
            $(".jsPromoContainer").on("click", ".jsPromoLink", Promos.events.click);
        },

        click: function(e) {
            Promos.click($(this).data("promo"));
        }
    }
};

/**
 * All the possible quality settings that must be accounted for
 */
var QualitySettings = {
    AUTO : "auto",
    LOW : "360p",
    MEDIUM : "540p",
    HIGH : "720p",
    FULL_HD : "1080p"
}

var QualitySelector = {
    /**
     * Initialise the quality selector
     */
    initialise: function(startingQuality) {
        if (VideoPlayerInterface.iframeWindow.rtc != null && VideoPlayerInterface.iframeWindow.rtc.player.quality.getLastResolution() != null) {
            QualitySelector.loaded = true;

            // Events for quality selector
            QualitySelector.events.initialise();

            QualitySelector.showEnabledResolutions();

            // Set initial state.
            QualitySelector.removeItemSelection();
            if (VideoPlayerInterface.iframeWindow.rtc.player.quality.getAuto()) {
                QualitySelector.setAutoTrue();
            } else {
                QualitySelector.setSelected(VideoPlayerInterface.iframeWindow.rtc.player.quality.getSelected());
            }

            // Update auto selected resolution during playback.
            VideoPlayerInterface.iframeWindow.rtc.events.subscribe('player.quality.lastResolution', function (e, data) {
                if (VideoPlayerInterface.iframeWindow.rtc.player.quality.getAuto()) {
                    QualitySelector.removeItemSelection();
                    $("#jsQualityAutoTick").show();
                    QualitySelector.setButtonHd(data.lastResolution);
                }
            });
        }
    },

    loaded: false,

    setButtonHd: function(quality) {
        var hdOn = VideoPlayerInterface.iframeWindow.rtc.player.quality.isHd(quality);
        $settingsBtn = $("#jsSettingsButtonIcon");
        $qualityIcon = $("#jsQualityMenuIcon, #jsQualityMenuAutoIcon");

        if (hdOn) {
            $settingsBtn.addClass('timeline__button-icon--settings--hd');
            $qualityIcon.addClass('timeline__button-icon--hd');

            $settingsBtn.removeClass('timeline__button-icon--settings--sd');
            $qualityIcon.removeClass('timeline__button-icon--sd');
        } else {
            $settingsBtn.addClass('timeline__button-icon--settings--sd');
            $qualityIcon.addClass('timeline__button-icon--sd');

            $settingsBtn.removeClass('timeline__button-icon--settings--hd');
            $qualityIcon.removeClass('timeline__button-icon--hd');
        }
    },

    setAutoTrue: function() {
        $("#jsQualityAutoTick").show();

        var last = VideoPlayerInterface.iframeWindow.rtc.player.quality.getLastResolution();
        if (typeof last === "string") {
            QualitySelector.setButtonHd(last);
        }
    },

    setSelected: function(quality) {
        $("#jsQuality" + quality + "Tick").show();
        QualitySelector.setButtonHd(quality);
    },

    removeItemSelection: function() {
        $("#jsQualityAutoTick").hide();

        for (var quality in QualitySettings) {
            $("#jsQuality" + QualitySettings[quality] + "Tick").hide();
        }
    },

    showEnabledResolutions: function() {
        // Show only enabled resolutions.
        var show = VideoPlayerInterface.iframeWindow.rtc.player.quality.getAvailable();
        $(".jsTimelineSettingsQuality").each(function(i, el) {
            var $el = $(el);
            var res = $el.data('quality');
            if ($.inArray(res, show) === -1 && res !== 'auto') {
                $el.hide();
            }
        });
    },

    /**
     * Define the events for the quality selector
     */
    events: {
        /**
         * Link up the events and the event handlers
         */
        initialise: function() {
            $(".jsTimelineSettingsQuality").click(QualitySelector.events.selectQuality);
        },

        selectQuality: function(e) {
            var qualityButton = $(this);
            var quality = qualityButton.data("quality");

            QualitySelector.removeItemSelection();
            if (quality == "auto") {
                VideoPlayerInterface.iframeWindow.rtc.player.quality.setAutoTrue();
                QualitySelector.setAutoTrue();
            } else {
                VideoPlayerInterface.iframeWindow.rtc.player.quality.setSelected(quality);
                QualitySelector.setSelected(quality);
            }
        },

        closeQualityMenu: function (e) {
            $('#jsSettingsButtonPopout').show();
            $('#jsQualitySelectorPopout').hide();
            $("#jsQualityMenuItem").focus();
        }
    }
};

var SettingsPanel = {

    initMenu: function() {
        $("#jsQualityMenuTitle").click(QualitySelector.events.closeQualityMenu);

        if (!Timeline.SettingsJsonObject.ClosedCaptionsSupported) {
            $('#jsCCMenuItem').remove();
        }

        if (!Timeline.SettingsJsonObject.MultiLanguageSupported) {
            $('#jsLangMenuItem').remove();
        }

        SettingsPanel.events.initialise();
    },

    events: {
        /**
         * Link up the events and the event handlers
         */
        initialise: function() {
            $('#jsLangMenuItem').click(SettingsPanel.events.settingsItemClickHandler);
            $('#jsCCMenuItem').click(SettingsPanel.events.settingsItemClickHandler);
            $('#jsQualityMenuItem').click(SettingsPanel.events.settingsItemClickHandler);
            $('#jsSettingsButton').click(SettingsPanel.events.settingsButtonClickEventHandler);

            $(document).on("click touchstart", SettingsPanel.events.documentClickEventHandler);
        },

        /**
         * Display the quality selector control when the user hovers over the settings icon
         */
        settingsButtonClickEventHandler: function(e) {
            var popout = $('#jsSettingsButtonPopout');
            if ($('#jsCCSelectorPopout').is(':visible') || $('#jsQualitySelectorPopout').is(':visible') ||
                    $('#jsLanguageSelectorPopout').is(':visible') || popout.is(':visible')){
                $('#jsCCSelectorPopout').hide();
                $('#jsQualitySelectorPopout').hide();
                $('#jsLanguageSelectorPopout').hide();
                popout.hide();
            } else {
                popout.show();
            }
        },

        settingsItemClickHandler: function(e) {
            var setting = $(this).data("setting");
            switch (setting) {
                case "language":
                    $('#jsLanguageSelectorPopout').show();
                    $('#jsSettingsButtonPopout').hide();
                    return;
                case "quality":
                    $('#jsQualitySelectorPopout').show();
                    $('#jsSettingsButtonPopout').hide();
                    return;
                case "closed-captions":
                    $('#jsCCSelectorPopout').show();
                    $('#jsSettingsButtonPopout').hide();
                    return;

            }
        },

        documentClickEventHandler: function(e) {
            if (e.target.id !== "jsSettingsButton" && $(e.target).parents("#jsSettingsContainer, #jsSettingsButton").length === 0) {
                $("#jsSettingsButtonPopout").hide();
                $("#jsCCSelectorPopout").hide();
                $("#jsQualitySelectorPopout").hide();
                $("#jsLanguageSelectorPopout").hide();
            }
        }
    }
};

var SocialIcons = {
    settings: {},
    icons: {},
    collapsed: false,

    initialise: function(settings) {
        SocialIcons.settings = settings;
        SocialIcons.icons = settings.icons;

        SocialIcons.initIcons();
        SocialIcons.events.initialise();
    },

    initIcons: function() {
        var socialIconHtml = SocialIcons.generateHtml();

        if (SocialIcons.settings.position === "left") {
            $("#jsSocialIconsTop").addClass("social--top-left");
            $("#jsSocialIconsTop").append(socialIconHtml);
        } else {
            $("#jsSocialIconsTop").addClass("social--top-right");
            $("#jsSocialIconsTop").prepend(socialIconHtml);
        }

        $("#jsSocialIconsBottom").prepend(socialIconHtml);
    },

    generateHtml: function() {
        var html = "";

        $.each(SocialIcons.icons, function(key, icon) {
            html += "<a href='#' class='social__icon social__icon--" + key + "' data-icon='" + key + "'>";
            html += "<span class='sr-only translate' data-translate='SocialIcon-" + key + "'>" + icon.text + "</span>";
            html += "</a>";
        });

        return html;
    },

    /**
     * Define the events for the social icons
     */
    events: {
        initialise: function() {
            $("#jsSocialIconTopCollapse").click(SocialIcons.events.toggleTop);
            $("#jsSocialIconTopExpand").click(SocialIcons.events.toggleTop);

            $(".jsSocialIcons a").click(SocialIcons.events.click);
        },

        toggleTop: function(e) {
            SocialIcons.collapsed = !SocialIcons.collapsed;

            if (SocialIcons.collapsed) {
                $("#jsSocialIconTopCollapse").css("display", "none");
                $("#jsSocialIconTopExpand").css("display", "inline-block");
            } else {
                $("#jsSocialIconTopCollapse").css("display", "inline-block");
                $("#jsSocialIconTopExpand").css("display", "none");
            }

            $("#jsSocialIconsTop").toggleClass("social--expanded social--collapsed");
        },

        click: function(e) {
            var icon = SocialIcons.icons[$(this).data("icon")];

            if (icon && icon.url) {
                VideoPlayerInterface.actions.pause();
                VideoPlayerInterface.iframeWindow.rtc.utils.track("socialicon.click", icon);
                window.open(icon.url, "_blank");
            }
        }
    }
};

// SideButtons.pausedOnOpen is used in the close side card handler in the interaction card JavaScript so rather
// than update the video project (for each language) adding functionality here to handle closing side cards
var SideButtons = {
    pausedOnOpen: false
};

var CtaButtons = {

    SettingsJsonObject: {},

    pausedOnOpen: false,

    /**
     * Initialises the CTA buttons
     */
    initialise: function() {
        CtaButtons.events.initialise();
    },

    /**
     * Renders the CTA buttons
     *
     * @param {object} buttons the CTA buttons to render
     */
    render: function(buttons) {
        CtaButtons.SettingsJsonObject = buttons;
        $(".jsCtaContainer").empty();

        var i = 0;

        /**
         * Generates an individual CTA button
         *
         * @param {string} buttonName the internal name of the CTA button
         * @param {object} buttonObj the CTA button object, as configured in the settings
         */
        $.each(buttons, function generateCtaButton(buttonName, buttonObj) {
            var button = $("<button class='cta__button cta__button--button-" + (i + 1) + " jsCtaButton'></button>"),
                icon = $("<span class='cta__icon cta__icon--" + buttonObj.icon + " jsCtaIcon'></span>"),
                label = $("<span class='cta__label'>" + buttonObj.label + "</span>");

            button.data("button", buttonName);
            button.append(icon);
            button.append(label);

            $(".jsCtaContainer").append(button);
            i++;
        });

        $(".jsCtaContainer").removeClass("cta--1 cta--2 cta--3 cta--4 cta--5");
        $(".jsCtaContainer").addClass("cta--" + i);
    },

    buttonClick: function(buttonName) {
        var button = CtaButtons.SettingsJsonObject[buttonName];

        if (button) {
            if (button.hasOwnProperty("card")) {
                if (CtaButtons.isCardOpen(buttonName)) {
                    CtaButtons.closeSideCard(buttonName, true);
                } else {
                    CtaButtons.openSideCard(buttonName);
                }
            } else if (button.hasOwnProperty("url")) {
                if (VideoPlayerInterface.iframeWindow) {
                    VideoPlayerInterface.actions.pause();
                    VideoPlayerInterface.iframeWindow.rtc.utils.track("sidebutton.click", buttonName);
                }

                window.open(button.url, '_blank');
            }
        }
    },

    /**
     * Display the side card, closing any open interaction cards or pausing the video
     */
    openSideCard: function(buttonName) {
        CtaButtons.closeAllSideCards();

        VideoPlayerInterface.iframeWindow.rtc.utils.track("sidebutton.click", buttonName);

        // Hide any interaction cards in the video and show the side card instead
        if (VideoPlayerInterface.iframeWindow.rtc.card.closeAllInteractions) {
            VideoPlayerInterface.iframeWindow.rtc.card.closeAllInteractions();
        }

        SideButtons.pausedOnOpen = CtaButtons.pausedOnOpen = !VideoPlayerInterface.isPlaying;

        VideoPlayerInterface.actions.pause();

        var cardId = CtaButtons.getCardIdForButton(buttonName);

        if (cardId != null) {
            VideoPlayerInterface.iframeWindow.$(cardId).rtcCard("open");
        }
    },

    /**
     * Close the side card, reopening any previously opened interaction cards or resuming the video
     */
    closeSideCard: function(buttonName, continueVideo) {
        var cardId = CtaButtons.getCardIdForButton(buttonName);

        if (cardId != null) {
            VideoPlayerInterface.iframeWindow.$(cardId).rtcCard("close");
        }

        // Re-open any interaction cards that were previously open
        if (VideoPlayerInterface.iframeWindow.rtc.card.reopenClosedInteractions) {
            VideoPlayerInterface.iframeWindow.rtc.card.reopenClosedInteractions();
        }

        if (continueVideo && !CtaButtons.pausedOnOpen) {
            VideoPlayerInterface.actions.play();
        }
    },

    /**
     * Close all open side cards
     */
    closeAllSideCards: function() {
        for (var key in CtaButtons.SettingsJsonObject) {
            var button = CtaButtons.SettingsJsonObject[key];

            if (button.hasOwnProperty("card")) {
                CtaButtons.closeSideCard(key);
            }
        }
    },

    /**
     * Find out if the card associated with a particular cta button is currently "open"
     */
    isCardOpen: function(buttonName) {

        var cardId = CtaButtons.getCardIdForButton(buttonName);

        if (cardId != null) {
            return VideoPlayerInterface.iframeWindow.$(cardId + ":visible").length > 0;
        }

        return false;
    },

    /**
     * Gets the id (e.g. #card45rf66fd) of the card HTML element associated with a given cta button
     */
    getCardIdForButton: function(buttonName) {
        var button = CtaButtons.SettingsJsonObject[buttonName];

        if (button.hasOwnProperty("card")) {
            return "#card" + button.card;
        }

        return null;
    },

    /**
     * Define the events for the cta buttons
     */
    events: {
        initialise: function () {
            $(".jsCtaContainer").on("click", ".jsCtaButton", CtaButtons.events.click);
        },

        click: function(e) {
            CtaButtons.buttonClick($(this).data('button'));
        }
    }
};

var Timeline = {

    SettingsJsonObject: {},

    progress: 0,

    /**
     * Initialise the timeline
     *
     * @var progress         {number} The initial time in seconds
     * @var timelineSettings {object} JSON object of settings for the timeline
     */
    initialise: function(progress, timelineSettings) {
        Timeline.loadSettings(timelineSettings);
        Timeline.events.initialise();
        Timeline.progress = progress;
        Timeline.update();
    },

    loadSettings: function(settings){
        Timeline.SettingsJsonObject = settings;
        SettingsPanel.initMenu();
    },

    /**
     * Renders the timeline
     *
     * @param {Array} chapters Chapters which should be rendered
     */
    render: function(chapters) {
        var container = $("#jsTimelineContainer"),
            start = 0;

        container.children().remove();

        /**
         * Creates an element within the timeline container for a chapter
         *
         * @param {number} i        Chapter index
         * @param {Object} settings Chapter settings
         */
        $.each(chapters, function createChapter(i, settings) {
            var chapter = $("<div class='jsTimelineChapter timeline-chapters__chapter'></div>"),
                label = $("<span class='jsTimelineChapterLabel timeline-chapters__label'>" + settings.label + "</span>"),
                width = 0;

            /**
             * Creates a state element within a chapter element
             *
             * @param {number} j     State index
             * @param {Object} state State settings
             */
            $.each(settings.states, function createChapterState(j, state) {
                var div = $("<div class='timeline-chapters__state jsTimelineState'></div>");

                div.data("percent-width", state.width)
                    .data("percent-start", start)
                    .data("state", state.cardId);

                chapter.append(div);

                width += state.width;
                start += state.width;
            });

            chapter.css("width", width + "%");

            chapter.append(label);
            container.append(chapter);
        });

        BufferStatus.initBuffer();
        ContrastProgress.updateLabels();
    },

    /**
     * Set the video progress along the timeline
     */
    setProgress: function(progress) {
        Timeline.progress = progress;
        Timeline.update();
    },

    /**
     * Get the video progress along the timeline
     */
    getProgress: function() {
        return Timeline.progress;
    },

    /**
     * Update the timeline
     */
    update: function(checkMainWidth) {
        var timelineWidth = $("#jsTimelineContainer").width();

        if (checkMainWidth) {
            timelineWidth = checkMainWidth;
        }

        var progressWidth = timelineWidth * Timeline.getProgress(),
            ballWidth = 22;

        $("#jsTimelineProgress").width(progressWidth);

        /* On mobile devices, ensure the progress ball appears within the screen boundaries */
        if ($("#jsTimelineIndicator").is(":visible") && $("#jsTimelineCover").length === 0) {
            $("#jsTimelineIndicatorBall").show();
            $("#jsTimelineIndicator").width(Math.min(Math.max(progressWidth, ballWidth / 2), timelineWidth - ballWidth / 2));
        } else {
            $("#jsTimelineIndicatorBall").hide();
        }

        $("#jsTimelineContrastFixed").width(timelineWidth);
        ContrastProgress.setContrastTimelineProgress(Timeline.getProgress());
    },

    /**
     * Update the play/pause button to have the appropriate icon
     */
    updatePlayPauseButton: function() {
        if (VideoPlayerInterface.isPlaying) {
            $('#jsPlayPauseSRText').text('Pause');
            $('#jsPlayPauseButton span').removeClass('timeline__button-icon--play').addClass('timeline__button-icon--pause');
        } else {
            $('#jsPlayPauseSRText').text('Play');
            $('#jsPlayPauseButton span').removeClass('timeline__button-icon--pause').addClass('timeline__button-icon--play');
        }
    },

    /**
     * Remove the timeline cover element that blocks interaction before the video is loaded
     */
    enableTimelineIfNecessary: function() {
        if ($("#jsTimelineCover") && VideoPlayerInterface.isSourceSet) {
            $("#jsTimelineCover").remove();
        }
    },

    /**
     * Add timeline cover element that blocks interaction on video timeline bar
     */
    disableTimelineIfNecessary: function() {
        $('<div id="jsTimelineCover" class="timeline__cover"></div>').prependTo('#jsTimeline');
    },

    /**
     * Update the timeline state and progress
     */
    updateStateAndProgress: function(state, progress) {
        if (state == "END") {
            Timeline.setProgress(1);
            return;
        }

        if (Timeline.events.isDragging) {
            return;
        }

        progress = Timeline.calculateProgressInState(state, progress);

        var customErrorOpen = VideoPlayerInterface.iframeWindow.rtc.card.isFailoverMessageVisible();
        var stateTimelineElem = Timeline.getStateElementByName(state);
        var totalTimelinePercent = (parseFloat(stateTimelineElem.data('percent-start')) + (parseFloat(stateTimelineElem.data('percent-width')) * progress)) / 100;
        Timeline.setProgress(totalTimelinePercent);
        Timeline.updateMobileActiveState(stateTimelineElem);

        if (!customErrorOpen) {
            Timeline.enableTimelineIfNecessary();
        }
    },

    /**
     * Calculates the progress on the timeline based on the current state and the chapters within the video
     *
     * @param {string} state    Friendly name of the the state
     * @param {number} progress Video progress percentage as a fraction
     *
     * @return {number} Timeline progress
     */
    calculateProgressInState: function(state, progress) {
        var chapters = VideoPlayerInterface.getVideoChapters();

        if (progress > 0 && chapters && Object.keys(chapters).length > 1) {
            var videoDuration = VideoPlayerInterface.getVideoDuration(),
                chapters = VideoPlayerInterface.getVideoChapters(),
                chapter = chapters[state];

            progress = (progress - (chapter.start / videoDuration)) / (chapter.duration / videoDuration);
        }

        return progress;
    },

    updateSeenChapterColors: function(){
        var currentProgress = Timeline.getProgress() * 100;
        $(".jsTimelineState").each(function (){
            var stateNameFriendly = $(this).data('state');
            var percentStart = parseFloat($(this).data('percent-start'));
            if (percentStart < currentProgress) {
                $(this).siblings(".jsTimelineChapterLabel").addClass("timeline-chapters--seen");
            }
        });
    },

    /**
     * Updates the active state on the timeline, which is shown on mobile devices
     */
    updateMobileActiveState: function(stateElem) {
        var stateLabel = $(stateElem).parent().find(".jsTimelineChapterLabel").text();
        $("#jsTimelineMobileActiveState").text(stateLabel);
    },

    /**
     * Get the timeline state from the video progress
     */
    getStateFromProgress: function() {
        var pc_progress = Timeline.getProgress() * 100;
        var state = 'START';
        $('.jsTimelineState').each(function() {
            var start = parseFloat($(this).data('percent-start'));
            var end = parseFloat($(this).data('percent-start')) + parseFloat($(this).data('percent-width'));
            if (pc_progress >= start && pc_progress < end) {
                state = $(this).data('state');
            }
        });
        return state;
    },

    /**
     * Get the progress through the current state
     *
     * @param {Array.<Object>} chapters      Array of chapter details
     * @param {number}         videoDuration Video duration in seconds
     *
     * @return {number} Progress through the current state as a percentage
     */
    getProgressInState: function(chapters, videoDuration, progress) {
        var state = Timeline.getStateFromProgress(),
            stateTimelineElem = Timeline.getStateElementByName(state),
            progress = Timeline.getProgress(),
            stateStart = parseFloat(stateTimelineElem.data('percent-start')),
            stateWidth = parseFloat(stateTimelineElem.data('percent-width')),
            progressInState = ((progress * 100) - stateStart) / stateWidth;

        if (Object.keys(chapters).length == 1) {
            return progressInState;
        }

        return (chapters[state].start + (chapters[state].duration * progressInState)) / videoDuration;
    },

    /**
     * Get a state HTML element by it's friendly name
     */
    getStateElementByName: function(stateName) {
        var state = null;
        $('.jsTimelineState').each(function(key, value) {
            if (typeof stateName != 'undefined' && stateName == $(value).data('state')) {
                state = $(this);
            }
        });
        return state;
    },

    /**
     * Update the video
     */
    updateInVideo: function() {
        var state = Timeline.getStateFromProgress(),
            chapters = VideoPlayerInterface.getVideoChapters(),
            videoDuration = VideoPlayerInterface.getVideoDuration();

        if (state in chapters) {
            VideoPlayerInterface.actions.timelinePosition(Timeline.getProgressInState(chapters, videoDuration));
        } else {
            VideoPlayerInterface.actions.selectState(state);
        }
    },

    /**
     * Define the timeline events
     */
    events: {
        /**
         * Initialise events for timeline
         */
        initialise: function() {
            $('#jsTimelineContainer')
                .mousemove(Timeline.events.timelineMousemove)
                .mouseleave(Timeline.events.timelineMouseleave)
                .click(Timeline.events.timelineClick);

            $('#jsTimelineIndicator').click(Timeline.events.timelineClick);

            $('#jsTimelineIndicator')
                .mousedown(Timeline.events.timelineIndicatorMousedown);

            $(document)
                .mouseup(Timeline.events.documentMouseup)
                .mousemove(Timeline.events.documentMousemove);

            $(window).resize(Timeline.events.windowResize);

            $('#jsPlayPauseButton').click(Timeline.events.playPauseButtonClick);

            $('#jsSkipBackButton').click(Timeline.events.skipBack);

            $('#jsSkipForwardButton').click(Timeline.events.skipForward);

            $('#jsFullScreenButton').click(Timeline.events.toggleFullscreen);
        },

        isDragging: false,

        /**
         * Show faint background when hovering over timeline.
         */
        timelineMousemove: function(e) {
            $('#jsTimelineProgressHover').width(e.pageX - $('#jsTimelineProgress').offset().left);
        },

        /**
         * Hide faint background when leaving timeline.
         */
        timelineMouseleave: function() {
            $('#jsTimelineProgressHover').width(0);
        },

        /**
         * Handle the timeline click event
         */
        timelineClick: function(e) {
            e.preventDefault();
            var container = $('#jsTimelineIndicator');
            if (!container.is(e.target) && container.has(e.target).length === 0) {
                var timeline_width = $('#jsTimelineContainer').width();
                Timeline.setProgress((e.pageX - $('#jsTimelineProgress').offset().left) / timeline_width);
                Timeline.updateInVideo();
            }
        },

        /**
         * Handle the timeline indicator mousedown event
         */
        timelineIndicatorMousedown: function(e) {
            e.preventDefault();
            Timeline.events.isDragging = true;
        },

        /**
         * Handle the document mouseup event
         */
        documentMouseup: function(e) {
            if (Timeline.events.isDragging) {
                e.preventDefault();
                Timeline.events.isDragging = false;
                Timeline.updateInVideo();
            }
        },

        /**
         * Handle the document mousemove event
         */
        documentMousemove: function(e) {
            if (Timeline.events.isDragging) {
                var timeline_width = $('#jsTimelineContainer').width();
                var e_location = e.pageX - $('#jsTimelineProgress').offset().left;
                if (e_location >= 0 && e_location <= timeline_width) {
                    Timeline.setProgress(e_location / timeline_width);
                }
            }
        },

        /**
         * Pause/play the video when the pause/play button is clicked
         */
        playPauseButtonClick: function() {
            if (VideoPlayerInterface.isPlaying) {
                VideoPlayerInterface.actions.pause();
            } else {
                VideoPlayerInterface.actions.play();
            }
        },

        /**
         * Skip back to the last state in the video
         */
        skipBack: function() {
            VideoPlayerInterface.actions.skipBack();
        },

        /**
         * Skip forward to the next state in the video
         */
        skipForward: function() {
            VideoPlayerInterface.actions.skipForward();
        },

        /**
         * Toggle the fullscreen version of the landing page
         */
        toggleFullscreen: function() {
            FullScreenHandler.toggle();
        }
    }
};

var VideoPlayerInterface = {
    iframeWindow: null,

    updateInterval: null,

    RTCVisit: {},

    isPlaying: false,

    isSourceSet: false,

    StateEngine: {},

    globalVolume: 0,

    currentState: '',

    firstRun: true,

    /**
     * Initialise the video player interface.
     * This class is a proxy that handles all interaction with the video player itself
     */
    initialise: function() {
        try {
            VideoPlayerInterface.iframeWindow = document.getElementById("videoPlayerIframe").contentWindow;
            VideoPlayerInterface.updateFromVideo();
            VideoPlayerInterface.updateInterval = setInterval(function() {
                VideoPlayerInterface.updateFromVideo();
            }, 250);
        } catch(e) {
            console.log("Unable to initialise the VideoPlayerInterface.", e.message);
        }
    },

    /**
     * Get the latest video data and update all affected landing page elements.
     * This function fires at least once every second.
     */
    updateFromVideo: function() {
        try {
            if (VideoPlayerInterface.iframeWindow.rtc && VideoPlayerInterface.iframeWindow.rtc.player && VideoPlayerInterface.iframeWindow.rtc.player.playersReady()) {
                // Wait until the player is ready to initalise the quality selector
                if (!QualitySelector.loaded) {
                    QualitySelector.initialise();
                }

                if (VideoPlayerInterface.firstRun) {
                    var communication = iFrameCommunication();
                    communication.initialize();

                    VideoPlayerInterface.firstRun = false;
                }

                // Update state and timeline position
                VideoPlayerInterface.isSourceSet = VideoPlayerInterface.getSourceSet();
                VideoPlayerInterface.getStates();
                var times = VideoPlayerInterface.iframeWindow.rtc.player.getVideoTimes();
                Timeline.updateStateAndProgress(
                    VideoPlayerInterface.currentState,
                    (times.play / times.status.duration) || 0
                );

                //Update Seen Chapters
                if(Timeline.SettingsJsonObject.SeenChaptersEnabled){
                    Timeline.updateSeenChapterColors();
                }

                //Update buffer Progress
                BufferStatus.updateBuffer();

                // Update is playing
                VideoPlayerInterface.isPlaying = (!times.status.paused);

                // Get data from video
                VideoPlayerInterface.getVisitData();

                // Update play pause
                Timeline.updatePlayPauseButton();

                // Update volume slider
                var globalVolumeFromVideo = VideoPlayerInterface.iframeWindow.globalVolume;
                if (VideoPlayerInterface.globalVolume != globalVolumeFromVideo) {
                    VideoPlayerInterface.globalVolume = globalVolumeFromVideo;
                    VolumeSlider.setVolume(globalVolumeFromVideo);
                }
            }
        } catch (exception) {
            if (window.console) {
                // NOTE: This line is only for debugging.
                // TODO: Comment out or remove the line below when deploying into production
                console.error(exception);
            }
        }

        // Update play pause
        Timeline.updatePlayPauseButton();

        // Update volume slider
        var globalVolumeFromVideo = VideoPlayerInterface.iframeWindow.globalVolume;
        if (VideoPlayerInterface.globalVolume != globalVolumeFromVideo) {
            VideoPlayerInterface.globalVolume = globalVolumeFromVideo;
            VolumeSlider.setVolume(globalVolumeFromVideo);
        }
    },

    /**
     * Gets the name property from data-dict-name. Updates prepared for text with name if exists
     */
    updatePreparedForName: function() {
        var preparedForText = LanguageSelector.getTextByKey("PreparedForText");
        var nameProperty = $("#jsPreparedForName").data("dict-name");
        var preparedName = VideoPlayerInterface.RTCVisit.videoVisitData[nameProperty];

        if (preparedName != null && preparedName.length > 0) {
            if ($("#jsPreparedFor").html() !== preparedForText) {
                $("#jsPreparedFor").html(preparedForText + " ");
            }

            if ($("#jsPreparedForName").html() !== preparedName) {
                $("#jsPreparedForName").html(preparedName);
            }
        }
    },

    /**
     * Get the video visit data
     */
    getVisitData: function() {
        VideoPlayerInterface.RTCVisit = VideoPlayerInterface.iframeWindow.RTCVisit;
        VideoPlayerInterface.updatePreparedForName();
    },

    /**
     * Get the video states
     */
    getStates: function() {
        VideoPlayerInterface.StateEngine = VideoPlayerInterface.iframeWindow.StateEngine;
        VideoPlayerInterface.currentState = VideoPlayerInterface.iframeWindow.rtc.state.currentState();
    },

    /**
     * Get the source set
     */
    getSourceSet: function() {
        try {
            if (VideoPlayerInterface.iframeWindow.rtc.player.video.status().srcSet) {
                return true;
            }
        } catch (ex) {
        }

        return false;
    },

    /**
     * Gets details of the chapters of the current video
     *
     * @return {Array.<Object>} Array of chapter details (start time, duration etc)
     */
    getVideoChapters: function() {
        return VideoPlayerInterface.iframeWindow.rtc.timeline.vars.videoChapters;
    },

    /**
     * Gets the duration of the current video
     *
     * @return {number} Video duration in seconds
     */
    getVideoDuration: function() {
        return VideoPlayerInterface.iframeWindow.rtc.player.videoDuration();
    },

    /**
     * Define the actions for the video player interface
     */
    actions: {
        skipBack: function(currentState) {
            CtaButtons.closeAllSideCards();
            VideoPlayerInterface.iframeWindow.rtc.player.controls.rewind();
        },

        play: function() {
            CtaButtons.closeAllSideCards();
            VideoPlayerInterface.iframeWindow.rtc.player.controls.resume();
        },

        /**
         * Pauses the video
         */
        pause: function() {
            VideoPlayerInterface.iframeWindow.rtc.player.controls.pause();
        },

        skipForward: function(currentState) {
            CtaButtons.closeAllSideCards();
            VideoPlayerInterface.iframeWindow.rtc.player.controls.fastForward();
        },

        selectState: function(clickedState) {
            CtaButtons.closeAllSideCards();
            VideoPlayerInterface.iframeWindow.rtc.timeline.gotoState(clickedState);
        },

        timelinePosition: function(percentage) {
            CtaButtons.closeAllSideCards();
            VideoPlayerInterface.iframeWindow.$("#jquery_jplayer_videoplayer").jPlayer("playHead", percentage * 100);
        },

        volumeChange: function(vol) {
            try {
                if (isNaN(vol)) {
                    return;
                }

                if (
                    VideoPlayerInterface.iframeWindow
                    && VideoPlayerInterface.iframeWindow.rtc
                    && VideoPlayerInterface.iframeWindow.rtc.utils.storeLocal
                    && VideoPlayerInterface.iframeWindow.rtc.player.controls.changeVolume
                ) {
                    VideoPlayerInterface.iframeWindow.rtc.player.controls.changeVolume(vol);
                }
            } catch (exception) {
                if (window.console) {
                    console.error(exception); // TODO: change this line
                }
            }
        }
    }
};

var VolumeSlider = {
    /**
     * Devices where volume cannot be controlled by the player
     * Copied over from the default jPlayer 'novolume' object.
     */
    disabledDevices: [
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
    ],

    /**
     * Initialise the volume slider
     */
    initialise: function(startingVolume) {
        if (Utils.userAgentInList(navigator.userAgent, VolumeSlider.disabledDevices)) {
            VolumeSlider.disable();
            return;
        }

        // Events for volume slider
        VolumeSlider.events.initialise();

        // Starting value
        if (typeof startingVolume == 'undefined' || startingVolume > 1 || startingVolume < 0) {
            startingVolume = 0.5;
        }
        VolumeSlider.setVolume(startingVolume);
    },

    /**
     * Set volume with value between 0 and 1
     *
     * @param value
     */
    setVolume: function(value) {
        if (typeof value == 'undefined') {
            return;
        }

        var percent = Math.ceil(value * 100);
        percent = percent > 100 ? 100 : percent;

        $("#jsVolumeLevel").innerWidth(percent + "%");
        $("#jsVolumeButtonSRText").text("Volume (" + percent + "%)");

        try {
            if (VideoPlayerInterface.actions.volumeChange){
                VideoPlayerInterface.actions.volumeChange(percent);
            }
        } catch (exception) {
            if (window.console) {
                console.error(exception);
            }
        }

        // Set volume logo bars
        if (value > 0.85){
            // 3 Bars
            VolumeSlider.setVolumeIconBars(3)
        } else if (value > 0.5) {
            // 2 bars
            VolumeSlider.setVolumeIconBars(2);
        } else if (value > 0.05) {
            // 1 bar
            VolumeSlider.setVolumeIconBars(1);
        } else {
            // no bars
            VolumeSlider.setVolumeIconBars(0);
        }
    },

    /**
     * Get the player volume between 0 and 1
     *
     * @returns {number}
     */
    getVolume: function() {
        if ($("#jsVolumeLevel").width() === 0) {
            return 0;
        }

        return $("#jsVolumeLevel").innerWidth() / $("#jsVolumeLevelContainer").width();
    },

    /**
     * Sets the volume image with either 0, 1 or 2 bars
     *
     * @param bars
     */
    setVolumeIconBars: function(bars) {
        $('#jsVolumeButtonIcon')
            .removeClass("timeline__button-icon--volume-0")
            .removeClass("timeline__button-icon--volume-1")
            .removeClass("timeline__button-icon--volume-2")
            .removeClass("timeline__button-icon--volume-3")
            .addClass('timeline__button-icon--volume-' + bars);
    },

    /**
     * Hide the volume button and bar on devices where volume cannot be controlled by the player.
     */
    disable: function() {
        $("#jsVolume, #jsVolumeButton").hide();
        $("#jsTimeline").addClass("timeline--no-volume");
    },

    /**
     * Define the event handlers for the volume slider
     */
    events: {
        /**
         * Link up the events and the event handlers
         */
        initialise: function() {
            $('#jsVolumeButton').click(VolumeSlider.events.volumeButtonClickEventHandler);
            $('#jsVolumeBar').click(VolumeSlider.events.volumeLevelClick);
            $('#jsVolumeLevel').click(VolumeSlider.events.volumeLevelClick);
            $('#jsVolumeBall').mousedown(VolumeSlider.events.volumeBallMousedown);
            $(document).mouseup(VolumeSlider.events.documentMouseup)
                .mousemove(VolumeSlider.events.documentMousemove);
        },

        /**
         * Is the user currently dragging volume slider
         *
         * @type {boolean}
         */
        isDragging: false,

        /**
         * Muted Volume
         *
         * @type {number}
         */
        mutedVolume: 0,

        /**
         * Mute/unmute the volume
         */
        volumeButtonClickEventHandler: function(e) {
            // if volume is more than 0 then mute it, otherwise full volume
            if (VolumeSlider.getVolume() > 0) {
                // Store the volume before muting so we can revert back to the original value when we unmute
                VolumeSlider.mutedVolume = VolumeSlider.getVolume();
                VolumeSlider.setVolume(0);
            } else {
                // Revert back to the original volume value
                VolumeSlider.setVolume(VolumeSlider.mutedVolume);
            }
        },

        /**
         * Set the volume by clicking on the slider
         */
        volumeLevelClick: function(e) {
            var volumeBar = $("#jsVolumeLevelContainer"),
                volumeBall = $("#jsVolumeBall");

            if (!volumeBall.is(e.target) && volumeBall.has(e.target).length === 0) {
                var widthOfBar = volumeBar.innerWidth(),
                    pxFromLeftOfBar = e.pageX - volumeBar.offset().left,
                    newVol = (pxFromLeftOfBar / widthOfBar);

                VolumeSlider.setVolume(newVol);
            }
        },

        /**
         * Toggle drag state if we're dragging the slider, and hide the popup if
         * releasing the slider outside the popup area
         */
        documentMouseup: function(e) {
            if (VolumeSlider.events.isDragging) {
                e.preventDefault();
                VolumeSlider.events.isDragging = false;
            }
        },

        /**
         * Start dragging the volume slider ball
         */
        volumeBallMousedown: function(e) {
            e.preventDefault();
            VolumeSlider.events.isDragging = true;
        },

        /**
         * If dragging volume slider, adjust volume as necessary
         */
        documentMousemove: function(e) {
            if (VolumeSlider.events.isDragging) {
                var volumeBar = $("#jsVolumeLevelContainer"),
                    widthOfBar = volumeBar.innerWidth(),
                    pxFromLeftOfBar = e.pageX - volumeBar.offset().left;

                if (pxFromLeftOfBar >= 0 && pxFromLeftOfBar <= widthOfBar) {
                    VolumeSlider.setVolume(pxFromLeftOfBar / widthOfBar);
                }
            }
        }
    }
};
var iFrameCommunication = function() {
    var object = {
        initialize: init
    };

    return object;

    /**
     * Initialize iFrame communication
     */
    function init() {
        try {
            if (VideoPlayerInterface.iframeWindow.rtc.utils.isPostMessageSupported()) {
                postMessageCommunication();
            } else {
                fallbackCommunication();
            }
        } catch(exception) {
            postMessageCommunication();
        }
    }

    //////////////////// PRIVATE //////////////////////

    /**
     * Add listener to post messages from rtc iFrame
     */
    function postMessageCommunication() {
        window.addEventListener("message", function(e) {
            switch (e.data.message) {
                case "showCustomError":
                    iFrameEvents.showErrorCard(e.data.data);
                    break;
                case "closeLowBandwidthCard":
                    iFrameEvents.closeLowBandwidthCard(e.data.data);
                    break;
                case "showLowBandwidthInfo":
                    iFrameEvents.showLowBandwidthInfo(e.data.data);
                    break;
            }
        }, false);
    }

    /**
     * Fake listener based on data attributes to support IE7 and other browsers which not supports window.postMessage
     */
    function fallbackCommunication() {
        var $postHandler = VideoPlayerInterface.iframeWindow.rtc.utils.$getIFrameListener();

        var interval = setInterval(function() {
            var message = $postHandler.data("message");
            var value = $postHandler.data("value");

            switch (message) {
                case "showCustomError":
                    iFrameEvents.showErrorCard(value);
                    resetPostHandler($postHandler);
                    break;
                case "closeLowBandwidthCard":
                    iFrameEvents.closeLowBandwidthCard(value);
                    resetPostHandler($postHandler);
                    break;
                case "showLowBandwidthInfo":
                    iFrameEvents.showLowBandwidthInfo(value);
                    resetPostHandler($postHandler);
                    break;
            }
        }, 250);
    }

    /**
     * Reset message and values from fake listener to prevent firing events in loop
     *
     * @param {object} $postHandler Jquery object with post handler element
     */
    function resetPostHandler($postHandler) {
        $postHandler.data("message", "");
        $postHandler.data("value", "");
    }
};

var iFrameEvents = {
    /**
     * Event occurs when custom error Card is activated
     *
     * @param {string} element Id or class element that exist in iFrame with error
     */
    showErrorCard: function(element) {
        var $elem = $(VideoPlayerInterface.iframeWindow.$(element));

        if ($elem.length > 0) {
            CtaButtons.closeAllSideCards();
            VideoPlayerInterface.actions.pause();
            Timeline.disableTimelineIfNecessary();
            $elem.show();
        }
    },
    /**
     * When low bandwidth card is close by button, show low bandwidth info under video
     *
     * @param {string} element Id or class element that exist in iFrame with error
     */
    closeLowBandwidthCard: function(element) {
        var $lowBandwidthBar = $(VideoPlayerInterface.iframeWindow.$(element));

        if ($lowBandwidthBar.length > 0) {
            $lowBandwidthBar.prependTo("#jsHeaderLowBandwidth");
        }

        Timeline.enableTimelineIfNecessary();
    },
    /**
     * When low bandwidth again will discover after turned off low bandwidh card show bottom message again
     *
     * @param {string} element Id or class element that should exist in iFrame with low bandwidth info
     */
    showLowBandwidthInfo: function(element) {
        var $lowBandwidthBar = $(element);

        if ($lowBandwidthBar.length > 0) {
            $(element).fadeIn();
        }
    }
};

var MobileOrientationHandler = {
    orientation: "portrait",

    /**
     * Initialises the MobileOrientationHandler
     */
    initialise: function() {
        if ($(window).height() <= $(window).width()) {
            MobileOrientationHandler.orientation = "landscape";
        } else {
            MobileOrientationHandler.orientation = "portrait";
        }

        MobileOrientationHandler.events.initialise();
        MobileOrientationHandler.resizeVideoArea();
    },

    /**
     * Checks whether the automatic scrolling/resizing of the video should be enabled.
     *
     * This check is performed using the visibility of the timeline indicator (only visible on tablet/mobile views)
     * and the device user agent.
     *
     * @return {boolean} true if the automatic scrolling/resizing should be enabled, otherwise false
     */
    shouldEnable: function() {
        return $("#jsTimelineIndicator").is(":visible") && navigator.userAgent.match(/Android|iPhone|Windows Phone|iPod/i);
    },

    /**
     * Automatically scrolls the window to the top of the video area
     */
    scrollToVideo: function() {
        if (MobileOrientationHandler.shouldEnable()) {
                $("html, body").animate(
                { scrollTop: $("#jsPlayerIframe").offset().top },
                1000
            );
        }
    },

    /**
     * Resizes the video/cta/timeline area to ensure it fits within a non 16/9 screen.
     */
    resizeVideoArea: function() {
        var mainWidth;
        if ($(window).innerWidth() / $(window).innerHeight() >= 16 / 9 && MobileOrientationHandler.shouldEnable() && $("#jsTopWrapper").hasClass("top-wrapper--no-cta")) {
            mainWidth = (Math.ceil($(window).innerHeight() * (16 / 9))) - $(".cta--side").width();
        } else if ($(window).innerWidth() / $(window).innerHeight() > 16 / 9 && MobileOrientationHandler.shouldEnable()) {
            mainWidth = Math.ceil($(window).innerHeight() * (16 / 9));
        } else {
            mainWidth = "";
        }

        var jsMain = $("#jsMain");
        if (navigator.userAgent.match(/Android/i)) {
            jsMain.toggleClass("android-landscape", screen.orientation.type.includes("landscape"));
        }

        jsMain.css("width", (mainWidth));
        Timeline.update(mainWidth);
    },

    events: {
        /**
         * Initialises the events for the MobileOrientationHandler
         */
        initialise: function() {
            $(window).resize(MobileOrientationHandler.events.handleResize);
        },

        /**
         * Function called by the window.resize event
         */
        handleResize: function() {
            var height = $(window).height(),
                width = $(window).width();

            if (height <= width && MobileOrientationHandler.orientation === "portrait") {
                MobileOrientationHandler.orientation = "landscape";
                MobileOrientationHandler.scrollToVideo();
            } else if (height > width && MobileOrientationHandler.orientation === "landscape") {
                MobileOrientationHandler.orientation = "portrait";

                // When switching from landscape to portrait on android, exit fullscreen if necessary
                if (FullScreenHandler.isActive() && navigator.userAgent.match(/Android/i)) {
                    FullScreenHandler.exitFullScreen();
                }
            }

            MobileOrientationHandler.resizeVideoArea();
        }
    }
};

var FullScreenHandler = {
    /**
     * Initialises the fullscreen handler
     */
    initialise: function() {
        var fullScreenEnabled = Timeline.SettingsJsonObject.FullScreenEnabled,
            supportedDevice = Modernizr.fullscreen;

        if (!fullScreenEnabled || !supportedDevice) {
            FullScreenHandler.disable();
            return;
        }

        FullScreenHandler.events.initialise();
        FullScreenHandler.events.handleResize();
    },

    /**
     * Disables the fullscreen button on unsupported devices
     */
    disable: function() {
        $('#jsFullScreenButton').remove();
        $('#jsTimelineControlsRight').addClass('timeline__controls--right-no-fs');
    },

    /**
     * Checks whether the fullscreen version of the landing page is currently active
     *
     * @return {boolean} whether the fullscreen version of the landing page is active or not
     */
    isActive: function() {
        return $("html").hasClass("fullscreen");
    },

    /**
     * Checks whether the window has an aspect ratio narrower than the one specified
     *
     * @param {array} windowRatio the aspect ratio of the window (w:h)
     * @param {array} ratio       the aspect ratio to compare against window (w:h)
     *
     * @return {boolean} whether the window has an aspect ratio narrower than the one specified
     */
    isRatioNarrowerThan: function(windowRatio, ratio) {
        return windowRatio[0] / windowRatio[1] < ratio[0] / ratio[1];
    },

    /**
     * Toggles the fullscreen version of the landing page
     */
    toggle: function() {
        if (!FullScreenHandler.isActive()) {
            FullScreenHandler.enterFullScreen();
        } else {
            FullScreenHandler.exitFullScreen();
        }
    },

    /**
     * Enables the fullscreen version of the landing page
     */
    enterFullScreen: function() {
        var elem = $("#jsTopWrapper").get(0);

        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    },

    /**
     * Disables the fullscreen version of the landing page
     */
    exitFullScreen: function() {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }
    },

    events: {
        /**
         * Initialises the events for the fullscreen handler
         */
        initialise: function() {
            $(document).on(
                "fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange",
                FullScreenHandler.events.toggleHtmlChanges
            );

            $(window).resize(FullScreenHandler.events.handleResize);
        },

        /**
         * Toggles the fullscreen HTML changes (inc. classes) on the landing page
         */
        toggleHtmlChanges: function() {
            $("html").toggleClass("fullscreen");
            $("#jsFullScreenIcon").toggleClass("timeline__button-icon--fullscreen timeline__button-icon--fullscreen-in");

            if (!FullScreenHandler.isActive()) {
                $("#jsHeader").prepend($("#jsSocialIconsTop"));
            } else {
                $("#jsMain").append($("#jsSocialIconsTop"));
            }
        },

        /**
         * Handles the window resizing, to change the fullscreen class if the aspect ratio is narrower than 16:9
         */
        handleResize: function() {
            var width = $(window).innerWidth(),
                height = $(window).innerHeight();

            if (FullScreenHandler.isRatioNarrowerThan([width, height], [16, 9])) {
                $("html").addClass("less-16-9");
            } else {
                $("html").removeClass("less-16-9");
            }
        }
    }
};
