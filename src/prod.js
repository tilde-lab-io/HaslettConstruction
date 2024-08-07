let newYear = new Date().getFullYear();
let currentYear = document.getElementById("year");
currentYear.innerHTML = newYear.toString();
  
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
        this.beforeImg = this.element.getElementsByClassName('js-compare-slider__img--before')[0];
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
            beforeImgAnimation(slider);
        } else { // reveal slider elements right away
            slider.element.classList.add('compare-slider--in-viewport');
            beforeImgAnimation(slider);
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

    function beforeImgAnimation(slider) {
        // make sure before img animation runs only one time
        slider.beforeImg.addEventListener('animationend', function cb() {
            slider.beforeImg.removeEventListener('animationend', cb);
            slider.beforeImg.style.animation = 'none';
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
        // update slider elements -> before img width + handle position + input element (keyboard accessibility)
        slider.keyboardHandle.value = slider.leftPosition;
        slider.handle.style.left = slider.leftPosition + '%';
        slider.beforeImg.style.width = slider.leftPosition + '%';
        updateCompareLabels(slider);
        slider.animating = false;
    };

    function updateCompareLabels(slider) { // update captions visibility
        for(var i = 0; i < slider.captions.length; i++) {
            var delta = ( i == 0 )
                ? slider.captions[i].offsetLeft - slider.beforeImg.offsetLeft - slider.beforeImg.offsetWidth
                : slider.beforeImg.offsetLeft + slider.beforeImg.offsetWidth - slider.captions[i].offsetLeft - slider.captions[i].offsetWidth;
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


// File#: _1_modal-window
// Usage: codyhouse.co/license
(function() {
    var Modal = function(element) {
        this.element = element;
        this.triggers = document.querySelectorAll('[aria-controls="'+this.element.getAttribute('id')+'"]');
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.moveFocusEl = null; // focus will be moved to this element when modal is open
        this.modalFocus = this.element.getAttribute('data-modal-first-focus') ? this.element.querySelector(this.element.getAttribute('data-modal-first-focus')) : null;
        this.selectedTrigger = null;
        this.preventScrollEl = this.getPreventScrollEl();
        this.showClass = "modal--is-visible";
        this.initModal();
    };

    Modal.prototype.getPreventScrollEl = function() {
        var scrollEl = false;
        var querySelector = this.element.getAttribute('data-modal-prevent-scroll');
        if(querySelector) scrollEl = document.querySelector(querySelector);
        return scrollEl;
    };

    Modal.prototype.initModal = function() {
        var self = this;
        //open modal when clicking on trigger buttons
        if ( this.triggers ) {
            for(var i = 0; i < this.triggers.length; i++) {
                this.triggers[i].addEventListener('click', function(event) {
                    event.preventDefault();
                    if(self.element.classList.contains(self.showClass)) {
                        self.closeModal();
                        return;
                    }
                    self.selectedTrigger = event.currentTarget;
                    self.showModal();
                    self.initModalEvents();
                });
            }
        }

        // listen to the openModal event -> open modal without a trigger button
        this.element.addEventListener('openModal', function(event){
            if(event.detail) self.selectedTrigger = event.detail;
            self.showModal();
            self.initModalEvents();
        });

        // listen to the closeModal event -> close modal without a trigger button
        this.element.addEventListener('closeModal', function(event){
            if(event.detail) self.selectedTrigger = event.detail;
            self.closeModal();
        });

        // if modal is open by default -> initialise modal events
        if(this.element.classList.contains(this.showClass)) this.initModalEvents();
    };

    Modal.prototype.showModal = function() {
        var self = this;
        this.element.classList.add(this.showClass);
        this.getFocusableElements();
        if(this.moveFocusEl) {
            this.moveFocusEl.focus();
            // wait for the end of transitions before moving focus
            this.element.addEventListener("transitionend", function cb(event) {
                self.moveFocusEl.focus();
                self.element.removeEventListener("transitionend", cb);
            });
        }
        this.emitModalEvents('modalIsOpen');
        // change the overflow of the preventScrollEl
        if(this.preventScrollEl) this.preventScrollEl.style.overflow = 'hidden';
    };

    Modal.prototype.closeModal = function() {
        if(!this.element.classList.contains(this.showClass)) return;
        this.element.classList.remove(this.showClass);
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.moveFocusEl = null;
        if(this.selectedTrigger) this.selectedTrigger.focus();
        //remove listeners
        this.cancelModalEvents();
        this.emitModalEvents('modalIsClose');
        // change the overflow of the preventScrollEl
        if(this.preventScrollEl) this.preventScrollEl.style.overflow = '';
    };

    Modal.prototype.initModalEvents = function() {
        //add event listeners
        this.element.addEventListener('keydown', this);
        this.element.addEventListener('click', this);
    };

    Modal.prototype.cancelModalEvents = function() {
        //remove event listeners
        this.element.removeEventListener('keydown', this);
        this.element.removeEventListener('click', this);
    };

    Modal.prototype.handleEvent = function (event) {
        switch(event.type) {
            case 'click': {
                this.initClick(event);
            }
            case 'keydown': {
                this.initKeyDown(event);
            }
        }
    };

    Modal.prototype.initKeyDown = function(event) {
        if( event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab' ) {
            //trap focus inside modal
            this.trapFocus(event);
        } else if( (event.keyCode && event.keyCode == 13 || event.key && event.key == 'Enter') && event.target.closest('.js-modal__close')) {
            event.preventDefault();
            this.closeModal(); // close modal when pressing Enter on close button
        }
    };

    Modal.prototype.initClick = function(event) {
        //close modal when clicking on close button or modal bg layer 
        if( !event.target.closest('.js-modal__close') && !event.target.classList.contains('js-modal') ) return;
        event.preventDefault();
        this.closeModal();
    };

    Modal.prototype.trapFocus = function(event) {
        if( this.firstFocusable === document.activeElement && event.shiftKey) {
            //on Shift+Tab -> focus last focusable element when focus moves out of modal
            event.preventDefault();
            this.lastFocusable.focus();
        }
        if( this.lastFocusable === document.activeElement && !event.shiftKey) {
            //on Tab -> focus first focusable element when focus moves out of modal
            event.preventDefault();
            this.firstFocusable.focus();
        }
    }

    Modal.prototype.getFocusableElements = function() {
        //get all focusable elements inside the modal
        var allFocusable = this.element.querySelectorAll(focusableElString);
        this.getFirstVisible(allFocusable);
        this.getLastVisible(allFocusable);
        this.getFirstFocusable();
    };

    Modal.prototype.getFirstVisible = function(elements) {
        //get first visible focusable element inside the modal
        for(var i = 0; i < elements.length; i++) {
            if( isVisible(elements[i]) ) {
                this.firstFocusable = elements[i];
                break;
            }
        }
    };

    Modal.prototype.getLastVisible = function(elements) {
        //get last visible focusable element inside the modal
        for(var i = elements.length - 1; i >= 0; i--) {
            if( isVisible(elements[i]) ) {
                this.lastFocusable = elements[i];
                break;
            }
        }
    };

    Modal.prototype.getFirstFocusable = function() {
        if(!this.modalFocus || !Element.prototype.matches) {
            this.moveFocusEl = this.firstFocusable;
            return;
        }
        var containerIsFocusable = this.modalFocus.matches(focusableElString);
        if(containerIsFocusable) {
            this.moveFocusEl = this.modalFocus;
        } else {
            this.moveFocusEl = false;
            var elements = this.modalFocus.querySelectorAll(focusableElString);
            for(var i = 0; i < elements.length; i++) {
                if( isVisible(elements[i]) ) {
                    this.moveFocusEl = elements[i];
                    break;
                }
            }
            if(!this.moveFocusEl) this.moveFocusEl = this.firstFocusable;
        }
    };

    Modal.prototype.emitModalEvents = function(eventName) {
        var event = new CustomEvent(eventName, {detail: this.selectedTrigger});
        this.element.dispatchEvent(event);
    };

    function isVisible(element) {
        return element.offsetWidth || element.offsetHeight || element.getClientRects().length;
    };

    window.Modal = Modal;

    //initialize the Modal objects
    var modals = document.getElementsByClassName('js-modal');
    // generic focusable elements string selector
    var focusableElString = '[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary';
    if( modals.length > 0 ) {
        var modalArrays = [];
        for( var i = 0; i < modals.length; i++) {
            (function(i){modalArrays.push(new Modal(modals[i]));})(i);
        }

        window.addEventListener('keydown', function(event){ //close modal window on esc
            if(event.keyCode && event.keyCode == 27 || event.key && event.key.toLowerCase() == 'escape') {
                for( var i = 0; i < modalArrays.length; i++) {
                    (function(i){modalArrays[i].closeModal();})(i);
                };
            }
        });
    }
}());