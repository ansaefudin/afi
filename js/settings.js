/**
 * settings.js
 *
 * The settings contained in file are used to define the project specific settings required for
 * the landing page to be fully functional. These settings are used throughout the core JavaScript
 * and defined here to be easily updatable.
 *
 * Each variable below has a short explanation of how to use it and is covered fully in the documentation.
 */

/**
 * Settings for the Social Icons, which appear at the top or bottom of the page depending on the screen width.
 *
 * "position" can be set to either "left" or "right", and specifies which side the social icons will appear on
 * non-mobile breakpoints.
 *
 * "icons" can be set to a list of icons to display. The key for each icon should match the CSS modifier
 * in the form of '.social__icon--key'.
 *
 * Within each icon object;
 *      "url" sets the link the icon will open.
 *      "text" sets the alternate text used on screen-readers by default
 */
var socialIconSettings = {
    "position": "right",
    "icons": {
        "facebook": {
            "url": "https://facebook.com",
            "text": "Facebook"
        },
        "twitter": {
            "url": "https://twitter.com",
            "text": "Twitter"
        },
        "googleplus": {
            "url": "https://plus.google.com",
            "text": "Google+"
        },
        "email": {
            "url": "mailto:",
            "text": "Email"
        },
        "link": {
            "url": "https://pb.com",
            "text": "Website"
        }
    }
};

/**
 * Settings for the timeline where chapters and progress are displayed.
 *
 * "SeenChaptersEnabled" gives the option to change the text color of chapters that have been viewed (using the
 *    '.timeline-chapters--seen' CSS class)
 * "ContrastProgressBarEnabled" enables the contrast progress bar on the timeline (using the '.timeline-contrast'
 *    and '.timeline-contrast-hover' CSS classes)
 * "BufferBarEnabled" enables the buffering bar section of the timeline
 * "ClosedCaptionsSupported" enables the closed caption option in the settings menu
 * "MultiLanguageSupported" enables the language selection option in the settings menu
 * "FullScreenEnabled" enables the fullscreen functionality of the landing page
 */
var timelineSettings = {
    "SeenChaptersEnabled": false,
    "ContrastProgressBarEnabled": false,
    "BufferBarEnabled": true,
    "ClosedCaptionsSupported": true,
    "MultiLanguageSupported": true,
    "FullScreenEnabled": true
};

/**
 * Settings for the language selector.
 *
 * "defaultLanguage" sets the default language for the landing page. This should correspond to an existing language file.
 * "languages" sets the languages available for use on the landing page. Within each language object, the key should match
 *    the name of the corresponding language file. And the value will be displayed on the language selection menu.
 */
var languageSettings = {
    "defaultLanguage": "en",
    "languages": {
        "en": "English (EN)",
        "es": "Espa&ntilde;ol (ES)"
    }
};
