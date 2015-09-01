export default class Scroll 
{
    constructor(scrollNode) {
        this.scrollNode = scrollNode;
    }

    inOutQuintic(t, b, c, d) {
        var ts = ( t /= d) * t,
        tc = ts * t;
        return b + c * (6 * tc * ts + -15 * ts * ts + 10 * tc);
    }

    move(amount) {
        if (this.scrollNode)
            this.scrollNode.scrollTop = amount;
        else {
            document.documentElement.scrollTop = amount;
            document.body.parentNode.scrollTop = amount;
            document.body.scrollTop = amount;
        }
    }
    position() {
        if (this.scrollNode)
            return this.scrollNode.scrollTop;
        return document.documentElement.scrollTop || 
               document.body.parentNode.scrollTop || 
               document.body.scrollTop;
    }

    scrollToPos(to, callback, duration) {
        var start = this.position();
        var change = to - start;
        var currentTime = 0;
        var increment = 20;
        var duration = (typeof(duration) === 'undefined') ? 500 : duration;
        let requestAnimFrame = (() => {
            return window.requestAnimationFrame || 
                   window.webkitRequestAnimationFrame || 
                   window.mozRequestAnimationFrame || 
                   function( callback ){ window.setTimeout(callback, 1000 / 60); };
        })();
        let animateScroll = () => {
            // increment the time
            currentTime += increment;
            // find the value with the quadratic in-out easing function
            var val = this.inOutQuintic(currentTime, start, change, duration);
            // move the document.body
            this.move(val);
            // do the animation unless its over
            if (currentTime < duration) {
                requestAnimFrame(animateScroll.bind(this));
            } else {
                if (callback && typeof(callback) === 'function') {
                    // the animation is done so lets callback
                    callback();
                }
            }
        };
        animateScroll.bind(this)();
    }
}