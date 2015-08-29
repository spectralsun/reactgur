let inOutQuintic = (t, b, c, d) => {
  var ts = (t/=d)*t,
  tc = ts*t;
  return b+c*(6*tc*ts + -15*ts*ts + 10*tc);
};

let requestAnimFrame = (() => {
  return window.requestAnimationFrame || 
         window.webkitRequestAnimationFrame || 
         window.mozRequestAnimationFrame || 
         function( callback ){ window.setTimeout(callback, 1000 / 60); };
})();

let move = (amount) => {
  document.documentElement.scrollTop = amount;
  document.body.parentNode.scrollTop = amount;
  document.body.scrollTop = amount;
}
let position = () => {
  return document.documentElement.scrollTop || 
         document.body.parentNode.scrollTop || 
         document.body.scrollTop;
}

const scrollToPos = (to, callback, duration) => {
  // because it's so fucking difficult to detect the scrolling element, just move them all
  var start = position();
  var change = to - start;
  var currentTime = 0;
  var increment = 20;
  var duration = (typeof(duration) === 'undefined') ? 500 : duration;
  let animateScroll = () => {
    // increment the time
    currentTime += increment;
    // find the value with the quadratic in-out easing function
    var val = inOutQuintic(currentTime, start, change, duration);
    // move the document.body
    move(val);
    // do the animation unless its over
    if (currentTime < duration) {
      requestAnimFrame(animateScroll);
    } else {
      if (callback && typeof(callback) === 'function') {
        // the animation is done so lets callback
        callback();
      }
    }
  };
  animateScroll();
}

export default scrollToPos;