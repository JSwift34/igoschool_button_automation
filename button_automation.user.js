// ==UserScript==
// @name        Automated submit buttons
// @description Automatically clicks on submit button in Go training system at http://internetgoschool.com/.
// @namespace   https://github.com/JSwift34/igoschool_button_automation/
// @match       http://internetgoschool.com/auth/problems/*
// @match       https://internetgoschool.com/auth/problems/*
// @include     http://internetgoschool.com/auth/problems/*
// @include     https://internetgoschool.com/auth/problems/*
// @version     1.1.1
// @author      Jonathan Swift
// @encoding utf-8
// @license MPL 2.0
// @copyright   2017+, Jonathan Swift
// @homepage        https://github.com/JSwift34/igoschool_button_automation/
// @homepageURL     https://github.com/JSwift34/igoschool_button_automation/blob/master/README.md
// @twitterURL      https://twitter.com/ppms_life2
// @updateURL       https://raw.githubusercontent.com/JSwift34/igoschool_button_automation/master/button_automation.user.js
// @downloadURL     https://raw.githubusercontent.com/JSwift34/igoschool_button_automation/master/button_automation.user.js
// @contactURL      https://github.com/JSwift34/igoschool_button_automation/issues
// @supportURL      https://github.com/JSwift34/igoschool_button_automation/issues
// @contributionURL https://www.patreon.com/ppms
// @run-at      document-idle
// @grant       none
// ==/UserScript==
/*jslint sub: true, plusplus: true */
/*global $, clearTimeout, setTimeout */

$(function () {
    'use strict';
    var made_mistake = false,
        done_without_mistake = true,
        mistakes = 0,
        clicks = 0,
        QUESTION_REG = /\:(\?|yes)/i,
        next_step_btn_resolver,
        reviewing_regime_btn_resolver,
        timeout,
        default_cfg = {
            'timeout': {
                'ok': 720,
                'restart': 1000,
                'mistake': 3300,
                'word_const': 130,
                'wait_before_check': 530
            },
            'current_reviewing_regime': 'normal', // strict
            'on': true
        },
        cfg = $.cookie('button_automation', JSON.parse) || default_cfg,
        cfg_dialog,
        $controls_holder = $('#discuss'),
        $content_holder = $('#igs-body'),
        got_it_btn_id = '#got_it',
        not_yet_btn_id = '#not_yet',
        next_problem_btn_id = '#cram',
        easy_problem_btn_id = '#easy',
        good_problem_btn_id = '#good',
        hard_problem_btn_id = '#hard',
        restart_btn_id = '#restart',
        forgotten_problem_btn_id = '#forgotten';

    function noop() {}

    function dataFocus() {
        return $('[data-focus]').toArray();
    }

    function isQuestion() {
        return dataFocus().some(function (el) {
            return QUESTION_REG.test($(el).data('focus').LB);
        });
    }

    function problemComments() {
        return dataFocus().map(function (el) {
            return $(el).data('focus').C;
        });
    }

    function sortedComments() {
        return problemComments().sort(function (a, b) {
            return a.length <= b.length;
        });
    }

    function longestComment() {
        return sortedComments()[0] || '';
    }

    function countCommentWords() {
        return longestComment().split(' ').length;
    }

    function waitIntervalBeforeSubmit(made_mistake, done_without_mistake, words_count) {
        var timeout_type = done_without_mistake ? (made_mistake ? 'mistake' : 'ok') : 'restart';

        return cfg.timeout[timeout_type] + words_count * cfg.timeout.word_const;
    }

    function currentReviewingRegimeBtn() {
        return reviewing_regime_btn_resolver[cfg.current_reviewing_regime];
    }

    function studyType() {
        return $('#eval_title').text().split('.')[0].replace(' ', '_').toLowerCase() || 'quick_look';
    }

    function clickHandler() {
        clearTimeout(clickHandler.timeout);
        clickHandler[$('#probstatus').attr('class')]();
    }

    clickHandler.undefined = noop;
    clickHandler.timeout = 1;

    clickHandler.wrong = function () {
        done_without_mistake = false;
        mistakes += 1;
        made_mistake = true;
    };

    clickHandler.correct = function () {
        this.timeout = setTimeout(function () {
            var btn_id = next_step_btn_resolver[studyType()](made_mistake, done_without_mistake, clicks);
            $(btn_id).click();
            done_without_mistake = true;
        }, waitIntervalBeforeSubmit(made_mistake, done_without_mistake, countCommentWords()));
    };

    function storeConfig(cfg) {
        $.cookie('button_automation',
            JSON.stringify(cfg),
            {
                path: '/auth/problems/',
                expires: 365
            });
    }

    function configLinkHtml() {
        return '<span>Auto</span>';
    }

    function toggleLinkHtml(on) {
        var sub = {
            true: { text: '(on)', color: '#78AB46' },
            false: { text: '(off)', color: '#608341' }
        };

        return $('<span />', {
            'text': sub[on].text,
            'style': 'color: ' + sub[on].color
        });
    }

    function configMenuLink() {
        return $('<a>', {
            'html': configLinkHtml(),
            'id': 'button_automation_config_link',
            'title': 'Open button automation config dialog.',
            'style': 'padding: 0 0 0 4px;'
        }
            );
    }

    function automationToggleLink(is_on) {
        return $('<a>', {
            'html': toggleLinkHtml(is_on),
            'id': 'button_automation_toggle_link',
            'title': 'Toggle automation',
            'style': 'padding: 0px 2px;'
        });
    }

    function configFormHtml(cfg) {
        return $('<div/>')
            .append(
                $('<textarea/>', {
                    rows: 12,
                    cols: 60,
                    text: JSON.stringify(cfg, undefined, 4)
                })
            ).append(
                $('<a/>', {
                    'text': ' Documentation. ',
                    'href': 'https://github.com/JSwift34/igoschool_button_automation/blob/master/README.md#configuration-options',
                    'target': '_blank'
                })
            );
    }

    function configForm(cfg) {
        return $('<form>', {
            'html': configFormHtml(cfg),
            'id': 'button_automation_config_form'
        });
    }

    function updateConfigEditorData(cfg) {
        $('#button_automation_config_form textarea').val(JSON.stringify(cfg, undefined, 4));
    }

    function isOn() {
        return cfg.on && !isQuestion();
    }

    function updateToggleLinkText(is_on) {
        $('#button_automation_toggle_link')
            .html(toggleLinkHtml(is_on));
    }

    next_step_btn_resolver = {
        'learning': function (made_mistake, done_without_mistake, clicks) {
            if (done_without_mistake) {
                if (made_mistake) {
                    return not_yet_btn_id;
                }

                return got_it_btn_id;
            }

            return restart_btn_id;
        },

        'quick_look': function (made_mistake, done_without_mistake, clicks) {
            return done_without_mistake ? next_problem_btn_id : restart_btn_id;
        },

        'reviewing': function (made_mistake, done_without_mistake, clicks) {
            if (!done_without_mistake) {
                return restart_btn_id;
            }

            return currentReviewingRegimeBtn()(mistakes, clicks);
        }
    };

    reviewing_regime_btn_resolver = {
        'normal': function (mistakes, clicks) {
            if (mistakes === 0) {
                if (clicks > 1) {
                    return good_problem_btn_id;
                }

                return easy_problem_btn_id;
            }

            if (mistakes === 1) {
                return hard_problem_btn_id;
            }

            return forgotten_problem_btn_id;
        },

        'strict': function (mistakes, clicks) {
            if (mistakes === 0) {
                return hard_problem_btn_id;
            }

            return forgotten_problem_btn_id;
        }
    };

    $content_holder.append(configForm(cfg));
    $controls_holder.append(configMenuLink());
    setTimeout(function () {
        $controls_holder.append(automationToggleLink(isOn()));
    }, 850);

    cfg_dialog = $('#button_automation_config_form').dialog({
        autoOpen: false,
        modal: true,
        title: 'Button automation configuration',
        width: '50%',
        buttons: {
            'Restore': {
                'text': 'Restore defaults',
                'click': function () {
                    updateConfigEditorData(default_cfg);
                }
            },

            'Save and close': function () {
                cfg = JSON.parse($('#button_automation_config_form textarea').val());
                updateToggleLinkText(isOn());
                cfg_dialog.dialog('close');
            }
        },
        close: function () {
            storeConfig(cfg);
        }
    });

    $content_holder.on('click', '#button_automation_config_link', function () {
        cfg_dialog.dialog('open');
    });

    $content_holder.on('click', '#button_automation_toggle_link', function () {
        if (isQuestion()) {
            return;
        }

        cfg.on = !cfg.on;
        updateConfigEditorData(cfg);
        updateToggleLinkText(isOn());
        storeConfig(cfg);
    });

    $content_holder.on('click', '#board', function () {
        if (!isOn()) {
            return;
        }

        clicks += 1;
        clearTimeout(timeout);
        timeout = setTimeout(clickHandler, cfg.timeout.wait_before_check);
    });
});
