(function() {
    var SwipeContent = function(element) {
        this.element = element;
        this.delta = [false, false];
        this.dragging = false;
        this.intervalId = false;
        initSwipeContent(this);
    };

    function initSwipeContent(content) {
        content.element.addEventListener('mousedown', handleEvent.bind(content));
        content.element.addEventListener('touchstart', handleEvent.bind(content), {passive: true});
    };

    function initDragging(content) {
        //add event listeners
        content.element.addEventListener('mousemove', handleEvent.bind(content));
        content.element.addEventListener('touchmove', handleEvent.bind(content), {passive: true});
        content.element.addEventListener('mouseup', handleEvent.bind(content));
        content.element.addEventListener('mouseleave', handleEvent.bind(content));
        content.element.addEventListener('touchend', handleEvent.bind(content));
    };

    function cancelDragging(content) {
        //remove event listeners
        if(content.intervalId) {
            (!window.requestAnimationFrame) ? clearInterval(content.intervalId) : window.cancelAnimationFrame(content.intervalId);
            content.intervalId = false;
        }
        content.element.removeEventListener('mousemove', handleEvent.bind(content));
        content.element.removeEventListener('touchmove', handleEvent.bind(content));
        content.element.removeEventListener('mouseup', handleEvent.bind(content));
        content.element.removeEventListener('mouseleave', handleEvent.bind(content));
        content.element.removeEventListener('touchend', handleEvent.bind(content));
    };

    function handleEvent(event) {
        switch(event.type) {
            case 'mousedown':
            case 'touchstart':
                startDrag(this, event);
                break;
            case 'mousemove':
            case 'touchmove':
                drag(this, event);
                break;
            case 'mouseup':
            case 'mouseleave':
            case 'touchend':
                endDrag(this, event);
                break;
        }
    };

    function startDrag(content, event) {
        content.dragging = true;
        // listen to drag movements
        initDragging(content);
        content.delta = [parseInt(unify(event).clientX), parseInt(unify(event).clientY)];
        // emit drag start event
        emitSwipeEvents(content, 'dragStart', content.delta, event.target);
    };

    function endDrag(content, event) {
        cancelDragging(content);
        // credits: https://css-tricks.com/simple-swipe-with-vanilla-javascript/
        var dx = parseInt(unify(event).clientX),
            dy = parseInt(unify(event).clientY);

        // check if there was a left/right swipe
        if(content.delta && (content.delta[0] || content.delta[0] === 0)) {
            var s = getSign(dx - content.delta[0]);

            if(Math.abs(dx - content.delta[0]) > 30) {
                (s < 0) ? emitSwipeEvents(content, 'swipeLeft', [dx, dy]) : emitSwipeEvents(content, 'swipeRight', [dx, dy]);
            }

            content.delta[0] = false;
        }
        // check if there was a top/bottom swipe
        if(content.delta && (content.delta[1] || content.delta[1] === 0)) {
            var y = getSign(dy - content.delta[1]);

            if(Math.abs(dy - content.delta[1]) > 30) {
                (y < 0) ? emitSwipeEvents(content, 'swipeUp', [dx, dy]) : emitSwipeEvents(content, 'swipeDown', [dx, dy]);
            }

            content.delta[1] = false;
        }
        // emit drag end event
        emitSwipeEvents(content, 'dragEnd', [dx, dy]);
        content.dragging = false;
    };

    function drag(content, event) {
        if(!content.dragging) return;
        // emit dragging event with coordinates
        (!window.requestAnimationFrame)
            ? content.intervalId = setTimeout(function(){emitDrag.bind(content, event);}, 250)
            : content.intervalId = window.requestAnimationFrame(emitDrag.bind(content, event));
    };

    function emitDrag(event) {
        emitSwipeEvents(this, 'dragging', [parseInt(unify(event).clientX), parseInt(unify(event).clientY)]);
    };

    function unify(event) {
        // unify mouse and touch events
        return event.changedTouches ? event.changedTouches[0] : event;
    };

    function emitSwipeEvents(content, eventName, detail, el) {
        var trigger = false;
        if(el) trigger = el;
        // emit event with coordinates
        var event = new CustomEvent(eventName, {detail: {x: detail[0], y: detail[1], origin: trigger}});
        content.element.dispatchEvent(event);
    };

    function getSign(x) {
        if(!Math.sign) {
            return ((x > 0) - (x < 0)) || +x;
        } else {
            return Math.sign(x);
        }
    };

    window.SwipeContent = SwipeContent;

    //initialize the SwipeContent objects
    var swipe = document.getElementsByClassName('js-swipe-content');
    if( swipe.length > 0 ) {
        for( var i = 0; i < swipe.length; i++) {
            (function(i){new SwipeContent(swipe[i]);})(i);
        }
    }
}());

(function() {
    var ComparisonSlider = function(element) {
        this.element = element;
        this.modifiedImg = this.element.getElementsByClassName('js-compare-slider__img--modified')[0];
        this.handle = this.element.getElementsByClassName('js-compare-slider__handle')[0];
        this.keyboardHandle = this.element.getElementsByClassName('js-compare-slider__input-handle')[0];
        this.captions = this.element.getElementsByClassName('js-compare-slider__caption');
        // drag
        this.dragStart = false;
        this.animating = false;
        this.leftPosition = 50;
        // store container width
        this.sliderWidth = getSliderWidth(this);
        initComparisonSlider(this);
    };

    function getSliderWidth(slider) {
        return slider.element.offsetWidth;
    };

    function initComparisonSlider(slider) {
        // initial animation
        if(reducedMotion) { // do not animate slider elements
            slider.element.classList.add('compare-slider--reduced-motion', 'compare-slider--in-viewport');
        } else if(intersectionObserverSupported) { // reveal slider elements when it enters the viewport
            var observer = new IntersectionObserver(sliderObserve.bind(slider), { threshold: [0, 0.3] });
            observer.observe(slider.element);
            modifiedImgAnimation(slider);
        } else { // reveal slider elements right away
            slider.element.classList.add('compare-slider--in-viewport');
            modifiedImgAnimation(slider);
        }
        // init drag functionality
        new SwipeContent(slider.element);
        slider.element.addEventListener('dragStart', function(event){
            if(!event.detail.origin.closest('.js-compare-slider__handle')) return;
            slider.element.classList.add('compare-slider--is-dragging');
            if(!slider.dragStart) {
                slider.dragStart = event.detail.x;
                detectDragEnd(slider);
            }
        });
        // slider.element.addEventListener('dragging', function(event){
        slider.element.addEventListener('mousemove', function(event){
            sliderDragging(slider, event)
        });
        slider.element.addEventListener('touchmove', function(event){
            sliderDragging(slider, event)
        });

        // detect mouse leave
        slider.element.addEventListener('mouseleave', function(event){
            sliderResetDragging(slider, event);
        });
        slider.element.addEventListener('touchend', function(event){
            sliderResetDragging(slider, event);
        });

        // on resize -> update slider width
        window.addEventListener('resize', function(){
            slider.sliderWidth = getSliderWidth(slider);
        });

        // detect change in keyboardHandle input -> allow keyboard navigation
        slider.keyboardHandle.addEventListener('change', function(event){
            slider.leftPosition = Number(slider.keyboardHandle.value);
            updateCompareSlider(slider, 0);
        });
    };

    function modifiedImgAnimation(slider) {
        // make sure modified img animation runs only one time
        slider.modifiedImg.addEventListener('animationend', function cb() {
            slider.modifiedImg.removeEventListener('animationend', cb);
            slider.modifiedImg.style.animation = 'none';
        });
    };

    function sliderDragging(slider, event) {
        if(!slider.dragStart) return;
        var pageX = event.pageX || event.touches[0].pageX;
        if(slider.animating || Math.abs(pageX - slider.dragStart) < 5) return;
        slider.animating = true;
        updateCompareSlider(slider, pageX - slider.dragStart);
        slider.dragStart = pageX;
    };

    function sliderResetDragging(slider, event) {
        if(!slider.dragStart) return;
        if(event.pageX < slider.element.offsetLeft) {
            slider.leftPosition = 0;
            updateCompareSlider(slider, 0);
        }
        if(event.pageX > slider.element.offsetLeft + slider.element.offsetWidth) {
            slider.leftPosition = 100;
            updateCompareSlider(slider, 0);
        }
    };

    function sliderObserve(entries, observer) {
        if(entries[0].intersectionRatio.toFixed(1) > 0) { // reveal slider elements when in viewport
            this.element.classList.add('compare-slider--in-viewport');
            observer.unobserve(this.element);
        }
    };

    function detectDragEnd(slider) {
        document.addEventListener('click', function cb(event){
            document.removeEventListener('click', cb);
            slider.element.classList.remove('compare-slider--is-dragging');
            updateCompareSlider(slider, event.detail.x - slider.dragStart);
            slider.dragStart = false;
        });
    };

    function updateCompareSlider(slider, delta) {
        var percentage = (delta*100/slider.sliderWidth);
        if(isNaN(percentage)) return;
        slider.leftPosition = Number((slider.leftPosition + percentage).toFixed(2));
        if(slider.leftPosition < 0) slider.leftPosition = 0;
        if(slider.leftPosition > 100) slider.leftPosition = 100;
        // update slider elements -> modified img width + handle position + input element (keyboard accessibility)
        slider.keyboardHandle.value = slider.leftPosition;
        slider.handle.style.left = slider.leftPosition + '%';
        slider.modifiedImg.style.width = slider.leftPosition + '%';
        updateCompareLabels(slider);
        slider.animating = false;
    };

    function updateCompareLabels(slider) { // update captions visibility
        for(var i = 0; i < slider.captions.length; i++) {
            var delta = ( i == 0 )
                ? slider.captions[i].offsetLeft - slider.modifiedImg.offsetLeft - slider.modifiedImg.offsetWidth
                : slider.modifiedImg.offsetLeft + slider.modifiedImg.offsetWidth - slider.captions[i].offsetLeft - slider.captions[i].offsetWidth;
            slider.captions[i].classList.toggle('compare-slider__caption--hide', delta < 10);
        }
    };

    window.ComparisonSlider = ComparisonSlider;

    //initialize the ComparisonSlider objects
    var comparisonSliders = document.getElementsByClassName('js-compare-slider'),
        intersectionObserverSupported = ('IntersectionObserver' in window && 'IntersectionObserverEntry' in window && 'intersectionRatio' in window.IntersectionObserverEntry.prototype),
        reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if( comparisonSliders.length > 0 ) {
        for( var i = 0; i < comparisonSliders.length; i++) {
            (function(i){
                new ComparisonSlider(comparisonSliders[i]);
            })(i);
        }
    }
}());