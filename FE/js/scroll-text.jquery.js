(function($) {
    "use strict";

    $.fn.scrollText = function(val) {
        return this.each(function() {
            var $this = $(this);
            new ScrollTextItem($this, val);
        });
    };

    function ScrollTextItem($elem, value) {
        this.$elem = $elem;
        this.value = value;
        this.$content = $elem.find('.b-scrollable-text__content-wrap');

        if (!this.$content.length) {
            this.initAndSlide();
        } else {
            this.updateAndSlide();
        }
    }

    ScrollTextItem.prototype.initAndSlide = function() {
        var that = this;

        this.$elem.addClass('b-scrollable-text');
        this.$content = $('<div class="b-scrollable-text__content-wrap"></div>');
        this.$slider = $('<div class="b-scrollable-text__slider"></div>');
        this.$current = $('<div class="b-scrollable-text__current"></div>').text(String.fromCharCode(160)); // Same as &nbsp;
        this.$next = $('<div class="b-scrollable-text__next"></div>').text(this.value);

        this.$slider
            .append(this.$next)
            .append(this.$current);

        this.$content.html(this.$slider);
        this.$elem
            .css('opacity', 0)
            .html(this.$content);

        setTimeout(function() {
            var height = that.$current.height();

            that.$elem.css('opacity', '');
            that.$content.css({ 'max-height': height });
            that.slide(height);
        }, 25);
    };

    ScrollTextItem.prototype.updateAndSlide = function() {
        var height = this.$content.height();

        this.$current = this.$elem.find('.b-scrollable-text__current');
        this.$next = this.$elem.find('.b-scrollable-text__next');
        this.$slider = this.$elem.find('.b-scrollable-text__slider');

        this.$current.text(this.$next.text());
        this.$next.text(this.value);

        this.slide(height);
    };

    ScrollTextItem.prototype.slide = function(height) {
        var that = this,
            transform = 'translate3d(0, ' + (-1 * height) + 'px, 0)';

        this.$slider
            .removeClass('animate')
            .css({
                '-webkit-transform': transform,
                '-moz-transform': transform,
                '-ms-transform': transform,
                '-o-transform': transform,
                'transform': transform
            });

        setTimeout(function() {
            transform = 'translate3d(0, 0, 0)';

            that.$slider
                .addClass('animate')
                .css({
                    '-webkit-transform': transform,
                    '-moz-transform': transform,
                    '-ms-transform': transform,
                    '-o-transform': transform,
                    'transform': transform
                })
        }, 1);
    }
}(jQuery));